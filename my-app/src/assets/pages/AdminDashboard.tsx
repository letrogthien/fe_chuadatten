import React, { useState } from 'react';

// Sample data cho admin dashboard
const sampleDashboardData = {
  overview: {
    totalOrders: 2847,
    totalRevenue: 1250000000, // VND
    totalProducts: 1205,
    totalUsers: 15623,
    pendingRefunds: 23,
    activeDisputes: 8,
    outOfStock: 45,
    ordersToday: 127
  },
  recentOrders: [
    {
      id: "ORD-2024-001",
      buyerName: "Nguyễn Văn A",
      total: 2500000,
      status: "COMPLETED",
      createdAt: "2024-12-24T10:30:00Z",
      items: 3
    },
    {
      id: "ORD-2024-002", 
      buyerName: "Trần Thị B",
      total: 1200000,
      status: "PROCESSING",
      createdAt: "2024-12-24T09:15:00Z",
      items: 2
    },
    {
      id: "ORD-2024-003",
      buyerName: "Lê Văn C", 
      total: 850000,
      status: "PENDING",
      createdAt: "2024-12-24T08:45:00Z",
      items: 1
    }
  ],
  pendingRefunds: [
    {
      id: "REF-2024-001",
      orderId: "ORD-2024-001",
      buyerName: "Nguyễn Văn A",
      amount: 500000,
      reason: "Sản phẩm không đúng mô tả",
      createdAt: "2024-12-23T14:20:00Z",
      status: "PENDING"
    },
    {
      id: "REF-2024-002",
      orderId: "ORD-2024-005", 
      buyerName: "Phạm Thị D",
      amount: 1200000,
      reason: "Giao hàng chậm",
      createdAt: "2024-12-23T11:30:00Z",
      status: "PENDING"
    }
  ],
  activeDisputes: [
    {
      id: "DIS-2024-001",
      orderId: "ORD-2024-007",
      buyerName: "Võ Văn E",
      issueType: "NOT_DELIVERED",
      description: "Đã 7 ngày chưa nhận được hàng",
      status: "OPENED",
      createdAt: "2024-12-22T16:00:00Z"
    },
    {
      id: "DIS-2024-002",
      orderId: "ORD-2024-012",
      buyerName: "Hoàng Thị F", 
      issueType: "ITEM_INVALID",
      description: "Tài khoản game bị khóa",
      status: "OPENED",
      createdAt: "2024-12-22T12:30:00Z"
    }
  ]
};

const AdminDashboard: React.FC = () => {
  const [dashboardData] = useState(sampleDashboardData);

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'PROCESSING': 'bg-blue-100 text-blue-800', 
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'OPENED': 'bg-red-100 text-red-800'
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Xin chào, Admin</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🛒</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.overview.totalOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(dashboardData.overview.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Refunds */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hoàn tiền chờ duyệt</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.overview.pendingRefunds}
                </p>
              </div>
            </div>
          </div>

          {/* Active Disputes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">🚨</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tranh chấp đang mở</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.overview.activeDisputes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{order.id}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{order.buyerName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-medium text-green-600">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Xem tất cả đơn hàng →
                </button>
              </div>
            </div>
          </div>

          {/* Pending Refunds */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Hoàn tiền chờ duyệt</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.pendingRefunds.map((refund) => (
                  <div key={refund.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{refund.id}</p>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        PENDING
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{refund.buyerName}</p>
                    <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-medium text-red-600">{formatCurrency(refund.amount)}</p>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200">
                          Phê duyệt
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200">
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Xem tất cả yêu cầu hoàn tiền →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Disputes */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Tranh chấp đang mở</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.activeDisputes.map((dispute) => (
                <div key={dispute.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{dispute.id}</p>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          {dispute.issueType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Đơn hàng: {dispute.orderId} - {dispute.buyerName}</p>
                      <p className="text-sm text-gray-600 mt-1">{dispute.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(dispute.createdAt)}</p>
                    </div>
                    <div className="ml-4">
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                        Giải quyết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Xem tất cả tranh chấp →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;