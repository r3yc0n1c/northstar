import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/components/ui';
import { visionSchema } from '../schema';

interface VisionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialVision: string;
  onSave: (vision: string) => Promise<void>;
  isSaving: boolean;
}

export function VisionDialog({
  isOpen,
  onClose,
  initialVision,
  onSave,
  isSaving,
}: VisionDialogProps) {
  const [vision, setVision] = useState(initialVision);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVision(initialVision);
      setError(null);
    }
  }, [isOpen, initialVision]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = visionSchema.safeParse({ vision });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid vision statement');
      return;
    }

    try {
      await onSave(result.data.vision);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vision statement');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Lifetime Vision Anchor</DialogTitle>
            <DialogDescription>
              Your vision statement serves as your Northstar — the ultimate personal anchor guiding
              your life areas, quarters, and daily execution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              value={vision}
              onChange={(e) => {
                setVision(e.target.value);
                if (error) setError(null);
              }}
              placeholder='e.g. "Build a calm, creative life where I ship meaningful work and stay healthy."'
              rows={4}
              maxLength={1000}
              className="resize-none font-sans leading-relaxed"
              aria-label="Lifetime Vision Anchor"
              autoFocus
            />
            <div className="flex items-center justify-between text-xs text-text-2">
              <span className="text-danger">{error}</span>
              <span className="font-mono-num ml-auto">{vision.length} / 1000</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Vision'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
