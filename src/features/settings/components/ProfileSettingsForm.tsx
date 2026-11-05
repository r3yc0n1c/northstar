import { useState, useMemo } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Check, Download, LogOut, RotateCcw } from 'lucide-react';
import {
  formatDate,
  formatTime,
  formatNumber,
  formatCurrency,
  resolveBrowserDefaults,
} from '@/lib/format';
import { useAuth } from '@/features/auth';
import { useUpdateProfile, useExportData } from '../hooks/useProfile';
import {
  COMMON_LOCALES,
  COMMON_CURRENCIES,
  profileSettingsSchema,
  type ProfileSettingsFormValues,
  type WorkingHoursMap,
} from '../schema';
import { TimezoneSelect } from './TimezoneSelect';
import { WorkingHoursEditor } from './WorkingHoursEditor';
import type { ProfileRow } from '../api/profile';

export interface ProfileSettingsFormProps {
  profile: ProfileRow;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const { signOut } = useAuth();
  const updateProfileMutation = useUpdateProfile(profile.id);
  const exportDataMutation = useExportData(profile.id);

  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [timezone, setTimezone] = useState(profile.timezone || 'UTC');
  const [locale, setLocale] = useState(profile.locale || 'en-US');
  const [currencyCode, setCurrencyCode] = useState(profile.currency_code || 'USD');
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(profile.week_starts_on === 0 ? 0 : 1);
  const [workingDays, setWorkingDays] = useState<number[]>(
    profile.working_days && profile.working_days.length > 0
      ? profile.working_days
      : [1, 2, 3, 4, 5],
  );
  const [workingHours, setWorkingHours] = useState<WorkingHoursMap>(
    (profile.working_hours as WorkingHoursMap) || {
      mon: { start: '09:00', end: '17:00' },
      tue: { start: '09:00', end: '17:00' },
      wed: { start: '09:00', end: '17:00' },
      thu: { start: '09:00', end: '17:00' },
      fri: { start: '09:00', end: '17:00' },
    },
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Derive user initials for avatar fallback (FR-SET-1)
  const userInitials = useMemo(() => {
    const name = displayName.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    const firstPart = parts[0];
    const secondPart = parts[1];
    if (parts.length >= 2 && firstPart && secondPart && firstPart[0] && secondPart[0]) {
      return (firstPart[0] + secondPart[0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [displayName]);

  // Live preview date for formatting demo
  const sampleDate = useMemo(() => new Date(), []);

  // Reset values to browser defaults (FR-SET-2)
  const handleResetToBrowserDefaults = () => {
    const defaults = resolveBrowserDefaults();
    setTimezone(defaults.timezone);
    setLocale(defaults.locale);
    setCurrencyCode(defaults.currency);
    setWeekStartsOn(defaults.weekStartsOn);
    setSavedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSavedSuccess(false);

    const candidateValues: ProfileSettingsFormValues = {
      display_name: displayName,
      timezone,
      locale,
      currency_code: currencyCode,
      week_starts_on: weekStartsOn,
      working_days: workingDays,
      working_hours: workingHours,
    };

    const validationResult = profileSettingsSchema.safeParse(candidateValues);
    if (!validationResult.success) {
      setFormError(validationResult.error.issues[0]?.message || 'Invalid settings form inputs');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        display_name: candidateValues.display_name,
        timezone: candidateValues.timezone,
        locale: candidateValues.locale,
        currency_code: candidateValues.currency_code,
        week_starts_on: candidateValues.week_starts_on,
        working_days: candidateValues.working_days,
        working_hours: candidateValues.working_hours,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl" noValidate>
      {/* Success Notification */}
      {savedSuccess && (
        <div
          role="status"
          className="p-3 bg-success/10 border border-success text-success text-xs rounded-[6px] flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>Profile and settings saved successfully. Formatters updated app-wide.</span>
        </div>
      )}

      {/* Error Alert */}
      {formError && (
        <div
          role="alert"
          className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded-[6px]"
        >
          {formError}
        </div>
      )}

      {/* Section 1: Profile & Identity (FR-SET-1) */}
      <section className="p-6 rounded-[10px] border border-border bg-surface space-y-5">
        <header className="pb-3 border-b border-border">
          <h2 className="text-base font-semibold text-text">Profile Information</h2>
          <p className="text-xs text-text-2 mt-0.5">
            Your display identity across workspaces and personal reviews.
          </p>
        </header>

        <div className="flex items-center gap-5">
          {/* Avatar with fallback initials */}
          <div className="w-14 h-14 rounded-full bg-accent border border-highlight/40 flex items-center justify-center text-text font-mono text-base font-semibold shadow-inner">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <Label htmlFor="display-name" className="text-xs text-text-2 font-medium">
              Display Name
            </Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name"
              disabled={updateProfileMutation.isPending}
              className="max-w-md bg-surface-2"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Regional Calibration & Formatting (FR-SET-2, FR-SET-5) */}
      <section className="p-6 rounded-[10px] border border-border bg-surface space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-text">Timezone, Locale & Currency</h2>
            <p className="text-xs text-text-2 mt-0.5">
              Governs all dates, times, measurements, and capacity calculations app-wide.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToBrowserDefaults}
            className="text-xs text-text-2 hover:text-text gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Browser defaults</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Timezone (IANA Searchable) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-text-2 font-medium">Timezone (IANA)</Label>
            <TimezoneSelect
              value={timezone}
              onChange={setTimezone}
              disabled={updateProfileMutation.isPending}
            />
          </div>

          {/* Locale */}
          <div className="space-y-1.5">
            <Label htmlFor="locale-select" className="text-xs text-text-2 font-medium">
              Locale (Language & Number Format)
            </Label>
            <Select
              value={locale}
              onValueChange={setLocale}
              disabled={updateProfileMutation.isPending}
            >
              <SelectTrigger id="locale-select" className="font-mono text-xs">
                <SelectValue placeholder="Select locale" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_LOCALES.map((item) => (
                  <SelectItem key={item.code} value={item.code} className="text-xs">
                    {item.label} ({item.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Code */}
          <div className="space-y-1.5">
            <Label htmlFor="currency-select" className="text-xs text-text-2 font-medium">
              Currency
            </Label>
            <Select
              value={currencyCode}
              onValueChange={setCurrencyCode}
              disabled={updateProfileMutation.isPending}
            >
              <SelectTrigger id="currency-select" className="font-mono text-xs">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CURRENCIES.map((item) => (
                  <SelectItem key={item.code} value={item.code} className="text-xs font-mono">
                    {item.symbol} — {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Week Starts On */}
          <div className="space-y-1.5">
            <Label htmlFor="week-start-select" className="text-xs text-text-2 font-medium">
              Week Starts On
            </Label>
            <Select
              value={String(weekStartsOn)}
              onValueChange={(val) => setWeekStartsOn(Number(val) as 0 | 1)}
              disabled={updateProfileMutation.isPending}
            >
              <SelectTrigger id="week-start-select" className="text-xs">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="text-xs">
                  Monday (ISO standard)
                </SelectItem>
                <SelectItem value="0" className="text-xs">
                  Sunday (US / Traditional)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Real-time Formatting Preview (FR-SET-5) */}
        <div className="mt-4 p-3.5 bg-surface-2 rounded-[6px] border border-border space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-3">
            Live Formatting Preview (Intl)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-text-3 block text-[10px]">Date</span>
              <p className="font-mono text-text mt-0.5">
                {formatDate(sampleDate, undefined, { locale, timezone })}
              </p>
            </div>
            <div>
              <span className="text-text-3 block text-[10px]">Time</span>
              <p className="font-mono text-text mt-0.5">
                {formatTime(sampleDate, undefined, { locale, timezone })}
              </p>
            </div>
            <div>
              <span className="text-text-3 block text-[10px]">Currency</span>
              <p className="font-mono text-text mt-0.5">
                {formatCurrency(1250.5, currencyCode, { locale })}
              </p>
            </div>
            <div>
              <span className="text-text-3 block text-[10px]">Number</span>
              <p className="font-mono text-text mt-0.5">
                {formatNumber(98420.75, undefined, { locale })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Working Days & Daily Hours (FR-SET-3) */}
      <section className="p-6 rounded-[10px] border border-border bg-surface">
        <WorkingHoursEditor
          workingDays={workingDays}
          onWorkingDaysChange={setWorkingDays}
          workingHours={workingHours}
          onWorkingHoursChange={setWorkingHours}
          disabled={updateProfileMutation.isPending}
        />
      </section>

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={updateProfileMutation.isPending}
          className="px-6 h-10"
        >
          Save Changes
        </Button>
      </div>

      {/* Section 4: Data Portability & Danger Zone (FR-SET-4) */}
      <section className="p-6 rounded-[10px] border border-border bg-surface space-y-4">
        <header className="pb-3 border-b border-border">
          <h2 className="text-base font-semibold text-text">Data Portability & Sessions</h2>
          <p className="text-xs text-text-2 mt-0.5">
            Northstar is private by default. Full export of your workspaces and profile.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-text">Export All Data (JSON)</h4>
            <p className="text-xs text-text-2 mt-0.5">
              Download complete structured JSON archive of all workspaces, settings, and records.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => exportDataMutation.mutate()}
            loading={exportDataMutation.isPending}
            className="gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </Button>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-danger">Sign Out</h4>
            <p className="text-xs text-text-2 mt-0.5">
              Clears current browser session and cached query state.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => signOut()}
            className="gap-2 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </section>
    </form>
  );
}
