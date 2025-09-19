import type { components } from '../api-types/productService';
import apiClientProduct from './apiClientProduct';

// Lấy tất cả danh mục gốc (dạng mảng)
export async function fetchRootCategories() {
  const res = await apiClientProduct.get<components['schemas']['ApiResponseListCategoryDto']>(
    '/api/v1/product-service/categories/root'
  );
  return res.data.data;
}


// Lấy danh mục gốc
export async function fetchRootCategory() {
  const res = await apiClientProduct.get<components['schemas']['CategoryDto']>('/api/v1/product-service/categories/root');
  return res.data;
}

// Lấy danh mục con theo parentId
export async function fetchCategoryChildren(parentId: string) {
  const res = await apiClientProduct.get<components['schemas']['ApiResponseListCategoryDto']>(
    `/api/v1/product-service/categories/${parentId}/children`
  );
  return res.data.data;
}
