'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@/components/ui/icons';

export function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Alex Chen',
      role: 'Fashion Blogger',
      content: 'ULICA has completely transformed my wardrobe. The quality is exceptional and the designs are always on trend.',
      rating: 5,
      avatar: '/images/testimonial-1.jpg',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Streetwear Enthusiast',
      content: 'Fast shipping, great customer service, and amazing products. ULICA is my go-to for all streetwear needs.',
      rating: 5,
      avatar: '/images/testimonial-2.jpg',
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      role: 'Content Creator',
      content: 'The limited drops are always worth the wait. ULICA knows how to create hype while delivering quality.',
      rating: 5,
      avatar: '/images/testimonial-3.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-opacity duration-500 ${
                  index === currentTestimonial ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentTestimonial
                    ? 'bg-primary-600 scale-110'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
