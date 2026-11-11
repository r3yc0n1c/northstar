import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { KeyResult, KrCheckIn } from '../schema';
import { formatDate } from '@/lib/format';

export interface ProgressChartProps {
  keyResult: KeyResult;
  checkIns: KrCheckIn[];
}

interface ChartPoint {
  date: string;
  displayDate: string;
  value: number;
  progressPercent: number;
  notes?: string | null;
  confidence?: number | null;
  isBaseline?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  unit?: string | null;
}

function ChartCustomTooltip({ active, payload, unit }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-[6px] bg-surface-2 border border-border p-2.5 shadow-xl flex flex-col gap-1 font-mono-num text-xs z-50">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-highlight">{point.displayDate}:</span>
        <span className="text-text font-bold">
          {point.value} {unit || ''}
        </span>
        {point.isBaseline && (
          <span className="text-[10px] px-1 py-0.2 rounded bg-surface border border-border text-text-3">
            Baseline
          </span>
        )}
      </div>
      <div className="text-[11px] text-text-2 flex items-center justify-between gap-3">
        <span>Progress: {point.progressPercent}%</span>
        {point.confidence !== null && point.confidence !== undefined && (
          <span>Conf: {point.confidence}/10</span>
        )}
      </div>
      {point.notes && (
        <p className="text-[11px] text-text-3 font-sans max-w-[220px] truncate border-t border-border/40 pt-1 mt-0.5">
          {point.notes}
        </p>
      )}
    </div>
  );
}

export function ProgressChart({ keyResult, checkIns }: ProgressChartProps) {
  const baseline = Number(keyResult.baseline_value);
  const target = Number(keyResult.target_value);

  // Identify all superseded check-in IDs to exclude them from the primary telemetry trajectory
  const supersededIds = new Set(
    checkIns
      .map((c) => c.supersedes_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  );

  const activeCheckIns = checkIns
    .filter((c) => !supersededIds.has(c.id))
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  // Generate chart data points
  const points: ChartPoint[] = [];

  // Start with baseline point at KR start date
  points.push({
    date: keyResult.start_date,
    displayDate: formatDate(keyResult.start_date, { month: 'short', day: 'numeric' }),
    value: baseline,
    progressPercent: 0,
    isBaseline: true,
    notes: 'Inception baseline',
  });

  // Append valid check-ins
  for (const c of activeCheckIns) {
    points.push({
      date: c.recorded_at,
      displayDate: formatDate(c.recorded_at, { month: 'short', day: 'numeric' }),
      value: Number(c.value),
      progressPercent: Number(c.progress_percent),
      notes: c.notes,
      confidence: c.confidence,
    });
  }

  // Calculate domain bounds so baseline, target, and all points fit comfortably
  const allValues = [baseline, target, ...points.map((p) => p.value)];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = Math.max((maxValue - minValue) * 0.15, 1);
  const yDomain: [number, number] = [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];

  return (
    <div data-testid="progress-chart" className="flex flex-col gap-3 w-full">
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={100}
          minHeight={200}
          initialDimension={{ width: 600, height: 224 }}
        >
          <AreaChart data={points} margin={{ top: 16, right: 28, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--highlight)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--highlight)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
            <XAxis
              dataKey="displayDate"
              stroke="var(--text-3)"
              tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              stroke="var(--text-3)"
              tick={{ fill: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={{ stroke: 'var(--border)' }}
              domain={yDomain}
            />
            <Tooltip content={<ChartCustomTooltip unit={keyResult.unit} />} />
            <ReferenceLine
              y={target}
              stroke="var(--highlight)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Target: ${target} ${keyResult.unit || ''}`,
                fill: 'var(--highlight)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                position: 'insideTopRight',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--highlight)"
              strokeWidth={2}
              fill="url(#telemetryGrad)"
              dot={{
                r: 3.5,
                fill: 'var(--surface)',
                stroke: 'var(--highlight)',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5.5,
                fill: 'var(--highlight)',
                stroke: 'var(--surface)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Telemetry footer metadata */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono-num text-text-3 border-t border-border/40 pt-2 px-1 gap-2">
        <span>
          {activeCheckIns.length}{' '}
          {activeCheckIns.length === 1 ? 'check-in logged' : 'check-ins logged'} ·{' '}
          {formatDate(keyResult.start_date, { month: 'short', day: 'numeric', year: 'numeric' })} –{' '}
          {formatDate(keyResult.due_date, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-text-2">
            <span className="w-2.5 h-0.5 bg-highlight inline-block rounded-full" />
            Actual
          </span>
          <span className="inline-flex items-center gap-1.5 text-highlight">
            <span className="w-2.5 h-0.5 border-b border-dashed border-highlight inline-block" />
            Target ({target} {keyResult.unit || ''})
          </span>
        </div>
      </div>
    </div>
  );
}
