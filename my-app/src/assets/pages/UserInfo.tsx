import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { components } from '../../api-types/userService';
import { useUser } from '../../context/UserContext';
import apiClient from '../../services/apiClient';

type UserInfDto = components['schemas']['UserInfDto'];
type PreferenceDto = components['schemas']['PreferenceDto'];
type BillingAddressDto = components['schemas']['BillingAddressDto'];
type SellerApplicationDto = components['schemas']['SellerApplicationDto'];

const UserInfo: React.FC = () => {
  const { user, isAuthenticated } = useUser();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  
  const [targetUser, setTargetUser] = useState<UserInfDto | null>(null);
  const [preferences, setPreferences] = useState<PreferenceDto | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddressDto | null>(null);
  const [sellerApplication, setSellerApplication] = useState<SellerApplicationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which user info to display
  const displayUser = targetUserId ? targetUser : user;

  useEffect(() => {
    if (targetUserId) {
      // Viewing another user's info - fetch that user's data
      fetchTargetUserData(targetUserId);
    } else if (isAuthenticated && user?.id) {
      // Viewing own user info
      fetchUserData();
    }
  }, [isAuthenticated, user?.id, targetUserId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user preferences
      try {
        const prefResponse = await apiClient.get<components['schemas']['ApiResponsePreferenceDto']>(
          `/api/v1/user-service/users/me/preferences`
        );
        setPreferences(prefResponse.data?.data || null);
      } catch (err) {
        console.log('No preferences found or error fetching preferences');
      }

      // Fetch billing address
      try {
        const billingResponse = await apiClient.get<components['schemas']['ApiResponseBillingAddressDto']>(
          `/api/v1/user-service/users/me/billing-address`
        );
        setBillingAddress(billingResponse.data?.data || null);
      } catch (err) {
        console.log('No billing address found or error fetching billing address');
      }

      // Fetch seller application if user is seller
      if (user?.isSeller) {
        try {
          const sellerResponse = await apiClient.get<components['schemas']['ApiResponseSellerApplicationDto']>(
            `/api/v1/user-service/seller/applications/me`
          );
          setSellerApplication(sellerResponse.data?.data || null);
        } catch (err) {
          console.log('No seller application found or error fetching seller application');
        }
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetUserData = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch target user info - this would need a public endpoint
      // For now, we'll just show limited info that we have from buyerId
      // In a real app, you'd need an endpoint like `/api/v1/user-service/users/${userId}/public-info`
      
      // Create a basic user object with the ID
      const basicUserInfo: UserInfDto = {
        id: userId,
        displayName: `User ${userId.slice(-8)}`,
        email: 'private@email.com',
        status: 'ACTIVE'
      };
      
      setTargetUser(basicUserInfo);
      
      // Clear other data since we're viewing someone else's profile
      setPreferences(null);
      setBillingAddress(null);
      setSellerApplication(null);

    } catch (error) {
      console.error('Error fetching target user data:', error);
      setError('Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-gray-600 bg-gray-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'BLOCKED': return 'text-red-600 bg-red-100';
      case 'VERIFIED': return 'text-green-600 bg-green-100';
      case 'UNVERIFIED': return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để xem thông tin cá nhân</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {targetUserId ? 'Thông tin người dùng' : 'Thông tin cá nhân'}
        </h1>
        <p className="text-gray-600">
          {targetUserId 
            ? 'Thông tin công khai của người dùng' 
            : 'Quản lý thông tin tài khoản và cài đặt của bạn'
          }
        </p>
        {targetUserId && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              ℹ️ Bạn đang xem thông tin của người dùng khác. Chỉ thông tin công khai được hiển thị.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic User Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mr-6">
              {displayUser?.avatarUrl ? (
                <img 
                  src={displayUser.avatarUrl} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  👤
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayUser?.displayName || 'N/A'}</h2>
              <p className="text-gray-600">{displayUser?.email || 'N/A'}</p>
              <div className="flex items-center mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(displayUser?.status)}`}>
                  {displayUser?.status || 'N/A'}
                </span>
                {displayUser?.isSeller && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    Seller
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">{displayUser?.id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên hiển thị:</span>
                  <span className="font-medium">{displayUser?.displayName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{displayUser?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quốc gia:</span>
                  <span className="font-medium">{displayUser?.country || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Thời gian</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium">{formatDate(displayUser?.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="font-medium">{formatDate(displayUser?.updatedAt)}</span>
                </div>
                {displayUser?.deletedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày xóa:</span>
                    <span className="font-medium text-red-600">{formatDate(displayUser?.deletedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user?.sellerBio && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Seller Bio</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{user.sellerBio}</p>
            </div>
          )}
        </div>

        {/* Preferences - Only show for current user */}
        {!targetUserId && preferences && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cài đặt cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Thông báo</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      preferences.notificationEmail 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {preferences.notificationEmail ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Push:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      preferences.notificationPush 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {preferences.notificationPush ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Ưa thích</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền tệ:</span>
                    <span className="font-medium">{preferences.preferredCurrency || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nền tảng:</span>
                    <span className="font-medium">{preferences.preferredPlatform || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hồ sơ công khai:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      preferences.privacyPublicProfile 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {preferences.privacyPublicProfile ? 'Có' : 'Không'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Address - Only show for current user */}
        {!targetUserId && billingAddress && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Địa chỉ thanh toán</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Địa chỉ:</span>
                  <span className="font-medium">{billingAddress.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thành phố:</span>
                  <span className="font-medium">{billingAddress.city || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã bưu điện:</span>
                  <span className="font-medium">{billingAddress.postalCode || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bang/Tiểu bang:</span>
                  <span className="font-medium">{billingAddress.state || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỉnh:</span>
                  <span className="font-medium">{billingAddress.province || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quốc gia/Vùng:</span>
                  <span className="font-medium">{billingAddress.countryRegion || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seller Application */}
        {user?.isSeller && sellerApplication && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin Seller</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID đơn đăng ký:</span>
                  <span className="font-medium">{sellerApplication.id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sellerApplication.applicationStatus)}`}>
                    {sellerApplication.applicationStatus || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày nộp:</span>
                  <span className="font-medium">{formatDate(sellerApplication.submissionDate)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày xét duyệt:</span>
                  <span className="font-medium">{formatDate(sellerApplication.reviewDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người xét duyệt:</span>
                  <span className="font-medium">{sellerApplication.reviewerId?.slice(-8) || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {sellerApplication.rejectionReason && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Lý do từ chối</h3>
                <p className="text-red-600 bg-red-50 p-3 rounded">{sellerApplication.rejectionReason}</p>
              </div>
            )}
            
            {sellerApplication.notes && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Ghi chú</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{sellerApplication.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;