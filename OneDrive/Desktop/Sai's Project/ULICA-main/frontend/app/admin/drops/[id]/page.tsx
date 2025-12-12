'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
} from '@/components/ui/icons';
import { showToast } from '@/lib/toast';

interface Drop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended' | 'archived';
  purchaseLimitPerCustomer?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  dropProducts: Array<{
    product: {
      id: string;
      name?: string;
      title?: string;
      slug?: string;
      images?: Array<{
        url: string;
        altText?: string;
      }>;
    };
  }>;
  _count: {
    dropProducts: number;
    dropPurchases: number;
  };
}

export default function DropViewPage() {
  const router = useRouter();
  const params = useParams();
  const dropId = params.id as string;
  
  const [drop, setDrop] = useState<Drop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrop = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/drops/${dropId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const dropData: Drop = data.data?.drop || data.data || data.drop;
        if (dropData) {
          setDrop(dropData);
        } else {
          
          showToast.error('Drop not found.');
          router.push('/admin/drops');
        }
      } else {
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        
        showToast.error(`Failed to load drop: ${errorMessage}`);
        router.push('/admin/drops');
      }
    } catch (error) {
      
      showToast.error(
        `Failed to load drop: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      router.push('/admin/drops');
    } finally {
      setIsLoading(false);
    }
  }, [dropId, router]);

  useEffect(() => {
    fetchDrop();
  }, [fetchDrop]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ClockIcon, label: 'Upcoming' },
      live: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon, label: 'Live' },
      ended: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon, label: 'Ended' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: ArchiveBoxIcon, label: 'Archived' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black dark:border-white"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading drop...</p>
        </div>
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center text-gray-600 dark:text-gray-300">Drop not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{drop.name}</h1>
            <p className="text-gray-600 mt-1">Drop Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(drop.status)}
          <Link
            href={`/admin/drops/${drop.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
            Edit Drop
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image */}
          {drop.bannerImage && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative w-full h-64">
              <Image
                src={drop.bannerImage}
                alt={drop.name}
                fill
                sizes="100vw"
                className="object-cover"
                unoptimized={drop.bannerImage.startsWith('blob:') || drop.bannerImage.startsWith('data:')}
              />
            </div>
          )}

          {/* Description */}
          {drop.description && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{drop.description}</p>
            </div>
          )}

          {/* Products */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Products ({drop._count.dropProducts})
            </h2>
            {drop.dropProducts && drop.dropProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drop.dropProducts.map((dropProduct) => {
                  const product = dropProduct.product;
                  const productName = product.title || product.name || 'Unknown Product';
                  const productImage = product.images?.[0]?.url;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug || product.id}`}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {productImage ? (
                        <div className="h-16 w-16 relative rounded-lg overflow-hidden">
                          <Image
                            className="object-cover"
                            src={productImage}
                            alt={productName}
                            width={64}
                            height={64}
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <TagIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {productName}
                        </p>
                        <p className="text-xs text-gray-500">View Product →</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No products assigned to this drop</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(drop.startDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(drop.endDate).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Purchase Limit</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {drop.purchaseLimitPerCustomer || 'No limit'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Published</dt>
                <dd className="mt-1">
                  {drop.isPublished ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Draft
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Purchases</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {drop._count.dropPurchases || 0}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(drop.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(drop.updatedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {drop.slug}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

