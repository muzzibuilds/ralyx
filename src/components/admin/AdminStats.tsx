/**
 * Admin Stats Card Component
 * Display key metrics on dashboard
 */

import './AdminStats.css';

interface AdminStatProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function AdminStat({ label, value, trend = 'neutral' }: AdminStatProps) {
  return (
    <div className={`admin-stat admin-stat--${trend}`}>
      <div className="admin-stat__value">{value}</div>
      <div className="admin-stat__label">{label}</div>
    </div>
  );
}

interface AdminStatsGridProps {
  stats: AdminStatProps[];
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="admin-stats-grid">
      {stats.map((stat, index) => (
        <AdminStat key={index} {...stat} />
      ))}
    </div>
  );
}
