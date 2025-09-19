import React from 'react';

const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow mt-10">
    <h1 className="text-3xl font-extrabold mb-6 text-primary-red">Điều khoản dịch vụ</h1>
    <div className="mb-6 text-gray-700">Bằng việc sử dụng dịch vụ của Z2U, bạn đồng ý với các điều khoản dưới đây:</div>
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-lg mb-1 text-primary-red">1. Quyền &amp; nghĩa vụ</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Bạn chịu trách nhiệm về thông tin cung cấp và hoạt động giao dịch của mình.</li>
          <li>Z2U có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện vi phạm.</li>
        </ul>
      </div>
      <div>
        <h2 className="font-bold text-lg mb-1 text-primary-red">2. Chính sách hoàn tiền</h2>
        <p>Hoàn tiền áp dụng khi giao dịch không thành công hoặc có tranh chấp hợp lệ, theo quy trình hỗ trợ của Z2U.</p>
      </div>
      <div>
        <h2 className="font-bold text-lg mb-1 text-primary-red">3. Bảo vệ người dùng</h2>
        <p>Z2U cam kết bảo vệ quyền lợi người mua và người bán, xử lý tranh chấp công bằng, minh bạch.</p>
      </div>
      <div className="bg-primary-red/10 border-l-4 border-primary-red p-4 rounded">
        <b>Lưu ý:</b> Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ. Mọi thắc mắc liên hệ <a href="mailto:support@z2u.com" className="underline text-primary-red">support@z2u.com</a>.
      </div>
    </div>
  </div>
);

export default TermsPage;