import { Target, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export function GoalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals & OKRs"
        description="Life areas, high-level goals, and measurable key results connected to cycles."
        action={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        }
      />
      <EmptyState
        icon={Target}
        title="No goals or objectives yet"
        description="Express long-term direction as life areas and time-bound OKRs."
        action={
          <Button variant="secondary" size="sm">
            Create First Goal
          </Button>
        }
      />
    </div>
  );
}
