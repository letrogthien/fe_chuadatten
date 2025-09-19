import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { components } from "../../api-types/productService";
import { fetchCategoryChildren, fetchRootCategories } from "../../services/productCategoryApi";

type CategoryDto = components["schemas"]["CategoryDto"];

const staticCategories: CategoryDto[] = [
  { id: "1", name: "Danh mục con 1", },
  { id: "2", name: "Danh mục con 2", },
  { id: "3", name: "Danh mục con 3", },
  { id: "4", name: "Danh mục con 4", },
  { id: "5", name: "Danh mục con 5", },
  { id: "6", name: "Danh mục con 6", },
];

const CategoryChildren: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const parentCategory = location.state as CategoryDto | undefined;
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [rootCategories, setRootCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Fetch root categories for horizontal bar
    fetchRootCategories()
      .then((rootList) => {
        setRootCategories(rootList || []);
        // Check scroll buttons after root categories are loaded
        setTimeout(checkScrollButtons, 100);
      })
      .catch(() => {
        // ignore error for root categories
      });

    // Fetch children categories
    if (!id) {
      setCategories(staticCategories);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCategoryChildren(id)
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => {
        setError("Không thể tải danh mục con.");
        setCategories(staticCategories);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>      
      {/* Horizontal Root Categories Bar */}
      <section className="py-4 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Scrollable Categories */}
            <div 
              ref={scrollRef}
              className="flex items-center space-x-4 overflow-x-auto scrollbar-hide px-8"
              onScroll={checkScrollButtons}
            >
              {rootCategories.map((rootCat) => (
                <button
                  key={rootCat.id}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    rootCat.id === parentCategory?.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => navigate(`/category/${rootCat.id}`, { state: rootCat })}
                >
                  {rootCat.name}
                </button>
              ))}
            </div>
            
            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 flex-1 min-h-[60vh]">
      <h2 className="text-3xl font-bold text-center mb-10">{parentCategory?.slug}</h2>


      <div className="max-w-6xl mx-auto">
        {loading && <div className="text-center text-gray-500">Đang tải...</div>}
        {error && <div className="text-center text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition group flex flex-col overflow-hidden"
              >
                <div className="flex-1 flex flex-col p-6 items-center justify-center">
                  <div className="font-bold text-lg text-gray-900 mb-1 truncate group-hover:text-blue-700 transition text-center">{cat.name}</div>
   
                                      <button
                      onClick={() => navigate(`/products/category/${cat.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Xem sản phẩm
                    </button>
                </div>
              </div>
            ))
          ) : (
            !loading && <div className="col-span-full text-center text-gray-400">Không có danh mục con nào.</div>
          )}
        </div>
      </div>
    </section>
    </>
  );
};

export default CategoryChildren;
