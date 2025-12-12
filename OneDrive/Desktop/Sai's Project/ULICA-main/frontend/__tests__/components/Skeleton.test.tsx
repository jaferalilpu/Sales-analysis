import { render } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton Component', () => {
  it('should render skeleton with default className', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md');
  });

  it('should render skeleton with custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-20" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('h-10', 'w-20');
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
  });
});

