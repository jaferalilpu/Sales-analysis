'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@/components/ui/icons';
import { i18n, type Language } from '@/lib/i18n';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export function LanguageSelector({ className = '', showLabel = true }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18n.getCurrentLanguage());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supportedLanguages = i18n.getSupportedLanguages();

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

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    i18n.setLanguage(language);
    setIsOpen(false);
    
    // Reload the page to apply language changes
    window.location.reload();
  };

  const currentLanguageConfig = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
      >
        {showLabel && (
          <span className="text-gray-500">Language:</span>
        )}
        <span className="text-lg">{currentLanguageConfig?.flag}</span>
        <span>{currentLanguageConfig?.nativeName}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 ${
                  currentLanguage === language.code ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <CheckIcon className="w-4 h-4 text-black" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
