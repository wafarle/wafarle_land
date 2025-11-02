'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, 
  ChevronLeft,
  Star,
  ShoppingCart,
  Eye,
  Zap,
  TrendingUp,
  Package,
  Clock,
  Percent
} from 'lucide-react';
import { Product } from '@/lib/firebase';
import { getProducts } from '@/lib/database';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import OrderForm from '@/components/OrderForm';
import QuickViewModal from '@/components/QuickViewModal';

export default function DealsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'flash' | 'discount'>('all');

  const { addToCart } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setAllProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [mounted]);

  // Get products with discounts
  const discountedProducts = allProducts.filter(p => p.discount);

  // Get products with price options that have discounts
  const flashDeals = allProducts.filter(p => 
    p.hasPriceOptions && p.priceOptions && p.priceOptions.length > 1
  );

  // Get best deals
  const bestDeals = allProducts
    .filter(p => p.discount)
    .sort((a, b) => {
      const aDiscount = parseInt(a.discount?.replace('%', '') || '0');
      const bDiscount = parseInt(b.discount?.replace('%', '') || '0');
      return bDiscount - aDiscount;
    })
    .slice(0, 8);

  const displayProducts = 
    activeFilter === 'flash' ? flashDeals :
    activeFilter === 'discount' ? discountedProducts :
    bestDeals;

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
                <span className="text-gray-900 font-medium">العروض والتخفيضات</span>
              </nav>
            </div>
          </div>

          {/* Hero Section */}
          <section className="bg-gradient-to-br from-red-600 via-pink-600 to-orange-600 text-white py-16">
            <div className="container mx-auto px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl mx-auto"
              >
                <Percent className="w-16 h-16 mx-auto mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  العروض والتخفيضات
                </h1>
                <p className="text-xl text-white/90">
                  اغتنم أفضل العروض ووفر حتى 70% على اشتراكاتك المفضلة
                </p>
              </motion.div>
            </div>
          </section>

          <div className="container mx-auto px-4 md:px-6 py-12">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                أفضل العروض
              </button>
              <button
                onClick={() => setActiveFilter('flash')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeFilter === 'flash'
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-600'
                }`}
              >
                <Zap className="w-5 h-5" />
                عروض محدودة
              </button>
              <button
                onClick={() => setActiveFilter('discount')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeFilter === 'discount'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-600'
                }`}
              >
                <Tag className="w-5 h-5" />
                جميع الخصومات ({discountedProducts.length})
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg"
              >
                <Tag className="w-8 h-8 mb-3" />
                <div className="text-3xl font-bold mb-1">{discountedProducts.length}</div>
                <div className="text-white/80">منتج مخفض</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg"
              >
                <Zap className="w-8 h-8 mb-3" />
                <div className="text-3xl font-bold mb-1">{flashDeals.length}</div>
                <div className="text-white/80">عرض محدود</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg"
              >
                <TrendingUp className="w-8 h-8 mb-3" />
                <div className="text-3xl font-bold mb-1">70%</div>
                <div className="text-white/80">خصم حتى</div>
              </motion.div>
            </div>

            {/* Products Grid */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-red-300 group relative"
                  >
                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                        {product.discount}
                      </div>
                    )}

                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-48 bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
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
                      </div>
                    </Link>

                    <div className="p-5">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-3">
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

                      <div className="flex items-center justify-between mb-4">
                        <CurrencyDisplay
                          price={product.price}
                          originalCurrency="USD"
                          className="text-xl font-bold text-gray-900"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleQuickView(product)}
                          className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="عرض سريع"
                        >
                          <Eye className="w-5 h-5 text-gray-600 mx-auto" />
                        </button>
                        <button
                          onClick={() => handleOrder(product)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="hidden sm:inline">طلب</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl">
                <Tag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  لا توجد عروض حالياً
                </h3>
                <p className="text-gray-600 mb-6">
                  تابعنا للحصول على أحدث العروض والتخفيضات
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  تصفح جميع المنتجات
                </Link>
              </div>
            )}

            {/* Limited Time Notice */}
            {displayProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 justify-center text-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <p className="text-orange-900 font-medium">
                    العروض محدودة ومتاحة حتى نفاذ الكمية. لا تفوت الفرصة!
                  </p>
                </div>
              </motion.div>
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

