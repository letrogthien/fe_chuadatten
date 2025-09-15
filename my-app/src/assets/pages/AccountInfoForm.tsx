import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/userService';
import { useUser } from '../../context/UserContext';
import apiClient from '../../services/apiClient';
import defaultAvatar from '../img/pepe-png-45798.png';

const AccountInfoForm: React.FC = () => {
    const [userInf, setUserInf] = useState<components['schemas']['UserInfDto'] | null>(null);
    const [form, setForm] = useState<components['schemas']['UpdateUserRequest']>({});
    // Không cần avatarFile nữa
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

    const handleUpdateAvatar = async (file: File) => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);
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

    // Xây dựng url ảnh nếu có avatarUrl
    let avatarSrc = defaultAvatar;
    if (userInf?.avatarUrl) {
        // Giả sử avatarUrl có dạng: folder/id/fileName
            avatarSrc = userInf.avatarUrl;

    }

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="font-bold text-xl mb-4">User Infor</h2>
            <div className="flex justify-center mb-6">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                    <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border hover:opacity-80 transition"
                        onError={e => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                    />
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                        const file = e.target.files?.[0] || null;
                        if (file) handleUpdateAvatar(file);
                    }}
                />
            </div>
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
            {/* Đã chuyển input file lên avatar, không cần input riêng */}
        </div>
    );
};

export default AccountInfoForm;
