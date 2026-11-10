import { useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Edit2,
  FolderPlus,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, EmptyState, Label, Skeleton, Switch } from '@/components/ui';
import type { CreateDomainInput, Domain } from '../schema';
import {
  useArchiveDomain,
  useCreateDomain,
  useDomains,
  useReorderDomains,
  useRestoreDomain,
  useUpdateDomain,
} from '../hooks/useDomains';
import { DomainIcon } from './DomainIcon';
import { DomainDialog } from './DomainDialog';

interface LifeAreasListProps {
  workspaceId?: string;
}

interface SortableItemProps {
  domain: Domain;
  index: number;
  total: number;
  onEdit: (domain: Domain) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function SortableDomainItem({
  domain,
  index,
  total,
  onEdit,
  onArchive,
  onRestore,
  onMoveUp,
  onMoveDown,
}: SortableItemProps) {
  const isArchived = Boolean(domain.archived_at);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: domain.id,
    disabled: isArchived,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`p-3.5 rounded-[10px] border flex items-center justify-between gap-3 transition-colors ${
        isArchived
          ? 'bg-surface/40 border-border/60 opacity-60'
          : 'bg-surface border-border hover:border-border/90'
      }`}
      data-testid={`domain-item-${domain.id}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag Handle (Active items only) */}
        {!isArchived ? (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-text-3 hover:text-text-2 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight"
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${domain.name}`}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Icon & Color Badge */}
        <div
          className="w-9 h-9 rounded-[8px] flex items-center justify-center text-bg shrink-0 shadow-sm"
          style={{ backgroundColor: domain.color || '#5A4F7C' }}
        >
          <DomainIcon name={domain.icon} className="w-4 h-4" />
        </div>

        {/* Name & Tag */}
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          <h3 className="text-sm font-semibold text-text truncate">{domain.name}</h3>
          {isArchived && (
            <span className="font-mono-num text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-2 text-warning border border-border">
              Archived
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Accessible Move Up / Move Down buttons */}
        {!isArchived && (
          <div className="flex items-center gap-0.5 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="h-7 w-7 text-text-3 hover:text-text"
              aria-label={`Move ${domain.name} up`}
              title="Move up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onMoveDown(index)}
              disabled={index === total - 1}
              className="h-7 w-7 text-text-3 hover:text-text"
              aria-label={`Move ${domain.name} down`}
              title="Move down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Edit Button */}
        {!isArchived && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(domain)}
            className="text-xs text-text-2 hover:text-text gap-1 h-8"
            aria-label={`Edit ${domain.name}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}

        {/* Archive / Restore Button */}
        {isArchived ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRestore(domain.id)}
            className="text-xs text-highlight hover:text-text gap-1 h-8"
            aria-label={`Restore ${domain.name}`}
          >
            <ArchiveRestore className="w-3.5 h-3.5" />
            <span>Restore</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onArchive(domain.id)}
            className="text-xs text-text-3 hover:text-danger gap-1 h-8"
            aria-label={`Archive ${domain.name}`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </Button>
        )}
      </div>
    </article>
  );
}

export function LifeAreasList({ workspaceId }: LifeAreasListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  const { data: domains = [], isLoading, error } = useDomains(workspaceId, showArchived);
  const { mutateAsync: createDomainMut, isPending: isCreating } = useCreateDomain(workspaceId);
  const { mutateAsync: updateDomainMut, isPending: isUpdating } = useUpdateDomain(workspaceId);
  const { mutateAsync: archiveDomainMut } = useArchiveDomain(workspaceId);
  const { mutateAsync: restoreDomainMut } = useRestoreDomain(workspaceId);
  const { mutateAsync: reorderDomainsMut } = useReorderDomains(workspaceId, showArchived);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = domains.findIndex((d) => d.id === active.id);
    const newIndex = domains.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(domains, oldIndex, newIndex);
    const payload = newOrder.map((d, index) => ({ id: d.id, sort_order: index }));

    await reorderDomainsMut(payload);
  };

  const handleMove = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= domains.length) return;
    const newOrder = arrayMove(domains, fromIndex, toIndex);
    const payload = newOrder.map((d, index) => ({ id: d.id, sort_order: index }));
    await reorderDomainsMut(payload);
  };

  const handleOpenCreate = () => {
    setEditingDomain(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setIsDialogOpen(true);
  };

  const handleSaveDomain = async (input: CreateDomainInput) => {
    if (editingDomain) {
      await updateDomainMut({ domainId: editingDomain.id, input });
    } else {
      await createDomainMut(input);
    }
  };

  const activeDomainsCount = domains.filter((d) => !d.archived_at).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text">Life Areas</h2>
            <span className="font-mono-num text-xs px-2 py-0.5 rounded bg-surface-2 text-highlight border border-border">
              {activeDomainsCount} Active
            </span>
          </div>
          <p className="text-xs text-text-2 mt-0.5">
            Core dimensions of life that group your quarterly OKRs and long-term goals.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Show Archived Toggle */}
          <div className="flex items-center gap-2 select-none">
            <Switch
              id="show-archived-switch"
              checked={showArchived}
              onCheckedChange={setShowArchived}
              aria-label="Show archived life areas"
            />
            <Label
              htmlFor="show-archived-switch"
              className="text-xs text-text-2 cursor-pointer font-normal"
            >
              Show archived
            </Label>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5"
            aria-label="New Life Area"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Life Area</span>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-[10px]" />
          <Skeleton className="h-16 w-full rounded-[10px]" />
          <Skeleton className="h-16 w-full rounded-[10px]" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-[10px] bg-danger/10 border border-danger/30 text-danger text-sm">
          Failed to load life areas: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && domains.length === 0 && (
        <EmptyState
          icon={FolderPlus}
          title={showArchived ? 'No life areas found' : 'No active life areas'}
          description="Create your first life area to organize your high-level goals and quarterly OKRs."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              Create First Life Area
            </Button>
          }
        />
      )}

      {/* Sortable List */}
      {!isLoading && domains.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={domains.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {domains.map((domain, index) => (
                <SortableDomainItem
                  key={domain.id}
                  domain={domain}
                  index={index}
                  total={domains.length}
                  onEdit={handleOpenEdit}
                  onArchive={(id) => archiveDomainMut(id)}
                  onRestore={(id) => restoreDomainMut(id)}
                  onMoveUp={(idx) => handleMove(idx, idx - 1)}
                  onMoveDown={(idx) => handleMove(idx, idx + 1)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <DomainDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        domain={editingDomain}
        onSave={handleSaveDomain}
        isSaving={isCreating || isUpdating}
      />
    </div>
  );
}
