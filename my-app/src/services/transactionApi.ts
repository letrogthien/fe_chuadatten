import type { components } from '../api-types/transactionService';
import apiClient from './apiClientTransaction';

type OrderCreateRq = components['schemas']['OrderCreateRq'];
type OrderDto = components['schemas']['OrderDto'];
type ApiResponseOrderDto = components['schemas']['ApiResponseOrderDto'];
type ApiResponsePageOrderDto = components['schemas']['ApiResponsePageOrderDto'];

/**
 * Create a new order
 */
export const createOrder = async ( orderData: OrderCreateRq): Promise<OrderDto> => {
    const response = await apiClient.post<ApiResponseOrderDto>(
        `/api/v1/transaction-service/orders`,
        orderData
    );
    
    if (!response.data.data) {
        throw new Error('Failed to create order - no data returned');
    }
    
    return response.data.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string, userId: string): Promise<OrderDto> => {
    const params = new URLSearchParams({ userId });
    
    const response = await apiClient.get<ApiResponseOrderDto>(
        `/api/v1/transaction-service/orders/${orderId}?${params.toString()}`
    );
    
    if (!response.data.data) {
        throw new Error('Order not found');
    }
    
    return response.data.data;
};

/**
 * Get orders by buyer with pagination support
 */
export const getOrdersByBuyer = async (buyerId: string, options?: {
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{
    orders: OrderDto[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}> => {
    const params = new URLSearchParams({
        buyerId,
        ...(options?.status && { status: options.status }),
        ...(options?.page !== undefined && { page: options.page.toString() }),
        ...(options?.limit !== undefined && { limit: options.limit.toString() })
    });

    const response = await apiClient.get<ApiResponsePageOrderDto>(
        `/api/v1/transaction-service/orders/buyer?${params.toString()}`
    );
    
    // Handle paginated response structure - extract content array from PageOrderDto
    const pageData = response.data?.data;
    const orders = pageData?.content || [];
    
    return {
        orders: Array.isArray(orders) ? orders : [],
        totalElements: pageData?.totalElements || 0,
        totalPages: pageData?.totalPages || 0,
        currentPage: pageData?.number || 0,
        pageSize: pageData?.size || 10,
        hasNext: !(pageData?.last ?? true),
        hasPrevious: !(pageData?.first ?? true),
    };
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string, buyerId: string): Promise<OrderDto> => {
    const params = new URLSearchParams({ buyerId });
    
    const response = await apiClient.put<ApiResponseOrderDto>(
        `/api/v1/transaction-service/orders/${orderId}/cancel?${params.toString()}`
    );
    
    if (!response.data.data) {
        throw new Error('Failed to cancel order');
    }
    
    return response.data.data;
};