import React, { useState } from 'react';
import type { components } from '../../api-types/userService';
import { useUser } from '../../context/UserContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import apiClient from '../../services/apiClient';

interface TwoFAProps {
    tmpToken: string;
    onSuccess: (accessToken: string, refreshToken: string) => void;
}

const TwoFA: React.FC<TwoFAProps> = ({ tmpToken, onSuccess }) => {
    const { refresh } = useUser();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { goHome } = useAppNavigation();




    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const body: components['schemas']['Verify2FaRequest'] = { otp, secret: tmpToken };
            const res = await apiClient.post('/api/v1/user-service/auth/verify-2fa', body);
            const { accessToken, refreshToken } = res.data.data;
            setMessage(res.data.message || 'Xác thực thành công');
            onSuccess(accessToken, refreshToken);
            goHome();
            window.location.reload();
        } catch (err: any) {
            setMessage(err?.response?.data?.message || 'Xác thực thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8 mt-10">
            <h2 className="font-bold text-xl mb-4">Xác thực 2 bước (OTP)</h2>
            <form onSubmit={handleVerify} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading || !otp}>
                    Xác thực
                </button>
                {message && <div className="text-red-500 mt-2">{message}</div>}
            </form>
        </div>
    );
};

export default TwoFA;
