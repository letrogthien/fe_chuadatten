import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { WebSocketService } from '../services/webSocketService';

interface WebSocketContextType {
    webSocketService: WebSocketService | null;
    isConnected: boolean;
    connectionError: string | null;
    reconnect: () => void;
    forceConnect: () => void;
    enableReconnect: () => void;
    disableReconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [webSocketService] = useState(() => new WebSocketService('https://notify.wezd.io.vn/'));
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const connectWebSocket = async () => {
        try {
            console.log('🔄 Attempting WebSocket connection...');
            setConnectionError(null);
            
            await webSocketService.connect();
            setIsConnected(true);
            console.log('✅ WebSocket connected successfully!');
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            setConnectionError(errorMessage);
            setIsConnected(false);
            
            // Log error but don't auto-retry
            if (errorMessage.includes('Access token not found')) {
                console.log('⚠️ No access token - WebSocket connection failed');
            } else {
                console.log('⚠️ WebSocket connection failed - manual retry required');
            }
        }
    };

    const reconnect = () => {
        console.log('🔄 Manual reconnect triggered...');
        connectWebSocket();
    };

    const forceConnect = () => {
        console.log('🔄 Force connect triggered (user logged in)...');
        webSocketService.enableReconnect(); // Enable reconnect when forcing connection
        connectWebSocket();
    };

    const enableReconnect = () => {
        console.log('✅ Enabling WebSocket reconnect...');
        webSocketService.enableReconnect();
    };

    const disableReconnect = () => {
        console.log('🚫 Disabling WebSocket reconnect...');
        webSocketService.disableReconnect();
    };

    useEffect(() => {
        // Không tự động kết nối WebSocket khi app khởi động
        // Chỉ kết nối khi UserContext gọi forceConnect() sau /me thành công
        console.log('🚀 WebSocket service initialized, waiting for authentication...');

        // Cleanup khi component unmount
        return () => {
            console.log('🧹 Cleaning up WebSocket connection...');
            webSocketService.disconnect();
            setIsConnected(false);
        };
    }, [webSocketService]);

    // Monitor connection status
    useEffect(() => {
        const interval = setInterval(() => {
            const currentStatus = webSocketService.isConnected();
            if (currentStatus !== isConnected) {
                console.log(`📊 Connection status changed: ${currentStatus ? 'Connected' : 'Disconnected'}`);
                setIsConnected(currentStatus);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [webSocketService, isConnected]);

    const value: WebSocketContextType = useMemo(() => ({
        webSocketService,
        isConnected,
        connectionError,
        reconnect,
        forceConnect,
        enableReconnect,
        disableReconnect,
    }), [webSocketService, isConnected, connectionError, reconnect, forceConnect, enableReconnect, disableReconnect]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export default WebSocketContext;