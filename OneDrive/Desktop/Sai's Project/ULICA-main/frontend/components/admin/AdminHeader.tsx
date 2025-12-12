'use client';

import { useState } from 'react';
// import { useAuth } from '@/app/providers';
import { BellIcon, MagnifyingGlassIcon, XMarkIcon, Bars3Icon } from '@/components/ui/icons';
import { showToast } from '@/lib/toast';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  // Mock user data for now
  const user = { name: 'Admin User', email: 'admin@ulica.com' };
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Implement search functionality
      
      // You can add actual search logic here
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Mobile menu button and Page Title */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button - only show on small screens */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-black" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Admin Dashboard
            </h2>
          </div>

          {/* Right side - Search and Notifications */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {showSearch ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={clearSearch}
                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Notifications */}
            <button
              onClick={() => {
                showToast.info(
                  '🔔 Notifications:\n• 3 new orders received\n• 2 products low in stock\n• 1 customer review pending\n• System update available',
                  { duration: 5000 }
                );
              }}
              className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-black rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </span>
            </button>

            {/* User info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <span className="text-sm text-gray-600 hidden sm:block" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {user?.name || user?.email || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
