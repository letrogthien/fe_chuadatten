import React from 'react';

const AboutPage: React.FC = () => (
  <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow mt-10">
    <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
      <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" alt="Z2U Team" className="rounded-xl w-full md:w-1/3 shadow-lg" />
      <div>
        <h1 className="text-3xl font-extrabold mb-2 text-primary-red">Về Z2U</h1>
        <p className="text-gray-700 mb-2">Z2U là nền tảng giao dịch tài khoản, vật phẩm game và dịch vụ số hàng đầu, kết nối người mua và người bán một cách an toàn, nhanh chóng và tiện lợi.</p>
        <p className="text-gray-600">Chúng tôi cam kết mang lại trải nghiệm tốt nhất, bảo vệ quyền lợi và sự an tâm cho mọi khách hàng.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
      <div className="bg-gray-50 rounded-xl p-6 shadow text-center">
        <h2 className="font-bold text-lg mb-2 text-primary-red">Sứ mệnh</h2>
        <p>Đưa giao dịch số trở nên minh bạch, an toàn và thuận tiện cho mọi người.</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 shadow text-center">
        <h2 className="font-bold text-lg mb-2 text-primary-red">Giá trị cốt lõi</h2>
        <ul className="list-disc list-inside text-left text-gray-700">
          <li>Bảo mật &amp; an toàn</li>
          <li>Khách hàng là trung tâm</li>
          <li>Đổi mới liên tục</li>
        </ul>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 shadow text-center">
        <h2 className="font-bold text-lg mb-2 text-primary-red">Đội ngũ</h2>
        <p>Được dẫn dắt bởi các chuyên gia công nghệ, tài chính và game, Z2U luôn sẵn sàng hỗ trợ bạn 24/7.</p>
      </div>
    </div>
    <div className="text-center mt-8">
      <span className="inline-block bg-primary-red text-white px-6 py-2 rounded-full font-semibold shadow">Tham gia cộng đồng Z2U ngay hôm nay!</span>
    </div>
  </div>
);

export default AboutPage;