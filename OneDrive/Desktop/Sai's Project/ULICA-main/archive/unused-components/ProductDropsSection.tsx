'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { DropName } from './DropName';

export function ProductDropsSection() {
  // Sample images for rotation
  const sampleImages = [
    "/sample-1.jpg",
    "/sample-2.jpg", 
    "/sample-3.jpg",
    "/sample-4.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sampleImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            // Card coming into view - show it
            setVisibleCards((prev) => new Set(Array.from(prev).concat(index)));
          } else {
            // Card going out of view - hide it
            setVisibleCards((prev) => {
              const newSet = new Set(Array.from(prev));
              newSet.delete(index);
              return newSet;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const products = [
    {
      id: 1,
      name: "Cheetah navy Blue edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/cheetah-navy.jpg",
      isSoldOut: true
    },
    {
      id: 2,
      name: "Flamingo Peach edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/flamingo-peach.jpg",
      isSoldOut: false
    },
    {
      id: 3,
      name: "Flamingo Pastel Pink edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/flamingo-pink.jpg",
      isSoldOut: false
    },
    {
      id: 4,
      name: "Flamingo Grey edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/flamingo-grey.jpg",
      isSoldOut: true
    },
    {
      id: 5,
      name: "Flamingo Black edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/flamingo-black.jpg",
      isSoldOut: true
    },
    {
      id: 6,
      name: "Wolf Peach edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/wolf-peach.jpg",
      isSoldOut: true
    },
    {
      id: 7,
      name: "Wolf Brown edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/wolf-brown.jpg",
      isSoldOut: false
    },
    {
      id: 8,
      name: "Wolf Black edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/wolf-black.jpg",
      isSoldOut: true
    },
    {
      id: 9,
      name: "Dragon Red edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/dragon-red.jpg",
      isSoldOut: true
    },
    {
      id: 10,
      name: "Dragon Light Pink edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/dragon-light-pink.jpg",
      isSoldOut: true
    },
    {
      id: 11,
      name: "Dragon Peach edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/dragon-peach.jpg",
      isSoldOut: true
    },
    {
      id: 12,
      name: "Dragon Black edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/dragon-black.jpg",
      isSoldOut: false
    },
    {
      id: 13,
      name: "Crimson Jungle Peach Edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/crimson-peach.jpg",
      isSoldOut: true
    },
    {
      id: 14,
      name: "Crimson Jungle Black Edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/crimson-black.jpg",
      isSoldOut: true
    },
    {
      id: 15,
      name: "Cheetah Red edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/cheetah-red.jpg",
      isSoldOut: false
    },
    {
      id: 16,
      name: "Cheetah Dark Brown edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/cheetah-brown.jpg",
      isSoldOut: true
    },
    {
      id: 17,
      name: "Cheetah Peach edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/cheetah-peach.jpg",
      isSoldOut: true
    },
    {
      id: 18,
      name: "Cheetah Black edition T-Shirt",
      originalPrice: 1499,
      currentPrice: 899,
      discount: 600,
      image: "/cheetah-black.jpg",
      isSoldOut: true
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-black">
            <DropName />
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {products.map((product, index) => {
            const isVisible = visibleCards.has(index);
            return (
            <Link 
              key={product.id} 
              href={`/product/${product.id}`}
              ref={(el) => (cardRefs.current[index] = el)}
              data-index={index}
              className={`group relative bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-500 ease-in-out transform block ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
              }}
            >
              {/* Product Image */}
              <div className="relative overflow-hidden bg-gray-100 aspect-[4/5] group-hover:bg-gray-300 transition-colors duration-300">
                <div className="absolute inset-0 bg-gray-200 group-hover:bg-gray-400 flex items-center justify-center transition-all duration-300">
                  <div 
                    className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 group-hover:scale-110 transition-transform duration-300 ease-in-out flex items-center justify-center"
                    style={{
                      backgroundImage: `url(${sampleImages[currentImageIndex]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <span className="text-gray-400 group-hover:text-gray-600 text-sm transition-colors duration-300 bg-white/80 px-3 py-1 rounded">
                      {sampleImages[currentImageIndex].split('/')[1].split('.')[0]}
                    </span>
                  </div>
                </div>
                


              </div>

              {/* Product Info */}
              <div className="p-4 text-center">
                <h3 className="font-medium text-sm text-black mb-3 leading-tight group-hover:text-gray-700 transition-colors duration-300" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  {product.name}
                </h3>
                
                {/* Pricing */}
                <div className="mb-3 flex items-center justify-center gap-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  <div className="text-xs text-gray-500 font-medium line-through">
                    ₹{product.originalPrice}.00
                  </div>
                  <div className="text-sm text-black font-bold">
                    ₹{product.currentPrice}.00
                  </div>
                  <div className="inline-block bg-green-500 text-white px-2 py-1 text-xs font-medium">
                    Save ₹{product.discount}.00
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
