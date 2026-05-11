import axios from 'axios';

const AUTH_TOKEN_KEY = 'chiliztv_auth_token';

/**
 * @notice Authenticates user wallet and retrieves JWT token
 * @param walletAddress User's Web3 wallet address
 * @return JWT token string
 */
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

/**
 * @notice Retrieves stored JWT token from localStorage
 * @return JWT token string or null if not found
 * @dev Returns null in SSR context
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * @notice Stores JWT token in localStorage
 * @param token JWT token to store
 * @dev No-op in SSR context
 */
export async function setAuthToken(token: string): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * @notice Clears stored JWT token from localStorage
 * @dev No-op in SSR context
 */
export async function clearAuthToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  // Notify the auth provider so it can re-generate if a wallet is still connected.
  window.dispatchEvent(new Event('auth:jwt:cleared'));
}
