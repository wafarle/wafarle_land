'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SubscriptionReview, Subscription } from '@/lib/firebase';
import { 
  addSubscriptionReview, 
  getCustomerReviews, 
  updateSubscriptionReview, 
  deleteSubscriptionReview,
  canCustomerReviewSubscription 
} from '@/lib/database';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  customerEmail: string;
  customerName: string;
  onReviewAdded: (rating: number) => void;
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  subscription, 
  customerEmail, 
  customerName,
  onReviewAdded 
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canReview, setCanReview] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkReviewEligibility();
    }
  }, [isOpen, subscription.id, customerEmail]);

  const checkReviewEligibility = async () => {
    try {
      const eligible = await canCustomerReviewSubscription(customerEmail, subscription.id);
      setCanReview(eligible);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !comment.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // SubscriptionReview only has: subscriptionId, customerId, customerName, rating, comment, isApproved
      await addSubscriptionReview({
        subscriptionId: subscription.id,
        customerId: customerEmail,
        customerName: customerName,
        rating: rating,
        comment: comment.trim(),
        isApproved: false // Pending approval
      });

      // Reset form
      const submittedRating = rating;
      setRating(5);
      setTitle('');
      setComment('');
      
      onReviewAdded(submittedRating);
      onClose();
    } catch (error: any) {
      console.error('Error adding review:', error);
      setError(error.message || 'حدث خطأ في إضافة التقييم');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">تقييم الاشتراك</h2>
              <p className="text-sm text-gray-600 mt-1">{subscription.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {!canReview ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يمكنك تقييم هذا الاشتراك</h3>
              <p className="text-gray-600">
                إما أنك قمت بتقييمه مسبقاً أو لا تملك هذا الاشتراك
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  التقييم *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        star <= rating
                          ? 'text-yellow-400 bg-yellow-50'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 1 && 'سيء جداً'}
                  {rating === 2 && 'سيء'}
                  {rating === 3 && 'متوسط'}
                  {rating === 4 && 'جيد'}
                  {rating === 5 && 'ممتاز'}
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان التقييم *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="اكتب عنواناً مختصراً لتقييمك"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التعليق *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="شاركنا تجربتك مع هذا الاشتراك..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700"
                >
                  <AlertCircle className="w-5 h-5 ml-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !comment.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 ml-2" />
                      إرسال التقييم
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Review List Component
interface ReviewListProps {
  reviews: SubscriptionReview[];
  onEdit?: (review: SubscriptionReview) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
}

export function ReviewList({ reviews, onEdit, onDelete, showActions = false }: ReviewListProps) {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقييمات</h3>
        <p className="text-gray-600">كن أول من يقيم هذا الاشتراك</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">{review.rating}/5</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{review.customerName}</span>
                <span>•</span>
                <span>{formatDate(review.createdAt)}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  review.isApproved === true ? 'bg-green-100 text-green-800' :
                  review.isApproved === false ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {review.isApproved === true ? 'موافق عليه' :
                   review.isApproved === false ? 'مرفوض' : 'قيد المراجعة'}
                </span>
              </div>
            </div>
            
            {showActions && (
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(review)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 rounded-lg"
                    title="تعديل التقييم"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(review.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 rounded-lg"
                    title="حذف التقييم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="text-gray-700">
            {review.comment.length > 150 && !expandedReviews.has(review.id) ? (
              <>
                <p>{review.comment.substring(0, 150)}...</p>
                <button
                  onClick={() => toggleExpanded(review.id)}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                >
                  اقرأ المزيد
                </button>
              </>
            ) : (
              <p>{review.comment}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
