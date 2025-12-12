'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function LiveDropsSection() {
  const drops = [
    {
      id: 1,
      title: 'Urban Essentials Drop',
      description: 'Limited edition streetwear collection',
      image: '/images/drop-urban.jpg',
      status: 'live',
      timeLeft: '2 days left',
      price: '₹2,999',
    },
    {
      id: 2,
      title: 'Retro Wave Collection',
      description: 'Nostalgic designs with modern twist',
      image: '/images/drop-retro.jpg',
      status: 'upcoming',
      timeLeft: 'Starts in 5 days',
      price: '₹3,499',
    },
    {
      id: 3,
      title: 'Minimalist Series',
      description: 'Clean, sophisticated pieces',
      image: '/images/drop-minimal.jpg',
      status: 'live',
      timeLeft: '1 day left',
      price: '₹2,299',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'upcoming':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <section className="section-padding bg-white text-gray-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Live Drops
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't miss out on our exclusive limited-time releases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {drops.map((drop, index) => (
            <motion.div
              key={drop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/drops/${drop.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">🔥</div>
                    <div className="text-sm opacity-75">Coming Soon</div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(drop.status)}`}>
                      {drop.status === 'live' ? 'LIVE NOW' : 'COMING SOON'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white font-medium">{drop.timeLeft}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="font-heading text-xl font-semibold mb-2 group-hover:text-gray-600 transition-colors">
                    {drop.title}
                  </h3>
                  <p className="text-gray-500 mb-3">{drop.description}</p>
                  <p className="text-lg font-bold text-gray-900">{drop.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/drops" className="btn-primary">
            View All Drops
          </Link>
        </div>
      </div>
    </section>
  );
}
