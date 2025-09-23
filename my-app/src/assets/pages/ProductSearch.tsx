import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { components as ProductComponents } from '../../api-types/productService';
import { getRootCategories, searchProducts } from '../../services/productApi';

type ProductDto = ProductComponents['schemas']['ProductDto'];
type CategoryDto = ProductComponents['schemas']['CategoryDto'];

const ProductSearch: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [categories, setCategories] = useState<CategoryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
    const [pagination, setPagination] = useState({
        currentPage: parseInt(searchParams.get('page') || '0'),
        totalPages: 0,
        totalElements: 0,
        pageSize: 12
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (searchKeyword.trim()) {
            handleSearch();
        }
    }, [searchKeyword, pagination.currentPage]);

    const loadCategories = async () => {
        try {
            const categoriesData = await getRootCategories();
            setCategories(categoriesData || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchKeyword.trim()) return;

        try {
            setLoading(true);
            const response = await searchProducts(searchKeyword, pagination.currentPage, pagination.pageSize);
            setProducts(response.products || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.totalPages,
                totalElements: response.totalElements
            }));
        } catch (error) {
            console.error('Failed to search products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productId?: string) => {
        if (productId) {
            navigate(`/product/${productId}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent, productId?: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleProductClick(productId);
        }
    };

    const getCategoryName = (categoryIds?: string[]) => {
        if (!categoryIds || categoryIds.length === 0) return 'No Category';
        const category = categories.find(cat => cat.id === categoryIds[0]);
        return category?.name || 'Unknown Category';
    };

    const getProductImage = (product: ProductDto) => {
        if (product.images && product.images.length > 0) {
            return product.images[0].url || '';
        }
        return '';
    };

    const renderProductGrid = () => {
        if (loading) {
            return Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            ));
        }

        if (products.length === 0) {
            return (
                <div className="col-span-full text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">No products found</div>
                    <div className="text-gray-400 text-sm">Try adjusting your search criteria</div>
                </div>
            );
        }

        return products.map((product) => (
            <div
                key={product.id}
                role="button"
                tabIndex={0}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => handleProductClick(product.id)}
                onKeyPress={(e) => handleKeyPress(e, product.id)}
            >
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    {getProductImage(product) ? (
                        <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-gray-400 text-4xl">📦</div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                        {getCategoryName(product.categoryIds)}
                    </p>
                    <div className="text-sm text-gray-600">
                        Status: {product.active}
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="lg:w-1/4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                id="category-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="mb-6">
                            <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                id="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="name_asc">Name: A to Z</option>
                                <option value="name_desc">Name: Z to A</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="lg:w-3/4">
                    {/* Results Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm text-gray-600">
                            {loading ? (
                                'Searching...'
                            ) : (
                                `${pagination.totalElements} products found`
                            )}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {renderProductGrid()}
                    </div>

                    {/* Pagination */}
                    {!loading && products.length > 0 && pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(0, prev.currentPage - 1) }))}
                                    disabled={pagination.currentPage === 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    Page {pagination.currentPage + 1} of {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSearch;