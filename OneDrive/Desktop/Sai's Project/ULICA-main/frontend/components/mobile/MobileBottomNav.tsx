'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserIcon
} from '@/components/ui/icons';
import { useMobile } from '@/hooks/useMobile';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

/**
 * Mobile bottom navigation bar
 * - Fixed at bottom
 * - Safe area support
 * - Active state indicators
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const isMobile = useMobile();

  // Only show on mobile and not on admin pages
  // Hide on desktop (md and above) - footer shows instead
  if (!isMobile || pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems: NavItem[] = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/dashboard', icon: UserIcon, label: 'Account' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                flex-1 h-full
                transition-colors duration-200
                ${isActive ? 'text-blue-600' : 'text-gray-500'}
                touch-target
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

