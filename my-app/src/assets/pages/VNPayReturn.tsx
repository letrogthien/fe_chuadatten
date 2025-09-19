import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { components } from '../../api-types/walletService';

type VnpayReturnDto = components['schemas']['VnpayReturnDto'];

const VNPayReturn: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<VnpayReturnDto | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Extract payment parameters from URL and set initial state
    useEffect(() => {
        try {
            const params: VnpayReturnDto = {
                vnp_Amount: searchParams.get('vnp_Amount') || undefined,
                vnp_BankCode: searchParams.get('vnp_BankCode') || undefined,
                vnp_BankTranNo: searchParams.get('vnp_BankTranNo') || undefined,
                vnp_CardType: searchParams.get('vnp_CardType') || undefined,
                vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || undefined,
                vnp_PayDate: searchParams.get('vnp_PayDate') || undefined,
                vnp_ResponseCode: searchParams.get('vnp_ResponseCode') || undefined,
                vnp_TmnCode: searchParams.get('vnp_TmnCode') || undefined,
                vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || undefined,
                vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus') || undefined,
                vnp_TxnRef: searchParams.get('vnp_TxnRef') || undefined,
                vnp_SecureHash: searchParams.get('vnp_SecureHash') || undefined,
            };

            setPaymentResult(params);
            
            // Check if payment is successful
            const responseCode = params.vnp_ResponseCode;
            const transactionStatus = params.vnp_TransactionStatus;
            setIsSuccess(responseCode === '00' && transactionStatus === '00');
            
        } catch (err) {
            console.error('Error processing VNPay return parameters:', err);
            setError('Không thể xử lý thông tin thanh toán từ URL');
        }
    }, [searchParams]);




    const getStatusMessage = () => {
        if (!paymentResult) return '';

        const responseCode = paymentResult.vnp_ResponseCode;
        const transactionStatus = paymentResult.vnp_TransactionStatus;

        if (responseCode === '00' && transactionStatus === '00') {
            return 'Thanh toán thành công!';
        } else if (responseCode === '24') {
            return 'Giao dịch bị hủy bởi khách hàng';
        } else if (responseCode === '09') {
            return 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng';
        } else if (responseCode === '10') {
            return 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần';
        } else if (responseCode === '11') {
            return 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch';
        } else if (responseCode === '12') {
            return 'Thẻ/Tài khoản của khách hàng bị khóa';
        } else if (responseCode === '13') {
            return 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)';
        } else if (responseCode === '51') {
            return 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch';
        } else if (responseCode === '65') {
            return 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày';
        } else if (responseCode === '75') {
            return 'Ngân hàng thanh toán đang bảo trì';
        } else if (responseCode === '79') {
            return 'KH nhập sai mật khẩu thanh toán quá số lần quy định';
        } else {
            return `Thanh toán thất bại. Mã lỗi: ${responseCode}`;
        }
    };

    const formatAmount = (amount?: string) => {
        if (!amount) return '0 VND';
        const numAmount = parseInt(amount) / 100; // VNPay returns amount in smallest unit
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(numAmount);
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        // VNPay date format: yyyyMMddHHmmss
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        const hour = dateString.slice(8, 10);
        const minute = dateString.slice(10, 12);
        const second = dateString.slice(12, 14);
        
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        return date.toLocaleString('vi-VN');
    };



    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Result Header */}
                <div className="text-center mb-8">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isSuccess ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        {isSuccess ? (
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <h1 className={`text-3xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                    </h1>
                    <p className="text-gray-600">
                        {getStatusMessage()}
                    </p>
                </div>

                {/* Payment Details */}
                {paymentResult && (
                    <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Chi tiết giao dịch</h2>
                        <div className="space-y-3">
                            {paymentResult.vnp_TxnRef && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Mã giao dịch:</span>
                                    <span className="font-medium">{paymentResult.vnp_TxnRef}</span>
                                </div>
                            )}
                            {paymentResult.vnp_Amount && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Số tiền:</span>
                                    <span className="font-medium text-green-600">{formatAmount(paymentResult.vnp_Amount)}</span>
                                </div>
                            )}
                            {paymentResult.vnp_OrderInfo && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Thông tin đơn hàng:</span>
                                    <span className="font-medium">{paymentResult.vnp_OrderInfo}</span>
                                </div>
                            )}
                            {paymentResult.vnp_PayDate && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Thời gian thanh toán:</span>
                                    <span className="font-medium">{formatDateTime(paymentResult.vnp_PayDate)}</span>
                                </div>
                            )}
                            {paymentResult.vnp_BankCode && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Ngân hàng:</span>
                                    <span className="font-medium">{paymentResult.vnp_BankCode}</span>
                                </div>
                            )}
                            {paymentResult.vnp_BankTranNo && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Mã giao dịch ngân hàng:</span>
                                    <span className="font-medium">{paymentResult.vnp_BankTranNo}</span>
                                </div>
                            )}
                            {paymentResult.vnp_CardType && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Loại thẻ:</span>
                                    <span className="font-medium">{paymentResult.vnp_CardType}</span>
                                </div>
                            )}
                            {paymentResult.vnp_TransactionNo && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Mã giao dịch VNPay:</span>
                                    <span className="font-medium">{paymentResult.vnp_TransactionNo}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Mã phản hồi:</span>
                                <span className={`font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                    {paymentResult.vnp_ResponseCode}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-600 font-medium">Lỗi xử lý</span>
                        </div>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/order-history')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                        Xem lịch sử đơn hàng
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                        Về trang chủ
                    </button>
                    {!isSuccess && (
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                        >
                            Thử lại
                        </button>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm mb-2">
                        Nếu bạn gặp vấn đề với giao dịch, vui lòng liên hệ hỗ trợ khách hàng
                    </p>
                    <div className="flex justify-center space-x-4 text-sm">
                        <span className="text-blue-600">📞 Hotline: 1900-xxx-xxx</span>
                        <span className="text-blue-600">✉️ Email: support@example.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VNPayReturn;