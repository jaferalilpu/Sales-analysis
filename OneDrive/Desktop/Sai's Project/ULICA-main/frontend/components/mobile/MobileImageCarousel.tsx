'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSwipe } from '@/hooks/useTouch';

interface MobileImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Mobile-optimized image carousel with swipe support
 */
export function MobileImageCarousel({
  images,
  alt,
  className = '',
}: MobileImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
  });

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className={`relative aspect-square bg-gray-100 ${className}`}>
        <Image
          src="/placeholder-product.jpg"
          alt={alt}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Image */}
      <div
        className="relative aspect-square bg-gray-100 overflow-hidden w-full"
        {...swipeHandlers}
      >
        <Image
          src={images[currentIndex] || '/placeholder-product.jpg'}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
          sizes="100vw"
        />
      </div>

      {/* Bar Carousel Indicator - Very thin gray bars below image (always show, even for single image) */}
      <div className="mt-6 mb-4 px-8 flex items-center justify-center gap-0">
        {images.map((_, index) => (
            <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              currentIndex === index 
                ? 'h-[2px] bg-gray-600 flex-1' 
                : 'h-[2px] bg-gray-300 flex-1'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail Strip - Hidden on mobile, show on larger screens if needed */}
      {images.length > 1 && (
        <div className="hidden md:flex mt-4 gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                ${currentIndex === index 
                  ? 'border-blue-600 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

