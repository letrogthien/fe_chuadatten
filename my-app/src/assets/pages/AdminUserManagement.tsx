import React, { useState } from 'react';

// Sample data cho user management
const sampleUserData = {
  users: [
    {
      id: "user-001",
      username: "gamer_pro_2024",
      email: "gamer.pro@email.com",
      fullName: "Nguyễn Văn Anh",
      phoneNumber: "+84987654321",
      role: "USER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      registrationDate: "2024-01-15T10:30:00Z",
      lastLoginDate: "2024-12-20T14:25:00Z",
      totalPurchases: 15,
      totalSpent: 12500000,
      averageOrderValue: 833333,
      favoriteCategories: ["Liên Quân Mobile", "PUBG Mobile"],
      accountStatus: "ACTIVE",
      kycStatus: "VERIFIED",
      riskLevel: "LOW"
    },
    {
      id: "user-002",
      username: "mobile_legend_king",
      email: "ml.king@email.com", 
      fullName: "Trần Thị Bình",
      phoneNumber: "+84912345678",
      role: "USER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      registrationDate: "2024-02-20T09:15:00Z",
      lastLoginDate: "2024-12-19T16:40:00Z",
      totalPurchases: 8,
      totalSpent: 3200000,
      averageOrderValue: 400000,
      favoriteCategories: ["Free Fire", "Liên Quân Mobile"],
      accountStatus: "ACTIVE",
      kycStatus: "PENDING",
      riskLevel: "MEDIUM"
    },
    {
      id: "user-003",
      username: "steam_collector",
      email: "steam.collector@email.com",
      fullName: "Lê Minh Hoàng",
      phoneNumber: "+84923456789",
      role: "SELLER",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      registrationDate: "2024-01-10T14:20:00Z",
      lastLoginDate: "2024-12-18T11:30:00Z",
      totalPurchases: 45,
      totalSpent: 28900000,
      averageOrderValue: 642222,
      favoriteCategories: ["Steam Games", "Valorant"],
      accountStatus: "ACTIVE",
      kycStatus: "VERIFIED",
      riskLevel: "LOW",
      sellerInfo: {
        storeName: "PC Game Store",
        totalSales: 89,
        totalEarnings: 15600000,
        rating: 4.6,
        productCount: 25
      }
    },
    {
      id: "user-004",
      username: "ff_diamond_shop",
      email: "ff.diamond@email.com",
      fullName: "Phạm Thanh Tùng",
      phoneNumber: "+84934567890",
      role: "SELLER",
      isActive: false,
      isEmailVerified: true,
      isPhoneVerified: true,
      registrationDate: "2024-03-05T16:45:00Z",
      lastLoginDate: "2024-12-10T08:20:00Z",
      totalPurchases: 3,
      totalSpent: 890000,
      averageOrderValue: 296667,
      favoriteCategories: ["Free Fire"],
      accountStatus: "SUSPENDED",
      kycStatus: "REJECTED",
      riskLevel: "HIGH",
      sellerInfo: {
        storeName: "FF Kingdom",
        totalSales: 156,
        totalEarnings: 8900000,
        rating: 4.2,
        productCount: 12
      },
      suspensionReason: "Vi phạm quy định bán hàng nhiều lần"
    },
    {
      id: "user-005",
      username: "admin_system",
      email: "admin@gamemarket.com",
      fullName: "Admin System",
      phoneNumber: "+84900000000",
      role: "ADMIN",
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      registrationDate: "2024-01-01T00:00:00Z",
      lastLoginDate: "2024-12-20T09:15:00Z",
      totalPurchases: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      favoriteCategories: [],
      accountStatus: "ACTIVE",
      kycStatus: "VERIFIED",
      riskLevel: "SYSTEM"
    }
  ],
  statistics: {
    totalUsers: 5,
    activeUsers: 4,
    suspendedUsers: 1,
    verifiedUsers: 3,
    totalCustomers: 2,
    totalSellers: 2,
    totalAdmins: 1,
    newUsersThisMonth: 12,
    totalRevenue: 45490000
  }
};

interface UserFilters {
  role: string;
  accountStatus: string;
  kycStatus: string;
  riskLevel: string;
  isEmailVerified: string;
  isPhoneVerified: string;
}

const AdminUserManagement: React.FC = () => {
  const [userData] = useState(sampleUserData);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    accountStatus: '',
    kycStatus: '',
    riskLevel: '',
    isEmailVerified: '',
    isPhoneVerified: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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
    console.log('Suspending user:', userId, reason);
    // Gọi API suspend user
    alert(`Đã tạm khóa người dùng: ${userId}\nLý do: ${reason}`);
    setShowSuspensionModal(false);
    setSuspensionReason('');
  };

  const handleActivateUser = async (userId: string) => {
    console.log('Activating user:', userId);
    // Gọi API activate user
    alert(`Đã kích hoạt người dùng: ${userId}`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
      console.log('Deleting user:', userId);
      // Gọi API delete user
      alert(`Đã xóa người dùng: ${userId}`);
    }
  };

  const handleViewDetail = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const openSuspensionModal = (user: any) => {
    setSelectedUser(user);
    setShowSuspensionModal(true);
  };

  // Lọc người dùng dựa trên filters
  const filteredUsers = userData.users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.accountStatus && user.accountStatus !== filters.accountStatus) return false;
    if (filters.kycStatus && user.kycStatus !== filters.kycStatus) return false;
    if (filters.riskLevel && user.riskLevel !== filters.riskLevel) return false;
    if (filters.isEmailVerified === 'true' && !user.isEmailVerified) return false;
    if (filters.isEmailVerified === 'false' && user.isEmailVerified) return false;
    if (filters.isPhoneVerified === 'true' && !user.isPhoneVerified) return false;
    if (filters.isPhoneVerified === 'false' && user.isPhoneVerified) return false;
    return true;
  });

  const clearFilters = () => {
    setFilters({
      role: '',
      accountStatus: '',
      kycStatus: '',
      riskLevel: '',
      isEmailVerified: '',
      isPhoneVerified: ''
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
                  {userData.statistics.totalUsers}
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
                  {userData.statistics.activeUsers}
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
                  {userData.statistics.suspendedUsers}
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
                  {userData.statistics.verifiedUsers}
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
                  {userData.statistics.totalCustomers}
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
                  {userData.statistics.totalSellers}
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
                  {userData.statistics.totalAdmins}
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
                  {userData.statistics.newUsersThisMonth}
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
                Danh sách người dùng ({filteredUsers.length})
              </h3>
              <div className="text-sm text-gray-500">
                Hiển thị {filteredUsers.length} / {userData.users.length} người dùng
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xác thực
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thống kê
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.phoneNumber}</p>
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
                        <p><span className="text-gray-500">Mua:</span> {user.totalPurchases}</p>
                        <p><span className="text-gray-500">Chi:</span> {formatCurrency(user.totalSpent)}</p>
                        {user.sellerInfo && (
                          <>
                            <p><span className="text-gray-500">Bán:</span> {user.sellerInfo.totalSales}</p>
                            <p><span className="text-gray-500">Thu:</span> {formatCurrency(user.sellerInfo.totalEarnings)}</p>
                            <p><span className="text-gray-500">Đánh giá:</span> ⭐ {user.sellerInfo.rating}</p>
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
          
          {filteredUsers.length === 0 && (
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