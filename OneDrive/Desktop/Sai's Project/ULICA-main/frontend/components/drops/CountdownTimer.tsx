'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: string;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({ endDate, onExpire, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          total: difference
        });
        setIsExpired(false);
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        });
        setIsExpired(true);
        onExpire?.();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (isExpired) {
    return (
      <div className={`text-red-600 font-semibold ${className}`}>
        Drop Ended
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
          {timeLeft.days.toString().padStart(2, '0')}
        </span>
        <span className="text-gray-600 text-sm">d</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-gray-600 text-sm">h</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-gray-600 text-sm">m</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-gray-600 text-sm">s</span>
      </div>
    </div>
  );
}