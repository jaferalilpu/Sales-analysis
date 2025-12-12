'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/providers';
import { AddressForm } from '@/components/forms/AddressForm';
import { EditProfileForm } from '@/components/forms/EditProfileForm';
import { SupportForm } from '@/components/forms/SupportForm';
import ReferralDashboard from '@/components/referrals/ReferralDashboard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { Address } from '@/types/user';
import { Order } from '@/types/order';
import { getErrorMessage } from '@/types/common';
import { SupportTicket, SupportTicketFormData } from '@/types/support';
import { Coupon } from '@/types/coupon';
import { UserProfile } from '@/types/profile';

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isEditProfileFormOpen, setIsEditProfileFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { user, logout, isAdmin, updateUser } = useAuth();
  const router = useRouter();

  // Handler functions
  const handleSaveAddress = (addressData: { fullName: string; address: string; city: string; state: string; pincode: string; country: string; phone: string; isDefault: boolean; id?: string }) => {
    // Convert AddressData to Address format
    const [firstName, ...lastNameParts] = addressData.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    const address: Address = {
      id: addressData.id || `addr_${Date.now()}`,
      userId: user?.id || '',
      type: 'shipping',
      firstName: firstName || '',
      lastName: lastName,
      address1: addressData.address,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      country: addressData.country,
      phone: addressData.phone,
      isDefault: addressData.isDefault,
    };

    if (editingAddress) {
      // Update existing address
      const updatedAddresses = addresses.map(addr =>
        addr.id === editingAddress.id ? { ...address, id: editingAddress.id } : addr
      );
      setAddresses(updatedAddresses);
      localStorage.setItem('ulica_addresses', JSON.stringify(updatedAddresses));
      showToast.success('Address updated successfully.');
      setEditingAddress(null);
    } else {
      // Add new address
      const newAddresses = [...addresses, address];
      setAddresses(newAddresses);
      localStorage.setItem('ulica_addresses', JSON.stringify(newAddresses));
      showToast.success('Address saved successfully.');
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    // Use ConfirmDialog for better UX
    const confirmed = window.confirm('Are you sure you want to delete this address?');
    if (!confirmed) return;

    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    setAddresses(updatedAddresses);
    localStorage.setItem('ulica_addresses', JSON.stringify(updatedAddresses));
    showToast.success('Address deleted successfully.');
  };

  const handleCloseAddressForm = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null);
  };

  const handleSaveProfile = (profileData: UserProfile) => {
    updateUser(profileData);
    setIsEditProfileFormOpen(false);
    showToast.success('Profile updated successfully.');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Support handlers
  const handleCreateSupportTicket = async (ticketData: SupportTicketFormData) => {
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: ticketData.subject,
          description: ticketData.description,
          category: ticketData.category || 'general',
          priority: ticketData.priority || 'medium',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh support tickets
        const ticketsResponse = await fetch('/api/support/tickets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          if (ticketsData.success && ticketsData.data?.tickets) {
            setSupportTickets(ticketsData.data.tickets);
          }
        }

        setIsSupportFormOpen(false);
        showToast.success('Support ticket created successfully.');
      } else {
        throw new Error(data.message || 'Failed to create support ticket');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);

      showToast.error(errorMessage || 'Failed to create support ticket. Please try again.');
    }
  };

  const handleCloseSupportForm = () => {
    setIsSupportFormOpen(false);
  };

  // Coupon handlers
  const handleApplyCoupon = (couponCode: string) => {
    const coupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    if (coupon) {
      const discountAmount = coupon.type === 'percentage'
        ? (0 * coupon.value / 100) // Calculate based on order total if available
        : coupon.value;
      showToast.success(`Coupon "${couponCode}" applied! Discount: ${coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}`);
    } else {
      showToast.error('Invalid coupon code. Please try again.');
    }
  };

  const handleCloseCouponForm = () => {
    setIsCouponFormOpen(false);
  };

  // Removed hardcoded sample orders - now fetched from API

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load addresses from localStorage (temporary - should be from API)
        const savedAddresses = localStorage.getItem('ulica_addresses');
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }

        // Fetch user's orders from API
        try {
          const ordersResponse = await fetch('/api/orders', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            if (ordersData.success && ordersData.data?.orders) {
              setOrders(ordersData.data.orders);
            }
          }
        } catch (error) {

        }

        // Fetch user's support tickets from API
        try {
          const ticketsResponse = await fetch('/api/support/my-tickets', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (ticketsResponse.ok) {
            const ticketsData = await ticketsResponse.json();
            if (ticketsData.success && ticketsData.data?.tickets) {
              setSupportTickets(ticketsData.data.tickets);
            }
          }
        } catch (error) {

        }

        // Fetch available coupons from API
        try {
          const couponsResponse = await fetch('/api/coupons', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (couponsResponse.ok) {
            const couponsData = await couponsResponse.json();
            if (couponsData.success && couponsData.data?.coupons) {
              // Filter only active coupons that are valid
              const now = new Date();
              const activeCoupons = couponsData.data.coupons
                .filter((coupon: Coupon) =>
                  coupon.isActive &&
                  (coupon.validUntil ? new Date(coupon.validUntil) >= now : true) &&
                  (coupon.validFrom ? new Date(coupon.validFrom) <= now : true)
                )
                .map((coupon: Coupon) => ({
                  id: coupon.id,
                  code: coupon.code,
                  description: coupon.description || coupon.name,
                  discount: coupon.type === 'percentage'
                    ? Math.round((coupon.value / 100) * (coupon.minAmount || 1000))
                    : coupon.value,
                  type: coupon.type,
                  minOrderAmount: coupon.minAmount || 0,
                  validUntil: coupon.validUntil,
                  isActive: coupon.isActive,
                }));
              setCoupons(activeCoupons);
            }
          }
        } catch (error) {

        }

        // Wallet balance - fetch from user profile or set to 0 if not available
        // TODO: Implement wallet API endpoint
        setWalletBalance(0);
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, router]);

  // Show loading while redirecting admin users
  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div role="status" aria-busy="true" aria-live="polite">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Redirecting to admin panel...
            </p>
            <span className="sr-only">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md w-full px-4">
          <div role="status" aria-busy="true" aria-live="polite">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Loading dashboard...
            </p>
            <span className="sr-only">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            My Dashboard
          </h1>
          <p className="text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            Welcome back, {user?.name || user?.email}!
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'profile'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Profile
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'addresses'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Saved Addresses
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'orders'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Orders
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'support'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Support
                </button>

                <button
                  onClick={() => setActiveTab('coupons')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'coupons'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Coupons & Rewards
                </button>

                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'referrals'
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Referrals
                </button>
              </nav>

              {/* Sign Out Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeTab === 'profile' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Profile Information
                  </h2>
                  <button
                    onClick={() => setIsEditProfileFormOpen(true)}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                    style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Avatar Section */}
                  <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-black mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {user?.name || 'User'}
                      </h3>
                      <p className="text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          Full Name
                        </label>
                      </div>
                      <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {user?.name || 'Not provided'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          Email Address
                        </label>
                      </div>
                      <p className="text-lg font-semibold text-black break-all" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {user?.email}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          Phone Number
                        </label>
                      </div>
                      <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {user?.phone || 'Not provided'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          Member Since
                        </label>
                      </div>
                      <p className="text-lg font-semibold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          Account Status
                        </h4>
                        <p className="text-blue-700 text-sm" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          {user?.isEmailVerified ? 'Email verified • Account active' : 'Email verification pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Order History
                  </h2>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-3" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      Start shopping to see your orders here.
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl"
                      style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-black mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-black mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              ₹{order.totalAmount}
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                              }`} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item) => {
                            if (!item.variant) return null;
                            const variant = item.variant as any;
                            const primaryImage = variant.product?.images?.find((img: any) => img.isPrimary);
                            return (
                              <div key={item.id} className="flex items-center space-x-4">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
                                  {primaryImage && (
                                    <Image
                                      src={primaryImage.url}
                                      alt={primaryImage.alt || variant.product?.title || 'Product'}
                                      width={64}
                                      height={64}
                                      className="object-cover rounded-lg"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                    {variant.product?.title || 'Product'}
                                  </h4>
                                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                    {variant.title} × {item.quantity}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            {order.status === 'processing' && (
                              <button
                                onClick={() => {
                                  // Handle order cancellation
                                  showToast.info('Order cancellation feature coming soon!');
                                }}
                                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                              >
                                Cancel Order
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <Link
                                href={`/track/${order.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                                style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                              >
                                Track Package
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => setIsAddressFormOpen(true)}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                    style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                  >
                    Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-3" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      No saved addresses
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                      Add your addresses for faster checkout.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-black mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              {address.firstName} {address.lastName}
                            </h4>
                            {address.isDefault && (
                              <span className="bg-black text-white text-xs px-2 py-1 rounded" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                              style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                            {address.address1}
                          </p>
                          <p className="text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                            {address.city}, {address.state} {address.pincode}
                          </p>
                          <p className="text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                            {address.country}
                          </p>
                          <p className="text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                            Phone: {address.phone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'support' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Support Center
                  </h2>
                  <button
                    onClick={() => setIsSupportFormOpen(true)}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                    style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                  >
                    Raise Ticket
                  </button>
                </div>

                {/* FAQ Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Frequently Asked Questions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <h4 className="font-medium text-black mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        How do I track my order?
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        You can track your order using the tracking number provided in your order confirmation email.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <h4 className="font-medium text-black mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        What is the return policy?
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        We offer 30-day returns for unused items in original packaging.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <h4 className="font-medium text-black mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        How do I change my delivery address?
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        Contact support immediately if your order hasn't shipped yet.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <h4 className="font-medium text-black mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        How long does shipping take?
                      </h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        Standard shipping takes 3-5 business days within India.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support Tickets */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Your Support Tickets
                  </h3>

                  {supportTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-black mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        No support tickets yet
                      </h4>
                      <p className="text-gray-600 mb-4" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        Need help? Raise a support ticket and we'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {supportTickets.map((ticket) => (
                        <div key={ticket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-black mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                {ticket.subject}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                {ticket.description}
                              </p>
                              <p className="text-xs text-gray-500" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                Created: {new Date(ticket.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                                ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                                ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                                {ticket.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'coupons' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-black" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Coupons & Rewards
                  </h2>
                </div>

                {/* Wallet Balance */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        Wallet Balance
                      </h3>
                      <p className="text-3xl font-bold text-green-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        ₹{walletBalance.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        {walletBalance > 0 ? 'Available for next purchase' : 'No wallet balance yet'}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Available Coupons */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Available Coupons
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-black mb-1" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              {coupon.code}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              {coupon.description}
                            </p>
                            <p className="text-xs text-gray-500" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                              Min. order: ₹{coupon.minAmount || 0}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`} style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                            {coupon.isActive ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                          </span>
                          <button
                            onClick={() => handleApplyCoupon(coupon.code)}
                            disabled={!coupon.isActive}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${coupon.isActive
                              ? 'bg-black text-white hover:bg-gray-800'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}
                          >
                            Apply
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                          Valid until: {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rewards History */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                    Rewards History
                  </h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-black mb-2" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        No rewards history yet
                      </h4>
                      <p className="text-gray-600" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        Your cashback and coupon usage will appear here after you make purchases.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* TODO: Fetch actual rewards history from API */}
                      <div className="text-center py-8 text-gray-500 text-sm" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
                        Rewards history will be displayed here once you have completed orders with cashback or coupon usage.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <ReferralDashboard />
              </div>
            )}
          </div>
        </div>

        {/* Address Form Modal */}
        <AddressForm
          isOpen={isAddressFormOpen}
          onClose={handleCloseAddressForm}
          onSave={handleSaveAddress}
          editingAddress={editingAddress ? {
            id: editingAddress.id,
            fullName: `${editingAddress.firstName} ${editingAddress.lastName}`,
            phone: editingAddress.phone || '',
            address: editingAddress.address1,
            city: editingAddress.city,
            state: editingAddress.state,
            pincode: editingAddress.pincode,
            country: editingAddress.country,
            isDefault: editingAddress.isDefault,
          } : null}
        />

        {/* Edit Profile Form Modal */}
        <EditProfileForm
          isOpen={isEditProfileFormOpen}
          onClose={() => setIsEditProfileFormOpen(false)}
          onSave={handleSaveProfile}
        />

        {/* Support Form Modal */}
        <SupportForm
          isOpen={isSupportFormOpen}
          onClose={handleCloseSupportForm}
          onCreateTicket={handleCreateSupportTicket}
        />
      </div>
    </div>
  );
}
