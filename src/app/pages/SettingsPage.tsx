import { PageHeader, Button } from '@/components/ui';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Profile preferences, timezone calibration, working hours, and data export."
      />
      <div className="max-w-2xl space-y-6">
        <div className="rounded-[10px] border border-border bg-surface p-6 space-y-4">
          <h2 className="text-base font-semibold text-text">Profile & Locale</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-text-2">Timezone</span>
              <p className="font-mono-num text-text mt-1">UTC</p>
            </div>
            <div>
              <span className="text-xs text-text-2">Locale</span>
              <p className="font-mono-num text-text mt-1">en-US</p>
            </div>
            <div>
              <span className="text-xs text-text-2">Currency</span>
              <p className="font-mono-num text-text mt-1">USD ($)</p>
            </div>
            <div>
              <span className="text-xs text-text-2">Week Starts On</span>
              <p className="text-text mt-1">Monday</p>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-semibold text-text">Data Portability</h2>
          <p className="text-sm text-text-2">
            Northstar is private by default. Full JSON export of all areas, goals, OKRs, tasks, and
            reviews is available anytime.
          </p>
          <div className="pt-2">
            <Button variant="secondary" size="sm">
              Export All Data (JSON)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
