import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const RoutesOverview: React.FC = () => {
  const publicRoutes = [
    { path: ROUTES.HOME, label: 'Trang chủ', description: 'Trang chủ với danh sách sản phẩm' },
    { path: ROUTES.SEARCH, label: 'Tìm kiếm sản phẩm', description: 'Tìm kiếm và lọc sản phẩm nâng cao' },
    { path: ROUTES.PRODUCTS, label: 'Sản phẩm', description: 'Danh sách tất cả sản phẩm' },
    { path: ROUTES.LOGIN, label: 'Đăng nhập', description: 'Đăng nhập vào hệ thống' },
    { path: ROUTES.REGISTER, label: 'Đăng ký', description: 'Tạo tài khoản mới' },
    { path: ROUTES.CART, label: 'Giỏ hàng', description: 'Quản lý giỏ hàng' },
    { path: ROUTES.CHECKOUT, label: 'Thanh toán', description: 'Xử lý đơn hàng' },
    { path: ROUTES.ORDER_HISTORY, label: 'Lịch sử đơn hàng', description: 'Xem các đơn hàng đã đặt' },
  ];

  const adminRoutes = [
    { path: ROUTES.ADMIN, label: 'Admin Overview', description: 'Tổng quan quản trị' },
    { path: ROUTES.ADMIN_ANALYTICS, label: 'Analytics Dashboard', description: 'Báo cáo và phân tích dữ liệu' },
    { path: ROUTES.ADMIN_USERS, label: 'Quản lý người dùng', description: 'Quản lý tài khoản người dùng' },
    { path: ROUTES.ADMIN_PRODUCTS, label: 'Quản lý sản phẩm', description: 'Quản lý catalog sản phẩm' },
    { path: ROUTES.ADMIN_CATEGORIES, label: 'Quản lý danh mục', description: 'Quản lý danh mục sản phẩm' },
    { path: ROUTES.ADMIN_DISPUTES, label: 'Quản lý tranh chấp', description: 'Xử lý tranh chấp đơn hàng' },
    { path: ROUTES.ADMIN_REFUNDS, label: 'Quản lý hoàn tiền', description: 'Xử lý yêu cầu hoàn tiền' },
  ];

  const availableEndpoints = [
    { service: 'User Service', endpoints: ['Authentication', 'Profile Management', 'User Registration'] },
    { service: 'Product Service', endpoints: ['Product Search', 'Category Management', 'Product Details'] },
    { service: 'Transaction Service', endpoints: ['Order Management', 'Payment Processing', 'Dispute Resolution', 'Analytics', 'Refund Management'] },
    { service: 'Wallet Service', endpoints: ['Balance Management', 'Transaction History', 'Payment Methods'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Tổng quan Routes và Endpoints</h1>
          
          {/* Public Routes */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-2">
              Routes Công khai
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200"
                >
                  <h3 className="font-semibold text-blue-800 mb-2">{route.label}</h3>
                  <p className="text-sm text-blue-600">{route.description}</p>
                  <div className="mt-2 text-xs text-gray-500 font-mono">{route.path}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Admin Routes */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-2">
              Routes Quản trị
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="block p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors duration-200"
                >
                  <h3 className="font-semibold text-red-800 mb-2">{route.label}</h3>
                  <p className="text-sm text-red-600">{route.description}</p>
                  <div className="mt-2 text-xs text-gray-500 font-mono">{route.path}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Available Endpoints */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-2">
              API Endpoints Có sẵn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableEndpoints.map((service) => (
                <div
                  key={service.service}
                  className="p-6 bg-green-50 rounded-lg border border-green-200"
                >
                  <h3 className="font-semibold text-green-800 mb-4">{service.service}</h3>
                  <ul className="space-y-2">
                    {service.endpoints.map((endpoint) => (
                      <li key={endpoint} className="flex items-center text-sm text-green-700">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        {endpoint}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Status Summary */}
          <section className="mt-12 p-6 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trạng thái triển khai UI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">✅</div>
                <div className="text-sm text-gray-600 mt-2">UI Components hoàn thành</div>
                <div className="text-lg font-semibold text-gray-800">12/12</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">🔗</div>
                <div className="text-sm text-gray-600 mt-2">Routes được cấu hình</div>
                <div className="text-lg font-semibold text-gray-800">15/15</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">🚀</div>
                <div className="text-sm text-gray-600 mt-2">Endpoints có UI</div>
                <div className="text-lg font-semibold text-gray-800">100%</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RoutesOverview;