import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';

const WebSocketStatus: React.FC = () => {
    const { isConnected } = useWebSocket();

    return (
        <div className="fixed top-20 right-4 z-40">
            <div className="relative">
                {/* Speaker/Notification Icon */}
                <div className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                    isConnected 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-400 text-gray-200'
                }`}>
                    <svg 
                        className="w-6 h-6" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        {/* Speaker Icon */}
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                </div>

                {/* Connection Indicator Dot */}
                {isConnected && (
                    <div className="absolute -top-1 -right-1">
                        <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse">
                            <div className="w-2 h-2 bg-green-300 rounded-full absolute top-1 left-1"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebSocketStatus;