import { describe, expect, it } from 'vitest';
import fixtures from '../../fixtures/kr-progress.json';
import { KR_HEALTH_THRESHOLDS, KrConfigError, krHealth, krProgress, objectiveProgress } from './kr';

describe('KR Domain: Progress, Health, and Objective Aggregation', () => {
  describe('krProgress shared fixtures', () => {
    for (const testCase of fixtures.progressCases) {
      it(`evaluates fixture: ${testCase.id} (${testCase.description})`, () => {
        const result = krProgress({
          baseline: testCase.baseline,
          current: testCase.current,
          target: testCase.target,
          direction: testCase.direction as 'increase' | 'decrease' | null,
          metricType: testCase.metricType as 'numeric' | 'binary',
        });

        expect(result.raw).toBeCloseTo(testCase.expectedRaw, 2);
        expect(result.displayed).toBeCloseTo(testCase.expectedDisplayed, 2);
      });
    }
  });

  describe('krProgress config validation', () => {
    it('throws KrConfigError when target equals baseline for numeric metric', () => {
      expect(() =>
        krProgress({
          baseline: 50,
          current: 50,
          target: 50,
          direction: 'increase',
          metricType: 'numeric',
        }),
      ).toThrowError(KrConfigError);
    });

    it('throws KrConfigError when direction is omitted or invalid for numeric metric', () => {
      expect(() =>
        krProgress({
          baseline: 0,
          current: 10,
          target: 100,
          direction: null,
          metricType: 'numeric',
        }),
      ).toThrowError(KrConfigError);
    });

    it('throws KrConfigError when increase direction has target <= baseline', () => {
      expect(() =>
        krProgress({
          baseline: 100,
          current: 50,
          target: 50,
          direction: 'increase',
          metricType: 'numeric',
        }),
      ).toThrowError(KrConfigError);
    });

    it('throws KrConfigError when decrease direction has target >= baseline', () => {
      expect(() =>
        krProgress({
          baseline: 50,
          current: 50,
          target: 100,
          direction: 'decrease',
          metricType: 'numeric',
        }),
      ).toThrowError(KrConfigError);
    });

    it('throws KrConfigError when binary KR has invalid baseline or target', () => {
      expect(() =>
        krProgress({
          baseline: 1,
          current: 1,
          target: 2,
          direction: null,
          metricType: 'binary',
        }),
      ).toThrowError(KrConfigError);
    });
  });

  describe('krHealth shared fixtures', () => {
    for (const testCase of fixtures.healthCases) {
      it(`evaluates health fixture: ${testCase.id} (${testCase.description})`, () => {
        const health = krHealth({
          progress: testCase.progress,
          startDate: testCase.startDate,
          dueDate: testCase.dueDate,
          today: testCase.today,
        });

        expect(health).toBe(testCase.expectedHealth);
      });
    }
  });

  describe('KR health thresholds', () => {
    it('exports named threshold constants per specification', () => {
      expect(KR_HEALTH_THRESHOLDS.ON_TRACK_MAX_GAP).toBe(10);
      expect(KR_HEALTH_THRESHOLDS.AT_RISK_MAX_GAP).toBe(25);
    });
  });

  describe('objectiveProgress', () => {
    it('returns null when there are no key results', () => {
      expect(objectiveProgress([])).toBeNull();
      expect(objectiveProgress([null, undefined])).toBeNull();
    });

    it('calculates equal-weighted arithmetic mean of displayed progress', () => {
      const krs = [{ displayedProgress: 100 }, { displayedProgress: 50 }, { displayedProgress: 0 }];
      expect(objectiveProgress(krs)).toBe(50);
    });

    it('clamps each KR contribution between 0 and 100 before averaging', () => {
      const krs = [
        { displayedProgress: 150 }, // Overshoot
        { displayedProgress: -20 }, // Regressed
        { displayedProgress: 50 },
      ];
      // 100 + 0 + 50 = 150 / 3 = 50
      expect(objectiveProgress(krs)).toBe(50);
    });

    it('accepts array of raw numbers', () => {
      expect(objectiveProgress([20, 40, 60])).toBe(40);
    });
  });
});
