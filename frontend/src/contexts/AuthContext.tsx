'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, LoginCredentials, RegisterData } from '@/lib/types';
import { authApi, getAccessToken, clearAccessToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setState({ user: null, loading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await authApi.getMe();
      setState({ user, loading: false, isAuthenticated: true });
    } catch {
      clearAccessToken();
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await authApi.login(credentials);
      const user = await authApi.getMe();
      setState({ user, loading: false, isAuthenticated: true });
    } catch (error) {
      setState({ user: null, loading: false, isAuthenticated: false });
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout even if server call fails
    } finally {
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
