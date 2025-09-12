import React, { createContext, useContext, useEffect, useState } from 'react';
import type { components } from '../api-types/userService';
import apiClient from '../services/apiClient';

interface UserState {
  user: components['schemas']['UserAuthReturnDto'] | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (data: components['schemas']['LoginRequest']) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserState | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<components['schemas']['UserAuthReturnDto'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/api/v1/user-service/auth/me');
        setUser(res.data.data);
        setIsAuthenticated(true);
      } catch (err: any) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // Login
  const login = async (data: components['schemas']['LoginRequest']) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/api/v1/user-service/auth/login', data);
      // Cookie được set, gọi lại /me
      const res = await apiClient.get('/api/v1/user-service/auth/me');
      setUser(res.data.data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post('/api/v1/user-service/auth/logout');
      await apiClient.post('/api/v1/user-service/auth/clear-cookie');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Refresh token
  const refresh = async () => {
    setLoading(true);
    try {
      await apiClient.post('/api/v1/user-service/auth/access-token');
      // Cookie mới, gọi lại /me
      const res = await apiClient.get('/api/v1/user-service/auth/me');
      setUser(res.data.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, loading, error, login, logout, refresh }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext)!;
