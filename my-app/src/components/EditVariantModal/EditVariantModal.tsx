import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/productService';
import { updateProductVariant } from '../../services/productApi';

type ProductVariantDto = components['schemas']['ProductVariantDto'];
type VariantCreateRq = components['schemas']['VariantCreateRq'];

interface EditVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  variant: ProductVariantDto | null;
  productId: string;
}

const EditVariantModal: React.FC<EditVariantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  variant,
  productId
}) => {
  const [formData, setFormData] = useState<VariantCreateRq>({
    productId: productId,
    sku: '',
    price: 0,
    availableQty: 0,
    attributes: {},
    attributesHash: ''
  });
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (variant && isOpen) {
      setFormData({
        productId: productId,
        sku: variant.sku || '',
        price: variant.price || 0,
        availableQty: variant.availableQty || 0,
        attributes: variant.attributes || {},
        attributesHash: variant.attributesHash || ''
      });
    }
  }, [variant, productId, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku?.trim()) {
      newErrors.sku = 'SKU không được để trống';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    if (formData.availableQty === undefined || formData.availableQty < 0) {
      newErrors.availableQty = 'Số lượng phải lớn hơn hoặc bằng 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAttribute = () => {
    if (attributeKey.trim() && attributeValue.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeKey.trim()]: attributeValue.trim()
        }
      }));
      setAttributeKey('');
      setAttributeValue('');
    }
  };

  const removeAttribute = (key: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return {
        ...prev,
        attributes: newAttributes
      };
    });
  };

  const generateAttributesHash = (attributes: Record<string, string>): string => {
    const sortedKeys = Object.keys(attributes).sort();
    const attributeString = sortedKeys
      .map(key => `${key}:${attributes[key]}`)
      .join('|');
    
    // Simple hash function (in production, consider using a proper hash library)
    let hash = 0;
    for (let i = 0; i < attributeString.length; i++) {
      const char = attributeString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !variant?.id) {
      return;
    }

    try {
      setLoading(true);

      // Generate attributes hash
      const attributesHash = generateAttributesHash(formData.attributes || {});

      const variantData: VariantCreateRq = {
        ...formData,
        attributesHash
      };

      await updateProductVariant(variant.id, variantData);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating variant:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi cập nhật biến thể' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: productId,
      sku: '',
      price: 0,
      availableQty: 0,
      attributes: {},
      attributesHash: ''
    });
    setAttributeKey('');
    setAttributeValue('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Chỉnh sửa biến thể: {variant?.sku}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Đóng</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.sku ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nhập SKU biến thể"
            />
            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Giá (VNĐ) *
            </label>
            <input
              type="number"
              id="price"
              min="0"
              step="1000"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nhập giá sản phẩm"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          {/* Available Quantity */}
          <div>
            <label htmlFor="availableQty" className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng có sẵn *
            </label>
            <input
              type="number"
              id="availableQty"
              min="0"
              value={formData.availableQty}
              onChange={(e) => setFormData(prev => ({ ...prev, availableQty: Number(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.availableQty ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nhập số lượng có sẵn"
            />
            {errors.availableQty && <p className="mt-1 text-sm text-red-600">{errors.availableQty}</p>}
          </div>

          {/* Attributes */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Thuộc tính sản phẩm
            </div>
            
            {/* Add new attribute */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={attributeKey}
                onChange={(e) => setAttributeKey(e.target.value)}
                placeholder="Tên thuộc tính (vd: color, size)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={attributeValue}
                onChange={(e) => setAttributeValue(e.target.value)}
                placeholder="Giá trị (vd: red, XL)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addAttribute}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm
              </button>
            </div>

            {/* Display existing attributes */}
            {formData.attributes && Object.keys(formData.attributes).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Thuộc tính hiện tại:</h4>
                {Object.entries(formData.attributes).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm">
                      <strong>{key}:</strong> {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttribute(key)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current status info */}
          {variant && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin hiện tại:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>Số lượng đã bán: {variant.soldQty || 0}</div>
                <div>Số lượng đặt trước: {variant.reservedQty || 0}</div>
                <div>Trạng thái: {variant.status || 'N/A'}</div>
                <div>Cập nhật lần cuối: {variant.updatedAt ? new Date(variant.updatedAt).toLocaleString('vi-VN') : 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật biến thể'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVariantModal;