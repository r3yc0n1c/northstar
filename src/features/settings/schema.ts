import { z } from 'zod';

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export const DAY_NUMBER_MAP: Record<DayKey, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const NUMBER_TO_DAY_MAP: Record<number, DayKey> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

/**
 * Checks if a string is a valid IANA timezone supported by Intl.
 */
export function isValidTimezone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const TIME_REGEX = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Schema for a single day's working hours.
 * Enforces start < end (rejects invalid ranges inline).
 */
export const dayWorkingHoursSchema = z
  .object({
    start: z.string().regex(TIME_REGEX, 'Start time must be in HH:mm format (00:00 - 23:59)'),
    end: z.string().regex(TIME_REGEX, 'End time must be in HH:mm format (00:00 - 23:59)'),
  })
  .refine((data) => data.end > data.start, {
    message: 'End time must be after start time',
    path: ['end'],
  });

export type DayWorkingHours = z.infer<typeof dayWorkingHoursSchema>;

/**
 * Schema for the full working_hours map (mon-sun).
 */
export const workingHoursMapSchema = z
  .object({
    mon: dayWorkingHoursSchema.optional(),
    tue: dayWorkingHoursSchema.optional(),
    wed: dayWorkingHoursSchema.optional(),
    thu: dayWorkingHoursSchema.optional(),
    fri: dayWorkingHoursSchema.optional(),
    sat: dayWorkingHoursSchema.optional(),
    sun: dayWorkingHoursSchema.optional(),
  })
  .strict();

export type WorkingHoursMap = z.infer<typeof workingHoursMapSchema>;

/**
 * Profile settings form validation schema.
 */
export const profileSettingsSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(100, 'Display name cannot exceed 100 characters'),
  avatar_url: z.string().url('Invalid avatar URL').nullable().optional(),
  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .refine(isValidTimezone, 'Invalid IANA timezone identifier'),
  locale: z.string().min(1, 'Locale is required'),
  currency_code: z.string().length(3, 'Currency code must be 3 characters').toUpperCase(),
  week_starts_on: z.union([z.literal(0), z.literal(1)]),
  working_days: z.array(z.number().int().min(0).max(6)),
  working_hours: workingHoursMapSchema,
});

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

/**
 * Common curated list of IANA timezones grouped by continent/region.
 */
export const COMMON_TIMEZONES = [
  'UTC',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Chicago',
  'America/Denver',
  'America/Halifax',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Jerusalem',
  'Asia/Kolkata',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Dublin',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Honolulu',
] as const;

/**
 * Curated list of common locales.
 */
export const COMMON_LOCALES = [
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'en-CA', label: 'English (Canada)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'de-DE', label: 'German (Germany)' },
  { code: 'fr-FR', label: 'French (France)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'it-IT', label: 'Italian (Italy)' },
  { code: 'ja-JP', label: 'Japanese (Japan)' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'nl-NL', label: 'Dutch (Netherlands)' },
  { code: 'sv-SE', label: 'Swedish (Sweden)' },
] as const;

/**
 * Curated list of common currencies.
 */
export const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (AUD)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan (CNY)' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real (BRL)' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona (SEK)' },
] as const;
