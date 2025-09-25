import React, { useEffect, useState } from 'react';
import type { paths } from '../../api-types/userService';
import { userServiceClient } from '../../services/apiClient';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

type UserListResponse = paths['/api/v1/user-service/admin/users']['get']['responses']['200']['content']['*/*'];
type UserStatsResponse = paths['/api/v1/user-service/admin/users/stats']['get']['responses']['200']['content']['*/*'];
type LoginHistoryResponse = paths['/api/v1/user-service/admin/login-history/{userId}']['get']['responses']['200']['content']['*/*'];

// Interface for user data structure from API

interface UserFilters {
  role: string;
  accountStatus: string;
  kycStatus: string;
  riskLevel: string;
  isEmailVerified: string;
  isPhoneVerified: string;
  searchText: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const AdminUserManagement: React.FC = () => {
  const [userData, setUserData] = useState<any>({ users: [], statistics: null });
  const [userStats, setUserStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLoginHistory, setUserLoginHistory] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    accountStatus: '',
    kycStatus: '',
    riskLevel: '',
    isEmailVerified: '',
    isPhoneVerified: '',
    searchText: ''
  });

  // Load user data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadUserStats(), loadUserData()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await userServiceClient.get('/admin/users');
      console.log('Users API Response:', response.data);
      
      if (response.data?.data) {
        setUserData({ 
          users: response.data.data.content || response.data.data || [],
          statistics: userStats // Use userStats from the stats API
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await userServiceClient.get('/admin/users/stats');
      console.log('Stats API Response:', response.data);
      
      if (response.data?.data) {
        setUserStats(response.data.data);
        // Update userData with statistics
        setUserData((prev: any) => ({
          ...prev,
          statistics: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      alert('Không thể tải thống kê người dùng. Vui lòng thử lại.');
    }
  };

  const loadUserLoginHistory = async (userId: string) => {
    try {
      const response = await userServiceClient.get(`/admin/login-history/${userId}`);
      if (response.data?.data) {
        setUserLoginHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error loading login history:', error);
    }
  };



  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'USER': 'bg-blue-100 text-blue-800',
      'SELLER': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-purple-100 text-purple-800'
    };

    const roleLabels: { [key: string]: string } = {
      'USER': 'Khách hàng',
      'SELLER': 'Người bán',
      'ADMIN': 'Quản trị'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {roleLabels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (accountStatus: string) => {
    const statusColors: { [key: string]: string } = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'SUSPENDED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    };

    const statusLabels: { [key: string]: string } = {
      'ACTIVE': 'Hoạt động',
      'SUSPENDED': 'Tạm khóa',
      'PENDING': 'Chờ duyệt'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[accountStatus] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[accountStatus] || accountStatus}
      </span>
    );
  };

  const getKycBadge = (kycStatus: string) => {
    const kycColors: { [key: string]: string } = {
      'VERIFIED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'NOT_SUBMITTED': 'bg-gray-100 text-gray-800'
    };

    const kycLabels: { [key: string]: string } = {
      'VERIFIED': 'Đã xác thực',
      'PENDING': 'Chờ duyệt',
      'REJECTED': 'Bị từ chối',
      'NOT_SUBMITTED': 'Chưa gửi'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${kycColors[kycStatus] || 'bg-gray-100 text-gray-800'}`}>
        {kycLabels[kycStatus] || kycStatus}
      </span>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskColors: { [key: string]: string } = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-red-100 text-red-800',
      'SYSTEM': 'bg-purple-100 text-purple-800'
    };

    const riskLabels: { [key: string]: string } = {
      'LOW': 'Thấp',
      'MEDIUM': 'Trung bình',
      'HIGH': 'Cao',
      'SYSTEM': 'Hệ thống'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskColors[riskLevel] || 'bg-gray-100 text-gray-800'}`}>
        {riskLabels[riskLevel] || riskLevel}
      </span>
    );
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      setLoading(true);
      await userServiceClient.post(`/admin/users/${userId}/suspend`, {
        reason: reason
      });
      alert(`Đã tạm khóa người dùng: ${userId}\nLý do: ${reason}`);
      setShowSuspensionModal(false);
      setSuspensionReason('');
      // Reload user data
      loadUserData();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Có lỗi xảy ra khi tạm khóa người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      setLoading(true);
      await userServiceClient.post(`/admin/users/${userId}/approve`);
      alert(`Đã kích hoạt người dùng: ${userId}`);
      // Reload user data
      loadUserData();
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Có lỗi xảy ra khi kích hoạt người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
      try {
        setLoading(true);
        await userServiceClient.delete(`/admin/users/${userId}`);
        alert(`Đã xóa người dùng: ${userId}`);
        // Reload user data
        loadUserData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Có lỗi xảy ra khi xóa người dùng');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetail = async (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    // Load login history for this user
    if (user.id) {
      await loadUserLoginHistory(user.id);
    }
  };

  const openSuspensionModal = (user: any) => {
    setSelectedUser(user);
    setShowSuspensionModal(true);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Lọc và sắp xếp người dùng
  const filteredUsers = (userData?.users || [])
    .filter((user: any) => {
      // Text search
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const searchMatch = 
          (user.fullName || '').toLowerCase().includes(searchLower) ||
          (user.username || user.displayName || '').toLowerCase().includes(searchLower) ||
          (user.email || '').toLowerCase().includes(searchLower) ||
          (user.phoneNumber || '').toLowerCase().includes(searchLower);
        if (!searchMatch) return false;
      }
      
      // Other filters
      if (filters.role && user.role !== filters.role) return false;
      if (filters.accountStatus && user.accountStatus !== filters.accountStatus) return false;
      if (filters.kycStatus && user.kycStatus !== filters.kycStatus) return false;
      if (filters.riskLevel && user.riskLevel !== filters.riskLevel) return false;
      if (filters.isEmailVerified === 'true' && !user.isEmailVerified) return false;
      if (filters.isEmailVerified === 'false' && user.isEmailVerified) return false;
      if (filters.isPhoneVerified === 'true' && !user.isPhoneVerified) return false;
      if (filters.isPhoneVerified === 'false' && user.isPhoneVerified) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      if (!sortConfig.key) return 0;
      
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested properties like sellerInfo.rating
      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const clearFilters = () => {
    setFilters({
      role: '',
      accountStatus: '',
      kycStatus: '',
      riskLevel: '',
      isEmailVerified: '',
      isPhoneVerified: '',
      searchText: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
              <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium">
                📊 Xuất báo cáo
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
                + Thêm người dùng
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Tổng</p>
                <p className="text-xl font-semibold text-gray-900">
                  {userStats?.totalUsers || userData?.statistics?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Hoạt động</p>
                <p className="text-xl font-semibold text-green-600">
                  {userStats?.activeUsers || userData?.statistics?.activeUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">🚫</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Tạm khóa</p>
                <p className="text-xl font-semibold text-red-600">
                  {userStats?.suspendedUsers || userData?.statistics?.suspendedUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🛡️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">KYC</p>
                <p className="text-xl font-semibold text-purple-600">
                  {userStats?.verifiedUsers || userData?.statistics?.verifiedUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🛒</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Khách hàng</p>
                <p className="text-xl font-semibold text-blue-600">
                  {userStats?.totalCustomers || userData?.statistics?.totalCustomers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🏪</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Người bán</p>
                <p className="text-xl font-semibold text-green-600">
                  {userStats?.totalSellers || userData?.statistics?.totalSellers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">👑</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Admin</p>
                <p className="text-xl font-semibold text-indigo-600">
                  {userStats?.totalAdmins || userData?.statistics?.totalAdmins || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">📈</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Mới/tháng</p>
                <p className="text-xl font-semibold text-yellow-600">
                  {userStats?.newUsersThisMonth || userData?.statistics?.newUsersThisMonth || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
          
          {/* Search Box */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tên, username, email, số điện thoại..."
              value={filters.searchText}
              onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả vai trò</option>
                <option value="USER">Khách hàng</option>
                <option value="SELLER">Người bán</option>
                <option value="ADMIN">Quản trị</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filters.accountStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, accountStatus: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="SUSPENDED">Tạm khóa</option>
                <option value="PENDING">Chờ duyệt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">KYC</label>
              <select
                value={filters.kycStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, kycStatus: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả KYC</option>
                <option value="VERIFIED">Đã xác thực</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rủi ro</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả mức độ</option>
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <select
                value={filters.isEmailVerified}
                onChange={(e) => setFilters(prev => ({ ...prev, isEmailVerified: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả email</option>
                <option value="true">Đã xác thực</option>
                <option value="false">Chưa xác thực</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Điện thoại</label>
              <select
                value={filters.isPhoneVerified}
                onChange={(e) => setFilters(prev => ({ ...prev, isPhoneVerified: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả SĐT</option>
                <option value="true">Đã xác thực</option>
                <option value="false">Chưa xác thực</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Danh sách người dùng 
                {!loading && (
                  <span className="text-blue-600">
                    ({filteredUsers.length})
                  </span>
                )}
              </h3>
              <div className="text-sm text-gray-500">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Đang tải...
                  </div>
                ) : (
                  <>
                    <span>Hiển thị {filteredUsers.length} / {userData?.users?.length || 0} người dùng</span>
                    {filters.searchText && (
                      <span className="ml-2 text-blue-600">
                        (Tìm kiếm: "{filters.searchText}")
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải dữ liệu người dùng...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Người dùng</span>
                      {sortConfig.key === 'fullName' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Vai trò</span>
                      {sortConfig.key === 'role' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xác thực
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thống kê
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('accountStatus')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Trạng thái</span>
                      {sortConfig.key === 'accountStatus' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('registrationDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Hoạt động</span>
                      {sortConfig.key === 'registrationDate' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.fullName || 'N/A'}</p>
                        <p className="text-sm text-gray-500">@{user.username || user.displayName || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{user.email || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{user.phoneNumber || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                      {user.sellerInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.sellerInfo.storeName}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Email:</span>
                          <span className={`text-xs ${user.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                            {user.isEmailVerified ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">SĐT:</span>
                          <span className={`text-xs ${user.isPhoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                            {user.isPhoneVerified ? '✓' : '✗'}
                          </span>
                        </div>
                        <div>{getKycBadge(user.kycStatus)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <p><span className="text-gray-500">Mua:</span> {user.totalPurchases || 0}</p>
                        <p><span className="text-gray-500">Chi:</span> {formatCurrency(user.totalSpent || 0)}</p>
                        {user.sellerInfo && (
                          <>
                            <p><span className="text-gray-500">Bán:</span> {user.sellerInfo.totalSales || 0}</p>
                            <p><span className="text-gray-500">Thu:</span> {formatCurrency(user.sellerInfo.totalEarnings || 0)}</p>
                            <p><span className="text-gray-500">Đánh giá:</span> ⭐ {user.sellerInfo.rating || 'N/A'}</p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(user.accountStatus)}
                        {getRiskBadge(user.riskLevel)}
                        {user.suspensionReason && (
                          <p className="text-xs text-red-600">
                            {user.suspensionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <p><span className="text-gray-500">Tham gia:</span></p>
                        <p>{formatDate(user.registrationDate)}</p>
                        <p><span className="text-gray-500">Truy cập:</span></p>
                        <p>{formatDate(user.lastLoginDate)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(user)}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Xem
                        </button>
                        {user.accountStatus === 'ACTIVE' && user.role !== 'ADMIN' && (
                          <button
                            onClick={() => openSuspensionModal(user)}
                            className="text-yellow-600 hover:text-yellow-500 text-sm font-medium"
                          >
                            Khóa
                          </button>
                        )}
                        {user.accountStatus === 'SUSPENDED' && (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600 hover:text-green-500 text-sm font-medium"
                          >
                            Mở khóa
                          </button>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-500 text-sm font-medium"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy người dùng</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc để xem các người dùng khác</p>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-gray-900">Chi tiết người dùng</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Họ tên:</span>
                          <p className="text-sm font-medium text-gray-900">{selectedUser.fullName}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Username:</span>
                          <p className="text-sm text-gray-900">@{selectedUser.username}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Email:</span>
                          <p className="text-sm text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Điện thoại:</span>
                          <p className="text-sm text-gray-900">{selectedUser.phoneNumber}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Vai trò:</span>
                          <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Trạng thái tài khoản</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Trạng thái:</span>
                          <div className="mt-1">{getStatusBadge(selectedUser.accountStatus)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">KYC:</span>
                          <div className="mt-1">{getKycBadge(selectedUser.kycStatus)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Mức độ rủi ro:</span>
                          <div className="mt-1">{getRiskBadge(selectedUser.riskLevel)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Email xác thực:</span>
                          <p className={`text-sm font-medium ${selectedUser.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedUser.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">SĐT xác thực:</span>
                          <p className={`text-sm font-medium ${selectedUser.isPhoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedUser.isPhoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Statistics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Thống kê mua hàng</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Tổng đơn hàng:</span>
                        <p className="text-lg font-semibold text-blue-600">{selectedUser.totalPurchases}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Tổng chi tiêu:</span>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedUser.totalSpent)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Giá trị trung bình:</span>
                        <p className="text-lg font-semibold text-purple-600">{formatCurrency(selectedUser.averageOrderValue)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  {selectedUser.sellerInfo && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin người bán</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-gray-500">Tên cửa hàng:</span>
                              <p className="text-sm font-medium text-gray-900">{selectedUser.sellerInfo.storeName}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Số sản phẩm:</span>
                              <p className="text-sm text-gray-900">{selectedUser.sellerInfo.productCount}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-gray-500">Đơn hàng đã bán:</span>
                              <p className="text-sm font-medium text-blue-600">{selectedUser.sellerInfo.totalSales}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Tổng doanh thu:</span>
                              <p className="text-sm font-medium text-green-600">{formatCurrency(selectedUser.sellerInfo.totalEarnings)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Đánh giá:</span>
                              <p className="text-sm text-gray-900">⭐ {selectedUser.sellerInfo.rating}/5</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Favorite Categories */}
                  {selectedUser.favoriteCategories.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Danh mục yêu thích</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.favoriteCategories.map((category: string, index: number) => (
                          <span key={index} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suspension Reason */}
                  {selectedUser.suspensionReason && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Lý do tạm khóa</h4>
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{selectedUser.suspensionReason}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <span className="text-sm text-gray-500">Ngày tham gia:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedUser.registrationDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Truy cập cuối:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedUser.lastLoginDate)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-6 mt-6 border-t">
                  <button
                    onClick={() => alert('Chuyển đến trang chỉnh sửa người dùng')}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  {selectedUser.accountStatus === 'ACTIVE' && selectedUser.role !== 'ADMIN' && (
                    <button
                      onClick={() => { setShowDetailModal(false); openSuspensionModal(selectedUser); }}
                      className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 font-medium"
                    >
                      Tạm khóa
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suspension Modal */}
        {showSuspensionModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tạm khóa người dùng</h3>
                  <button
                    onClick={() => { setShowSuspensionModal(false); setSuspensionReason(''); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Bạn đang tạm khóa tài khoản: <strong>{selectedUser.fullName}</strong> (@{selectedUser.username})
                  </p>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSuspendUser(selectedUser.id, suspensionReason); }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do tạm khóa <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      rows={4}
                      placeholder="Nhập lý do tạm khóa tài khoản..."
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium"
                      disabled={!suspensionReason.trim()}
                    >
                      Tạm khóa
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowSuspensionModal(false); setSuspensionReason(''); }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUserManagement;