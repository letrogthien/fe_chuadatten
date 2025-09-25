import React, { useEffect, useState } from 'react';
import { userServiceClient } from '../../services/apiClient';
import { formatDate } from '../../utils/dateUtils';

interface KycRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  verificationStatus: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  faceIdUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface SellerApplication {
  id: string;
  userId: string;
  username: string;
  email: string;
  applicationStatus: string;
  submissionDate: string;
  reviewDate?: string;
  rejectionReason?: string;
  notes?: string;
}

const AdminKycManagement: React.FC = () => {
  const [pendingKyc, setPendingKyc] = useState<KycRequest[]>([]);
  const [sellerApplications, setSellerApplications] = useState<SellerApplication[]>([]);
  const [kycDeleteRequests, setKycDeleteRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<KycRequest | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'kyc' | 'seller' | 'delete-requests'>('kyc');

  useEffect(() => {
    loadPendingKyc();
    loadSellerApplications();
    loadKycDeleteRequests();
  }, []);

  const loadPendingKyc = async () => {
    try {
      setLoading(true);
      const response = await userServiceClient.get('/admin/kyc/pending');
      console.log('Pending KYC API Response:', response.data);
      
      if (response.data?.data) {
        setPendingKyc(response.data.data.content || response.data.data || []);
      } else {
        setPendingKyc([]);
      }
    } catch (error) {
      console.error('Error loading pending KYC:', error);
      alert('Không thể tải danh sách KYC chờ duyệt. Vui lòng thử lại.');
      setPendingKyc([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerApplications = async () => {
    try {
      const response = await userServiceClient.get('/admin/seller-applications');
      console.log('Seller Applications API Response:', response.data);
      
      if (response.data?.data) {
        setSellerApplications(response.data.data.content || response.data.data || []);
      } else {
        setSellerApplications([]);
      }
    } catch (error) {
      console.error('Error loading seller applications:', error);
      alert('Không thể tải danh sách đơn đăng ký seller. Vui lòng thử lại.');
      setSellerApplications([]);
    }
  };

  const loadKycDeleteRequests = async () => {
    try {
      const response = await userServiceClient.get('/admin/kyc/delete-requests');
      console.log('KYC Delete Requests API Response:', response.data);
      
      if (response.data?.data) {
        setKycDeleteRequests(response.data.data.content || response.data.data || []);
      } else {
        setKycDeleteRequests([]);
      }
    } catch (error) {
      console.error('Error loading KYC delete requests:', error);
      alert('Không thể tải danh sách yêu cầu xóa KYC. Vui lòng thử lại.');
      setKycDeleteRequests([]);
    }
  };

  const handleApproveKyc = async (kycId: string) => {
    try {
      setLoading(true);
      await userServiceClient.post(`/admin/kyc/${kycId}/approve`);
      alert('KYC đã được duyệt thành công!');
      setShowKycModal(false);
      loadPendingKyc();
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Có lỗi xảy ra khi duyệt KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectKyc = async (kycId: string, reason: string) => {
    try {
      setLoading(true);
      await userServiceClient.post(`/admin/kyc/${kycId}/reject`, {
        reason: reason
      });
      alert('KYC đã bị từ chối!');
      setShowKycModal(false);
      loadPendingKyc();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Có lỗi xảy ra khi từ chối KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSellerApplication = async (appId: string, status: string, reason?: string) => {
    try {
      setLoading(true);
      await userServiceClient.post(`/admin/seller-applications/${appId}/review`, {
        status: status,
        reason: reason
      });
      alert(`Đơn đăng ký seller đã được ${status === 'APPROVED' ? 'duyệt' : 'từ chối'}!`);
      setShowApplicationModal(false);
      loadSellerApplications();
    } catch (error) {
      console.error('Error reviewing seller application:', error);
      alert('Có lỗi xảy ra khi xử lý đơn đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'VERIFIED': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };



  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý KYC & Seller</h1>
        <p className="text-gray-600">Duyệt KYC và đơn đăng ký seller</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'kyc', label: 'KYC Chờ duyệt', count: pendingKyc.length },
              { key: 'seller', label: 'Đơn Seller', count: sellerApplications.length },
              { key: 'delete-requests', label: 'Yêu cầu xóa KYC', count: kycDeleteRequests.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* KYC Tab */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">KYC Chờ duyệt</h2>
            {loading ? (
              <div className="text-center py-4">Đang tải...</div>
            ) : pendingKyc.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có KYC chờ duyệt</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingKyc.map((kyc) => (
                      <tr key={kyc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{kyc.username}</div>
                            <div className="text-sm text-gray-500">{kyc.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(kyc.verificationStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(kyc.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedKyc(kyc);
                              setShowKycModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seller Applications Tab */}
      {activeTab === 'seller' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn đăng ký Seller</h2>
            {loading ? (
              <div className="text-center py-4">Đang tải...</div>
            ) : sellerApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có đơn đăng ký seller</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày nộp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sellerApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.username}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(app.applicationStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(app.submissionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowApplicationModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KYC Detail Modal */}
      {showKycModal && selectedKyc && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết KYC</h3>
                <button
                  onClick={() => setShowKycModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin người dùng</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Username:</span> {selectedKyc.username}</div>
                    <div><span className="font-medium">Email:</span> {selectedKyc.email}</div>
                    <div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedKyc.verificationStatus)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Thời gian</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Tạo:</span> {formatDate(selectedKyc.createdAt)}</div>
                    <div><span className="font-medium">Cập nhật:</span> {formatDate(selectedKyc.updatedAt)}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Tài liệu</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedKyc.documentFrontUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Mặt trước CCCD</p>
                      <img
                        src={selectedKyc.documentFrontUrl}
                        alt="Document Front"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {selectedKyc.documentBackUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Mặt sau CCCD</p>
                      <img
                        src={selectedKyc.documentBackUrl}
                        alt="Document Back"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {selectedKyc.faceIdUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Ảnh chân dung</p>
                      <img
                        src={selectedKyc.faceIdUrl}
                        alt="Face ID"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleRejectKyc(selectedKyc.id, 'Tài liệu không hợp lệ')}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleApproveKyc(selectedKyc.id)}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Application Detail Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết đơn đăng ký Seller</h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div><span className="font-medium">Username:</span> {selectedApplication.username}</div>
                <div><span className="font-medium">Email:</span> {selectedApplication.email}</div>
                <div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedApplication.applicationStatus)}</div>
                <div><span className="font-medium">Ngày nộp:</span> {formatDate(selectedApplication.submissionDate)}</div>
                {selectedApplication.reviewDate && (
                  <div><span className="font-medium">Ngày duyệt:</span> {formatDate(selectedApplication.reviewDate)}</div>
                )}
                {selectedApplication.rejectionReason && (
                  <div><span className="font-medium">Lý do từ chối:</span> {selectedApplication.rejectionReason}</div>
                )}
                {selectedApplication.notes && (
                  <div><span className="font-medium">Ghi chú:</span> {selectedApplication.notes}</div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleReviewSellerApplication(selectedApplication.id, 'REJECTED', 'Không đủ điều kiện')}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleReviewSellerApplication(selectedApplication.id, 'APPROVED')}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKycManagement;