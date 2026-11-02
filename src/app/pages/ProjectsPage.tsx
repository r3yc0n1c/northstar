import { Folder, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Multi-step initiatives driving key results and outcomes."
        action={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />
      <EmptyState
        icon={Folder}
        title="No active projects"
        description="Organize your tasks under focused initiatives linked to quarterly objectives."
        action={
          <Button variant="secondary" size="sm">
            Create Project
          </Button>
        }
      />
    </div>
  );
}
