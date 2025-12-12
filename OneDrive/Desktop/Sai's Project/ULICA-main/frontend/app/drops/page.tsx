'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CountdownTimer } from '@/components/drops/CountdownTimer';
import { ClockIcon, TagIcon, EyeIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  const isArchiveView = useMemo(() => view === 'archive', [view]);

  const fetchDrops = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = isArchiveView
        ? '/api/drops?status=archived'
        : '/api/drops';

      const response = await fetch(url, { cache: 'no-store' });
      
      if (response.ok) {
        const data = await response.json();
        // Handle different response structures
        const drops = data.data?.drops || data.drops || data.data || [];
        setDrops(Array.isArray(drops) ? drops : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  }, [isArchiveView]);

  useEffect(() => {
    fetchDrops();
  }, [fetchDrops]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Skeleton for header */}
            <Skeleton className="h-12 w-64" />
            
            {/* Skeleton for drop cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
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
            {isArchiveView ? 'Archived Drops' : 'Upcoming Drops'}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {isArchiveView
              ? 'Explore the collections that defined previous drops. Relive limited editions and inspiration for future releases.'
              : 'Get ready for our next exclusive releases. These limited-time collections are coming soon.'}
          </p>
        </div>

        {/* Drops Grid */}
        {drops.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <ClockIcon className="h-10 w-10 text-gray-500" />
              </div>
              
              {/* Heading */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {isArchiveView ? 'No Archived Drops Yet' : 'No Upcoming Drops Available'}
              </h2>
              
              {/* Description */}
              <p className="text-base text-gray-600 mb-8 leading-relaxed" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {isArchiveView
                  ? 'Once a drop sells out, it will be preserved here for inspiration and future reference. Stay tuned for exclusive collections!'
                  : 'We\'re preparing something special for you! Check back soon for new exclusive drops and limited-time collections.'}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  <span>Browse All Products</span>
                </Link>
                <Link
                  href="/archive"
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium inline-flex items-center justify-center space-x-2"
                  style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                >
                  <span>View Archive</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {drops.map((drop) => (
              <div key={drop.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
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
                  {/* Drop Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {drop.name}
                    </h3>
                    {drop.description && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {drop.description}
                      </p>
                    )}
                  </div>

                  {/* Countdown Timer */}
                  <div className="mb-4">
                    <CountdownTimer
                      endDate={drop.endDate}
                      className="mb-4"
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1.5">
                      <TagIcon className="h-4 w-4" />
                      <span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        {drop._count.dropProducts} {drop._count.dropProducts === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                    {drop.purchaseLimitPerCustomer && (
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                        Limit: {drop.purchaseLimitPerCustomer}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/drops/${drop.slug}`}
                    className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-center inline-flex items-center justify-center space-x-2"
                    style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>
                      {drop.status === 'upcoming' ? 'View Details' : 
                       drop.status === 'live' ? 'Shop Now' : 'View Collection'}
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}