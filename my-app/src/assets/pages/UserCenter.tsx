import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import AccountSettings from './AccountSettings';

const SIDEBAR_ITEMS = [
  { key: 'buy', label: 'Buy', icon: '🛒' },
  { key: 'seller', label: 'Seller Center', icon: '🏪' },
  { key: 'dispute', label: 'Dispute Center', icon: '⚖️' },
  { key: 'ticket', label: 'Service Ticket', icon: '🎫' },
  { key: 'announcement', label: 'Announcement', icon: '📢' },
  { key: 'coupon', label: 'Coupon', icon: '🎟️' },
  { key: 'affiliate', label: 'Affiliate Program', icon: '🤝' },
  { key: 'settings', label: 'Settings', icon: '⚙️',
    children: [
      { key: 'account', label: 'Account Settings' },
      { key: 'security', label: 'Security Settings' },
      { key: 'cert', label: 'Certification Center', warning: true },
      { key: 'delete', label: 'Delete Account' },
    ]
  },
  { key: 'logout', label: 'Log Out', icon: '🚪' },
];

const UserCenter: React.FC = () => {
  const { logout, auth } = useUser();
  const [activeMain, setActiveMain] = useState('settings');
  const [activeSetting, setActiveSetting] = useState('account');
  const { goToLogin } = useAppNavigation();

  if (auth == null) {
    goToLogin();
    return null;
  }


  const logOut = () => {
    logout();
    goToLogin();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-8 px-4">
        <nav className="space-y-2">
          {SIDEBAR_ITEMS.map(item => (
            <div key={item.key}>
              {item.key === 'logout' ? (
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-800 hover:bg-red-100 transition"
                  onClick={logOut}
                >
                  <span className="text-xl text-gray-400">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </button>
              ) : (
                <>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-800 hover:bg-gray-100 transition ${activeMain === item.key ? (item.key === 'settings' ? 'bg-red-500 text-white' : 'bg-gray-200') : ''}`}
                    onClick={() => setActiveMain(item.key)}
                  >
                    <span className="text-xl text-gray-400">{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </button>
                  {/* Settings children */}
                  {item.key === 'settings' && activeMain === 'settings' && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children?.map(child => (
                        <button
                          key={child.key}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-gray-700 hover:text-blue-600 ${activeSetting === child.key ? 'bg-gray-100 font-bold' : ''}`}
                          onClick={() => setActiveSetting(child.key)}
                        >
                          <span>{child.label}</span>
                          {child.warning && <span className="ml-1 text-red-500 text-lg">•</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {activeMain === 'settings' && activeSetting === 'account' ? (
          <AccountSettings />
        ) : (
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 text-gray-400 text-center text-lg">Chọn một mục ở sidebar để xem nội dung</div>
        )}
      </main>
    </div>
  );
};

export default UserCenter;
