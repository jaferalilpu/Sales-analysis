'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon as CloseIcon
} from '@/components/ui/icons';
import { useAuth, useWishlist } from '@/app/providers';
import { CartWidget } from '@/components/cart/CartWidget';
import { UserMenu } from '@/components/auth/UserMenu';
import { useMobile } from '@/hooks/useMobile';
import type { Product } from '@/types/product';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const itemCount = wishlistItems.length;
  const router = useRouter();
  const isMobile = useMobile();

  // Search functionality - use API instead of dummy data
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        setShowResults(false);
        try {
          const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            // Handle both response formats: {success: true, data: {products: []}} or {products: []}
            const products = data.success 
              ? (data.data?.products || [])
              : (data.products || []);
            setSearchResults(products);
            setShowResults(products.length > 0 || searchQuery.trim().length > 0);
          }
        } catch (error) {
          
          setSearchResults([]);
          setShowResults(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowResults(false);
    }
  };

  const handleResultClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setSearchQuery('');
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close search bar when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Prevent body scroll when mobile search is open to prevent page shaking
  useEffect(() => {
    if (isMobile && isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isSearchOpen]);

  // Search content component (reusable for both mobile popup and desktop inline)
  const SearchContent = () => (
    <div className="relative search-container" style={{ minHeight: '48px' }}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isMobile ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Search products..."
            className={`w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-base ${
              isMobile 
                ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400' 
                : 'bg-gray-800 border border-gray-700 text-white placeholder-gray-400'
            }`}
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            autoFocus
          />
          {/* X button - Always visible on desktop, hidden on mobile (mobile has separate close button) */}
          {!isMobile && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSearchQuery('');
                setShowResults(false);
                setIsSearchOpen(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200 z-10"
              aria-label="Close search"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results - Fixed positioning to prevent layout shifts */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ willChange: 'transform' }}>
          {searchResults.map((product: any) => {
            // Handle images - can be array of strings or array of objects
            let primaryImage = '/placeholder-product.jpg';
            if (product.images && product.images.length > 0) {
              const firstImage = product.images[0];
              primaryImage = typeof firstImage === 'string' ? firstImage : (firstImage.url || '/placeholder-product.jpg');
            }
            
            // Get price from variant or product
            const price = product.variants && product.variants.length > 0 
              ? product.variants[0].price 
              : (product.price || 0);
            
            // Get product ID - use slug if available, otherwise ID
            const productId = product.slug || product.id;
            
            return (
              <button
                key={product.id}
                onClick={() => handleResultClick(productId)}
                className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 touch-target"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={primaryImage}
                    alt={product.title || product.name || 'Product'}
                    width={64}
                    height={64}
                    className="object-cover"
                    unoptimized={primaryImage.startsWith('blob:') || primaryImage.startsWith('data:')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {product.title || product.name || 'Product'}
                  </h4>
                  {product.description && (
                    <p className="text-xs text-gray-500 truncate mt-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {product.description}
                    </p>
                  )}
                  <p className="text-sm font-bold text-black mt-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    ₹{typeof price === 'number' ? price.toLocaleString() : price}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No results message - Fixed positioning to prevent layout shifts */}
      {searchQuery && !isSearching && searchResults.length === 0 && showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500" style={{ willChange: 'transform' }}>
          No products found
        </div>
      )}

      {/* Loading state - Fixed positioning to prevent layout shifts */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500" style={{ willChange: 'transform' }}>
          Searching...
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="bg-black shadow-sm border-b border-gray-800 sticky top-0 z-50 safe-area-top">
        <div className="container-custom">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Logo - Smaller on mobile */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/ulica-logo.png?v=5" 
                  alt="ULICA - Urban Lifestyle & Independent Clothing Apparel"
                  width={160}
                  height={160}
                  className="h-32 md:h-40 w-auto object-contain saturate-150 brightness-110 contrast-125"
                  priority
                />
              </Link>
            </div>

            {/* Desktop: Inline search bar - Shows when search is open */}
            {!isMobile && isSearchOpen ? (
              <div className="flex-1 max-w-md mx-8 relative">
                <SearchContent />
              </div>
            ) : (
              /* Right side actions - Shows when search is closed or on mobile */
              <div className="flex items-center space-x-4">
                {/* Search Icon */}
                <button
                  onClick={() => {
                    if (!isSearchOpen) {
                      // Clear search query when opening search bar
                      setSearchQuery('');
                      setShowResults(false);
                    }
                    setIsSearchOpen(!isSearchOpen);
                  }}
                  className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className="flex p-2 text-gray-300 hover:text-white transition-colors duration-200 relative"
                  aria-label="Wishlist"
                >
                  <HeartIcon className="h-5 w-5" />
                  {/* Wishlist count badge */}
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <CartWidget />

                {/* User Menu - Hidden on mobile (shown in bottom nav) */}
                {user ? (
                  <div className="hidden md:block">
                    <UserMenu user={user} />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden md:flex p-2 text-gray-300 hover:text-white transition-colors duration-200"
                    aria-label="Sign In"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Link>
                )}

              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile: Search Popup Overlay */}
      {isMobile && isSearchOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
              setShowResults(false);
            }}
          />
          
          {/* Search Popup */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-black shadow-lg">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <SearchContent />
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setShowResults(false);
                  }}
                  className="p-2 text-gray-300 hover:text-white transition-colors touch-target"
                  aria-label="Close search"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}