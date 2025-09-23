import React, { useState } from 'react';

// Sample data cho product management
const sampleProductData = {
  products: [
    {
      id: "prod-001",
      name: "Tài khoản Liên Quân VIP 50 Skin",
      description: "Tài khoản Liên Quân Mobile full 50 skin hiếm, rank Cao Thủ",
      shortDescription: "Tài khoản LQ full skin rank Cao Thủ",
      categoryId: "cat-002",
      categoryName: "Liên Quân Mobile",
      price: 2500000,
      originalPrice: 3000000,
      stockQuantity: 15,
      isActive: true,
      createdAt: "2024-12-15T10:30:00Z",
      updatedAt: "2024-12-20T14:25:00Z",
      tags: ["hot", "discount", "vip"],
      images: [
        "/images/lq-account-1.jpg",
        "/images/lq-account-2.jpg"
      ],
      sellerId: "seller-001",
      sellerName: "GameShop Pro",
      totalSold: 147,
      rating: 4.8,
      reviewCount: 52
    },
    {
      id: "prod-002", 
      name: "PUBG Mobile UC + Skin Set",
      description: "Gói UC 8100 + skin súng AKM Glacier và Set trang phục hiếm",
      shortDescription: "UC 8100 + skin súng AKM Glacier",
      categoryId: "cat-003",
      categoryName: "PUBG Mobile",
      price: 1200000,
      originalPrice: 1200000,
      stockQuantity: 8,
      isActive: true,
      createdAt: "2024-12-18T09:15:00Z",
      updatedAt: "2024-12-19T16:40:00Z",
      tags: ["new", "limited"],
      images: [
        "/images/pubg-uc-1.jpg"
      ],
      sellerId: "seller-002",
      sellerName: "Mobile Gaming Store",
      totalSold: 23,
      rating: 4.9,
      reviewCount: 18
    },
    {
      id: "prod-003",
      name: "Free Fire Kim Cương 2000",
      description: "Gói kim cương Free Fire 2000 viên, tặng thêm voucher skin",
      shortDescription: "2000 kim cương FF + voucher skin",
      categoryId: "cat-004", 
      categoryName: "Free Fire",
      price: 450000,
      originalPrice: 500000,
      stockQuantity: 0,
      isActive: false,
      createdAt: "2024-12-10T14:20:00Z",
      updatedAt: "2024-12-17T11:30:00Z",
      tags: ["out-of-stock"],
      images: [
        "/images/ff-diamond-1.jpg",
        "/images/ff-diamond-2.jpg",
        "/images/ff-diamond-3.jpg"
      ],
      sellerId: "seller-003",
      sellerName: "FF Kingdom",
      totalSold: 892,
      rating: 4.7,
      reviewCount: 156
    },
    {
      id: "prod-004",
      name: "Steam Key GTA V Premium",
      description: "Key game Grand Theft Auto V Premium Edition cho Steam",
      shortDescription: "GTA V Premium Edition Steam Key",
      categoryId: "cat-006",
      categoryName: "Steam Games", 
      price: 320000,
      originalPrice: 400000,
      stockQuantity: 25,
      isActive: true,
      createdAt: "2024-12-12T16:45:00Z",
      updatedAt: "2024-12-16T08:20:00Z",
      tags: ["bestseller", "discount"],
      images: [
        "/images/gta5-key-1.jpg"
      ],
      sellerId: "seller-004",
      sellerName: "PC Game Store",
      totalSold: 445,
      rating: 4.6,
      reviewCount: 89
    },
    {
      id: "prod-005",
      name: "Valorant Account Immortal Rank",
      description: "Tài khoản Valorant rank Immortal với nhiều skin súng đẹp",
      shortDescription: "Valorant Immortal + skin súng",
      categoryId: "cat-007",
      categoryName: "Valorant",
      price: 5500000,
      originalPrice: 6000000,
      stockQuantity: 3,
      isActive: true,
      createdAt: "2024-12-08T12:10:00Z",
      updatedAt: "2024-12-14T15:55:00Z",
      tags: ["premium", "rare"],
      images: [
        "/images/valorant-acc-1.jpg",
        "/images/valorant-acc-2.jpg"
      ],
      sellerId: "seller-001",
      sellerName: "GameShop Pro",
      totalSold: 8,
      rating: 5.0,
      reviewCount: 6
    }
  ],
  statistics: {
    totalProducts: 5,
    activeProducts: 4,
    inactiveProducts: 1,
    outOfStockProducts: 1,
    totalRevenue: 12450000,
    averagePrice: 2494000
  },
  filters: {
    categories: [
      { id: "cat-002", name: "Liên Quân Mobile" },
      { id: "cat-003", name: "PUBG Mobile" },
      { id: "cat-004", name: "Free Fire" },
      { id: "cat-006", name: "Steam Games" },
      { id: "cat-007", name: "Valorant" }
    ],
    sellers: [
      { id: "seller-001", name: "GameShop Pro" },
      { id: "seller-002", name: "Mobile Gaming Store" },
      { id: "seller-003", name: "FF Kingdom" },
      { id: "seller-004", name: "PC Game Store" }
    ]
  }
};

interface ProductFilters {
  categoryId: string;
  sellerId: string;
  status: string;
  priceRange: string;
  stockStatus: string;
}

const AdminProductManagement: React.FC = () => {
  const [productData] = useState(sampleProductData);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categoryId: '',
    sellerId: '',
    status: '',
    priceRange: '',
    stockStatus: ''
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

  const getStatusBadge = (product: any) => {
    if (product.stockQuantity === 0) {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Hết hàng</span>;
    }
    if (!product.isActive) {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Tạm dừng</span>;
    }
    if (product.stockQuantity <= 5) {
      return <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Sắp hết</span>;
    }
    return <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Còn hàng</span>;
  };

  const getTagBadges = (tags: string[]) => {
    const tagColors: { [key: string]: string } = {
      'hot': 'bg-red-100 text-red-800',
      'new': 'bg-blue-100 text-blue-800',
      'discount': 'bg-green-100 text-green-800',
      'bestseller': 'bg-purple-100 text-purple-800',
      'premium': 'bg-yellow-100 text-yellow-800',
      'limited': 'bg-orange-100 text-orange-800',
      'rare': 'bg-pink-100 text-pink-800',
      'vip': 'bg-indigo-100 text-indigo-800',
      'out-of-stock': 'bg-gray-100 text-gray-800'
    };

    return tags.map((tag, index) => (
      <span 
        key={index}
        className={`inline-block px-2 py-1 text-xs font-medium rounded-full mr-1 mb-1 ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}
      >
        {tag}
      </span>
    ));
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    console.log('Toggling product status:', productId, !currentStatus);
    // Gọi API updateProduct từ productApi
    alert(`Đã ${!currentStatus ? 'kích hoạt' : 'tạm dừng'} sản phẩm: ${productId}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
      console.log('Deleting product:', productId);
      // Gọi API deleteProduct từ productApi
      alert(`Đã xóa sản phẩm: ${productId}`);
    }
  };

  const handleViewDetail = (product: any) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const getDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Lọc sản phẩm dựa trên filters
  const filteredProducts = productData.products.filter((product) => {
    if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
    if (filters.sellerId && product.sellerId !== filters.sellerId) return false;
    if (filters.status === 'active' && !product.isActive) return false;
    if (filters.status === 'inactive' && product.isActive) return false;
    if (filters.stockStatus === 'in-stock' && product.stockQuantity === 0) return false;
    if (filters.stockStatus === 'out-of-stock' && product.stockQuantity > 0) return false;
    if (filters.stockStatus === 'low-stock' && product.stockQuantity > 5) return false;
    
    // Price range filter
    if (filters.priceRange) {
      const price = product.price;
      switch (filters.priceRange) {
        case 'under-500k':
          if (price >= 500000) return false;
          break;
        case '500k-1m':
          if (price < 500000 || price >= 1000000) return false;
          break;
        case '1m-3m':
          if (price < 1000000 || price >= 3000000) return false;
          break;
        case 'over-3m':
          if (price < 3000000) return false;
          break;
      }
    }
    
    return true;
  });

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      sellerId: '',
      status: '',
      priceRange: '',
      stockStatus: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
              <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý tất cả sản phẩm trong hệ thống</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium">
                📊 Xuất báo cáo
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
                + Thêm sản phẩm
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng SP</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {productData.statistics.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hoạt động</p>
                <p className="text-2xl font-semibold text-green-600">
                  {productData.statistics.activeProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hết hàng</p>
                <p className="text-2xl font-semibold text-red-600">
                  {productData.statistics.outOfStockProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏸️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tạm dừng</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {productData.statistics.inactiveProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Doanh thu</p>
                <p className="text-lg font-semibold text-purple-600">
                  {(productData.statistics.totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Giá TB</p>
                <p className="text-lg font-semibold text-indigo-600">
                  {(productData.statistics.averagePrice / 1000).toFixed(0)}K
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
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả danh mục</option>
                {productData.filters.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Người bán</label>
              <select
                value={filters.sellerId}
                onChange={(e) => setFilters(prev => ({ ...prev, sellerId: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả người bán</option>
                {productData.filters.sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả giá</option>
                <option value="under-500k">Dưới 500K</option>
                <option value="500k-1m">500K - 1M</option>
                <option value="1m-3m">1M - 3M</option>
                <option value="over-3m">Trên 3M</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
              <select
                value={filters.stockStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả tồn kho</option>
                <option value="in-stock">Còn hàng</option>
                <option value="low-stock">Sắp hết (≤5)</option>
                <option value="out-of-stock">Hết hàng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Danh sách sản phẩm ({filteredProducts.length})
              </h3>
              <div className="text-sm text-gray-500">
                Hiển thị {filteredProducts.length} / {productData.products.length} sản phẩm
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã bán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-16 w-16">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">IMG</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{product.shortDescription}</p>
                          <div className="mt-2">{getTagBadges(product.tags)}</div>
                          <p className="text-xs text-gray-400 mt-1">
                            ⭐ {product.rating} ({product.reviewCount} đánh giá)
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{product.categoryName}</p>
                      <p className="text-xs text-gray-500">{product.sellerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </p>
                        {product.originalPrice > product.price && (
                          <div className="text-xs">
                            <span className="text-gray-500 line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                            <span className="text-red-600 ml-1">
                              -{getDiscountPercentage(product.originalPrice, product.price)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-medium ${
                        product.stockQuantity === 0 ? 'text-red-600' :
                        product.stockQuantity <= 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stockQuantity}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{product.totalSold}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                          className={`text-sm font-medium ${
                            product.isActive ? 'text-yellow-600 hover:text-yellow-500' : 'text-green-600 hover:text-green-500'
                          }`}
                        >
                          {product.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-500 text-sm font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500">Thử thay đổi bộ lọc để xem các sản phẩm khác</p>
            </div>
          )}
        </div>

        {/* Product Detail Modal */}
        {showDetailModal && selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-gray-900">Chi tiết sản phẩm</h3>
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
                  {/* Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Tên sản phẩm:</span>
                          <p className="text-sm font-medium text-gray-900">{selectedProduct.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Mô tả:</span>
                          <p className="text-sm text-gray-900">{selectedProduct.description}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Danh mục:</span>
                          <p className="text-sm text-gray-900">{selectedProduct.categoryName}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Người bán:</span>
                          <p className="text-sm text-gray-900">{selectedProduct.sellerName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin bán hàng</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-500">Giá hiện tại:</span>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(selectedProduct.price)}
                          </p>
                        </div>
                        {selectedProduct.originalPrice > selectedProduct.price && (
                          <div>
                            <span className="text-sm text-gray-500">Giá gốc:</span>
                            <p className="text-sm text-gray-900 line-through">
                              {formatCurrency(selectedProduct.originalPrice)}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-gray-500">Tồn kho:</span>
                          <p className="text-sm font-medium text-gray-900">{selectedProduct.stockQuantity} sản phẩm</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Đã bán:</span>
                          <p className="text-sm text-gray-900">{selectedProduct.totalSold} sản phẩm</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Đánh giá:</span>
                          <p className="text-sm text-gray-900">
                            ⭐ {selectedProduct.rating}/5 ({selectedProduct.reviewCount} đánh giá)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                    <div>{getTagBadges(selectedProduct.tags)}</div>
                  </div>

                  {/* Images */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Hình ảnh ({selectedProduct.images.length})</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedProduct.images.map((image: string, index: number) => (
                        <div key={index} className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">IMG {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <span className="text-sm text-gray-500">Ngày tạo:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedProduct.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Cập nhật:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedProduct.updatedAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-6 mt-6 border-t">
                  <button
                    onClick={() => alert('Chuyển đến trang chỉnh sửa sản phẩm')}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleToggleProductStatus(selectedProduct.id, selectedProduct.isActive)}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                      selectedProduct.isActive 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedProduct.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                  </button>
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
      </main>
    </div>
  );
};

export default AdminProductManagement;