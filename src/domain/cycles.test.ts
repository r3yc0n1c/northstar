import { describe, expect, it } from 'vitest';
import {
  type CycleLike,
  formatCycleLabel,
  generateQuarterlyCycles,
  getCycleDurationDays,
  isDateInCycle,
  selectCurrentCycle,
  validateCycleDates,
} from './cycles';

describe('Domain: Cycles', () => {
  describe('validateCycleDates', () => {
    it('accepts valid start and end dates', () => {
      const res = validateCycleDates('2026-10-01', '2026-12-31');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('accepts start == end date for 1-day cycle', () => {
      const res = validateCycleDates('2026-11-01', '2026-11-01');
      expect(res.valid).toBe(true);
    });

    it('rejects end date before start date', () => {
      const res = validateCycleDates('2026-12-31', '2026-10-01');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/on or after start date/i);
    });

    it('rejects non-ISO date formats', () => {
      expect(validateCycleDates('10/01/2026', '2026-12-31').valid).toBe(false);
      expect(validateCycleDates('2026-10-01', '31-12-2026').valid).toBe(false);
      expect(validateCycleDates('invalid', '2026-12-31').valid).toBe(false);
    });
  });

  describe('isDateInCycle', () => {
    it('returns true when date is inside bounds', () => {
      expect(isDateInCycle('2026-11-15', '2026-10-01', '2026-12-31')).toBe(true);
    });

    it('returns true at inclusive boundaries', () => {
      expect(isDateInCycle('2026-10-01', '2026-10-01', '2026-12-31')).toBe(true);
      expect(isDateInCycle('2026-12-31', '2026-10-01', '2026-12-31')).toBe(true);
    });

    it('returns false when outside bounds', () => {
      expect(isDateInCycle('2026-09-30', '2026-10-01', '2026-12-31')).toBe(false);
      expect(isDateInCycle('2027-01-01', '2026-10-01', '2026-12-31')).toBe(false);
    });
  });

  describe('getCycleDurationDays', () => {
    it('calculates duration inclusive of both bounds', () => {
      // 1 day
      expect(getCycleDurationDays('2026-11-01', '2026-11-01')).toBe(1);
      // October: 31 days
      expect(getCycleDurationDays('2026-10-01', '2026-10-31')).toBe(31);
      // Q4 (Oct 31 + Nov 30 + Dec 31 = 92 days)
      expect(getCycleDurationDays('2026-10-01', '2026-12-31')).toBe(92);
    });

    it('returns 0 for invalid date ranges', () => {
      expect(getCycleDurationDays('2026-12-31', '2026-10-01')).toBe(0);
    });
  });

  describe('formatCycleLabel', () => {
    it('formats label with name and date range', () => {
      const cycle = {
        name: 'Q4 2026',
        start_date: '2026-10-01',
        end_date: '2026-12-31',
      };
      expect(formatCycleLabel(cycle)).toBe('Q4 2026 · 2026-10-01 – 2026-12-31');
    });
  });

  describe('selectCurrentCycle', () => {
    const cycles: CycleLike[] = [
      {
        id: '1',
        name: 'Annual 2026',
        cycle_type: 'annual',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        status: 'active',
      },
      {
        id: '2',
        name: 'Q4 2026',
        cycle_type: 'quarterly',
        start_date: '2026-10-01',
        end_date: '2026-12-31',
        status: 'active',
      },
      {
        id: '3',
        name: 'November 2026',
        cycle_type: 'monthly',
        start_date: '2026-11-01',
        end_date: '2026-11-30',
        status: 'active',
      },
      {
        id: '4',
        name: 'Q1 2027',
        cycle_type: 'quarterly',
        start_date: '2027-01-01',
        end_date: '2027-03-31',
        status: 'planned',
      },
    ];

    it('prefers quarterly over annual when both contain today', () => {
      const selected = selectCurrentCycle(cycles, '2026-10-15');
      expect(selected?.name).toBe('Q4 2026');
    });

    it('prefers quarterly over monthly per type priority', () => {
      const selected = selectCurrentCycle(cycles, '2026-11-15');
      expect(selected?.name).toBe('Q4 2026');
    });

    it('falls back to planned cycle when today is after active cycles', () => {
      const futureCycles: CycleLike[] = [
        {
          id: '4',
          name: 'Q1 2027',
          cycle_type: 'quarterly',
          start_date: '2027-01-01',
          end_date: '2027-03-31',
          status: 'planned',
        },
      ];
      const selected = selectCurrentCycle(futureCycles, '2026-12-31');
      expect(selected?.name).toBe('Q1 2027');
    });

    it('returns null for empty cycles list', () => {
      expect(selectCurrentCycle([], '2026-11-10')).toBeNull();
    });
  });

  describe('generateQuarterlyCycles', () => {
    it('generates 4 quarters with accurate boundaries', () => {
      const quarters = generateQuarterlyCycles(2026);
      expect(quarters).toHaveLength(4);
      expect(quarters[0]?.name).toBe('Q1 2026');
      expect(quarters[0]?.start_date).toBe('2026-01-01');
      expect(quarters[0]?.end_date).toBe('2026-03-31');

      expect(quarters[3]?.name).toBe('Q4 2026');
      expect(quarters[3]?.start_date).toBe('2026-10-01');
      expect(quarters[3]?.end_date).toBe('2026-12-31');
    });
  });
});
