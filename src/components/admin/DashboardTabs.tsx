'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Package, 
  MessageSquare, 
  Settings,
  BarChart3,
  Target,
  Activity,
  Calendar,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Home,
  Sparkles,
  Crown,
  Award,
  Globe,
  Database,
  Layers,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Eye,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Monitor,
  Smartphone,
  Link,
  FileText,
  BookOpen,
  Tags,
  Save,
  Image,
  Ticket,
  Palette,
  Type
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  getBlogPosts, 
  getBlogCategories, 
  addBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  generateSlug, 
  calculateReadingTime,
  getDashboardStats,
  getOrders,
  getProducts,
  getCustomers
} from '../../lib/database';
import { SEOTab } from './SEOTab';
import type { Order, BlogPost, Product, Customer } from '@/lib/firebase';

// Overview Tab Component
export const OverviewTab = () => {
  const [stats, setStats] = useState<{
    todaySales: number;
    newOrdersToday: number;
    activeCustomers: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    recentOrders: Order[];
    recentBlogPosts: BlogPost[];
    totalBlogPosts: number;
    publishedBlogPosts: number;
  }>({
    todaySales: 0,
    newOrdersToday: 0,
    activeCustomers: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    recentOrders: [],
    recentBlogPosts: [],
    totalBlogPosts: 0,
    publishedBlogPosts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-white mb-6">نظرة عامة</h2>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/60 mr-3">جارِ تحميل الإحصائيات...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">نظرة عامة</h2>
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث الإحصائيات
        </button>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl p-6 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm font-medium">مبيعات اليوم</p>
              <p className="text-white text-2xl font-bold">{formatCurrency(stats.todaySales)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">طلبات جديدة</p>
              <p className="text-white text-2xl font-bold">{stats.newOrdersToday}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">العملاء النشطين</p>
              <p className="text-white text-2xl font-bold">{stats.activeCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">إجمالي المنتجات</p>
              <p className="text-white text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detailed Stats */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            الإحصائيات التفصيلية
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">إجمالي العملاء</span>
              <span className="text-white font-semibold">{stats.totalCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">إجمالي الطلبات</span>
              <span className="text-white font-semibold">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">إجمالي الإيرادات</span>
              <span className="text-white font-semibold">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">متوسط قيمة الطلب</span>
              <span className="text-white font-semibold">{formatCurrency(stats.averageOrderValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">إجمالي المقالات</span>
              <span className="text-white font-semibold">{stats.totalBlogPosts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">المقالات المنشورة</span>
              <span className="text-white font-semibold">{stats.publishedBlogPosts}</span>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            النشاط الأخير
          </h3>
          <div className="space-y-3">
            {stats.recentOrders.slice(0, 5).map((order, index) => (
              <div key={order.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === 'confirmed' ? 'bg-emerald-400' :
                  order.status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <div className="flex-1">
                  <span className="text-white/70 text-sm">
                    طلب جديد من {order.customerName}
                  </span>
                  <div className="text-white/50 text-xs">
                    {formatCurrency(order.totalPrice)} • {formatTimeAgo(order.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <p className="text-white/50 text-sm">لا توجد طلبات حديثة</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Blog Posts */}
      {stats.recentBlogPosts.length > 0 && (
        <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            أحدث المقالات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentBlogPosts.map((post) => (
              <div key={post.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-white font-medium mb-2 line-clamp-2">{post.title}</h4>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{(post as any).authorName || 'Admin'}</span>
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics Tab Component
export const AnalyticsTab = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [couponsData, setCouponsData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [orders, products, customers, statsData] = await Promise.all([
        getOrders(),
        getProducts(),
        getCustomers(),
        getDashboardStats()
      ]);

      const filteredOrders = filterByTimeRange(orders, timeRange);
      
      setOrdersData(filteredOrders);
      setProductsData(products);
      setCustomersData(customers);
      setStats(statsData);
      
      // Load coupons if function exists
      try {
        const { getDiscountCodes } = await import('@/lib/database');
        const coupons = await getDiscountCodes();
        setCouponsData(coupons);
      } catch (error) {
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (data: any[], range: string): any[] => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return data;
    }

    return data.filter(item => {
      const itemDate = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
      return itemDate >= startDate;
    });
  };

  const calculateSalesStats = () => {
    if (!ordersData.length) return null;

    const confirmedOrders = ordersData.filter(o => o.status === 'confirmed' && o.paymentStatus === 'paid');
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = ordersData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / confirmedOrders.length : 0;
    const conversionRate = totalOrders > 0 ? (confirmedOrders.length / totalOrders) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      confirmedOrders: confirmedOrders.length,
      averageOrderValue,
      conversionRate
    };
  };

  const getTopProducts = () => {
    const productSales: Record<string, { count: number; revenue: number; name: string }> = {};
    
    ordersData.forEach(order => {
      if (order.status === 'confirmed' && order.paymentStatus === 'paid' && order.product?.id) {
        const productId = order.product.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            count: 0,
            revenue: 0,
            name: order.product.name
          };
        }
        productSales[productId].count += order.product.quantity || 1;
        productSales[productId].revenue += order.totalPrice || 0;
      }
    });

    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const getOrdersOverTime = () => {
    const dailyData: Record<string, { orders: number; revenue: number }> = {};
    
    ordersData.forEach(order => {
      const date = new Date(order.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { orders: 0, revenue: 0 };
      }
      
      dailyData[dateKey].orders += 1;
      if (order.status === 'confirmed' && order.paymentStatus === 'paid') {
        dailyData[dateKey].revenue += order.totalPrice || 0;
      }
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getCustomerRetentionData = () => {
    const customerOrderCounts: Record<string, number> = {};
    
    ordersData.forEach(order => {
      const email = order.email || order.customerName;
      if (email) {
        customerOrderCounts[email] = (customerOrderCounts[email] || 0) + 1;
      }
    });

    const newCustomers = Object.values(customerOrderCounts).filter(count => count === 1).length;
    const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const retentionRate = customersData.length > 0 
      ? (returningCustomers / customersData.length) * 100 
      : 0;

    return {
      newCustomers,
      returningCustomers,
      retentionRate,
      totalCustomers: customersData.length
    };
  };

  const getCouponStats = () => {
    if (!couponsData.length) return null;

    const usedCoupons = couponsData.filter(c => (c.currentUses ?? 0) > 0);
    const totalDiscount = ordersData
      .filter(o => o.discount && o.status === 'confirmed')
      .reduce((sum, o) => sum + (o.discount || 0), 0);
    
    return {
      totalCoupons: couponsData.length,
      activeCoupons: couponsData.filter(c => c.isActive).length,
      usedCoupons: usedCoupons.length,
      totalDiscount,
      averageDiscountPerOrder: ordersData.filter(o => o.discount).length > 0
        ? totalDiscount / ordersData.filter(o => o.discount).length
        : 0
    };
  };

  const salesStats = calculateSalesStats();
  const topProducts = getTopProducts();
  const ordersOverTime = getOrdersOverTime();
  const customerRetention = getCustomerRetentionData();
  const couponStats = getCouponStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white/60 mr-3">جارِ تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">التقارير والإحصائيات</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
        >
          <option value="7d">آخر 7 أيام</option>
          <option value="30d">آخر 30 يوم</option>
          <option value="90d">آخر 90 يوم</option>
          <option value="1y">آخر سنة</option>
          <option value="all">الكل</option>
        </select>
      </div>

      {/* Sales Stats Cards */}
      {salesStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <span className="text-blue-300 text-sm">إجمالي المبيعات</span>
            </div>
            <p className="text-white text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</p>
            <p className="text-white/60 text-sm mt-1">{salesStats.confirmedOrders} طلب مدفوع</p>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-green-400" />
              <span className="text-green-300 text-sm">عدد الطلبات</span>
            </div>
            <p className="text-white text-2xl font-bold">{salesStats.totalOrders}</p>
            <p className="text-white/60 text-sm mt-1">منها {salesStats.confirmedOrders} مؤكد</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-purple-300 text-sm">متوسط قيمة الطلب</span>
            </div>
            <p className="text-white text-2xl font-bold">{formatCurrency(salesStats.averageOrderValue)}</p>
            <p className="text-white/60 text-sm mt-1">للطلبات المدفوعة</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-orange-400" />
              <span className="text-orange-300 text-sm">معدل التحويل</span>
            </div>
            <p className="text-white text-2xl font-bold">{salesStats.conversionRate.toFixed(1)}%</p>
            <p className="text-white/60 text-sm mt-1">من الطلبات</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time Chart */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-400" />
            الطلبات والمبيعات عبر الزمن
          </h3>
          {ordersOverTime.length > 0 ? (
            <div className="space-y-2">
              {ordersOverTime.slice(-14).map((item, index) => {
                const maxRevenue = Math.max(...ordersOverTime.map(i => i.revenue));
                const maxOrders = Math.max(...ordersOverTime.map(i => i.orders));
                
                return (
                  <div key={item.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">{formatDate(item.date)}</span>
                      <span className="text-white font-medium">
                        {item.orders} طلب - {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="flex gap-2 h-4">
                      <div
                        className="bg-blue-500/30 rounded"
                        style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                      />
                      <div
                        className="bg-green-500/30 rounded"
                        style={{ width: `${(item.orders / maxOrders) * 20}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">لا توجد بيانات</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            المنتجات الأكثر مبيعاً
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => {
                const maxRevenue = Math.max(...topProducts.map(p => p.revenue));
                
                return (
                  <div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="text-white font-medium">{product.name}</span>
                      </div>
                      <span className="text-white/80 font-semibold">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{product.count} طلب</span>
                      <span>{((product.revenue / maxRevenue) * 100).toFixed(1)}% من المبيعات</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">لا توجد بيانات</p>
          )}
        </div>
      </div>

      {/* Customer Retention & Coupons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Retention */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            تحليل العملاء والاحتفاظ
          </h3>
          {customerRetention && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white/80">إجمالي العملاء</span>
                <span className="text-white text-xl font-bold">{customerRetention.totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white/80">عملاء جدد</span>
                <span className="text-green-400 text-xl font-bold">{customerRetention.newCustomers}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white/80">عملاء متكررين</span>
                <span className="text-blue-400 text-xl font-bold">{customerRetention.returningCustomers}</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80">معدل الاحتفاظ</span>
                  <span className="text-white text-2xl font-bold">
                    {customerRetention.retentionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${customerRetention.retentionRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coupon Stats */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-green-400" />
            تقرير الكوبونات والخصومات
          </h3>
          {couponStats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white/80">إجمالي الكوبونات</span>
                <span className="text-white text-xl font-bold">{couponStats.totalCoupons}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white/80">كوبونات نشطة</span>
                <span className="text-green-400 text-xl font-bold">{couponStats.activeCoupons}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-white/80">كوبونات مستخدمة</span>
                <span className="text-blue-400 text-xl font-bold">{couponStats.usedCoupons}</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80">إجمالي الخصومات</span>
                  <span className="text-white text-2xl font-bold">
                    {formatCurrency(couponStats.totalDiscount)}
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  متوسط الخصم: {formatCurrency(couponStats.averageDiscountPerOrder)} لكل طلب
                </p>
              </div>
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">لا توجد بيانات كوبونات</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Customers Tab Component
export const CustomersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">العملاء</h2>
    <p className="text-white/60 text-lg">إدارة العملاء قريباً...</p>
  </div>
);

// Orders Tab Component
export const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData.slice(0, 10)); // Show only recent 10 orders
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-white mb-6">الطلبات</h2>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/60 mr-3">جارِ تحميل الطلبات...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">الطلبات</h2>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث الطلبات
        </button>
      </div>
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">الطلبات الأخيرة</h3>
          <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
            عرض الكل
          </button>
        </div>
        
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(order.status)}`}>
                    <span className="text-white font-bold text-sm">
                      {order.customerName?.charAt(0) || 'ع'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{order.customerName || 'عميل غير محدد'}</p>
                    <p className="text-white/60 text-sm">
                      {order.product?.name || 'منتج غير محدد'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <CurrencyDisplay 
                    price={order.totalPrice} 
                    originalCurrency="SAR" 
                    className="text-white font-semibold" 
                  />
                  <p className="text-white/60 text-sm">{formatTimeAgo(order.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">لا توجد طلبات حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Messages Tab Component
export const MessagesTab = ({ notifications }: { notifications: any[] }) => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">الرسائل</h2>
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className={`w-3 h-3 rounded-full mt-2 ${
              notification.type === 'success' ? 'bg-emerald-400' :
              notification.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
            }`}></div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">{notification.title}</h3>
              <p className="text-white/70 mb-2">{notification.message}</p>
              <p className="text-white/50 text-sm">{notification.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings Tab Component
export const SettingsTab = () => {
  const { settings, updateSettings, loading, error } = useSettings();
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [websiteSettings, setWebsiteSettings] = useState(settings.website);
  const [securitySettings, setSecuritySettings] = useState(settings.security);
  const [notificationSettings, setNotificationSettings] = useState(settings.notifications);
  const [systemSettings, setSystemSettings] = useState(settings.system);
  const [analyticsSettings, setAnalyticsSettings] = useState(settings.analytics);
  const [saving, setSaving] = useState(false);

  // Update local state when global settings change
  useEffect(() => {
    setWebsiteSettings(settings.website);
    setSecuritySettings(settings.security);
    setNotificationSettings(settings.notifications);
    setSystemSettings(settings.system);
    setAnalyticsSettings(settings.analytics);
  }, [settings]);

  const settingsTabs = [
    { id: 'general', name: 'عام', icon: Settings },
    { id: 'customization', name: 'التخصيص', icon: Sparkles },
    { id: 'social', name: 'السوشال ميديا', icon: Globe },
    { id: 'analytics', name: 'التحليلات', icon: BarChart },
    { id: 'security', name: 'الأمان', icon: Shield },
    { id: 'notifications', name: 'الإشعارات', icon: Bell },
    { id: 'system', name: 'النظام', icon: Database },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: RefreshCw }
  ];

  const handleWebsiteSettingChange = (field: string, value: any) => {
    setWebsiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecuritySettingChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationSettingChange = (field: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemSettingChange = (field: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setWebsiteSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleAnalyticsSettingChange = (tool: string, field: string, value: any) => {
    setAnalyticsSettings(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      
      const newSettings = {
        website: websiteSettings,
        security: securitySettings,
        notifications: notificationSettings,
        system: systemSettings,
        analytics: analyticsSettings,
        updatedAt: new Date(),
        updatedBy: 'admin'
      };
      
      await updateSettings(newSettings);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      successDiv.innerHTML = '✅ تم حفظ الإعدادات بنجاح!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.remove();
      }, 3000);
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      errorDiv.innerHTML = '❌ فشل في حفظ الإعدادات!';
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">الإعدادات</h2>
          {error && (
            <p className="text-red-400 text-sm mt-2">❌ {error}</p>
          )}
          {loading && (
            <p className="text-blue-400 text-sm mt-2 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              جارِ تحميل الإعدادات...
            </p>
          )}
        </div>
        <button
          onClick={saveSettings}
          disabled={saving || loading}
          className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 ${
            saving || loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جارِ الحفظ...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              حفظ جميع الإعدادات
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="space-y-2">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeSettingsTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeSettingsTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  إعدادات الموقع العامة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">اسم الموقع</label>
                    <input
                      type="text"
                      value={websiteSettings.siteName}
                      onChange={(e) => handleWebsiteSettingChange('siteName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={websiteSettings.contactEmail}
                      onChange={(e) => handleWebsiteSettingChange('contactEmail', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={websiteSettings.contactPhone}
                      onChange={(e) => handleWebsiteSettingChange('contactPhone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">المنطقة الزمنية</label>
                    <select
                      value={websiteSettings.timezone}
                      onChange={(e) => handleWebsiteSettingChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Riyadh">الرياض (UTC+3)</option>
                      <option value="Asia/Dubai">دبي (UTC+4)</option>
                      <option value="Africa/Cairo">القاهرة (UTC+2)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-white/70 text-sm font-medium mb-2">وصف الموقع</label>
                  <textarea
                    value={websiteSettings.siteDescription}
                    onChange={(e) => handleWebsiteSettingChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">وضع الصيانة</h4>
                    <p className="text-white/60 text-sm">تفعيل وضع الصيانة للموقع</p>
                  </div>
                  <button
                    onClick={() => handleWebsiteSettingChange('maintenanceMode', !websiteSettings.maintenanceMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      websiteSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      websiteSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {activeSettingsTab === 'seo' && (
            <SEOTab />
          )}

          {/* Customization Settings */}
          {activeSettingsTab === 'customization' && (
            <div className="space-y-6">
              {/* Store Type Selection */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  نوع المتجر
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'general', name: 'عام', icon: '🏪' },
                    { id: 'clothing', name: 'ملابس', icon: '👕' },
                    { id: 'shoes', name: 'أحذية', icon: '👟' },
                    { id: 'electronics', name: 'إلكترونيات', icon: '📱' },
                    { id: 'accessories', name: 'إكسسوارات', icon: '👜' },
                    { id: 'cosmetics', name: 'مستحضرات', icon: '💄' },
                    { id: 'sports', name: 'رياضة', icon: '⚽' },
                    { id: 'food', name: 'طعام', icon: '🍔' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleWebsiteSettingChange('storeType', type.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        (websiteSettings.storeType || 'general') === type.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 border-purple-400 text-white'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-medium text-sm">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-400" />
                  الألوان والثيم
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">اللون الأساسي</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.primaryColor || '#3b82f6'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                primaryColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.primaryColor || '#3b82f6'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                primaryColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  {/* Secondary Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">اللون الثانوي</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.secondaryColor || '#8b5cf6'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                secondaryColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.secondaryColor || '#8b5cf6'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                secondaryColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#8b5cf6"
                      />
                    </div>
                  </div>
                  {/* Accent Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">لون التمييز</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.accentColor || '#10b981'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                accentColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.accentColor || '#10b981'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                accentColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                  {/* Background Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">لون الخلفية</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.backgroundColor || '#ffffff'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                backgroundColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.backgroundColor || '#ffffff'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                backgroundColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  {/* Text Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">لون النص</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.textColor || '#1f2937'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                textColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.textColor || '#1f2937'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                textColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                  {/* Border Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">لون الحدود</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.borderColor || '#e5e7eb'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                borderColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.borderColor || '#e5e7eb'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                borderColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#e5e7eb"
                      />
                    </div>
                  </div>
                  {/* Success Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">لون النجاح</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.successColor || '#10b981'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                successColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.successColor || '#10b981'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                successColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                  {/* Warning Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">لون التحذير</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.warningColor || '#f59e0b'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                warningColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.warningColor || '#f59e0b'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                warningColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                  {/* Error Color */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">لون الخطأ</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={websiteSettings.customization?.theme?.errorColor || '#ef4444'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                errorColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={websiteSettings.customization?.theme?.errorColor || '#ef4444'}
                        onChange={(e) => {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              theme: {
                                ...websiteSettings.customization?.theme,
                                errorColor: e.target.value
                              }
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Settings */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Type className="w-5 h-5 text-green-400" />
                  الخطوط والطباعة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Font Family */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">خط العائلة العام</label>
                    <select
                      value={websiteSettings.customization?.typography?.fontFamily || 'Cairo, sans-serif'}
                      onChange={(e) => {
                        setWebsiteSettings({
                          ...websiteSettings,
                          customization: {
                            ...websiteSettings.customization,
                            typography: {
                              ...websiteSettings.customization?.typography,
                              fontFamily: e.target.value
                            }
                          }
                        } as any);
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cairo, sans-serif">Cairo (عربي/إنجليزي)</option>
                      <option value="Tajawal, sans-serif">Tajawal (عربي/إنجليزي)</option>
                      <option value="Almarai, sans-serif">Almarai (عربي)</option>
                      <option value="Amiri, serif">Amiri (عربي - خط فاخر)</option>
                      <option value="Roboto, sans-serif">Roboto (إنجليزي)</option>
                      <option value="Open Sans, sans-serif">Open Sans (إنجليزي)</option>
                      <option value="Poppins, sans-serif">Poppins (إنجليزي)</option>
                      <option value="Inter, sans-serif">Inter (إنجليزي)</option>
                      <option value="Lato, sans-serif">Lato (إنجليزي)</option>
                      <option value="Montserrat, sans-serif">Montserrat (إنجليزي)</option>
                      <option value="Playfair Display, serif">Playfair Display (إنجليزي - خط فاخر)</option>
                      <option value="Merriweather, serif">Merriweather (إنجليزي - خط فاخر)</option>
                    </select>
                  </div>
                  {/* Heading Font */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">خط العناوين</label>
                    <select
                      value={websiteSettings.customization?.typography?.headingFont || 'Cairo, sans-serif'}
                      onChange={(e) => {
                        setWebsiteSettings({
                          ...websiteSettings,
                          customization: {
                            ...websiteSettings.customization,
                            typography: {
                              ...websiteSettings.customization?.typography,
                              headingFont: e.target.value
                            }
                          }
                        } as any);
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cairo, sans-serif">Cairo (عربي/إنجليزي)</option>
                      <option value="Tajawal, sans-serif">Tajawal (عربي/إنجليزي)</option>
                      <option value="Almarai, sans-serif">Almarai (عربي)</option>
                      <option value="Amiri, serif">Amiri (عربي - خط فاخر)</option>
                      <option value="Roboto, sans-serif">Roboto (إنجليزي)</option>
                      <option value="Open Sans, sans-serif">Open Sans (إنجليزي)</option>
                      <option value="Poppins, sans-serif">Poppins (إنجليزي)</option>
                      <option value="Inter, sans-serif">Inter (إنجليزي)</option>
                      <option value="Lato, sans-serif">Lato (إنجليزي)</option>
                      <option value="Montserrat, sans-serif">Montserrat (إنجليزي)</option>
                      <option value="Playfair Display, serif">Playfair Display (إنجليزي - خط فاخر)</option>
                      <option value="Merriweather, serif">Merriweather (إنجليزي - خط فاخر)</option>
                    </select>
                  </div>
                  {/* Body Font */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">خط النص</label>
                    <select
                      value={websiteSettings.customization?.typography?.bodyFont || 'Cairo, sans-serif'}
                      onChange={(e) => {
                        setWebsiteSettings({
                          ...websiteSettings,
                          customization: {
                            ...websiteSettings.customization,
                            typography: {
                              ...websiteSettings.customization?.typography,
                              bodyFont: e.target.value
                            }
                          }
                        } as any);
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cairo, sans-serif">Cairo (عربي/إنجليزي)</option>
                      <option value="Tajawal, sans-serif">Tajawal (عربي/إنجليزي)</option>
                      <option value="Almarai, sans-serif">Almarai (عربي)</option>
                      <option value="Amiri, serif">Amiri (عربي - خط فاخر)</option>
                      <option value="Roboto, sans-serif">Roboto (إنجليزي)</option>
                      <option value="Open Sans, sans-serif">Open Sans (إنجليزي)</option>
                      <option value="Poppins, sans-serif">Poppins (إنجليزي)</option>
                      <option value="Inter, sans-serif">Inter (إنجليزي)</option>
                      <option value="Lato, sans-serif">Lato (إنجليزي)</option>
                      <option value="Montserrat, sans-serif">Montserrat (إنجليزي)</option>
                      <option value="Playfair Display, serif">Playfair Display (إنجليزي - خط فاخر)</option>
                      <option value="Merriweather, serif">Merriweather (إنجليزي - خط فاخر)</option>
                    </select>
                  </div>
                  {/* Custom Font Input */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">خط مخصص (اسم الخط من Google Fonts)</label>
                    <input
                      type="text"
                      value={websiteSettings.customization?.typography?.fontFamily?.includes(',') ? websiteSettings.customization.typography.fontFamily.split(',')[0] : ''}
                      onChange={(e) => {
                        const customFont = e.target.value.trim();
                        if (customFont) {
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              typography: {
                                ...websiteSettings.customization?.typography,
                                fontFamily: `${customFont}, sans-serif`
                              }
                            }
                          } as any);
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: Aladin, Raleway, Oswald"
                    />
                    <p className="text-xs text-white/50 mt-2">
                      أدخل اسم الخط من Google Fonts (بدون مسافات في الاسم، مثل: Aladin وليس Aladin Regular)
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Categories */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Tags className="w-5 h-5 text-green-400" />
                  الفئات المخصصة
                </h3>
                <div className="space-y-4">
                  {(websiteSettings.customization?.categories || []).map((category, index) => (
                    <div key={category.id || index} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => {
                          const newCategories = [...(websiteSettings.customization?.categories || [])];
                          newCategories[index].name = e.target.value;
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              categories: newCategories
                            }
                          } as any);
                        }}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم الفئة"
                      />
                      <input
                        type="number"
                        value={category.order}
                        onChange={(e) => {
                          const newCategories = [...(websiteSettings.customization?.categories || [])];
                          newCategories[index].order = parseInt(e.target.value);
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              categories: newCategories
                            }
                          } as any);
                        }}
                        className="w-20 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="الترتيب"
                      />
                      <button
                        onClick={() => {
                          const newCategories = (websiteSettings.customization?.categories || []).filter((_, i) => i !== index);
                          setWebsiteSettings({
                            ...websiteSettings,
                            customization: {
                              ...websiteSettings.customization,
                              categories: newCategories
                            }
                          } as any);
                        }}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newCategories = [
                        ...(websiteSettings.customization?.categories || []),
                        {
                          id: `category-${Date.now()}`,
                          name: 'فئة جديدة',
                          isActive: true,
                          order: (websiteSettings.customization?.categories || []).length + 1
                        }
                      ];
                      setWebsiteSettings(prev => ({
                        ...prev,
                        customization: {
                          ...(prev.customization || {}),
                          categories: newCategories
                        }
                      } as any));
                    }}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-dashed border-white/30 rounded-lg text-white/50 hover:border-white/50 hover:text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>إضافة فئة جديدة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

                  {/* Social Media Settings */}
                  {activeSettingsTab === 'social' && (
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-400" />
                          روابط السوشال ميديا
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-500" />
                                فيسبوك
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.facebook}
                                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                placeholder="https://facebook.com/yourpage"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Twitter className="w-4 h-4 text-sky-500" />
                                تويتر / X
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.twitter}
                                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                placeholder="https://twitter.com/youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-pink-500" />
                                انستجرام
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.instagram}
                                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                placeholder="https://instagram.com/youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-red-500" />
                                يوتيوب
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.youtube}
                                onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                                placeholder="https://youtube.com/yourchannel"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Linkedin className="w-4 h-4 text-blue-600" />
                                لينكدإن
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.linkedin}
                                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                placeholder="https://linkedin.com/company/yourcompany"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-green-500" />
                                تيليجرام
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.telegram}
                                onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                                placeholder="https://t.me/yourchannel"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-yellow-500" />
                                تيك توك
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.tiktok}
                                onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                                placeholder="https://tiktok.com/@youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Link className="w-4 h-4 text-purple-500" />
                                سناب شات
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.snapchat}
                                onChange={(e) => handleSocialLinkChange('snapchat', e.target.value)}
                                placeholder="https://snapchat.com/add/youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-blue-400 text-sm">
                              💡 <strong>نصيحة:</strong> اتركي الحقل فارغًا إذا كنت لا تريدين عرض رابط معين. الروابط ستظهر في الفوتر والصفحات ذات الصلة.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics Settings */}
                  {activeSettingsTab === 'analytics' && (
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                          <BarChart className="w-5 h-5 text-purple-400" />
                          أدوات التحليلات والتتبع
                        </h3>
                        
                        <div className="space-y-8">
                          {/* Google Analytics */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <BarChart3 className="w-5 h-5 text-blue-400" />
                                  Google Analytics
                                </h4>
                                <p className="text-white/60 text-sm">تحليل الزوار وسلوكهم على الموقع</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('googleAnalytics', 'enabled', !analyticsSettings.googleAnalytics.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.googleAnalytics.enabled ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.googleAnalytics.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.googleAnalytics.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Measurement ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.googleAnalytics.measurementId}
                                  onChange={(e) => handleAnalyticsSettingChange('googleAnalytics', 'measurementId', e.target.value)}
                                  placeholder="G-XXXXXXXXXX"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">مثال: G-ABCD123456</p>
                              </div>
                            )}
                          </div>

                          {/* Microsoft Clarity */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Monitor className="w-5 h-5 text-orange-400" />
                                  Microsoft Clarity
                                </h4>
                                <p className="text-white/60 text-sm">تسجيل جلسات المستخدمين وخرائط الحرارة</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('microsoftClarity', 'enabled', !analyticsSettings.microsoftClarity.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.microsoftClarity.enabled ? 'bg-orange-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.microsoftClarity.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.microsoftClarity.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Project ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.microsoftClarity.projectId}
                                  onChange={(e) => handleAnalyticsSettingChange('microsoftClarity', 'projectId', e.target.value)}
                                  placeholder="abcdefghij"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">10 أحرف صغيرة</p>
                              </div>
                            )}
                          </div>

                          {/* Facebook Pixel */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Facebook className="w-5 h-5 text-blue-600" />
                                  Facebook Pixel
                                </h4>
                                <p className="text-white/60 text-sm">تتبع التحويلات والأحداث على فيسبوك</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('facebookPixel', 'enabled', !analyticsSettings.facebookPixel.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.facebookPixel.enabled ? 'bg-blue-600' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.facebookPixel.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.facebookPixel.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Pixel ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.facebookPixel.pixelId}
                                  onChange={(e) => handleAnalyticsSettingChange('facebookPixel', 'pixelId', e.target.value)}
                                  placeholder="123456789012345"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">15 رقم</p>
                              </div>
                            )}
                          </div>

                          {/* Google Tag Manager */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Target className="w-5 h-5 text-green-400" />
                                  Google Tag Manager
                                </h4>
                                <p className="text-white/60 text-sm">إدارة جميع العلامات والأكواد</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('googleTagManager', 'enabled', !analyticsSettings.googleTagManager.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.googleTagManager.enabled ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.googleTagManager.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.googleTagManager.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Container ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.googleTagManager.containerId}
                                  onChange={(e) => handleAnalyticsSettingChange('googleTagManager', 'containerId', e.target.value)}
                                  placeholder="GTM-XXXXXXX"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">مثال: GTM-1234567</p>
                              </div>
                            )}
                          </div>

                          {/* Google Search Console */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Search className="w-5 h-5 text-red-400" />
                                  Google Search Console
                                </h4>
                                <p className="text-white/60 text-sm">تحقق من ملكية الموقع لجوجل</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('googleSearchConsole', 'enabled', !analyticsSettings.googleSearchConsole.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.googleSearchConsole.enabled ? 'bg-red-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.googleSearchConsole.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.googleSearchConsole.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Verification Code</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.googleSearchConsole.verificationCode}
                                  onChange={(e) => handleAnalyticsSettingChange('googleSearchConsole', 'verificationCode', e.target.value)}
                                  placeholder="abcd1234efgh5678..."
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">الكود بدون علامات HTML</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <p className="text-purple-400 text-sm">
                              📊 <strong>معلومة:</strong> تأكد من الحصول على الأكواد الصحيحة من كل منصة. الأكواد ستعمل تلقائياً بعد التفعيل والحفظ.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeSettingsTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  إعدادات الأمان
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">المصادقة الثنائية</h4>
                      <p className="text-white/60 text-sm">تفعيل المصادقة الثنائية للحسابات الإدارية</p>
                    </div>
                    <button
                      onClick={() => handleSecuritySettingChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">محاولات تسجيل الدخول المسموحة</label>
                      <input
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => handleSecuritySettingChange('loginAttempts', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">انتهاء الجلسة (بالدقائق)</label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">سجل العمليات</h4>
                      <p className="text-white/60 text-sm">تسجيل جميع العمليات الإدارية</p>
                    </div>
                    <button
                      onClick={() => handleSecuritySettingChange('auditLog', !securitySettings.auditLog)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.auditLog ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.auditLog ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSettingsTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  إعدادات الإشعارات
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">الإشعارات عبر البريد الإلكتروني</h4>
                      <p className="text-white/60 text-sm">استقبال الإشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('emailNotifications', !notificationSettings.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.emailNotifications ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">إشعارات الطلبات الجديدة</h4>
                      <p className="text-white/60 text-sm">إشعار فوري عند وصول طلب جديد</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('newOrderNotifications', !notificationSettings.newOrderNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.newOrderNotifications ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.newOrderNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">إشعارات الدفع</h4>
                      <p className="text-white/60 text-sm">إشعار عند استلام دفعة جديدة</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('paymentNotifications', !notificationSettings.paymentNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.paymentNotifications ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.paymentNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">التقارير الأسبوعية</h4>
                      <p className="text-white/60 text-sm">تقرير أسبوعي بالإحصائيات</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('weeklyReports', !notificationSettings.weeklyReports)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.weeklyReports ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeSettingsTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  إعدادات النظام
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">التخزين المؤقت</h4>
                      <p className="text-white/60 text-sm">تفعيل التخزين المؤقت لتحسين الأداء</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingChange('cacheEnabled', !systemSettings.cacheEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.cacheEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemSettings.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">فترة الاحتفاظ بالسجلات (بالأيام)</label>
                      <input
                        type="number"
                        value={systemSettings.logRetention}
                        onChange={(e) => handleSystemSettingChange('logRetention', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>     
                      <label className="block text-white/70 text-sm font-medium mb-2">حد معدل API (طلب/ساعة)</label>
                      <input
                        type="number"
                        value={systemSettings.apiRateLimit}
                        onChange={(e) => handleSystemSettingChange('apiRateLimit', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">وضع التطوير</h4>
                      <p className="text-white/60 text-sm">تفعيل أدوات التطوير والتصحيح</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingChange('debugMode', !systemSettings.debugMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.debugMode ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeSettingsTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-400" />
                  النسخ الاحتياطي والصيانة
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">النسخ الاحتياطي التلقائي</h4>
                      <p className="text-white/60 text-sm">إنشاء نسخة احتياطية تلقائياً</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingChange('autoBackup', !systemSettings.autoBackup)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.autoBackup ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">تكرار النسخ الاحتياطي</label>
                    <select
                      value={systemSettings.backupFrequency}
                      onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">كل ساعة</option>
                      <option value="daily">يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      إنشاء نسخة احتياطية الآن
                    </button>
                    
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      تنظيف ذاكرة التخزين المؤقت
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  </div>
);
};

// Reports Tab Component
export const ReportsTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">التقارير</h2>
    <p className="text-white/60 text-lg">التقارير قريباً...</p>
  </div>
);

// Users Tab Component
export const UsersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">المستخدمين</h2>
    <p className="text-white/60 text-lg">إدارة المستخدمين قريباً...</p>
  </div>
);

