import type { components } from '../api-types/transactionService';
import apiClient from './apiClientTransaction';

type OrderCreateRq = components['schemas']['OrderCreateRq'];
type OrderDto = components['schemas']['OrderDto'];
type ApiResponseOrderDto = components['schemas']['ApiResponseOrderDto'];
type ApiResponsePageOrderDto = components['schemas']['ApiResponsePageOrderDto'];

// Analytics Types
type AnalyticsOverviewDTO = components['schemas']['AnalyticsOverviewDTO'];
type ApiResponseAnalyticsOverviewDTO = components['schemas']['ApiResponseAnalyticsOverviewDTO'];
type TopProductDTO = components['schemas']['TopProductDTO'];
type ApiResponseListTopProductDTO = components['schemas']['ApiResponseListTopProductDTO'];
type RevenueChartDataDTO = components['schemas']['RevenueChartDataDTO'];
type ApiResponseListRevenueChartDataDTO = components['schemas']['ApiResponseListRevenueChartDataDTO'];
type CustomerAnalyticsDTO = components['schemas']['CustomerAnalyticsDTO'];
type ApiResponseCustomerAnalyticsDTO = components['schemas']['ApiResponseCustomerAnalyticsDTO'];

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
 * Get orders by seller with pagination support
 */
export const getOrdersBySeller = async (sellerId: string, options?: {
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
        sellerId,
        ...(options?.status && { status: options.status }),
        ...(options?.page !== undefined && { page: options.page.toString() }),
        ...(options?.limit !== undefined && { limit: options.limit.toString() })
    });

    const response = await apiClient.get<ApiResponsePageOrderDto>(
        `/api/v1/transaction-service/orders/seller?${params.toString()}`
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
 * Upload delivery proof for an order
 */
export const uploadDeliveryProof = async (
  orderId: string,
  sellerId: string,
  proofData: {
    type: "SCREENSHOT" | "VIDEO" | "TEXT_NOTE" | "DELIVERY" | "PURCHASE";
    url: string;
    note?: string;
  },
  file: File
): Promise<OrderDto> => {
  const formData = new FormData();

  formData.append(
    "proofData",
    new Blob(
      [
        JSON.stringify({
          orderId,
          sellerId,
          type: proofData.type,
          url: proofData.url,
          note: proofData.note || "",
        }),
      ],
      { type: "application/json" }
    )
  );

  formData.append("file", file);

  const response = await apiClient.post<ApiResponseOrderDto>(
    `/api/v1/transaction-service/orders/${orderId}/proof`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.data) {
    throw new Error("Failed to upload delivery proof");
  }

  return response.data.data;
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

// ========== ANALYTICS ENDPOINTS ==========

/**
 * Get analytics overview for seller
 */
export const getAnalyticsOverview = async (sellerId: string, period?: number): Promise<AnalyticsOverviewDTO> => {
    const params = new URLSearchParams();
    if (period) {
        params.append('period', period.toString());
    }
    
    const baseUrl = `/api/v1/transaction-service/analytics/seller/${sellerId}/overview`;
    const queryString = params.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    const response = await apiClient.get<ApiResponseAnalyticsOverviewDTO>(url);
    
    if (!response.data.data) {
        throw new Error('Failed to get analytics overview');
    }
    
    return response.data.data;
};

/**
 * Get top products for seller
 */
export const getTopProducts = async (sellerId: string, period?: number, limit?: number): Promise<TopProductDTO[]> => {
    const params = new URLSearchParams();
    if (period) {
        params.append('period', period.toString());
    }
    if (limit) {
        params.append('limit', limit.toString());
    }
    
    const baseUrl = `/api/v1/transaction-service/analytics/seller/${sellerId}/top-products`;
    const queryString = params.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    const response = await apiClient.get<ApiResponseListTopProductDTO>(url);
    
    return response.data.data || [];
};

/**
 * Get revenue chart data for seller
 */
export const getRevenueChartData = async (
    sellerId: string, 
    period?: string, 
    groupBy?: string
): Promise<RevenueChartDataDTO[]> => {
    const params = new URLSearchParams();
    if (period) {
        params.append('period', period);
    }
    if (groupBy) {
        params.append('groupBy', groupBy);
    }
    
    const baseUrl = `/api/v1/transaction-service/analytics/seller/${sellerId}/revenue-chart`;
    const queryString = params.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    const response = await apiClient.get<ApiResponseListRevenueChartDataDTO>(url);
    
    return response.data.data || [];
};

/**
 * Get customer analytics for seller
 */
export const getCustomerAnalytics = async (sellerId: string, period?: number): Promise<CustomerAnalyticsDTO> => {
    const params = new URLSearchParams();
    if (period) {
        params.append('period', period.toString());
    }
    
    const baseUrl = `/api/v1/transaction-service/analytics/seller/${sellerId}/customers`;
    const queryString = params.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    const response = await apiClient.get<ApiResponseCustomerAnalyticsDTO>(url);
    
    if (!response.data.data) {
        throw new Error('Failed to get customer analytics');
    }
    
    return response.data.data;
};