'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { authenticateWallet, getAuthToken, clearAuthToken } from '@/lib/api/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: Error;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @notice Authentication provider integrating Dynamic Labs wallet with JWT
 * @dev Automatically fetches JWT token when wallet connects
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { primaryWallet } = useDynamicContext();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const authenticate = async () => {
      if (!primaryWallet?.address) {
        setAuthState({ isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const existingToken = await getAuthToken();
        if (existingToken) {
          setAuthState({ isAuthenticated: true, isLoading: false });
          return;
        }

        await authenticateWallet(primaryWallet.address);
        setAuthState({ isAuthenticated: true, isLoading: false });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Authentication failed'),
        });
      }
    };

    authenticate();
  }, [primaryWallet?.address]);

  const login = async () => {
    if (!primaryWallet?.address) {
      throw new Error('No wallet connected');
    }

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      await authenticateWallet(primaryWallet.address);
      setAuthState({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Login failed'),
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAuthToken();
      setAuthState({ isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * @notice Hook to access authentication context
 * @return Authentication state and methods
 * @dev Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
