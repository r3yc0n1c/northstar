import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { formatCycleLabel } from '@/domain/cycles';
import type { CreateCycleInput, Cycle, UpdateCycleInput } from '../schema';
import { CycleDialog } from './CycleDialog';

interface CycleSelectorProps {
  cycles: Cycle[];
  selectedCycle: Cycle | null;
  onSelectCycle: (cycle: Cycle) => void;
  onCreateCycle: (input: CreateCycleInput) => Promise<void>;
  onUpdateCycle?: (cycleId: string, input: UpdateCycleInput) => Promise<void>;
  onDeleteCycle?: (cycleId: string) => Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
}

export function CycleSelector({
  cycles,
  selectedCycle,
  onSelectCycle,
  onCreateCycle,
  onUpdateCycle,
  onDeleteCycle,
  isCreating = false,
  isUpdating = false,
}: CycleSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);

  const currentIndex = selectedCycle ? cycles.findIndex((c) => c.id === selectedCycle.id) : -1;

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = cycles[currentIndex - 1];
      if (prev) onSelectCycle(prev);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < cycles.length - 1) {
      const next = cycles[currentIndex + 1];
      if (next) onSelectCycle(next);
    }
  };

  const handleOpenCreate = () => {
    setEditingCycle(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cycle: Cycle) => {
    setEditingCycle(cycle);
    setIsDialogOpen(true);
  };

  const handleSaveCycle = async (input: CreateCycleInput) => {
    if (editingCycle && onUpdateCycle) {
      await onUpdateCycle(editingCycle.id, input);
    } else {
      await onCreateCycle(input);
    }
  };

  const handleDelete = async (e: React.MouseEvent, cycleId: string) => {
    e.stopPropagation();
    if (onDeleteCycle) {
      await onDeleteCycle(cycleId);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 bg-surface border border-border rounded-[8px] p-0.5 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="h-7 w-7 text-text-2 hover:text-text disabled:opacity-30"
          aria-label="Previous cycle"
          title="Previous cycle"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs font-medium text-text gap-2 hover:bg-surface-2"
              aria-label="Select cycle"
            >
              <Calendar className="w-3.5 h-3.5 text-highlight" />
              <span className="font-mono-num font-semibold">
                {selectedCycle ? formatCycleLabel(selectedCycle) : 'No Cycles Configured'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 max-h-72 overflow-y-auto">
            {cycles.length === 0 ? (
              <div className="p-3 text-xs text-text-3 text-center">No cycles yet</div>
            ) : (
              cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className={`flex items-center justify-between p-2 rounded text-xs hover:bg-surface-2/60 ${
                    selectedCycle?.id === cycle.id
                      ? 'bg-accent/20 text-highlight font-semibold'
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectCycle(cycle)}
                    className="flex flex-col items-start gap-0.5 min-w-0 flex-1 mr-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-highlight rounded"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{cycle.name}</span>
                      <span className="font-mono-num text-[10px] uppercase text-text-3 ml-2">
                        {cycle.status}
                      </span>
                    </div>
                    <span className="font-mono-num text-[11px] text-text-2">
                      {cycle.start_date} – {cycle.end_date}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {onUpdateCycle && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(cycle);
                        }}
                        className="h-6 w-6 text-text-3 hover:text-text"
                        aria-label={`Edit ${cycle.name}`}
                        title="Edit cycle"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}

                    {onDeleteCycle && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, cycle.id)}
                        className="h-6 w-6 text-text-3 hover:text-danger"
                        aria-label={`Delete ${cycle.name}`}
                        title="Delete cycle"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleOpenCreate}
              className="gap-2 text-xs text-highlight cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Cycle</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex < 0 || currentIndex >= cycles.length - 1}
          className="h-7 w-7 text-text-2 hover:text-text disabled:opacity-30"
          aria-label="Next cycle"
          title="Next cycle"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Quick Edit current cycle button */}
        {selectedCycle && onUpdateCycle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEdit(selectedCycle)}
            className="h-7 w-7 text-text-3 hover:text-text"
            aria-label={`Edit ${selectedCycle.name}`}
            title="Edit current cycle"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}

        {/* Quick Delete current cycle button */}
        {selectedCycle && onDeleteCycle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => handleDelete(e, selectedCycle.id)}
            className="h-7 w-7 text-text-3 hover:text-danger"
            aria-label={`Delete ${selectedCycle.name}`}
            title="Delete current cycle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <CycleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        cycle={editingCycle}
        onSave={handleSaveCycle}
        isSaving={isCreating || isUpdating}
      />
    </>
  );
}
