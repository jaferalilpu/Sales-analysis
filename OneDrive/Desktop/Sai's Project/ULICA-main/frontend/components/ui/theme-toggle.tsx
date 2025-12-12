'use client';

import { useTheme } from '@/app/providers';
import { MoonIcon, SunIcon } from '@/components/ui/icons';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 ${className}`}
    >
      {isDark ? (
        <>
          <SunIcon className="h-4 w-4 text-amber-400" strokeWidth={1.6} />
          Light
        </>
      ) : (
        <>
          <MoonIcon className="h-4 w-4 text-indigo-500" strokeWidth={1.6} />
          Dark
        </>
      )}
    </button>
  );
}

