'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProductImage } from '@/types/product';

interface DropProduct {
  product: {
    id: string;
    title: string;  // Backend uses 'title'
    description?: string;
    price: number;
    compareAtPrice?: number;  // Original price before discount
    comparePrice?: number;  // Alias for compareAtPrice
    images: string | string[] | Array<{url: string; alt?: string; isPrimary?: boolean}>;  // Can be JSON string, array of strings, or array of objects
    category?: string;
    isActive?: boolean;
    sku?: string;
    variants?: Array<{
      id: string;
      price: number;
      compareAtPrice?: number;
      comparePrice?: number;
      stockQty?: number;
      isActive?: boolean;
    }>;
  };
}

interface Drop {
  id: string;
  name: string;
  description?: string;
  dropProducts: DropProduct[];
  bannerImage?: string;
  bannerVideo?: string;
}

interface DropPreview {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  bannerImage?: string;
}

interface DropStats {
  upcoming: number;
  archived: number;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ProcessedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  discount: number;
  inStock: boolean;
}

export default function HomePage() {
  const [drop, setDrop] = useState<Drop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingDrop, setUpcomingDrop] = useState<DropPreview | null>(null);
  const [dropStats, setDropStats] = useState<DropStats>({ upcoming: 0, archived: 0 });
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [upcomingDrops, setUpcomingDrops] = useState<DropPreview[]>([]);
  const [archivedDrops, setArchivedDrops] = useState<DropPreview[]>([]);

  const fetchDropInsights = useCallback(async () => {
    const fetchDropsByStatus = async (status: string) => {
      try {
        const response = await fetch(`/api/drops?status=${encodeURIComponent(status)}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          
          return [];
        }

        const data = await response.json();
        return data?.data?.drops || [];
      } catch (error) {
        
        return [];
      }
    };

    try {
      const [upcomingList, endedList, archivedList] = await Promise.all([
        fetchDropsByStatus('upcoming'),
        fetchDropsByStatus('ended'),
        fetchDropsByStatus('archived'),
      ]);

      const sortedUpcoming = [...upcomingList].sort((a, b) => {
        const aTime = new Date(a.startDate).getTime();
        const bTime = new Date(b.startDate).getTime();
        return aTime - bTime;
      });

      const sortedArchived = [...endedList, ...archivedList].sort((a, b) => {
        const aTime = new Date(a.endDate || a.startDate).getTime();
        const bTime = new Date(b.endDate || b.startDate).getTime();
        return bTime - aTime;
      });

      setUpcomingDrop(sortedUpcoming[0] || null);
      setUpcomingDrops(sortedUpcoming.slice(0, 4));
      setArchivedDrops(sortedArchived.slice(0, 4));
      setDropStats({
        upcoming: upcomingList.length,
        archived: endedList.length + archivedList.length,
      });
    } catch (error) {
      
    }
  }, []);

  useEffect(() => {
    const fetchCurrentDrop = async () => {
      try {
        // Reset drop state first to prevent showing stale data
        setDrop(null);
        
        const response = await fetch('/api/drops/current', {
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Strict check: drop must exist, have success flag, and have products
          if (data.success && data.data?.drop && data.data.drop.dropProducts && data.data.drop.dropProducts.length > 0) {
            // Additional validation: ensure drop has at least one product with active status
            const hasActiveProducts = data.data.drop.dropProducts.some(
              (dp: DropProduct) => dp.product?.isActive !== false
            );
            
            if (hasActiveProducts) {
            setDrop(data.data.drop);
            setUpcomingDrop(null);
            setDropStats({ upcoming: 0, archived: 0 });
            return;
            }
          }

          // No valid drop found
          setDrop(null);
          await fetchDropInsights();
        } else {
          // 404 or other error - no drop available
          setDrop(null);
          await fetchDropInsights();
        }
      } catch (error) {
        // Error fetching - ensure drop is null
        setDrop(null);
        await fetchDropInsights();
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentDrop();
  }, [fetchDropInsights]);

  // Countdown timer for upcoming drop
  useEffect(() => {
    if (!upcomingDrop?.startDate) {
      setTimeRemaining(null);
      return;
    }

    const targetTime = new Date(upcomingDrop.startDate).getTime();
    if (Number.isNaN(targetTime)) {
      setTimeRemaining(null);
      return;
    }

    const updateRemaining = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeRemaining(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [upcomingDrop?.startDate]);

  const formattedStartDate = useMemo(() => {
    if (!upcomingDrop?.startDate) return '';
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(upcomingDrop.startDate));
    } catch {
      return '';
    }
  }, [upcomingDrop?.startDate]);

  const formatDropWindow = useCallback((dropItem: DropPreview) => {
    if (!dropItem.startDate) return 'Date TBA';
    try {
      const start = new Date(dropItem.startDate);
      const startFormatted = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(start);

      if (!dropItem.endDate) {
        return `Starts ${startFormatted}`;
      }

      const end = new Date(dropItem.endDate);
      const sameDay = start.toDateString() === end.toDateString();
      const endFormatted = new Intl.DateTimeFormat(
        undefined,
        sameDay
          ? { hour: '2-digit', minute: '2-digit' }
          : { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      ).format(end);

      return sameDay
        ? `${startFormatted} – ${endFormatted}`
        : `${startFormatted} → ${endFormatted}`;
    } catch {
      return 'Date TBA';
    }
  }, []);

  // Extract products from drop - only if drop exists and has products
  // Products are already filtered to be active by backend, but add safety check
  const products: ProcessedProduct[] = (drop && drop.dropProducts && drop.dropProducts.length > 0) 
    ? drop.dropProducts
        .filter((dp: DropProduct) => dp.product?.isActive === true) // Only show active products
        .map(dp => {
    const product = dp.product;
    const productName = product.title || 'Product';
    
    // Handle images - can be string (JSON), array of strings, or array of objects
    let imageArray: string[] = [];
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        imageArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        imageArray = [product.images];
      }
    } else if (Array.isArray(product.images)) {
      // Check if it's an array of objects with url property
      if (product.images.length > 0 && typeof product.images[0] === 'object' && 'url' in product.images[0]) {
        // Extract URLs from image objects, prioritize primary image
        const sortedImages = [...product.images].sort((a: ProductImage | string, b: ProductImage | string) => {
          if (typeof a === 'object' && a.isPrimary) return -1;
          if (typeof b === 'object' && b.isPrimary) return 1;
          return 0;
        });
        imageArray = sortedImages.map((img: ProductImage | string) => {
          if (typeof img === 'string') return img;
          return img.url || '';
        });
      } else {
        // Array of strings
        imageArray = product.images as string[];
      }
    }
    const primaryImage = imageArray[0] || '/placeholder-product.jpg';
    
    // Get price from variants or product price
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const variantPrices = variants.length > 0 
      ? variants.map((v: { price?: number }) => v.price || product.price || 0)
      : [product.price || 0];
    // Get compareAtPrice from variants or product
    const variantComparePrices = variants.length > 0
      ? variants.map((v: { compareAtPrice?: number; comparePrice?: number }) => v.compareAtPrice || v.comparePrice || 0)
          .filter((p: number) => p > 0)
      : [];
    
    const price = variantPrices.length > 0 ? Math.min(...variantPrices) : (product.price || 0);
    
    // Priority: variant compareAtPrice > product compareAtPrice
    let compareAtPrice: number | undefined = undefined;
    if (variantComparePrices.length > 0) {
      compareAtPrice = Math.max(...variantComparePrices);
    } else if (product.compareAtPrice || (product as any).comparePrice) {
      compareAtPrice = product.compareAtPrice || (product as any).comparePrice;
    }
    
    // Calculate save amount (difference between compare and current price)
    const saveAmount = compareAtPrice && compareAtPrice > price 
      ? Math.round((compareAtPrice - price) * 100) / 100 // Round to 2 decimal places
      : 0;
    
    const slug = product.id; // Use product ID as slug since backend doesn't have slug
    
    return {
      id: product.id,
      name: productName,
      slug,
      image: primaryImage,
      price,
      compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
      discount: saveAmount,
      inStock: product.isActive !== false // Use isActive as proxy for inStock
    };
  })
    : [];

  return (
    <div>
      {/* Hero Section with Video/Image Background - Responsive for All Screens */}
      <div className="relative w-full h-[60vh] md:h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background (if videoUrl exists) */}
        {drop?.bannerVideo ? (
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="w-full h-full object-cover"
              poster={drop.bannerImage || '/27546740_t32h_phbt_211202.svg'}
            >
              <source src={drop.bannerVideo} type="video/mp4" />
              <source src={drop.bannerVideo} type="video/webm" />
              {/* Fallback to image if video fails to load */}
              <Image
                src={drop.bannerImage || '/27546740_t32h_phbt_211202.svg'}
                alt="ULICA Background"
                fill
                className="object-cover"
                priority
              />
            </video>
          </div>
        ) : (
          /* Image Background (fallback) */
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={drop?.bannerImage || '/27546740_t32h_phbt_211202.svg'}
              alt="ULICA Background"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        )}
      </div>
      
      {/* Product Grid Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="w-full px-2 sm:px-3 md:px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading...</p>
            </div>
          ) : !drop ? (
            <div className="text-center py-16 px-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
                {(upcomingDrop?.name || 'Stay Tuned').toUpperCase()}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {upcomingDrop?.startDate && formattedStartDate
                  ? `Launching ${formattedStartDate}`
                  : 'We are curating the next exclusive release.'}
              </p>
              {timeRemaining && (
                <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
                  {[
                    { label: 'Days', value: timeRemaining.days },
                    { label: 'Hours', value: timeRemaining.hours },
                    { label: 'Minutes', value: timeRemaining.minutes },
                    { label: 'Seconds', value: timeRemaining.seconds },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-100 rounded-lg px-3 sm:px-4 py-2 min-w-[60px] sm:min-w-[80px]">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {String(value).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Link
                  href="/drops"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-center touch-target"
                >
                  View Upcoming Drops
                </Link>
                <Link
                  href="/drops?view=archive"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center touch-target"
                >
                  Browse Archived Drops
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 sm:mb-12 px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 uppercase">
                  {(drop.name || 'Current Drop').toUpperCase()}
                </h2>
                {drop.description && (
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                    {drop.description}
                  </p>
                )}
              </div>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">
                    No products available in this drop yet.
                  </p>
                </div>
              ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-7 gap-y-8 sm:gap-y-5 md:gap-y-6 lg:gap-y-6 xl:gap-y-7 w-full">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group relative bg-white overflow-hidden hover:opacity-90 transition-opacity duration-300 block w-full rounded-lg"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-[4/5] md:aspect-[4/5] min-h-[260px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[400px] w-full rounded-t-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={products.indexOf(product) < 4}
                      loading={products.indexOf(product) < 4 ? undefined : "lazy"}
                    />
                    
                    {/* Save Badge - Top Left on Small Screens */}
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 sm:hidden bg-[#800000] text-white px-1.5 py-0.5 text-[10px] font-bold rounded z-10">
                        Save ₹{product.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="pt-4 pb-4 px-3 sm:px-4 text-center" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
                    {/* Product Title */}
                    <h3 className="text-sm sm:text-base text-black mb-3 sm:mb-4 leading-snug line-clamp-2 font-normal">
                      {product.name}
                    </h3>
                    
                    {/* Pricing Section - All in one horizontal line */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {/* Original Price (Crossed Out) */}
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <div className="text-xs text-gray-500 font-normal line-through">
                          ₹{product.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                      
                      {/* Current Price */}
                      <div className="text-xs sm:text-sm text-black font-semibold">
                        ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      
                      {/* Save Badge - Hidden on Small Screens, Visible on Larger Screens */}
                      {product.discount > 0 && (
                        <div className="hidden sm:inline-block bg-[#800000] text-white px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded">
                          Save ₹{product.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                    
                    {!product.inStock && (
                      <div className="text-xs text-red-500 font-normal mt-1">
                        Out of Stock
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
