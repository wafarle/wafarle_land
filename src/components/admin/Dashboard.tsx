'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  RefreshCw
} from 'lucide-react';
import { Product } from '@/lib/firebase';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from Firebase
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Netflix Premium',
        price: 12.99,
        image: '/api/placeholder/300/200',
        externalLink: 'https://netflix.com',
        description: 'Unlimited movies and TV shows',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Spotify Premium',
        price: 9.99,
        image: '/api/placeholder/300/200',
        externalLink: 'https://spotify.com',
        description: 'Ad-free music streaming',
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Shahid VIP',
        price: 7.99,
        image: '/api/placeholder/300/200',
        externalLink: 'https://shahid.mbc.net',
        description: 'Arabic content streaming',
        createdAt: new Date(),
      },
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    // In real app, this would clear auth state
    window.location.href = '/admin';
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const tabs = [
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'messages', label: 'الرسائل', icon: MessageSquare },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const stats = [
    { 
      label: 'إجمالي المنتجات', 
      value: products.length, 
      icon: Package, 
      change: '+12%',
      changeType: 'positive',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      label: 'المستخدمون النشطون', 
      value: '1,234', 
      icon: Users, 
      change: '+8%',
      changeType: 'positive',
      color: 'from-green-500 to-green-600'
    },
    { 
      label: 'الإيرادات', 
      value: '$12,345', 
      icon: DollarSign, 
      change: '+15%',
      changeType: 'positive',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      label: 'الرسائل', 
      value: '56', 
      icon: MessageSquare, 
      change: '-3%',
      changeType: 'negative',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
          <p className="mt-4 text-primary-dark-navy">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="ltr">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 ">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">و</span>
              </div>
              <div className="">
                <h1 className="text-2xl font-bold text-gray-800">لوحة إدارة وفرلي</h1>
                <p className="text-sm text-gray-500 flex items-center space-x-2 ">
                  <Clock size={14} />
                  <span>آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 ">
              <button className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-300">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-300">
                <RefreshCw size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2  text-gray-600 hover:text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-lg transition-all duration-300"
              >
                <LogOut size={20} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center space-x-1  px-2 py-1 rounded-full text-xs font-semibold ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span>{stat.change}</span>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={28} />
                  </div>
                </div>
                <div className="">
                  <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 ">القائمة الرئيسية</h3>
              <nav className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3  px-4 py-4 rounded-xl transition-all duration-300  ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                      }`}
                    >
                      <span className="font-semibold">{tab.label}</span>
                      <Icon size={22} />
                    </button>
                  );
                })}
              </nav>
              
              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 ">إجراءات سريعة</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-3  px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-orange-500 rounded-lg transition-all duration-300 ">
                    <span>تصدير البيانات</span>
                    <Download size={18} />
                  </button>
                  <button className="w-full flex items-center space-x-3  px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-orange-500 rounded-lg transition-all duration-300 ">
                    <span>تصفية النتائج</span>
                    <Filter size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <div className="">
                    <h2 className="text-3xl font-bold text-gray-800">إدارة المنتجات</h2>
                    <p className="text-gray-600 mt-2">إدارة جميع منتجات الاشتراك الخاصة بك</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2  hover:shadow-lg transition-all duration-300"
                  >
                    <span>إضافة منتج جديد</span>
                    <Plus size={20} />
                  </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex items-center space-x-4  mb-6">
                  <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300">
                    <Filter size={20} />
                  </button>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="البحث في المنتجات..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 "
                    />
                  </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className=" py-4 px-6 font-semibold text-gray-700">المنتج</th>
                        <th className=" py-4 px-6 font-semibold text-gray-700">السعر</th>
                        <th className=" py-4 px-6 font-semibold text-gray-700">الرابط</th>
                        <th className=" py-4 px-6 font-semibold text-gray-700">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-300">
                          <td className="py-6 px-6">
                            <div className="flex items-center space-x-4 ">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-lg">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <span className="font-bold text-orange-500 text-lg">{product.price}</span>
                          </td>
                          <td className="py-6 px-6">
                            <a
                              href={product.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2  text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-300"
                            >
                              <span className="text-sm font-semibold">عرض الرابط</span>
                              <Eye size={16} />
                            </a>
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex space-x-2 ">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:shadow-md"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-md"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-primary-dark-navy mb-6">Analytics</h2>
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Analytics dashboard coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-primary-dark-navy mb-6">Customers</h2>
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Customer management coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-primary-dark-navy mb-6">Messages</h2>
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Message center coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-primary-dark-navy mb-6">Settings</h2>
                <div className="text-center py-12">
                  <Settings className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Settings panel coming soon...</p>
                </div>
              </div>
            )}
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
          onSave={(product) => {
            if (editingProduct) {
              const updatedProduct: Product = {
                ...product,
                id: editingProduct.id,
                createdAt: editingProduct.createdAt,
              };
              setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
            } else {
              const newProduct: Product = {
                ...product,
                id: Date.now().toString(),
                createdAt: new Date(),
              };
              setProducts([...products, newProduct]);
            }
            setShowAddForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Product Form Component
const ProductForm = ({ 
  product, 
  onClose, 
  onSave 
}: { 
  product: Product | null; 
  onClose: () => void; 
  onSave: (product: Omit<Product, 'id' | 'createdAt'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    image: product?.image || '',
    externalLink: product?.externalLink || '',
    description: product?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 ">
          {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 ">
              اسم المنتج
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 "
              placeholder="أدخل اسم المنتج"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 ">
              السعر
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 "
              placeholder="أدخل السعر (مثال: 9.99)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 ">
              الرابط الخارجي
            </label>
            <input
              type="url"
              value={formData.externalLink}
              onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 "
              placeholder="أدخل الرابط الخارجي"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 ">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none "
              placeholder="أدخل وصف المنتج"
            />
          </div>

          <div className="flex space-x-4  pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold"
            >
              {product ? 'تحديث' : 'إضافة'} المنتج
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Dashboard;
