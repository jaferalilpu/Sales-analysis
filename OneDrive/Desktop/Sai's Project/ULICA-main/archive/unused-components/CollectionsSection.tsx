'use client';

import Link from 'next/link';
import Image from 'next/image';

export function CollectionsSection() {
  const collections = [
    {
      id: 1,
      name: 'Essentials',
      slug: 'essentials',
      description: 'Core pieces for your wardrobe',
      image: '/images/collection-essentials.jpg',
      productCount: 24,
    },
    {
      id: 2,
      name: 'Streetwear',
      slug: 'streetwear',
      description: 'Urban style statements',
      image: '/images/collection-streetwear.jpg',
      productCount: 18,
    },
    {
      id: 3,
      name: 'Limited Drops',
      slug: 'limited-drops',
      description: 'Exclusive releases',
      image: '/images/collection-limited.jpg',
      productCount: 12,
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore curated collections designed for the modern lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="text-center text-gray-600">
                  <div className="text-4xl mb-2">👕</div>
                  <div className="text-sm font-medium">{collection.name}</div>
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                {collection.name}
              </h3>
              <p className="text-gray-600 mb-2">{collection.description}</p>
              <p className="text-sm text-gray-500">{collection.productCount} items</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
