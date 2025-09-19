import React, { useState } from 'react';
import apiClient from '../../services/apiClient';

const VerificationForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [faceIdFrontUrl, setFaceIdFrontUrl] = useState<File | null>(null);
  const [documentFrontUrl, setDocumentFrontUrl] = useState<File | null>(null);
  const [documentBackUrl, setDocumentBackUrl] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      if (faceIdFrontUrl) formData.append('faceIdFrontUrl', faceIdFrontUrl);
      if (documentFrontUrl) formData.append('documentFrontUrl', documentFrontUrl);
      if (documentBackUrl) formData.append('documentBackUrl', documentBackUrl);
      const res = await apiClient.post('/api/v1/user-service/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 200) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gửi xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block font-semibold mb-1">Ảnh khuôn mặt (faceIdFrontUrl)</label>
        <input type="file" accept="image/*" onChange={e => setFaceIdFrontUrl(e.target.files?.[0] || null)} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Ảnh mặt trước giấy tờ (documentFrontUrl)</label>
        <input type="file" accept="image/*" onChange={e => setDocumentFrontUrl(e.target.files?.[0] || null)} />
      </div>
      <div>
        <label className="block font-semibold mb-1">Ảnh mặt sau giấy tờ (documentBackUrl)</label>
        <input type="file" accept="image/*" onChange={e => setDocumentBackUrl(e.target.files?.[0] || null)} />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi xác thực'}
      </button>
    </form>
  );
};

export default VerificationForm;
