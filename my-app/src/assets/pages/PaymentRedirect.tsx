

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { components } from '../../api-types/transactionService';
import type { components as WalletComponents } from '../../api-types/walletService';
import { useUser } from '../../context/UserContext';
import { useWebSocket } from '../../context/WebSocketContext';
import * as transactionApi from '../../services/transactionApi';
import * as walletApi from '../../services/walletApi';
import type { PayUrlMessage } from '../../services/webSocketService';

type OrderDto = components['schemas']['OrderDto'];
type PaymentDto = WalletComponents['schemas']['PaymentDto'];

interface PaymentRedirectLocationState {
    order: OrderDto;
    paymentMethod: string;
    customerInfo?: {
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

const PaymentRedirect: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useUser();
    const { webSocketService, isConnected: wsConnected } = useWebSocket();
    const state = location.state as PaymentRedirectLocationState;
    
    const [processing, setProcessing] = useState(true);
    const [status, setStatus] = useState('Đang kết nối với hệ thống thanh toán...');
    
    // Track WebSocket subscription
    const unsubscribe = useRef<(() => void) | null>(null);
    
    // Check if orderId is passed via URL params
    const orderIdFromUrl = searchParams.get('orderId');
    const paymentMethodFromUrl = searchParams.get('method') || 'vnpay';
    const isRetry = searchParams.get('retry') === 'true';

    useEffect(() => {
        if (!state?.order && !orderIdFromUrl) {
            setStatus('Không có thông tin đơn hàng. Đang chuyển về trang chủ...');
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        // Initialize payment process when WebSocket is connected
        if (webSocketService && wsConnected) {
            initializeWebSocketAndPayment();
        } else if (webSocketService && !wsConnected) {
            setStatus('Đang chờ kết nối WebSocket...');
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribe.current) {
                unsubscribe.current();
            }
        };
    }, [webSocketService, wsConnected]);

    const initializeWebSocketAndPayment = async () => {
        try {
            const orderId = state?.order?.id || orderIdFromUrl;
            const paymentMethod = state?.paymentMethod || paymentMethodFromUrl;

            if (!orderId) {
                throw new Error('Không có thông tin đơn hàng');
            }

            if (!user?.id) {
                throw new Error('Không có thông tin người dùng');
            }

            if (!webSocketService) {
                throw new Error('WebSocket service không khả dụng');
            }

            // Subscribe to payment URL notifications
            setStatus('Đang đăng ký nhận thông báo...');
            unsubscribe.current = webSocketService.subscribeToUserNotifications(
                user.id,
                handlePaymentUrlReceived,
                handleWebSocketError
            );

            if (!unsubscribe.current) {
                throw new Error('Không thể đăng ký nhận thông báo');
            }

            // Create payment and trigger backend processing
            setStatus('Đang khởi tạo thanh toán...');
            await createAndProcessPayment(orderId, paymentMethod);

        } catch (error) {
            console.error('Failed to initialize WebSocket and payment:', error);
            setStatus(`Lỗi: ${error instanceof Error ? error.message : 'Có lỗi xảy ra'}`);
            setProcessing(false);
        }
    };

    const createAndProcessPayment = async (orderId: string, paymentMethod: string) => {
        try {
            // Step 1: Get or create payment
            const payment = await getOrCreatePayment(orderId, paymentMethod);
            
            if (!payment) {
                throw new Error('Không thể tạo hoặc lấy thông tin thanh toán');
            }

            // Step 2: Process payment based on method
            if (paymentMethod === 'wallet') {
                await processWalletPayment(payment);
            } else {
                await processVNPayPayment(payment);
            }

        } catch (error) {
            console.error('Payment processing error:', error);
            setStatus(`Lỗi thanh toán: ${error instanceof Error ? error.message : 'Có lỗi xảy ra'}`);
            setProcessing(false);
        }
    };

    const getOrCreatePayment = async (orderId: string, paymentMethod: string): Promise<PaymentDto | null> => {
        // Try to get existing payment
        let payment: PaymentDto | null = null;
        
        try {
            payment = await walletApi.getPaymentByOrderId(orderId);
            
            // Check if payment already completed
            if (payment && (payment.status === 'SUCCEEDED' || payment.status === 'COMPLETED')) {
                setStatus('Đơn hàng đã được thanh toán thành công!');
                setTimeout(() => {
                    navigate('/order-history');
                }, 2000);
                return null;
            }
        } catch (paymentError) {
            // No existing payment found, create new one
            console.log('Creating new payment for order:', orderId, paymentError);
            // Reset payment to null to trigger creation
            payment = null;
        }
        
        // Create payment if not exists
        if (!payment) {
            setStatus('Đang tạo giao dịch thanh toán...');
            payment = await createNewPayment(orderId, paymentMethod);
            
            if (!payment) {
                throw new Error('Không thể tạo giao dịch thanh toán');
            }
        }

        return payment;
    };

    const createNewPayment = async (orderId: string, paymentMethod: string): Promise<PaymentDto | null> => {
        try {
            // Get order data first
            let orderData = state?.order;
            if (!orderData && orderIdFromUrl) {
                const userId = user?.id || '';
                orderData = await transactionApi.getOrderById(orderIdFromUrl, userId);
            }

            if (!orderData) {
                throw new Error('Không thể tải thông tin đơn hàng');
            }

            const paymentMethodType = paymentMethod === 'vnpay' ? 'VNPAY' : 'WALLET';
            return await walletApi.createPaymentForOrder(
                orderId,
                paymentMethodType,
                orderData.totalAmount || 0,
                orderData.currency || 'VND'
            );
        } catch (createError) {
            console.error('Cannot create payment:', createError);
            throw createError; // Re-throw to be handled by caller
        }
    };

    const processWalletPayment = async (payment: PaymentDto) => {
        setStatus('Đang xử lý thanh toán bằng ví...');
        try {
            if (!payment?.id) {
                throw new Error('Payment ID is required for wallet processing');
            }
            const result = await walletApi.processPayment(payment.id, 'WALLET');
            
            if (result) {
                setStatus('Thanh toán bằng ví thành công!');
                setTimeout(() => {
                    navigate('/order-history');
                }, 2000);
            } else {
                throw new Error('Thanh toán bằng ví thất bại');
            }
        } catch (walletError) {
            console.error('Wallet payment error:', walletError);
            setStatus(`Lỗi thanh toán ví: ${walletError instanceof Error ? walletError.message : 'Có lỗi xảy ra'}`);
            setProcessing(false);
        }
    };

    const processVNPayPayment = async (payment: PaymentDto) => {
        // For VNPay, wait for WebSocket notification
        setStatus(isRetry ? 'Đang thử lại thanh toán VNPay...' : 'Đang chờ URL thanh toán từ VNPay...');
        
        // Trigger payment processing on backend (this will send WebSocket message)
        if (payment?.id) {
            try {
                if (isRetry) {
                    // Use retry payment API for retry attempts
                    await walletApi.retryPayment(payment.id);
                } else {
                    // Use regular process payment API for new payments
                    await walletApi.processPayment(payment.id, 'DIRECT');
                }
            } catch (error) {
                console.log(`${isRetry ? 'Retry' : 'Direct'} payment call failed, waiting for WebSocket...`, error);
                // Continue waiting for WebSocket notification
            }
        }
    };

    const handlePaymentUrlReceived = (message: PayUrlMessage) => {
        console.log('Payment URL received:', message);
        
        if (message.type === 'PAY_URL' && message.url) {
            setStatus('Đã nhận được URL thanh toán, đang chuyển hướng...');
            
            // Open payment URL in new tab
            const paymentWindow = window.open(message.url, '_blank');
            
            if (paymentWindow) {
                // Wait a bit then redirect current tab to home
                setTimeout(() => {
                    setStatus('Đã mở trang thanh toán, đang quay về trang chủ...');
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 2000);
                }, 1000);
            } else {
                // If popup blocked, redirect in current tab
                setStatus('Đang chuyển hướng đến trang thanh toán...');
                setTimeout(() => {
                    window.location.href = message.url;
                }, 1500);
            }
        }
    };

    const handleWebSocketError = (error: Error) => {
        console.error('WebSocket error:', error);
        setStatus(`Lỗi kết nối: ${error.message}`);
        setProcessing(false);
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

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-xl shadow-lg border p-8 text-center">
                    {/* Loading Animation */}
                    <div className="mb-6">
                        {processing ? (
                            <div className="mx-auto w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        ) : (
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Status Message */}
                    <h1 className="text-xl font-semibold text-gray-800 mb-4">
                        {processing ? 'Đang xử lý thanh toán' : 'Lỗi thanh toán'}
                    </h1>
                    
                    <p className="text-gray-600 mb-4">
                        {status}
                    </p>

                    {/* WebSocket Connection Status */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center text-sm">
                            <span className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className={wsConnected ? 'text-green-600' : 'text-red-600'}>
                                {wsConnected ? 'Kết nối thông báo: Thành công' : 'Kết nối thông báo: Thất bại'}
                            </span>
                        </div>
                    </div>

                    {/* Order Information */}
                    {state?.order && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="text-sm text-gray-600 mb-2">Đơn hàng:</div>
                            <div className="font-semibold text-gray-800">#{state.order.id}</div>
                            <div className="text-blue-600 font-bold mt-2">
                                {formatPrice(state.order.totalAmount, state.order.currency)}
                            </div>
                        </div>
                    )}

                    {/* Payment Method */}
                    {state?.paymentMethod && (
                        <div className="mb-6">
                            <div className="text-sm text-gray-600 mb-2">Phương thức:</div>
                            <div className="inline-flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    state.paymentMethod === 'vnpay' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-orange-100 text-orange-800'
                                }`}>
                                    {state.paymentMethod === 'vnpay' ? 'VNPAY' : 'VÍ ĐIỆN TỬ'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!processing && (
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/payment', { 
                                    state: state,
                                    replace: true 
                                })}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => navigate('/user-center')}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                            >
                                Quay lại
                            </button>
                        </div>
                    )}

                    {/* Progress Dots */}
                    {processing && (
                        <div className="flex justify-center space-x-2 mt-6">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    )}
                </div>

                {/* Security Note */}
                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center text-sm text-gray-500">
                        <span className="mr-2">🔒</span>
                        <span>Giao dịch được mã hóa và bảo mật</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentRedirect;