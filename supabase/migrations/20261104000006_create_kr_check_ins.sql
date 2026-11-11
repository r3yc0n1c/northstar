-- Migration: create kr_check_ins append-only table and record_kr_check_in atomic function
-- Enforces:
-- 1. Append-only RLS: SELECT and INSERT only. No UPDATE or DELETE policies.
-- 2. Revoked UPDATE and DELETE privileges from authenticated and anon.
-- 3. Composite foreign key to key_results(workspace_id, id).
-- 4. Atomic record_kr_check_in function updating key_results.current_value to latest non-superseded check-in.

-- 1. Create kr_check_ins table
create table public.kr_check_ins (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  key_result_id uuid not null,
  value numeric not null,
  raw_progress_percent numeric not null,
  progress_percent numeric not null,
  confidence smallint check (confidence is null or (confidence >= 1 and confidence <= 10)),
  notes text default '',
  evidence_url text check (evidence_url is null or char_length(evidence_url) <= 2048),
  supersedes_id uuid references public.kr_check_ins(id) on delete set null,
  recorded_by uuid not null references auth.users(id),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  -- Unique constraint for composite integrity
  constraint uq_kr_check_ins_workspace_id unique (workspace_id, id),

  -- Composite foreign key to key_results table
  constraint fk_kr_check_ins_key_result_workspace
    foreign key (workspace_id, key_result_id)
    references public.key_results(workspace_id, id)
    on delete cascade
);

-- 2. Indexes
create index idx_kr_check_ins_key_result_recorded on public.kr_check_ins (key_result_id, recorded_at desc);
create index idx_kr_check_ins_supersedes on public.kr_check_ins (supersedes_id);
create index idx_kr_check_ins_workspace_recorded on public.kr_check_ins (workspace_id, recorded_at desc);

-- 3. Enable Row Level Security
alter table public.kr_check_ins enable row level security;

-- 4. Explicit RLS Policies: SELECT and INSERT only (strictly NO UPDATE or DELETE policies)
create policy "kr_check_ins_select_workspace_owner"
  on public.kr_check_ins
  for select
  to authenticated
  using (public.is_workspace_owner(workspace_id));

create policy "kr_check_ins_insert_workspace_owner"
  on public.kr_check_ins
  for insert
  to authenticated
  with check (
    public.is_workspace_owner(workspace_id)
    and recorded_by = (select auth.uid())
  );

-- Revoke UPDATE and DELETE privileges from authenticated and anon
revoke update, delete on public.kr_check_ins from authenticated, anon;

-- 5. record_kr_check_in atomic function (SECURITY INVOKER so RLS applies)
create or replace function public.record_kr_check_in(
  p_key_result_id uuid,
  p_value numeric,
  p_confidence smallint default null,
  p_notes text default '',
  p_evidence_url text default null,
  p_recorded_at timestamptz default null,
  p_supersedes_id uuid default null
)
returns public.kr_check_ins
language plpgsql
security invoker
as $$
declare
  v_kr public.key_results%rowtype;
  v_raw_progress numeric;
  v_clamped_progress numeric;
  v_check_in public.kr_check_ins%rowtype;
  v_latest_value numeric;
  v_recorded_at timestamptz;
begin
  -- 1. Fetch key result row (invoker RLS applies)
  select *
  into v_kr
  from public.key_results
  where id = p_key_result_id;

  if not found then
    raise exception 'Key result not found or access denied: %', p_key_result_id;
  end if;

  -- 2. Validate confidence range
  if p_confidence is not null and (p_confidence < 1 or p_confidence > 10) then
    raise exception 'Confidence must be between 1 and 10';
  end if;

  -- 3. Calculate progress percent via kr_progress function
  v_raw_progress := public.kr_progress(
    v_kr.baseline_value,
    p_value,
    v_kr.target_value,
    v_kr.direction,
    v_kr.metric_type
  );
  v_clamped_progress := least(100, greatest(0, v_raw_progress));

  v_recorded_at := coalesce(p_recorded_at, now());

  -- 4. Insert append-only check-in
  insert into public.kr_check_ins (
    workspace_id,
    key_result_id,
    value,
    raw_progress_percent,
    progress_percent,
    confidence,
    notes,
    evidence_url,
    supersedes_id,
    recorded_by,
    recorded_at
  )
  values (
    v_kr.workspace_id,
    p_key_result_id,
    p_value,
    round(v_raw_progress, 2),
    round(v_clamped_progress, 2),
    p_confidence,
    coalesce(p_notes, ''),
    p_evidence_url,
    p_supersedes_id,
    (select auth.uid()),
    v_recorded_at
  )
  returning * into v_check_in;

  -- 5. Atomically update key_results.current_value to the value of the most recent non-superseded check-in
  select c.value
  into v_latest_value
  from public.kr_check_ins c
  where c.key_result_id = p_key_result_id
    and not exists (
      select 1
      from public.kr_check_ins s
      where s.supersedes_id = c.id
    )
  order by c.recorded_at desc, c.created_at desc
  limit 1;

  update public.key_results
  set current_value = coalesce(v_latest_value, p_value),
      confidence = coalesce(p_confidence, confidence),
      updated_at = now()
  where id = p_key_result_id;

  return v_check_in;
end;
$$;

grant execute on function public.record_kr_check_in(uuid, numeric, smallint, text, text, timestamptz, uuid) to authenticated;
