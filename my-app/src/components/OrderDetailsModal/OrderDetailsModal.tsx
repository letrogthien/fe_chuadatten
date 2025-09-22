import React from 'react';
import type { components } from '../../api-types/transactionService';
import { useAppNavigation } from '../../hooks/useAppNavigation';

type OrderDto = components['schemas']['OrderDto'];

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDto | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  const { goToUserInfo } = useAppNavigation();
  
  if (!isOpen || !order) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      case 'PROCESSING': return 'text-blue-600 bg-blue-100';
      case 'PAID': return 'text-green-600 bg-green-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Chi tiết đơn hàng #{order.id?.slice(-8)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Order Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Thông tin đơn hàng</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">ID đơn hàng:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-medium">{formatCurrency(order.totalAmount, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || '')}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái thanh toán:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus || '')}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày cập nhật:</span>
                <span className="font-medium">{formatDate(order.updatedAt)}</span>
              </div>
              {order.expiredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày hết hạn:</span>
                  <span className="font-medium">{formatDate(order.expiredAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Thông tin người mua</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">ID người mua:</span>
                <button 
                  onClick={() => goToUserInfo(order.buyerId || '')}
                  className="font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  {order.buyerId}
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID người bán:</span>
                <span className="font-medium">{order.sellerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã kiểm duyệt:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.auditFlag ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {order.auditFlag ? 'Đã kiểm duyệt' : 'Chưa kiểm duyệt'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Sản phẩm trong đơn hàng</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tổng
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">ID: {item.productId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {formatCurrency(item.unitPrice, order.currency)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatCurrency(item.subtotal, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Proofs */}
        {order.proofs && order.proofs.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Bằng chứng giao hàng</h4>
            <div className="space-y-3">
              {order.proofs.map((proof, index) => (
                <div key={proof.id || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.type || '')}`}>
                      {proof.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(proof.uploadedAt)}
                    </span>
                  </div>
                  {proof.note && (
                    <p className="text-gray-700 mb-2">{proof.note}</p>
                  )}
                  {proof.url && (
                    <a
                      href={proof.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Xem file đính kèm →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Logs */}
        {order.logs && order.logs.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Lịch sử đơn hàng</h4>
            <div className="space-y-3">
              {order.logs.map((log, index) => (
                <div key={log.id || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.fromStatus} → {log.toStatus}
                      </p>
                      {log.note && (
                        <p className="text-gray-600 text-sm mt-1">{log.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDate(log.createdAt)}</p>
                      <p className="text-xs text-gray-400">ID: {log.changedBy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Disputes */}
        {order.disputes && order.disputes.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Tranh chấp</h4>
            <div className="space-y-3">
              {order.disputes.map((dispute, index) => (
                <div key={dispute.id || index} className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status || '')}`}>
                        {dispute.status}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {dispute.issueType}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(dispute.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{dispute.description}</p>
                  {dispute.resolvedAt && (
                    <p className="text-sm text-green-600 mt-2">
                      Đã giải quyết: {formatDate(dispute.resolvedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Refunds */}
        {order.refunds && order.refunds.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Hoàn tiền</h4>
            <div className="space-y-3">
              {order.refunds.map((refund, index) => (
                <div key={refund.id || index} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status || '')}`}>
                        {refund.status}
                      </span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(refund.amount, order.currency)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(refund.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{refund.reason}</p>
                  {refund.completedAt && (
                    <p className="text-sm text-green-600 mt-2">
                      Hoàn thành: {formatDate(refund.completedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;