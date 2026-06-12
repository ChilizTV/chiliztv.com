const JWT_KEY = 'predcast_admin_auth_token';
const GATE_KEY = 'predcast_admin_gate_token';

// sessionStorage on purpose: both secrets die with the tab.
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(JWT_KEY);
}
export function setAdminToken(token: string): void {
  sessionStorage.setItem(JWT_KEY, token);
}
export function clearAdminToken(): void {
  sessionStorage.removeItem(JWT_KEY);
}

export function getGateToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem(GATE_KEY);
  if (!token) return null;
  const expiry = Number(token.split('.')[0]);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    sessionStorage.removeItem(GATE_KEY);
    return null;
  }
  return token;
}
export function setGateToken(token: string): void {
  sessionStorage.setItem(GATE_KEY, token);
}
