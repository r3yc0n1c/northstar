import { describe, expect, it } from 'vitest';
import {
  STARTER_LIFE_AREAS,
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
} from './schema';

describe('Onboarding Schemas & Constants', () => {
  describe('STARTER_LIFE_AREAS', () => {
    it('contains all 6 specified starter life areas from PRD §5.3', () => {
      const areaIds = STARTER_LIFE_AREAS.map((a) => a.id);
      expect(areaIds).toContain('career');
      expect(areaIds).toContain('health');
      expect(areaIds).toContain('learning');
      expect(areaIds).toContain('finance');
      expect(areaIds).toContain('relationships');
      expect(areaIds).toContain('personal');
      expect(STARTER_LIFE_AREAS.length).toBe(6);
    });

    it('defines name, description, color, and icon for each starter area', () => {
      for (const area of STARTER_LIFE_AREAS) {
        expect(area.name).toBeTruthy();
        expect(area.description).toBeTruthy();
        expect(area.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(area.icon).toBeTruthy();
      }
    });
  });

  describe('onboardingStep1Schema', () => {
    const validStep1 = {
      timezone: 'America/New_York',
      locale: 'en-US',
      working_days: [1, 2, 3, 4, 5],
      working_hours: {
        mon: { start: '09:00', end: '17:00' },
        tue: { start: '09:00', end: '17:00' },
      },
    };

    it('validates a valid step 1 schedule object', () => {
      const res = onboardingStep1Schema.safeParse(validStep1);
      expect(res.success).toBe(true);
    });

    it('rejects missing timezone', () => {
      const res = onboardingStep1Schema.safeParse({ ...validStep1, timezone: '' });
      expect(res.success).toBe(false);
    });

    it('rejects invalid working hours range (end <= start)', () => {
      const res = onboardingStep1Schema.safeParse({
        ...validStep1,
        working_hours: {
          mon: { start: '17:00', end: '09:00' },
        },
      });
      expect(res.success).toBe(false);
    });
  });

  describe('onboardingStep2Schema', () => {
    it('validates an array of selected area IDs', () => {
      const res = onboardingStep2Schema.safeParse({
        selected_areas: ['career', 'health'],
      });
      expect(res.success).toBe(true);
    });

    it('allows empty selection (all areas are optional in PRD §5.3)', () => {
      const res = onboardingStep2Schema.safeParse({
        selected_areas: [],
      });
      expect(res.success).toBe(true);
    });
  });

  describe('onboardingStep3Schema', () => {
    it('validates empty/omitted optional goal fields', () => {
      const res = onboardingStep3Schema.safeParse({});
      expect(res.success).toBe(true);
    });

    it('validates a filled goal object', () => {
      const res = onboardingStep3Schema.safeParse({
        goal_title: 'Run a marathon',
        goal_area_id: 'health',
        goal_target_date: '2026-12-31',
      });
      expect(res.success).toBe(true);
    });

    it('rejects goal title longer than 120 characters', () => {
      const res = onboardingStep3Schema.safeParse({
        goal_title: 'a'.repeat(121),
      });
      expect(res.success).toBe(false);
    });
  });
});
