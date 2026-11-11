/**
 * Domain module for Key Results progress, health, and aggregate objective progress calculations.
 * Pure business logic with zero React, DOM, or Supabase dependencies.
 *
 * Implements PRD §5.5 formulas:
 * - Increase: raw = (current - baseline) / (target - baseline) * 100
 * - Decrease: raw = (baseline - current) / (baseline - target) * 100
 * - Binary: 0 or 100
 * - Displayed: clamp(raw, 0, 100)
 * - Health: derived from progress vs elapsed timeline gap
 */

export type MetricType = 'numeric' | 'binary';
export type KrDirection = 'increase' | 'decrease';

export type KrHealthStatus = 'not_started' | 'achieved' | 'on_track' | 'at_risk' | 'off_track';

export const KR_HEALTH_THRESHOLDS = {
  ON_TRACK_MAX_GAP: 10,
  AT_RISK_MAX_GAP: 25,
} as const;

export class KrConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KrConfigError';
  }
}

export interface KrProgressInput {
  baseline: number;
  current: number;
  target: number;
  direction?: KrDirection | null;
  metricType: MetricType;
}

export interface KrProgressResult {
  raw: number;
  displayed: number;
}

/**
 * Calculates raw and clamped (0-100) progress percent for numeric and binary key results.
 * Throws KrConfigError on invalid configurations (e.g. baseline == target, mismatched direction).
 */
export function krProgress(input: KrProgressInput): KrProgressResult {
  const { baseline, current, target, direction, metricType } = input;

  if (metricType === 'binary') {
    if (baseline !== 0 || target !== 1) {
      throw new KrConfigError(
        `Binary key results require baseline of 0 and target of 1 (received baseline ${baseline}, target ${target})`,
      );
    }
    const raw = current >= 1 ? 100 : 0;
    return {
      raw,
      displayed: raw,
    };
  }

  if (metricType === 'numeric') {
    if (target === baseline) {
      throw new KrConfigError('Target value cannot equal baseline value for numeric key result');
    }

    if (!direction || (direction !== 'increase' && direction !== 'decrease')) {
      throw new KrConfigError(
        'Direction (increase or decrease) is required for numeric key results',
      );
    }

    if (direction === 'increase' && target <= baseline) {
      throw new KrConfigError(
        `Increase key results require target > baseline (target ${target} <= baseline ${baseline})`,
      );
    }

    if (direction === 'decrease' && target >= baseline) {
      throw new KrConfigError(
        `Decrease key results require target < baseline (target ${target} >= baseline ${baseline})`,
      );
    }

    let raw: number;
    if (direction === 'increase') {
      raw = ((current - baseline) / (target - baseline)) * 100;
    } else {
      raw = ((baseline - current) / (baseline - target)) * 100;
    }

    // Clamp displayed progress between 0 and 100 while preserving exact raw value
    const displayed = Math.min(100, Math.max(0, raw));

    return {
      raw: Math.round(raw * 100) / 100,
      displayed: Math.round(displayed * 100) / 100,
    };
  }

  throw new KrConfigError(`Unsupported metric type: ${metricType}`);
}

export interface KrHealthInput {
  progress: number; // Displayed progress percent (0 - 100)
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  today: string; // YYYY-MM-DD
}

/**
 * Calculates derived health status based on timeline elapsed percent and progress gap.
 * Formula from PRD §5.5:
 *   elapsed%  = clamp((today - start) / (due - start), 0, 1) * 100
 *   gap       = elapsed% - progress
 *   not_started if today < start
 *   achieved    if progress >= 100
 *   on_track    if gap <= 10
 *   at_risk     if 10 < gap <= 25
 *   off_track   if gap > 25
 */
export function krHealth(input: KrHealthInput): KrHealthStatus {
  const { progress, startDate, dueDate, today } = input;

  // Immediate rule: progress >= 100 is achieved
  if (progress >= 100) {
    return 'achieved';
  }

  // Immediate rule: today before start date is not_started
  if (today < startDate) {
    return 'not_started';
  }

  const [sY, sM, sD] = startDate.split('-').map(Number);
  const [dY, dM, dD] = dueDate.split('-').map(Number);
  const [tY, tM, tD] = today.split('-').map(Number);

  const startUtc = Date.UTC(sY || 0, (sM || 1) - 1, sD || 1);
  const dueUtc = Date.UTC(dY || 0, (dM || 1) - 1, dD || 1);
  const todayUtc = Date.UTC(tY || 0, (tM || 1) - 1, tD || 1);

  const totalDuration = dueUtc - startUtc;

  let elapsedPercent: number;
  if (totalDuration <= 0) {
    // start_date == due_date boundary condition
    elapsedPercent = todayUtc >= startUtc ? 100 : 0;
  } else {
    const elapsedDuration = todayUtc - startUtc;
    const fraction = Math.min(1, Math.max(0, elapsedDuration / totalDuration));
    elapsedPercent = fraction * 100;
  }

  const gap = elapsedPercent - progress;

  if (gap <= KR_HEALTH_THRESHOLDS.ON_TRACK_MAX_GAP) {
    return 'on_track';
  }

  if (gap <= KR_HEALTH_THRESHOLDS.AT_RISK_MAX_GAP) {
    return 'at_risk';
  }

  return 'off_track';
}

export interface KeyResultProgressItem {
  displayedProgress?: number;
  progress?: number;
  rawProgress?: number;
}

/**
 * Calculates aggregate objective progress as the arithmetic mean of its KRs' displayed progress.
 * Returns null when there are no key results (PRD §5.5: "shows 'No key results yet', never 0%").
 */
export function objectiveProgress(
  krs: Array<KeyResultProgressItem | number | null | undefined>,
): number | null {
  if (!krs || krs.length === 0) {
    return null;
  }

  let total = 0;
  let count = 0;

  for (const item of krs) {
    if (item === null || item === undefined) continue;

    if (typeof item === 'number') {
      total += Math.min(100, Math.max(0, item));
      count += 1;
    } else {
      const val =
        typeof item.displayedProgress === 'number'
          ? item.displayedProgress
          : typeof item.progress === 'number'
            ? item.progress
            : 0;
      total += Math.min(100, Math.max(0, val));
      count += 1;
    }
  }

  if (count === 0) {
    return null;
  }

  return Math.round((total / count) * 10) / 10;
}
