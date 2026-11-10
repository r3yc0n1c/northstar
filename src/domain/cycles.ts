export type CycleType = 'monthly' | 'quarterly' | 'annual' | 'custom';
export type CycleStatus = 'planned' | 'active' | 'closed';

export interface CycleLike {
  id?: string;
  name: string;
  cycle_type: CycleType;
  start_date: string;
  end_date: string;
  status: CycleStatus;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates cycle start and end dates as plain YYYY-MM-DD calendar strings.
 * Enforces end_date >= start_date.
 */
export function validateCycleDates(
  startDate: string,
  endDate: string,
): { valid: boolean; error?: string } {
  if (!ISO_DATE_REGEX.test(startDate)) {
    return { valid: false, error: 'Start date must be in YYYY-MM-DD format' };
  }
  if (!ISO_DATE_REGEX.test(endDate)) {
    return { valid: false, error: 'End date must be in YYYY-MM-DD format' };
  }
  if (endDate < startDate) {
    return { valid: false, error: 'End date must be on or after start date' };
  }
  return { valid: true };
}

/**
 * Checks whether a plain YYYY-MM-DD date falls within a cycle's bounds (inclusive).
 */
export function isDateInCycle(date: string, startDate: string, endDate: string): boolean {
  if (!ISO_DATE_REGEX.test(date)) return false;
  return date >= startDate && date <= endDate;
}

/**
 * Calculates number of calendar days between two plain YYYY-MM-DD dates (inclusive).
 * Parses YYYY, MM, DD integer parts directly to avoid UTC/local timezone shifts.
 */
export function getCycleDurationDays(startDate: string, endDate: string): number {
  const v = validateCycleDates(startDate, endDate);
  if (!v.valid) return 0;

  const [sY, sM, sD] = startDate.split('-').map(Number);
  const [eY, eM, eD] = endDate.split('-').map(Number);

  if (sY === undefined || sM === undefined || sD === undefined) return 0;
  if (eY === undefined || eM === undefined || eD === undefined) return 0;

  // Use Date.UTC purely as a day difference counter
  const startUtc = Date.UTC(sY, sM - 1, sD);
  const endUtc = Date.UTC(eY, eM - 1, eD);

  const MS_PER_DAY = 86_400_000;
  return Math.round((endUtc - startUtc) / MS_PER_DAY) + 1;
}

/**
 * Formats a cycle display label: "Name · YYYY-MM-DD – YYYY-MM-DD"
 */
export function formatCycleLabel(cycle: {
  name: string;
  start_date: string;
  end_date: string;
}): string {
  return `${cycle.name} · ${cycle.start_date} – ${cycle.end_date}`;
}

/**
 * Selects the current active cycle for a given plain YYYY-MM-DD today date string.
 * Priority:
 * 1. Active cycle that contains today.
 * 2. If multiple match, prefer 'quarterly' > 'monthly' > 'annual' > 'custom'.
 * 3. Fall back to any active cycle.
 * 4. Fall back to nearest planned cycle.
 */
export function selectCurrentCycle<T extends CycleLike>(
  cycles: readonly T[],
  today: string,
): T | null {
  if (cycles.length === 0) return null;

  const typePriority: Record<CycleType, number> = {
    quarterly: 1,
    monthly: 2,
    annual: 3,
    custom: 4,
  };

  // 1. Active cycles containing today
  const containingActive = cycles.filter(
    (c) => c.status === 'active' && isDateInCycle(today, c.start_date, c.end_date),
  );

  if (containingActive.length > 0) {
    return (
      [...containingActive].sort(
        (a, b) => typePriority[a.cycle_type] - typePriority[b.cycle_type],
      )[0] ?? null
    );
  }

  // 2. Any active cycle
  const anyActive = cycles.filter((c) => c.status === 'active');
  if (anyActive.length > 0) {
    return anyActive[0] ?? null;
  }

  // 3. Nearest planned cycle (by start_date >= today)
  const upcoming = cycles
    .filter((c) => c.status === 'planned' && c.start_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  if (upcoming.length > 0) {
    return upcoming[0] ?? null;
  }

  // 4. First cycle
  return cycles[0] ?? null;
}

/**
 * Helper to generate standard quarterly cycle boundaries for a given year.
 */
export function generateQuarterlyCycles(year: number): Array<{
  name: string;
  cycle_type: 'quarterly';
  start_date: string;
  end_date: string;
  status: CycleStatus;
}> {
  return [
    {
      name: `Q1 ${year}`,
      cycle_type: 'quarterly',
      start_date: `${year}-01-01`,
      end_date: `${year}-03-31`,
      status: 'planned',
    },
    {
      name: `Q2 ${year}`,
      cycle_type: 'quarterly',
      start_date: `${year}-04-01`,
      end_date: `${year}-06-30`,
      status: 'planned',
    },
    {
      name: `Q3 ${year}`,
      cycle_type: 'quarterly',
      start_date: `${year}-07-01`,
      end_date: `${year}-09-30`,
      status: 'planned',
    },
    {
      name: `Q4 ${year}`,
      cycle_type: 'quarterly',
      start_date: `${year}-10-01`,
      end_date: `${year}-12-31`,
      status: 'planned',
    },
  ];
}
