'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  ArrowLeft,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  Shield,
  Star,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Crown,
  Award,
  Target,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { License, Product as FirebaseProduct, Order } from '@/lib/firebase';
import { getLicenseById } from '@/lib/license-management';
import { getProducts, getOrders } from '@/lib/database';

interface StoreStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const licenseId = params.id as string;
  
  const [license, setLicense] = useState<License | null>(null);
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');
  const [stats, setStats] = useState<StoreStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    loadStoreData();
  }, [licenseId]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      
      // Load license data
      const licenseData = await getLicenseById(licenseId);
      if (!licenseData) {
        setLoading(false);
        return;
      }
      setLicense(licenseData);

      // Load all products from database
      const productsData = await getProducts();
      setProducts(productsData);

      // Load all orders from database
      const ordersData = await getOrders();
      setOrders(ordersData);

      // Calculate statistics
      const totalProducts = productsData.length;
      const activeProducts = productsData.filter(p => !p.isHidden && p.available !== false).length;
      const totalOrders = ordersData.length;
      const completedOrders = ordersData.filter(o => o.status === 'completed').length;
      const totalRevenue = ordersData
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalProducts,
        activeProducts,
        totalOrders,
        completedOrders,
        totalRevenue,
        averageOrderValue,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading store data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white/60 mt-4 text-lg">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-lg">المتجر غير موجود</p>
          <button
            onClick={() => router.push('/licenses/dashboard')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            العودة للوحة التراخيص
          </button>
        </div>
      </div>
    );
  }

  // Calculate product sales from orders
  const productSales = orders.reduce((acc, order) => {
    if (order.status === 'completed' && order.productId) {
      if (!acc[order.productId]) {
        acc[order.productId] = {
          count: 0,
          revenue: 0
        };
      }
      acc[order.productId].count += 1;
      acc[order.productId].revenue += order.totalAmount || 0;
    }
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Get best selling products
  const productsWithSales = products.map(product => ({
    ...product,
    sales: productSales[product.id]?.count || 0,
    revenue: productSales[product.id]?.revenue || 0
  }));
  const bestSellers = [...productsWithSales].sort((a, b) => b.sales - a.sales).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/licenses/dashboard')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  license.type === 'enterprise' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  license.type === 'professional' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    {license.customerName}
                    {license.type === 'enterprise' && <Crown className="w-6 h-6 text-yellow-400" />}
                  </h1>
                  <p className="text-sm text-white/60 flex items-center gap-2 mt-1">
                    <Globe className="w-4 h-4" />
                    {license.domain}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={loadStoreData}
                className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all">
                <Download className="w-5 h-5" />
                <span>تصدير البيانات</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Store Info Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-white/60 text-sm mb-2">معلومات الترخيص</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-yellow-400" />
                  <code className="text-yellow-400 font-mono text-sm">{license.licenseKey}</code>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    license.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    license.status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {license.status === 'active' ? 'نشط' :
                     license.status === 'trial' ? 'تجريبي' : 'منتهي'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white/60 text-sm mb-2">معلومات التواصل</h3>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/60" />
                  {license.customerEmail}
                </div>
                {license.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/60" />
                    {license.customerPhone}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white/60 text-sm mb-2">نوع الاشتراك</h3>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                license.type === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                license.type === 'professional' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {license.type === 'enterprise' ? '🏢 مؤسسي' :
                 license.type === 'professional' ? '💼 احترافي' : '📦 أساسي'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-blue-100 text-sm">إجمالي المنتجات</p>
                <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
              </div>
              <Package className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-blue-100 text-xs">{stats.activeProducts} نشط • {stats.totalProducts - stats.activeProducts} مخفي</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-green-100 text-sm">إجمالي الطلبات</p>
                <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-green-100 text-xs">{stats.completedOrders} مكتمل</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-purple-100 text-sm">إجمالي المبيعات</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.totalRevenue.toLocaleString('ar-SA', { 
                    style: 'currency', 
                    currency: 'SAR',
                    minimumFractionDigits: 2 
                  })}
                </p>
              </div>
              <DollarSign className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-purple-100 text-xs">من الطلبات المكتملة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-orange-100 text-sm">متوسط الطلب</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.averageOrderValue.toLocaleString('ar-SA', { 
                    style: 'currency', 
                    currency: 'SAR',
                    minimumFractionDigits: 2 
                  })}
                </p>
              </div>
              <Target className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-orange-100 text-xs">قيمة كل طلب</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 mb-8 overflow-hidden">
          <div className="flex border-b border-white/10">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'products', label: 'المنتجات', icon: Package },
              { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
              { id: 'analytics', label: 'التحليلات', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    المنتجات الأكثر مبيعاً
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bestSellers.length > 0 ? (
                      bestSellers.map((product, index) => (
                        <div
                          key={product.id}
                          className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-400/50 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              index === 1 ? 'bg-gray-400/20 text-gray-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              <Award className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold text-sm">{product.name}</h4>
                              <p className="text-white/60 text-xs">{product.category || 'غير محدد'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-white/60">المبيعات</p>
                              <p className="text-white font-bold">{product.sales || 0}</p>
                            </div>
                            <div>
                              <p className="text-white/60">الإيرادات</p>
                              <p className="text-green-400 font-bold">
                                {(product.revenue || 0).toLocaleString('ar-SA', { 
                                  style: 'currency', 
                                  currency: 'SAR',
                                  minimumFractionDigits: 0 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8">
                        <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">لا توجد مبيعات حتى الآن</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    آخر الطلبات
                  </h3>
                  <div className="space-y-3">
                    {orders.length > 0 ? (
                      orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{order.orderNumber || `#${order.id.slice(0, 8)}`}</p>
                              <p className="text-white/60 text-sm">{order.customerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <p className="text-white font-bold">
                                {(order.totalAmount || 0).toLocaleString('ar-SA', { 
                                  style: 'currency', 
                                  currency: 'SAR',
                                  minimumFractionDigits: 0 
                                })}
                              </p>
                              <p className="text-white/60 text-sm">{order.productName}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {order.status === 'completed' ? 'مكتمل' :
                               order.status === 'confirmed' ? 'مؤكد' :
                               order.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">لا توجد طلبات حتى الآن</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">جميع المنتجات</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="بحث..."
                        className="pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm">
                      إضافة منتج
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.length > 0 ? (
                    productsWithSales.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1 line-clamp-2">{product.name}</h4>
                            <p className="text-white/60 text-sm">{product.category || 'غير محدد'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            !product.isHidden && product.available !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {!product.isHidden && product.available !== false ? 'نشط' : 'مخفي'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div>
                            <p className="text-white/60">السعر</p>
                            <p className="text-white font-bold">
                              {product.price.toLocaleString('ar-SA', { 
                                style: 'currency', 
                                currency: 'SAR',
                                minimumFractionDigits: 0 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/60">المبيعات</p>
                            <p className="text-blue-400 font-bold">{product.sales || 0}</p>
                          </div>
                          <div>
                            <p className="text-white/60">الإيرادات</p>
                            <p className="text-green-400 font-bold">
                              {(product.revenue || 0).toLocaleString('ar-SA', { 
                                style: 'currency', 
                                currency: 'SAR',
                                minimumFractionDigits: 0 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/60">التقييم</p>
                            <p className="text-yellow-400 font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {product.rating || 0}
                            </p>
                          </div>
                        </div>

                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">لا توجد منتجات حتى الآن</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">جميع الطلبات</h3>
                  <div className="flex items-center gap-3">
                    <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                      <option value="all">جميع الحالات</option>
                      <option value="completed">مكتمل</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-400/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-bold">{order.orderNumber || `#${order.id.slice(0, 8)}`}</p>
                              <p className="text-white/60 text-sm">{order.customerName}</p>
                              <p className="text-white/40 text-xs mt-1">
                                {order.createdAt?.toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-white/60 text-xs">المنتج</p>
                              <p className="text-white font-bold text-sm">{order.productName}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-white/60 text-xs">الإجمالي</p>
                              <p className="text-green-400 font-bold">
                                {(order.totalAmount || 0).toLocaleString('ar-SA', { 
                                  style: 'currency', 
                                  currency: 'SAR',
                                  minimumFractionDigits: 0 
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {order.status === 'completed' ? 'مكتمل' :
                               order.status === 'confirmed' ? 'مؤكد' :
                               order.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">لا توجد طلبات حتى الآن</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">قريباً: تحليلات مفصلة ورسوم بيانية</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

