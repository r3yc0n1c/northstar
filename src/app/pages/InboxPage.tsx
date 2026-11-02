import { Inbox, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export function InboxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Fast capture without friction. Triage to projects and cycles later."
        action={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Capture (Q)
          </Button>
        }
      />
      <EmptyState
        icon={Inbox}
        title="Inbox is empty"
        description="All captured thoughts and tasks have been triaged. Press Q to quickly capture anytime."
        action={
          <Button variant="secondary" size="sm">
            Capture New Item
          </Button>
        }
      />
    </div>
  );
}
