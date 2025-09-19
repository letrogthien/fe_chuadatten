import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/transactionService';

type OrderRefundDto = components['schemas']['OrderRefundDto'];
type OrderRefundCreateRq = components['schemas']['OrderRefundCreateRq'];

// Mock data theo đúng struct OrderRefundDto
const mockRefunds: OrderRefundDto[] = [
  {
    id: 'refund1',
    orderId: '1',
    requestBy: 'user123',
    amount: 15.99,
    status: 'PENDING',
    reason: 'Sản phẩm không đúng mô tả',
    createdAt: '2024-03-16T09:30:00Z'
  },
  {
    id: 'refund2',
    orderId: '2',
    requestBy: 'user123',
    amount: 50.00,
    status: 'APPROVED',
    reason: 'Sản phẩm bị lỗi',
    createdAt: '2024-03-15T14:20:00Z',
    completedAt: '2024-03-15T16:45:00Z'
  },
  {
    id: 'refund3',
    orderId: '3',
    requestBy: 'user123',
    amount: 25.00,
    status: 'REJECTED',
    reason: 'Muốn đổi ý',
    createdAt: '2024-03-14T11:15:00Z',
    completedAt: '2024-03-14T18:30:00Z'
  }
];

// Status color mapping for refunds
const getRefundStatusColor = (status?: string) => {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 bg-green-100';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100';
    case 'PROCESSING':
      return 'text-blue-600 bg-blue-100';
    case 'REJECTED':
      return 'text-red-600 bg-red-100';
    case 'COMPLETED':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Status Vietnamese mapping for refunds
const getRefundStatusText = (status?: string) => {
  switch (status) {
    case 'APPROVED':
      return 'Đã chấp nhận';
    case 'PENDING':
      return 'Chờ xử lý';
    case 'PROCESSING':
      return 'Đang xử lý';
    case 'REJECTED':
      return 'Đã từ chối';
    case 'COMPLETED':
      return 'Đã hoàn thành';
    default:
      return status || 'Không xác định';
  }
};

const RefundManagement: React.FC = () => {
  const [refunds, setRefunds] = useState<OrderRefundDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRefund, setNewRefund] = useState<Partial<OrderRefundCreateRq>>({
    orderId: '',
    requestBy: 'user123', // In real app, get from user context
    reason: ''
  });

  useEffect(() => {
    // Simulate API call
    const fetchRefunds = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await transactionApi.getRefundsByUser();
        // setRefunds(response.data);
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefunds(mockRefunds);
      } catch (error) {
        console.error('Error fetching refunds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, []);

  const filteredRefunds = selectedStatus === 'ALL' 
    ? refunds 
    : refunds.filter(refund => refund.status === selectedStatus);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '$0.00';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefund.orderId || !newRefund.reason) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await transactionApi.createRefund(newRefund as OrderRefundCreateRq);
      
      // Simulate API response
      const mockNewRefund: OrderRefundDto = {
        id: `refund${Date.now()}`,
        orderId: newRefund.orderId,
        requestBy: newRefund.requestBy,
        amount: Math.random() * 100, // In real app, get from order
        status: 'PENDING',
        reason: newRefund.reason,
        createdAt: new Date().toISOString()
      };

      setRefunds(prev => [mockNewRefund, ...prev]);
      setNewRefund({ orderId: '', requestBy: 'user123', reason: '' });
      setShowCreateForm(false);
      alert('Yêu cầu hoàn tiền đã được tạo thành công');
    } catch (error) {
      console.error('Error creating refund:', error);
      alert('Có lỗi xảy ra khi tạo yêu cầu hoàn tiền');
    }
  };

  const handleCancelRefund = async (refundId?: string) => {
    if (!refundId) return;
    
    if (window.confirm('Bạn có chắc chắn muốn hủy yêu cầu hoàn tiền này?')) {
      try {
        // TODO: Replace with actual API call
        // await transactionApi.cancelRefund(refundId);
        
        // Update local state
        setRefunds(prevRefunds => 
          prevRefunds.filter(refund => refund.id !== refundId)
        );
        alert('Yêu cầu hoàn tiền đã được hủy');
      } catch (error) {
        console.error('Error canceling refund:', error);
        alert('Có lỗi xảy ra khi hủy yêu cầu hoàn tiền');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý hoàn tiền</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Hủy' : 'Tạo yêu cầu hoàn tiền'}
          </button>
        </div>

        {/* Create Refund Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo yêu cầu hoàn tiền mới</h3>
            <form onSubmit={handleCreateRefund}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đơn hàng *
                  </label>
                  <input
                    type="text"
                    value={newRefund.orderId}
                    onChange={(e) => setNewRefund(prev => ({ ...prev, orderId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mã đơn hàng"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Người yêu cầu
                  </label>
                  <input
                    type="text"
                    value={newRefund.requestBy}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hoàn tiền *
                </label>
                <textarea
                  value={newRefund.reason}
                  onChange={(e) => setNewRefund(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mô tả lý do cần hoàn tiền..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo yêu cầu
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Status filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({refunds.length})
          </button>
          {['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(status => {
            const count = refunds.filter(refund => refund.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getRefundStatusText(status)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredRefunds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Không có yêu cầu hoàn tiền nào</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRefunds.map((refund) => (
            <div key={refund.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Hoàn tiền #{refund.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRefundStatusColor(refund.status)}`}>
                      {getRefundStatusText(refund.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Đơn hàng: #{refund.orderId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tạo lúc: {formatDate(refund.createdAt)}
                  </p>
                  {refund.completedAt && (
                    <p className="text-sm text-gray-500">
                      Hoàn thành: {formatDate(refund.completedAt)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice(refund.amount)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Lý do hoàn tiền</h5>
                <p className="text-sm text-gray-600">{refund.reason}</p>
              </div>

              <div className="flex justify-end gap-3">
                {refund.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelRefund(refund.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hủy yêu cầu
                  </button>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefundManagement;