'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/providers';
import { useCart } from '@/app/providers';

export default function CartPage() {
  const { user } = useAuth();
  const { 
    items: cartItems, 
    itemCount, 
    total: subtotal, 
    updateQuantity, 
    removeFromCart, 
    clearCart
  } = useCart();

  // Calculate shipping and total
  const shipping = subtotal >= 2000 ? 0 : 100;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-black mb-4" >
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8 text-lg" >
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2" >
            Shopping Cart
          </h1>
          <p className="text-gray-600 text-sm sm:text-base" >
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7 mb-6 lg:mb-0">
            <div className="space-y-6">
              {cartItems.map((item) => {
                const primaryImage = item.image || '/placeholder.jpg';
                
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:space-x-6">
                      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden">
                        <Image
                          src={primaryImage}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-black mb-1" >
                          <Link href={`/product/${item.productId}`} className="hover:text-gray-700 transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" >
                          {item.variant?.name || 'Default'}
                        </p>
                        
                        <div className="flex items-center justify-between gap-4 sm:gap-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={false}
                              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-50 transition-all duration-200 flex items-center justify-center touch-target"
                            >
                              -
                            </button>
                            <span className="text-black font-medium min-w-[2rem] text-center text-base sm:text-sm" >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={false}
                              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-50 transition-all duration-200 flex items-center justify-center touch-target"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="text-right flex-1 px-4 sm:px-6">
                            <div className="text-lg font-bold text-black" >
                              ₹{item.price * item.quantity}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500" >
                                ₹{item.price} each
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            disabled={false}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-1 flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-sm" >Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 flex justify-between items-center">
              <Link
                href="/"
                className="text-black hover:text-gray-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span>Continue Shopping</span>
              </Link>
              
              <button
                onClick={clearCart}
                disabled={false}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Cart</span>
              </button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6" >
                Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600" >
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span>₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between text-gray-600" >
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-black text-lg font-bold" >
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                
                {subtotal < 2000 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-700" >
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Add ₹{2000 - subtotal} more for free shipping
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-black text-white py-3 sm:py-4 px-6 rounded-lg font-medium text-center block hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 touch-target"
                >
                  <span>Proceed to Checkout</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                {!user && (
                  <Link
                    href="/login"
                    className="w-full border border-gray-300 text-black py-3 sm:py-4 px-6 rounded-lg font-medium text-center block hover:bg-gray-50 transition-all duration-200 touch-target"
                  >
                    Sign in to Checkout
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}