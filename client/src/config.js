// API base — empty string since API routes are on the same Vercel domain
export const API_BASE = '';

// Wrapper around fetch that redirects to login on 401
export async function authFetch(url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/api/auth/login';
    return new Response(JSON.stringify({}), { status: 401 });
  }
  return res;
}
