'use client';

import { useState } from 'react';
import { EnvelopeIcon } from '@/components/ui/icons';
import toast from 'react-hot-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section-padding bg-gradient-primary">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Never Miss a Drop
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Get notified about upcoming drops, exclusive access, and limited releases delivered to your inbox.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary bg-white text-primary-600 hover:bg-gray-100 disabled:opacity-50"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          
          <p className="text-sm text-primary-200 mt-4">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
