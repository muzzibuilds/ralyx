const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();

export const API_BASE_URL = configuredBackendUrl
  ? configuredBackendUrl.replace(/\/$/, '')
  : import.meta.env.DEV
    ? 'http://localhost:3001'
    : '';

export function apiUrl(path: string) {
  if (!path.startsWith('/')) {
    throw new Error('API path must start with "/"');
  }

  return `${API_BASE_URL}${path}`;
}