'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/providers';
import { ulicaToasts } from '@/lib/toast';

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: {
      name: string;
      options: any;
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeFromCart(item.id);
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPrice = item.price * item.quantity;

  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 relative">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded-lg"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link 
          href={`/products/${item.productId}`}
          className="block hover:text-black transition-colors duration-200"
        >
          <h3 className="font-medium text-gray-900 truncate">
            {item.name}
          </h3>
        </Link>
        
        {item.variant && (
          <p className="text-sm text-gray-500 truncate">
            {item.variant.name}
          </p>
        )}
        
        <p className="text-sm font-medium text-gray-900">
          ₹{item.price.toLocaleString()} each
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Decrease quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        <span className="w-8 text-center font-medium">
          {isUpdating ? (
            <svg className="w-4 h-4 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            item.quantity
          )}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Increase quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Total Price */}
      <div className="text-right">
        <p className="font-medium text-gray-900">
          ₹{totalPrice.toLocaleString()}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Remove item from cart"
      >
        {isUpdating ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  );
}
