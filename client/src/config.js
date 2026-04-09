// Base path for API calls — works both through Vercel proxy and direct Railway access
const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // '/analytics' or ''

export const API_BASE = base;

// WebSocket URL — connect to Railway directly since Vercel rewrites don't support WS
export function getWSUrl(params) {
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${loc.host}${base}/ws?${params}`;
}
