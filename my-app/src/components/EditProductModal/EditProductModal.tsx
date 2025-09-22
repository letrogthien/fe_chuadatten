import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/productService';
import { getCategoriesByParent, getRootCategories, updateProduct } from '../../services/productApi';

type ProductDto = components['schemas']['ProductDto'];
type ProductCreateRq = components['schemas']['ProductCreateRq'];
type CategoryDto = components['schemas']['CategoryDto'];

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: ProductDto | null;
}

interface ProductFormData {
  name: string;
  description: string;
  categoryIds: string[];
  basePrice: number;
  tags: string[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryIds: [],
    basePrice: 0,
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryChildren, setCategoryChildren] = useState<Record<string, CategoryDto[]>>({});
  const [tagsInput, setTagsInput] = useState('');

  // Load product data when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        categoryIds: product.categoryIds || [],
        basePrice: product.basePrice || 0,
        tags: product.tags || [],
      });
      setTagsInput((product.tags || []).join(', '));
      loadRootCategories();
    }
  }, [isOpen, product]);

  const loadRootCategories = async () => {
    try {
      const rootCategories = await getRootCategories();
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const toggleCategory = async (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      
      // Load children if not already loaded
      if (!categoryChildren[categoryId]) {
        try {
          const children = await getCategoriesByParent(categoryId);
          setCategoryChildren(prev => ({
            ...prev,
            [categoryId]: children
          }));
        } catch (error) {
          console.error('Error loading category children:', error);
        }
      }
    }
    
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => {
      const newCategoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      
      return {
        ...prev,
        categoryIds: newCategoryIds
      };
    });
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const renderCategoryTree = (categoriesList: CategoryDto[], level: number = 0) => {
    return categoriesList.map(category => (
      <div key={category.id} className={`ml-${level * 4}`}>
        <div className="flex items-center py-1">
          <button
            type="button"
            onClick={() => toggleCategory(category.id || '')}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            {expandedCategories.has(category.id || '') ? '▼' : '▶'}
          </button>
          <label className="flex items-center flex-1">
            <input
              type="checkbox"
              checked={formData.categoryIds.includes(category.id || '')}
              onChange={() => handleCategorySelect(category.id || '')}
              className="mr-2"
            />
            {category.name}
          </label>
        </div>
        
        {expandedCategories.has(category.id || '') && categoryChildren[category.id || ''] && (
          <div className="ml-4">
            {renderCategoryTree(categoryChildren[category.id || ''], level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product?.id) return;
    
    setLoading(true);
    
    try {
      const updateData: ProductCreateRq = {
        name: formData.name,
        description: formData.description,
        categoryIds: formData.categoryIds,
        basePrice: formData.basePrice,
        tags: formData.tags,
      };
      
      await updateProduct(product.id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa sản phẩm</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả sản phẩm
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mô tả sản phẩm"
            />
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá cơ bản *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={formData.basePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập giá cơ bản"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục sản phẩm
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
              {categories.length > 0 ? (
                renderCategoryTree(categories)
              ) : (
                <p className="text-gray-500">Đang tải danh mục...</p>
              )}
            </div>
            {formData.categoryIds.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn {formData.categoryIds.length} danh mục
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;