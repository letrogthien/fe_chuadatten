import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { components as ProductComponents } from '../../api-types/productService';
import type { components } from '../../api-types/transactionService';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useUser } from '../../context/UserContext';
import * as transactionApi from '../../services/transactionApi';

type OrderDto = components['schemas']['OrderDto'];
type ProductDto = ProductComponents['schemas']['ProductDto'];

// Status color mapping
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'PAID':
      return 'text-green-600 bg-green-100';
    case 'PAYING':
      return 'text-orange-600 bg-orange-100';
    case 'READY_PAY':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Status Vietnamese mapping
const getStatusText = (status?: string) => {
  switch (status) {
    case 'PAID':
      return 'Đã thanh toán';
    case 'PAYING':
      return 'Đang thanh toán';
    case 'READY_PAY':
      return 'Sẵn sàng thanh toán';
    default:
      return status || 'Không xác định';
  }
};

// Payment status Vietnamese mapping
const getPaymentStatusText = (status?: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'Thành công';
    case 'PROCESSING':
      return 'Đang xử lý';
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'FAILED':
      return 'Thất bại';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status || 'Không xác định';
  }
};

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Product info cache
  const [productCache] = useState<Map<string, ProductDto>>(new Map());
  
  // All orders cache
  const [allOrdersCache, setAllOrdersCache] = useState<OrderDto[]>([]);
  
  // Loading states for individual actions
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderDto | null>(null);

  useEffect(() => {
    loadAllOrders();
  }, []);

  // Load all orders from API
  const loadAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const buyerId = user?.id || '96422096-dcb7-467c-8a44-8412fd82b941';
      let allOrders: OrderDto[] = [];
      let currentPage = 0;
      let hasMorePages = true;
      
      console.log('Loading all orders...');
      
      // Fetch all pages
      while (hasMorePages) {
        const ordersResponse = await transactionApi.getOrdersByBuyer(buyerId, {
          page: currentPage,
          limit: 1000
        });
        
        console.log(`Loaded page ${currentPage + 1}: ${ordersResponse.orders.length} orders`);
        allOrders = [...allOrders, ...ordersResponse.orders];
        
        hasMorePages = ordersResponse.hasNext;
        currentPage++;
      }
      
      console.log(`Total orders loaded: ${allOrders.length}`);
      console.log('Orders data:', allOrders);
      
      // Store in cache
      setAllOrdersCache(allOrders);
      setOrders(allOrders);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Simple filtering logic
  const filteredOrders = allOrdersCache.filter(order => {
    // Không hiển thị đơn hàng đã hủy
    if (order.status === 'CANCELLED') {
      return false;
    }
    
    const orderMatch = selectedOrderStatus === 'ALL' || order.status === selectedOrderStatus;
    return orderMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Get counts for each status
  const getOrderStatusCounts = () => {
    const counts: Record<string, number> = {};
    allOrdersCache.forEach(order => {
      // Không đếm đơn hàng đã hủy
      if (order.status === 'CANCELLED') {
        return;
      }
      
      const status = order.status || 'UNKNOWN';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const orderStatusCounts = getOrderStatusCounts();

  // Handle filter changes
  const handleOrderStatusFilter = (status: string) => {
    console.log(`Filter changed - Order Status: ${status}`);
    setSelectedOrderStatus(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Get product info from cache
  const getProductInfo = (productId?: string) => {
    if (!productId) return null;
    return productCache.get(productId) || null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return currency === 'VND' ? '0 ₫' : '$0.00';
    
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCancelOrder = async (orderId?: string) => {
    if (!orderId) return;
    
    // Find the order to cancel
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Set order to cancel and show modal
    setOrderToCancel(order);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel?.id) return;
    
    const orderId = orderToCancel.id;
    
    try {
      // Add order to cancelling set
      setCancellingOrders(prev => new Set(prev).add(orderId));
      
      // Call API to cancel order
      const buyerId = user?.id || '96422096-dcb7-467c-8a44-8412fd82b941'; // Fallback for demo
      const cancelledOrder = await transactionApi.cancelOrder(orderId, buyerId);
      
      // Update orders in cache
      setAllOrdersCache(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { 
                ...order, 
                status: cancelledOrder.status || 'CANCELLED',
                paymentStatus: cancelledOrder.paymentStatus || 'CANCELLED',
                updatedAt: cancelledOrder.updatedAt || new Date().toISOString()
              }
            : order
        )
      );
      
      // Close modal and reset state
      setShowConfirmModal(false);
      setOrderToCancel(null);
      
      // Show success message
      alert('Đơn hàng đã được hủy thành công!');
      
    } catch (error) {
      console.error('Error canceling order:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Có lỗi xảy ra khi hủy đơn hàng';
      
      alert(`Không thể hủy đơn hàng: ${errorMessage}\n\nVui lòng thử lại sau hoặc liên hệ hỗ trợ.`);
    } finally {
      // Remove order from cancelling set
      setCancellingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setOrderToCancel(null);
  };

  const handleRequestRefund = (orderId?: string) => {
    if (!orderId) return;
    alert(`Chức năng yêu cầu hoàn tiền cho đơn hàng ${orderId} đang phát triển`);
  };

  const handleCreateDispute = (orderId?: string) => {
    if (!orderId) return;
    alert(`Chức năng tạo tranh chấp cho đơn hàng ${orderId} đang phát triển`);
  };

  const handlePayment = (orderId?: string) => {
    if (!orderId) return;
    // Navigate to payment page with order ID
    navigate(`/payment?orderId=${orderId}`);
  };

  const handleRetryPayment = (orderId?: string) => {
    if (!orderId) return;
    // Navigate to payment redirect page for retry with retry flag
    navigate(`/payment-redirect?orderId=${orderId}&method=vnpay&retry=true`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 font-medium">Lỗi tải dữ liệu</div>
          </div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Lịch sử đơn hàng</h1>
        
        {/* Order Status filter */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Trạng thái đơn hàng:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleOrderStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedOrderStatus === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({allOrdersCache.filter(order => order.status !== 'CANCELLED').length})
            </button>
            {['PAID', 'PAYING', 'READY_PAY'].map(status => (
              <button
                key={status}
                onClick={() => handleOrderStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedOrderStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getStatusText(status)} ({orderStatusCounts[status] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Summary info */}
        <div className="text-sm text-gray-600">
          Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn hàng (Trang {currentPage}/{totalPages})
          {selectedOrderStatus !== 'ALL' && ` • Đơn hàng: ${getStatusText(selectedOrderStatus)}`}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Không có đơn hàng nào</div>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Đơn hàng #{order.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Đặt hàng: {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái thanh toán: {getPaymentStatusText(order.paymentStatus)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(order.totalAmount, order.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.currency || 'USD'}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items?.map((item) => {
                  const productInfo = getProductInfo(item.productId);
                  const primaryImage = productInfo?.images?.find(img => img.isPrimary) || productInfo?.images?.[0];
                  
                  return (
                    <div key={item.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {primaryImage?.url ? (
                          <img 
                            src={primaryImage.url} 
                            alt={primaryImage.altText || productInfo?.name || 'Product image'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-xs">IMG</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {productInfo?.name || item.productName}
                        </h4>
                        {productInfo?.description && (
                          <p className="text-xs text-gray-500 mb-1 line-clamp-2">
                            {productInfo.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity} × {formatPrice(item.unitPrice, order.currency)}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Subtotal: {formatPrice(item.subtotal, order.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Actions */}
              <div className="flex justify-end gap-3">
                {(order.status === 'CREATED' || order.status === 'READY_PAY') && order.paymentStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handlePayment(order.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Thanh toán
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrders.has(order.id || '')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        cancellingOrders.has(order.id || '')
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {cancellingOrders.has(order.id || '') ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang hủy...
                        </div>
                      ) : (
                        'Hủy đơn hàng'
                      )}
                    </button>
                  </>
                )}
                
                {/* Show retry payment for orders with PROCESSING payment status */}
                {order.paymentStatus === 'PROCESSING' && (
                  <button
                    onClick={() => handleRetryPayment(order.id)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Thanh toán lại
                  </button>
                )}
                
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingOrders.has(order.id || '')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      cancellingOrders.has(order.id || '')
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {cancellingOrders.has(order.id || '') ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang hủy...
                      </div>
                    ) : (
                      'Hủy đơn hàng'
                    )}
                  </button>
                )}
                {order.status === 'COMPLETED' && (
                  <>
                    <button 
                      onClick={() => handleRequestRefund(order.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Yêu cầu hoàn tiền
                    </button>
                    <button 
                      onClick={() => handleCreateDispute(order.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Tranh chấp
                    </button>
                  </>
                )}
                <button 
                  onClick={() => navigate(`/order-detail/${order.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>

              {/* Additional Info */}
              {order.auditFlag && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    ⚠️ Đơn hàng này đang được kiểm duyệt
                  </p>
                </div>
              )}
              
              {order.status === 'CANCELLED' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ❌ Đơn hàng đã được hủy
                    {order.updatedAt && (
                      <span className="ml-2 text-xs">
                        vào {formatDate(order.updatedAt)}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > itemsPerPage && (
        <div className="mt-8 flex justify-center items-center gap-2">
          {/* Previous button */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trước
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current page
            const showPage = 
              page === 1 || 
              page === totalPages || 
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
                {page}
              </button>
            );
          })}

          {/* Next button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sau
          </button>
        </div>
      )}
      
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
        orderDetails={orderToCancel ? {
          orderId: orderToCancel.id || '',
          totalAmount: formatPrice(orderToCancel.totalAmount, orderToCancel.currency)
        } : undefined}
        confirmText="Hủy đơn hàng"
        cancelText="Giữ đơn hàng"
        type="danger"
        isLoading={orderToCancel?.id ? cancellingOrders.has(orderToCancel.id) : false}
      />
    </div>
  );
};

export default OrderHistory;