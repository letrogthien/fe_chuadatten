import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import AccountSettings from './AccountSettings';
import BecomeSellerWizard from './BecomeSellerWizard';
import CertificationTab from './CertificationTab';
import DisputeManagement from './DisputeManagement';
import OrderHistory from './OrderHistory';
import RefundManagement from './RefundManagement';
import SecurityTab from './SecurityTab';
import SellerDashboard from './SellerDashboard';
import UserInfo from './UserInfo';


const SIDEBAR_ITEMS = [
  { 
    key: 'buy', 
    label: 'Buy', 
    icon: '🛒',
    children: [
      { key: 'orders', label: 'Lịch sử đơn hàng' },
      { key: 'refunds', label: 'Quản lý hoàn tiền' },
      { key: 'disputes', label: 'Quản lý tranh chấp' },
    ]
  },
  { key: 'seller', label: 'Seller Center', icon: '🏪' },
  { key: 'dispute', label: 'Dispute Center', icon: '⚖️' },
  { key: 'ticket', label: 'Service Ticket', icon: '🎫' },
  { key: 'announcement', label: 'Announcement', icon: '📢' },
  { key: 'coupon', label: 'Coupon', icon: '🎟️' },
  { key: 'affiliate', label: 'Affiliate Program', icon: '🤝' },
  { key: 'user-info', label: 'User Information', icon: '👤' },
  {
    key: 'settings', label: 'Settings', icon: '⚙️',
    children: [
      { key: 'account', label: 'Account Settings' },
      { key: 'security', label: 'Security Settings' },
      { key: 'cert', label: 'Certification Center', warning: true },
    ]
  },
  { key: 'logout', label: 'Log Out', icon: '🚪' },
];

const UserCenter: React.FC = () => {
  const { logout, auth, user } = useUser();
  const [activeMain, setActiveMain] = useState('buy');
  const [activeSetting, setActiveSetting] = useState('account');
  const [activeBuy, setActiveBuy] = useState('orders');
  const { goToLogin } = useAppNavigation();
  const location = useLocation();

  // Handle navigation state to directly show KYC settings
  useEffect(() => {
    const state = location.state as { activeTab?: string; activeSection?: string } | null;
    if (state?.activeTab === 'settings') {
      setActiveMain('settings');
      if (state?.activeSection === 'cert') {
        setActiveSetting('cert');
      }
    }
  }, [location.state]);

  if (auth == null) {
    goToLogin();
    return null;
  }


  const logOut = () => {
    logout();
    goToLogin();
  };

  const getButtonClass = (item: any) => {
    const baseClass = "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-800 hover:bg-gray-100 transition";
    if (activeMain === item.key) {
      if (item.key === 'settings') {
        return `${baseClass} bg-red-500 text-white`;
      }
      return `${baseClass} bg-gray-200`;
    }
    return baseClass;
  };

  const renderMainContent = () => {
    // Buy section content
    if (activeMain === 'buy') {
      switch (activeBuy) {
        case 'orders':
          return <OrderHistory />;
        case 'refunds':
          return <RefundManagement />;
        case 'disputes':
          return <DisputeManagement />;
        default:
          return <OrderHistory />;
      }
    }
    
    // Seller section content
    if (activeMain === 'seller') {
      // Check if user is seller or has completed KYC
      const isSeller = user?.isSeller || false;
      const hasKyc = false; // Based on your data, user.isKyc is not available in current response
      
      if (!isSeller && !hasKyc) {
        // Show "Become Seller" wizard for non-sellers without KYC
        return <BecomeSellerWizard />;
      } else if (isSeller) {
        // Show seller dashboard for existing sellers
        return <SellerDashboard />;
      } else {
        // User has KYC but not seller yet
        return (
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 text-gray-400 text-center text-lg">
            Seller Registration - Đang phát triển
          </div>
        );
      }
    }
    
    // User Info section content
    if (activeMain === 'user-info') {
      return <UserInfo />;
    }
    
    // Settings section content
    if (activeMain === 'settings') {
      switch (activeSetting) {
        case 'account':
          return <AccountSettings />;
        case 'security':
          return <SecurityTab />;
        case 'cert':
          return <CertificationTab />;
        default:
          return <AccountSettings />;
      }
    }
    
    // Default content for other sections
    return (
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 text-gray-400 text-center text-lg">
        Chọn một mục ở sidebar để xem nội dung
      </div>
    );
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
                    className={getButtonClass(item)}
                    onClick={() => setActiveMain(item.key)}
                  >
                    <span className="text-xl text-gray-400">{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </button>
                  {/* Buy children */}
                  {item.key === 'buy' && activeMain === 'buy' && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children?.map(child => (
                        <button
                          key={child.key}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-gray-700 hover:text-blue-600 ${
                            activeBuy === child.key ? 'bg-gray-100 font-bold' : ''
                          }`}
                          onClick={() => setActiveBuy(child.key)}
                        >
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Settings children */}
                  {item.key === 'settings' && activeMain === 'settings' && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children?.map(child => (
                        <button
                          key={child.key}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left text-gray-700 hover:text-blue-600 ${
                            activeSetting === child.key ? 'bg-gray-100 font-bold' : ''
                          }`}
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
        {renderMainContent()}
      </main>
    </div>
  );
};

export default UserCenter;
