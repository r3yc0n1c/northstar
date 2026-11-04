import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui';
import {
  AuthProvider,
  ProtectedRoute,
  PublicOnlyRoute,
  SignUpPage,
  SignInPage,
  ResetPasswordPage,
  UpdatePasswordPage,
  VerifyEmailLanding,
  VerifyRequiredPage,
} from '@/features/auth';
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            {/* Dev Kitchen Sink */}
            <Route path="/dev/kitchen-sink" element={<KitchenSink />} />

            {/* Auth Routes Scoped Under /auth */}
            <Route path="/auth">
              {/* Public-only Auth */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="sign-in" element={<SignInPage />} />
                <Route path="sign-up" element={<SignUpPage />} />
              </Route>

              {/* Password Recovery Flow */}
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="update-password" element={<UpdatePasswordPage />} />

              {/* Verification Callbacks & Gatekeeper */}
              <Route path="verify" element={<VerifyEmailLanding />} />
              <Route path="verify-required" element={<VerifyRequiredPage />} />
            </Route>

            {/* Authenticated & Verified App Shell with 7 Destinations + Settings */}
            <Route element={<ProtectedRoute />}>
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
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
