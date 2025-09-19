import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { components } from "../../api-types/productService";
import type { components as TransactionComponents } from "../../api-types/transactionService";
import { useUser } from "../../context/UserContext";
import apiClient from "../../services/apiClient";
import { createOrder } from "../../services/transactionApi";

type ProductDto = components["schemas"]["ProductDto"];
type ProductVariantDto = components["schemas"]["ProductVariantDto"];
type OrderCreateRq = TransactionComponents["schemas"]["OrderCreateRq"];

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string | null;
    variantData?: ProductVariantDto | null;
    timestamp: string;
}

interface CheckoutLocationState {
    product: ProductDto;
    selectedVariant: ProductVariantDto | null;
    isBuyNow: boolean;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();
    const state = location.state as CheckoutLocationState;
    
    // Extract product and variant data from navigation state
    const product = state?.product;
    const selectedVariant = state?.selectedVariant;
    const isBuyNow = state?.isBuyNow || false;
    
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingBillingAddress, setLoadingBillingAddress] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        note: ''
    });

    useEffect(() => {
        if (isBuyNow && product) {
            // Handle Buy Now scenario - create cart item from passed data
            const buyNowItem: CartItem = {
                productId: product.id || '',
                name: product.name || '',
                price: selectedVariant?.price || product.basePrice || 0,
                quantity: quantity,
                variant: selectedVariant?.sku || null,
                variantData: selectedVariant,
                timestamp: new Date().toISOString()
            };
            setCartItems([buyNowItem]);
        } else {
            // Handle normal checkout - load cart items from localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    const parsedCart: CartItem[] = JSON.parse(savedCart);
                    setCartItems(parsedCart);
                } catch (error) {
                    console.error('Error parsing cart data:', error);
                    setCartItems([]);
                }
            }
        }
    }, [isBuyNow, product, selectedVariant, quantity]);

    // Update user info when user data changes
    useEffect(() => {
        if (user) {
            setCustomerInfo(prev => ({
                ...prev,
                fullName: user.displayName || prev.fullName,
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleQuantityChange = (index: number, newQuantity: number) => {
        const currentItem = cartItems[index];
        const availableQty = currentItem?.variantData?.availableQty || 0;
        
        // Check if new quantity is within valid range and stock limit
        if (newQuantity < 1) {
            alert('Số lượng không thể nhỏ hơn 1!');
            return;
        }
        
        if (newQuantity > 99) {
            alert('Số lượng tối đa là 99 sản phẩm!');
            return;
        }
        
        if (availableQty > 0 && newQuantity > availableQty) {
            alert(`Số lượng tối đa có thể mua là ${availableQty} sản phẩm!`);
            return;
        }
        
        if (isBuyNow) {
            // For buy now mode, update the single item quantity
            setQuantity(newQuantity);
            if (product) {
                const updatedItem: CartItem = {
                    productId: product.id || '',
                    name: product.name || '',
                    price: selectedVariant?.price || product.basePrice || 0,
                    quantity: newQuantity,
                    variant: selectedVariant?.sku || null,
                    variantData: selectedVariant,
                    timestamp: new Date().toISOString()
                };
                setCartItems([updatedItem]);
            }
        } else {
            // For normal cart mode, update specific item
            const updatedItems = cartItems.map((item, i) => 
                i === index ? { ...item, quantity: newQuantity } : item
            );
            setCartItems(updatedItems);
            localStorage.setItem('cart', JSON.stringify(updatedItems));
        }
    };


    const getTotalAmount = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const loadBillingAddress = async () => {
        if (!user) return;
        
        setLoadingBillingAddress(true);
        try {
            const response = await apiClient.get('/api/v1/user-service/users/me/billing-address');
            const billingData = response.data.data;
            
            if (billingData) {
                setCustomerInfo(prev => ({
                    ...prev,
                    address: billingData.address || prev.address,
                    city: billingData.city || prev.city,
                    // Map state/province to appropriate fields
                    district: billingData.state || billingData.province || prev.district,
                }));
            }
        } catch (error) {
            console.log('No billing address found or error loading:', error);
        } finally {
            setLoadingBillingAddress(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }

        // Basic validation - only email is required
        if (!customerInfo.email) {
            alert('Vui lòng nhập email!');
            return;
        }

        if (!user) {
            alert('Vui lòng đăng nhập để đặt hàng!');
            return;
        }

        setLoading(true);

        try {
            // Get sellerId from product (assuming all items from same seller for now)
            const sellerId = product?.userId; // userId is the seller ID in ProductDto
            
            if (!sellerId) {
                alert('Không thể xác định người bán. Vui lòng thử lại!');
                return;
            }

            // Prepare order data
            const orderData: OrderCreateRq = {
                sellerId: sellerId,
                totalAmount: getTotalAmount(),
                currency: 'VND',
                items: cartItems.map(item => ({
                    productId: item.productId,
                    productVariantId: item.variantData?.id,
                    unitPrice: item.price,
                    quantity: item.quantity
                }))
            };

            // Create order via API
            const createdOrder = await createOrder(orderData);
            
            // Clear cart after successful order creation
            if (!isBuyNow) {
                localStorage.removeItem('cart');
            }
            setCartItems([]);
            
            // Navigate to payment page with order data
            navigate('/payment', {
                state: {
                    order: createdOrder,
                    customerInfo: customerInfo
                }
            });

        } catch (error: any) {
            console.error('Error creating order:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Redirect if no product data in buy now mode
    if (isBuyNow && !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có sản phẩm</h1>
                    <p className="text-gray-600 mb-6">Vui lòng chọn sản phẩm trước khi checkout.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🛒</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h1>
                        <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng</h1>
                    <nav className="text-sm text-gray-500">
                        <button onClick={() => navigate('/')} className="hover:text-blue-600">
                            Trang chủ
                        </button>
                        <span> → </span>
                        <span className="text-gray-900">Đơn hàng</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">
                                {isBuyNow ? 'Sản phẩm đã chọn' : 'Đơn hàng của bạn'}
                            </h2>
                            
                            {isBuyNow && product && selectedVariant && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center text-blue-800 text-sm">
                                        <span className="mr-2">🛒</span>
                                        <span>Mua ngay - Phiên bản: {selectedVariant.sku}</span>
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        Giá: {selectedVariant.price?.toLocaleString('vi-VN')} VND
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item, index) => (
                                    <div key={`${item.productId}-${item.variant}-${item.timestamp}`} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            🎮
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                                            {item.variant && (
                                                <p className="text-sm text-gray-500">Phiên bản: {item.variant}</p>
                                            )}
                                            {item.variantData && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {item.variantData.attributes && Object.entries(item.variantData.attributes).slice(0, 2).map(([key, value]) => (
                                                        <span key={key} className="mr-2">
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-3 mt-2">
                                                <button
                                                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                >
                                                    −
                                                </button>
                                                <span className="text-lg font-bold px-4 py-2 min-w-[60px] text-center bg-gray-50 rounded-lg border-2 border-gray-200">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                    disabled={
                                                        item.quantity >= 99 || 
                                                        (item.variantData?.availableQty ? item.quantity >= item.variantData.availableQty : false)
                                                    }
                                                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                >
                                                    +
                                                </button>
                                                {!isBuyNow && (
                                                    <button
                                                        onClick={() => handleRemoveItem(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium ml-auto px-3 py-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                            </div>
                                            {item.variantData && (
                                                <div className="mt-2">
                                                    <div className={`text-xs ${
                                                        item.variantData.availableQty && item.quantity >= item.variantData.availableQty
                                                            ? 'text-red-600'
                                                            : 'text-green-600'
                                                    }`}>
                                                        Còn lại: {item.variantData.availableQty || 0} sản phẩm
                                                    </div>
                                                    {item.variantData.availableQty && item.quantity >= item.variantData.availableQty && (
                                                        <div className="text-xs text-red-500 font-medium">
                                                            ⚠️ Đã đạt giới hạn tồn kho
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Tối đa: {Math.min(item.variantData.availableQty || 99, 99)} sản phẩm
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {item.price.toLocaleString('vi-VN')} VND / sản phẩm
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Tạm tính:</span>
                                    <span className="font-medium">{getTotalAmount().toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                    <span className="font-medium text-green-600">Miễn phí</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">{getTotalAmount().toLocaleString('vi-VN')} VND</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-6">Thông tin giao hàng</h2>
                            
                            <form onSubmit={handleSubmitOrder} className="space-y-6">
                                {/* Load saved address button */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-blue-800">Địa chỉ đã lưu</h4>
                                            <p className="text-xs text-blue-600">Tải địa chỉ thanh toán đã lưu trong tài khoản</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={loadBillingAddress}
                                            disabled={loadingBillingAddress || !user}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {loadingBillingAddress ? 'Đang tải...' : 'Tải địa chỉ'}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={customerInfo.fullName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={customerInfo.email}
                                            readOnly
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                            placeholder="Email từ tài khoản"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ
                                    </label>
                                    <input  
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={customerInfo.address}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập địa chỉ chi tiết"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                            Tỉnh/Thành phố
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={customerInfo.city}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tỉnh/Thành phố"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                                            Quận/Huyện
                                        </label>
                                        <input
                                            type="text"
                                            id="district"
                                            name="district"
                                            value={customerInfo.district}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Quận/Huyện"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phường/Xã
                                        </label>
                                        <input
                                            type="text"
                                            id="ward"
                                            name="ward"
                                            value={customerInfo.ward}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Phường/Xã"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú đơn hàng
                                    </label>
                                    <textarea
                                        id="note"
                                        name="note"
                                        value={customerInfo.note}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Đang tạo đơn hàng...
                                            </div>
                                        ) : (
                                            `Tạo đơn hàng - ${getTotalAmount().toLocaleString('vi-VN')} VND`
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;