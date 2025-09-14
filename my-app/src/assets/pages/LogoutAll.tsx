import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import apiClient from '../../services/apiClient';

const LogoutAll: React.FC = () => {
    const { logout } = useUser();
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogoutAll = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await apiClient.post('/api/v1/user-service/auth/logout-all');
            setMessage(res.data?.message || 'Logout all successful');
            await logout(); // Clear local session
        } catch (err: any) {
            setMessage(err?.response?.data?.message || 'Logout all failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                onClick={handleLogoutAll}
                disabled={loading}
            >
                Logout All Devices
            </button>
            {message && <div className="mt-4 text-lg">{message}</div>}
        </div>
    );
};

export default LogoutAll;
