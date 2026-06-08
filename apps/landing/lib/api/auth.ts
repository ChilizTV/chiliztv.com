import axios from 'axios';

const AUTH_TOKEN_KEY = 'predcast_auth_token';

export async function authenticateWallet(walletAddress: string): Promise<string> {
  const response = await axios.post<{ token: string }>(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/token`,
    { walletAddress },
    { withCredentials: true }
  );
  const token = response.data.token;
  await setAuthToken(token);
  return token;
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event('auth:jwt:cleared'));
}
