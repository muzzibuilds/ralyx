/**
 * Route configuration for RALYX application
 * Centralized route definitions for consistency and maintainability
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  REGISTER: '/register',
  RESULTS: '/results',
  STANDINGS: '/standings',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PLAYERS: '/admin/players',
  ADMIN_REGISTRATIONS: '/admin/registrations',
  ADMIN_DEMAND_QUEUE: '/admin/demand-queue',
  ADMIN_WEEKS: '/admin/weeks',
  ADMIN_RESULTS: '/admin/results',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Get route by key for type-safe routing
 */
export const getRoute = (key: RouteKey): string => ROUTES[key];
