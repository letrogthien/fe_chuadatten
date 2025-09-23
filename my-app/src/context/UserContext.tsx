import React, { createContext, useContext, useEffect, useState } from 'react';
import type { components } from '../api-types/userService';
import apiClient from '../services/apiClient';
import { useWebSocket } from './WebSocketContext';

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
    
    // Get WebSocket context to trigger reconnect
    const { forceConnect, webSocketService, disableReconnect, enableReconnect } = useWebSocket();
    
    // Flag to prevent multiple simultaneous /me calls
    const [isFetchingMe, setIsFetchingMe] = useState(false);

    // Helper function to trigger WebSocket reconnect after successful /me call
    const triggerWebSocketReconnect = React.useCallback(() => {
        console.log('✅ /me API successful - connecting WebSocket...');
        enableReconnect(); // Enable auto-reconnect since auth is successful
        setTimeout(() => {
            forceConnect();
        }, 500); // Small delay to ensure cookie is set
    }, [forceConnect, enableReconnect]);

    // ...existing code...

    // Check session on mount
    useEffect(() => {
        const fetchMe = async () => {
            if (isFetchingMe) {
                console.log('⚠️ /me already in progress, skipping...');
                return;
            }
            
            setIsFetchingMe(true);
            setLoading(true);
            try {
                console.log('📞 Calling /auth/me...');
                // Lấy thông tin auth
                const authRes = await apiClient.get('/api/v1/user-service/auth/me');

                setAuth(authRes.data.data);
                setIsAuthenticated(true);
                
                // Trigger WebSocket reconnect after successful /me
                triggerWebSocketReconnect();
                
                // Lấy thông tin user chi tiết
                if (authRes.data.data?.id) {
                    const userRes = await apiClient.get(`/api/v1/user-service/users/id/${authRes.data.data.id}`);
                    setUser(userRes.data.data);
                } else {
                    setUser(null);
                }

            } catch (err: any) {
                console.error('Failed to fetch /me, trying refresh...', err);
                try {
                    await refresh();
                } catch (refreshError) {
                    console.error('Refresh also failed:', refreshError);
                    // Clear session if both /me and refresh fail
                    disableReconnect(); // Disable auto-reconnect when auth fails
                    clearSession();
                }
            } finally {
                setLoading(false);
                setIsFetchingMe(false);
            }
        };
        fetchMe();
    }, []); // Remove triggerWebSocketReconnect from dependencies to avoid infinite loop

    // Login
    const login = async (data: components['schemas']['LoginRequest']) => {
        setIsFetchingMe(true);
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
            
            // Trigger WebSocket reconnect after successful login
            triggerWebSocketReconnect();
            
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
            disableReconnect(); // Disable auto-reconnect when login fails
        } finally {
            setLoading(false);
            setIsFetchingMe(false);
        }
    };

    // Logout
    const logout = async () => {
        setLoading(true);
        try {
            await apiClient.post('/api/v1/user-service/auth/logout');
            await apiClient.post('/api/v1/user-service/auth/clear-cookie');
        } finally {
            // Disconnect WebSocket when logging out
            if (webSocketService) {
                console.log('🔌 Disconnecting WebSocket on logout...');
                webSocketService.disconnect();
            }
            
            setUser(null);
            setAuth(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };




    // Refresh token
    const refresh = async () => {
        if (isFetchingMe) {
            console.log('⚠️ /me already in progress, skipping refresh...');
            return;
        }
        
        setIsFetchingMe(true);
        setLoading(true);
        try {
            await apiClient.post('/api/v1/user-service/auth/access-token');
            // Cookie mới, gọi lại /auth/me và /users/id/{userId}
            const authRes = await apiClient.get('/api/v1/user-service/auth/me');
            setAuth(authRes.data.data);
            setIsAuthenticated(true);
            
            // Trigger WebSocket reconnect after successful refresh
            triggerWebSocketReconnect();
            
            if (authRes.data.data?.id) {
                const userRes = await apiClient.get(`/api/v1/user-service/users/id/${authRes.data.data.id}`);
                setUser(userRes.data.data);
            } else {
                setUser(null);
            }
        } catch {
            disableReconnect(); // Disable auto-reconnect when refresh fails
            clearSession();

        } finally {
            setLoading(false);
            setIsFetchingMe(false);
        }
    };

    const clearSession = async () => {
        setLoading(true);
        try {
            await apiClient.post('/api/v1/user-service/auth/clear-session');
        } finally {
            // Disconnect WebSocket when clearing session
            if (webSocketService) {
                console.log('🔌 Disconnecting WebSocket on session clear...');
                webSocketService.disconnect();
            }
            
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
    }), [user, auth, isAuthenticated, loading, error]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext)!;


