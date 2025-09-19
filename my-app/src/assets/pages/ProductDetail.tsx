import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { components } from "../../api-types/productService";
import { useUser } from "../../context/UserContext";
import { getProductById, getVariantsByProduct } from "../../services/productApi";

type ProductDto = components["schemas"]["ProductDto"];
type ProductVariantDto = components["schemas"]["ProductVariantDto"];

const ProductDetail: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useUser();
    const [product, setProduct] = useState<ProductDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [variants, setVariants] = useState<ProductVariantDto[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);
    const [variantsLoading, setVariantsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideshowRef = useRef<HTMLDivElement>(null);

    // Helper functions to reduce complexity
    const hasStockAvailable = () => {
        return variants.length > 0 && variants.some(variant => (variant.availableQty || 0) > 0);
    };

    const getStockStatusText = () => {
        if (variantsLoading) return 'Đang kiểm tra...';
        if (hasStockAvailable()) return 'Còn hàng';
        if (variants.length > 0) return 'Hết hàng';
        return 'Chưa có variants';
    };

    const getStockStatusClass = () => {
        if (variantsLoading) return 'text-gray-400';
        if (hasStockAvailable()) return 'text-green-600';
        return 'text-red-600';
    };

    useEffect(() => {
        if (!productId) {
            setError("Product ID không hợp lệ");
            return;
        }

        setLoading(true);
        getProductById(productId)
            .then((data) => {
                if (data) {
                    setProduct(data);
                    // Fetch variants for this product
                    setVariantsLoading(true);
                    getVariantsByProduct(productId)
                        .then((variantData) => {
                            setVariants(variantData);
                            if (variantData.length > 0) {
                                setSelectedVariant(variantData[0]); // Select first variant by default
                            }
                        })
                        .catch((err) => {
                            console.error("Error fetching variants:", err);
                        })
                        .finally(() => setVariantsLoading(false));
                } else {
                    setError("Không tìm thấy sản phẩm");
                }
            })
            .catch((err) => {
                console.error("Error fetching product:", err);
                setError("Lỗi khi tải sản phẩm");
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const nextSlide = () => {
        if (variants.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % Math.ceil(variants.length / 3));
        }
    };

    const prevSlide = () => {
        if (variants.length > 0) {
            setCurrentSlide((prev) => (prev - 1 + Math.ceil(variants.length / 3)) % Math.ceil(variants.length / 3));
        }
    };

    const scrollToSlide = (slideIndex: number) => {
        setCurrentSlide(slideIndex);
        if (slideshowRef.current) {
            const slideWidth = slideshowRef.current.offsetWidth / 3;
            slideshowRef.current.scrollTo({
                left: slideIndex * slideWidth * 3,
                behavior: 'smooth'
            });
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        
        // Check if any variants have stock
        if (variants.length > 0 && !hasStockAvailable()) {
            alert('Sản phẩm hiện tại đã hết hàng!');
            return;
        }
        
        // Check if user is authenticated
        if (!isAuthenticated) {
            // Save current location to return after login
            const returnUrl = location.pathname + location.search;
            localStorage.setItem('returnAfterLogin', returnUrl);
            
            // Navigate to login page
            navigate('/login', {
                state: {
                    from: returnUrl,
                    message: 'Vui lòng đăng nhập để tiếp tục mua hàng'
                }
            });
            return;
        }
        
        // Navigate to checkout page with product and variant data
        navigate('/checkout', {
            state: {
                product: product,
                selectedVariant: selectedVariant,
                isBuyNow: true
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
                    <p className="text-gray-600 mb-6">{error || "Không tìm thấy sản phẩm"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li>
                            <button onClick={() => navigate('/')} className="hover:text-blue-600">
                                Trang chủ
                            </button>
                        </li>
                        <li>→</li>
                        <li>
                            <button onClick={() => navigate(-1)} className="hover:text-blue-600">
                                Sản phẩm
                            </button>
                        </li>
                        <li>→</li>
                        <li className="text-gray-900 font-medium truncate">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0].url || ''}
                                    alt={product.name || "Product"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-8xl opacity-60">🎮</div>
                            )}
                        </div>
                        
                        {/* Thumbnail Images */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.slice(1, 5).map((img) => (
                                    <div key={img.id || img.url} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                        <img
                                            src={img.url || ''}
                                            alt={product.name || "Product thumbnail"}
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Title and Rating */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="ml-1 text-lg font-semibold">
                                        {product.ratingAvg?.toFixed(1) || "5.0"}
                                    </span>
                                    <span className="ml-2 text-gray-500">
                                        ({product.ratingCount || 0} đánh giá)
                                    </span>
                                </div>
                                <div className="text-gray-500">|</div>
                                <div className={`font-semibold ${getStockStatusClass()}`}>
                                    {getStockStatusText()}
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                            <div className="flex items-center space-x-4">
                                <span className="text-3xl font-bold text-green-600">
                                    {product.basePrice ? `${product.basePrice.toLocaleString('vi-VN')} ${product.currency || 'VND'}` : 'Liên hệ'}
                                </span>

                            </div>

                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || "Mô tả sản phẩm đang được cập nhật..."}
                            </p>
                        </div>

                        {/* Tags sản phẩm */}
                        {product.tags && product.tags.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags sản phẩm</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Variants Slideshow */}
                        {variants.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Các phiên bản có sẵn ({variants.length})
                                </h3>
                                
                                {variantsLoading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-600">Đang tải variants...</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Navigation Buttons */}
                                        {variants.length > 3 && (
                                            <>
                                                <button
                                                    onClick={prevSlide}
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-2 shadow-lg transition-all duration-200"
                                                >
                                                    ←
                                                </button>
                                                <button
                                                    onClick={nextSlide}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-2 shadow-lg transition-all duration-200"
                                                >
                                                    →
                                                </button>
                                            </>
                                        )}

                                        {/* Variants Container */}
                                        <div 
                                            ref={slideshowRef}
                                            className="overflow-hidden"
                                        >
                                            <div 
                                                className="flex transition-transform duration-300 ease-in-out"
                                                style={{ 
                                                    transform: `translateX(-${currentSlide * 100}%)`,
                                                    width: `${Math.ceil(variants.length / 3) * 100}%`
                                                }}
                                            >
                                                {Array.from({ length: Math.ceil(variants.length / 3) }, (_, slideIndex) => (
                                                    <div 
                                                        key={slideIndex}
                                                        className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4"
                                                    >
                                                        {variants.slice(slideIndex * 3, slideIndex * 3 + 3).map((variant) => (
                                                            <button
                                                                key={variant.id}
                                                                onClick={() => setSelectedVariant(variant)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        setSelectedVariant(variant);
                                                                    }
                                                                }}
                                                                className={`w-full text-left border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                    selectedVariant?.id === variant.id
                                                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            >
                                                                {/* Variant Header */}
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="text-sm font-semibold text-gray-900">
                                                                        {variant.sku}
                                                                    </span>
                                                                    {selectedVariant?.id === variant.id && (
                                                                        <span className="text-blue-500 text-sm">✓ Đã chọn</span>
                                                                    )}
                                                                </div>

                                                                {/* Price */}
                                                                <div className="mb-3">
                                                                    <span className="text-lg font-bold text-green-600">
                                                                        {variant.price ? `${variant.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                                                                    </span>
                                                                </div>

                                                                {/* Attributes */}
                                                                {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                                                                    <div className="space-y-1">
                                                                        {Object.entries(variant.attributes).slice(0, 3).map(([key, value]) => (
                                                                            <div key={key} className="flex justify-between text-xs">
                                                                                <span className="text-gray-500 capitalize">{key}:</span>
                                                                                <span className="text-gray-700 font-medium">{value}</span>
                                                                            </div>
                                                                        ))}
                                                                        {Object.keys(variant.attributes).length > 3 && (
                                                                            <div className="text-xs text-gray-400">
                                                                                +{Object.keys(variant.attributes).length - 3} more...
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Stock Status */}
                                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="text-gray-500">Kho:</span>
                                                                        <span className={`font-medium ${
                                                                            (variant.availableQty || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                                                        }`}>
                                                                            {variant.availableQty || 0} có sẵn
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-xs mt-1">
                                                                        <span className="text-gray-500">Đã bán:</span>
                                                                        <span className="text-gray-700 font-medium">
                                                                            {variant.soldQty || 0}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Slide Indicators */}
                                        {variants.length > 3 && (
                                            <div className="flex justify-center mt-4 space-x-2">
                                                {Array.from({ length: Math.ceil(variants.length / 3) }, (_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => scrollToSlide(index)}
                                                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                                                            currentSlide === index ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Selected Variant Info */}
                                        {selectedVariant && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <h4 className="font-semibold text-blue-900 mb-2">Phiên bản đã chọn:</h4>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-blue-800">{selectedVariant.sku}</span>
                                                    <span className="text-lg font-bold text-blue-900">
                                                        {selectedVariant.price ? `${selectedVariant.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

          

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={handleBuyNow}
                                disabled={!hasStockAvailable()}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {hasStockAvailable() ? 'MUA NGAY' : 'HẾT HÀNG'}
                            </button>
   
                        </div>

                        {/* Trust Signals */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span>🔒</span>
                                    <span>Thanh toán an toàn</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>⚡</span>
                                    <span>Giao hàng nhanh</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>🔄</span>
                                    <span>Đổi trả miễn phí</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>📞</span>
                                    <span>Hỗ trợ 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button className="border-b-2 border-blue-500 py-4 px-1 text-blue-600 font-medium">
                                Chi tiết sản phẩm
                            </button>
                            <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
                                Đánh giá ({product.ratingCount || 0})
                            </button>
                            <button className="border-b-2 border-transparent py-4 px-1 text-gray-500 hover:text-gray-700">
                                Chính sách
                            </button>
                        </nav>
                    </div>
                    
                    <div className="py-8">
                        <div className="prose max-w-none">
                            <h3 className="text-xl font-semibold mb-4">Thông tin chi tiết</h3>
                            <div className="bg-white p-6 rounded-xl border">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">Thông tin cơ bản</h4>
                                        <ul className="space-y-2 text-gray-600">
                                            <li><strong>Mã sản phẩm:</strong> {product.id}</li>
                                            <li><strong>Danh mục:</strong> {product.categoryIds?.join(", ") || "Chưa phân loại"}</li>
                                            <li><strong>Trạng thái:</strong> <span className="text-green-600">Đang bán</span></li>
                                            <li><strong>Ngôn ngữ:</strong> Tiếng Việt</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Thông tin bổ sung</h4>
                                        <ul className="space-y-2 text-gray-600">
                                            <li><strong>Hỗ trợ:</strong> 24/7</li>
                                            <li><strong>Bảo hành:</strong> 30 ngày</li>
                                            <li><strong>Giao hàng:</strong> Tức thì</li>
                                            <li><strong>Định dạng:</strong> Digital</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;