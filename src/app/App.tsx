import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui';
import { AppShell } from './shell/AppShell';
import { KitchenSink } from './routes/KitchenSink';
import { TodayPage } from './pages/TodayPage';
import { InboxPage } from './pages/InboxPage';
import { TasksPage } from './pages/TasksPage';
import { GoalsPage } from './pages/GoalsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { HabitsPage } from './pages/HabitsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Dev Kitchen Sink */}
        <Route path="/dev/kitchen-sink" element={<KitchenSink />} />

        {/* Authenticated App Shell with 7 Destinations + Settings */}
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
