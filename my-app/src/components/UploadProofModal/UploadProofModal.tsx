import React, { useState } from 'react';
import type { components } from '../../api-types/transactionService';
import { uploadDeliveryProof } from '../../services/transactionApi';

type OrderDto = components['schemas']['OrderDto'];

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: OrderDto) => void;
  order: OrderDto | null;
  sellerId: string;
}

const UploadProofModal: React.FC<UploadProofModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  order,
  sellerId
}) => {
  const [proofType, setProofType] = useState<'SCREENSHOT' | 'VIDEO' | 'TEXT_NOTE' | 'DELIVERY' | 'PURCHASE'>('DELIVERY');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setProofType('DELIVERY');
    setNote('');
    setFile(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !file) {
      setError('Vui lòng chọn file để upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create a temporary URL for the file (in real app, you'd upload to cloud storage)
      const tempUrl = URL.createObjectURL(file);

      const updatedOrder = await uploadDeliveryProof(
        order.id!,
        sellerId,
        {
          type: proofType,
          url: tempUrl,
          note: note
        },
        file
      );

      onSuccess(updatedOrder);
      handleClose();
    } catch (error) {
      console.error('Error uploading proof:', error);
      setError('Lỗi khi upload bằng chứng giao hàng');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Bằng chứng giao hàng
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Đơn hàng: <span className="font-medium">#{order.id?.slice(-8)}</span></p>
          <p className="text-sm text-gray-600">Tổng tiền: <span className="font-medium">{order.totalAmount?.toLocaleString()} {order.currency}</span></p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="proofType" className="block text-sm font-medium text-gray-700 mb-2">
              Loại bằng chứng
            </label>
            <select
              id="proofType"
              value={proofType}
              onChange={(e) => setProofType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            >
              <option value="DELIVERY">Bằng chứng giao hàng</option>
              <option value="SCREENSHOT">Screenshot</option>
              <option value="VIDEO">Video</option>
              <option value="PURCHASE">Bằng chứng mua hàng</option>
              <option value="TEXT_NOTE">Ghi chú văn bản</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              File bằng chứng *
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ: hình ảnh, video, PDF, Word
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Thêm ghi chú về bằng chứng..."
              disabled={uploading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !file}
            >
              {uploading ? 'Đang upload...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadProofModal;