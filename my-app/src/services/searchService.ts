import { productServiceClient } from './apiClientProduct';

// Types for search API
export interface SearchProduct {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
  currency?: string;
  ratingAvg?: number;
  ratingCount?: number;
  tags?: string[];
  images?: Array<{ url: string; alt?: string }>;
  categoryIds?: string[];
  attributes?: Record<string, string>;
  active?: string;
  createdAt?: string;
}

export interface SearchCategory {
  id: string;
  name: string;
  description?: string;
  path?: string;
  parentId?: string;
  level?: number;
}

export interface SearchRequest {
  keyword?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  attributes?: Record<string, string>;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'relevance' | 'price' | 'rating' | 'createdAt';
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
  includeInactive?: boolean;
}

export interface SearchResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  executionTimeMs?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

// Simplified search result for UI
export interface SearchResult {
  id: string;
  name: string;
  type: 'product' | 'category';
  slug?: string; // For navigation
}

//Helper functions to convert API responses to simplified SearchResult
const convertProductToSearchResult = (product: SearchProduct): SearchResult => ({
  id: product.id,
  name: product.name,
  type: 'product',
  slug: product.id // Use ID as slug for product navigation
});

const convertCategoryToSearchResult = (category: SearchCategory): SearchResult => ({
  id: category.id,
  name: category.name,
  type: 'category',
  slug: category.path || category.id // Use path or ID for category navigation
});

// Search Service Class
export class SearchService {
  // Product search với POST method (advanced search)
  static async searchProducts(request: SearchRequest): Promise<SearchResponse<SearchProduct>> {
    try {
      const response = await productServiceClient.post<ApiResponse<SearchResponse<SearchProduct>>>(
        '/search/products',
        request
      );
      return response.data.data;
    } catch (error) {
      console.error('Product search error:', error);
      return {
        items: [],
        totalItems: 0,
        currentPage: 0,
        pageSize: request.size || 20,
        totalPages: 0
      };
    }
  }

  // Product search với GET method (simple search)
  static async searchProductsSimple(
    keyword: string,
    options: Partial<SearchRequest> = {}
  ): Promise<SearchResponse<SearchProduct>> {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (options.categoryIds?.length) {
        options.categoryIds.forEach(id => params.append('categoryIds', id));
      }
      if (options.minPrice !== undefined) params.append('minPrice', options.minPrice.toString());
      if (options.maxPrice !== undefined) params.append('maxPrice', options.maxPrice.toString());
      if (options.minRating !== undefined) params.append('minRating', options.minRating.toString());
      if (options.maxRating !== undefined) params.append('maxRating', options.maxRating.toString());
      if (options.tags?.length) {
        options.tags.forEach(tag => params.append('tags', tag));
      }
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortDirection) params.append('sortDirection', options.sortDirection);
      params.append('page', (options.page || 0).toString());
      params.append('size', (options.size || 20).toString());
      if (options.includeInactive) params.append('includeInactive', 'true');

      const response = await productServiceClient.get<ApiResponse<SearchResponse<SearchProduct>>>(
        `/search/products?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Simple product search error:', error);
      return {
        items: [],
        totalItems: 0,
        currentPage: 0,
        pageSize: options.size || 20,
        totalPages: 0
      };
    }
  }

  // Category search
  static async searchCategories(
    keyword: string,
    page = 0,
    size = 10,
    includeInactive = false
  ): Promise<SearchResponse<SearchCategory>> {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (includeInactive) params.append('includeInactive', 'true');

      const response = await productServiceClient.get<ApiResponse<SearchResponse<SearchCategory>>>(
        `/search/categories?${params.toString()}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Category search error:', error);
      return {
        items: [],
        totalItems: 0,
        currentPage: 0,
        pageSize: size,
        totalPages: 0
      };
    }
  }

  // Autocomplete suggestions for products
  static async getProductSuggestions(query: string, limit = 10): Promise<string[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', limit.toString());

      const response = await productServiceClient.get<ApiResponse<string[]>>(
        `/search/suggestions/products?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Product suggestions error:', error);
      return [];
    }
  }

  // Autocomplete suggestions for categories
  static async getCategorySuggestions(query: string, limit = 10): Promise<string[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', limit.toString());

      const response = await productServiceClient.get<ApiResponse<string[]>>(
        `/search/suggestions/categories?${params.toString()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Category suggestions error:', error);
      return [];
    }
  }

  // Simplified search for UI - returns only necessary data
  static async searchSimplified(
    keyword: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    try {
      if (!keyword.trim()) {
        return [];
      }

      const [products, categories] = await Promise.all([
        this.searchProductsSimple(keyword, { size: Math.ceil(maxResults * 0.7) }), // 70% products
        this.searchCategories(keyword, 0, Math.ceil(maxResults * 0.3)) // 30% categories
      ]);

      const results: SearchResult[] = [];

      // Add products
      products.items.forEach(product => {
        results.push(convertProductToSearchResult(product));
      });

      // Add categories
      categories.items.forEach(category => {
        results.push(convertCategoryToSearchResult(category));
      });

      // Limit total results
      return results.slice(0, maxResults);

    } catch (error) {
      console.error('Simplified search error:', error);
      return [];
    }
  }

  // Combined search for both products and categories (for backward compatibility)
  static async searchAll(
    keyword: string,
    options: Partial<SearchRequest> = {}
  ): Promise<{
    products: SearchResponse<SearchProduct>;
    categories: SearchResponse<SearchCategory>;
  }> {
    try {
      const [products, categories] = await Promise.all([
        this.searchProductsSimple(keyword, { ...options, size: options.size || 10 }),
        this.searchCategories(keyword, 0, 5)
      ]);

      return { products, categories };
    } catch (error) {
      console.error('Combined search error:', error);
      return {
        products: {
          items: [],
          totalItems: 0,
          currentPage: 0,
          pageSize: options.size || 10,
          totalPages: 0
        },
        categories: {
          items: [],
          totalItems: 0,
          currentPage: 0,
          pageSize: 5,
          totalPages: 0
        }
      };
    }
  }

  // Get popular search terms as SearchResult[]
  static async getPopularTermsAsResults(limit = 6): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      const response = await productServiceClient.get<ApiResponse<string[]>>(
        `/search/popular-terms?${params.toString()}`
      );
      
      const terms = response.data.data || [];
      return terms.map((term, index) => ({
        id: `popular-${index}`,
        name: term,
        type: 'category' as const, // Popular terms are treated as categories
        slug: term.toLowerCase().replace(/\s+/g, '-')
      }));
    } catch (error) {
      console.error('Popular terms error:', error);
      // Fallback popular terms
      return [
        { id: 'gaming-accounts', name: 'Gaming Accounts', type: 'category', slug: 'gaming-accounts' },
        { id: 'digital-items', name: 'Digital Items', type: 'category', slug: 'digital-items' },
        { id: 'game-currency', name: 'Game Currency', type: 'category', slug: 'game-currency' },
        { id: 'boosting-services', name: 'Boosting Services', type: 'category', slug: 'boosting-services' },
        { id: 'gift-cards', name: 'Gift Cards', type: 'category', slug: 'gift-cards' },
        { id: 'software-keys', name: 'Software Keys', type: 'category', slug: 'software-keys' }
      ];
    }
  }

  // Get popular search terms (backward compatibility)
  static async getPopularTerms(limit = 10): Promise<string[]> {
    const results = await this.getPopularTermsAsResults(limit);
    return results.map(result => result.name);
  }
}

export default SearchService;