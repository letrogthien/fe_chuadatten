import React, { useState } from 'react';

interface ReportData {
  id: string;
  name: string;
  type: 'sales' | 'users' | 'products' | 'transactions';
  description: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
}

interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

const AdminReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'users' | 'products'>('overview');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: new Date().toISOString().split('T')[0]
  });

  const [availableReports, setAvailableReports] = useState<ReportData[]>([
    {
      id: 'sales-monthly',
      name: 'Báo cáo doanh thu tháng',
      type: 'sales',
      description: 'Báo cáo chi tiết doanh thu theo tháng',
      lastGenerated: '2024-01-15T10:30:00Z',
      status: 'ready'
    },
    {
      id: 'users-activity',
      name: 'Báo cáo hoạt động người dùng',
      type: 'users',
      description: 'Thống kê hoạt động và tương tác của người dùng',
      lastGenerated: '2024-01-14T15:45:00Z',
      status: 'ready'
    },
    {
      id: 'products-performance',
      name: 'Báo cáo hiệu suất sản phẩm',
      type: 'products',
      description: 'Phân tích hiệu suất bán hàng của từng sản phẩm',
      lastGenerated: '2024-01-13T09:20:00Z',
      status: 'generating'
    },
    {
      id: 'transactions-summary',
      name: 'Tổng quan giao dịch',
      type: 'transactions',
      description: 'Báo cáo tổng hợp các giao dịch trong hệ thống',
      lastGenerated: '2024-01-12T14:15:00Z',
      status: 'ready'
    }
  ]);

  // Mock sales data
  const [salesData] = useState<SalesReport>({
    totalRevenue: 25000000,
    totalOrders: 156,
    averageOrderValue: 160256,
    topProducts: [
      { name: 'Minecraft Premium Account', sales: 45, revenue: 22500000 },
      { name: 'Valorant Points 1000', sales: 32, revenue: 9600000 },
      { name: 'Steam Wallet 500k', sales: 28, revenue: 14000000 }
    ],
    dailySales: [
      { date: '2024-01-01', revenue: 1200000, orders: 8 },
      { date: '2024-01-02', revenue: 1800000, orders: 12 },
      { date: '2024-01-03', revenue: 2100000, orders: 15 },
      { date: '2024-01-04', revenue: 1600000, orders: 10 },
      { date: '2024-01-05', revenue: 2400000, orders: 18 }
    ]
  });

  const generateReport = async (reportId: string) => {
    setLoading(true);
    setAvailableReports(prev => prev.map(report =>
      report.id === reportId ? { ...report, status: 'generating' } : report
    ));

    // Simulate report generation
    setTimeout(() => {
      setAvailableReports(prev => prev.map(report =>
        report.id === reportId
          ? { ...report, status: 'ready', lastGenerated: new Date().toISOString() }
          : report
      ));
      setLoading(false);
    }, 3000);
  };

  const downloadReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    // Simulate download
    console.log(`Downloading report ${reportId} in ${format} format`);
    // In real implementation, this would trigger a file download
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: ReportData['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ReportData['status']) => {
    switch (status) {
      case 'ready':
        return 'Sẵn sàng';
      case 'generating':
        return 'Đang tạo';
      case 'error':
        return 'Lỗi';
      default:
        return status;
    }
  };

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: '📊' },
    { id: 'sales', name: 'Doanh thu', icon: '💰' },
    { id: 'users', name: 'Người dùng', icon: '👥' },
    { id: 'products', name: 'Sản phẩm', icon: '📦' }
  ] as const;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo và thống kê</h1>
        <p className="text-gray-600">Theo dõi và phân tích dữ liệu kinh doanh</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Cập nhật
          </button>
        </div>
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Tổng doanh thu</h3>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(salesData.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">🛒</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
                  <p className="text-2xl font-semibold text-gray-900">{salesData.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Giá trị TB/đơn</h3>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(salesData.averageOrderValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Tăng trưởng</h3>
                  <p className="text-2xl font-semibold text-gray-900">+12.5%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Reports */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Báo cáo có sẵn</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {availableReports.map((report) => (
                <div key={report.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">{report.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cập nhật lần cuối: {formatDate(report.lastGenerated)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.status === 'ready' && (
                        <>
                          <button
                            onClick={() => downloadReport(report.id, 'pdf')}
                            className="text-sm text-blue-600 hover:text-blue-900"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => downloadReport(report.id, 'excel')}
                            className="text-sm text-green-600 hover:text-green-900"
                          >
                            Excel
                          </button>
                          <button
                            onClick={() => downloadReport(report.id, 'csv')}
                            className="text-sm text-purple-600 hover:text-purple-900"
                          >
                            CSV
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => generateReport(report.id)}
                        disabled={report.status === 'generating' || loading}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {report.status === 'generating' ? 'Đang tạo...' : 'Tạo mới'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sản phẩm bán chạy</h3>
              <div className="space-y-4">
                {salesData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} đã bán</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Sales Chart Placeholder */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Doanh thu theo ngày</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl">📈</span>
                  <p className="text-gray-500 mt-2">Biểu đồ doanh thu theo ngày</p>
                  <p className="text-sm text-gray-400">Cần tích hợp thư viện chart</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Báo cáo người dùng</h3>
          <div className="text-center py-12">
            <span className="text-6xl">👥</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Báo cáo người dùng</h3>
            <p className="text-gray-500 mt-2">Thống kê hoạt động và tương tác của người dùng</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Tạo báo cáo
            </button>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Báo cáo sản phẩm</h3>
          <div className="text-center py-12">
            <span className="text-6xl">📦</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Báo cáo sản phẩm</h3>
            <p className="text-gray-500 mt-2">Phân tích hiệu suất và xu hướng sản phẩm</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Tạo báo cáo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;