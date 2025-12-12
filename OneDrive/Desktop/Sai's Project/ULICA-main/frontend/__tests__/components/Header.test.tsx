import { render, screen } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { Header } from '@/components/layout/Header';

// Mock the providers module
jest.mock('@/app/providers', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    isLoading: false,
    isAdmin: false,
  }),
  useWishlist: () => ({
    items: [],
    isLoading: false,
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn(() => false),
    toggleWishlist: jest.fn(),
  }),
  useCart: () => ({
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: false,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    isInCart: jest.fn(() => false),
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));

describe.skip('Header Component', () => {
  it('renders the logo', () => {
    render(<Header />)
    expect(screen.getByText('ULICA')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Drops')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders search and cart icons', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument()
  })
})
