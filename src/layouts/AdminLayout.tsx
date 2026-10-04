/**
 * AdminLayout
 * Used for admin/operator pages
 * Includes admin navigation sidebar
 */

import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/ui/Button';
import './Layout.css';
import { ROUTES } from '../config/routes';

export default function AdminLayout() {
  const navigate = useNavigate();
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
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.HOME)}>
            Back to Site
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
