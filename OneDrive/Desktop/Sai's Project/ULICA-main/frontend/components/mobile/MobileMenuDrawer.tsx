'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileDrawer } from './MobileDrawer';
import { 
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon
} from '@/components/ui/icons';
import { useAuth, useWishlist } from '@/app/providers';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Enhanced mobile menu drawer
 * - Full navigation
 * - User account links
 * - Quick actions
 */
export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();

  const mainNavItems = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/products', label: 'Products', icon: ShoppingBagIcon },
    { href: '/drops', label: 'Drops', icon: Bars3Icon },
    { href: '/wishlist', label: 'Wishlist', icon: HeartIcon, badge: wishlistItems.length },
  ];

  const accountNavItems = user
    ? [
        { href: '/dashboard', label: 'My Account', icon: UserIcon },
        { href: '/dashboard?tab=orders', label: 'Orders', icon: ShoppingBagIcon },
        { href: '/dashboard?tab=wishlist', label: 'Wishlist', icon: HeartIcon },
      ]
    : [
        { href: '/login', label: 'Sign In', icon: UserIcon },
        { href: '/register', label: 'Sign Up', icon: UserIcon },
      ];

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      size="md"
      title="Menu"
    >
      <nav className="flex flex-col">
        {/* Main Navigation */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Navigation
          </h3>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    touch-target
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-2" />

        {/* Account Navigation */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Account
          </h3>
          <div className="space-y-1">
            {accountNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    touch-target
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </MobileDrawer>
  );
}

