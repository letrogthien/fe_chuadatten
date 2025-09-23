import type { components } from '../api-types/walletService';
import apiClient from './apiClientWallet';

type PaymentDto = components['schemas']['PaymentDto'];
type ApiResponsePaymentDto = components['schemas']['ApiResponsePaymentDto'];
type ApiResponseString = components['schemas']['ApiResponseString'];
type VnpayReturnDto = components['schemas']['VnpayReturnDto'];
type ApiResponseVnpayReturnDto = components['schemas']['ApiResponseVnpayReturnDto'];
type PaymentAttemptDto = components['schemas']['PaymentAttemptDto'];
type ApiResponsePaymentAttemptDto = components['schemas']['ApiResponsePaymentAttemptDto'];
type PagePaymentDto = components['schemas']['PagePaymentDto'];
type ApiResponsePagePaymentDto = components['schemas']['ApiResponsePagePaymentDto'];

/**
 * Get payment by order ID
 */
export const getPaymentByOrderId = async (orderId: string): Promise<PaymentDto> => {
    const response = await apiClient.get<ApiResponsePaymentDto>(
        `/api/v1/wallet-service/payments/order/${orderId}`
    );
    
    if (!response.data.data) {
        throw new Error('Payment not found for this order');
    }
    
    return response.data.data;
};

/**
 * Get payment status by payment ID
 */
export const getPaymentStatus = async (paymentId: string): Promise<PaymentDto> => {
    const response = await apiClient.get<ApiResponsePaymentDto>(
        `/api/v1/wallet-service/payments/${paymentId}/status`
    );
    
    if (!response.data.data) {
        throw new Error('Payment status not found');
    }
    
    return response.data.data;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId: string): Promise<PaymentDto> => {
    const response = await apiClient.get<ApiResponsePaymentDto>(
        `/api/v1/wallet-service/payments/${paymentId}`
    );
    
    if (!response.data.data) {
        throw new Error('Payment not found');
    }
    
    return response.data.data;
};

/**
 * Cancel payment
 */
export const cancelPayment = async (paymentId: string): Promise<void> => {
    await apiClient.put(
        `/api/v1/wallet-service/payments/${paymentId}/cancel`
    );
};

/**
 * Process payment
 */
export const processPayment = async (
    paymentId: string, 
    paymentMethod: 'WALLET' | 'DIRECT'
): Promise<string> => {
    const response = await apiClient.post<ApiResponseString>(
        `/api/v1/wallet-service/payments/${paymentId}/process`,
        null,
        {
            params: {
                paymentMethod
            }
        }
    );
    
    return response.data.data || '';
};

/**
 * Create payment for order (simulated)
 * Note: This is a simulation as the actual API endpoint for creating payment is not available
 */
export const createPaymentForOrder = async (
    orderId: string,
    _paymentMethod: 'VNPAY' | 'WALLET',
    _amount: number,
    _currency: string = 'VND'
): Promise<PaymentDto> => {
    // Since there's no direct API for creating payment, we'll try to get existing payment first
    try {
        const existingPayment = await getPaymentByOrderId(orderId);
        return existingPayment;
    } catch (error) {
        // If no payment exists, throw error as we cannot create new payment
        console.error('No existing payment found for order:', orderId, error);
        throw new Error('Không thể tạo thanh toán cho đơn hàng này. Vui lòng liên hệ hỗ trợ.');
    }
};

/**
 * Handle VNPay return callback
 */
export const handleVnpayReturn = async (returnParams: URLSearchParams): Promise<VnpayReturnDto> => {
    // Convert URLSearchParams to object for API call
    const params: Record<string, string> = {};
    returnParams.forEach((value, key) => {
        params[key] = value;
    });
    
    const response = await apiClient.get<ApiResponseVnpayReturnDto>(
        '/api/v1/wallet-service/payments/vnpay_return',
        { params }
    );
    
    if (!response.data.data) {
        throw new Error('Invalid VNPay return response');
    }
    
    return response.data.data;
};

/**
 * Retry payment
 */
export const retryPayment = async (paymentId: string): Promise<string> => {
    const response = await apiClient.post<ApiResponseString>(
        `/api/v1/wallet-service/payments/${paymentId}/retry`
    );
    
    return response.data.data || '';
};

/**
 * Refund payment
 */
export const refundPayment = async (paymentId: string, sellerId: string): Promise<void> => {
    await apiClient.post(
        `/api/v1/wallet-service/payments/${paymentId}/refund`,
        null,
        {
            headers: {
                'Seller-Id': sellerId
            }
        }
    );
};

/**
 * Get payment attempts history
 */
export const getPaymentAttempts = async (paymentId: string): Promise<PaymentAttemptDto> => {
    const response = await apiClient.get<ApiResponsePaymentAttemptDto>(
        `/api/v1/wallet-service/payments/${paymentId}/attempts`
    );
    
    if (!response.data.data) {
        throw new Error('Payment attempts not found');
    }
    
    return response.data.data;
};

/**
 * Get user payments with pagination
 */
export const getUserPayments = async (options?: {
    page?: number;
    size?: number;
}): Promise<{
    payments: PaymentDto[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}> => {
    const params = new URLSearchParams();
    
    if (options?.page !== undefined) params.append('page', options.page.toString());
    if (options?.size !== undefined) params.append('size', options.size.toString());

    const response = await apiClient.get<ApiResponsePagePaymentDto>(
        `/api/v1/wallet-service/payments/me?${params.toString()}`
    );
    
    const pageData = response.data?.data;
    const payments = pageData?.content || [];
    
    return {
        payments: Array.isArray(payments) ? payments : [],
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 10,
        hasNext: !(pageData?.last ?? true),
        hasPrevious: !(pageData?.first ?? true),
    };
};

/**
 * Handle VNPay IPN (Instant Payment Notification) callback
 */
export const handleVnpayIpn = async (returnParams: URLSearchParams): Promise<string> => {
    // Convert URLSearchParams to object for API call
    const params: Record<string, string> = {};
    returnParams.forEach((value, key) => {
        params[key] = value;
    });
    
    const response = await apiClient.get<ApiResponseString>(
        '/api/v1/wallet-service/payments/IPN',
        { params }
    );
    
    return response.data.data || '';
};