import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActiveRoute = (path: string): boolean => {
    if (path === ROUTES.ADMIN) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string): string => {
    const baseClass = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200";
    const activeClass = "bg-blue-100 text-blue-700 border-r-2 border-blue-500";
    const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    
    return `${baseClass} ${isActiveRoute(path) ? activeClass : inactiveClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                <span className="text-2xl">🎮</span>
                <span className="text-xl font-bold text-gray-900">GameMarket</span>
                <span className="text-sm bg-red-600 text-white px-2 py-1 rounded-full font-medium">ADMIN</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Chào mừng, <span className="font-medium">Admin</span>
              </div>
              <Link
                to={ROUTES.HOME}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Về trang chủ
              </Link>
              <button className="text-sm text-red-600 hover:text-red-500 font-medium">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-16">
          <nav className="p-4 space-y-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quản trị hệ thống</h2>
            </div>
            
            {/* Overview */}
            <Link to={ROUTES.ADMIN} className={getLinkClass(ROUTES.ADMIN)}>
              <span className="mr-3">📊</span>
              <span>Tổng quan</span>
            </Link>

            <Link to={ROUTES.ADMIN_DASHBOARD} className={getLinkClass(ROUTES.ADMIN_DASHBOARD)}>
              <span className="mr-3">🎯</span>
              <span>Dashboard</span>
            </Link>

            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản lý</h3>
            </div>

            {/* User Management */}
            <Link to={ROUTES.ADMIN_USERS} className={getLinkClass(ROUTES.ADMIN_USERS)}>
              <span className="mr-3">👥</span>
              <span>Người dùng</span>
            </Link>

            {/* KYC Management */}
            <Link to="/admin/kyc" className={getLinkClass('/admin/kyc')}>
              <span className="mr-3">🆔</span>
              <span>KYC & Seller</span>
            </Link>

            {/* Device Management */}
            <Link to="/admin/devices" className={getLinkClass('/admin/devices')}>
              <span className="mr-3">📱</span>
              <span>Thiết bị</span>
            </Link>

            {/* Product Management */}
            <Link to={ROUTES.ADMIN_PRODUCTS} className={getLinkClass(ROUTES.ADMIN_PRODUCTS)}>
              <span className="mr-3">📦</span>
              <span>Sản phẩm</span>
            </Link>

            {/* Category Management */}
            <Link to={ROUTES.ADMIN_CATEGORIES} className={getLinkClass(ROUTES.ADMIN_CATEGORIES)}>
              <span className="mr-3">📁</span>
              <span>Danh mục</span>
            </Link>

            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giao dịch</h3>
            </div>

            {/* Orders */}
            <Link to={ROUTES.ADMIN_ORDERS} className={getLinkClass(ROUTES.ADMIN_ORDERS)}>
              <span className="mr-3">🛒</span>
              <span>Đơn hàng</span>
            </Link>

            {/* Refunds */}
            <Link to={ROUTES.ADMIN_REFUNDS} className={getLinkClass(ROUTES.ADMIN_REFUNDS)}>
              <span className="mr-3">💸</span>
              <span>Hoàn tiền</span>
            </Link>

            {/* Disputes */}
            <Link to={ROUTES.ADMIN_DISPUTES} className={getLinkClass(ROUTES.ADMIN_DISPUTES)}>
              <span className="mr-3">⚠️</span>
              <span>Tranh chấp</span>
            </Link>

            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hệ thống</h3>
            </div>

            {/* Settings */}
            <Link to={ROUTES.ADMIN_SETTINGS} className={getLinkClass(ROUTES.ADMIN_SETTINGS)}>
              <span className="mr-3">⚙️</span>
              <span>Cài đặt</span>
            </Link>

            {/* Reports */}
            <Link to={ROUTES.ADMIN_REPORTS} className={getLinkClass(ROUTES.ADMIN_REPORTS)}>
              <span className="mr-3">📈</span>
              <span>Báo cáo</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;