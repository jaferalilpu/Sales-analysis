import { renderHook, act } from '@testing-library/react';
import { useGlobalLoading, Providers } from '@/app/providers';

describe('useGlobalLoading Hook', () => {
  it('should provide loading context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Providers>{children}</Providers>
    );

    const { result } = renderHook(() => useGlobalLoading(), { wrapper });

    expect(result.current).toBeDefined();
    expect(typeof result.current.showLoading).toBe('function');
    expect(typeof result.current.hideLoading).toBe('function');
  });

  it('should show and hide loading', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Providers>{children}</Providers>
    );

    const { result } = renderHook(() => useGlobalLoading(), { wrapper });

    act(() => {
      result.current.showLoading();
    });

    // Loading should be visible
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.hideLoading();
    });

    // Loading should be hidden
    expect(result.current.isLoading).toBe(false);
  });
});

