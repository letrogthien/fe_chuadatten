import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow mt-10">
      <h1 className="text-3xl font-extrabold mb-6 text-primary-red">Liên hệ Z2U</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="mb-4">
            <div className="font-semibold">Email:</div>
            <a href="mailto:support@z2u.com" className="text-blue-600 underline">support@z2u.com</a>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Hotline:</div>
            <span className="text-gray-700">1900-123-456</span>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Địa chỉ:</div>
            <span className="text-gray-700">Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM</span>
          </div>
          <iframe title="map" src="https://www.openstreetmap.org/export/embed.html?bbox=106.695,10.776,106.700,10.780&amp;layer=mapnik" className="w-full h-40 rounded" loading="lazy"></iframe>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-1">Họ tên</label>
            <input type="text" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nội dung</label>
            <textarea className="w-full border rounded px-3 py-2" rows={4} required></textarea>
          </div>
          <button type="submit" className="bg-primary-red text-white px-4 py-2 rounded font-semibold">Gửi liên hệ</button>
          {sent && <div className="text-green-600 font-semibold mt-2">Cảm ơn bạn đã liên hệ!</div>}
        </form>
      </div>
    </div>
  );
};

export default ContactPage;