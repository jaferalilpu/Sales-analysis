'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasRedirectedRef = React.useRef(false);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const verify = async (isRetry = false): Promise<void> => {
      // Skip if already redirected
      if (hasRedirectedRef.current) return;

      // Add small delay for retries to allow cookies to be set
      if (isRetry && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      try {
        const res = await fetch('/api/auth/me', { 
          cache: 'no-store',
          credentials: 'include' // Include cookies in the request
        });
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          // Retry if 401 and we haven't exceeded max retries (cookies might not be set yet)
          if (res.status === 401 && retryCount < maxRetries && !isRetry) {
            retryCount++;
            return verify(true); // Retry
          }
          
          // Don't log 401s as errors - they're expected when not logged in
          if (res.status !== 401) {
            
          }
          throw new Error('unauth');
        }
        
        const role = data?.data?.user?.role;
        if (role !== 'admin') {
          
          throw new Error('forbidden');
        }
        
        if (isMounted && !hasRedirectedRef.current) {
          setIsAuthorized(true);
          setIsChecking(false);
        }
      } catch (error) {
        // Retry if unauth error and we haven't exceeded max retries
        if (error instanceof Error && error.message === 'unauth' && retryCount < maxRetries && !isRetry) {
          retryCount++;
          return verify(true); // Retry
        }
        
        // Only log unexpected errors (401s are expected when not logged in)
        if (error instanceof Error && error.message !== 'unauth') {
          
        }
        if (isMounted && !hasRedirectedRef.current) {
          setIsAuthorized(false);
          setIsChecking(false);
          hasRedirectedRef.current = true;
          // redirect to login preserving return url - use window.location for reliable redirect
          const redirectTo = `/login?next=${encodeURIComponent(pathname || '/admin')}`;
          // Use window.location.href for immediate and reliable redirect
          window.location.href = redirectTo;
        }
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to login…</p>
          <p className="text-sm text-gray-500">
            If you're not redirected, <a href="/login" className="text-black underline">click here</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 overflow-hidden">
        <main className="flex h-full flex-col overflow-auto p-6">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          <div className="mt-6 w-full max-w-7xl flex-1 space-y-6 self-center">{children}</div>
        </main>
      </div>
    </div>
  );
}
