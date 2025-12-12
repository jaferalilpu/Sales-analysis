'use client';

import { useState, useEffect } from 'react';
import { StarIcon, CheckIcon, XMarkIcon, EyeIcon } from '@/components/ui/icons';

interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, isApproved: true }
            : review
        ));
      }
    } catch (error) {
      
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, isApproved: false }
            : review
        ));
      }
    } catch (error) {
      
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      }
    } catch (error) {
      
    }
  };

  const filteredReviews = reviews.filter(review => {
    switch (filter) {
      case 'pending':
        return !review.isApproved;
      case 'approved':
        return review.isApproved;
      case 'rejected':
        return review.isApproved === false;
      default:
        return true;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
            Reviews Management
          </h1>
          <p className="text-gray-600 mt-2 text-lg" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Moderate customer reviews, ratings, and feedback
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 rounded-xl border border-yellow-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-base text-yellow-600 font-medium" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                Pending Reviews
              </span>
              <span className="text-2xl font-bold text-yellow-700" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                {reviews.filter(r => !r.isApproved).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Reviews', count: reviews.length },
            { key: 'pending', label: 'Pending', count: reviews.filter(r => !r.isApproved).length },
            { key: 'approved', label: 'Approved', count: reviews.filter(r => r.isApproved).length },
            { key: 'rejected', label: 'Rejected', count: reviews.filter(r => r.isApproved === false).length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            No reviews found
          </h3>
          <p className="text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {filter === 'all' 
              ? 'No reviews have been submitted yet.'
              : `No ${filter} reviews found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      by {review.userName}
                    </span>
                    {review.isVerified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {review.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      Product: {review.productName}
                    </span>
                    <span style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!review.isApproved ? (
                    <>
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                        style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Review"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {reviews.length}
          </div>
          <div className="text-sm text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Total Reviews
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Average Rating
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {reviews.filter(r => !r.isApproved).length}
          </div>
          <div className="text-sm text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Pending Approval
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            {reviews.filter(r => r.isApproved).length}
          </div>
          <div className="text-sm text-gray-600" style={{fontFamily: 'Helvetica Neue, Arial, sans-serif'}}>
            Approved Reviews
          </div>
        </div>
      </div>
    </div>
  );
}
