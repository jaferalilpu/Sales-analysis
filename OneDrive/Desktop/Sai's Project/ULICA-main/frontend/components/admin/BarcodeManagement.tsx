'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { QrCode, Download, Printer, Search, Filter, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  sku: string;
  barcodeUrl?: string;
  category: string;
  status: string;
  variants: Array<{
    id: string;
    sku: string;
    variantSku?: string;
    barcodeUrl?: string;
    attributes: string;
  }>;
}

interface BarcodeFilters {
  category: string;
  status: string;
  search: string;
}

const BarcodeManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filters, setFilters] = useState<BarcodeFilters>({
    category: '',
    status: '',
    search: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [generatingBarcodes, setGeneratingBarcodes] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?includeVariants=true', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        
        setProducts([]);
      }
    } catch (error) {
      
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/sku/category-codes', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.map((cat: { category: string }) => cat.category));
      }
    } catch (error) {
      
    }
  };

  const filterProducts = useCallback(() => {
    let filtered = Array.isArray(products) ? products : [];

    if (filters.search) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const generateBarcode = async (productId: string, type: 'product' | 'variant', variantId?: string) => {
    setGeneratingBarcodes(prev => [...prev, productId]);
    
    try {
      const endpoint = type === 'product' 
        ? `/api/sku/${productId}/generate-barcode`
        : `/api/sku/variant/${variantId}/generate-barcode`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        await fetchProducts(); // Refresh products
      }
    } catch (error) {
      
    } finally {
      setGeneratingBarcodes(prev => prev.filter(id => id !== productId));
    }
  };

  const downloadBarcode = async (sku: string, format: 'png' | 'svg' = 'png') => {
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

  const downloadBulkBarcodes = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      const response = await fetch('/api/sku/bulk-barcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productIds: selectedProducts,
          format: 'png'
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'barcodes.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(Array.isArray(filteredProducts) ? filteredProducts.map(p => p.id) : []);
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
          Barcode Management
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchProducts}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {selectedProducts.length > 0 && (
            <button
              onClick={downloadBulkBarcodes}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Selected ({selectedProducts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Search products or SKUs..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ category: '', status: '', search: '' })}
              className="w-full px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={selectAllProducts}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Clear Selection
          </button>
          <span className="text-sm text-gray-500">
            {selectedProducts.length} selected
          </span>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === (Array.isArray(filteredProducts) ? filteredProducts.length : 0) && (Array.isArray(filteredProducts) ? filteredProducts.length : 0) > 0}
                    onChange={selectedProducts.length === (Array.isArray(filteredProducts) ? filteredProducts.length : 0) ? clearSelection : selectAllProducts}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                <React.Fragment key={product.id}>
                  {/* Product Row */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {product.sku || 'No SKU'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.barcodeUrl ? (
                        <div className="h-8 relative w-auto">
                          <Image
                            src={product.barcodeUrl}
                            alt={`Barcode for ${product.sku}`}
                            width={120}
                            height={32}
                            className="h-8 w-auto object-contain"
                            unoptimized={product.barcodeUrl.startsWith('blob:') || product.barcodeUrl.startsWith('data:')}
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No barcode</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!product.barcodeUrl && (
                          <button
                            onClick={() => generateBarcode(product.id, 'product')}
                            disabled={generatingBarcodes.includes(product.id)}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          >
                            {generatingBarcodes.includes(product.id) ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <QrCode className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {product.barcodeUrl && product.sku && (
                          <>
                            <button
                              onClick={() => downloadBarcode(product.sku!, 'png')}
                              className="text-green-600 hover:text-green-900"
                              title="Download PNG"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadBarcode(product.sku!, 'svg')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Download SVG"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Variants Rows */}
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap pl-12">
                        <div className="text-xs text-gray-500">Variant</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap pl-12">
                        <div className="text-sm text-gray-600">
                          {JSON.parse(variant.attributes || '{}').size} - {JSON.parse(variant.attributes || '{}').color}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600">
                          {variant.variantSku || variant.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {variant.barcodeUrl ? (
                          <div className="h-6 relative w-auto">
                            <Image
                              src={variant.barcodeUrl}
                              alt={`Barcode for ${variant.variantSku || variant.sku}`}
                              width={100}
                              height={24}
                              className="h-6 w-auto object-contain"
                              unoptimized={variant.barcodeUrl.startsWith('blob:') || variant.barcodeUrl.startsWith('data:')}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No barcode</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {!variant.barcodeUrl && (
                            <button
                              onClick={() => generateBarcode(product.id, 'variant', variant.id)}
                              disabled={generatingBarcodes.includes(product.id)}
                              className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                            >
                              {generatingBarcodes.includes(product.id) ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <QrCode className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {variant.barcodeUrl && (variant.variantSku || variant.sku) && (
                            <>
                              <button
                                onClick={() => downloadBarcode(variant.variantSku || variant.sku, 'png')}
                                className="text-green-600 hover:text-green-900"
                                title="Download PNG"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => downloadBarcode(variant.variantSku || variant.sku, 'svg')}
                                className="text-blue-600 hover:text-blue-900"
                                title="Download SVG"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!Array.isArray(filteredProducts) || filteredProducts.length === 0) && (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or add some products first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeManagement;
