import type { components } from '../api-types/productService';
import apiClientProduct from './apiClientProduct';

type CategoryDto = components['schemas']['CategoryDto'];
type ApiResponseCategoryDto = components['schemas']['ApiResponseCategoryDto'];
type ApiResponseListCategoryDto = components['schemas']['ApiResponseListCategoryDto'];
type ApiResponseVoid = components['schemas']['ApiResponseVoid'];

// ===============================
// CATEGORY ENDPOINTS (PUBLIC)
// ===============================

/**
 * Lấy tất cả danh mục gốc (dạng mảng)
 */
export async function fetchRootCategories(): Promise<CategoryDto[]> {
  try {
    const res = await apiClientProduct.get<ApiResponseListCategoryDto>(
      '/api/v1/product-service/categories/root'
    );
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching root categories:', error);
    return [];
  }
}

/**
 * Lấy danh mục gốc
 */
export async function fetchRootCategory(): Promise<CategoryDto | null> {
  try {
    const res = await apiClientProduct.get<ApiResponseCategoryDto>('/api/v1/product-service/categories/root');
    return res.data.data || null;
  } catch (error) {
    console.error('Error fetching root category:', error);
    return null;
  }
}

/**
 * Lấy danh mục con theo parentId
 */
export async function fetchCategoryChildren(parentId: string): Promise<CategoryDto[]> {
  try {
    const res = await apiClientProduct.get<ApiResponseListCategoryDto>(
      `/api/v1/product-service/categories/${parentId}/children`
    );
    return res.data.data || [];
  } catch (error) {
    console.error('Error fetching category children:', error);
    return [];
  }
}

/**
 * Lấy category theo ID
 */
export async function getCategoryById(id: string): Promise<CategoryDto | null> {
  try {
    const res = await apiClientProduct.get<ApiResponseCategoryDto>(
      `/api/v1/product-service/categories/${id}`
    );
    return res.data.data || null;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null;
  }
}

/**
 * Lấy category theo slug
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryDto | null> {
  try {
    const res = await apiClientProduct.get<ApiResponseCategoryDto>(
      `/api/v1/product-service/categories/slug/${slug}`
    );
    return res.data.data || null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
}

// ===============================
// ADMIN ENDPOINTS
// ===============================

/**
 * [ADMIN] Tạo category mới
 */
export async function createCategory(categoryData: CategoryDto): Promise<CategoryDto | null> {
  try {
    const res = await apiClientProduct.post<ApiResponseCategoryDto>(
      '/api/v1/product-service/admin/categories',
      categoryData
    );
    return res.data.data || null;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

/**
 * [ADMIN] Cập nhật category theo ID
 */
export async function updateCategory(id: string, categoryData: CategoryDto): Promise<CategoryDto | null> {
  try {
    const res = await apiClientProduct.put<ApiResponseCategoryDto>(
      `/api/v1/product-service/admin/categories/${id}`,
      categoryData
    );
    return res.data.data || null;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

/**
 * [ADMIN] Xóa category theo ID
 */
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await apiClientProduct.delete<ApiResponseVoid>(
      `/api/v1/product-service/admin/categories/${id}`
    );
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ===============================
// HELPER FUNCTIONS
// ===============================

/**
 * Lấy tất cả categories với structure phân cấp
 */
export async function getAllCategoriesHierarchy(): Promise<CategoryDto[]> {
  try {
    const rootCategories = await fetchRootCategories();
    
    // Recursively fetch children for each root category
    const categoriesWithChildren = await Promise.all(
      rootCategories.map(async (category) => {
        const children = await fetchCategoryChildren(category.id!);
        return {
          ...category,
          children: children || []
        };
      })
    );
    
    return categoriesWithChildren;
  } catch (error) {
    console.error('Error fetching categories hierarchy:', error);
    return [];
  }
}

/**
 * Tìm kiếm category theo tên (local search trong danh sách đã load)
 */
export function searchCategoriesByName(categories: CategoryDto[], searchTerm: string): CategoryDto[] {
  if (!searchTerm.trim()) return categories;
  
  return categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

/**
 * Lấy breadcrumb path cho category
 */
export async function getCategoryBreadcrumb(categoryId: string): Promise<CategoryDto[]> {
  try {
    const category = await getCategoryById(categoryId);
    if (!category) return [];
    
    const breadcrumb: CategoryDto[] = [category];
    
    // Traverse up through ancestors
    if (category.ancestors && category.ancestors.length > 0) {
      const reversedAncestors = [...category.ancestors].reverse();
      for (const ancestorId of reversedAncestors) {
        const ancestor = await getCategoryById(ancestorId);
        if (ancestor) {
          breadcrumb.unshift(ancestor);
        }
      }
    }
    
    return breadcrumb;
  } catch (error) {
    console.error('Error getting category breadcrumb:', error);
    return [];
  }
}
