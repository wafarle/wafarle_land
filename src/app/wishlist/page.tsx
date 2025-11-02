'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  ArrowRight,
  ChevronLeft,
  Star,
  X
} from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CurrencyDisplay from '@/components/CurrencyDisplay';

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  if (!mounted) {
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
              <span className="text-gray-900 font-medium">المفضلة</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-10 h-10 text-red-500 fill-red-500" />
                المفضلة
              </h1>
              <p className="text-gray-600">
                {items.length > 0 ? `لديك ${items.length} منتج في المفضلة` : 'لا توجد منتجات في المفضلة'}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف جميع المنتجات من المفضلة؟')) {
                    clearWishlist();
                  }
                }}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                حذف الكل
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                لا توجد منتجات في المفضلة
              </h2>
              <p className="text-gray-600 mb-8">
                ابدأ بإضافة منتجاتك المفضلة
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ArrowRight className="w-5 h-5" />
                تصفح المنتجات
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {items.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group relative"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 left-3 z-10 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-lg transition-all"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </button>

                    {/* Product Image */}
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-48 bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : product.image ? (
                          <img
                            src={product.image}
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

                    {/* Product Info */}
                    <div className="p-5">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.floor((product as any).averageRating || product.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {((product as any).averageRating || product.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      {/* Price */}
                      <CurrencyDisplay
                        price={product.price}
                        originalCurrency="USD"
                        className="text-xl font-bold text-gray-900 mb-4"
                      />

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => {
                          handleAddToCart(product);
                          removeFromWishlist(product.id);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        أضف للسلة
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

