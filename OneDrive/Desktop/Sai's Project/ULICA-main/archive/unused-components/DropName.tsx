'use client';

import { useState, useEffect } from 'react';

interface DropNameProps {
  className?: string;
}

export function DropName({ className = '' }: DropNameProps) {
  const [dropName, setDropName] = useState<string>('DROP I'); // Default fallback
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentDrop = async () => {
      try {
        const response = await fetch('/api/drops/current', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('DropName - Fetched data:', data); // Debug log
          if (data.success && data.data?.drop?.name) {
            console.log('DropName - Setting drop name to:', data.data.drop.name); // Debug log
            setDropName(data.data.drop.name);
          } else {
            console.log('DropName - No drop name found in response:', data); // Debug log
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('DropName - Failed to fetch current drop:', response.status, errorData);
        }
      } catch (error) {
        console.error('DropName - Error fetching current drop:', error);
        // Keep default "DROP I" on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentDrop();
  }, []);

  // Return the drop name wrapped in appropriate element
  if (className.includes('text-')) {
    // If className suggests it's a heading, return as span (parent will wrap)
    return <span className={className}>{isLoading ? 'DROP I' : dropName}</span>;
  }
  
  // Default: return as h2 if no specific styling requested
  return (
    <h2 className={className || 'text-4xl font-bold text-gray-900 mb-4'}>
      {isLoading ? 'DROP I' : dropName}
    </h2>
  );
}

