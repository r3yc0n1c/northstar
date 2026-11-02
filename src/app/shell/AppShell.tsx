import * as React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Sun,
  Inbox,
  CheckSquare,
  Target,
  Folder,
  Repeat,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Compass,
  Menu,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  toast,
} from '@/components/ui';

export const PRIMARY_NAV_ITEMS = [
  { label: 'Today', path: '/today', icon: Sun },
  { label: 'Inbox', path: '/inbox', icon: Inbox },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Projects', path: '/projects', icon: Folder },
  { label: 'Habits', path: '/habits', icon: Repeat },
  { label: 'Reviews', path: '/reviews', icon: BookOpen },
] as const;

export const SETTINGS_ITEM = {
  label: 'Settings',
  path: '/settings',
  icon: Settings,
} as const;

export const MOBILE_TABS = [
  { label: 'Today', path: '/today', icon: Sun },
  { label: 'Inbox', path: '/inbox', icon: Inbox },
  { label: 'Habits', path: '/habits', icon: Repeat },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
] as const;

// Session-level memory for sidebar collapsed state
let sessionSidebarCollapsed = false;

export function AppShell() {
  const [collapsed, setCollapsed] = React.useState<boolean>(sessionSidebarCollapsed);
  const [moreOpen, setMoreOpen] = React.useState<boolean>(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      sessionSidebarCollapsed = next;
      return next;
    });
  };

  const handleQuickCapture = React.useCallback(() => {
    toast('Quick capture placeholder', {
      description: 'Press Q anywhere to capture tasks, thoughts, or notes.',
      action: {
        label: 'Got it',
        onClick: () => {},
      },
    });
  }, []);

  // Keyboard shortcut 'Q' for quick capture
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'q' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        handleQuickCapture();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleQuickCapture]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row antialiased">
        {/* Desktop Sidebar (240px expanded / 56px collapsed) */}
        <aside
          className={cn(
            'hidden md:flex md:flex-col border-r border-border bg-surface transition-all duration-200 select-none z-30 shrink-0 h-screen sticky top-0',
            collapsed ? 'w-[56px]' : 'w-[240px]',
          )}
          aria-label="Sidebar navigation"
        >
          {/* Sidebar Header */}
          <div className="flex h-14 items-center justify-between px-3 border-b border-border">
            <div
              className={cn(
                'flex items-center gap-2 overflow-hidden',
                collapsed && 'justify-center w-full',
              )}
            >
              <div className="h-8 w-8 rounded-[6px] bg-accent/30 border border-border flex items-center justify-center text-highlight shrink-0">
                <Compass className="h-4 w-4" />
              </div>
              {!collapsed && (
                <span className="font-semibold text-sm tracking-tight text-text truncate">
                  Northstar
                </span>
              )}
            </div>

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 text-text-2 hover:text-text"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Capture Hint in Sidebar (when expanded) */}
          {!collapsed && (
            <div className="p-3">
              <button
                type="button"
                onClick={handleQuickCapture}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] bg-surface-2 border border-border text-xs text-text-2 hover:text-text hover:border-highlight/50 transition-colors cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-highlight" />
                  <span>Quick Capture</span>
                </span>
                <kbd className="font-mono-num text-[10px] bg-bg px-1.5 py-0.5 rounded border border-border text-text-3 group-hover:text-text">
                  Q
                </kbd>
              </button>
            </div>
          )}

          {/* Nav Items List */}
          <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              const navLinkContent = (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors relative min-h-[40px]',
                    isActive
                      ? 'bg-surface-2 text-highlight font-semibold'
                      : 'text-text-2 hover:text-text hover:bg-surface-2/60',
                    collapsed && 'justify-center px-0',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active-item indicator in --highlight */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-highlight rounded-r" />
                  )}
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive ? 'text-highlight' : 'text-text-2')}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navLinkContent;
            })}
          </nav>

          {/* Sidebar Footer: Settings & Collapse Toggle (when collapsed) */}
          <div className="p-2 border-t border-border space-y-1">
            {collapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={SETTINGS_ITEM.path}
                      className={cn(
                        'flex items-center justify-center rounded-[6px] py-2 text-sm font-medium transition-colors min-h-[40px] relative',
                        location.pathname.startsWith(SETTINGS_ITEM.path)
                          ? 'bg-surface-2 text-highlight'
                          : 'text-text-2 hover:text-text hover:bg-surface-2/60',
                      )}
                      aria-current={
                        location.pathname.startsWith(SETTINGS_ITEM.path) ? 'page' : undefined
                      }
                    >
                      {location.pathname.startsWith(SETTINGS_ITEM.path) && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-highlight rounded-r" />
                      )}
                      <Settings className="h-4 w-4 text-text-2" />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    Settings
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      className="w-full h-9 text-text-2 hover:text-text flex items-center justify-center"
                      aria-label="Expand sidebar"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    Expand sidebar (240px)
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <NavLink
                to={SETTINGS_ITEM.path}
                className={cn(
                  'flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors min-h-[40px] relative',
                  location.pathname.startsWith(SETTINGS_ITEM.path)
                    ? 'bg-surface-2 text-highlight font-semibold'
                    : 'text-text-2 hover:text-text hover:bg-surface-2/60',
                )}
                aria-current={location.pathname.startsWith(SETTINGS_ITEM.path) ? 'page' : undefined}
              >
                {location.pathname.startsWith(SETTINGS_ITEM.path) && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-highlight rounded-r" />
                )}
                <Settings className="h-4 w-4 shrink-0 text-text-2" />
                <span className="truncate">{SETTINGS_ITEM.label}</span>
              </NavLink>
            )}
          </div>
        </aside>

        {/* Mobile Top Header */}
        <header className="md:hidden flex h-14 items-center justify-between px-4 border-b border-border bg-surface shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[4px] bg-accent/30 border border-border flex items-center justify-center text-highlight">
              <Compass className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-text">Northstar</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuickCapture}
            className="text-xs text-highlight gap-1.5 h-8 px-2.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Capture</span>
          </Button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-[1200px] w-full mx-auto p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>

        {/* Mobile Quick-capture FAB Placeholder (<768px) */}
        <button
          type="button"
          onClick={handleQuickCapture}
          className="md:hidden fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full bg-accent hover:bg-accent-hover text-text border border-border shadow-lg flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight active:scale-95 transition-transform"
          aria-label="Quick capture"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Mobile Bottom Tab Bar (<768px, 44px min touch targets) */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around px-1"
          aria-label="Mobile navigation"
        >
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-xs font-medium transition-colors relative',
                  isActive ? 'text-highlight' : 'text-text-2 hover:text-text',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span className="absolute top-0 inset-x-4 h-0.5 bg-highlight rounded-b" />
                )}
                <Icon className={cn('h-5 w-5 mb-1', isActive ? 'text-highlight' : 'text-text-2')} />
                <span className="text-[11px] leading-none">{tab.label}</span>
              </NavLink>
            );
          })}

          {/* 5th Tab: More (opens Sheet) */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] text-xs font-medium transition-colors text-text-2 hover:text-text cursor-pointer',
                  ['/goals', '/projects', '/reviews', '/settings'].some((p) =>
                    location.pathname.startsWith(p),
                  ) && 'text-highlight',
                )}
                aria-label="More destinations"
              >
                <Menu className="h-5 w-5 mb-1 text-current" />
                <span className="text-[11px] leading-none">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="p-6 max-h-[85vh] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Destinations</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                {[
                  { label: 'Goals & OKRs', path: '/goals', icon: Target },
                  { label: 'Projects', path: '/projects', icon: Folder },
                  { label: 'Reviews', path: '/reviews', icon: BookOpen },
                  { label: 'Settings', path: '/settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        'flex items-center gap-3 p-3.5 rounded-[8px] border text-sm font-medium transition-colors min-h-[44px]',
                        isActive
                          ? 'border-highlight/50 bg-surface text-highlight'
                          : 'border-border bg-surface text-text hover:border-highlight/30',
                      )}
                    >
                      <Icon className="h-5 w-5 text-current shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Dev link in More menu */}
              <div className="mt-4 pt-4 border-t border-border">
                <NavLink
                  to="/dev/kitchen-sink"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2 text-xs text-text-2 hover:text-highlight py-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Component Kitchen Sink (Dev)</span>
                </NavLink>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </TooltipProvider>
  );
}
