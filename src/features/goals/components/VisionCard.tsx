import { useEffect, useState } from 'react';
import { Compass, Edit3 } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { useWorkspaceVision, useUpdateWorkspaceVision } from '../hooks/useVision';
import { VisionDialog } from './VisionDialog';

interface VisionCardProps {
  workspaceId?: string;
}

export function VisionCard({ workspaceId }: VisionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: vision, isLoading } = useWorkspaceVision(workspaceId);
  const { mutateAsync: updateVision, isPending } = useUpdateWorkspaceVision(workspaceId);

  // Global 'V' key shortcut to edit vision when not focused on an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'v' || e.key === 'V') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isDialogOpen
      ) {
        const target = e.target as HTMLElement | null;
        const tagName = target?.tagName ? target.tagName.toLowerCase() : '';
        const isEditable =
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          Boolean(target?.isContentEditable);

        if (!isEditable) {
          e.preventDefault();
          setIsDialogOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen]);

  const currentVision = vision ?? '';

  return (
    <>
      <section
        data-testid="vision-card"
        className="w-full bg-surface border border-border rounded-[10px] p-4 flex items-center justify-between shadow-sm relative overflow-hidden group select-none transition-colors hover:border-border/80"
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-highlight" />

        <div className="flex items-center gap-4 pl-1 min-w-0 flex-1 mr-4">
          <div className="w-10 h-10 rounded-[8px] bg-accent/30 text-highlight flex items-center justify-center shrink-0 border border-highlight/20">
            <Compass className="w-5 h-5" />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono-num text-[11px] uppercase tracking-wider text-highlight font-semibold">
                Northstar Vision
              </span>
              <span className="font-mono text-[11px] text-text-3 select-none">{'//'}</span>
              <span className="font-mono-num text-[11px] uppercase tracking-wider text-text-2 font-medium">
                Lifetime Anchor
              </span>
            </div>

            {isLoading ? (
              <Skeleton className="h-6 w-80 max-w-full" />
            ) : currentVision ? (
              <p className="text-base text-text font-medium leading-snug line-clamp-2 italic">
                "{currentVision}"
              </p>
            ) : (
              <p className="text-sm text-text-3 italic">
                Define your lifetime anchor statement. Press V or click Edit.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="text-xs text-text-2 hover:text-text gap-2 focus-visible:ring-highlight"
            title="Edit vision statement (V)"
            aria-label="Edit vision statement"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
            <kbd className="font-mono-num text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-highlight border border-border">
              V
            </kbd>
          </Button>
        </div>
      </section>

      <VisionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        initialVision={currentVision}
        onSave={async (newVision) => {
          await updateVision(newVision);
        }}
        isSaving={isPending}
      />
    </>
  );
}
