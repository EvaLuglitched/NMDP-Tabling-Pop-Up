// Admin access for the analytics dashboard.
//
// The pledge roster holds real student names and the reset/export endpoints are
// destructive, so the server requires a token (ADMIN_TOKEN) on those routes.
// The token is entered once in the dashboard and kept in this browser only.

const ADMIN_TOKEN_KEY = 'nmdp_admin_token';

export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    /* storage unavailable (private mode) - token simply won't persist */
  }
}

export function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { 'X-Admin-Token': token } : {};
}

/** fetch() with the admin token attached. */
export function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: { ...(init.headers || {}), ...adminHeaders() },
  });
}
