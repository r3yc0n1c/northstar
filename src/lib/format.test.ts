import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatDuration,
  resolveBrowserDefaults,
} from './format';

describe('format module (FR-SET-5)', () => {
  const fixedDate = new Date('2026-11-04T14:30:00Z');

  describe('formatDate', () => {
    it('formats a date according to given locale and timezone', () => {
      const formattedUtc = formatDate(fixedDate, undefined, {
        locale: 'en-US',
        timezone: 'UTC',
      });
      expect(formattedUtc).toBe('Nov 4, 2026');
    });

    it('handles different timezones properly across day boundaries', () => {
      const lateDate = new Date('2026-11-04T23:30:00Z');
      const formattedTokyo = formatDate(lateDate, undefined, {
        locale: 'en-US',
        timezone: 'Asia/Tokyo',
      });
      // In Tokyo (UTC+9), 23:30 on Nov 4 is 08:30 on Nov 5
      expect(formattedTokyo).toBe('Nov 5, 2026');
    });

    it('returns empty string on invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatTime', () => {
    it('formats a time with hours and minutes in locale and timezone', () => {
      const formatted = formatTime(fixedDate, undefined, {
        locale: 'en-US',
        timezone: 'UTC',
      });
      expect(formatted).toMatch(/2:30\s*PM/);
    });

    it('respects 24-hour locales like de-DE', () => {
      const formatted = formatTime(fixedDate, undefined, {
        locale: 'de-DE',
        timezone: 'UTC',
      });
      expect(formatted).toMatch(/14:30/);
    });
  });

  describe('formatDateTime', () => {
    it('formats both date and time together', () => {
      const formatted = formatDateTime(fixedDate, {
        locale: 'en-US',
        timezone: 'UTC',
      });
      expect(formatted).toMatch(/Nov 4, 2026/);
      expect(formatted).toMatch(/2:30\s*PM/);
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with locale separators', () => {
      const formattedUS = formatNumber(1234567.89, undefined, { locale: 'en-US' });
      expect(formattedUS).toBe('1,234,567.89');

      const formattedDE = formatNumber(1234567.89, undefined, { locale: 'de-DE' });
      expect(formattedDE).toBe('1.234.567,89');
    });

    it('returns 0 for invalid numbers', () => {
      expect(formatNumber(Number.NaN)).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency according to currency code and locale', () => {
      const formattedUsd = formatCurrency(1250.5, 'USD', { locale: 'en-US' });
      expect(formattedUsd).toBe('$1,250.50');

      const formattedEur = formatCurrency(1250.5, 'EUR', { locale: 'de-DE' });
      expect(formattedEur).toMatch(/1\.250,50\s*€/);

      const formattedGbp = formatCurrency(1250.5, 'GBP', { locale: 'en-GB' });
      expect(formattedGbp).toBe('£1,250.50');
    });
  });

  describe('formatDuration', () => {
    it('formats minutes under 60 as Xm', () => {
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(1)).toBe('1m');
    });

    it('formats whole hours as Xh', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });

    it('formats mixed hours and minutes as Xh Ym', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(135)).toBe('2h 15m');
    });

    it('returns 0m for zero or negative values', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(-10)).toBe('0m');
    });
  });

  describe('resolveBrowserDefaults', () => {
    it('resolves valid timezone, locale, currency, and week starts on', () => {
      const defaults = resolveBrowserDefaults();
      expect(defaults.timezone).toBeTruthy();
      expect(defaults.locale).toBeTruthy();
      expect(defaults.currency).toBeTruthy();
      expect([0, 1]).toContain(defaults.weekStartsOn);
    });
  });
});
