import React from 'react';

const PrivacyPolicyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow mt-10">
    <h1 className="text-3xl font-extrabold mb-6 text-primary-red">Chính sách bảo mật</h1>
    <div className="mb-6 text-gray-700">Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và minh bạch về cách sử dụng dữ liệu.</div>
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-lg mb-1 text-primary-red">1. Thu thập thông tin</h2>
        <p>Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ: email, số điện thoại, thông tin giao dịch.</p>
      </div>
      <div>
        <h2 className="font-bold text-lg mb-1 text-primary-red">2. Sử dụng thông tin</h2>
        <p>Thông tin được dùng để xác thực, hỗ trợ khách hàng, cải thiện dịch vụ và đảm bảo an toàn giao dịch.</p>
      </div>
      <div>
        <h2 className="font-bold text-lg mb-1 text-primary-red">3. Bảo mật &amp; chia sẻ</h2>
        <p>Chúng tôi áp dụng các biện pháp bảo mật hiện đại, không chia sẻ thông tin cho bên thứ ba nếu không có sự đồng ý của bạn.</p>
      </div>
      <div className="bg-primary-red/10 border-l-4 border-primary-red p-4 rounded">
        <b>Lưu ý:</b> Bạn có thể yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bất cứ lúc nào qua email <a href="mailto:support@z2u.com" className="underline text-primary-red">support@z2u.com</a>.
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;