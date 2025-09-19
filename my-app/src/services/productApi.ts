import type { components } from "../api-types/productService";
import apiClientProduct from "./apiClientProduct";

type ApiResponsePageProductDto = components["schemas"]["ApiResponsePageProductDto"];
type ApiResponseProductDto = components["schemas"]["ApiResponseProductDto"];
type ApiResponseListProductVariantDto = components["schemas"]["ApiResponseListProductVariantDto"];
type ProductDto = components["schemas"]["ProductDto"];
type ProductVariantDto = components["schemas"]["ProductVariantDto"];

// Type for hot deal response
export type HotDealVariant = {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  attributesHash: string;
  price: number;
  availableQty: number;
  reservedQty: number;
  soldQty: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type HotDealResponse = {
  data: HotDealVariant[];
  message: string | null;
  timestamp: string;
  status: string;
};

/**
 * Fetch hot deal product variants
 */
export const fetchHotDealProducts = async (limit: number = 6): Promise<HotDealVariant[]> => {
  try {
    const response = await apiClientProduct.get<HotDealResponse>(
      `/api/v1/product-service/product-variants/hot-deal`,
      {
        params: { limit },
      }
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching hot deal products:", error);
    throw error;
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<ProductDto | null> => {
  try {
    const response = await apiClientProduct.get<ApiResponseProductDto>(`/api/v1/product-service/products/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug: string): Promise<ProductDto | null> => {
  try {
    const response = await apiClientProduct.get<ApiResponseProductDto>(`/api/v1/product-service/products/slug/${slug}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
};

/**
 * Get product variants by product ID
 */
export const getVariantsByProduct = async (productId: string): Promise<ProductVariantDto[]> => {
  try {
    const response = await apiClientProduct.get<ApiResponseListProductVariantDto>(`/api/v1/product-service/product-variants/product/${productId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching variants by product:', error);
    return [];
  }
};

/**
 * Search products with pagination
 */
export const searchProducts = async (
  keyword: string,
  page: number = 0,
  size: number = 10
): Promise<{ products: ProductDto[]; totalElements: number; totalPages: number; currentPage: number }> => {
  try {
    const response = await apiClientProduct.get<ApiResponsePageProductDto>('/api/v1/product-service/products/search', {
      params: { keyword, page, size }
    });
    
    const pageData = response.data.data;
    return {
      products: pageData?.content || [],
      totalElements: pageData?.totalElements || 0,
      totalPages: pageData?.totalPages || 0,
      currentPage: pageData?.number || 0,
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      products: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
    };
  }
};

/**
 * Get all products with pagination
 */
export const getAllProducts = async (
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
): Promise<{ products: ProductDto[]; totalElements: number; totalPages: number; currentPage: number }> => {
  try {
    const response = await apiClientProduct.get<ApiResponsePageProductDto>('/api/v1/product-service/products', {
      params: { page, size, sortBy, sortDirection }
    });
    
    const pageData = response.data.data;
    return {
      products: pageData?.content || [],
      totalElements: pageData?.totalElements || 0,
      totalPages: pageData?.totalPages || 0,
      currentPage: pageData?.number || 0,
    };
  } catch (error) {
    console.error('Error fetching all products:', error);
    return {
      products: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
    };
  }
};

/**
 * Fetch products by category ID with pagination
 */
export const fetchProductsByCategory = async (
  categoryId: string,
  page: number = 0,
  size: number = 20
): Promise<{ products: ProductDto[]; totalElements: number; totalPages: number; currentPage: number }> => {
  try {
    const response = await apiClientProduct.get<ApiResponsePageProductDto>(
      `/api/v1/product-service/products/category/${categoryId}`,
      {
        params: {
          page,
          size,
        },
      }
    );

    const pageData = response.data.data;
    return {
      products: pageData?.content || [],
      totalElements: pageData?.totalElements || 0,
      totalPages: pageData?.totalPages || 0,
      currentPage: pageData?.number || 0,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      products: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
    };
  }
};