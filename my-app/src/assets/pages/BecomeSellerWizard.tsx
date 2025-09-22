import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface BecomeSellerStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const BecomeSellerWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const { auth, user } = useUser();
  const navigate = useNavigate();

  const steps: BecomeSellerStep[] = [
    {
      id: 1,
      title: 'Xác minh danh tính (KYC)',
      description: 'Hoàn thành xác minh danh tính để đảm bảo tính bảo mật',
      completed: auth?.isKyc || false // Based on actual KYC status
    },
    {
      id: 2,
      title: 'Đồng ý điều khoản',
      description: 'Đọc và đồng ý các điều khoản dành cho Seller',
      completed: policyAgreed
    },
    {
      id: 3,
      title: 'Đăng ký thông tin Seller',
      description: 'Cung cấp thông tin kinh doanh và liên hệ',
      completed: false
    },
    {
      id: 4,
      title: 'Thiết lập cửa hàng',
      description: 'Tạo cửa hàng và thiết lập chính sách bán hàng',
      completed: false
    },
    {
      id: 5,
      title: 'Xác minh tài khoản ngân hàng',
      description: 'Liên kết tài khoản ngân hàng để nhận thanh toán',
      completed: false
    }
  ];

  const handleStepClick = (stepId: number) => {
    // Step 1: Always accessible (KYC)
    if (stepId === 1) {
      setCurrentStep(stepId);
      return;
    }
    
    // Step 2: Accessible if KYC is completed
    if (stepId === 2 && auth?.isKyc) {
      setCurrentStep(stepId);
      return;
    }
    
    // Step 3+: Accessible if KYC completed AND policy agreed
    if (stepId >= 3 && auth?.isKyc && policyAgreed) {
      setCurrentStep(stepId);
      return;
    }
    
    // If requirements not met, don't allow navigation
    console.log('Step requirements not met');
  };

  const handleStartKYC = () => {
    // Navigate directly to UserCenter with state to show KYC settings tab
    navigate('/user-center', { 
      state: { activeTab: 'settings', activeSection: 'cert' } 
    });
    console.log('Navigating to UserCenter KYC settings...');
  };

  const handleStartSellerRegistration = () => {
    // Navigate to seller registration
    console.log('Starting seller registration...');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🆔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Xác minh danh tính (KYC)
              </h3>
              <p className="text-gray-600 mb-6">
                Để trở thành seller, bạn cần hoàn thành quy trình xác minh danh tính. 
                Điều này giúp đảm bảo tính bảo mật và tin cậy trong hệ thống.
              </p>
            </div>

            {auth?.isKyc ? ( // Placeholder for KYC status - will be updated when API is integrated
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <div>
                    <h4 className="font-medium text-green-800">KYC đã hoàn thành</h4>
                    <p className="text-green-600 text-sm">Bạn đã xác minh danh tính thành công</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-xl mr-3">⚠️</span>
                    <div>
                      <h4 className="font-medium text-yellow-800">Cần xác minh KYC</h4>
                      <p className="text-yellow-600 text-sm">Vui lòng hoàn thành KYC trước khi đăng ký seller</p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartKYC}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bắt đầu KYC
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Tài liệu cần chuẩn bị:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Căn cước công dân hoặc Hộ chiếu
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Ảnh selfie với tài liệu
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Thông tin liên hệ chính xác
                </li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đồng ý điều khoản Seller
              </h3>
              <p className="text-gray-600 mb-6">
                Vui lòng đọc kỹ và đồng ý với các điều khoản dành cho Seller trước khi tiếp tục.
              </p>
            </div>

            {/* Điều khoản Policy */}
            <div className="bg-gray-50 rounded-lg p-6 max-h-80 overflow-y-auto border">
              <h4 className="font-semibold text-gray-900 mb-4">Điều khoản và Điều kiện dành cho Seller</h4>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h5 className="font-medium mb-2">1. Trách nhiệm của Seller</h5>
                  <p>• Cung cấp thông tin sản phẩm chính xác và đầy đủ</p>
                  <p>• Đảm bảo chất lượng sản phẩm như mô tả</p>
                  <p>• Thực hiện giao hàng đúng thời gian cam kết</p>
                  <p>• Hỗ trợ khách hàng một cách chuyên nghiệp</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">2. Chính sách hoa hồng</h5>
                  <p>• Nền tảng sẽ thu phí hoa hồng từ mỗi giao dịch thành công</p>
                  <p>• Mức phí hoa hồng sẽ được thông báo rõ ràng trước khi bán</p>
                  <p>• Thanh toán sẽ được thực hiện theo chu kỳ đã thỏa thuận</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">3. Chính sách vi phạm</h5>
                  <p>• Không được bán hàng giả, hàng vi phạm bản quyền</p>
                  <p>• Không được thao túng đánh giá hoặc bình luận</p>
                  <p>• Vi phạm nghiêm trọng có thể dẫn đến khóa tài khoản</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">4. Chính sách bảo mật</h5>
                  <p>• Thông tin khách hàng phải được bảo mật tuyệt đối</p>
                  <p>• Không được sử dụng thông tin khách hàng cho mục đích khác</p>
                  <p>• Tuân thủ các quy định về bảo vệ dữ liệu cá nhân</p>
                </div>
              </div>
            </div>

            {/* Checkbox đồng ý */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyAgreed}
                  onChange={(e) => setPolicyAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="text-sm">
                  <span className="text-gray-900 font-medium">
                    Tôi đã đọc và đồng ý với tất cả các điều khoản và điều kiện trên
                  </span>
                  <p className="text-gray-600 mt-1">
                    Bằng cách đánh dấu vào ô này, bạn xác nhận rằng bạn hiểu và chấp nhận các quy định của nền tảng.
                  </p>
                </div>
              </label>
            </div>

            {policyAgreed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">✅</span>
                  <div>
                    <h4 className="font-medium text-green-800">Đã đồng ý điều khoản</h4>
                    <p className="text-green-600 text-sm">Bạn có thể tiếp tục sang bước tiếp theo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đăng ký thông tin Seller
              </h3>
              <p className="text-gray-600 mb-6">
                Cung cấp thông tin về loại hình kinh doanh và thông tin liên hệ.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin cần điền:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Loại hình kinh doanh (Cá nhân/Doanh nghiệp)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Tên cửa hàng/Doanh nghiệp
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Mô tả hoạt động kinh doanh
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Thông tin liên hệ và địa chỉ
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartSellerRegistration}
              disabled={!auth?.isKyc || !policyAgreed} // Require both KYC and policy agreement
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                auth?.isKyc && policyAgreed
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!auth?.isKyc 
                ? 'Cần hoàn thành KYC trước' 
                : !policyAgreed 
                ? 'Cần đồng ý điều khoản trước'
                : 'Bắt đầu đăng ký'
              }
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏪</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thiết lập cửa hàng
              </h3>
              <p className="text-gray-600 mb-6">
                Tạo cửa hàng trực tuyến và thiết lập các chính sách bán hàng.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Sẽ thiết lập:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Logo và banner cửa hàng
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Danh mục sản phẩm
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Chính sách vận chuyển
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Chính sách đổi trả
                </li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Xác minh tài khoản ngân hàng
              </h3>
              <p className="text-gray-600 mb-6">
                Liên kết tài khoản ngân hàng để nhận thanh toán từ đơn hàng.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin ngân hàng:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Tên ngân hàng
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Số tài khoản
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Tên chủ tài khoản
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Sao kê ngân hàng (để xác minh)
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">Trở thành Seller</h1>
          <p className="text-blue-100">
            Bắt đầu bán hàng trên nền tảng và kiếm thu nhập từ sản phẩm của bạn
          </p>
        </div>

        <div className="flex">
          {/* Sidebar Steps */}
          <div className="w-80 bg-gray-50 px-6 py-8">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`cursor-pointer transition-colors ${
                    currentStep === step.id ? 'opacity-100' : 'opacity-70'
                  }`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-blue-500 text-white'
                          : currentStep > step.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.completed ? '✓' : step.id}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-medium text-sm ${
                          currentStep === step.id ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="ml-4 mt-2 mb-2 h-6 w-px bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-8 py-8">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Quay lại
              </button>
              
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                disabled={currentStep === steps.length}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === steps.length
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentStep === steps.length ? 'Hoàn thành' : 'Tiếp theo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Lợi ích khi trở thành Seller</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Thu nhập ổn định</h3>
            <p className="text-gray-600 text-sm">Kiếm tiền từ việc bán sản phẩm trên nền tảng với hệ thống thanh toán đáng tin cậy</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Tiếp cận khách hàng</h3>
            <p className="text-gray-600 text-sm">Kết nối với hàng triệu khách hàng tiềm năng trên toàn quốc</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Công cụ quản lý</h3>
            <p className="text-gray-600 text-sm">Sử dụng bộ công cụ mạnh mẽ để quản lý đơn hàng và theo dõi doanh thu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerWizard;