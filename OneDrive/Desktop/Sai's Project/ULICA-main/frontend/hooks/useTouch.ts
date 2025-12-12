'use client';

import { useState, useEffect, useRef, TouchEvent } from 'react';

/**
 * Hook to detect touch device
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
    );
  }, []);

  return isTouch;
}

/**
 * Hook for swipe gestures
 */
interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(handlers: SwipeHandlers, threshold: number = 50) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe && handlers.onSwipeLeft) {
      handlers.onSwipeLeft();
    }
    if (isRightSwipe && handlers.onSwipeRight) {
      handlers.onSwipeRight();
    }
    if (isUpSwipe && handlers.onSwipeUp) {
      handlers.onSwipeUp();
    }
    if (isDownSwipe && handlers.onSwipeDown) {
      handlers.onSwipeDown();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

/**
 * Hook for touch feedback (ripple effect)
 */
export function useTouchFeedback() {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => {
    setTimeout(() => setIsPressed(false), 150);
  };

  return {
    isPressed,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEnd,
      onMouseLeave: handleTouchEnd,
    },
  };
}

