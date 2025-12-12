'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon } from '@/components/ui/icons';
import { useGlobalLoading } from '@/app/providers';
import { showToast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Product } from '@/types/product';
import { ApiResponse } from '@/types/api';
import { getErrorMessage } from '@/types/common';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showLoading, hideLoading } = useGlobalLoading();
  const confirmDialog = useConfirmDialog();

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filterActive !== 'all' && { status: filterActive === 'active' ? 'active' : 'inactive' }),
      });
      const res = await fetch(`/api/admin/products?${params}`);
      const data: ApiResponse<{
        products: Product[];
        pagination: { pages: number };
      }> = await res.json();
      if (data.success && data.data) {
        setProducts(data.data.products || []);
        setTotalPages(data.data.pagination?.pages || 1);
      } else {
        showToast.error(data.error || 'Failed to fetch products.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showToast.error('Failed to fetch products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, filterActive]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      showLoading('Deleting product...');
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
        showToast.success('Product deleted.');
      } else {
        showToast.error('Failed to delete product.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showToast.error('Failed to delete product.');
    } finally {
      hideLoading();
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      showLoading('Updating product...');
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (res.ok) {
        fetchProducts();
        showToast.success(`Product ${product.isActive ? 'disabled' : 'enabled'}.`);
      } else {
        showToast.error('Failed to update product.');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      showToast.error('Failed to update product.');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const primaryImage = Array.isArray(product.images) && product.images.length > 0
                    ? (typeof product.images[0] === 'string' ? { url: product.images[0] } : product.images[0])
                    : undefined;
                  const totalStock =
                    product.variants?.reduce((sum, variant) => sum + (variant.stockQty ?? 0), 0) || 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <Image 
                              src={primaryImage.url} 
                              alt={product.title || 'Product image'} 
                              width={48}
                              height={48}
                              className="object-cover rounded"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            {product.isFeatured && (
                              <span className="text-xs text-blue-600">Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{totalStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
}
