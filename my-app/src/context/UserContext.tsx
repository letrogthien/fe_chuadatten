import React, { createContext, useContext, useEffect, useState } from 'react';
import type { components } from '../api-types/userService';
import apiClient from '../services/apiClient';

interface UserState {
    user: components['schemas']['UserInfDto'] | null;
    auth: components['schemas']['UserAuthReturnDto'] | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (data: components['schemas']['LoginRequest']) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}


const UserContext = createContext<UserState | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<components['schemas']['UserInfDto'] | null>(null);
    const [auth, setAuth] = useState<components['schemas']['UserAuthReturnDto'] | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ...existing code...

    // Check session on mount
    useEffect(() => {
        const fetchMe = async () => {
            setLoading(true);
            try {
                // Lấy thông tin auth
                const authRes = await apiClient.get('/api/v1/user-service/auth/me');

                setAuth(authRes.data.data);
                setIsAuthenticated(true);
                // Lấy thông tin user chi tiết
                if (authRes.data.data?.id) {
                    const userRes = await apiClient.get(`/api/v1/user-service/users/id/${authRes.data.data.id}`);
                    setUser(userRes.data.data);
                } else {
                    setUser(null);
                }

            } catch (err: any) {
               await refresh();

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
            const loginRes = await apiClient.post('/api/v1/user-service/auth/login', data);
            if (loginRes.data?.message != "Login successful") {
                setError(loginRes.data.message);
                setUser(null);
                setAuth(null);
                setIsAuthenticated(false);
                return;
            }
            // Cookie được set, gọi lại /auth/me và /users/id/{userId}
            const authRes = await apiClient.get('/api/v1/user-service/auth/me');
            setAuth(authRes.data.data);
            setIsAuthenticated(true);
            if (authRes.data.data?.id) {
                const userRes = await apiClient.get(`/api/v1/user-service/users/id/${authRes.data.data.id}`);
                setUser(userRes.data.data);
            } else {
                setUser(null);
            }
        } catch (err: any) {
            // Lấy lỗi chi tiết từ API nếu có
            const apiError = err?.response?.data?.message || err?.message || 'Login failed';
            setError(typeof apiError === 'string' ? apiError : JSON.stringify(apiError));
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
            // Cookie mới, gọi lại /auth/me và /users/id/{userId}
            const authRes = await apiClient.get('/api/v1/user-service/auth/me');
            setAuth(authRes.data.data);
            setIsAuthenticated(true);
            if (authRes.data.data?.id) {
                const userRes = await apiClient.get(`/api/v1/user-service/users/id/${authRes.data.data.id}`);
                setUser(userRes.data.data);
            } else {
                setUser(null);
            }
        } catch {
            clearSession();

        } finally {
            setLoading(false);
        }
    };

    const clearSession = async () => {
        setLoading(true);
        try {
            await apiClient.post('/api/v1/user-service/auth/clear-session');
        } finally {
            setUser(null);
            setAuth(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    // Memoize context value to avoid unnecessary rerenders
    const contextValue = React.useMemo(() => ({
        user,
        auth,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        refresh
    }), [user, auth, isAuthenticated, loading, error, login, logout, refresh]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext)!;


