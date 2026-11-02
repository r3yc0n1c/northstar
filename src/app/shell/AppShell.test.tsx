import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';

function renderShell(initialEntry = '/today') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="today" element={<div>Today Content</div>} />
          <Route path="inbox" element={<div>Inbox Content</div>} />
          <Route path="tasks" element={<div>Tasks Content</div>} />
          <Route path="goals" element={<div>Goals Content</div>} />
          <Route path="projects" element={<div>Projects Content</div>} />
          <Route path="habits" element={<div>Habits Content</div>} />
          <Route path="reviews" element={<div>Reviews Content</div>} />
          <Route path="settings" element={<div>Settings Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  it('renders all 7 primary destinations and settings in sidebar', () => {
    renderShell('/today');

    expect(screen.getAllByText('Today')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Inbox')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Tasks')[0]).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getAllByText('Habits')[0]).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders active item with correct highlighting and aria-current', () => {
    renderShell('/today');
    const todayLinks = screen.getAllByRole('link', { name: /today/i });
    expect(todayLinks[0]).toHaveAttribute('aria-current', 'page');
  });

  it('collapses and expands the sidebar', () => {
    renderShell('/today');
    const aside = screen.getByLabelText('Sidebar navigation');
    expect(aside).toHaveClass('w-[240px]');

    const collapseBtn = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseBtn);

    expect(aside).toHaveClass('w-[56px]');

    const expandBtn = screen.getByLabelText('Expand sidebar');
    fireEvent.click(expandBtn);

    expect(aside).toHaveClass('w-[240px]');
  });

  it('renders mobile navigation tabs with minimum 44px targets', () => {
    renderShell('/today');
    const mobileNav = screen.getByLabelText('Mobile navigation');
    expect(mobileNav).toBeInTheDocument();

    const mobileLinks = mobileNav.querySelectorAll('a');
    expect(mobileLinks.length).toBe(4); // Today, Inbox, Habits, Tasks
    for (const link of mobileLinks) {
      expect(link).toHaveClass('min-h-[44px]');
      expect(link).toHaveClass('min-w-[44px]');
    }
  });

  it('renders quick capture FAB placeholder', () => {
    renderShell('/today');
    const fab = screen.getByLabelText('Quick capture');
    expect(fab).toBeInTheDocument();
    fireEvent.click(fab);
  });
});
