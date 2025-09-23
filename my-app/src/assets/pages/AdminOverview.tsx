import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Sample data cho admin overview
const sampleAdminData = {
  overview: {
    totalUsers: 15847,
    totalProducts: 3428,
    totalOrders: 8954,
    totalRevenue: 2847000000,
    monthlyGrowth: {
      users: 12.5,
      products: 8.3,
      orders: 15.7,
      revenue: 22.4
    }
  },
  recentActivities: [
    {
      id: "activity-001",
      type: "ORDER",
      title: "Đơn hàng mới #ORD-2024-001547",
      description: "Người dùng @gamer_pro_2024 đã đặt mua tài khoản Liên Quân VIP",
      amount: 2500000,
      timestamp: "2024-12-20T14:25:00Z",
      status: "SUCCESS"
    },
    {
      id: "activity-002", 
      type: "REFUND",
      title: "Yêu cầu hoàn tiền #REF-2024-000892",
      description: "Người dùng @mobile_legend_king yêu cầu hoàn tiền đơn hàng",
      amount: 450000,
      timestamp: "2024-12-20T13:15:00Z",
      status: "PENDING"
    },
    {
      id: "activity-003",
      type: "USER",
      title: "Tài khoản mới đăng ký",
      description: "Người dùng @new_gamer_2024 đã tạo tài khoản",
      amount: 0,
      timestamp: "2024-12-20T12:45:00Z",
      status: "SUCCESS"
    },
    {
      id: "activity-004",
      type: "PRODUCT",
      title: "Sản phẩm mới được thêm",
      description: "Người bán @pc_game_store thêm sản phẩm Steam Key Cyberpunk 2077",
      amount: 890000,
      timestamp: "2024-12-20T11:20:00Z",
      status: "SUCCESS"
    },
    {
      id: "activity-005",
      type: "DISPUTE",
      title: "Tranh chấp mới #DIS-2024-000234",
      description: "Tranh chấp giữa người mua và người bán về chất lượng tài khoản",
      amount: 1200000,
      timestamp: "2024-12-20T10:30:00Z",
      status: "OPEN"
    }
  ],
  systemHealth: {
    serverStatus: "HEALTHY",
    databaseStatus: "HEALTHY",
    paymentGateway: "HEALTHY",
    apiResponseTime: 245,
    uptime: 99.98,
    errorRate: 0.02
  },
  quickStats: {
    pendingOrders: 23,
    pendingRefunds: 8,
    openDisputes: 5,
    pendingKyc: 12,
    lowStockProducts: 34,
    suspendedUsers: 3
  },
  topCategories: [
    { name: "Liên Quân Mobile", orders: 2456, revenue: 890000000 },
    { name: "PUBG Mobile", orders: 1834, revenue: 650000000 },
    { name: "Free Fire", orders: 1567, revenue: 520000000 },
    { name: "Steam Games", orders: 1234, revenue: 780000000 },
    { name: "Valorant", orders: 567, revenue: 340000000 }
  ],
  topSellers: [
    { name: "GameShop Pro", sales: 445, revenue: 156000000, rating: 4.8 },
    { name: "Mobile Gaming Store", sales: 334, revenue: 98000000, rating: 4.9 },
    { name: "PC Game Store", sales: 289, revenue: 134000000, rating: 4.6 },
    { name: "FF Kingdom", sales: 267, revenue: 89000000, rating: 4.7 },
    { name: "Game Paradise", sales: 198, revenue: 76000000, rating: 4.5 }
  ]
};

const AdminOverview: React.FC = () => {
  const [adminData] = useState(sampleAdminData);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'ORDER': '🛒',
      'REFUND': '💸',
      'USER': '👤',
      'PRODUCT': '📦',
      'DISPUTE': '⚠️'
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'SUCCESS': 'text-green-600',
      'PENDING': 'text-yellow-600',
      'OPEN': 'text-red-600',
      'FAILED': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
      'HEALTHY': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoạt động tốt' },
      'WARNING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Cảnh báo' },
      'ERROR': { bg: 'bg-red-100', text: 'text-red-800', label: 'Lỗi' }
    };
    
    const config = statusConfig[status] || statusConfig['HEALTHY'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRankingStyle = (index: number): string => {
    if (index === 0) return 'bg-yellow-100 text-yellow-800';
    if (index === 1) return 'bg-gray-100 text-gray-800';
    if (index === 2) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getRankingIcon = (index: number): string => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  return (
    <div className="bg-gray-50">
      <main className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {adminData.overview.totalUsers.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-lg">{getGrowthIcon(adminData.overview.monthlyGrowth.users)}</span>
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(adminData.overview.monthlyGrowth.users)}`}>
                    +{adminData.overview.monthlyGrowth.users}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
                <p className="text-3xl font-bold text-gray-900">
                  {adminData.overview.totalProducts.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-lg">{getGrowthIcon(adminData.overview.monthlyGrowth.products)}</span>
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(adminData.overview.monthlyGrowth.products)}`}>
                    +{adminData.overview.monthlyGrowth.products}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {adminData.overview.totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-lg">{getGrowthIcon(adminData.overview.monthlyGrowth.orders)}</span>
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(adminData.overview.monthlyGrowth.orders)}`}>
                    +{adminData.overview.monthlyGrowth.orders}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-2xl">🛒</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(adminData.overview.totalRevenue / 1000000000).toFixed(1)}B VND
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-lg">{getGrowthIcon(adminData.overview.monthlyGrowth.revenue)}</span>
                  <span className={`text-sm font-medium ml-1 ${getGrowthColor(adminData.overview.monthlyGrowth.revenue)}`}>
                    +{adminData.overview.monthlyGrowth.revenue}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">so với tháng trước</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">👥</span>
                  <span className="text-sm font-medium text-gray-900">Quản lý người dùng</span>
                </div>
                <span className="text-xs text-blue-600">→</span>
              </Link>
              
              <Link
                to="/admin/products"
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">📦</span>
                  <span className="text-sm font-medium text-gray-900">Quản lý sản phẩm</span>
                </div>
                <span className="text-xs text-green-600">→</span>
              </Link>
              
              <Link
                to="/admin/orders"
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">🛒</span>
                  <span className="text-sm font-medium text-gray-900">Quản lý đơn hàng</span>
                </div>
                <span className="text-xs text-yellow-600">→</span>
              </Link>
              
              <Link
                to="/admin/refunds"
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">💸</span>
                  <span className="text-sm font-medium text-gray-900">Xử lý hoàn tiền</span>
                </div>
                <span className="text-xs text-red-600">→</span>
              </Link>
              
              <Link
                to="/admin/categories"
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">📁</span>
                  <span className="text-sm font-medium text-gray-900">Quản lý danh mục</span>
                </div>
                <span className="text-xs text-purple-600">→</span>
              </Link>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái hệ thống</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server</span>
                {getStatusBadge(adminData.systemHealth.serverStatus)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                {getStatusBadge(adminData.systemHealth.databaseStatus)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                {getStatusBadge(adminData.systemHealth.paymentGateway)}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <span className="text-sm font-medium text-gray-900">{adminData.systemHealth.apiResponseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">{adminData.systemHealth.uptime}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-red-600">{adminData.systemHealth.errorRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cần xử lý</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm text-gray-600">Đơn hàng chờ duyệt</span>
                <span className="text-sm font-bold text-yellow-600">{adminData.quickStats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm text-gray-600">Yêu cầu hoàn tiền</span>
                <span className="text-sm font-bold text-red-600">{adminData.quickStats.pendingRefunds}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span className="text-sm text-gray-600">Tranh chấp mở</span>
                <span className="text-sm font-bold text-orange-600">{adminData.quickStats.openDisputes}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm text-gray-600">KYC chờ duyệt</span>
                <span className="text-sm font-bold text-blue-600">{adminData.quickStats.pendingKyc}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                <span className="text-sm text-gray-600">Sản phẩm sắp hết</span>
                <span className="text-sm font-bold text-purple-600">{adminData.quickStats.lowStockProducts}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Tài khoản bị khóa</span>
                <span className="text-sm font-bold text-gray-600">{adminData.quickStats.suspendedUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities & Top Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
              <Link to="/admin/activities" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {adminData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{formatDate(activity.timestamp)}</span>
                      {activity.amount > 0 && (
                        <span className="text-xs font-medium text-green-600">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`text-xs font-medium ${getActivityColor(activity.status)}`}>
                      ●
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Danh mục hàng đầu</h3>
              <Link to="/admin/analytics" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Xem chi tiết
              </Link>
            </div>
            <div className="space-y-4">
              {adminData.topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.orders} đơn hàng</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {(category.revenue / 1000000).toFixed(0)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Người bán hàng đầu</h3>
              <Link to="/admin/sellers" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ranking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminData.topSellers.map((seller, index) => (
                  <tr key={seller.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankingStyle(index)}`}>
                          {index + 1}
                        </div>
                        {getRankingIcon(index) && <span className="ml-2 text-lg">{getRankingIcon(index)}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{seller.sales}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(seller.revenue)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">⭐ {seller.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminOverview;