'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface BarcodePreviewProps {
  sku: string;
  title?: string;
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const BarcodePreview: React.FC<BarcodePreviewProps> = ({
  sku,
  title,
  showTitle = true,
  size = 'medium',
  className = ''
}) => {
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const sizeClasses = {
    small: 'h-16',
    medium: 'h-24',
    large: 'h-32'
  };

  const generateBarcode = useCallback(async () => {
    if (!sku) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sku/${sku}/barcode?format=png&scale=2`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBarcodeUrl(url);
      } else {
        setError('Failed to generate barcode');
      }
    } catch (error) {
      
      setError('Failed to generate barcode');
    } finally {
      setLoading(false);
    }
  }, [sku]);

  useEffect(() => {
    if (sku && showPreview) {
      generateBarcode();
    }
  }, [sku, showPreview, generateBarcode]);

  const downloadBarcode = async (format: 'png' | 'svg' = 'png') => {
    if (!sku) return;
    
    try {
      const response = await fetch(`/api/sku/${sku}/barcode?format=${format}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sku}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      
    }
  };

  if (!sku) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <span className="text-gray-500 text-sm">No SKU provided</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            {title || 'Barcode Preview'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={generateBarcode}
              disabled={loading}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
              title="Regenerate barcode"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}
      
      {showPreview && (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center space-y-3 ${sizeClasses[size]}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-red-500 text-sm mb-2">{error}</span>
              <button
                onClick={generateBarcode}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Try again
              </button>
            </div>
          ) : barcodeUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-full h-full max-h-full max-w-full">
                <Image
                  src={barcodeUrl}
                  alt={`Barcode for ${sku}`}
                  width={200}
                  height={100}
                  className="max-h-full max-w-full object-contain"
                  unoptimized={barcodeUrl.startsWith('blob:')}
                />
              </div>
              <div className="text-xs font-mono text-gray-600">{sku}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500 text-sm">No barcode available</span>
            </div>
          )}
        </div>
      )}
      
      {showPreview && barcodeUrl && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => downloadBarcode('png')}
            className="flex items-center space-x-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>PNG</span>
          </button>
          <button
            onClick={() => downloadBarcode('svg')}
            className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>SVG</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodePreview;
