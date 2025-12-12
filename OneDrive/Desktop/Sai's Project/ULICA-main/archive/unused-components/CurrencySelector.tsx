'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@/components/ui/icons';
import { currencyService, type Currency } from '@/lib/currency';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
}

export function CurrencySelector({ className = '', showLabel = true }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencyService.getCurrentCurrency());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supportedCurrencies = currencyService.getSupportedCurrencies();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCurrencyChange = (currency: Currency) => {
    setCurrentCurrency(currency);
    currencyService.setCurrency(currency);
    setIsOpen(false);
    
    // Reload the page to apply currency changes
    window.location.reload();
  };

  const currentCurrencyConfig = supportedCurrencies.find(curr => curr.code === currentCurrency);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
      >
        {showLabel && (
          <span className="text-gray-500">Currency:</span>
        )}
        <span className="text-lg font-semibold">{currentCurrencyConfig?.symbol}</span>
        <span>{currentCurrencyConfig?.code}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {supportedCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 ${
                  currentCurrency === currency.code ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold">{currency.symbol}</span>
                  <div className="text-left">
                    <div className="font-medium">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    1 INR = {currencyService.formatPrice(1, currency.code)}
                  </div>
                </div>
                {currentCurrency === currency.code && (
                  <CheckIcon className="w-4 h-4 text-black ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
