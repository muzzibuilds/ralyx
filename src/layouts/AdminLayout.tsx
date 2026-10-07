/**
 * AdminLayout
 * Used for admin/operator pages
 * Includes admin navigation sidebar
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/useAuth';
import './Layout.css';
import { ROUTES } from '../config/routes';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminNavItems = [
    { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD },
    { label: 'Players', href: ROUTES.ADMIN_PLAYERS },
    { label: 'Registrations', href: ROUTES.ADMIN_REGISTRATIONS },
    { label: 'Demand Queue', href: ROUTES.ADMIN_DEMAND_QUEUE },
    { label: 'Weeks & Matches', href: ROUTES.ADMIN_WEEKS },
    { label: 'Results', href: ROUTES.ADMIN_RESULTS },
    { label: 'Settings', href: ROUTES.ADMIN_SETTINGS },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__brand">
          <h1>RALYX ADMIN</h1>
        </div>
        <div className="admin-header__actions">
          <button
            className="admin-header__menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          {user && (
            <span className="admin-header__user">
              {user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.HOME)}>
            Back to Site
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="admin-container">
        <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
          <nav className="admin-nav">
            {adminNavItems.map((item) => (
              <button
                key={item.href}
                className="admin-nav__item"
                onClick={() => navigate(item.href)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
