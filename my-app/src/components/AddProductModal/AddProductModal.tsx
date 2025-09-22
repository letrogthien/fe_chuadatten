import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/productService';
import { createProduct, createProductVariant, getCategoriesByParent, getRootCategories } from '../../services/productApi';

type ProductCreateRq = components['schemas']['ProductCreateRq'];
type VariantCreateRq = components['schemas']['VariantCreateRq'];
type CategoryDto = components['schemas']['CategoryDto'];

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  categoryIds: string[];
  basePrice: number;
  tags: string[];
}

interface VariantFormData {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  availableQty: number;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    description: '',
    categoryIds: [],
    basePrice: 0,
    tags: [],
  });
  
  const [variantData, setVariantData] = useState<VariantFormData>({
    sku: '',
    attributes: {},
    price: 0,
    availableQty: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [attributesInput, setAttributesInput] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryChildren, setCategoryChildren] = useState<Record<string, CategoryDto[]>>({});

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRootCategories();
    }
  }, [isOpen]);

  const loadRootCategories = async () => {
    try {
      const rootCategories = await getRootCategories();
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error loading root categories:', error);
    }
  };

  const loadCategoryChildren = async (categoryId: string) => {
    try {
      const children = await getCategoriesByParent(categoryId);
      setCategoryChildren(prev => ({
        ...prev,
        [categoryId]: children
      }));
    } catch (error) {
      console.error('Error loading category children:', error);
    }
  };

  const toggleCategory = async (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    
    if (expandedCategories.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      // Load children if not already loaded
      if (!categoryChildren[categoryId]) {
        await loadCategoryChildren(categoryId);
      }
    }
    
    setExpandedCategories(newExpanded);
  };

  const validateProductForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!productData.name?.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }
    
    if (!productData.description?.trim()) {
      newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    }
    
    if (!productData.basePrice || productData.basePrice <= 0) {
      newErrors.basePrice = 'Giá cơ bản phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVariantForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!variantData.sku?.trim()) {
      newErrors.sku = 'SKU là bắt buộc';
    }
    
    if (!variantData.price || variantData.price <= 0) {
      newErrors.price = 'Giá bán phải lớn hơn 0';
    }
    
    if (variantData.availableQty < 0) {
      newErrors.availableQty = 'Số lượng phải lớn hơn hoặc bằng 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateProductForm()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateVariantForm()) {
      return;
    }

    setLoading(true);
    try {
      // Convert tags string to array
      const tagsArray = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Convert category selection - use dropdown selection if available, otherwise parse input
      const categoryArray = selectedCategoryIds.length > 0 
        ? selectedCategoryIds 
        : categoryInput
            .split(',')
            .map(cat => cat.trim())
            .filter(cat => cat.length > 0);

      // Create product first
      const productCreateData: ProductCreateRq = {
        name: productData.name,
        description: productData.description,
        categoryIds: categoryArray,
        attributesProduct: {},
        basePrice: productData.basePrice,
        tags: tagsArray,
        // We'll create variant separately, so use variant data here for backward compatibility
        attributesVariant: variantData.attributes,
        attributesHash: '', // Will be generated by backend
        price: variantData.price,
        availableQty: variantData.availableQty,
      };

      const createdProduct = await createProduct(productCreateData);
      
      if (createdProduct?.id) {
        // Create variant if we have additional variant data
        if (variantData.sku) {
          const variantCreateData: VariantCreateRq = {
            productId: createdProduct.id,
            sku: variantData.sku,
            attributes: variantData.attributes,
            attributesHash: '', // Will be generated by backend
            price: variantData.price,
            availableQty: variantData.availableQty,
          };
          
          await createProductVariant(variantCreateData);
        }
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ general: 'Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductData({
      name: '',
      description: '',
      categoryIds: [],
      basePrice: 0,
      tags: [],
    });
    setVariantData({
      sku: '',
      attributes: {},
      price: 0,
      availableQty: 0,
    });
    setTagsInput('');
    setCategoryInput('');
    setSelectedCategoryIds([]);
    setExpandedCategories(new Set());
    setCategoryChildren({});
    setAttributesInput({});
    setErrors({});
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleProductInputChange = (field: keyof ProductFormData, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVariantInputChange = (field: keyof VariantFormData, value: any) => {
    setVariantData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderCategoryTree = (categoryList: CategoryDto[], level: number = 0): React.ReactNode => {
    return categoryList.map((category) => (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center py-1">
          {/* Expand/Collapse button */}
          <button
            type="button"
            onClick={() => toggleCategory(category.id!)}
            className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {expandedCategories.has(category.id!) ? '▼' : '▶'}
          </button>
          
          {/* Checkbox for selection */}
          <input
            type="checkbox"
            id={`category-${category.id}`}
            checked={selectedCategoryIds.includes(category.id!)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCategoryIds(prev => [...prev, category.id!]);
              } else {
                setSelectedCategoryIds(prev => prev.filter(id => id !== category.id));
              }
            }}
            className="mr-2"
          />
          
          {/* Category name */}
          <label
            htmlFor={`category-${category.id}`}
            className="cursor-pointer text-sm text-gray-700 hover:text-gray-900"
          >
            {category.name}
          </label>
        </div>
        
        {/* Render children if expanded and loaded */}
        {expandedCategories.has(category.id!) && categoryChildren[category.id!] && (
          <div>
            {renderCategoryTree(categoryChildren[category.id!], level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStep === 1 ? 'Thêm sản phẩm mới' : 'Thêm variant cho sản phẩm'}
              </h2>
              <div className="flex items-center mt-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </span>
                <div className={`w-12 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </span>
                <span className="ml-3 text-sm text-gray-600">
                  {currentStep === 1 ? 'Thông tin sản phẩm' : 'Chi tiết variant'}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">{errors.general}</div>
            </div>
          )}

          {currentStep === 1 && (
            <>
              {/* Tên sản phẩm */}
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  id="productName"
                  type="text"
                  value={productData.name || ''}
                  onChange={(e) => handleProductInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Mô tả */}
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="productDescription"
                  value={productData.description || ''}
                  onChange={(e) => handleProductInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mô tả sản phẩm"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Giá cơ bản */}
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Giá cơ bản (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  id="basePrice"
                  type="number"
                  value={productData.basePrice || ''}
                  onChange={(e) => handleProductInputChange('basePrice', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.basePrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                  {categories.length > 0 ? (
                    renderCategoryTree(categories)
                  ) : (
                    <div className="text-gray-500 text-sm">Đang tải danh mục...</div>
                  )}
                </div>
                
                {/* Show selected categories */}
                {selectedCategoryIds.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">Đã chọn {selectedCategoryIds.length} danh mục:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCategoryIds.map(categoryId => {
                        const findCategoryName = (cats: CategoryDto[], id: string): string => {
                          for (const cat of cats) {
                            if (cat.id === id) return cat.name || id;
                            if (categoryChildren[cat.id!]) {
                              const found = findCategoryName(categoryChildren[cat.id!], id);
                              if (found !== id) return found;
                            }
                          }
                          return id;
                        };
                        
                        return (
                          <span
                            key={categoryId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {findCategoryName(categories, categoryId)}
                            <button
                              type="button"
                              onClick={() => setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId))}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Fallback to manual input if no categories loaded */}
                {categories.length === 0 && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập category IDs, ngăn cách bởi dấu phẩy (VD: cat1, cat2)"
                    />
                    <p className="text-gray-500 text-sm mt-1">Nhập các ID category, ngăn cách bởi dấu phẩy</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tags, ngăn cách bởi dấu phẩy (VD: điện tử, smartphone)"
                />
                <p className="text-gray-500 text-sm mt-1">Nhập các tag, ngăn cách bởi dấu phẩy</p>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              {/* SKU */}
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  id="sku"
                  type="text"
                  value={variantData.sku || ''}
                  onChange={(e) => handleVariantInputChange('sku', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mã SKU"
                />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>

              {/* Giá bán và số lượng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Giá bán (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="salePrice"
                    type="number"
                    value={variantData.price || ''}
                    onChange={(e) => handleVariantInputChange('price', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    value={variantData.availableQty || ''}
                    onChange={(e) => handleVariantInputChange('availableQty', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.availableQty ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.availableQty && <p className="text-red-500 text-sm mt-1">{errors.availableQty}</p>}
                </div>
              </div>

              {/* Variant Attributes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thuộc tính Variant
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tên thuộc tính (VD: Color)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Giá trị (VD: Red)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Thêm thuộc tính
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">VD: Size=L, Color=Red, Material=Cotton</p>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <div>
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  ← Quay lại
                </button>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              
              {currentStep === 1 ? (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Tiếp theo →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;