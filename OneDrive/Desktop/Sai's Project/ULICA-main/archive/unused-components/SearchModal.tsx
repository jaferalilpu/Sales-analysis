'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@/components/ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.data.products || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative bg-white shadow-xl max-w-2xl mx-auto mt-20 rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search products..."
              className="flex-1 text-lg outline-none"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-6 py-8 text-center">
                <div className="spinner w-6 h-6 mx-auto mb-2" />
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((product: any) => (
                  <a
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mr-4 flex-shrink-0">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{Math.round(product.minPrice / 100)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : query ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No products found for "{query}"</p>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">Start typing to search products</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
