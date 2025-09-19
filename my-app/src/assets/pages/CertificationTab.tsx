
import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/userService';
import apiClient from '../../services/apiClient';
import VerificationForm from './VerificationForm';

const CertificationTab: React.FC = () => {
  const [kyc, setKyc] = useState<components['schemas']['UserVerificationDto'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchKyc = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/api/v1/user-service/kyc/me');
        setKyc(res.data.data);
      } catch (err: any) {
        if (err?.response?.status === 400) {
          setShowForm(true);
        } else {
          setError(err?.response?.data?.message || 'Không lấy được thông tin KYC');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchKyc();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    setError('');
    setLoading(true);
    apiClient.get('/api/v1/user-service/kyc/me').then(res => {
      setKyc(res.data.data);
    }).catch(err => {
      setError('Không lấy được thông tin KYC');
    }).finally(() => setLoading(false));
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-8">
      <h2 className="font-bold text-xl mb-6">Certification Center (KYC)</h2>
      {loading && <div className="text-blue-500">Đang tải thông tin KYC...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {showForm ? (
        <VerificationForm onSuccess={handleSuccess} />
      ) : kyc ? (
        <div className="space-y-2">
          <div><b>Trạng thái:</b> {kyc.verificationStatus}</div>
          <div><b>Ngày xác thực:</b> {kyc.verifiedAt ? new Date(kyc.verifiedAt).toLocaleString() : 'Chưa xác thực'}</div>
          <div><b>Ngày tạo:</b> {kyc.createdAt ? new Date(kyc.createdAt).toLocaleString() : ''}</div>
          <div><b>Ngày cập nhật:</b> {kyc.updatedAt ? new Date(kyc.updatedAt).toLocaleString() : ''}</div>
          {/* Có thể bổ sung hiển thị ảnh/giấy tờ nếu cần */}
        </div>
      ) : !loading && !error ? (
        <div className="text-gray-500">Chưa có thông tin KYC cho tài khoản này.</div>
      ) : null}
    </div>
  );
};

export default CertificationTab;
