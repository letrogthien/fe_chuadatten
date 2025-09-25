// MainBar.tsx
import { Search, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import SearchService, { type SearchResult } from '../../services/searchService';

const MainBar: React.FC = () => {
    const { goHome, goToLogin, goToRegister, isLoginPage, gotoUserCenter } = useAppNavigation();
    const { isAuthenticated, user } = useUser();
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeoutRef = useRef<number | null>(null);

    // Default suggestions when no search query
    // Popular suggestions state
    const [popularSuggestions, setPopularSuggestions] = useState<SearchResult[]>([]);
    
    // Load popular terms on component mount
    useEffect(() => {
        const loadPopularTerms = async () => {
            try {
                const suggestions = await SearchService.getPopularTermsAsResults(6);
                setPopularSuggestions(suggestions);
            } catch (error) {
                console.error('Failed to load popular terms:', error);
                // Fallback will be handled by SearchService
                setPopularSuggestions([]);
            }
        };
        
        loadPopularTerms();
    }, []);
    
    // Search functions
    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }
        
        setIsSearching(true);
        try {
            // Use simplified search
            const results = await SearchService.searchSimplified(query, 8);
            setSearchResults(results);
            setShowSearchDropdown(true);
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to simple results if API fails
            const fallbackResults: SearchResult[] = [
                { id: '1', name: `${query} Products`, type: 'product' as const, slug: query },
                { id: '2', name: `${query} Categories`, type: 'category' as const, slug: query }
            ];
            
            setSearchResults(fallbackResults);
            setShowSearchDropdown(true);
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        // Debounce search
        if (value.trim()) {
            debounceTimeoutRef.current = setTimeout(() => {
                performSearch(value);
            }, 300);
        } else {
            // Show popular suggestions when empty
            setSearchResults(popularSuggestions);
            setShowSearchDropdown(true);
        }
    };
    
    const handleSearchFocus = () => {
        if (searchQuery.trim() && searchResults.length > 0) {
            setShowSearchDropdown(true);
        } else if (!searchQuery.trim()) {
            // Show popular suggestions when no search query
            setSearchResults(popularSuggestions);
            setShowSearchDropdown(true);
        }
    };
    
    const handleSearchBlur = () => {
        // Delay hiding dropdown to allow clicks
        setTimeout(() => {
            setShowSearchDropdown(false);
        }, 200);
    };
    
    const handleResultClick = (result: SearchResult) => {
        setSearchQuery(result.name);
        setShowSearchDropdown(false);
        
        // Navigate based on result type
        if (result.type === 'product') {
            // Navigate to product detail page
            window.location.href = `/product/${result.slug || result.id}`;
        } else if (result.type === 'category') {
            // Navigate to category page
            window.location.href = `/products/category/${result.id}`;
        }
        
        console.log('Navigating to:', result.type, result.slug || result.id);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchDropdown(false);
        inputRef.current?.focus();
    };
    
    // Helper functions to avoid nested ternary
    const getResultBgColor = (type: string) => {
        if (type === 'product') return 'bg-blue-500';
        if (type === 'category') return 'bg-purple-500';
        if (type === 'suggestion') return 'bg-green-500';
        return 'bg-gray-500';
    };
    
    const getResultIcon = (type: string) => {
        if (type === 'product') return '🎮';
        if (type === 'category') return '📁';
        if (type === 'suggestion') return '💡';
        return '🔍';
    };
    
    const renderSearchDropdownContent = () => {
        if (isSearching) {
            return (
                <div className="col-span-full flex items-center justify-center h-32">
                    <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <span className="block mt-2">Searching...</span>
                    </div>
                </div>
            );
        }
        
        if (searchResults.length > 0) {
            return searchResults.map((result) => (
                <div key={result.id} className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    <button
                        onClick={() => handleResultClick(result)}
                        className="w-full h-full p-4 text-left"
                        title={`${result.name} ${result.type}`}
                    >
                        {/* Simple layout with icon, type and name */}
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-medium ${getResultBgColor(result.type)}`}>
                                {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {result.type}
                                </div>
                                <div className="text-base font-semibold text-gray-900 mt-1">
                                    {result.name}
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            ));
        }
        
        if (searchQuery.trim() && !isSearching) {
            return (
                <div className="col-span-full flex items-center justify-center h-32">
                    <div className="text-center text-gray-500">
                        <div className="text-6xl mb-4">🔍</div>
                        <div className="text-lg font-medium">No results found</div>
                        <div className="text-sm">Try searching for something else: "{searchQuery}"</div>
                    </div>
                </div>
            );
        }
        
        // Show popular suggestions when no search query
        if (!searchQuery.trim() && popularSuggestions.length > 0) {
            return popularSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    <button
                        onClick={() => handleResultClick(suggestion)}
                        className="w-full h-full p-4 text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-medium ${getResultBgColor(suggestion.type)}`}>
                                {getResultIcon(suggestion.type)}
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                    Popular {suggestion.type}
                                </div>
                                <div className="text-base font-semibold text-gray-900 mt-1">
                                    {suggestion.name}
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            ));
        }
        
        // Fallback content when no popular suggestions loaded yet
        return (
            <div className="col-span-full flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                    <div className="animate-pulse">
                        <div className="text-4xl mb-2">⏳</div>
                        <div className="text-sm">Loading popular categories...</div>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderAuthButtons = () => {
        if (!isLoginPage()) {
            return (
                <button 
                    onClick={goToLogin}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-md px-1 py-0.5"
                >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                </button>
            );
        }
        
        return (
            <button 
                onClick={goToRegister}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-md px-1 py-0.5"
            >
                <User className="w-5 h-5" />
                <span>Register</span>
            </button>
        );
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

  return (
    <div className="bg-white h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200">
                {/* Z2U Logo (mock) */}
                <div className="flex-shrink-0">
                    <button 
                        onClick={goHome}
                        className="text-2xl font-extrabold text-gray-800 tracking-tight hover:text-blue-600 transition-colors duration-200 ease-in-out"
                    >
                        Z2U
                    </button>
                </div>

                {/* Search Bar with Dropdown: Hidden on small screens, visible from medium screens up. */}
                <div className="flex-grow max-w-xl mx-4 hidden md:block" ref={searchRef}>
                    <div className="relative">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-5 h-5 text-gray-400 z-10" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                placeholder="Search for games, items, etc."
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 w-5 h-5 text-gray-400 hover:text-gray-600 z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        {/* Search Dropdown - Full width, 1/3 screen height */}
                        {showSearchDropdown && (
                            <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-2xl z-50 resultsDropdown dropdownContainerWrapper show" 
                                 style={{ height: '33vh' }}>
                                <div className="h-full overflow-y-auto">
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
                                            {renderSearchDropdownContent()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons: Login, Register, Cart, Messages. Login/Register hidden on extra small screens. */}
                <div className="flex items-center space-x-6 flex-shrink-0 text-gray-700">
                    {isAuthenticated ? (
                        <button
                            onClick={gotoUserCenter}
                            className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200 ease-in-out rounded-md px-1 py-0.5"
                        >
                            <User className="w-5 h-5" />
                            <span>{user?.displayName || 'User'}</span>
                        </button>
                    ) : renderAuthButtons()}

                </div>
            </div>
  );
};

export default MainBar;
