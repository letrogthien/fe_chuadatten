import React from 'react';

const jobs = [
  {
    title: 'Frontend Developer',
    desc: 'Phát triển UI hiện đại với React, TypeScript, Tailwind.',
    location: 'Hà Nội / Remote',
  },
  {
    title: 'Backend Developer',
    desc: 'Thiết kế API, bảo mật, tối ưu hiệu năng.',
    location: 'TP.HCM / Remote',
  },
  {
    title: 'Chuyên viên CSKH',
    desc: 'Hỗ trợ khách hàng, xử lý ticket, tư vấn dịch vụ.',
    location: 'Toàn quốc',
  },
];

const CareersPage: React.FC = () => (
  <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow mt-10">
    <h1 className="text-3xl font-extrabold mb-6 text-primary-red">Gia nhập Z2U</h1>
    <p className="mb-6 text-gray-700">Chúng tôi luôn tìm kiếm những tài năng mới để cùng xây dựng nền tảng giao dịch số hàng đầu Việt Nam.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {jobs.map((job, idx) => (
        <div key={idx} className="bg-gray-50 rounded-xl p-6 shadow text-center flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-lg mb-2 text-primary-red">{job.title}</h2>
            <p className="text-gray-700 mb-2">{job.desc}</p>
            <span className="text-xs text-gray-500">{job.location}</span>
          </div>
          <a href="mailto:hr@z2u.com?subject=Ứng tuyển vị trí {job.title}" className="mt-4 inline-block bg-primary-red text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-red-700 transition">Ứng tuyển</a>
        </div>
      ))}
    </div>
    <div className="bg-gray-100 rounded-xl p-6 shadow text-center">
      <h2 className="font-bold text-lg mb-2 text-primary-red">Văn hóa Z2U</h2>
      <p className="text-gray-700">Chúng tôi đề cao sự sáng tạo, chủ động, tôn trọng và hỗ trợ lẫn nhau. Môi trường mở, linh hoạt, khuyến khích phát triển cá nhân.</p>
    </div>
  </div>
);

export default CareersPage;