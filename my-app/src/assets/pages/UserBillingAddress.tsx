import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/userService';
import apiClient from '../../services/apiClient';

const UserBillingAddress: React.FC = () => {
  const [address, setAddress] = useState<components['schemas']['BillingAddressDto'] | null>(null);
  const [form, setForm] = useState<components['schemas']['BillingAddressRequest']>({ address: '', city: '', postalCode: '', state: '', province: '', countryRegion: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/api/v1/user-service/users/me/billing-address');
        setAddress(res.data.data);
        setForm({
          address: res.data.data.address || '',
          city: res.data.data.city || '',
          postalCode: res.data.data.postalCode || '',
          state: res.data.data.state || '',
          province: res.data.data.province || '',
          countryRegion: res.data.data.countryRegion || '',
        });
      } catch (err: any) {
        setMessage('Không lấy được địa chỉ');
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, []);

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.put('/api/v1/user-service/users/me/billing-address', form);
      setMessage(res.data.message || 'Cập nhật địa chỉ thành công');
      setAddress(res.data.data);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Cập nhật địa chỉ thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/user-service/users/me/billing-address', form);
      setMessage(res.data.message || 'Tạo địa chỉ thành công');
      setAddress(res.data.data);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Tạo địa chỉ thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="font-bold text-xl mb-4">Billing Address</h2>
      {loading && <div className="text-blue-500">Đang xử lý...</div>}
      {message && <div className="text-red-500 mb-2">{message}</div>}
      <form onSubmit={address ? handleUpdateAddress : handleCreateAddress} className="space-y-4">
        <input type="text" placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <input type="text" placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <input type="text" placeholder="Postal Code" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <input type="text" placeholder="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <input type="text" placeholder="Province" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <input type="text" placeholder="Country/Region" value={form.countryRegion} onChange={e => setForm(f => ({ ...f, countryRegion: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{address ? 'Cập nhật địa chỉ' : 'Tạo địa chỉ'}</button>
      </form>
    </div>
  );
};

export default UserBillingAddress;
