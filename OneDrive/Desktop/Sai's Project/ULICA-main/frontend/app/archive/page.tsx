'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClockIcon, TagIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Drop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended' | 'archived';
  purchaseLimitPerCustomer?: number;
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
    dropPurchases: number;
  };
}

export default function ArchivePage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArchivedDrops();
  }, []);

  const fetchArchivedDrops = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/drops/archived');
      
      if (response.ok) {
        const data = await response.json();
        setDrops(data.data.drops || []);
      } else {
        setError('Failed to fetch archived drops');
      }
    } catch (err) {
      setError('Failed to fetch archived drops');
      // Error fetching archived drops - handled by error boundary
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              Loading archived drops...
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
              Error Loading Archive
            </h1>
            <p className="text-gray-600 mb-8" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              {error}
            </p>
            <button
              onClick={fetchArchivedDrops}
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Archive
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Browse through our past drops and limited collections that have ended
          </p>
        </div>

        {drops.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <ClockIcon className="h-10 w-10 text-gray-500" />
              </div>
              
              {/* Heading */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                No Archived Drops Yet
              </h2>
              
              {/* Description */}
              <p className="text-base text-gray-600 mb-8 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Once a drop sells out or ends, it will be preserved here for inspiration and future reference. Stay tuned for exclusive collections!
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  <span>View Active Drops</span>
                </Link>
                <Link
                  href="/drops"
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  <span>View Upcoming Drops</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {drops.length}
                  </div>
                  <div className="text-gray-600 text-sm uppercase tracking-wide" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Archived Drops
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {drops.reduce((total, drop) => total + drop._count.dropProducts, 0)}
                  </div>
                  <div className="text-gray-600 text-sm uppercase tracking-wide" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Total Products
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {drops.reduce((total, drop) => total + drop._count.dropPurchases, 0)}
                  </div>
                  <div className="text-gray-600 text-sm uppercase tracking-wide" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    Total Purchases
                  </div>
                </div>
              </div>
            </div>

            {/* Drops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {drops.map((drop) => (
                <div
                  key={drop.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Banner Image */}
                  {drop.bannerImage && (
                    <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                      <Image
                        src={drop.bannerImage}
                        alt={drop.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Archived
                      </span>
                      <div className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {new Date(drop.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Drop Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {drop.name}
                    </h3>
                    
                    {drop.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {drop.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-1.5">
                        <TagIcon className="w-4 h-4" />
                        <span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          {drop._count.dropProducts} {drop._count.dropProducts === 1 ? 'product' : 'products'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <EyeIcon className="w-4 h-4" />
                        <span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          {drop._count.dropPurchases} {drop._count.dropPurchases === 1 ? 'purchase' : 'purchases'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/drops/${drop.slug}`}
                      className="block w-full text-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 font-medium"
                      style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                    >
                      View Collection
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}