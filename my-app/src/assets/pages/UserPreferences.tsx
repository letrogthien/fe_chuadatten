import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/userService';
import apiClient from '../../services/apiClient';

const UserPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<components['schemas']['PreferenceDto'] | null>(null);
  const [form, setForm] = useState<components['schemas']['UpdatePreferenceRequest']>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/api/v1/user-service/users/me/preferences');
        setPreferences(res.data.data);
        setForm({
          notificationEmail: res.data.data.notificationEmail,
          notificationPush: res.data.data.notificationPush,
          preferredCurrency: res.data.data.preferredCurrency,
          preferredPlatform: res.data.data.preferredPlatform,
          privacyPublicProfile: res.data.data.privacyPublicProfile,
        });
      } catch (err: any) {
        setMessage('Không lấy được preferences');
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.put('/api/v1/user-service/users/me/preferences', form);
      setMessage(res.data.message || 'Cập nhật preferences thành công');
      setPreferences(res.data.data);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Cập nhật preferences thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="font-bold text-xl mb-4">User Preferences</h2>
      {loading && <div className="text-blue-500">Đang xử lý...</div>}
      {message && <div className="text-red-500 mb-2">{message}</div>}
      <form onSubmit={handleUpdatePreferences} className="space-y-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.notificationEmail || false} onChange={e => setForm(f => ({ ...f, notificationEmail: e.target.checked }))} />
          Nhận email thông báo
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.notificationPush || false} onChange={e => setForm(f => ({ ...f, notificationPush: e.target.checked }))} />
          Nhận push notification
        </label>
        <input type="text" placeholder="Preferred Currency" value={form.preferredCurrency || ''} onChange={e => setForm(f => ({ ...f, preferredCurrency: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <input type="text" placeholder="Preferred Platform" value={form.preferredPlatform || ''} onChange={e => setForm(f => ({ ...f, preferredPlatform: e.target.value }))} className="w-full border rounded px-3 py-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.privacyPublicProfile || false} onChange={e => setForm(f => ({ ...f, privacyPublicProfile: e.target.checked }))} />
          Public Profile
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Cập nhật Preferences</button>
      </form>
    </div>
  );
};

export default UserPreferences;
