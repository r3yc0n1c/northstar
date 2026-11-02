/**
 * Pure domain logic for progress calculations.
 * Framework-free, zero I/O, 100% test coverage.
 */

export function calculateProgress(current: number, target: number, baseline = 0): number {
  if (target === baseline) {
    return current >= target ? 100 : 0;
  }
  const raw = ((current - baseline) / (target - baseline)) * 100;
  return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
}
