import { describe, expect, it } from 'vitest';
import { dayWorkingHoursSchema, isValidTimezone, profileSettingsSchema } from './schema';

describe('Settings Schemas (FR-SET-1..3)', () => {
  describe('dayWorkingHoursSchema', () => {
    it('accepts valid time range where end > start', () => {
      const res = dayWorkingHoursSchema.safeParse({ start: '09:00', end: '17:00' });
      expect(res.success).toBe(true);
    });

    it('rejects range when end is equal to start', () => {
      const res = dayWorkingHoursSchema.safeParse({ start: '10:00', end: '10:00' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/after start time/i);
      }
    });

    it('rejects range when end is before start', () => {
      const res = dayWorkingHoursSchema.safeParse({ start: '18:00', end: '09:00' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toMatch(/after start time/i);
      }
    });

    it('rejects malformed time strings', () => {
      expect(dayWorkingHoursSchema.safeParse({ start: '9:00', end: '17:00' }).success).toBe(false);
      expect(dayWorkingHoursSchema.safeParse({ start: '25:00', end: '26:00' }).success).toBe(false);
      expect(dayWorkingHoursSchema.safeParse({ start: '09:60', end: '10:00' }).success).toBe(false);
    });
  });

  describe('isValidTimezone', () => {
    it('returns true for recognized IANA timezones', () => {
      expect(isValidTimezone('UTC')).toBe(true);
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
      expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    });

    it('returns false for nonexistent or invalid timezones', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('')).toBe(false);
      expect(isValidTimezone('Moon/Base')).toBe(false);
    });
  });

  describe('profileSettingsSchema', () => {
    const validProfile = {
      display_name: 'Pilot User',
      timezone: 'America/New_York',
      locale: 'en-US',
      currency_code: 'USD',
      week_starts_on: 1,
      working_days: [1, 2, 3, 4, 5],
      working_hours: {
        mon: { start: '09:00', end: '17:00' },
        tue: { start: '09:00', end: '17:00' },
        wed: { start: '09:00', end: '17:00' },
        thu: { start: '09:00', end: '17:00' },
        fri: { start: '09:00', end: '17:00' },
      },
    };

    it('validates a complete, valid profile object', () => {
      const res = profileSettingsSchema.safeParse(validProfile);
      expect(res.success).toBe(true);
    });

    it('rejects empty display name', () => {
      const res = profileSettingsSchema.safeParse({
        ...validProfile,
        display_name: '   ',
      });
      expect(res.success).toBe(false);
    });

    it('rejects invalid currency code length', () => {
      const res = profileSettingsSchema.safeParse({
        ...validProfile,
        currency_code: 'USDD',
      });
      expect(res.success).toBe(false);
    });

    it('rejects invalid week_starts_on value', () => {
      const res = profileSettingsSchema.safeParse({
        ...validProfile,
        week_starts_on: 2,
      });
      expect(res.success).toBe(false);
    });

    it('rejects invalid working hours range inside profile', () => {
      const res = profileSettingsSchema.safeParse({
        ...validProfile,
        working_hours: {
          mon: { start: '18:00', end: '09:00' },
        },
      });
      expect(res.success).toBe(false);
    });
  });
});
