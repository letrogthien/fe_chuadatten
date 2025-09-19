import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { components } from "../../api-types/productService";
import { ROUTES } from "../../constants/routes";
import { fetchHotDealProducts } from "../../services/productApi";
import { fetchCategoryChildren, fetchRootCategories } from "../../services/productCategoryApi";
import MainBaner from "../banner/MainBaner";

type CategoryDto = components["schemas"]["CategoryDto"];

// Type for hot deal variant
type HotDealVariant = {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  attributesHash: string;
  price: number;
  availableQty: number;
  reservedQty: number;
  soldQty: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const Home: React.FC = () => {
    const [categories, setCategories] = useState<CategoryDto[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);
    const [childrenMap, setChildrenMap] = useState<Record<string, CategoryDto[]>>({});
    const [childrenLoading, setChildrenLoading] = useState<Record<string, boolean>>({});
    const [featuredProducts, setFeaturedProducts] = useState<HotDealVariant[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchRootCategories()
            .then((list) => {
                setCategories(list ? list.slice(0, 4) : []);

                // fetch children for each root category
                if (list && list.length > 0) {
                    list.forEach((cat) => {
                        if (cat.id) {
                            setChildrenLoading((prev) => ({ ...prev, [cat.id!]: true }));
                            fetchCategoryChildren(cat.id)
                                .then((children) => {
                                    setChildrenMap((prev) => ({ ...prev, [cat.id!]: children ? children.slice(0, 4) : [] }));
                                })
                                .finally(() => {
                                    setChildrenLoading((prev) => ({ ...prev, [cat.id!]: false }));
                                });
                        }
                    });
                }
            })
            .catch(() => {
                // fallback 4 static categories
                setCategories([
                    { id: "static-1", name: "Tài khoản Game", slug: "gaming-accounts" },
                    { id: "static-2", name: "Thẻ Gift Card", slug: "gift-cards" },
                    { id: "static-3", name: "Bản quyền phần mềm", slug: "software-licenses" },
                    { id: "static-4", name: "Mã game & DLC", slug: "game-codes" },
                ]);
            })
            .finally(() => setLoading(false));

        // Fetch featured products from hot deal API independently
        const fetchFeaturedProducts = async () => {
            setProductsLoading(true);
            try {
                const hotDeals = await fetchHotDealProducts(6);
                setFeaturedProducts(hotDeals);
            } catch (error) {
                console.error("Error fetching hot deal products:", error);
            } finally {
                setProductsLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <>
            <MainBaner />
            
            {/* Featured Products Section */}
            <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            🔥 Sản phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Hot</span>
                        </h2>
                        <p className="text-gray-600 text-lg">Những sản phẩm được ưa chuộng nhất hiện tại</p>
                    </div>

                    {productsLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredProducts.length > 0 ? (
                                featuredProducts.map((product, index) => (
                                    <div
                                        key={product.id || `product-${index}`}
                                        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                                    >
                                        {/* Hot Badge */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                🔥 HOT
                                            </span>
                                        </div>

                                        {/* Product Image/Icon */}
                                        <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                                            <div className="text-6xl opacity-80">🎮</div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-6">
                                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {product.sku || 'Sản phẩm gaming'}
                                            </h3>
                                            
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                Mã sản phẩm: {product.sku}
                                            </p>

                                            {/* Price */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-2xl font-bold text-green-600">
                                                        {product.price ? `${product.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                                                    </span>
                                                    {product.price && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {(product.price * 1.3).toLocaleString('vi-VN')} VND
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500">Kho hàng</div>
                                                    <div className="flex items-center">
                                                        <span className="text-green-500">📦</span>
                                                        <span className="text-sm font-semibold ml-1">
                                                            {product.availableQty || 0} có sẵn
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => navigate(`/product/${product.productId}`)}
                                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>

                                        {/* Hover Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <p className="text-gray-500 text-lg">Đang cập nhật sản phẩm mới...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* View All Button */}
                    {featuredProducts.length > 0 && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => navigate(ROUTES.PRODUCTS)}
                                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-xl border-2 border-blue-600 transition-all duration-200 hover:shadow-lg"
                            >
                                Xem tất cả sản phẩm →
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Trust Signals Section */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div className="group">
                            <div className="text-3xl mb-2">🛡️</div>
                            <div className="text-2xl font-bold mb-1">100%</div>
                            <div className="text-sm opacity-90">An toàn</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl mb-2">⚡</div>
                            <div className="text-2xl font-bold mb-1">24/7</div>
                            <div className="text-sm opacity-90">Hỗ trợ</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl mb-2">🎯</div>
                            <div className="text-2xl font-bold mb-1">1000+</div>
                            <div className="text-sm opacity-90">Khách hàng</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl mb-2">🚀</div>
                            <div className="text-2xl font-bold mb-1">5 phút</div>
                            <div className="text-sm opacity-90">Giao hàng</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-12 bg-gray-50 flex-1">
                <h2 className="text-3xl font-bold text-center mb-10">Categories</h2>
                {loading && <div className="text-center">Loading...</div>}
                {error && <div className="text-center text-red-500">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
                    {categories && categories.length > 0 && categories.map((cat, index) => (
                        <div
                            key={cat.id || index}
                            className="relative rounded-xl shadow-lg p-6 text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:scale-105 transition-transform"
                        >
                  
                            <h3 className="text-lg font-semibold mt-6 mb-2 truncate" title={cat.name || ''}>{cat.name || 'No name'}</h3>
                            
                            {/* Danh mục con */}
                            <div className="mt-4">
                            
                                {childrenLoading[cat.id!] ? (
                                    <div className="text-xs text-white/60">Đang tải...</div>
                                ) : (
                                    <>
                                        <ul className="space-y-1">
                                            {(childrenMap[cat.id!] && childrenMap[cat.id!].length > 0) ? (
                                                childrenMap[cat.id!].map((child) => (
                                                    <li key={child.id}>
                                                        <button
                                                            className="text-xs text-blue-200 hover:underline hover:text-yellow-200 transition"
                                                            onClick={() => navigate(`/products/category/${child.id}`)}
                                                        >
                                                            {child.name}
                                                        </button>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-xs text-white/50">Không có danh mục con</li>
                                            )}
                                        </ul>
                                        {/* Nút xem thêm */}
                                        {(
                                            (childrenMap[cat.id!] && childrenMap[cat.id!].length === 4)
                                            || (error && cat.id?.startsWith('static-'))
                                        ) && (
                                            <button
                                                className="mt-2 text-xs text-yellow-200 hover:underline hover:text-white transition"
                                                onClick={() => navigate(`/category/${cat.id}`)}
                                            >
                                                Xem thêm danh mục
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!categories || categories.length === 0) && !loading && !error && (
                        <div className="col-span-full text-center text-gray-500">Không có danh mục nào.</div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Home;