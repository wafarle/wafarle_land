'use client';

import CurrencySettings from '@/components/CurrencySettings';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { 
  OverviewTab, 
  AnalyticsTab, 
  MessagesTab, 
  SettingsTab,
  ReportsTab,
  UsersTab
} from '@/components/admin/DashboardTabs';
import { ProductsTab, ProductForm } from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';
import CustomersTab from '@/components/admin/CustomersTab';
import CurrencyTab from '@/components/admin/CurrencyTab';
import ChatTab from '@/components/admin/ChatTab';
import {BlogTab} from '@/components/admin/BlogTab';
import {SEOTab} from '@/components/admin/SEOTab';
import ReviewsTab from '@/components/admin/ReviewsTab';
import {ReviewInviteTab} from '@/components/admin/ReviewInviteTab';
import {CouponsTab} from '@/components/admin/CouponsTab';
import {PaymentGatewaysTab} from '@/components/admin/PaymentGatewaysTab';
import {ReturnsTab} from '@/components/admin/ReturnsTab';
import {EmailNotificationsTab} from '@/components/admin/EmailNotificationsTab';
import {LoyaltyProgramTab} from '@/components/admin/LoyaltyProgramTab';
import {EmailServiceTab} from '@/components/admin/EmailServiceTab';
import {CategoriesTab} from '@/components/admin/CategoriesTab';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { onAuthStateChange, signOutAdmin, isAdmin } from '@/lib/auth';
import { getProducts, addProduct, updateProduct, deleteProduct, subscribeToProducts } from '@/lib/database';
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  Package,
  Settings,
  BarChart3,
  Users,
  MessageSquare,
  MessageCircle,
  Eye,
  TrendingUp,
  DollarSign,
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
  Target,
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
  Menu,
  X,
  Gift,
  Ticket,
  CreditCard,
  RotateCcw,
  Mail,
  Send,
  Tag,
  Key,
  Code,
  ExternalLink
} from 'lucide-react';
import { Product } from '@/lib/firebase';

const Dashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'طلب جديد', message: 'طلب اشتراك Netflix من أحمد محمد', time: 'منذ 5 دقائق', type: 'success' },
    { id: 2, title: 'دفعة مستلمة', message: 'تم استلام دفعة بقيمة $25.99', time: 'منذ 15 دقيقة', type: 'info' },
    { id: 3, title: 'مشكلة تقنية', message: 'مشكلة في تفعيل اشتراك Spotify', time: 'منذ ساعة', type: 'warning' },
  ]);

  // Check window size for sidebar
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Initial check
    checkDesktop();
    
    // Add resize listener
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Check authentication and load data
  useEffect(() => {
    let authChecked = false;

    // Check authentication first
    const unsubscribe = onAuthStateChange((user) => {
      if (!authChecked) {
        authChecked = true;
        
        // In production, redirect if not authenticated or not admin
        if (process.env.NODE_ENV === 'production') {
          if (!user || !isAdmin(user)) {
            router.push('/admin');
            return;
          }
        } else {
          // In development, show warning but allow access for testing
          if (!user || !isAdmin(user)) {
            // Development mode - allow access for testing Firebase rules
            // This is expected when using test mode rules
          }
        }
      }
    });

    const loadData = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to mock data if Firebase fails
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Netflix Premium',
            price: 12.99,
            image: '/api/placeholder/300/200',
            externalLink: 'https://netflix.com',
            description: 'مشاهدة أفلام ومسلسلات بجودة 4K بدون إعلانات',
            createdAt: new Date(),
            category: 'streaming',
            discount: '50%',
            rating: 4.9,
            features: ['4K Ultra HD', 'مشاهدة متعددة الأجهزة', 'تحميل للمشاهدة لاحقاً'],
          },
          {
            id: '2',
            name: 'Spotify Premium',
            price: 9.99,
            image: '/api/placeholder/300/200',
            externalLink: 'https://spotify.com',
            description: 'استماع للموسيقى بدون إعلانات مع إمكانية التحميل',
            createdAt: new Date(),
            category: 'music',
            discount: '40%',
            rating: 4.8,
            features: ['بدون إعلانات', 'تحميل للمشاهدة لاحقاً', 'جودة عالية'],
          },
        ];
        setProducts(mockProducts);
        setLoading(false);
      }
    };

    // Small delay to allow auth check first
    setTimeout(() => {
      loadData();
    }, 100);

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      router.push('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        ));
      } else {
        const newId = await addProduct(productData);
        const newProduct: Product = {
          id: newId,
          ...productData,
          createdAt: new Date(),
        };
        setProducts([newProduct, ...products]);
      }
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Globe, color: 'from-blue-500 to-cyan-500' },
    { id: 'products', label: 'المنتجات', icon: Package, color: 'from-purple-500 to-pink-500' },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3, color: 'from-emerald-500 to-teal-500' },
    { id: 'customers', label: 'العملاء', icon: Users, color: 'from-orange-500 to-red-500' },
    { id: 'orders', label: 'الطلبات', icon: Target, color: 'from-indigo-500 to-purple-500' },
    { id: 'chat', label: 'المحادثات', icon: MessageCircle, color: 'from-green-500 to-emerald-500', count: chatCount },
    { id: 'messages', label: 'الرسائل', icon: MessageSquare, color: 'from-pink-500 to-rose-500' },
    { id: 'currency', label: 'العملة', icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
    { id: 'seo', label: 'SEO', icon: Search, color: 'from-teal-500 to-cyan-500' },
    { id: 'reviews', label: 'التقييمات', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { id: 'reviewInvite', label: 'دعوة التقييم', icon: Gift, color: 'from-pink-500 to-rose-500' },
    { id: 'coupons', label: 'أكواد الخصم', icon: Ticket, color: 'from-green-500 to-emerald-500' },
    { id: 'paymentGateways', label: 'بوابات الدفع', icon: CreditCard, color: 'from-indigo-500 to-blue-500' },
    { id: 'returns', label: 'الإرجاع والاستبدال', icon: RotateCcw, color: 'from-orange-500 to-red-500' },
    { id: 'emailNotifications', label: 'إشعارات البريد', icon: Mail, color: 'from-purple-500 to-pink-500' },
    { id: 'emailService', label: 'خدمة البريد', icon: Send, color: 'from-cyan-500 to-blue-500' },
    { id: 'loyalty', label: 'نقاط الولاء', icon: Crown, color: 'from-yellow-500 to-orange-500' },
    { id: 'categories', label: 'التصنيفات', icon: Tag, color: 'from-violet-500 to-purple-500' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'from-gray-500 to-slate-500' },
    { id: 'blog', label: 'المدونه', icon: Settings, color: 'from-gray-500 to-slate-500' }
  ];

  const stats = [
    {
      label: 'إجمالي المنتجات',
      value: products.length,
      icon: Package,
      change: '+12%',
      changeType: 'positive',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      label: 'المستخدمون النشطون',
      value: '1,234',
      icon: Users,
      change: '+8%',
      changeType: 'positive',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100'
    },
    {
      label: 'الإيرادات الشهرية',
      value: '$12,345',
      icon: DollarSign,
      change: '+15%',
      changeType: 'positive',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      label: 'الطلبات الجديدة',
      value: '56',
      icon: Target,
      change: '+23%',
      changeType: 'positive',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    },
    {
      label: 'معدل التحويل',
      value: '3.2%',
      icon: TrendingUp,
      change: '-2%',
      changeType: 'negative',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100'
    },
    {
      label: 'الرسائل المعلقة',
      value: '12',
      icon: MessageSquare,
      change: '-5%',
      changeType: 'positive',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100'
    },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-white/70 text-lg">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style={{ paddingBottom: '45px' }} dir="rtl">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">لوحة إدارة وفرلي</h1>
                  <p className="text-sm text-white/60 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <a
                href="/admin/license"
                className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 px-4 py-2 rounded-xl transition-all duration-300 border border-white/20"
              >
                <Shield className="w-4 h-4" />
                <span>🔐 ترخيص المتجر</span>
              </a>
              
              <a
                href="/"
                className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300"
              >
                <Home className="w-4 h-4" />
                <span>الموقع الرئيسي</span>
              </a>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-theme(spacing.20))] overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || isDesktop) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 h-[calc(100vh-theme(spacing.20))] overflow-y-auto dashboard-scroll scrollable-container"
              style={{ padding: '15px' }}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    القائمة الرئيسية
                  </h3>
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                            activeTab === tab.id
                              ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl transform scale-105`
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold">{tab.label}</span>
                          {activeTab === tab.id && (
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Quick Actions */}
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    إجراءات سريعة
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
                      <Download className="w-4 h-4" />
                      <span>تصدير البيانات</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
                      <Filter className="w-4 h-4" />
                      <span>تصفية النتائج</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
                      <Database className="w-4 h-4" />
                      <span>نسخ احتياطي</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="dashboard-content flex-1 h-[calc(100vh-theme(spacing.20))] overflow-y-auto dashboard-scroll scrollable-container mobile-scroll p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" style={{ marginBottom: '10px' }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-white/30 transition-all duration-300 group"
                  style={{ padding: '15px' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      stat.changeType === 'positive'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      <span>{stat.change}</span>
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white w-7 h-7" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 40 + 60}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden" style={{ padding: '15px', marginBottom: '10px' }}>
            <div className="tab-content">
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'products' && (
                <ProductsTab
                  products={filteredProducts}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onAddProduct={() => setShowAddForm(true)}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'customers' && <CustomersTab onCustomersCountChange={setCustomersCount} />}
              {activeTab === 'orders' && <OrdersTab onOrdersCountChange={setOrdersCount} />}
              {activeTab === 'chat' && <ChatTab onMessagesCountChange={setChatCount} />}
              {activeTab === 'messages' && <MessagesTab notifications={notifications} />}
              {activeTab === 'currency' && <CurrencyTab />}
              {activeTab === 'seo' && <SEOTab />}
              {activeTab === 'reviews' && <ReviewsTab />}
              {activeTab === 'reviewInvite' && <ReviewInviteTab />}
              {activeTab === 'coupons' && <CouponsTab />}
              {activeTab === 'paymentGateways' && <PaymentGatewaysTab />}
              {activeTab === 'returns' && <ReturnsTab />}
              {activeTab === 'emailNotifications' && <EmailNotificationsTab />}
              {activeTab === 'emailService' && <EmailServiceTab />}
              {activeTab === 'loyalty' && <LoyaltyProgramTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'settings' && <SettingsTab />}
              {activeTab === 'blog' && <BlogTab />}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default Dashboard;
