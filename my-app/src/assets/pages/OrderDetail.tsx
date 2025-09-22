import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { components as ProductComponents } from '../../api-types/productService';
import type { components } from '../../api-types/transactionService';
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
    case 'CANCELLED':
      return 'text-red-600 bg-red-100';
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
    case 'CANCELLED':
      return 'Đã hủy';
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

const OrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useUser();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Product info cache
  const [productCache] = useState<Map<string, ProductDto>>(new Map());

  useEffect(() => {
    if (orderId) {
      loadOrderDetail(orderId);
    } else {
      setError('Không tìm thấy ID đơn hàng');
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetail = async (orderIdParam: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const buyerId = user?.id || '96422096-dcb7-467c-8a44-8412fd82b941';
      const orderData = await transactionApi.getOrderById(orderIdParam, buyerId);
      
      if (orderData) {
        setOrder(orderData);
      } else {
        setError('Không tìm thấy đơn hàng');
      }
      
    } catch (error) {
      console.error('Error loading order detail:', error);
      setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
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
      minute: '2-digit',
      second: '2-digit'
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

  const handleGoBack = () => {
    navigate('/order-history');
  };

  const handlePayment = () => {
    if (order?.id) {
      navigate(`/payment?orderId=${order.id}`);
    }
  };

  const handleRetryPayment = () => {
    if (order?.id) {
      navigate(`/payment-redirect?orderId=${order.id}&method=vnpay&retry=true`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 font-medium">Lỗi tải dữ liệu</div>
          </div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <div className="mt-3 flex gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
            <button 
              onClick={handleGoBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Quay lại danh sách đơn hàng
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Chi tiết đơn hàng #{order.id}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <span className="text-sm text-gray-500">
                Trạng thái thanh toán: {getPaymentStatusText(order.paymentStatus)}
              </span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            {(order.status === 'CREATED' || order.status === 'READY_PAY') && order.paymentStatus === 'PENDING' && (
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Thanh toán
              </button>
            )}
            
            {order.paymentStatus === 'PROCESSING' && (
              <button
                onClick={handleRetryPayment}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Thanh toán lại
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đặt hàng:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật lần cuối:</span>
                <span className="font-medium">{formatDate(order.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái đơn hàng:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái thanh toán:</span>
                <span className="font-medium">{getPaymentStatusText(order.paymentStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loại tiền tệ:</span>
                <span className="font-medium">{order.currency || 'USD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(order.totalAmount, order.currency)}
                </span>
              </div>
              {order.auditFlag && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái kiểm duyệt:</span>
                  <span className="text-orange-600 font-medium">⚠️ Đang kiểm duyệt</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sản phẩm trong đơn hàng ({order.items?.length || 0} sản phẩm)
        </h2>
        
        <div className="space-y-4">
          {order.items?.map((item, index) => {
            const productInfo = getProductInfo(item.productId);
            const primaryImage = productInfo?.images?.find(img => img.isPrimary) || productInfo?.images?.[0];
            
            return (
              <div key={item.id || index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
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
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {productInfo?.name || item.productName}
                  </h3>
                  
                  {productInfo?.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {productInfo.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Đơn giá:</span>
                      <div className="font-medium">{formatPrice(item.unitPrice, order.currency)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Số lượng:</span>
                      <div className="font-medium">{item.quantity}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Thành tiền:</span>
                      <div className="font-bold text-green-600">{formatPrice(item.subtotal, order.currency)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span>{formatPrice(order.totalAmount, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatPrice(order.totalAmount, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử đơn hàng</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
            <div>
              <div className="font-medium text-gray-900">Đơn hàng được tạo</div>
              <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
            </div>
          </div>
          
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
              <div>
                <div className="font-medium text-gray-900">Đơn hàng được cập nhật</div>
                <div className="text-sm text-gray-600">{formatDate(order.updatedAt)}</div>
              </div>
            </div>
          )}
          
          {order.status === 'CANCELLED' && (
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-red-600 rounded-full mt-1"></div>
              <div>
                <div className="font-medium text-gray-900">Đơn hàng đã bị hủy</div>
                <div className="text-sm text-gray-600">{formatDate(order.updatedAt)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;