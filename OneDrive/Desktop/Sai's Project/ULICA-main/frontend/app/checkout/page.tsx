'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useCart } from '@/app/providers';
import { fetchAddressByPincode, type AddressData as PincodeAddressData } from '@/utils/fetchAddressByPincode';
import { PhonePePayment } from '@/components/payments/PhonePePayment';
import { UPIPayment } from '@/components/payments/UPIPayment';
import { ulicaToasts, showToast } from '@/lib/toast';
import { SavedAddress } from '@/types/address';
import { getErrorMessage } from '@/types/common';
import { ApiResponse } from '@/types/api';
import { CODOrderResponse, RazorpayResponse, PaymentVerificationResponse, PaymentSession, PaymentConfig } from '@/types/payment';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
}

export default function CheckoutPage() {
  const { items: cartItems, total: cartTotal } = useCart();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [codConfirmationFee, setCodConfirmationFee] = useState(149); // ₹149 confirmation fee for COD
  const [codConfirmationPaymentMethod, setCodConfirmationPaymentMethod] = useState('razorpay'); // Payment method for COD confirmation fee
  const [isPayingConfirmationFee, setIsPayingConfirmationFee] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadSavedAddresses();
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

  const loadSavedAddresses = () => {
    try {
      const addresses = JSON.parse(localStorage.getItem('ulica_addresses') || '[]');
      setSavedAddresses(addresses);
    } catch (error) {
      
    }
  };

  const handleSelectSavedAddress = (address: SavedAddress) => {
    setShippingAddress({
      firstName: address.fullName.split(' ')[0] || '',
      lastName: address.fullName.split(' ').slice(1).join(' ') || '',
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      phone: address.phone
    });
    setSelectedAddressId(address.id);
    setShowAddressOptions(false);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setShowAddressOptions(false);
    // Reset form to user's basic info
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }));
    }
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhonePeOrUPIPayment = async (orderId: string, amount: number) => {
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          paymentMethod: paymentMethod,
          customerDetails: {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            email: user?.email,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            country: shippingAddress.country
          }
        }),
      });

      const data = await response.json();

      if (data.success && data.data.redirectUrl) {
        // Redirect to payment page
        window.location.href = data.data.redirectUrl;
      } else {
        setError(data.error || 'Payment creation failed');
      }
    } catch (error) {
      
      setError('Failed to create payment');
    }
  };

  const handlePincodeChange = async (pincode: string) => {
    // Update pincode immediately
    setShippingAddress(prev => ({
      ...prev,
      pincode: pincode
    }));

    // Clear previous error
    setPincodeError('');

    // Only fetch if pincode is 6 digits
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsPincodeLoading(true);
      
      try {
        const addressData = await fetchAddressByPincode(pincode);
        
        // Auto-fill city, state, and country
        setShippingAddress(prev => ({
          ...prev,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country
        }));
      } catch (error) {
        setPincodeError(error instanceof Error ? error.message : 'Invalid pincode or not found');
      } finally {
        setIsPincodeLoading(false);
      }
    }
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'address', 'city', 'state', 'pincode', 'country', 'phone'];
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        const errorMsg = `Please fill in ${fieldName}`;
        setError(errorMsg);
        showToast.error('Please fill all required fields');
        return false;
      }
    }
    
    if (shippingAddress.pincode.length !== 6) {
      const errorMsg = 'Please enter a valid 6-digit pincode';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }
    
    if (shippingAddress.phone.length < 10) {
      const errorMsg = 'Please enter a valid phone number';
      setError(errorMsg);
      showToast.error(errorMsg);
      return false;
    }
    
    return true;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const response = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCouponDiscount(data.data.discountAmount || 0);
        setError('');
        showToast.success('Coupon applied successfully');
      } else {
        const errorMsg = data.message || 'Invalid coupon code';
        setError(errorMsg);
        setCouponDiscount(0);
        showToast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Error applying coupon';
      setError(errorMsg);
      setCouponDiscount(0);
      showToast.error(errorMsg);
    }
  };

  const handleCodConfirmationFee = async () => {
    if (!validateForm()) return;
    
    setIsPayingConfirmationFee(true);
    setError('');

    try {
      // Create a temporary order for confirmation fee payment
      const response = await fetch('/api/checkout/create-cod-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            variantId: item.variantId || item.id,
            productId: item.productId,
            quantity: item.quantity || 1,
            price: item.price || 0
          })),
          shippingAddress,
          billingAddress: shippingAddress,
          paymentMethod: 'cod',
          confirmationFeePaymentMethod: codConfirmationPaymentMethod, // Payment method for confirmation fee
          couponCode: couponCode || undefined,
          email: user?.email || '',
          phone: shippingAddress.phone,
          confirmationFee: codConfirmationFee
        }),
      });

      let data: CODOrderResponse;
      try {
        data = await response.json() as CODOrderResponse;
      } catch (parseError) {
        const text = await response.text();
        const errorMsg = getErrorMessage(parseError);
        setError(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`);
        setIsPayingConfirmationFee(false);
        return;
      }

      if (response.ok && data.success) {
        // Redirect to payment for confirmation fee
        if (data.data?.paymentSession) {
          // For Razorpay, check if redirectUrl exists
          if (data.data.paymentSession.redirectUrl) {
            window.location.href = data.data.paymentSession.redirectUrl;
            return;
          }
          
          // If no redirectUrl, try to use paymentConfig for Razorpay checkout
          if (data.data.paymentMethod === 'razorpay' && data.data.paymentConfig) {
            const paymentConfig = data.data.paymentConfig;
            // Store order ID for verification after payment
            localStorage.setItem('pendingCodOrderId', data.data.tempOrderId || data.data.order?.id || '');
            localStorage.setItem('pendingCodConfirmationFee', codConfirmationFee.toString());
            
            // Load Razorpay script and open checkout
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
              const razorpayKey = paymentConfig.key || paymentConfig.razorpayKeyId;
              if (!razorpayKey) {
                setError('Payment gateway configuration is missing');
                setIsPayingConfirmationFee(false);
                return;
              }
              const options = {
                key: razorpayKey,
                amount: (paymentConfig.amount || codConfirmationFee) * 100, // Convert to paise
                currency: 'INR',
                name: 'ULICA',
                description: `COD Confirmation Fee - Order ${data.data?.tempOrderId || data.data?.order?.id || ''}`,
                order_id: paymentConfig.orderId || data.data?.paymentSession?.id || '',
                handler: async function(response: RazorpayResponse) {
                  // Verify payment
                  try {
                    const verifyResponse = await fetch('/api/checkout/verify-payment', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(user && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
                      },
                      body: JSON.stringify({
                        orderId: data.data?.tempOrderId || data.data?.order?.id || '',
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        paymentMethod: 'cod'
                      })
                    });
                    
                    const verifyData: PaymentVerificationResponse = await verifyResponse.json() as PaymentVerificationResponse;
                    if (verifyResponse.ok && verifyData.success) {
                      localStorage.removeItem('ulica_cart');
                      localStorage.removeItem('pendingCodOrderId');
                      localStorage.removeItem('pendingCodConfirmationFee');
                      router.push(`/checkout/success?orderId=${data.data?.tempOrderId || data.data?.order?.id || ''}`);
                    } else {
                      setError(verifyData.message || 'Payment verification failed');
                      setIsPayingConfirmationFee(false);
                    }
                  } catch (verifyError) {
                    
                    setError('Payment verification failed. Please contact support.');
                    setIsPayingConfirmationFee(false);
                  }
                },
                prefill: {
                  name: user?.name || shippingAddress.firstName + ' ' + shippingAddress.lastName,
                  email: user?.email || '',
                  contact: shippingAddress.phone
                },
                theme: {
                  color: '#000000'
                },
                modal: {
                  ondismiss: function() {
                    setIsPayingConfirmationFee(false);
                  }
                }
              };
              
              const razorpay = new window.Razorpay(options);
              razorpay.open();
            };
            script.onerror = () => {
              setError('Failed to load payment gateway. Please try again.');
              setIsPayingConfirmationFee(false);
            };
            document.body.appendChild(script);
            return;
          } else if (data.data.paymentMethod === 'phonepe' || data.data.paymentMethod === 'upi') {
            // Handle PhonePe/UPI payment for confirmation fee
            const orderId = data.data.tempOrderId || data.data.order?.id || '';
            const amount = codConfirmationFee;
            
            // Store order ID for verification
            localStorage.setItem('pendingCodOrderId', orderId);
            localStorage.setItem('pendingCodConfirmationFee', amount.toString());
            
            // Use the selected payment method for PhonePe/UPI
            const paymentMethodForFee = codConfirmationPaymentMethod;
            
            // Update handlePhonePeOrUPIPayment to use the correct payment method
            try {
              const paymentResponse = await fetch('/api/payments/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(user && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
                },
                body: JSON.stringify({
                  amount,
                  orderId,
                  paymentMethod: paymentMethodForFee,
                  customerDetails: {
                    name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                    email: user?.email || '',
                    phone: shippingAddress.phone,
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    pincode: shippingAddress.pincode,
                    country: shippingAddress.country
                  }
                }),
              });

              const paymentData = await paymentResponse.json();

              if (paymentData.success && paymentData.data?.redirectUrl) {
                window.location.href = paymentData.data.redirectUrl;
              } else {
                setError(paymentData.message || paymentData.error || 'Payment creation failed');
                setIsPayingConfirmationFee(false);
              }
            } catch (paymentError) {
              
              setError('Failed to create payment. Please try again.');
              setIsPayingConfirmationFee(false);
            }
            return;
          }
        }
        
        // If no payment session, show error
        setError('Payment gateway not configured. Please try another payment method.');
        setIsPayingConfirmationFee(false);
      } else {
        setError(data.message || data.error || 'Failed to create COD order');
        setIsPayingConfirmationFee(false);
      }
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      setError(errorMsg || 'Network error. Please check your connection and try again.');
      setIsPayingConfirmationFee(false);
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    // If COD, handle confirmation fee payment first
    if (paymentMethod === 'cod') {
      await handleCodConfirmationFee();
      return;
    }
    
    setIsLoading(true);
    setError('');
    const loadingToastId = ulicaToasts.processingOrder();

    try {
      const items = cartItems.map(item => ({
        variantId: item.variantId || item.id,
        productId: item.productId,
        quantity: item.quantity || 1,
        price: item.price || 0
      }));

      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          billingAddress: shippingAddress, // Same as shipping for now
          paymentMethod,
          couponCode: couponCode || undefined,
          email: user?.email || '',
          phone: shippingAddress.phone
        }),
      });

      let data: ApiResponse<{
        order: {
          id: string;
          orderNumber?: string;
          totalAmount: number;
        };
        paymentSession?: PaymentSession;
        paymentConfig?: PaymentConfig;
      }>;
      try {
        data = await response.json() as ApiResponse<{
          order: {
            id: string;
            orderNumber?: string;
            totalAmount: number;
          };
          paymentSession?: PaymentSession;
          paymentConfig?: PaymentConfig;
        }>;
      } catch (parseError) {
        const text = await response.text();
        const errorMsg = getErrorMessage(parseError);
        setError(`Server error: ${response.status} ${response.statusText}. ${text.substring(0, 100)}`);
        setIsLoading(false);
        return;
      }

      if (response.ok && data.success && data.data) {
        // Dismiss loading toast
        if (loadingToastId) showToast.dismiss(String(loadingToastId));
        
        // Clear cart
        localStorage.removeItem('ulica_cart');
        
        // Show success toast for order placement
        ulicaToasts.orderPlaced(data.data?.order?.orderNumber || data.data?.order?.id || '');
        
        // Redirect to payment or success page
        if (paymentMethod === 'razorpay' && data.data?.paymentSession) {
          // Check if redirectUrl exists
          if (data.data.paymentSession.redirectUrl) {
            window.location.href = data.data.paymentSession.redirectUrl;
            return;
          }
          
          // If no redirectUrl, use paymentConfig to open Razorpay checkout
          if (data.data.paymentConfig) {
            const paymentConfig = data.data.paymentConfig;
            
            // Load Razorpay script and open checkout
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
              const razorpayKey = paymentConfig.key || paymentConfig.razorpayKeyId;
              if (!razorpayKey) {
                setError('Payment gateway configuration is missing');
                setIsLoading(false);
                return;
              }
              const options = {
                key: razorpayKey,
                amount: (paymentConfig.amount || 0) * 100, // Convert to paise
                currency: 'INR',
                name: 'ULICA',
                description: `Order ${data.data?.order?.id || ''}`,
                order_id: paymentConfig.orderId || '',
                handler: async function(response: RazorpayResponse) {
                  // Verify payment
                  try {
                    const verifyResponse = await fetch('/api/checkout/verify-payment', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(user && { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` })
                      },
                      body: JSON.stringify({
                        orderId: data.data?.order?.id || '',
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                        paymentMethod: 'razorpay'
                      })
                    });
                    
                    const verifyData: PaymentVerificationResponse = await verifyResponse.json() as PaymentVerificationResponse;
                    if (verifyResponse.ok && verifyData.success) {
                      ulicaToasts.paymentSuccess(data.data?.order?.totalAmount || 0);
                      router.push(`/checkout/success?orderId=${data.data?.order?.id || ''}`);
                    } else {
                      const errorMsg = verifyData.message || 'Payment verification failed';
                      setError(errorMsg);
                      ulicaToasts.paymentFailed(errorMsg);
                      setIsLoading(false);
                    }
                  } catch (verifyError) {
                    
                    const errorMsg = 'Payment verification failed. Please contact support.';
                    setError(errorMsg);
                    ulicaToasts.paymentFailed(errorMsg);
                    setIsLoading(false);
                  }
                },
                prefill: {
                  name: user?.name || shippingAddress.firstName + ' ' + shippingAddress.lastName,
                  email: user?.email || '',
                  contact: shippingAddress.phone
                },
                theme: {
                  color: '#000000'
                },
                modal: {
                  ondismiss: function() {
                    setIsLoading(false);
                  }
                }
              };
              
              const razorpay = new window.Razorpay(options);
              razorpay.open();
            };
            script.onerror = () => {
              setError('Failed to load payment gateway. Please try again.');
              setIsLoading(false);
            };
            document.body.appendChild(script);
            return;
          }
        } else if (paymentMethod === 'phonepe' || paymentMethod === 'upi') {
          // Handle PhonePe/UPI payment
          if (data.data?.order?.id && data.data?.order?.totalAmount) {
            handlePhonePeOrUPIPayment(data.data.order.id, data.data.order.totalAmount);
          }
          return;
        } else {
          router.push(`/checkout/success?orderId=${data.data?.order?.id || ''}`);
          return;
        }
      } else {
        const errorMsg = data.message || data.error || 'Checkout failed';
        setError(errorMsg);
        ulicaToasts.orderFailed(errorMsg);
        setIsLoading(false);
      }
    } catch (error: unknown) {
      // Dismiss loading toast
      if (loadingToastId) showToast.dismiss(String(loadingToastId));
      const errorMsg = getErrorMessage(error) || 'Network error. Please check your connection and try again.';
      setError(errorMsg);
      ulicaToasts.orderFailed(errorMsg);
      setIsLoading(false);
    }
  };

  const subtotal = cartTotal || cartItems.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
  const shipping = subtotal > 2000 ? 0 : 100;
  const discount = couponDiscount;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2" >
            Checkout
          </h1>
          <p className="text-gray-600" >
            Complete your order securely
          </p>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <div className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-black" >
                      Shipping Information
                    </h2>
                  </div>
                  
                  <button
                    onClick={() => setShowAddressOptions(!showAddressOptions)}
                    className="px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    {showAddressOptions ? 'Hide Saved Addresses' : 'Use Saved Address'}
                  </button>
                </div>

                {/* Saved Address Options */}
                {showAddressOptions && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3" >
                      Choose from saved addresses:
                    </h3>
                    
                    {savedAddresses.length > 0 ? (
                      <div className="space-y-3">
                        {savedAddresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                              selectedAddressId === address.id
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            onClick={() => handleSelectSavedAddress(address)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium" >
                                    {address.fullName}
                                  </span>
                                  {address.isDefault && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded" >
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm opacity-90" >
                                  {address.address}
                                </p>
                                <p className="text-sm opacity-90" >
                                  {address.city}, {address.state} {address.pincode}
                                </p>
                                <p className="text-sm opacity-90" >
                                  Phone: {address.phone}
                                </p>
                              </div>
                              <div className="ml-3">
                                {selectedAddressId === address.id && (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={handleUseNewAddress}
                          className="w-full p-3 rounded-lg border border-gray-300 bg-white hover:border-black hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                        >
                          + Use New Address
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2" >
                          No saved addresses yet
                        </h4>
                        <p className="text-gray-600 mb-4" >
                          Save addresses in your dashboard for faster checkout next time.
                        </p>
                        <button
                          onClick={handleUseNewAddress}
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                        >
                          Fill Address Manually
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleAddressChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleAddressChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      Address *
                    </label>
                    <textarea
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      Pincode *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                        maxLength={6}
                        placeholder="Enter 6-digit pincode"
                        required
                      />
                      {isPincodeLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    {pincodeError && (
                      <p className="text-red-500 text-sm mt-1" >
                        {pincodeError}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" >
                      Country *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-black" >
                    Payment Method
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black transition-colors duration-200 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-black" >
                            Credit/Debit Card, UPI, Net Banking
                          </p>
                          <p className="text-sm text-gray-600" >
                            Powered by Razorpay
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black transition-colors duration-200 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="phonepe"
                      checked={paymentMethod === 'phonepe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Image src="/phonepe-logo.svg" alt="PhonePe" width={16} height={16} loading="lazy" />
                        </div>
                        <div>
                          <p className="font-medium text-black" >
                            PhonePe
                          </p>
                          <p className="text-sm text-gray-600" >
                            Quick and secure payments
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black transition-colors duration-200 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-black" >
                            UPI Payment
                          </p>
                          <p className="text-sm text-gray-600" >
                            Pay with any UPI app
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-black transition-colors duration-200 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-black" >
                              Cash on Delivery (COD)
                            </p>
                            <p className="text-sm text-gray-600" >
                              Pay when you receive
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500" >
                            Confirmation Fee
                          </p>
                          <p className="text-sm font-semibold text-black" >
                            ₹{codConfirmationFee}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <p>⚠️ A ₹{codConfirmationFee} confirmation fee is required to secure your order. Pay the remaining amount when you receive the order.</p>
                      </div>
                      
                      {/* Payment method selection for confirmation fee */}
                      {paymentMethod === 'cod' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Select payment method for confirmation fee:</p>
                          <div className="space-y-2">
                            <label className="flex items-center text-xs">
                              <input
                                type="radio"
                                name="codConfirmationPayment"
                                value="razorpay"
                                checked={codConfirmationPaymentMethod === 'razorpay'}
                                onChange={(e) => setCodConfirmationPaymentMethod(e.target.value)}
                                className="w-3 h-3 text-black border-gray-300 focus:ring-black mr-2"
                              />
                              <span className="text-gray-700">Razorpay (Card/UPI/Net Banking)</span>
                            </label>
                            <label className="flex items-center text-xs">
                              <input
                                type="radio"
                                name="codConfirmationPayment"
                                value="phonepe"
                                checked={codConfirmationPaymentMethod === 'phonepe'}
                                onChange={(e) => setCodConfirmationPaymentMethod(e.target.value)}
                                className="w-3 h-3 text-black border-gray-300 focus:ring-black mr-2"
                              />
                              <span className="text-gray-700">PhonePe</span>
                            </label>
                            <label className="flex items-center text-xs">
                              <input
                                type="radio"
                                name="codConfirmationPayment"
                                value="upi"
                                checked={codConfirmationPaymentMethod === 'upi'}
                                onChange={(e) => setCodConfirmationPaymentMethod(e.target.value)}
                                className="w-3 h-3 text-black border-gray-300 focus:ring-black mr-2"
                              />
                              <span className="text-gray-700">UPI</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-black" >
                    Coupon Code
                  </h2>
                </div>
                
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-black mb-6" >
                Order Summary
              </h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => {
                  // Get data from cart item structure (name, price, image, variant.name)
                  const productTitle = item.name || 'Product';
                  const variantTitle = item.variant?.name || 'Default';
                  const itemPrice = item.price || 0;
                  const quantity = item.quantity || 1;
                  const itemImage = item.image || '/placeholder-product.jpg';
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 flex-shrink-0">
                        <Image
                          src={itemImage}
                          alt={productTitle}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-black truncate" >
                          {productTitle}
                        </h4>
                        <p className="text-xs text-gray-600" >
                          {variantTitle}
                        </p>
                        <p className="text-sm text-gray-700" >
                          Qty: {quantity}
                        </p>
                      </div>
                      
                      <div className="text-sm font-bold text-black" >
                        ₹{itemPrice * quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6 space-y-4">
                <div className="flex justify-between text-gray-600" >
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between text-gray-600" >
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600" >
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                
                {paymentMethod === 'cod' && (
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600 text-sm" >
                      <span>Order Total</span>
                      <span>₹{total}</span>
                    </div>
                    <div className="flex justify-between text-yellow-700 text-sm font-semibold bg-yellow-50 p-2 rounded" >
                      <span>Confirmation Fee (COD)</span>
                      <span>₹{codConfirmationFee}</span>
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-black text-lg font-bold" >
                    <span>{paymentMethod === 'cod' ? 'Pay Now' : 'Total'}</span>
                    <span>₹{paymentMethod === 'cod' ? codConfirmationFee : total}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Pay remaining ₹{total - codConfirmationFee} on delivery
                    </p>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="mt-4 text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg" >
                  {error}
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={isLoading || isPayingConfirmationFee || cartItems.length === 0}
                className="w-full bg-black text-white py-4 px-6 rounded-lg font-medium mt-6 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isPayingConfirmationFee ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Paying Confirmation Fee ₹{codConfirmationFee}...</span>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  paymentMethod === 'cod' 
                    ? `Pay Confirmation Fee ₹${codConfirmationFee}` 
                    : `Pay ₹${total}`
                )}
              </button>
              
              <div className="mt-4 text-center">
                <Link 
                  href="/cart" 
                  className="text-gray-600 hover:text-black text-sm transition-colors duration-200 inline-flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Cart</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
