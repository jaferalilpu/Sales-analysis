'use client';

import React from 'react';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Mobile-optimized input component
 * - Minimum 44px height for touch
 * - Large font size (16px minimum to prevent zoom on iOS)
 * - Clear error states
 */
export function MobileInput({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  type = 'text',
  ...props
}: MobileInputProps) {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseInputClasses = 'min-h-[48px] px-4 py-3 text-base rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 w-full';
  
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`
            ${baseInputClasses}
            ${stateClasses}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

