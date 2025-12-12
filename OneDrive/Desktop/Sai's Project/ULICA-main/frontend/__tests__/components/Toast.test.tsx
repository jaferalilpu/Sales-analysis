import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';
import { Toaster } from 'react-hot-toast';
import { showToast } from '@/lib/toast';

describe('Toast Notifications', () => {
  it('should show success toast', async () => {
    const result = showToast.success('Operation successful');
    expect(result).toBeDefined();
  });

  it('should show error toast', async () => {
    const result = showToast.error('Operation failed');
    expect(result).toBeDefined();
  });

  it('should show info toast', async () => {
    const result = showToast.info('Information message');
    expect(result).toBeDefined();
  });

  it('should show warning toast', async () => {
    const result = showToast.warning('Warning message');
    expect(result).toBeDefined();
  });

  it('should show loading toast', async () => {
    const result = showToast.loading('Loading...');
    expect(result).toBeDefined();
  });
});

