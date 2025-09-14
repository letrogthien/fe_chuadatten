
  // ...existing handlers (handleChangePassword, handleEnable2FA, handleDisable2FA, handleUpdateInfo, handleUpdateAvatar)...
  import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
const MODULES = [
  {
    key: 'changePassword',
    icon: '🔒',
    color: 'bg-orange-400',
    title: 'Đổi mật khẩu',
    links: [ { key: 'changePassword', label: 'Đổi mật khẩu' } ],
  },
  {
    key: 'twoFA',
    icon: '🛡️',
    color: 'bg-red-500',
    title: 'Bảo mật 2 lớp (2FA)',
    links: [
      { key: 'enable2FA', label: 'Bật 2FA' },
      { key: 'disable2FA', label: 'Tắt 2FA' },
      { key: 'verify2FA', label: 'Xác thực 2FA' },
    ],
  },
  {
    key: 'updateInfo',
    icon: '📝',
    color: 'bg-blue-600',
    title: 'Cập nhật thông tin',
    links: [ { key: 'updateInfo', label: 'Cập nhật thông tin' } ],
  },
  {
    key: 'updateAvatar',
    icon: '🖼️',
    color: 'bg-purple-600',
    title: 'Cập nhật avatar',
    links: [ { key: 'updateAvatar', label: 'Cập nhật avatar' } ],
  },
  {
    key: 'preferences',
    icon: '⚙️',
    color: 'bg-green-500',
    title: 'Cài đặt thông báo & ưu tiên',
    links: [ { key: 'updatePreferences', label: 'Cập nhật ưu tiên' } ],
  },
  {
    key: 'billing',
    icon: '🏦',
    color: 'bg-yellow-500',
    title: 'Địa chỉ thanh toán',
    links: [ { key: 'updateBilling', label: 'Cập nhật địa chỉ' } ],
  },
  {
    key: 'kyc',
    icon: '📄',
    color: 'bg-cyan-500',
    title: 'Xác thực KYC',
    links: [ { key: 'submitKYC', label: 'Gửi xác thực KYC' } ],
  },
  {
    key: 'seller',
    icon: '💼',
    color: 'bg-indigo-500',
    title: 'Đăng ký Seller & Đánh giá',
    links: [
      { key: 'submitSeller', label: 'Đăng ký Seller' },
      { key: 'viewSellerRating', label: 'Xem đánh giá Seller' },
    ],
  },
];

const UserInfo: React.FC = () => {
  const { user, logout, loading } = useUser();
  const { goHome } = useAppNavigation();

  // Remove unused states for now, will add back when integrating API actions
  const [selectedAction, setSelectedAction] = useState<string>('');

  if (!user) {
    return <div className="p-8 text-center text-red-500">Không có thông tin người dùng.</div>;
  }

  const handleLogout = async () => {
    await logout();
    goHome();
  };




  return (
    <div className="min-h-screen bg-[#f5f5f7] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: User info */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col h-fit">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-white text-xl">🧑</span>
              <span className="font-bold text-lg text-gray-800">Tài khoản</span>
            </div>
            <ul className="space-y-1 mb-4">
              <li className="flex justify-between text-gray-700"><span>Display Name</span><span>{user.displayName || '-'}</span></li>
              <li className="flex justify-between text-gray-700"><span>Email</span><span>{user.email || '-'}</span></li>
              <li className="flex justify-between text-gray-700"><span>Country</span><span>{user.country || '-'}</span></li>
              <li className="flex justify-between text-gray-700"><span>Status</span><span>{user.status || '-'}</span></li>
              <li className="flex justify-between text-gray-700"><span>Seller</span><span>{user.isSeller ? 'Seller' : 'User'}</span></li>
              <li className="flex justify-between text-gray-700"><span>Bio</span><span>{user.sellerBio || '-'}</span></li>
              <li className="flex justify-between text-gray-700"><span>Created</span><span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></li>
              <li className="flex justify-between text-gray-700"><span>Updated</span><span>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '-'}</span></li>
            </ul>
            <button className="mt-auto w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl shadow transition-colors duration-200 text-base" onClick={handleLogout} disabled={loading}>
              {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </div>

          {/* Center: List of module cards */}
          <div className="flex flex-col gap-6">
            {MODULES.map((mod) => (
              <div key={mod.key} className="bg-white rounded-xl shadow p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${mod.color} text-white text-xl`}>{mod.icon}</span>
                  <span className="font-bold text-lg text-gray-800">{mod.title}</span>
                </div>
                <ul className="space-y-1">
                  {mod.links.map((link) => (
                    <li key={link.key}>
                      <button
                        className={`w-full text-left text-gray-700 hover:text-blue-600 px-2 py-1 rounded transition ${selectedAction === link.key ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedAction(link.key)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
