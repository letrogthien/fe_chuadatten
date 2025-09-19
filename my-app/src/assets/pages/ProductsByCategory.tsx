import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { components } from "../../api-types/productService";
import { fetchProductsByCategory } from "../../services/productApi";
import MainBaner from "../banner/MainBaner";

type ProductDto = components["schemas"]["ProductDto"];

const ProductsByCategory: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewProduct = (productId: string | undefined) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  useEffect(() => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    fetchProductsByCategory(categoryId)
      .then((data) => {
        setProducts(data.products);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Không thể tải danh sách sản phẩm");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryId]);

  return (
    <>
      <MainBaner />
      <section className="py-12 bg-gray-50 flex-1 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Sản phẩm theo danh mục
          </h2>
          
          {loading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải sản phẩm...</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center text-gray-500">
              Không có sản phẩm nào trong danh mục này.
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <button
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-left w-full"
                  onClick={() => handleViewProduct(product.id)}
                  aria-label={`Xem chi tiết sản phẩm ${product.name}`}
                >
                  {/* Product Image */}
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url || "/placeholder.jpg"}
                        alt={product.name || "Product"}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Không có ảnh</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name || "Tên sản phẩm"}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description || "Không có mô tả"}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-blue-600">
                        {product.basePrice
                          ? `${product.basePrice.toLocaleString()} ${product.currency || "VND"}`
                          : "Liên hệ"}
                      </span>
                    </div>

                    {/* Rating */}
                    {product.ratingAvg && product.ratingCount && (
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {product.ratingAvg.toFixed(1)} ({product.ratingCount})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center">
                      Xem chi tiết
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductsByCategory;