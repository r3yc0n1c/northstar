import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import {
  DOMAIN_COLORS,
  DOMAIN_ICONS,
  type CreateDomainInput,
  type Domain,
  createDomainSchema,
} from '../schema';
import { DomainIcon } from './DomainIcon';

interface DomainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  domain?: Domain | null;
  onSave: (input: CreateDomainInput) => Promise<void>;
  isSaving: boolean;
}

export function DomainDialog({ isOpen, onClose, domain, onSave, isSaving }: DomainDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(DOMAIN_COLORS[0].value);
  const [icon, setIcon] = useState<string>(DOMAIN_ICONS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (domain) {
        setName(domain.name);
        setColor(domain.color || DOMAIN_COLORS[0].value);
        setIcon(domain.icon || DOMAIN_ICONS[0]);
      } else {
        setName('');
        setColor(DOMAIN_COLORS[0].value);
        setIcon(DOMAIN_ICONS[0]);
      }
      setError(null);
    }
  }, [isOpen, domain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createDomainSchema.safeParse({ name, color, icon });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid life area input');
      return;
    }

    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save life area');
    }
  };

  const isEditing = Boolean(domain);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Life Area' : 'New Life Area'}</DialogTitle>
            <DialogDescription>
              Life areas group your long-term goals and quarterly OKRs into balanced dimensions of
              your life.
            </DialogDescription>
          </DialogHeader>

          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="domain-name">Area Name</Label>
            <Input
              id="domain-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Health & Fitness, Career, Craft"
              maxLength={60}
              autoFocus
            />
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <Label>Color Token</Label>
            <div className="grid grid-cols-5 gap-2">
              {DOMAIN_COLORS.map((c) => {
                const isSelected = color === c.value;
                return (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className="h-8 rounded-[6px] flex items-center justify-center border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight relative"
                    style={{
                      backgroundColor: c.value,
                      borderColor: isSelected ? 'var(--highlight)' : 'transparent',
                    }}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check className="w-4 h-4 text-bg drop-shadow-md stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-border rounded-[6px] bg-surface">
              {DOMAIN_ICONS.map((i) => {
                const isSelected = icon === i;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`h-9 rounded-[6px] flex items-center justify-center transition-all border ${
                      isSelected
                        ? 'bg-accent border-highlight text-highlight shadow-sm'
                        : 'bg-surface-2 border-transparent text-text-2 hover:text-text hover:bg-surface-2/80'
                    }`}
                    title={i}
                    aria-label={i}
                    aria-pressed={isSelected}
                  >
                    <DomainIcon name={i} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-3 bg-surface rounded-[8px] border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-[6px] flex items-center justify-center text-bg shadow-sm"
                style={{ backgroundColor: color }}
              >
                <DomainIcon name={icon} className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-text truncate max-w-[240px]">
                {name.trim() || 'Life Area Preview'}
              </span>
            </div>
            <span className="text-xs font-mono-num text-text-3">Preview</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Area'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
