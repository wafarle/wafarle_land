'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  ShoppingBag,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  LogOut,
  ArrowRight,
  Zap,
  Star,
  TrendingUp,
  Activity,
  Bell,
  CreditCard,
  Eye,
  Download,
  AlertCircle,
  Truck,
  MapPin,
  FileText,
  Receipt,
  Crown,
  Coins,
  RotateCcw,
  Gift
} from 'lucide-react';
import { onCustomerAuthStateChange, signOutCustomer, CustomerUser } from '@/lib/customerAuth';
import { getOrders, getProducts, getCustomerSubscriptions, subscribeToCustomerSubscriptions, getCustomerReviews, updateSubscriptionReview, deleteSubscriptionReview, subscribeToOrders, downloadInvoicePDF, getCustomers, updateOrder, getDiscountCodes } from '@/lib/database';
import { Order, Product, Subscription, SubscriptionReview } from '@/lib/firebase';
import { useFormatPrice } from '@/contexts/CurrencyContext';
import { 
  getSubscriptionStatusColor, 
  getSubscriptionStatusLabel, 
  isSubscriptionExpiringSoon, 
  calculateRemainingDays 
} from '@/lib/database';
import LiveChat from '@/components/customer/LiveChat';
import ReviewModal, { ReviewList } from '@/components/customer/ReviewModal';
import EditReviewModal from '@/components/customer/EditReviewModal';
import SubscriptionManagementModal from '@/components/customer/SubscriptionManagementModal';
import ShippingTrackingModal from '@/components/customer/ShippingTrackingModal';
import ReviewInviteModal from '@/components/customer/ReviewInviteModal';
import ReturnRequestModal from '@/components/customer/ReturnRequestModal';
import { useSettings } from '@/contexts/SettingsContext';

export default function CustomerDashboard() {
  const router = useRouter();
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reviews, setReviews] = useState<SubscriptionReview[]>([]);
  const [showIndexWarning, setShowIndexWarning] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editingReview, setEditingReview] = useState<SubscriptionReview | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false);
  const [selectedSubscriptionForManagement, setSelectedSubscriptionForManagement] = useState<Subscription | null>(null);
  const [showShippingTrackingModal, setShowShippingTrackingModal] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [showReviewInvite, setShowReviewInvite] = useState(false);
  const [showReviewInviteWithCode, setShowReviewInviteWithCode] = useState(false);
  const [showReturnRequestModal, setShowReturnRequestModal] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const { formatPrice } = useFormatPrice();
  const { settings } = useSettings();

  // Check authentication
  useEffect(() => {
    const unsubscribe = onCustomerAuthStateChange((user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setCustomerUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Load customer orders
  useEffect(() => {
    if (customerUser) {
      loadCustomerData();
      
      // Subscribe to real-time order updates
      const unsubscribe = subscribeToOrders((allOrders) => {
        if (customerUser?.email) {
          const customerOrders = allOrders.filter(order => 
            order.customerEmail.toLowerCase() === customerUser.email.toLowerCase()
          );
          setOrders(customerOrders);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [customerUser]);

  // Check for review invite when settings are loaded and reviews are loaded
  useEffect(() => {
    if (customerUser && reviews.length === 0 && !loading) {
      const reviewInviteEnabled = settings?.website?.reviewInvite?.enabled ?? true;
      
      if (reviewInviteEnabled) {
        // Check if user has dismissed this before (using localStorage)
        const hasDismissed = typeof window !== 'undefined' ? localStorage.getItem('reviewInviteDismissed') : null;
        const lastShown = typeof window !== 'undefined' ? localStorage.getItem('reviewInviteLastShown') : null;
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        
        const shouldShow = !hasDismissed || (lastShown && (now - parseInt(lastShown)) > 7 * dayInMs);
        
        if (shouldShow && !showReviewInvite && !showReviewInviteWithCode) {
          setTimeout(() => {
            setShowReviewInvite(true);
          }, 2000);
        }
      }
    }
  }, [customerUser, reviews.length, loading, settings?.website?.reviewInvite, showReviewInvite, showReviewInviteWithCode]);

  const loadCustomerData = async () => {
    if (!customerUser?.email) return;

    try {
      // Load customer's orders
      const allOrders = await getOrders();
      const customerOrders = allOrders.filter(order => 
        order.customerEmail.toLowerCase() === customerUser.email.toLowerCase()
      );
      setOrders(customerOrders);

      // Load available products
      const availableProducts = await getProducts();
      setProducts(availableProducts);

      // Load customer's subscriptions
      const customerSubscriptions = await getCustomerSubscriptions(customerUser.email);
      // تصفية الاشتراكات: إزالة المنتجات الملموسة أو التي تحتاج تنزيل
      const filteredSubscriptions = customerSubscriptions.filter(subscription => {
        // البحث عن المنتج المرتبط بهذا الاشتراك
        const product = availableProducts.find(p => p.id === subscription.productId);
        if (!product) return true; // إذا لم نجد المنتج، نعرضه (قديم)
        
        // استبعاد المنتجات الملموسة أو التي تحتاج تنزيل
        const productType = product.productType;
        return productType !== 'physical' && productType !== 'download';
      });
      setSubscriptions(filteredSubscriptions);

      // Load customer's reviews
      const customerReviews = await getCustomerReviews(customerUser.email);
      setReviews(customerReviews);

      // Load customer data for loyalty points
      try {
        const allCustomers = await getCustomers();
        const customer = allCustomers.find(c => c.email.toLowerCase() === customerUser.email.toLowerCase());
        if (customer) {
          setCustomerData(customer);
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
      }
      
      // Note: Review invite check is now handled in useEffect hook below
    } catch (error) {
      console.error('Error loading customer data:', error);
      // Check if it's a Firebase index error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('index') || errorMessage.includes('composite')) {
          setShowIndexWarning(true);
          // Hide warning after 10 seconds
          setTimeout(() => setShowIndexWarning(false), 10000);
        }
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOutCustomer();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle subscription management
  const handleSubscriptionManagement = (subscription: Subscription) => {
    setSelectedSubscriptionForManagement(subscription);
    setShowSubscriptionManagement(true);
  };

  // Close subscription management
  const handleCloseSubscriptionManagement = () => {
    setShowSubscriptionManagement(false);
    setSelectedSubscriptionForManagement(null);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get order status config
  const getOrderStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'بانتظار التأكيد', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  // Get shipping status config
  const getShippingStatusConfig = (status?: string) => {
    const configs = {
      pending_shipping: { label: 'بانتظار الشحن', color: 'bg-gray-100 text-gray-800', icon: Clock },
      prepared: { label: 'تم التحضير', color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: Truck },
      in_transit: { label: 'في الطريق', color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    return configs[status as keyof typeof configs] || configs.pending_shipping;
  };

  // Get payment status config
  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      unpaid: { label: 'غير مدفوع', color: 'bg-red-100 text-red-800' },
      paid: { label: 'مدفوع', color: 'bg-green-100 text-green-800' },
      refunded: { label: 'مسترد', color: 'bg-gray-100 text-gray-800' }
    };
    return configs[status as keyof typeof configs] || configs.unpaid;
  };

  // Get statistics
  const getStats = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalSpent = orders.filter(order => order.paymentStatus === 'paid').reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    return { totalOrders, completedOrders, totalSpent, pendingOrders };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gradient">وفرلي</span>
                <span className="text-xs text-gray-500 block -mt-1">لوحة التحكم</span>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Link 
                href="/customer/profile"
                className="hidden md:flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {customerUser?.displayName || 'العميل'}
                  </div>
                  <div className="text-xs text-gray-500">{customerUser?.email}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </Link>

              <Link
                href="/customer/profile"
                className="md:hidden flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>الملف الشخصي</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                    activeTab === 'overview' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  نظرة عامة
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                    activeTab === 'orders' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  طلباتي
                  {stats.pendingOrders > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-auto">
                      {stats.pendingOrders}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                    activeTab === 'subscriptions' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  اشتراكاتي
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                    activeTab === 'reviews' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  تقييماتي
                </button>

                {settings?.website?.loyaltyProgram?.enabled && (
                  <button
                    onClick={() => setActiveTab('loyalty')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right ${
                      activeTab === 'loyalty' 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                    نقاط الولاء
                    {customerData?.loyaltyPoints && customerData.loyaltyPoints > 0 && (
                      <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-1 mr-auto">
                        {customerData.loyaltyPoints}
                      </span>
                    )}
                  </button>
                )}

                <Link
                  href="/customer/profile"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right hover:bg-gray-50 text-gray-700"
                >
                  <Settings className="w-5 h-5" />
                  الملف الشخصي
                </Link>

                <Link
                  href="/"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-right hover:bg-gray-50 text-gray-700"
                >
                  <ArrowRight className="w-5 h-5" />
                  العودة للرئيسية
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                  <h1 className="text-2xl font-bold mb-2">
                    مرحباً، {customerUser?.displayName || 'العميل'}!
                  </h1>
                  <p className="text-blue-100">إدارة اشتراكاتك وطلباتك بكل سهولة</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg p-6 border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stats.totalOrders}</span>
                    </div>
                    <h3 className="font-medium text-gray-700">إجمالي الطلبات</h3>
                  </div>

                  <div className="bg-white rounded-lg p-6 border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{stats.completedOrders}</span>
                    </div>
                    <h3 className="font-medium text-gray-700">طلبات مكتملة</h3>
                  </div>

                  <div className="bg-white rounded-lg p-6 border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</span>
                    </div>
                    <h3 className="font-medium text-gray-700">إجمالي الإنفاق</h3>
                  </div>

                  {/* Loyalty Points Card */}
                  {settings?.website?.loyaltyProgram?.enabled && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                          <Coins className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                          {customerData?.loyaltyPoints || 0}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-700 mb-1">نقاط الولاء</h3>
                      {customerData?.loyaltyTier && (
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs text-gray-600 capitalize">{customerData.loyaltyTier}</span>
                        </div>
                      )}
                      {settings.website.loyaltyProgram && (
                        <p className="text-xs text-gray-500 mt-2">
                          {customerData?.loyaltyPoints || 0} / {settings.website.loyaltyProgram.redemptionRate} = ${((customerData?.loyaltyPoints || 0) / settings.website.loyaltyProgram.redemptionRate).toFixed(2)} خصم
                        </p>
                      )}
                    </div>
                  )}

                  {!settings?.website?.loyaltyProgram?.enabled && (
                    <div className="bg-white rounded-lg p-6 border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</span>
                      </div>
                      <h3 className="font-medium text-gray-700">طلبات معلقة</h3>
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">آخر الطلبات</h2>
                  </div>
                  <div className="p-6">
                    {orders.slice(0, 3).length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 3).map((order) => {
                          const statusConfig = getOrderStatusConfig(order.status);
                          const StatusIcon = statusConfig.icon;
                          
                          // البحث عن المنتج المرتبط بالطلب
                          const product = products.find(p => p.id === order.productId);
                          const productType = product?.productType || order.productType;
                          const downloadLink = product?.downloadLink || order.downloadLink;
                          const showDownloadButton = (productType === 'download' || productType === 'digital') && downloadLink;
                          const showShippingTracking = productType === 'physical' && product?.requiresShipping;
                          const shippingStatus = order.shippingStatus || 'pending_shipping';
                          const shippingStatusConfig = getShippingStatusConfig(shippingStatus);
                          const ShippingIcon = shippingStatusConfig.icon;
                          
                          return (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{order.productName}</h3>
                                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                  {/* عرض حالة الشحن للمنتجات الملموسة */}
                                  {showShippingTracking && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${shippingStatusConfig.color}`}>
                                        <ShippingIcon className="w-3 h-3 mr-1" />
                                        {shippingStatusConfig.label}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {showShippingTracking && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderForTracking(order);
                                      setShowShippingTrackingModal(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-medium rounded-md shadow-sm hover:shadow transition-all duration-200"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    تتبع الشحن
                                  </button>
                                )}
                                {showDownloadButton && (
                                  <button
                                    onClick={() => window.open(downloadLink, '_blank')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-medium rounded-md shadow-sm hover:shadow transition-all duration-200"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    تحميل
                                  </button>
                                )}
                                <span className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات بعد</h3>
                        <p className="text-gray-500 mb-4">ابدأ بتصفح المنتجات المتاحة</p>
                        <Link href="/#services" className="btn-primary">
                          تصفح المنتجات
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">جميع الطلبات</h2>
                </div>
                <div className="p-6">
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const statusConfig = getOrderStatusConfig(order.status);
                        const paymentConfig = getPaymentStatusConfig(order.paymentStatus);
                        const StatusIcon = statusConfig.icon;
                        
                        // البحث عن المنتج المرتبط بالطلب
                        const product = products.find(p => p.id === order.productId);
                        const productType = product?.productType || order.productType;
                        const downloadLink = product?.downloadLink || order.downloadLink;
                        const showDownloadButton = (productType === 'download' || productType === 'digital') && downloadLink;
                        const showShippingTracking = productType === 'physical' && product?.requiresShipping;
                        const shippingStatus = order.shippingStatus || 'pending_shipping';
                        const shippingStatusConfig = getShippingStatusConfig(shippingStatus);
                        const ShippingIcon = shippingStatusConfig.icon;
                        
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{order.productName}</h3>
                                <p className="text-sm text-gray-500">طلب رقم: #{order.id.slice(-8)}</p>
                                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                {/* عرض حالة الشحن للمنتجات الملموسة */}
                                {showShippingTracking && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shippingStatusConfig.color}`}>
                                      <ShippingIcon className="w-3 h-3 mr-1" />
                                      حالة الشحن: {shippingStatusConfig.label}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-gray-900 mb-2">{formatPrice(order.totalAmount)}</div>
                                <div className="flex flex-col gap-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentConfig.color}`}>
                                    {paymentConfig.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {order.notes && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-700">{order.notes}</p>
                              </div>
                            )}
                            
                            {/* عرض عنوان الشحن للمنتجات الملموسة */}
                            {showShippingTracking && order.shippingAddress && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800 mb-1">عنوان الشحن:</p>
                                    <p className="text-sm text-green-700">{order.shippingAddress}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="text-sm text-gray-500">
                                الكمية: {order.quantity} | طريقة الدفع: {
                                  order.paymentMethod === 'cash' ? 'نقدي' :
                                  order.paymentMethod === 'card' ? 'بطاقة ائتمان' :
                                  order.paymentMethod === 'bank_transfer' ? 'حوالة بنكية' : 'محفظة رقمية'
                                }
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* زر تتبع الشحن للمنتجات الملموسة */}
                                {showShippingTracking && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderForTracking(order);
                                      setShowShippingTrackingModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <Truck className="w-4 h-4" />
                                    تتبع الشحن
                                  </button>
                                )}
                                
                                {/* زر التحميل للمنتجات التي تحتاج تنزيل */}
                                {showDownloadButton && (
                                  <button
                                    onClick={() => window.open(downloadLink, '_blank')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <Download className="w-4 h-4" />
                                    تحميل المنتج
                                  </button>
                                )}

                                {/* زر طلب الإرجاع */}
                                {order.status === 'completed' && 
                                 order.paymentStatus === 'paid' && 
                                 (!order.returnStatus || order.returnStatus === 'none') && 
                                 settings?.website?.returnPolicy?.enabled && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderForReturn(order);
                                      setShowReturnRequestModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                    طلب إرجاع
                                  </button>
                                )}

                                {/* عرض حالة الإرجاع */}
                                {order.returnStatus && order.returnStatus !== 'none' && (
                                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                                    order.returnStatus === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                    order.returnStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
                                    order.returnStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                    order.returnStatus === 'returned' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    {
                                      order.returnStatus === 'requested' ? 'طلب إرجاع قيد المراجعة' :
                                      order.returnStatus === 'approved' ? 'تم الموافقة على الإرجاع' :
                                      order.returnStatus === 'rejected' ? 'تم رفض طلب الإرجاع' :
                                      order.returnStatus === 'returned' ? 'تم الإرجاع بنجاح' :
                                      order.returnStatus === 'exchanged' ? 'تم الاستبدال' : ''
                                    }
                                  </span>
                                )}

                                {/* زر تحميل الفاتورة */}
                                <button
                                  onClick={async () => {
                                    try {
                                      await downloadInvoicePDF(order.id);
                                    } catch (error: any) {
                                      alert(error.message || 'حدث خطأ في تحميل الفاتورة');
                                    }
                                  }}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  title={order.invoiceNumber ? `فاتورة رقم: ${order.invoiceNumber}` : 'تحميل الفاتورة'}
                                >
                                  <FileText className="w-4 h-4" />
                                  {order.invoiceNumber ? `فاتورة ${order.invoiceNumber}` : 'تحميل الفاتورة'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
                      <p className="text-gray-500 mb-6">لم تقم بأي طلبات بعد</p>
                      <Link href="/#services" className="btn-primary">
                        تصفح المنتجات
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                {/* Firebase Index Warning */}
                {showIndexWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-1">تحسين الأداء متاح</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          لتحسين سرعة تحميل الاشتراكات، يُنصح بإنشاء فهرس Firebase. النظام يعمل حالياً بشكل طبيعي.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowIndexWarning(false)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                          >
                            إخفاء
                          </button>
                          <a
                            href="https://console.firebase.google.com/v1/r/project/wafarle-63a71/firestore/indexes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            إنشاء الفهرس ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Subscriptions Header */}
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">اشتراكاتي</h2>
                        <p className="text-sm text-gray-600">إدارة جميع اشتراكاتك ومراقبة المدة المتبقية</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {subscriptions.filter(sub => sub.status === 'active').length} نشط
                        </div>
                        {subscriptions.filter(sub => sub.status === 'expired').length > 0 && (
                          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                            {subscriptions.filter(sub => sub.status === 'expired').length} منتهي
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subscriptions Content */}
                  <div className="p-6">
                    {subscriptions.length > 0 ? (
                      <div className="space-y-4">
                        {/* Duration Explanation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">ℹ️</span>
                            </div>
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">كيفية حساب المدة المتبقية:</p>
                              <p className="text-blue-700">
                                يتم حساب الأيام المتبقية بدقة من تاريخ اليوم حتى تاريخ انتهاء الاشتراك. 
                                الاشتراك الربع سنوي (3 شهور) يعادل تقريباً 90 يوماً، والشهري 30 يوماً، والسنوي 365 يوماً.
                              </p>
                            </div>
                          </div>
                        </div>
                        {subscriptions.map((subscription, index) => {
                          const remainingDays = calculateRemainingDays(subscription.endDate);
                          const isExpiring = isSubscriptionExpiringSoon(subscription);
                          
                          // Calculate total subscription days more accurately
                          const totalDays = Math.ceil((subscription.endDate.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24));
                          const usedDays = totalDays - remainingDays;
                          const progressPercentage = totalDays > 0 ? Math.max(0, Math.min(100, (usedDays / totalDays) * 100)) : 0;
                          
                          // Calculate subscription duration in readable format
                          const durationText = subscription.durationMonths === 1 ? 'شهر واحد' :
                                             subscription.durationMonths === 3 ? '3 شهور' :
                                             subscription.durationMonths === 6 ? '6 شهور' :
                                             subscription.durationMonths === 12 ? 'سنة كاملة' :
                                             `${subscription.durationMonths} شهر`;

                          return (
                            <motion.div
                              key={subscription.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`border rounded-xl p-6 transition-all hover:shadow-md ${
                                subscription.status === 'active' ? 'border-green-200 bg-green-50/30' : 
                                subscription.status === 'expired' ? 'border-red-200 bg-red-50/30' :
                                'border-gray-200 bg-gray-50/30'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Package className="w-8 h-8 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{subscription.productName}</h3>
                                    <p className="text-sm text-gray-600">خطة {subscription.planType} - مدة {durationText}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSubscriptionStatusColor(subscription.status)}`}>
                                        {getSubscriptionStatusLabel(subscription.status)}
                                      </span>
                                      {subscription.autoRenewal && subscription.status === 'active' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                          تجديد تلقائي
                                        </span>
                                      )}
                                    </div>
                                    {/* Subscription Duration Summary */}
                                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                                      <span>المدة الإجمالية: {totalDays} يوم</span>
                                      {subscription.status === 'active' && (
                                        <span className="mx-2">•</span>
                                      )}
                                      {subscription.status === 'active' && remainingDays > 0 && (
                                        <span>مستخدم: {usedDays} يوم</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-gray-900">{formatPrice(subscription.price)}</div>
                                  <div className="text-sm text-gray-600">/{subscription.planType}</div>
                                </div>
                              </div>

                              {/* Subscription Progress */}
                              {subscription.status === 'active' && (
                                <div className="mb-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">
                                        {remainingDays > 0 ? (
                                          <>
                                            المتبقي: <span className="text-blue-600 font-semibold">{remainingDays} يوم</span>
                                            {remainingDays > 30 && (
                                              <span className="text-gray-500"> (~{Math.ceil(remainingDays / 30)} شهر)</span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-red-600">انتهت الصلاحية</span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 text-right">
                                      <div>{Math.round(progressPercentage)}% مستخدم</div>
                                      <div className="text-xs text-gray-500">من {durationText}</div>
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <motion.div
                                      className={`h-2 rounded-full ${
                                        isExpiring ? 'bg-gradient-to-r from-yellow-400 to-red-500' :
                                        remainingDays > 0 ? 'bg-gradient-to-r from-green-400 to-blue-500' :
                                        'bg-gray-400'
                                      }`}
                                      style={{ width: `${progressPercentage}%` }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progressPercentage}%` }}
                                      transition={{ duration: 1, delay: index * 0.2 }}
                                    />
                                  </div>
                                  {isExpiring && remainingDays > 0 && (
                                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm text-yellow-800 font-medium">
                                          ينتهي الاشتراك خلال {remainingDays} أيام!
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Subscription Features */}
                              {subscription.features && subscription.features.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-2">
                                    {subscription.features.slice(0, 4).map((feature, featureIndex) => (
                                      <span
                                        key={featureIndex}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                                        {feature}
                                      </span>
                                    ))}
                                    {subscription.features.length > 4 && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                        +{subscription.features.length - 4} المزيد
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Subscription Actions */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex flex-col gap-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      بدء: <span className="font-medium">{subscription.startDate.toLocaleDateString('ar-SA')}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 opacity-0" />
                                    <span>
                                      انتهاء: <span className={`font-medium ${
                                        isExpiring ? 'text-orange-600' : 
                                        remainingDays < 0 ? 'text-red-600' : 'text-gray-900'
                                      }`}>
                                        {subscription.endDate.toLocaleDateString('ar-SA')}
                                      </span>
                                      {remainingDays > 0 && remainingDays <= 30 && (
                                        <span className="text-orange-600 text-xs mr-1">
                                          (بعد {remainingDays} يوم)
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {subscription.status === 'active' && (
                                    <>
                                      <button 
                                        onClick={() => handleSubscriptionManagement(subscription)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                      >
                                        <Settings className="w-3 h-3 mr-1" />
                                        إدارة
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setSelectedSubscription(subscription);
                                          setShowReviewModal(true);
                                        }}
                                        className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-xs font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                                      >
                                        <Star className="w-3 h-3 mr-1" />
                                        تقييم
                                      </button>
                                      {!subscription.autoRenewal && isExpiring && (
                                        <button className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                                          <RefreshCw className="w-3 h-3 mr-1" />
                                          تجديد
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {subscription.status === 'expired' && (
                                    <>
                                      <button 
                                        onClick={() => {
                                          setSelectedSubscription(subscription);
                                          setShowReviewModal(true);
                                        }}
                                        className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-xs font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                                      >
                                        <Star className="w-3 h-3 mr-1" />
                                        تقييم
                                      </button>
                                      <button className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        إعادة تفعيل
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد اشتراكات</h3>
                        <p className="text-gray-500 mb-6">ابدأ بالاشتراك في خدماتنا للاستفادة من المزايا الحصرية</p>
                        <Link href="/#services" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                          تصفح الخدمات
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">تقييماتي</h2>
                <p className="text-sm text-gray-600">جميع التقييمات التي قدمتها للاشتراكات</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{reviews.length} تقييم</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {reviews.length > 0 ? (
              <ReviewList 
                reviews={reviews} 
                showActions={true}
                onEdit={(review) => {
                  setEditingReview(review);
                  setShowEditModal(true);
                }}
                onDelete={async (reviewId) => {
                  if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
                  
                  try {
                    await deleteSubscriptionReview(reviewId);
                    
                    // Update local state
                    setReviews(prev => prev.filter(review => review.id !== reviewId));
                    
                    alert('تم حذف التقييم بنجاح!');
                  } catch (error) {
                    console.error('Error deleting review:', error);
                    alert('حدث خطأ في حذف التقييم');
                  }
                }}
              />
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تقييمات</h3>
                <p className="text-gray-500 mb-6">ابدأ بتقييم اشتراكاتك لمساعدة الآخرين</p>
                <button 
                  onClick={() => setActiveTab('subscriptions')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Star className="w-4 h-4 mr-2" />
                  تقييم اشتراك
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Chat Support */}
      <LiveChat 
        customerName={customerUser?.displayName || customerUser?.email} 
        customerEmail={customerUser?.email} 
      />

      {/* Review Modal */}
      {selectedSubscription && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedSubscription(null);
          }}
          subscription={selectedSubscription}
          customerEmail={customerUser?.email || ''}
          customerName={customerUser?.displayName || customerUser?.email || ''}
          onReviewAdded={async (rating: number) => {
            // Reload reviews after adding new one
            if (customerUser?.email) {
              await getCustomerReviews(customerUser.email).then(setReviews);
              
              // If rating is positive (4 or 5 stars), show discount code
              if (rating >= 4 && settings.website.reviewInvite?.enabled) {
                setTimeout(() => {
                  setShowReviewInviteWithCode(true);
                }, 500);
              }
            }
          }}
        />
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingReview(null);
          }}
          review={editingReview}
          onReviewUpdated={() => {
            // Reload reviews after updating
            if (customerUser?.email) {
              getCustomerReviews(customerUser.email).then(setReviews);
            }
          }}
        />
      )}

      {/* Subscription Management Modal */}
      {showSubscriptionManagement && selectedSubscriptionForManagement && (
        <SubscriptionManagementModal
          subscription={selectedSubscriptionForManagement}
          onClose={handleCloseSubscriptionManagement}
          onSubscriptionUpdated={() => {
            // Reload subscriptions after updating
            if (customerUser?.email) {
              getCustomerSubscriptions(customerUser.email).then(setSubscriptions);
            }
          }}
        />
      )}

        {/* Shipping Tracking Modal */}
        <ShippingTrackingModal
          isOpen={showShippingTrackingModal}
          onClose={() => {
            setShowShippingTrackingModal(false);
            setSelectedOrderForTracking(null);
          }}
          order={selectedOrderForTracking}
        />

        {/* Return Request Modal */}
        {showReturnRequestModal && selectedOrderForReturn && (
          <ReturnRequestModal
            isOpen={showReturnRequestModal}
            onClose={() => {
              setShowReturnRequestModal(false);
              setSelectedOrderForReturn(null);
            }}
            order={selectedOrderForReturn}
            onReturnRequested={async () => {
              // Reload orders
              if (customerUser?.email) {
                const allOrders = await getOrders();
                const customerOrders = allOrders.filter(order => 
                  order.customerEmail.toLowerCase() === customerUser.email.toLowerCase()
                );
                setOrders(customerOrders);
              }
              alert('تم إرسال طلب الإرجاع بنجاح! سيتم مراجعة طلبك قريباً.');
            }}
          />
        )}

        {/* Review Invite Modal - Initial (without code) */}
        {(settings?.website?.reviewInvite?.enabled ?? true) && (
          <ReviewInviteModal
            isOpen={showReviewInvite && !showReviewInviteWithCode}
            onClose={() => {
              setShowReviewInvite(false);
              if (typeof window !== 'undefined') {
                localStorage.setItem('reviewInviteDismissed', 'true');
                localStorage.setItem('reviewInviteLastShown', Date.now().toString());
              }
            }}
            onReviewClick={() => {
              setActiveTab('reviews');
            }}
            discountCode={settings?.website?.reviewInvite?.discountCode || 'REVIEW10'}
            discountPercentage={settings?.website?.reviewInvite?.discountPercentage || 10}
            showDiscountCode={false}
          />
        )}

        {/* Review Invite Modal - After positive review (with code) */}
        {(settings?.website?.reviewInvite?.enabled ?? true) && (
          <ReviewInviteModal
            isOpen={showReviewInviteWithCode}
            onClose={() => {
              setShowReviewInviteWithCode(false);
            }}
            onReviewClick={() => {
              setActiveTab('reviews');
            }}
            discountCode={settings?.website?.reviewInvite?.discountCode || 'REVIEW10'}
            discountPercentage={settings?.website?.reviewInvite?.discountPercentage || 10}
            showDiscountCode={true}
          />
        )}
    </div>
  );
}
