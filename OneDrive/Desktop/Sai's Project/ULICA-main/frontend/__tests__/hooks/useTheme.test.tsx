import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { useTheme, Providers } from '@/app/providers';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should provide theme context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Providers>{children}</Providers>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toBeDefined();
    expect(typeof result.current.theme).toBe('string');
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('should toggle between light and dark theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Providers>{children}</Providers>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    const initialTheme = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    const toggledTheme = result.current.theme;
    expect(toggledTheme).not.toBe(initialTheme);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe(initialTheme);
  });

  it('should persist theme preference in localStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Providers>{children}</Providers>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    const themeFromStorage = localStorage.getItem('ulica-theme');
    expect(themeFromStorage).toBe(result.current.theme);
  });

  it('should apply dark class to document element in dark mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Providers>{children}</Providers>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      if (result.current.theme === 'light') {
        result.current.toggleTheme();
      }
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

