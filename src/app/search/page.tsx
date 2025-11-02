'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  X,
  ChevronLeft,
  Star,
  ShoppingCart,
  Eye,
  Package,
  Grid,
  List
} from 'lucide-react';
import { Product, Category } from '@/lib/firebase';
import { getProducts, getCategories } from '@/lib/database';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import OrderForm from '@/components/OrderForm';
import QuickViewModal from '@/components/QuickViewModal';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // Filters
  const [filters, setFilters] = useState({
    categories: [] as string[],
    minPrice: '',
    maxPrice: '',
    rating: 0,
    productType: 'all' as 'all' | 'digital' | 'physical' | 'download' | 'service',
    inStock: false,
    hasDiscount: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setAllProducts(productsData);
        setCategories(categoriesData.filter(c => c.isActive));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted]);

  // Filter products
  useEffect(() => {
    let result = [...allProducts];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(product =>
        product.categories?.some(cat => filters.categories.includes(cat)) ||
        (product.category && filters.categories.includes(product.category))
      );
    }

    // Price filter
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      result = result.filter(product => product.price >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      result = result.filter(product => product.price <= maxPrice);
    }

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter(product =>
        (product.rating || product.rating || 0) >= filters.rating
      );
    }

    // Product type filter
    if (filters.productType !== 'all') {
      result = result.filter(product => product.type === filters.productType);
    }

    // In stock filter
    if (filters.inStock) {
      result = result.filter(product =>
        product.type !== 'physical' ||
        (product.inStock && (product.stock || 0) > 0)
      );
    }

    // Has discount filter
    if (filters.hasDiscount) {
      result = result.filter(product => product.discount);
    }

    setFilteredProducts(result);
  }, [searchQuery, filters, allProducts]);

  const toggleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      minPrice: '',
      maxPrice: '',
      rating: 0,
      productType: 'all',
      inStock: false,
      hasDiscount: false,
    });
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderForm(true);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        
        <main className="pt-24 pb-20">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 md:px-6 py-4">
              <nav className="flex items-center gap-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  الرئيسية
                </Link>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-gray-900 font-medium">البحث</span>
              </nav>
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 py-8">
            {/* Search Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                بحث متقدم
              </h1>

              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتجات، فئات، أو كلمات مفتاحية..."
                    className="w-full pr-12 pl-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    showFilters
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-600'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden md:inline">فلترة</span>
                </button>
              </div>

              {/* Results Count */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-600">
                  {filteredProducts.length > 0 
                    ? `${filteredProducts.length} منتج متاح`
                    : 'لا توجد نتائج'}
                  {searchQuery && ` لـ "${searchQuery}"`}
                </p>
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="lg:col-span-1"
                  >
                    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">الفلاتر</h2>
                        <button
                          onClick={clearFilters}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          مسح الكل
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Categories */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">التصنيفات</h3>
                          <div className="space-y-2">
                            {categories.map((cat) => (
                              <label
                                key={cat.id}
                                className="flex items-center gap-3 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.categories.includes(cat.id)}
                                  onChange={() => toggleCategoryFilter(cat.id)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-gray-700 group-hover:text-gray-900 flex items-center gap-2">
                                  {cat.icon && <span>{cat.icon}</span>}
                                  {cat.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Price Range */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">السعر</h3>
                          <div className="flex gap-3">
                            <input
                              type="number"
                              placeholder="من"
                              value={filters.minPrice}
                              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="number"
                              placeholder="إلى"
                              value={filters.maxPrice}
                              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Rating */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">التقييم</h3>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <label
                                key={rating}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <input
                                  type="radio"
                                  name="rating"
                                  checked={filters.rating === rating}
                                  onChange={() => setFilters({...filters, rating})}
                                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex items-center gap-1">
                                  {[...Array(rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  ))}
                                  <span className="text-gray-600 text-sm mr-1">وأكثر</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Product Type */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">نوع المنتج</h3>
                          <select
                            value={filters.productType}
                            onChange={(e) => setFilters({...filters, productType: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="all">الكل</option>
                            <option value="digital">رقمي</option>
                            <option value="physical">ملموس</option>
                            <option value="download">تنزيل</option>
                            <option value="service">خدمة</option>
                          </select>
                        </div>

                        {/* Additional Filters */}
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.inStock}
                              onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">متوفر فقط</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.hasDiscount}
                              onChange={(e) => setFilters({...filters, hasDiscount: e.target.checked})}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">يوجد خصم</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Grid */}
              <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
                {filteredProducts.length > 0 ? (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
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
                              {product.images?.[0] || product.image ? (
                                <img
                                  src={product.images?.[0] || product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                  {product.name.charAt(0)}
                                </div>
                              )}
                              {product.discount && (
                                <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
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
                                  <span className="hidden sm:inline">طلب</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      لا توجد نتائج
                    </h3>
                    <p className="text-gray-600 mb-6">
                      جرب تغيير معايير البحث أو الفلاتر
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      مسح جميع الفلاتر
                    </button>
                  </div>
                )}
              </div>
            </div>
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

