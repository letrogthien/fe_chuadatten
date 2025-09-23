import React, { useState } from 'react';

// Sample data cho refund management
const sampleRefundData = {
  refunds: [
    {
      id: "REF-2024-001",
      orderId: "ORD-2024-001",
      buyerName: "Nguyễn Văn A",
      buyerEmail: "nguyenvana@email.com",
      amount: 500000,
      reason: "Sản phẩm không đúng mô tả",
      status: "PENDING",
      createdAt: "2024-12-23T14:20:00Z",
      sellerName: "Game Store ABC",
      productName: "Tài khoản Liên Quân Mobile VIP",
      evidence: ["screenshot1.png", "video_proof.mp4"]
    },
    {
      id: "REF-2024-002",
      orderId: "ORD-2024-005",
      buyerName: "Phạm Thị D",
      buyerEmail: "phamthid@email.com", 
      amount: 1200000,
      reason: "Giao hàng chậm quá thời gian quy định",
      status: "PENDING",
      createdAt: "2024-12-23T11:30:00Z",
      sellerName: "Pro Gaming Store",
      productName: "Account PUBG Mobile Full Skin",
      evidence: ["chat_history.png"]
    },
    {
      id: "REF-2024-003",
      orderId: "ORD-2024-008",
      buyerName: "Lê Văn E",
      buyerEmail: "levane@email.com",
      amount: 850000,
      reason: "Tài khoản bị khóa sau khi mua",
      status: "APPROVED",
      createdAt: "2024-12-22T16:45:00Z",
      sellerName: "Digital Gaming Hub",
      productName: "Free Fire Account Diamond",
      evidence: ["ban_notice.png", "transaction_proof.jpg"],
      approvedAt: "2024-12-23T09:15:00Z",
      approvedBy: "Admin System"
    },
    {
      id: "REF-2024-004", 
      orderId: "ORD-2024-012",
      buyerName: "Hoàng Thị F",
      buyerEmail: "hoangthif@email.com",
      amount: 2100000,
      reason: "Seller không phản hồi sau thanh toán",
      status: "REJECTED",
      createdAt: "2024-12-22T08:30:00Z",
      sellerName: "Gaming World Store", 
      productName: "Genshin Impact Account AR58",
      evidence: ["payment_proof.png"],
      rejectedAt: "2024-12-23T10:20:00Z",
      rejectedBy: "Admin System",
      rejectionReason: "Không đủ bằng chứng, cần liên hệ seller trước"
    }
  ],
  statistics: {
    total: 156,
    pending: 23,
    approved: 98,
    rejected: 35,
    totalAmount: 45600000,
    averageAmount: 1950000
  }
};

const AdminRefundManagement: React.FC = () => {
  const [refundData] = useState(sampleRefundData);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRefund, setSelectedRefund] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { class: string; text: string }> = {
      'PENDING': { class: 'bg-yellow-100 text-yellow-800', text: 'Chờ duyệt' },
      'APPROVED': { class: 'bg-green-100 text-green-800', text: 'Đã phê duyệt' },
      'REJECTED': { class: 'bg-red-100 text-red-800', text: 'Đã từ chối' }
    };
    
    const statusInfo = statusMap[status] || { class: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const filteredRefunds = refundData.refunds.filter(refund => {
    if (selectedTab === 'all') return true;
    return refund.status.toLowerCase() === selectedTab.toUpperCase();
  });

  const handleApproveRefund = async (refundId: string, note?: string) => {
    console.log(`Approving refund ${refundId}`, { note });
    // Gọi API adminApproveRefund
    alert(`Đã phê duyệt hoàn tiền ${refundId}`);
  };

  const handleRejectRefund = async (refundId: string, reason: string) => {
    console.log(`Rejecting refund ${refundId}`, { reason });
    // Gọi API adminRejectRefund
    alert(`Đã từ chối hoàn tiền ${refundId}: ${reason}`);
  };

  const handleForceComplete = async (refundId: string, note?: string) => {
    console.log(`Force completing refund ${refundId}`, { note });
    // Gọi API adminForceCompleteRefund
    alert(`Đã hoàn thành cưỡng chế hoàn tiền ${refundId}`);
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'pending': return 'Yêu cầu chờ duyệt';
      case 'approved': return 'Yêu cầu đã phê duyệt';  
      case 'rejected': return 'Yêu cầu đã từ chối';
      default: return 'Tất cả yêu cầu hoàn tiền';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Hoàn tiền</h1>
              <p className="text-sm text-gray-500 mt-1">Xem và xử lý các yêu cầu hoàn tiền từ khách hàng</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Tổng yêu cầu: {refundData.statistics.total}</p>
                <p className="text-xs text-gray-500">Tổng giá trị: {formatCurrency(refundData.statistics.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {refundData.statistics.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã phê duyệt</p>
                <p className="text-2xl font-semibold text-green-600">
                  {refundData.statistics.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã từ chối</p>
                <p className="text-2xl font-semibold text-red-600">
                  {refundData.statistics.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Giá trị TB</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency(refundData.statistics.averageAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'pending', label: 'Chờ duyệt', count: refundData.statistics.pending },
                { key: 'approved', label: 'Đã phê duyệt', count: refundData.statistics.approved },
                { key: 'rejected', label: 'Đã từ chối', count: refundData.statistics.rejected },
                { key: 'all', label: 'Tất cả', count: refundData.statistics.total }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {getTabTitle(selectedTab)}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{refund.id}</p>
                        <p className="text-sm text-gray-500">Đơn: {refund.orderId}</p>
                        <p className="text-xs text-gray-400">{formatDate(refund.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{refund.buyerName}</p>
                        <p className="text-sm text-gray-500">{refund.buyerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{refund.productName}</p>
                        <p className="text-sm text-gray-500">{refund.sellerName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-red-600">{formatCurrency(refund.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(refund.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRefund(refund)}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Chi tiết
                        </button>
                        {refund.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveRefund(refund.id)}
                              className="text-green-600 hover:text-green-500 text-sm font-medium"
                            >
                              Phê duyệt
                            </button>
                            <button
                              onClick={() => handleRejectRefund(refund.id, 'Không đủ bằng chứng')}
                              className="text-red-600 hover:text-red-500 text-sm font-medium"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refund Detail Modal */}
        {selectedRefund && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Chi tiết hoàn tiền</h3>
                  <button
                    onClick={() => setSelectedRefund(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Đóng</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mã hoàn tiền</p>
                      <p className="text-sm text-gray-900">{selectedRefund.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                      <div className="mt-1">{getStatusBadge(selectedRefund.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Số tiền hoàn</p>
                      <p className="text-sm font-medium text-red-600">{formatCurrency(selectedRefund.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedRefund.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lý do hoàn tiền</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedRefund.reason}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bằng chứng</p>
                    <div className="mt-1 space-y-1">
                      {selectedRefund.evidence.map((file: string) => (
                        <div key={file} className="flex items-center space-x-2">
                          <span className="text-blue-600 text-sm">📎</span>
                          <span className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedRefund.status === 'PENDING' && (
                    <div className="flex space-x-3 pt-4 border-t">
                      <button
                        onClick={() => {
                          handleApproveRefund(selectedRefund.id, 'Phê duyệt từ chi tiết');
                          setSelectedRefund(null);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                      >
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => {
                          handleRejectRefund(selectedRefund.id, 'Từ chối từ chi tiết');
                          setSelectedRefund(null);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => {
                          handleForceComplete(selectedRefund.id, 'Hoàn thành cưỡng chế');
                          setSelectedRefund(null);
                        }}
                        className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 font-medium"
                      >
                        Cưỡng chế
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminRefundManagement;