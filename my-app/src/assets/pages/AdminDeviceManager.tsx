import React, { useEffect, useState } from 'react';
import { userServiceClient } from '../../services/apiClient';
import { formatDate } from '../../utils/dateUtils';

interface Device {
  id: string;
  userId: string;
  username: string;
  deviceName: string;
  deviceType: string;
  lastLoginAt: string;
  createdAt: string;
}

const AdminDeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await userServiceClient.get('/admin/devices');
      console.log('Devices API Response:', response.data);
      
      if (response.data?.data) {
        setDevices(response.data.data.content || response.data.data || []);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      alert('Không thể tải danh sách thiết bị. Vui lòng thử lại.');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      setLoading(true);
      await userServiceClient.post(`/admin/devices/${deviceId}/revoke`);
      alert('Thiết bị đã được thu hồi thành công!');
      setShowRevokeModal(false);
      setSelectedDevice(null);
      loadDevices();
    } catch (error) {
      console.error('Error revoking device:', error);
      alert('Có lỗi xảy ra khi thu hồi thiết bị');
    } finally {
      setLoading(false);
    }
  };



  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return '📱';
      case 'desktop':
        return '🖥️';
      case 'tablet':
        return '📴';
      default:
        return '💻';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Thiết bị</h1>
        <p className="text-gray-600">Xem và thu hồi thiết bị đăng nhập của người dùng</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách thiết bị</h2>
            <button
              onClick={loadDevices}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Tải lại'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Đang tải...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có thiết bị nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thiết bị
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đăng nhập cuối
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tạo lúc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((device) => (
                    <tr key={device.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getDeviceIcon(device.deviceType)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{device.deviceName}</div>
                            <div className="text-sm text-gray-500">ID: {device.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{device.username}</div>
                        <div className="text-sm text-gray-500">ID: {device.userId.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {device.deviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {device.lastLoginAt ? formatDate(device.lastLoginAt) : 'Chưa đăng nhập'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(device.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowRevokeModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Thu hồi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && selectedDevice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Thu hồi thiết bị</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn thu hồi thiết bị này? Người dùng sẽ bị đăng xuất khỏi thiết bị này.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                  <div className="text-sm">
                    <div><span className="font-medium">Tên thiết bị:</span> {selectedDevice.deviceName}</div>
                    <div><span className="font-medium">Loại:</span> {selectedDevice.deviceType}</div>
                    <div><span className="font-medium">Người dùng:</span> {selectedDevice.username}</div>
                  </div>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 mr-4 hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleRevokeDevice(selectedDevice.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? '...' : 'Thu hồi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeviceManager;