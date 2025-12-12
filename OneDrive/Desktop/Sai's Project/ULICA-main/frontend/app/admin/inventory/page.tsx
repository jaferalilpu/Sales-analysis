'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, ExclamationTriangleIcon, PencilIcon } from '@/components/ui/icons';
import { useGlobalLoading } from '@/app/providers';
import { showToast } from '@/lib/toast';

interface InventoryItem {
  variantId: string;
  productId: string;
  productName: string;
  productSku?: string | null;
  variantName?: string | null;
  sku: string;
  currentStock: number;
  lowStockThreshold?: number | null;
  price: number;
  image?: string | null;
  options?: Record<string, unknown> | string;
  isLowStock?: boolean;
}

const DEFAULT_LOW_STOCK_THRESHOLD = Number(process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD ?? 5);

function formatVariantLabel(item: InventoryItem) {
  if (item.variantName) {
    return item.variantName;
  }

  if (!item.options) {
    return '-';
  }

  let parsedOptions: Record<string, unknown> | null = null;

  if (typeof item.options === 'string') {
    try {
      parsedOptions = JSON.parse(item.options);
    } catch {
      return item.options;
    }
  } else if (typeof item.options === 'object') {
    parsedOptions = item.options as Record<string, unknown>;
  }

  if (!parsedOptions) {
    return '-';
  }

  const entries = Object.entries(parsedOptions)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${value}`);

  return entries.length > 0 ? entries.join(', ') : '-';
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const { showLoading, hideLoading } = useGlobalLoading();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: '200',
      });

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      if (showLowStockOnly) {
        params.set('lowStockOnly', 'true');
      }

      const res = await fetch(`/api/admin/inventory?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();

      if (res.ok && data.success) {
        const items: InventoryItem[] = (data.data?.items ?? []).map((item: {
          variantId: string;
          productId: string;
          productName: string;
          productSku?: string | null;
          variantName?: string | null;
          sku: string;
          stockQty: number;
          lowStockThreshold?: number | null;
          price: number;
          image?: string | null;
          options?: Record<string, unknown> | string;
          isLowStock?: boolean;
        }) => ({
          variantId: item.variantId,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          variantName: item.variantName,
          sku: item.sku,
          currentStock: item.stockQty,
          lowStockThreshold: item.lowStockThreshold,
          price: item.price,
          image: item.image,
          options: item.options,
          isLowStock: item.isLowStock,
        }));

        setInventory(items);
      } else {
        showToast.error(data.error || 'Failed to fetch inventory.');
      }
    } catch (error) {
      
      showToast.error('Failed to fetch inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, showLowStockOnly]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleStockUpdate = async (item: InventoryItem, newStock: number) => {
    try {
      const safeStock = Math.max(0, newStock);
      showLoading('Updating stock...');

      const res = await fetch(`/api/admin/inventory/${item.variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockQty: safeStock,
          reason: 'Manual adjustment via admin inventory',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await fetchInventory();
        setEditingId(null);
        showToast.success('Stock updated.');
      } else {
        showToast.error(data.error || 'Failed to update stock.');
      }
    } catch (error) {
      
      showToast.error('Failed to update stock. Please try again.');
    } finally {
      hideLoading();
    }
  };

  const filteredInventory = useMemo(() => {
    const term = debouncedSearch.toLowerCase();

    return inventory.filter((item) => {
      const threshold = item.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
      const matchesSearch =
        !term ||
        item.productName.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        (item.variantName?.toLowerCase().includes(term) ?? false);
      const matchesLowStock = showLowStockOnly
        ? item.isLowStock ?? item.currentStock <= threshold
        : true;

      return matchesSearch && matchesLowStock;
    });
  }, [inventory, debouncedSearch, showLowStockOnly]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => {
      const threshold = item.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
      return item.isLowStock ?? item.currentStock <= threshold;
    });
  }, [inventory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage product stock levels</p>
        </div>
        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {lowStockItems.length} item{lowStockItems.length === 1 ? '' : 's'} low in stock
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, SKU, or variant..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(event) => setShowLowStockOnly(event.target.checked)}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">Show low stock only</span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No inventory items found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const threshold = item.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
                  const isLowStock = item.isLowStock ?? item.currentStock <= threshold;
                  const isEditing = editingId === item.variantId;

                  return (
                    <tr
                      key={item.variantId}
                      className={`hover:bg-gray-50 ${isLowStock ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <div className="w-12 h-12 relative rounded overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.productName}
                                width={48}
                                height={48}
                                className="object-cover"
                                unoptimized={item.image.startsWith('blob:') || item.image.startsWith('data:')}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {item.productName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatVariantLabel(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editStock}
                              onChange={(event) => {
                                const value = Number.parseInt(event.target.value, 10);
                                setEditStock(Number.isNaN(value) ? 0 : value);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                            <button
                              onClick={() => handleStockUpdate(item, editStock)}
                              className="px-2 py-1 bg-black text-white text-xs rounded hover:bg-gray-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`text-sm font-medium ${
                              isLowStock ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {item.currentStock}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!isEditing && (
                          <button
                            onClick={() => {
                              setEditingId(item.variantId);
                              setEditStock(item.currentStock);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Stock"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
