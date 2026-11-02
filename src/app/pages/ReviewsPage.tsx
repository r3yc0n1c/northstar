import { BookOpen, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export function ReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Structured reflection routines: daily closing and weekly calibration."
        action={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Start Weekly Review
          </Button>
        }
      />
      <EmptyState
        icon={BookOpen}
        title="No completed reviews yet"
        description="Take five minutes to reflect on accomplishments, unblock stalled tasks, and reset capacity."
        action={
          <Button variant="secondary" size="sm">
            Start Daily Review
          </Button>
        }
      />
    </div>
  );
}
