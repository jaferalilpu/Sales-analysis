'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
} from '@/components/ui/icons';
import { useGlobalLoading } from '@/app/providers';
import { showToast } from '@/lib/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

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
      title: string;
      slug: string;
      images: Array<{
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

export default function AdminDropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const { showLoading, hideLoading } = useGlobalLoading();
  const confirmDialog = useConfirmDialog();

  const fetchDrops = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/drops?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDrops(data.data.drops);
        setTotalPages(data.data.pagination.pages);
      } else {
        showToast.error('Failed to fetch drops.');
      }
    } catch (error) {
      
      showToast.error('Failed to fetch drops.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchDrops();
  }, [fetchDrops]);

  const handleDeleteDrop = async (dropId: string) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Delete Drop',
      message: 'Are you sure you want to delete this drop? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      showLoading('Deleting drop...');
      const response = await fetch(`/api/admin/drops/${dropId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDrops(drops.filter(drop => drop.id !== dropId));
        showToast.success('Drop deleted.');
      } else {
        showToast.error('Failed to delete drop.');
      }
    } catch (error) {
      
      showToast.error('Failed to delete drop.');
    } finally {
      hideLoading();
    }
  };

  const handleStatusChange = async (dropId: string, newStatus: string) => {
    try {
      showLoading('Updating drop status...');
      const response = await fetch(`/api/admin/drops/${dropId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDrops(); // Refresh the list
        showToast.success('Drop status updated.');
      } else {
        showToast.error('Failed to update drop status.');
      }
    } catch (error) {
      
      showToast.error('Failed to update drop status.');
    } finally {
      hideLoading();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      live: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      ended: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      archived: { color: 'bg-gray-100 text-gray-800', icon: ArchiveBoxIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDrops = drops.filter(drop =>
    drop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Drops Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Create and manage product drops, limited-time collections, and exclusive releases
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/drops/new"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 rounded-xl hover:from-gray-800 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl text-base font-medium hover:scale-105"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create New Drop</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Upcoming
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {drops.filter(d => d.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl shadow-sm">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Live
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {drops.filter(d => d.status === 'live').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-xl shadow-sm">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Ended
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {drops.filter(d => d.status === 'ended').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-xl shadow-sm">
              <ArchiveBoxIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Archived
              </p>
              <p className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {drops.filter(d => d.status === 'archived').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Filters & Search
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Drops Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Drop
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrops.map((drop) => (
                <tr key={drop.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {drop.bannerImage && (
                        <div className="flex-shrink-0 h-12 w-12 mr-4 relative">
                          <Image
                            className="rounded-lg object-cover shadow-sm"
                            src={drop.bannerImage}
                            alt={drop.name}
                            width={48}
                            height={48}
                            unoptimized={drop.bannerImage.startsWith('blob:') || drop.bannerImage.startsWith('data:')}
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          {drop.name}
                        </div>
                        <div className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                          {drop.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(drop.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {new Date(drop.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {new Date(drop.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {drop._count.dropProducts} products
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/drops/${drop.id}/edit`}
                        className="inline-flex items-center p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        title="Edit Drop"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/drops/${drop.id}`}
                        className="inline-flex items-center p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="View Drop"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDrop(drop.id)}
                        className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Drop"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDrops.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TagIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              No drops found
            </h3>
            <p className="text-gray-500 mb-6" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
              {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Get started by creating your first drop'}
            </p>
            {!searchTerm && !statusFilter && (
              <Link
                href="/admin/drops/new"
                className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors duration-200"
                style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create New Drop</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
