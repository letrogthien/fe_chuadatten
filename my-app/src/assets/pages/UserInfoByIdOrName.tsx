import React, { useState } from 'react';
import type { components } from '../../api-types/userService';
import apiClient from '../../services/apiClient';

const UserInfoByIdOrName: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [user, setUser] = useState<components['schemas']['UserInfDto'] | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetById = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/user-service/users/id/${userId}`);
      setUser(res.data.data);
      setMessage('');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Không tìm thấy user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetByName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/user-service/users/name/${displayName}`);
      setUser(res.data.data);
      setMessage('');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Không tìm thấy user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="font-bold text-xl mb-4">Tìm User theo ID hoặc Display Name</h2>
      <form onSubmit={handleGetById} className="mb-4 space-y-2">
        <input type="text" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Tìm theo ID</button>
      </form>
      <form onSubmit={handleGetByName} className="mb-4 space-y-2">
        <input type="text" placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Tìm theo Display Name</button>
      </form>
      {loading && <div className="text-blue-500">Đang xử lý...</div>}
      {message && <div className="text-red-500 mb-2">{message}</div>}
      {user && (
        <ul className="space-y-1 mt-4">
          <li><b>ID:</b> {user.id}</li>
          <li><b>Display Name:</b> {user.displayName}</li>
          <li><b>Email:</b> {user.email}</li>
          <li><b>Country:</b> {user.country}</li>
          <li><b>Status:</b> {user.status}</li>
          <li><b>Seller:</b> {user.isSeller ? 'Seller' : 'User'}</li>
          <li><b>Bio:</b> {user.sellerBio}</li>
        </ul>
      )}
    </div>
  );
};

export default UserInfoByIdOrName;
