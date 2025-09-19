import React, { useEffect, useState } from 'react';
import type { components } from '../../api-types/transactionService';

type OrderDisputeDto = components['schemas']['OrderDisputeDto'];
type OrderDisputeCreateRq = components['schemas']['OrderDisputeCreateRq'];

// Mock data theo đúng struct OrderDisputeDto
const mockDisputes: OrderDisputeDto[] = [
  {
    id: 'dispute1',
    orderId: '1',
    openedBy: 'user123',
    issueType: 'NOT_DELIVERED',
    description: 'Đã mua tài khoản Minecraft nhưng không nhận được thông tin đăng nhập',
    status: 'PENDING',
    createdAt: '2024-03-16T10:30:00Z'
  },
  {
    id: 'dispute2',
    orderId: '2',
    openedBy: 'user123',
    issueType: 'ITEM_INVALID',
    description: 'Steam Gift Card bị khóa, không thể sử dụng',
    status: 'PROCESSING',
    createdAt: '2024-03-15T15:20:00Z'
  },
  {
    id: 'dispute3',
    orderId: '3',
    openedBy: 'user123',
    issueType: 'ACCOUNT_BANNED',
    description: 'Tài khoản Valorant bị ban sau 2 ngày sử dụng',
    status: 'COMPLETED',
    createdAt: '2024-03-14T12:15:00Z',
    resolvedAt: '2024-03-16T09:30:00Z'
  }
];

// Issue type color mapping
const getIssueTypeColor = (issueType?: string) => {
  switch (issueType) {
    case 'NOT_DELIVERED':
      return 'text-red-600 bg-red-100';
    case 'ITEM_INVALID':
      return 'text-orange-600 bg-orange-100';
    case 'ACCOUNT_BANNED':
      return 'text-purple-600 bg-purple-100';
    case 'OTHER':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Issue type Vietnamese mapping
const getIssueTypeText = (issueType?: string) => {
  switch (issueType) {
    case 'NOT_DELIVERED':
      return 'Chưa giao hàng';
    case 'ITEM_INVALID':
      return 'Sản phẩm lỗi';
    case 'ACCOUNT_BANNED':
      return 'Tài khoản bị khóa';
    case 'OTHER':
      return 'Khác';
    default:
      return issueType || 'Không xác định';
  }
};

// Status color mapping for disputes
const getDisputeStatusColor = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100';
    case 'PROCESSING':
      return 'text-blue-600 bg-blue-100';
    case 'COMPLETED':
      return 'text-green-600 bg-green-100';
    case 'REJECTED':
      return 'text-red-600 bg-red-100';
    case 'CANCELLED':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Status Vietnamese mapping for disputes
const getDisputeStatusText = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'PROCESSING':
      return 'Đang xử lý';
    case 'COMPLETED':
      return 'Đã giải quyết';
    case 'REJECTED':
      return 'Đã từ chối';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status || 'Không xác định';
  }
};

const DisputeManagement: React.FC = () => {
  const [disputes, setDisputes] = useState<OrderDisputeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDispute, setNewDispute] = useState<Partial<OrderDisputeCreateRq>>({
    orderId: '',
    openedBy: 'user123', // In real app, get from user context
    issueType: 'NOT_DELIVERED',
    description: ''
  });

  useEffect(() => {
    // Simulate API call
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await transactionApi.getDisputesByUser();
        // setDisputes(response.data);
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDisputes(mockDisputes);
      } catch (error) {
        console.error('Error fetching disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const filteredDisputes = selectedStatus === 'ALL' 
    ? disputes 
    : disputes.filter(dispute => dispute.status === selectedStatus);

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

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDispute.orderId || !newDispute.description) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await transactionApi.createDispute(newDispute as OrderDisputeCreateRq);
      
      // Simulate API response
      const mockNewDispute: OrderDisputeDto = {
        id: `dispute${Date.now()}`,
        orderId: newDispute.orderId,
        openedBy: newDispute.openedBy,
        issueType: newDispute.issueType,
        description: newDispute.description,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      setDisputes(prev => [mockNewDispute, ...prev]);
      setNewDispute({ orderId: '', openedBy: 'user123', issueType: 'NOT_DELIVERED', description: '' });
      setShowCreateForm(false);
      alert('Tranh chấp đã được tạo thành công');
    } catch (error) {
      console.error('Error creating dispute:', error);
      alert('Có lỗi xảy ra khi tạo tranh chấp');
    }
  };

  const handleCancelDispute = async (disputeId?: string) => {
    if (!disputeId) return;
    
    if (window.confirm('Bạn có chắc chắn muốn hủy tranh chấp này?')) {
      try {
        // TODO: Replace with actual API call
        // await transactionApi.cancelDispute(disputeId);
        
        // Update local state
        setDisputes(prevDisputes => 
          prevDisputes.filter(dispute => dispute.id !== disputeId)
        );
        alert('Tranh chấp đã được hủy');
      } catch (error) {
        console.error('Error canceling dispute:', error);
        alert('Có lỗi xảy ra khi hủy tranh chấp');
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tranh chấp</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Hủy' : 'Tạo tranh chấp'}
          </button>
        </div>

        {/* Create Dispute Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo tranh chấp mới</h3>
            <form onSubmit={handleCreateDispute}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đơn hàng *
                  </label>
                  <input
                    id="orderId"
                    type="text"
                    value={newDispute.orderId}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, orderId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập mã đơn hàng"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
                    Loại vấn đề *
                  </label>
                  <select
                    id="issueType"
                    value={newDispute.issueType}
                    onChange={(e) => setNewDispute(prev => ({ ...prev, issueType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="NOT_DELIVERED">Chưa giao hàng</option>
                    <option value="ITEM_INVALID">Sản phẩm lỗi</option>
                    <option value="ACCOUNT_BANNED">Tài khoản bị khóa</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết *
                </label>
                <textarea
                  id="description"
                  value={newDispute.description}
                  onChange={(e) => setNewDispute(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
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
                  Tạo tranh chấp
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
            Tất cả ({disputes.length})
          </button>
          {['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'].map(status => {
            const count = disputes.filter(dispute => dispute.status === status).length;
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
                {getDisputeStatusText(status)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredDisputes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Không có tranh chấp nào</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tranh chấp #{dispute.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDisputeStatusColor(dispute.status)}`}>
                      {getDisputeStatusText(dispute.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIssueTypeColor(dispute.issueType)}`}>
                      {getIssueTypeText(dispute.issueType)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Đơn hàng: #{dispute.orderId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tạo lúc: {formatDate(dispute.createdAt)}
                  </p>
                  {dispute.resolvedAt && (
                    <p className="text-sm text-gray-500">
                      Giải quyết: {formatDate(dispute.resolvedAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Mô tả vấn đề</h5>
                <p className="text-sm text-gray-600">{dispute.description}</p>
              </div>

              <div className="flex justify-end gap-3">
                {dispute.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelDispute(dispute.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hủy tranh chấp
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

export default DisputeManagement;