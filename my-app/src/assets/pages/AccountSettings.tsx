import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/userService';
import { useUser } from '../../context/UserContext';
import apiClient from '../../services/apiClient';
import UserBillingAddress from './UserBillingAddress';
import UserPreferences from './UserPreferences';



const AccountSettings: React.FC = () => {
    const [userInf, setUserInf] = useState<components['schemas']['UserInfDto'] | null>(null);
    const [form, setForm] = useState<components['schemas']['UpdateUserRequest']>({});
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (user == null) {
            setUserInf(null);
            setForm({});
            return;
        }
        setUserInf(user);
        setForm({
            displayName: user.displayName,
            email: user.email,
            country: user.country,
            status: user.status as components['schemas']['UpdateUserRequest']['status'],
            sellerBio: user.sellerBio,

        });
    }, [user]);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiClient.put('/api/v1/user-service/users/me', form);
            setMessage(res.data.message || 'Cập nhật thành công');
            setUserInf(res.data.data);
        } catch (err: any) {
            setMessage(err?.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAvatar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!avatarFile) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        try {
            const res = await apiClient.post('/api/v1/user-service/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(res.data.message || 'Cập nhật avatar thành công');
            setUserInf(res.data.data);
        } catch (err: any) {
            setMessage(err?.response?.data?.message || 'Cập nhật avatar thất bại');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-xl mb-4">Account Settings</h2>
            {loading && <div className="text-blue-500">Đang xử lý...</div>}
            {message && <div className="text-red-500 mb-2">{message}</div>}
            <form onSubmit={handleUpdateInfo} className="space-y-4">
                <input
                    type="text"
                    placeholder="Display Name"
                    value={form.displayName || ''}
                    onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email || ''}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    placeholder="Country"
                    value={form.country || ''}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                />
                
                <textarea
                    placeholder="Seller Bio"
                    value={form.sellerBio || ''}
                    onChange={e => setForm(f => ({ ...f, sellerBio: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Cập nhật thông tin</button>
            </form>
            <form onSubmit={handleUpdateAvatar} className="mt-6">
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                    className="mb-2"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Cập nhật Avatar</button>
            </form>
            {userInf?.avatarUrl && (
                <img src={userInf.avatarUrl} alt="Avatar" className="mt-4 w-24 h-24 rounded-full object-cover" />
            )}
            <UserPreferences />
            <UserBillingAddress />
        </div>
    );
};

export default AccountSettings;
