'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  User,
  Calendar,
  Package,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { SubscriptionReview, Product } from '@/lib/firebase';
import { 
  getSubscriptionReviews, 
  updateSubscriptionReview, 
  deleteSubscriptionReview,
  getProducts,
  getProductAverageRating,
  updateProductReviewStats,
  updateAllProductsReviewStats
} from '@/lib/database';

interface ReviewsTabProps {
  onReviewsCountChange?: (count: number) => void;
}

export default function ReviewsTab({ onReviewsCountChange }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<SubscriptionReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<SubscriptionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<SubscriptionReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionMenuReview, setActionMenuReview] = useState<string | null>(null);
  const [updatingReview, setUpdatingReview] = useState<string | null>(null);
  const [updatingAllStats, setUpdatingAllStats] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, statusFilter, ratingFilter, productFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, productsData] = await Promise.all([
        getSubscriptionReviews(),
        getProducts()
      ]);
      
      setReviews(reviewsData);
      setProducts(productsData);
      onReviewsCountChange?.(reviewsData.length);
    } catch (error) {
      console.error('Error loading reviews data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter(review => review.productId === productFilter);
    }

    setFilteredReviews(filtered);
  };

  const handleStatusUpdate = async (reviewId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      setUpdatingReview(reviewId);
      await updateSubscriptionReview(reviewId, { status: newStatus });
      
      // Find the review to get product ID
      const review = reviews.find(r => r.id === reviewId);
      
      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId ? { ...review, status: newStatus } : review
      ));
      
      // Update product stats if status changed to/from approved
      if (review && (newStatus === 'approved' || review.status === 'approved')) {
        await updateProductReviewStats(review.productId);
      }
      
      setActionMenuReview(null);
    } catch (error) {
      console.error('Error updating review status:', error);
    } finally {
      setUpdatingReview(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;

    try {
      setUpdatingReview(reviewId);
      
      // Find the review to get product ID
      const review = reviews.find(r => r.id === reviewId);
      
      await deleteSubscriptionReview(reviewId);
      
      // Update local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setActionMenuReview(null);
      
      // Update product stats if deleted review was approved
      if (review && review.status === 'approved') {
        await updateProductReviewStats(review.productId);
      }
      
      onReviewsCountChange?.(reviews.length - 1);
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setUpdatingReview(null);
    }
  };

  const handleUpdateAllStats = async () => {
    try {
      setUpdatingAllStats(true);
      await updateAllProductsReviewStats();
      alert('تم تحديث إحصائيات جميع المنتجات بنجاح!');
    } catch (error) {
      console.error('Error updating all products stats:', error);
      alert('حدث خطأ في تحديث الإحصائيات');
    } finally {
      setUpdatingAllStats(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStats = () => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    const averageRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    return { total, approved, pending, rejected, averageRating };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white/60 mr-3">جارِ تحميل التقييمات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">إدارة التقييمات</h2>
          <p className="text-white/60 mt-1">إدارة وتنظيم تقييمات العملاء للاشتراكات</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
        <button
          onClick={handleUpdateAllStats}
          disabled={updatingAllStats}
          className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${updatingAllStats ? 'animate-spin' : ''}`} />
          تحديث إحصائيات المنتجات
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">إجمالي التقييمات</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
            <Star className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">موافق عليها</p>
              <p className="text-white text-2xl font-bold">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">معلقة</p>
              <p className="text-white text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">متوسط التقييم</p>
              <p className="text-white text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في التقييمات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="approved">موافق عليه</option>
            <option value="rejected">مرفوض</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">جميع التقييمات</option>
            <option value="5">5 نجوم</option>
            <option value="4">4 نجوم</option>
            <option value="3">3 نجوم</option>
            <option value="2">2 نجوم</option>
            <option value="1">1 نجمة</option>
          </select>

          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">جميع المنتجات</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            التقييمات ({filteredReviews.length})
          </h3>
        </div>

        <div className="divide-y divide-white/10">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{review.title}</h4>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-white/60">{review.rating}/5</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
                        {getStatusLabel(review.status)}
                      </span>
                    </div>

                    <p className="text-white/80 text-sm mb-3 line-clamp-2">{review.comment}</p>

                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{review.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{review.productName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                      {review.isVerified && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>عميل موثق</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowReviewModal(true);
                      }}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setActionMenuReview(actionMenuReview === review.id ? null : review.id)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                        title="المزيد"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuReview === review.id && (
                        <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            {review.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(review.id, 'approved')}
                                  disabled={updatingReview === review.id}
                                  className="w-full px-4 py-2 text-right text-sm text-green-600 hover:bg-green-50 flex items-center transition-colors disabled:opacity-50"
                                >
                                  {updatingReview === review.id ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                                      جاري الموافقة...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 ml-2" />
                                      الموافقة على التقييم
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                  disabled={updatingReview === review.id}
                                  className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors disabled:opacity-50"
                                >
                                  <X className="w-4 h-4 ml-2" />
                                  رفض التقييم
                                </button>
                              </>
                            )}
                            {review.status === 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                disabled={updatingReview === review.id}
                                className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors disabled:opacity-50"
                              >
                                <X className="w-4 h-4 ml-2" />
                                رفض التقييم
                              </button>
                            )}
                            {review.status === 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(review.id, 'approved')}
                                disabled={updatingReview === review.id}
                                className="w-full px-4 py-2 text-right text-sm text-green-600 hover:bg-green-50 flex items-center transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4 ml-2" />
                                الموافقة على التقييم
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={updatingReview === review.id}
                              className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف التقييم
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Star className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">لا توجد تقييمات</h3>
              <p className="text-white/60">لم يتم العثور على تقييمات تطابق معايير البحث</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">تفاصيل التقييم</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedReview.title}</h3>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating, 'md')}
                    <span className="text-sm text-gray-600">{selectedReview.rating}/5</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedReview.status)}`}>
                    {getStatusLabel(selectedReview.status)}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedReview.comment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">العميل:</span>
                    <span className="text-gray-600 mr-2">{selectedReview.customerName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">المنتج:</span>
                    <span className="text-gray-600 mr-2">{selectedReview.productName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">تاريخ التقييم:</span>
                    <span className="text-gray-600 mr-2">{formatDate(selectedReview.createdAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">العميل موثق:</span>
                    <span className={`mr-2 ${selectedReview.isVerified ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedReview.isVerified ? 'نعم' : 'لا'}
                    </span>
                  </div>
                </div>

                {selectedReview.helpful > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{selectedReview.helpful} شخص وجد هذا التقييم مفيداً</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
