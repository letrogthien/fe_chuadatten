import React, { useState } from 'react';

const faqs = [
  {
    q: 'Làm thế nào để mua tài khoản?',
    a: 'Bạn chỉ cần đăng ký tài khoản, chọn sản phẩm và thanh toán qua các phương thức hỗ trợ. Hệ thống sẽ tự động giao hàng hoặc kết nối bạn với người bán.',
  },
  {
    q: 'Làm thế nào để bán vật phẩm?',
    a: 'Đăng nhập, vào mục "Đăng bán" và điền thông tin sản phẩm. Đội ngũ Z2U sẽ duyệt và hỗ trợ bạn trong quá trình bán.',
  },
  {
    q: 'Phương thức thanh toán hỗ trợ?',
    a: 'Z2U hỗ trợ nhiều phương thức: chuyển khoản, ví điện tử, thẻ quốc tế (Visa/MasterCard), PayPal...'
  },
  {
    q: 'Tôi có thể hoàn tiền không?',
    a: 'Bạn có thể yêu cầu hoàn tiền nếu giao dịch không thành công hoặc có vấn đề phát sinh, theo chính sách bảo vệ người dùng của Z2U.'
  },
];

const FaqPage: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow mt-10">
      <h1 className="text-3xl font-extrabold mb-6 text-primary-red">Câu hỏi thường gặp</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border rounded-xl p-4 bg-gray-50 shadow cursor-pointer" onClick={() => setOpen(open === idx ? null : idx)}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">{faq.q}</span>
              <span className="text-primary-red font-bold">{open === idx ? '-' : '+'}</span>
            </div>
            {open === idx && <div className="mt-2 text-gray-700 animate-fade-in">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;