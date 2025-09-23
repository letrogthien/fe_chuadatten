import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface PayUrlMessage {
    url: string;
    type: string;
}

export class WebSocketService {
    private client: Client | null = null;
    private connected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // 1 second
    private baseUrl: string;
    private shouldReconnect = false; // Add flag to control reconnection
    private authenticationFailed = false; // Flag to track auth failures

    constructor(baseUrl: string = 'https://notify.wezd.io.vn/') {
        this.baseUrl = baseUrl;
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.subscribeToUserNotifications = this.subscribeToUserNotifications.bind(this);
    }

    private getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    }





    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Reset auth failure flag when manually connecting
                this.authenticationFailed = false;
                
                this.client = new Client({
                    webSocketFactory: () => {
                        console.log('🏭 Creating SockJS connection to:', `${this.baseUrl}ws`);
                        const socket = new SockJS(`${this.baseUrl}ws`, null, {
                            // Ensure cookies are sent in handshake
                            transports: ['websocket', 'xhr-streaming', 'xhr-polling']
                        });
                        return socket;
                    },
                    connectHeaders: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    debug: (str) => {
                        console.log('📊 STOMP Debug:', str);
                    },
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    reconnectDelay: this.reconnectDelay,
                });

                // Set up connection handlers
                this.client.onConnect = (frame: any) => {
                    console.log('✅ STOMP connected successfully!', frame);
                    console.log('🔑 Connection headers sent:', frame.headers);
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.authenticationFailed = false;
                    this.shouldReconnect = true; // Enable reconnect after successful connection
                    resolve();
                };

                this.client.onStompError = (frame: any) => {
                    console.error('❌ STOMP error:', frame);
                    console.error('📄 Error frame headers:', frame.headers);
                    this.connected = false;
                    
                    // Check if error is related to authentication
                    const errorMessage = frame.headers?.message || 'STOMP connection error';
                    if (errorMessage.includes('Access token not found') || 
                        errorMessage.includes('Authentication') || 
                        errorMessage.includes('Unauthorized')) {
                        console.log('🚫 Authentication failed - disabling auto-reconnect');
                        this.authenticationFailed = true;
                        this.shouldReconnect = false;
                    }
                    
                    reject(new Error(`STOMP error: ${errorMessage}`));
                };

                this.client.onWebSocketClose = (event: any) => {
                    console.log('🔌 WebSocket connection closed:', event);
                    this.connected = false;
                    this.handleReconnect();
                };

                this.client.onWebSocketError = (error: any) => {
                    console.error('💥 WebSocket error:', error);
                    this.connected = false;
                    reject(new Error(error?.message || 'WebSocket error'));
                };

                // Activate the client
                console.log('🚀 Activating STOMP client...');
                this.client.activate();

            } catch (error) {
                console.error('❌ Failed to create WebSocket connection:', error);
                reject(new Error(error instanceof Error ? error.message : 'Connection failed'));
            }
        });
    }

    disconnect(): void {
        if (this.client && this.connected) {
            this.client.deactivate();
            this.connected = false;
            this.shouldReconnect = false; // Disable reconnect when manually disconnecting
            console.log('WebSocket disconnected');
        }
    }

    private handleReconnect(): void {
        // Only reconnect if:
        // 1. Reconnect is enabled (shouldReconnect = true)
        // 2. Authentication didn't fail
        // 3. Haven't exceeded max attempts
        if (!this.shouldReconnect || this.authenticationFailed) {
            console.log('🚫 Auto-reconnect disabled (shouldReconnect:', this.shouldReconnect, ', authFailed:', this.authenticationFailed, ')');
            return;
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.shouldReconnect = false;
        }
    }

    // Method to enable reconnection (called when user authenticates)
    enableReconnect(): void {
        console.log('✅ Enabling WebSocket auto-reconnect');
        this.shouldReconnect = true;
        this.authenticationFailed = false;
        this.reconnectAttempts = 0;
    }

    // Method to disable reconnection (called when auth fails)
    disableReconnect(): void {
        console.log('🚫 Disabling WebSocket auto-reconnect');
        this.shouldReconnect = false;
        this.authenticationFailed = true;
    }

    subscribeToUserNotifications(
        userId: string, 
        onMessage: (message: PayUrlMessage) => void,
        onError?: (error: Error) => void
    ): (() => void) | null {
        if (!this.client || !this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        try {
            // Get access token for subscription headers
            
            console.log(`Subscribing to user notifications for user: ${userId}`);
            
            // Subscribe to user-specific queue
            const subscription = this.client.subscribe(
                `/user/queue/notify`,
                (message: any) => {
                    try {
                        console.log('Raw message received:', message.body);
                        const data = JSON.parse(message.body) as PayUrlMessage;
                        console.log('Parsed message:', data);
                        
                        // Check if this is a payment URL notification
                        if (data.type === 'PAY_URL' && data.url) {
                            onMessage(data);
                        }
                    } catch (error) {
                        console.error('Error parsing message:', error);
                        onError?.(new Error('Failed to parse message'));
                    }
                },
                {

                }
            );

            console.log(`Subscribed to user notifications for user: ${userId}`);

            // Return unsubscribe function
            return () => {
                subscription.unsubscribe();
                console.log(`Unsubscribed from user notifications for user: ${userId}`);
            };

        } catch (error) {
            console.error('Failed to subscribe to user notifications:', error);
            onError?.(new Error('Failed to subscribe to notifications'));
            return null;
        }
    }

    subscribeToGeneralNotifications(
        onMessage: (message: any) => void,
        onError?: (error: Error) => void
    ): (() => void) | null {
        if (!this.client || !this.connected) {
            console.error('WebSocket not connected');
            return null;
        }

        try {
            const subscription = this.client.subscribe(
                '/topic/notify',
                (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        onMessage(data);
                    } catch (error) {
                        console.error('Error parsing general message:', error);
                        onError?.(new Error('Failed to parse general message'));
                    }
                }
            );

            console.log('Subscribed to general notifications');

            return () => {
                subscription.unsubscribe();
                console.log('Unsubscribed from general notifications');
            };

        } catch (error) {
            console.error('Failed to subscribe to general notifications:', error);
            onError?.(new Error('Failed to subscribe to general notifications'));
            return null;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    sendMessage(destination: string, body: any, headers: Record<string, string> = {}): void {
        if (!this.client || !this.connected) {
            console.error('WebSocket not connected');
            return;
        }

        try {
            this.client.publish({
                destination,
                body: JSON.stringify(body),
                headers
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

export const getWebSocketService = (baseUrl?: string): WebSocketService => {
    webSocketService ??= new WebSocketService(baseUrl);
    return webSocketService;
};

export default WebSocketService;