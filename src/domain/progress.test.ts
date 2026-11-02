import { describe, expect, it } from 'vitest';
import { calculateProgress } from './progress';

describe('calculateProgress', () => {
  it('calculates progress percentage correctly', () => {
    expect(calculateProgress(50, 100, 0)).toBe(50);
  });

  it('clamps progress to 0 when current is below baseline', () => {
    expect(calculateProgress(-10, 100, 0)).toBe(0);
  });

  it('clamps progress to 100 when current exceeds target', () => {
    expect(calculateProgress(150, 100, 0)).toBe(100);
  });

  it('handles target equal to baseline', () => {
    expect(calculateProgress(10, 10, 10)).toBe(100);
    expect(calculateProgress(5, 10, 10)).toBe(0);
  });
});
