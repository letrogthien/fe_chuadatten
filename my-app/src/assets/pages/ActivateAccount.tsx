import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAppNavigation from '../../hooks/useAppNavigation';
import apiClient from '../../services/apiClient';

const ActivateAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
    const { goToLogin } = useAppNavigation();
  const token = searchParams.get('token');

  const handleActivate = async () => {
    if (!token) {
      setMessage('Không tìm thấy token kích hoạt.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await apiClient.post(`/api/v1/user-service/auth/activate-account?token=${token}`);
      setMessage(res.data.message || 'Kích hoạt tài khoản thành công!');
      setStatus('success');
      goToLogin();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Kích hoạt thất bại.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Kích hoạt tài khoản</h2>
        {status === 'idle' && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl"
            onClick={handleActivate}
          >
            Kích hoạt ngay
          </button>
        )}
        {status === 'loading' && <div className="text-blue-600 font-semibold">Đang xử lý...</div>}
        {(status === 'success' || status === 'error') && (
          <div className={`mt-6 text-lg font-semibold ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
