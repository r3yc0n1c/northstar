import { CalendarCheck, Plus, Sparkles } from 'lucide-react';
import { PageHeader, EmptyState, Button, StatusBadge, ProgressBar } from '@/components/ui';

export function TodayPage() {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today"
        description={todayFormatted}
        action={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Plan Day
          </Button>
        }
      />

      {/* Daily Capacity & Big Three Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[10px] border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-text-2">
            <span className="font-medium text-text">Capacity</span>
            <span className="font-mono-num text-text">0.0h / 6.0h</span>
          </div>
          <ProgressBar value={0} showValue={false} />
          <p className="text-xs text-text-2">6 hours available based on working schedule.</p>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-5 space-y-2">
          <span className="text-xs text-text-2">Big Three Outcomes</span>
          <p className="text-sm font-medium text-text">0 of 3 prioritized</p>
          <p className="text-xs text-text-2">Select up to 3 high-impact outcomes for today.</p>
        </div>

        <div className="rounded-[10px] border border-border bg-surface p-5 space-y-2">
          <span className="text-xs text-text-2">Habits Due</span>
          <p className="text-sm font-medium text-text">0 scheduled today</p>
          <div className="pt-1">
            <StatusBadge status="not_started" label="All habits clear" />
          </div>
        </div>
      </div>

      {/* Main execution list */}
      <EmptyState
        icon={CalendarCheck}
        title="No tasks planned for today"
        description="Pick tasks from your Inbox or Projects to commit to today's schedule."
        action={
          <Button variant="secondary" size="sm">
            <Sparkles className="h-4 w-4" />
            Add from Inbox
          </Button>
        }
      />
    </div>
  );
}
