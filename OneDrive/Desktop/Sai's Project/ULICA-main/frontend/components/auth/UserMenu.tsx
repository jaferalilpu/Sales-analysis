'use client';

import Link from 'next/link';
import { UserIcon } from '@/components/ui/icons';

interface UserMenuProps {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const getInitial = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <Link
      href={user.role === 'admin' ? '/admin' : '/dashboard'}
      className="p-2 text-gray-300 transition-colors duration-200"
      aria-label="Profile"
    >
      <div className="h-8 w-8 bg-black border border-gray-300 rounded-full flex items-center justify-center">
        <span className="text-white font-medium text-sm">
          {getInitial()}
        </span>
      </div>
    </Link>
  );
}
