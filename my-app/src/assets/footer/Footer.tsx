const Footer = () => {
    return (
        <footer>
            <div className="w-full bg-cover rounded-b-3xl overflow-hidden shadow-xl ">
                <div className="footerPaymentLogoBar flex flex-wrap justify-center items-center mb-8 border-b border-gray-700 pb-6 gap-4">
                    <div className="colBox flex justify-center items-center p-2 "><img src="https://placehold.co/80x24/ffffff/000000?text=Visa" alt="Visa" /></div>
                    <div className="colBox flex justify-center items-center p-2"><img src="https://placehold.co/80x24/ffffff/000000?text=MasterCard" alt="MasterCard" /></div>
                    <div className="colBox flex justify-center items-center p-2"><img src="https://placehold.co/80x24/ffffff/000000?text=PayPal" alt="PayPal" /></div>
                    <div className="colBox flex justify-center items-center p-2"><img src="https://placehold.co/80x24/ffffff/000000?text=Skrill" alt="Skrill" /></div>
                    <div className="colBox flex justify-center items-center p-2"><img src="https://placehold.co/80x24/ffffff/000000?text=Neteller" alt="Neteller" /></div>
                    <div className="colBox flex justify-center items-center p-2"><img src="https://placehold.co/80x24/ffffff/000000?text=UnionPay" alt="UnionPay" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 mr-10 ml-20">
                    <div>
                        <h4 className="text-white font-semibold mb-4">Về Chúng Tôi</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
                            <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
                            <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Hỗ Trợ</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white transition">Câu hỏi thường gặp</a></li>
                            <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-white transition">Điều khoản dịch vụ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Cộng Đồng</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-facebook-f text-xl"></i></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-twitter text-xl"></i></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-instagram text-xl"></i></a>
                            <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-youtube text-xl"></i></a>
                        </div>
                        <h4 className="text-white font-semibold mb-2 mt-6">Tải Ứng Dụng</h4>
                        <div className="flex space-x-2">
                            <a href="#"><img src="https://placehold.co/100x30/000000/ffffff?text=AppStore" alt="App Store" className="h-8 rounded" /></a>
                            <a href="#"><img src="https://placehold.co/100x30/000000/ffffff?text=GooglePlay" alt="Google Play" className="h-8 rounded" /></a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Stay Connected</h4>
                        <p className="text-sm mb-4">Đăng ký nhận tin tức và ưu đãi mới nhất.</p>
                        <div className="flex">
                            <input type="email" placeholder="Email của bạn" className="p-2 rounded-l-md bg-gray-700 border border-gray-600 text-white text-sm flex-grow focus:outline-none focus:border-primary-red" />
                            <button className="bg-black text-white p-2 rounded-r-md hover:bg-red-700 transition">Đăng ký</button>
                        </div>
                    </div>
                </div>

                <div className="text-center text-sm border-t border-gray-700 pt-6 mt-6">
                    &copy; 2025 Z2U.COM. All Rights Reserved.
                </div>
            </div>
            <div className="termsfeed-com---cookie-consent-dialog fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 text-sm text-center z-50 hidden" id="cookieConsent">
                Trang web này sử dụng cookie để đảm bảo bạn có được trải nghiệm tốt nhất trên trang web của chúng tôi.
                <a href="#" className="text-gray-400 ml-2 hover:underline">Tìm hiểu thêm</a>
            </div>
        </footer>
    );
}

export default Footer;