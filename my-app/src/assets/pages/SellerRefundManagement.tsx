import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/transactionService';
import { useUser } from '../../context/UserContext';
import * as transactionApi from '../../services/transactionApi';
import { getErrorMessage } from '../../utils/apiErrorHandler';

type OrderRefundDto = components['schemas']['OrderRefundDto'];
type OrderDto = components['schemas']['OrderDto'];

// Mock data cho seller - các refund yêu cầu từ buyers của orders của seller này
const mockSellerRefunds: OrderRefundDto[] = [
  {
    id: 'refund-s001',
    orderId: 'order-s001',
    requestBy: 'buyer001',
    amount: 25.99,
    status: 'PENDING',
    reason: 'Tài khoản game không thể đăng nhập được. Đã thử nhiều lần nhưng vẫn báo lỗi.',
    createdAt: '2024-03-18T10:15:00Z'
  },
  {
    id: 'refund-s002',
    orderId: 'order-s002',
    requestBy: 'buyer002',
    amount: 15.00,
    status: 'PENDING',
    reason: 'Sản phẩm không đúng như mô tả trong tin đăng.',
    createdAt: '2024-03-17T14:30:00Z'
  },
  {
    id: 'refund-s003',
    orderId: 'order-s003',
    requestBy: 'buyer003',
    amount: 45.00,
    status: 'PROCESSING',
    reason: 'Code game bị lỗi, không thể kích hoạt được.',
    createdAt: '2024-03-16T09:20:00Z'
  },
  {
    id: 'refund-s004',
    orderId: 'order-s004',
    requestBy: 'buyer004',
    amount: 30.00,
    status: 'APPROVED',
    reason: 'Seller giao nhầm sản phẩm khác.',
    createdAt: '2024-03-15T16:45:00Z',
    completedAt: '2024-03-16T10:30:00Z'
  },
  {
    id: 'refund-s005',
    orderId: 'order-s005',
    requestBy: 'buyer005',
    amount: 20.00,
    status: 'REJECTED',
    reason: 'Muốn đổi ý không mua nữa',
    createdAt: '2024-03-14T11:20:00Z',
    completedAt: '2024-03-14T13:45:00Z'
  }
];

// Mock orders data cho seller
const mockSellerOrders: Record<string, { productName: string; buyerEmail: string }> = {
  'order-s001': { productName: 'Minecraft Premium Account', buyerEmail: 'buyer001@example.com' },
  'order-s002': { productName: 'Steam Wallet $15', buyerEmail: 'buyer002@example.com' },
  'order-s003': { productName: 'Epic Games Gift Card', buyerEmail: 'buyer003@example.com' },
  'order-s004': { productName: 'Roblox Robux 1000', buyerEmail: 'buyer004@example.com' },
  'order-s005': { productName: 'Apple iTunes Card', buyerEmail: 'buyer005@example.com' }
};

// Status color mapping
const getRefundStatusColor = (status?: string) => {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'PROCESSING':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    case 'REJECTED':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'COMPLETED':
      return 'text-green-600 bg-green-100 border-green-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

// Status Vietnamese mapping
const getRefundStatusInfo = (status?: string) => {
  switch (status) {
    case 'APPROVED':
      return { text: 'Đã chấp nhận' };
    case 'PENDING':
      return { text: 'Chờ xử lý' };
    case 'PROCESSING':
      return { text: 'Đang xử lý' };
    case 'REJECTED':
      return { text: 'Đã từ chối' };
    case 'COMPLETED':
      return { text: 'Đã hoàn thành' };
    default:
      return { text: status || 'Không xác định' };
  }
};

const SellerRefundManagement: React.FC = () => {
  const { user } = useUser();
  const [refunds, setRefunds] = useState<OrderRefundDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRefund, setSelectedRefund] = useState<OrderRefundDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSellerRefunds = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await transactionApi.getRefundsBySeller(user.id);
        setRefunds(response.refunds);
      } catch (error) {
        console.error('Error fetching seller refunds:', error);
        // Fallback to mock data if API fails
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefunds(mockSellerRefunds);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerRefunds();
  }, [user?.id]);

  const filteredRefunds = refunds.filter(refund => {
    const matchesStatus = selectedStatus === 'ALL' || refund.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      refund.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mockSellerOrders[refund.orderId || '']?.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mockSellerOrders[refund.orderId || '']?.buyerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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
      currency: 'VND'
    }).format(price);
  };

  const handleApproveRefund = async (refundId?: string) => {
    if (!refundId || !user?.id) return;
    
    if (window.confirm('Bạn có chắc chắn muốn chấp nhận yêu cầu hoàn tiền này?')) {
      try {
        const response = await transactionApi.approveRefund(refundId, user.id);
        setRefunds(prevRefunds => 
          prevRefunds.map(refund => 
            refund.id === refundId ? response : refund
          )
        );
        alert('Đã chấp nhận yêu cầu hoàn tiền');
      } catch (error) {
        console.error('Error approving refund:', error);
        alert(`Có lỗi xảy ra: ${getErrorMessage(error)}`);
      }
    }
  };

  const handleRejectRefund = async (refundId?: string) => {
    if (!refundId || !user?.id) return;
    
    const reason = window.prompt('Nhập lý do từ chối hoàn tiền:');
    if (!reason) return;
    
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu hoàn tiền này?')) {
      try {
        const response = await transactionApi.rejectRefund(refundId, user.id, reason);
        setRefunds(prevRefunds => 
          prevRefunds.map(refund => 
            refund.id === refundId ? response : refund
          )
        );
        alert('Đã từ chối yêu cầu hoàn tiền');
      } catch (error) {
        console.error('Error rejecting refund:', error);
        alert(`Có lỗi xảy ra: ${getErrorMessage(error)}`);
      }
    }
  };

  const handleMarkProcessing = async (refundId?: string) => {
    if (!refundId || !user?.id) return;
    
    try {
      const response = await transactionApi.updateRefundStatus(
        refundId, 
        'PROCESSING', 
        user.id,
        'Seller đã bắt đầu xử lý refund'
      );
      
      setRefunds(prevRefunds => 
        prevRefunds.map(refund => 
          refund.id === refundId ? response : refund
        )
      );
      alert('Đã chuyển trạng thái sang "Đang xử lý"');
    } catch (error) {
      console.error('Error updating refund status:', error);
      alert(`Có lỗi xảy ra: ${getErrorMessage(error)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách yêu cầu hoàn tiền...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý hoàn tiền (Seller)</h1>
            <p className="text-gray-600 mt-1">Xử lý các yêu cầu hoàn tiền từ buyers cho sản phẩm của bạn</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900">{refunds.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {refunds.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-blue-600">
                  {refunds.filter(r => r.status === 'PROCESSING').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã chấp nhận</p>
                <p className="text-2xl font-bold text-green-600">
                  {refunds.filter(r => r.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã từ chối</p>
                <p className="text-2xl font-bold text-red-600">
                  {refunds.filter(r => r.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoàn tiền, mã đơn hàng, sản phẩm, buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

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
          {['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'].map(status => {
            const count = refunds.filter(refund => refund.status === status).length;
            const statusInfo = getRefundStatusInfo(status);
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
                {statusInfo.text} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredRefunds.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {searchQuery ? 'Không tìm thấy yêu cầu hoàn tiền nào phù hợp' : 'Không có yêu cầu hoàn tiền nào'}
          </div>
          <p className="text-gray-400 mt-2">
            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Các yêu cầu hoàn tiền từ buyers sẽ hiển thị ở đây'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRefunds.map((refund) => {
            const statusInfo = getRefundStatusInfo(refund.status);
            const orderInfo = mockSellerOrders[refund.orderId || ''];
            
            return (
              <div key={refund.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Hoàn tiền #{refund.id?.slice(-8)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getRefundStatusColor(refund.status)}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Đơn hàng:</span> #{refund.orderId?.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Sản phẩm:</span> {orderInfo?.productName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Buyer:</span> {orderInfo?.buyerEmail || refund.requestBy}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Tạo lúc:</span> {formatDate(refund.createdAt)}
                        </p>
                        {refund.completedAt && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Hoàn thành:</span> {formatDate(refund.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-red-600">
                      {formatPrice(refund.amount)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Lý do hoàn tiền</h5>
                  <p className="text-sm text-gray-600">{refund.reason}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    {refund.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleMarkProcessing(refund.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Đang xử lý
                        </button>
                        <button
                          onClick={() => handleApproveRefund(refund.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => handleRejectRefund(refund.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {refund.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleApproveRefund(refund.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Chấp nhận hoàn tiền
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedRefund(refund)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết yêu cầu hoàn tiền</h2>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã hoàn tiền</label>
                    <div className="text-sm text-gray-900 font-mono">{selectedRefund.id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn hàng</label>
                    <div className="text-sm text-gray-900 font-mono">{selectedRefund.orderId}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền hoàn</label>
                    <div className="text-lg font-bold text-red-600">{formatPrice(selectedRefund.amount)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getRefundStatusColor(selectedRefund.status)}`}>
                      {getRefundStatusInfo(selectedRefund.status).text}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
                    <div className="text-sm text-gray-900">
                      {mockSellerOrders[selectedRefund.orderId || '']?.buyerEmail || selectedRefund.requestBy}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
                    <div className="text-sm text-gray-900">
                      {mockSellerOrders[selectedRefund.orderId || '']?.productName || 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý do hoàn tiền</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedRefund.reason}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  {selectedRefund.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          handleApproveRefund(selectedRefund.id);
                          setSelectedRefund(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => {
                          handleRejectRefund(selectedRefund.id);
                          setSelectedRefund(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedRefund(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerRefundManagement;