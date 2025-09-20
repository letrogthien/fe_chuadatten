import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { components } from '../../api-types/transactionService';
import type { components as WalletComponents } from '../../api-types/walletService';
import { useUser } from '../../context/UserContext';
import * as transactionApi from '../../services/transactionApi';
import * as walletApi from '../../services/walletApi';

type OrderDto = components['schemas']['OrderDto'];
type PaymentDto = WalletComponents['schemas']['PaymentDto'];

interface PaymentLocationState {
    order: OrderDto;
    customerInfo: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        district: string;
        ward: string;
        note: string;
    };
}

const Payment: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useUser();
    const state = location.state as PaymentLocationState;
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('vnpay');
    const [order, setOrder] = useState<OrderDto | null>(null);
    const [customerInfo, setCustomerInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentPayment, setCurrentPayment] = useState<PaymentDto | null>(null);
    
    // Check if orderId is passed via URL params
    const orderIdFromUrl = searchParams.get('orderId');

    useEffect(() => {
        if (orderIdFromUrl && !state?.order) {
            // Fetch order details by orderId
            fetchOrderDetails(orderIdFromUrl);
        } else if (state?.order) {
            setOrder(state.order);
            setCustomerInfo(state.customerInfo);
        } else {
            // No order data available, redirect back
            navigate('/user-center');
        }
    }, [orderIdFromUrl, state, navigate]);

    const fetchOrderDetails = async (orderId: string) => {
        try {
            setLoading(true);
            
            // Call API to get order details
            const userId = user?.id || ''; // Use actual user ID or fallback
            const orderData = await transactionApi.getOrderById(orderId, userId);
            
            setOrder(orderData);
            
            // Try to get existing payment for this order
            try {
                const paymentData = await walletApi.getPaymentByOrderId(orderId);
                setCurrentPayment(paymentData);
            } catch (paymentError) {
                // No existing payment found, which is normal for new orders
                console.log('No existing payment found for this order:', paymentError);
            }
            
            // Use customer info from state (from Checkout) if available, otherwise set defaults
            if (state?.customerInfo) {
                setCustomerInfo(state.customerInfo);
            } else if (!customerInfo) {
                setCustomerInfo({
                    fullName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '', 
                    district: '',
                    ward: '',
                    note: ''
                });
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            alert('Không thể tải thông tin đơn hàng');
            navigate('/user-center');
        } finally {
            setLoading(false);
        }
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

    const getStatusStyles = (status?: string) => {
        switch (status) {
            case 'CREATED':
                return 'bg-blue-100 text-blue-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status?: string) => {
        switch (status) {
            case 'CREATED':
                return 'Đã tạo';
            case 'PENDING':
                return 'Chờ xử lý';
            default:
                return status || 'Không xác định';
        }
    };

    // Handle payment processing
    const handlePayment = async () => {
        if (!order?.id) {
            alert('Không có thông tin đơn hàng');
            return;
        }

        try {
            setProcessing(true);

            // Check if payment already exists and is completed
            if (currentPayment && (currentPayment.status === 'SUCCEEDED' || currentPayment.status === 'COMPLETED')) {
                alert('Đơn hàng này đã được thanh toán thành công!');
                navigate('/order-history');
                return;
            }
            
            // Navigate to payment redirect page with order and payment method info
            navigate('/payment-redirect', {
                state: {
                    order: order,
                    paymentMethod: selectedPaymentMethod,
                    customerInfo: customerInfo
                }
            });

        } catch (error) {
            console.error('Payment initialization error:', error);
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Có lỗi xảy ra khi khởi tạo thanh toán';
            alert(`Lỗi: ${errorMessage}`);
        } finally {
            setProcessing(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    // Redirect if no order data
    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có thông tin đơn hàng</h1>
                    <p className="text-gray-600 mb-6">Vui lòng thực hiện đặt hàng trước khi thanh toán.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán</h1>
                    <nav className="text-sm text-gray-500">
                        <button onClick={() => navigate('/')} className="hover:text-blue-600">
                            Trang chủ
                        </button>
                        <span> → </span>
                        <button 
                            className="hover:text-blue-600 cursor-pointer" 
                            onClick={() => navigate(-1)}
                            type="button"
                        >
                            Đơn hàng
                        </button>
                        <span> → </span>
                        <span className="text-gray-900">Thanh toán</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Mã đơn hàng:</span>
                                <span className="font-medium">#{order.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Trạng thái:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    getStatusStyles(order.status)
                                }`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Tổng tiền:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {formatPrice(order.totalAmount, order.currency)}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">Sản phẩm đã đặt</h3>
                                <div className="space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={item.id || index} className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="font-medium">{item.productName || 'Sản phẩm'}</div>
                                                {/* Remove variant info as it's not available in OrderItemDto */}
                                                <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">
                                                    {((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} {order.currency}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.unitPrice?.toLocaleString('vi-VN')} {order.currency} / sản phẩm
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current Payment Info */}
                        {currentPayment && (
                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold mb-3">Thông tin thanh toán</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã thanh toán:</span>
                                        <span className="font-medium">#{currentPayment.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nhà cung cấp:</span>
                                        <span className="font-medium">{currentPayment.provider || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            currentPayment.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                                            currentPayment.status === 'PENDING' || currentPayment.status === 'CREATED' ? 'bg-yellow-100 text-yellow-800' :
                                            currentPayment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {currentPayment.status}
                                        </span>
                                    </div>
                                    {currentPayment.createdAt && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tạo lúc:</span>
                                            <span className="font-medium">
                                                {new Date(currentPayment.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-6">Phương thức thanh toán</h2>
                        
                        <div className="space-y-4">
                            {/* VNPay Payment */}
                            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="vnpay"
                                    checked={selectedPaymentMethod === 'vnpay'}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    className="mr-3"
                                />
                                <div className="flex-1">
                                    <div className="font-medium flex items-center">
                                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold mr-2">VNPAY</span>
                                        {' '}Thanh toán qua VNPay
                                    </div>
                                    <div className="text-sm text-gray-500">Thanh toán an toàn qua ví điện tử, thẻ ATM, QR Code</div>
                                </div>
                                <div className="text-green-600 font-semibold">Miễn phí</div>
                            </label>

                            {/* Platform Wallet Payment */}
                            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="wallet"
                                    checked={selectedPaymentMethod === 'wallet'}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    className="mr-3"
                                />
                                <div className="flex-1">
                                    <div className="font-medium flex items-center">
                                        <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold mr-2">VÍ</span>
                                        {' '}Ví của sàn
                                    </div>
                                    <div className="text-sm text-gray-500">Thanh toán bằng số dư trong ví của bạn</div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        Số dư hiện tại: <span className="font-semibold">0 VND</span>
                                    </div>
                                </div>
                                <div className="text-green-600 font-semibold">Miễn phí</div>
                            </label>
                        </div>

                        {/* Payment Button */}
                        <div className="mt-8 pt-6 border-t">
                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className={`w-full font-bold py-4 px-8 rounded-xl transition-all duration-200 transform shadow-lg ${
                                    processing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-105'
                                } text-white`}
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    `${selectedPaymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Thanh toán bằng ví'} - ${formatPrice(order.totalAmount, order.currency)}`
                                )}
                            </button>
                        </div>

                        {/* Security Note */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">🔒</span>
                                <span>Thông tin của bạn được bảo mật và mã hóa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;