'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, CalendarIcon, BellIcon } from '@heroicons/react/24/outline';
import { CountdownTimer } from '@/components/drops/CountdownTimer';

interface ComingSoonDrop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended' | 'archived';
  dropProducts: Array<{
    product: {
      id: string;
      title: string;
      slug: string;
      images: Array<{
        url: string;
        altText?: string;
      }>;
    };
  }>;
  _count: {
    dropProducts: number;
  };
}

export default function ComingSoonPage() {
  const [drops, setDrops] = useState<ComingSoonDrop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchComingSoonDrops();
  }, []);

  const fetchComingSoonDrops = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/drops');
      
      if (response.ok) {
        const data = await response.json();
        const upcomingDrops = data.data?.drops?.filter((drop: any) => 
          drop.status === 'upcoming'
        ) || [];
        setDrops(upcomingDrops);
      } else {
        setError('Failed to fetch coming soon drops');
      }
    } catch (err) {
      setError('Failed to fetch coming soon drops');
      console.error('Error fetching coming soon drops:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotification = (dropId: string) => {
    setNotifications(prev => ({
      ...prev,
      [dropId]: !prev[dropId]
    }));
    
    // In a real app, you would save this to the backend
    localStorage.setItem(`notification_${dropId}`, JSON.stringify(!notifications[dropId]));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Loading coming soon drops...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Error Loading Coming Soon
            </h1>
            <p className="text-gray-600 mb-8" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              {error}
            </p>
            <button
              onClick={fetchComingSoonDrops}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Coming Soon
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Get ready for our upcoming drops and limited collections. Set notifications to be the first to know when they go live.
          </p>
        </div>

        {drops.length === 0 ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              No Upcoming Drops
            </h2>
            <p className="text-gray-600 mb-8" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Check back later for upcoming drops and collections.
            </p>
            <Link
              href="/drops"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              View Active Drops
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {drops.length}
                  </div>
                  <div className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Coming Soon
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {drops.reduce((total, drop) => total + drop._count.dropProducts, 0)}
                  </div>
                  <div className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Total Products
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {Object.values(notifications).filter(Boolean).length}
                  </div>
                  <div className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Notifications Set
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Drops */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {drops.map((drop) => (
                <div
                  key={drop.id}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Banner Image */}
                  {drop.bannerImage ? (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <Image
                        src={drop.bannerImage}
                        alt={drop.name}
                        width={400}
                        height={225}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-xl font-bold" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {drop.name}
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Coming Soon
                      </span>
                      <button
                        onClick={() => toggleNotification(drop.id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${
                          notifications[drop.id] 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400 hover:text-blue-600'
                        }`}
                        title={notifications[drop.id] ? 'Remove notification' : 'Set notification'}
                      >
                        <BellIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Drop Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {drop.name}
                    </h3>
                    
                    {drop.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {drop.description}
                      </p>
                    )}

                    {/* Launch Countdown */}
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        Launch Date
                      </div>
                      <CountdownTimer 
                        endDate={drop.startDate} 
                        className="text-sm"
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{drop._count.dropProducts} products</span>
                      <span>{new Date(drop.startDate).toLocaleDateString()}</span>
                    </div>

                    {/* Notification Status */}
                    {notifications[drop.id] && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                        <div className="flex items-center">
                          <BellIcon className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm text-blue-800" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                            You'll be notified when this drop goes live
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Link
                      href={`/drops/${drop.slug}`}
                      className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
                      style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Don't Miss Out
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Set notifications for drops you're interested in and be the first to shop when they go live. Limited quantities available!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/drops"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    View Active Drops
                  </Link>
                  <Link
                    href="/archive"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Browse Archive
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
