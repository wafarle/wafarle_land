'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Star, 
  Clock, 
  ShoppingCart, 
  Eye, 
  Package, 
  AlertCircle, 
  X, 
  ArrowRight,
  ChevronLeft,
  Search,
  Grid,
  List,
  Filter,
  Tag
} from 'lucide-react';
import { Product, Category } from '@/lib/firebase';
import { getProducts, getCategories, getCategoryById } from '@/lib/database';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import OrderForm from '@/components/OrderForm';
import QuickViewModal from '@/components/QuickViewModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !categorySlug) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all categories and find the one with matching slug
        const allCategories = await getCategories();
        const foundCategory = allCategories.find(c => c.slug === categorySlug);
        
        if (!foundCategory) {
          console.error('Category not found:', categorySlug);
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Load all products
        const productsData = await getProducts();
        setAllProducts(productsData);

        // Filter products by category
        const filtered = productsData.filter(product => {
          // Check if product has this category in categories array
          if (product.categories && product.categories.includes(foundCategory.id)) {
            return true;
          }
          // Fallback to old category field
          if (product.category === foundCategory.id || product.category === foundCategory.name) {
            return true;
          }
          return false;
        });

        setFilteredProducts(filtered);
      } catch (error) {
        console.error('Error loading category products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, categorySlug]);

  // Filter products by search term
  useEffect(() => {
    if (!category) return;

    const filtered = allProducts.filter(product => {
      const matchesCategory = 
        (product.categories && product.categories.includes(category.id)) ||
        product.category === category.id ||
        product.category === category.name;

      if (!matchesCategory) return false;

      if (!searchTerm.trim()) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredProducts(filtered);
  }, [searchTerm, allProducts, category]);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderForm(true);
  };

  // Generate Structured Data for SEO
  const structuredData = mounted && category ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'الرئيسية',
            item: typeof window !== 'undefined' ? window.location.origin : '',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'المنتجات',
            item: typeof window !== 'undefined' ? `${window.location.origin}/products` : '',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: typeof window !== 'undefined' ? window.location.href : '',
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: category.name,
        description: category.description || `منتجات ${category.name}`,
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
      {
        '@type': 'ItemList',
        name: `منتجات ${category.name}`,
        description: category.description || `قائمة بجميع منتجات ${category.name}`,
        numberOfItems: filteredProducts.length,
        itemListElement: filteredProducts.slice(0, 20).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: product.name,
            description: product.description,
            url: typeof window !== 'undefined' ? `${window.location.origin}/products/${product.id}` : '',
            image: product.image && product.image !== '/api/placeholder/300/200'
              ? (product.image.startsWith('http') ? product.image : `${typeof window !== 'undefined' ? window.location.origin : ''}${product.image}`)
              : undefined,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'SAR',
            },
          },
        })),
      },
    ],
  } : null;

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المنتجات...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-12 shadow-xl">
              <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">التصنيف غير موجود</h1>
              <p className="text-gray-600 mb-8">تعذر العثور على التصنيف المطلوب</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
                عرض جميع المنتجات
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <div 
        className="min-h-screen"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)'
        }}
        dir="rtl"
        suppressHydrationWarning
      >
        <Header />
        
        <main className="pt-20 pb-20">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
            <div className="container mx-auto px-4 md:px-6 py-4">
              <nav className="flex items-center gap-2 text-sm text-gray-600" itemScope itemType="https://schema.org/BreadcrumbList">
                <Link 
                  href="/" 
                  className="hover:text-blue-600 transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">الرئيسية</span>
                </Link>
                <ChevronLeft className="w-4 h-4" />
                <Link 
                  href="/products" 
                  className="hover:text-blue-600 transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">المنتجات</span>
                </Link>
                <ChevronLeft className="w-4 h-4" />
                <span 
                  className="text-gray-900 font-medium flex items-center gap-2" 
                  itemProp="name"
                >
                  {category.icon && <span>{category.icon}</span>}
                  {category.name}
                </span>
              </nav>
            </div>
          </div>

          {/* Category Header */}
          <div className="container mx-auto px-4 md:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                {category.icon && (
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                    style={{ 
                      backgroundColor: category.color ? `${category.color}15` : '#3b82f615',
                    }}
                  >
                    {category.icon}
                  </div>
                )}
                <h1 
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: category.color || '#1f2937' }}
                >
                  {category.name}
                </h1>
              </div>
              {category.description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                  {category.description}
                </p>
              )}
              <div className="mt-6 text-sm text-gray-500">
                {filteredProducts.length} منتج متاح
              </div>
            </motion.div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={
                      viewMode === 'grid'
                        ? 'bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 group'
                        : 'bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 group flex gap-4'
                    }
                  >
                    <Link
                      href={`/products/${product.id}`}
                      className={viewMode === 'list' ? 'flex-shrink-0 w-48 h-48' : 'block'}
                    >
                      <div
                        className={
                          viewMode === 'grid'
                            ? 'relative h-48 bg-gray-50 flex items-center justify-center p-6 overflow-hidden'
                            : 'relative w-full h-full bg-gray-50 flex items-center justify-center p-6 overflow-hidden'
                        }
                      >
                        {product.image && product.image !== '/api/placeholder/300/200' ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="relative z-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-2xl">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {product.discount && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md z-20">
                            {product.discount}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className={viewMode === 'list' ? 'flex-1 p-5 flex flex-col justify-between' : 'p-5'}>
                      <div>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                            {product.name}
                          </h3>
                        </Link>
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.floor(product.rating || product.rating || 0)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {(product.rating || product.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <CurrencyDisplay
                          price={product.price}
                          originalCurrency="USD"
                          className="text-xl font-bold text-gray-900"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickView(product)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="عرض سريع"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleOrder(product)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            طلب
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchTerm ? 'لا توجد نتائج' : 'لا توجد منتجات'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? 'حاول البحث بكلمات مختلفة'
                    : `لا توجد منتجات في تصنيف ${category.name} حالياً`}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    مسح البحث
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedProduct && (
        <OrderForm
          product={selectedProduct}
          isOpen={showOrderForm}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => {
            setShowQuickView(false);
            setQuickViewProduct(null);
          }}
          onOrderClick={() => {
            setShowQuickView(false);
            setSelectedProduct(quickViewProduct);
            setShowOrderForm(true);
          }}
        />
      )}
    </>
  );
}

