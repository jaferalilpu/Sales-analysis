'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

interface SkuGeneratorProps {
  category: string;
  onSkuGenerated: (sku: string) => void;
  initialSku?: string;
  disabled?: boolean;
}

const SkuGenerator: React.FC<SkuGeneratorProps> = ({
  category,
  onSkuGenerated,
  initialSku = '',
  disabled = false
}) => {
  const [sku, setSku] = useState(initialSku);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSku = useCallback(async () => {
    if (!category || disabled) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/sku/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ category })
      });
      
      const data = await response.json();
      if (data.success) {
        const newSku = data.data.sku;
        setSku(newSku);
        onSkuGenerated(newSku);
      }
    } catch (error) {
      
    } finally {
      setIsGenerating(false);
    }
  }, [category, disabled, onSkuGenerated]);

  useEffect(() => {
    if (category && !initialSku) {
      generateSku();
    }
  }, [category, initialSku, generateSku]);

  useEffect(() => {
    setSku(initialSku);
  }, [initialSku]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      
    }
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSku = e.target.value;
    setSku(newSku);
    onSkuGenerated(newSku);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        SKU
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={sku}
          onChange={handleSkuChange}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
          placeholder="Auto-generated SKU will appear here"
        />
        <button
          type="button"
          onClick={generateSku}
          disabled={!category || isGenerating || disabled}
          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Generate new SKU"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
        {sku && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Copy SKU"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500">
        SKU format: ULI-CAT-0001 (Brand-Category-Number)
      </p>
    </div>
  );
};

export default SkuGenerator;
