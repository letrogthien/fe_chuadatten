import ReactDOM from 'react-dom/client';
import App from './App';
import { UserProvider } from './context/UserContext';
import { WebSocketProvider } from './context/WebSocketContext';
import './index.css';

// Import WebSocket test utility for development

ReactDOM.createRoot(document.getElementById('root')!).render(
    <WebSocketProvider>
        <UserProvider>
            <App />
        </UserProvider>
    </WebSocketProvider>
);


