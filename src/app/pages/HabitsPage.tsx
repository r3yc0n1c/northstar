import { Repeat, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export function HabitsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits"
        description="Daily routines and consistency tracking independent of task lists."
        action={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            New Habit
          </Button>
        }
      />
      <EmptyState
        icon={Repeat}
        title="No habits established"
        description="Build sustainable routines with clear targets, schedules, and streak tracking."
        action={
          <Button variant="secondary" size="sm">
            Create Habit
          </Button>
        }
      />
    </div>
  );
}
