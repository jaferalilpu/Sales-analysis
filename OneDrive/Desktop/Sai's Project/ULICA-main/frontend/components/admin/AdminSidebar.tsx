'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CubeIcon,
  Bars3Icon,
  XMarkIcon,
  TruckIcon,
} from '@/components/ui/icons';
import { useAuth } from '@/app/providers';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, count: null },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon, count: null },
  { name: 'Inventory', href: '/admin/inventory', icon: CubeIcon, count: null },
  { name: 'Drops', href: '/admin/drops', icon: ClockIcon, count: null },
  { name: 'Orders', href: '/admin/orders', icon: ChartBarIcon, count: null },
  { name: 'Shipping', href: '/admin/shipping', icon: TruckIcon, count: null },
  { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon, count: null },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon, count: null },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    // Use centralized logout function
    await logout();
    // Redirect to login page
    router.push('/login');
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-lg font-bold text-black" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              ULICA Admin
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          {isCollapsed ? (
            <Bars3Icon className="h-5 w-5" />
          ) : (
            <XMarkIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center ${
                  isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-2'
                } rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-black'}`} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {item.name}
                    </span>
                    {item.count && (
                      <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive 
                          ? 'bg-white text-black' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleSignOut}
          className={`group flex items-center w-full ${
            isCollapsed ? 'justify-center px-3 py-3' : 'px-3 py-2'
          } rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition-all duration-200`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500 group-hover:text-black" />
          {!isCollapsed && (
            <span className="ml-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
