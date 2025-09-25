import React, { useEffect, useState } from 'react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  currency: string;
  language: string;
  timezone: string;
  paymentMethods: {
    vnpay: boolean;
    momo: boolean;
    banking: boolean;
    wallet: boolean;
  };
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'GameMarket',
    siteDescription: 'Nền tảng mua bán game số #1 Việt Nam',
    contactEmail: 'support@gamemarket.vn',
    supportPhone: '1900-xxx-xxx',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: 10,
    sessionTimeout: 30,
    currency: 'VND',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    paymentMethods: {
      vnpay: true,
      momo: true,
      banking: true,
      wallet: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'system' | 'payment' | 'notifications'>('general');

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      setLoading(true);
      try {
        // API call to get settings
        // const response = await settingsService.getSettings();
        // setSettings(response.data);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call to save settings
      // await settingsService.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (method: keyof SystemSettings['paymentMethods'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Cài đặt chung', icon: '⚙️' },
    { id: 'system', name: 'Hệ thống', icon: '🖥️' },
    { id: 'payment', name: 'Thanh toán', icon: '💳' },
    { id: 'notifications', name: 'Thông báo', icon: '🔔' }
  ] as const;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cài đặt hệ thống</h1>
        <p className="text-gray-600">Quản lý các cài đặt toàn hệ thống</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Cài đặt chung</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên trang web
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả trang web
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại hỗ trợ
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.supportPhone}
                    onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền tệ
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Cài đặt hệ thống</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kích thước file tối đa (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.maxFileSize}
                    onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian session (phút)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Múi giờ
                </label>
                <select
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                >
                  <option value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</option>
                  <option value="Asia/Bangkok">GMT+7 (Thailand)</option>
                  <option value="Asia/Singapore">GMT+8 (Singapore)</option>
                </select>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Chế độ bảo trì</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                    Bật chế độ bảo trì (người dùng không thể truy cập trang web)
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Đăng ký tài khoản</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={settings.allowRegistration}
                    onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                  />
                  <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                    Cho phép người dùng đăng ký tài khoản mới
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Cài đặt thanh toán</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Phương thức thanh toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="vnpay"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={settings.paymentMethods.vnpay}
                      onChange={(e) => handlePaymentMethodChange('vnpay', e.target.checked)}
                    />
                    <div className="ml-3">
                      <label htmlFor="vnpay" className="text-sm font-medium text-gray-900">
                        VNPay
                      </label>
                      <p className="text-sm text-gray-500">Cổng thanh toán VNPay</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="momo"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={settings.paymentMethods.momo}
                      onChange={(e) => handlePaymentMethodChange('momo', e.target.checked)}
                    />
                    <div className="ml-3">
                      <label htmlFor="momo" className="text-sm font-medium text-gray-900">
                        MoMo
                      </label>
                      <p className="text-sm text-gray-500">Ví điện tử MoMo</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="banking"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={settings.paymentMethods.banking}
                      onChange={(e) => handlePaymentMethodChange('banking', e.target.checked)}
                    />
                    <div className="ml-3">
                      <label htmlFor="banking" className="text-sm font-medium text-gray-900">
                        Chuyển khoản ngân hàng
                      </label>
                      <p className="text-sm text-gray-500">Thanh toán qua chuyển khoản</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="wallet"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={settings.paymentMethods.wallet}
                      onChange={(e) => handlePaymentMethodChange('wallet', e.target.checked)}
                    />
                    <div className="ml-3">
                      <label htmlFor="wallet" className="text-sm font-medium text-gray-900">
                        Ví điện tử hệ thống
                      </label>
                      <p className="text-sm text-gray-500">Thanh toán bằng ví nội bộ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Cài đặt thông báo</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Thông báo Email</h3>
                    <p className="text-sm text-gray-500">Gửi thông báo qua email cho người dùng</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Thông báo SMS</h3>
                    <p className="text-sm text-gray-500">Gửi thông báo qua tin nhắn SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          {saved && (
            <div className="flex items-center text-green-600 mr-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Đã lưu thành công
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;