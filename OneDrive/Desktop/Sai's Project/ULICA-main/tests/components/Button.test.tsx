import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Sample Button component for testing
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'data-testid'?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  'data-testid': testId,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      data-testid={testId}
      {...props}
    >
      {children}
    </button>
  );
};

describe('Button Component', () => {
  it('renders button with children text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary Button</Button>);
    
    const button = screen.getByRole('button', { name: /primary button/i });
    expect(button).toHaveClass('bg-black', 'text-white', 'hover:bg-gray-800');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    const button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900', 'hover:bg-gray-300');
  });

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Delete</Button>);
    
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700');
  });

  it('applies small size styles', () => {
    render(<Button size="sm">Small Button</Button>);
    
    const button = screen.getByRole('button', { name: /small button/i });
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('applies medium size styles by default', () => {
    render(<Button>Medium Button</Button>);
    
    const button = screen.getByRole('button', { name: /medium button/i });
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
  });

  it('applies large size styles', () => {
    render(<Button size="lg">Large Button</Button>);
    
    const button = screen.getByRole('button', { name: /large button/i });
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    
    const button = screen.getByRole('button', { name: /clickable/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled styles when disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('sets correct type attribute', () => {
    render(<Button type="submit">Submit Button</Button>);
    
    const button = screen.getByRole('button', { name: /submit button/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button', { name: /custom button/i });
    expect(button).toHaveClass('custom-class');
  });

  it('applies data-testid attribute', () => {
    render(<Button data-testid="test-button">Test Button</Button>);
    
    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
  });

  it('forwards additional props', () => {
    render(<Button aria-label="Custom label">Button</Button>);
    
    const button = screen.getByRole('button', { name: /custom label/i });
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('has proper focus styles', () => {
    render(<Button>Focusable Button</Button>);
    
    const button = screen.getByRole('button', { name: /focusable button/i });
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
  });

  it('has transition styles for smooth interactions', () => {
    render(<Button>Transition Button</Button>);
    
    const button = screen.getByRole('button', { name: /transition button/i });
    expect(button).toHaveClass('transition-colors', 'duration-200');
  });

  it('renders with multiple children', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Icon');
    expect(button).toHaveTextContent('Text');
  });

  it('maintains accessibility with proper button role', () => {
    render(<Button>Accessible Button</Button>);
    
    const button = screen.getByRole('button', { name: /accessible button/i });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });
});
