import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/Home';
import RegisterPage from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import {
  PlayersPage,
  RegistrationsPage,
  DemandQueuePage,
  WeeksPage,
  ResultsPage,
  SettingsPage,
} from './pages/admin';
import { ROUTES } from './config/routes';
import { QueryProvider } from './lib/query.tsx';
import { AuthProvider } from './context/AuthContext';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        {/* Future: <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
            <Route path={ROUTES.STANDINGS} element={<StandingsPage />} /> */}
      </Route>

      {/* Admin Routes */}
      <Route path={ROUTES.ADMIN} element={<AdminLayout />}>
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_PLAYERS} element={<PlayersPage />} />
        <Route path={ROUTES.ADMIN_REGISTRATIONS} element={<RegistrationsPage />} />
        <Route path={ROUTES.ADMIN_DEMAND_QUEUE} element={<DemandQueuePage />} />
        <Route path={ROUTES.ADMIN_WEEKS} element={<WeeksPage />} />
        <Route path={ROUTES.ADMIN_RESULTS} element={<ResultsPage />} />
        <Route path={ROUTES.ADMIN_SETTINGS} element={<SettingsPage />} />
      </Route>

      {/* Catch-all: redirect to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
