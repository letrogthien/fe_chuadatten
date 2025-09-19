import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { components } from '../../api-types/productService';
import { getAllProducts } from '../../services/productApi';

type ProductDto = components['schemas']['ProductDto'];

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  
  // Sort state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load products
  const loadProducts = async (page: number = currentPage, size: number = pageSize, sort: string = sortBy, direction: string = sortDirection) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllProducts(page, size, sort, direction);
      
      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setCurrentPage(result.currentPage);
      
      // Update URL params
      setSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy: sort,
        sortDirection: direction
      });
      
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize from URL params
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '8');
    const sort = searchParams.get('sortBy') || 'createdAt';
    const direction = searchParams.get('sortDirection') || 'desc';
    
    setCurrentPage(page);
    setPageSize(size);
    setSortBy(sort);
    setSortDirection(direction);
    
    loadProducts(page, size, sort, direction);
  }, []);

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadProducts(page, pageSize, sortBy, sortDirection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newDirection: string) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    loadProducts(0, pageSize, newSortBy, newDirection); // Reset to first page
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    loadProducts(0, newSize, sortBy, sortDirection); // Reset to first page
  };

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get primary image
  const getPrimaryImage = (product: ProductDto) => {
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    return primaryImage?.url || '';
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">Lỗi tải dữ liệu</div>
            </div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
            <button 
              onClick={() => loadProducts()} 
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tất cả sản phẩm</h1>
          <p className="text-gray-600">
            Hiển thị {products.length} / {totalElements} sản phẩm
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Sắp xếp:</span>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [newSortBy, newDirection] = e.target.value.split('-');
                  handleSortChange(newSortBy, newDirection);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="basePrice-asc">Giá thấp đến cao</option>
                <option value="basePrice-desc">Giá cao đến thấp</option>
                <option value="ratingAvg-desc">Đánh giá cao nhất</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={8}>8 sản phẩm</option>
                <option value={16}>16 sản phẩm</option>
                <option value={24}>24 sản phẩm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer w-full text-left"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                {getPrimaryImage(product) ? (
                  <img
                    src={getPrimaryImage(product)}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEg3MEwxMDAgNzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5Lb25nIGNvIGFuaDwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                {product.active && (
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.active === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.active === 'ACTIVE' ? 'Còn hàng' : product.active}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name || 'Không có tên'}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description || 'Không có mô tả'}
                </p>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    {product.currency || 'VND'}
                  </span>
                </div>

                {/* Rating */}
                {product.ratingAvg && product.ratingCount && (
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium ml-1">
                        {product.ratingAvg.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      ({product.ratingCount} đánh giá)
                    </span>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {product.id ? product.id.slice(0, 8) : 'N/A'}</span>
                  <span>{product.tags?.join(', ') || 'Không có tag'}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có sản phẩm nào</h3>
            <p className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc quay lại sau.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trước
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => {
              const page = i;
              // Show first page, last page, current page, and pages around current page
              const showPage = 
                page === 0 || 
                page === totalPages - 1 || 
                Math.abs(page - currentPage) <= 1;
              
              if (!showPage) {
                // Show ellipsis if there's a gap
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page + 1}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === totalPages - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sau
            </button>
          </div>
        )}

        {/* Loading overlay for pagination */}
        {loading && products.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Đang tải...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;