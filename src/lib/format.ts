/**
 * Northstar Intl-based formatting module (FR-SET-5).
 * Formats dates, times, durations, numbers, and currencies according to user profile settings.
 */

export interface FormatContext {
  locale?: string;
  timezone?: string;
  currencyCode?: string;
}

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_TIMEZONE = 'UTC';
const DEFAULT_CURRENCY = 'USD';

/**
 * Region to default currency mapping.
 */
const REGION_CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  EU: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  IE: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  JP: 'JPY',
  IN: 'INR',
  CH: 'CHF',
  CN: 'CNY',
  BR: 'BRL',
  MX: 'MXN',
  SG: 'SGD',
  HK: 'HKD',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
};

/**
 * Regions where the calendar week commonly starts on Sunday (0).
 */
const SUNDAY_START_REGIONS = new Set(['US', 'CA', 'JP', 'MX', 'BR', 'IL', 'SA', 'PH', 'TW']);

/**
 * Inactive or fallback defaults inferred from browser environment.
 */
export function resolveBrowserDefaults(): {
  timezone: string;
  locale: string;
  currency: string;
  weekStartsOn: 0 | 1;
} {
  let timezone = DEFAULT_TIMEZONE;
  let locale = DEFAULT_LOCALE;

  try {
    const resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (resolvedTz) {
      timezone = resolvedTz;
    }
  } catch {
    // fallback to UTC
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    locale = navigator.language;
  }

  // Derive region from locale (e.g. en-US -> US, de -> DE)
  let region = '';
  try {
    if (typeof Intl.Locale !== 'undefined') {
      const intlLocale = new Intl.Locale(locale);
      region = (intlLocale.region || '').toUpperCase();
    } else {
      const parts = locale.split('-');
      const lastPart = parts[parts.length - 1];
      if (parts.length > 1 && lastPart) {
        region = lastPart.toUpperCase();
      }
    }
  } catch {
    // ignore
  }

  const currency = REGION_CURRENCY_MAP[region] || DEFAULT_CURRENCY;
  const weekStartsOn: 0 | 1 = SUNDAY_START_REGIONS.has(region) ? 0 : 1;

  return {
    timezone,
    locale,
    currency,
    weekStartsOn,
  };
}

/**
 * Formats a date into a localized string using Intl.DateTimeFormat.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  context?: FormatContext,
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const locale = context?.locale || DEFAULT_LOCALE;
  const timeZone = context?.timezone || DEFAULT_TIMEZONE;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone,
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      ...defaultOptions,
      timeZone: DEFAULT_TIMEZONE,
    }).format(d);
  }
}

/**
 * Formats a time into a localized string using Intl.DateTimeFormat.
 */
export function formatTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  context?: FormatContext,
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const locale = context?.locale || DEFAULT_LOCALE;
  const timeZone = context?.timezone || DEFAULT_TIMEZONE;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      ...defaultOptions,
      timeZone: DEFAULT_TIMEZONE,
    }).format(d);
  }
}

/**
 * Formats date and time together into a localized string.
 */
export function formatDateTime(date: Date | string | number, context?: FormatContext): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const locale = context?.locale || DEFAULT_LOCALE;
  const timeZone = context?.timezone || DEFAULT_TIMEZONE;

  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: DEFAULT_TIMEZONE,
    }).format(d);
  }
}

/**
 * Formats a number using Intl.NumberFormat.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  context?: FormatContext,
): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0';

  const locale = context?.locale || DEFAULT_LOCALE;
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return new Intl.NumberFormat(DEFAULT_LOCALE, options).format(value);
  }
}

/**
 * Formats a currency amount using Intl.NumberFormat.
 */
export function formatCurrency(
  amount: number,
  currencyCode?: string,
  context?: FormatContext,
): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '$0.00';

  const locale = context?.locale || DEFAULT_LOCALE;
  const currency = currencyCode || context?.currencyCode || DEFAULT_CURRENCY;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
    }).format(amount);
  }
}

/**
 * Formats a duration in minutes into a human-readable string (e.g. "2h 30m" or "45m").
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0 || Number.isNaN(minutes)) {
    return '0m';
  }

  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}
