import { CheckSquare, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button, Tabs, TabsList, TabsTrigger } from '@/components/ui';

export function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Execution tracking across all projects and areas."
        action={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        }
      >
        <Tabs defaultValue="list" className="w-auto">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="Break down your projects and goals into actionable daily work."
        action={
          <Button variant="secondary" size="sm">
            Create First Task
          </Button>
        }
      />
    </div>
  );
}
