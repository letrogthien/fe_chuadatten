import type { components } from "../api-types/productService";
import apiClientProduct from "./apiClientProduct";

type ApiResponsePageProductDto = components["schemas"]["ApiResponsePageProductDto"];
type ApiResponseProductDto = components["schemas"]["ApiResponseProductDto"];
type ApiResponseListProductVariantDto = components["schemas"]["ApiResponseListProductVariantDto"];
type ApiResponseProductVariantDto = components["schemas"]["ApiResponseProductVariantDto"];
type ApiResponseListCategoryDto = components["schemas"]["ApiResponseListCategoryDto"];
type ProductDto = components["schemas"]["ProductDto"];
type ProductVariantDto = components["schemas"]["ProductVariantDto"];
type ProductCreateRq = components["schemas"]["ProductCreateRq"];
type VariantCreateRq = components["schemas"]["VariantCreateRq"];
type CategoryDto = components["schemas"]["CategoryDto"];

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
 * Get products by seller with pagination
 */
export const getProductsBySeller = async (
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
): Promise<{ products: ProductDto[]; totalElements: number; totalPages: number; currentPage: number }> => {
  try {
    const response = await apiClientProduct.get<ApiResponsePageProductDto>('/api/v1/product-service/products/seller', {
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
    console.error('Error fetching seller products:', error);
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

/**
 * Create a new product
 */
export const createProduct = async (productData: ProductCreateRq): Promise<ProductDto | null> => {
  try {
    const response = await apiClientProduct.post<ApiResponseProductDto>(
      '/api/v1/product-service/products',
      productData
    );
    return response.data.data || null;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Create a new product variant
 */
export const createProductVariant = async (variantData: VariantCreateRq): Promise<ProductVariantDto | null> => {
  try {
    const response = await apiClientProduct.post<ApiResponseProductVariantDto>(
      '/api/v1/product-service/product-variants',
      variantData
    );
    return response.data.data || null;
  } catch (error) {
    console.error('Error creating product variant:', error);
    throw error;
  }
};

/**
 * Get root categories (top-level categories without parent)
 */
export const getRootCategories = async (): Promise<CategoryDto[]> => {
  try {
    // Assuming we can get root categories by calling with a special root ID
    // You may need to adjust this endpoint based on your API
    const response = await apiClientProduct.get<ApiResponseListCategoryDto>(
      '/api/v1/product-service/categories/root'
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching root categories:', error);
    return [];
  }
};

/**
 * Get categories by parent ID
 */
export const getCategoriesByParent = async (parentId: string): Promise<CategoryDto[]> => {
  try {
    const response = await apiClientProduct.get<ApiResponseListCategoryDto>(
      `/api/v1/product-service/categories/${parentId}/children`
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Delete product by ID
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    await apiClientProduct.delete(`/api/v1/product-service/products/${productId}`);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Update product by ID
 */
export const updateProduct = async (productId: string, productData: ProductCreateRq): Promise<ProductDto | null> => {
  try {
    const response = await apiClientProduct.put<ApiResponseProductDto>(
      `/api/v1/product-service/products/${productId}`,
      productData
    );
    return response.data.data || null;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Get product variants by product ID
 */
export const getProductVariants = async (productId: string): Promise<ProductVariantDto[]> => {
  try {
    const response = await apiClientProduct.get<ApiResponseListProductVariantDto>(
      `/api/v1/product-service/products/${productId}/variants`
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return [];
  }
};

/**
 * Update product variant
 */
export const updateProductVariant = async (variantId: string, variantData: VariantCreateRq): Promise<ProductVariantDto | null> => {
  try {
    const response = await apiClientProduct.put<ApiResponseProductVariantDto>(
      `/api/v1/product-service/product-variants/${variantId}`,
      variantData
    );
    return response.data.data || null;
  } catch (error) {
    console.error('Error updating product variant:', error);
    throw error;
  }
};

/**
 * Delete product variant
 */
export const deleteProductVariant = async (variantId: string): Promise<boolean> => {
  try {
    await apiClientProduct.delete(`/api/v1/product-service/product-variants/${variantId}`);
    return true;
  } catch (error) {
    console.error('Error deleting product variant:', error);
    throw error;
  }
};