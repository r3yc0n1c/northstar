import * as React from 'react';
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Switch,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Badge,
  Progress,
  Skeleton,
  StatusBadge,
  EmptyState,
  ErrorState,
  PageHeader,
  ProgressBar,
  toast,
} from '@/components/ui';
import {
  Inbox,
  FolderPlus,
  MoreVertical,
  Check,
  Calendar,
  Sparkles,
  Layers,
  Database as DatabaseIcon,
} from 'lucide-react';
import { checkSupabaseConnection, type ConnectionHealthResult } from '@/lib/supabase';

export function KitchenSink() {
  const [checkboxChecked, setCheckboxChecked] = React.useState<boolean>(true);
  const [switchChecked, setSwitchChecked] = React.useState<boolean>(false);
  const [dropdownCheck, setDropdownCheck] = React.useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = React.useState<boolean>(false);
  const [progressVal, setProgressVal] = React.useState<number>(68);
  const [dbHealth, setDbHealth] = React.useState<ConnectionHealthResult | null>(null);

  React.useEffect(() => {
    checkSupabaseConnection().then(setDbHealth);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-bg text-text p-6 md:p-10 max-w-6xl mx-auto space-y-12">
        <PageHeader
          title="Component Kitchen Sink"
          description="Design system tokens, typography, shadcn/ui primitives, and shared UI patterns."
          action={
            <Button
              variant="primary"
              onClick={() => {
                toast.success('Task moved to Today', {
                  description: 'Due date unchanged.',
                  action: {
                    label: 'Undo',
                    onClick: () => toast.info('Action undone'),
                  },
                });
              }}
            >
              <Sparkles className="h-4 w-4" />
              Trigger Toast with Undo
            </Button>
          }
        />

        {/* Dev Supabase Connectivity */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5 text-highlight" />
              <h2 className="text-lg font-semibold text-text">
                Supabase Wiring & Connectivity (Dev)
              </h2>
            </div>
            {dbHealth && (
              <Badge variant={dbHealth.ok ? 'success' : 'warning'}>
                {dbHealth.ok ? 'Connected' : 'Dev Mock / Offline'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-2">
            Local development uses typed client in <code>src/lib/supabase.ts</code> with the
            publishable key only.
          </p>
          <div className="p-4 rounded-[6px] bg-surface-2 border border-border flex items-center justify-between text-xs">
            <span className="text-text-2">
              Status:{' '}
              <strong className="text-text">{dbHealth ? dbHealth.message : 'Checking...'}</strong>
            </span>
            {dbHealth?.latencyMs !== undefined && (
              <span className="font-mono-num text-text-2">{dbHealth.latencyMs}ms</span>
            )}
          </div>
        </section>

        {/* 1. Typography & Mono Numbers */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">
            1. Typography & Numerals (IBM Plex Mono)
          </h2>
          <p className="text-sm text-text-2">
            Plus Jakarta Sans for UI text. IBM Plex Mono for all numbers, dates, durations, and
            percentages with tabular nums.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-[6px] bg-surface-2 border border-border">
              <span className="text-xs text-text-2">Dates & Times</span>
              <p className="text-base font-mono-num text-text mt-1">2026-11-02 21:30 UTC</p>
            </div>
            <div className="p-4 rounded-[6px] bg-surface-2 border border-border">
              <span className="text-xs text-text-2">KR Values & Percentages</span>
              <p className="text-base font-mono-num text-highlight mt-1">
                $45,200.00 / $50,000.00 (90.4%)
              </p>
            </div>
            <div className="p-4 rounded-[6px] bg-surface-2 border border-border">
              <span className="text-xs text-text-2">Streaks & Durations</span>
              <p className="text-base font-mono-num text-success mt-1">28 days streak · 04h 30m</p>
            </div>
          </div>
        </section>

        {/* 2. Buttons & Loading States */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">2. Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="secondary" size="icon" aria-label="Add folder">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* 3. Form Controls */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">3. Form Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="input-demo">Input field</Label>
              <Input id="input-demo" placeholder="e.g. Launch Q4 strategic objectives" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="select-demo">Select dropdown</Label>
              <Select defaultValue="quarterly">
                <SelectTrigger id="select-demo">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Cycle</SelectItem>
                  <SelectItem value="quarterly">Quarterly Cycle</SelectItem>
                  <SelectItem value="annual">Annual Cycle</SelectItem>
                  <SelectItem value="custom">Custom Cycle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="textarea-demo">Textarea notes</Label>
              <Textarea
                id="textarea-demo"
                placeholder="Enter objective context or key results notes..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="checkbox-demo"
                checked={checkboxChecked}
                onCheckedChange={(checked) => setCheckboxChecked(!!checked)}
              />
              <Label htmlFor="checkbox-demo" className="cursor-pointer">
                Checkbox (Mark objective as priority)
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch id="switch-demo" checked={switchChecked} onCheckedChange={setSwitchChecked} />
              <Label htmlFor="switch-demo" className="cursor-pointer">
                Switch (Enable daily capacity warnings)
              </Label>
            </div>
          </div>
        </section>

        {/* 4. Overlays & Dialogs */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">4. Dialogs, Drawers & Menus</h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Open Modal Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Goals express directional outcomes across life areas.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2 space-y-3">
                  <Label htmlFor="goal-name">Goal Title</Label>
                  <Input id="goal-name" placeholder="e.g. Master system-level architecture" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button variant="primary" onClick={() => setDialogOpen(false)}>
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Sheet / Drawer */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary">Open Side Sheet</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Task Details</SheetTitle>
                  <SheetDescription>
                    Review task constraints, estimates, and linked outcomes.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-text-2">Planned Date</span>
                    <p className="font-mono-num text-sm text-text">2026-11-03</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-2">Status</span>
                    <div>
                      <StatusBadge status="on_track" />
                    </div>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="primary" onClick={() => setSheetOpen(false)}>
                    Save Changes
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Open menu">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Plan for Today</span>
                  <DropdownMenuShortcut>P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Check className="mr-2 h-4 w-4" />
                  <span>Complete</span>
                  <DropdownMenuShortcut>C</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={dropdownCheck}
                  onCheckedChange={setDropdownCheck}
                >
                  Pin to Top
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  Hover for Tooltip
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Focus ring is 2px --highlight with 2px offset.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </section>

        {/* 5. Status Badges & Badges */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">5. Status Badges & Tags</h2>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="on_track" />
            <StatusBadge status="at_risk" />
            <StatusBadge status="off_track" />
            <StatusBadge status="not_started" />
            <StatusBadge status="achieved" />
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="highlight">Highlight</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* 6. Progress & Skeletons */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">6. Progress & Skeletons</h2>
          <div className="space-y-4 max-w-md">
            <ProgressBar label="Quarterly Objective Progress" value={progressVal} showValue />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProgressVal((p) => Math.max(0, p - 10))}
              >
                -10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProgressVal((p) => Math.min(100, p + 10))}
              >
                +10%
              </Button>
            </div>
            <div className="pt-2">
              <span className="text-xs text-text-2 mb-1 block">Raw Progress Primitive</span>
              <Progress value={progressVal} />
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <span className="text-xs text-text-2">Skeleton Loading Placeholders</span>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Tabs */}
        <section className="space-y-4 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">7. Tabs</h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Objectives</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <TabsContent
              value="all"
              className="p-4 rounded-[6px] bg-surface-2 border border-border text-sm text-text-2"
            >
              Showing all objectives across all active cycles.
            </TabsContent>
            <TabsContent
              value="active"
              className="p-4 rounded-[6px] bg-surface-2 border border-border text-sm text-text-2"
            >
              Filtered to active cycle objectives only.
            </TabsContent>
            <TabsContent
              value="closed"
              className="p-4 rounded-[6px] bg-surface-2 border border-border text-sm text-text-2"
            >
              Archived and closed cycle objectives.
            </TabsContent>
          </Tabs>
        </section>

        {/* 8. Shared UI States: Empty & Error */}
        <section className="space-y-6 rounded-[10px] border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">8. System States (Empty & Error)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              icon={Inbox}
              title="Inbox is empty"
              description="Capture incoming thoughts, tasks, and ideas with the Q shortcut."
              action={
                <Button variant="secondary" size="sm">
                  <Layers className="h-4 w-4" />
                  Quick Capture
                </Button>
              }
            />
            <ErrorState
              title="Failed to load objectives"
              message="Network request failed or Supabase project is currently unreachable."
              onRetry={() => toast.info('Retrying objective sync...')}
            />
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
