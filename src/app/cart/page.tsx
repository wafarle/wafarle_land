'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Package,
  AlertCircle,
  X,
  Tag,
  ChevronLeft,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFormatPrice } from '@/contexts/CurrencyContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CurrencyDisplay from '@/components/CurrencyDisplay';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { formatPrice } = useFormatPrice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const totalPrice = getTotalPrice();
  const shippingCost = items.some(item => item.product.type === 'physical') ? 50 : 0;
  const tax = totalPrice * 0.15; // 15% VAT
  const finalTotal = totalPrice + shippingCost + tax;

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
              <span className="text-gray-900 font-medium">السلة</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                سلة التسوق
              </h1>
              <p className="text-gray-600">
                {items.length > 0 ? `لديك ${items.length} منتج في السلة` : 'السلة فارغة'}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من تفريغ السلة؟')) {
                    clearCart();
                  }
                }}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                تفريغ السلة
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
            >
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                السلة فارغة
              </h2>
              <p className="text-gray-600 mb-8">
                لم تقم بإضافة أي منتجات بعد
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => {
                    const selectedOption = item.selectedOptionId
                      ? item.product.priceOptions?.find((opt) => opt.name === item.selectedOptionId)
                      : null;
                    const itemPrice = selectedOption?.price || item.product.price;
                    const itemTotal = itemPrice * item.quantity;

                    return (
                      <motion.div
                        key={`${item.product.id}-${item.selectedOptionId}-${item.selectedColor}-${item.selectedSize}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200"
                      >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <Link
                            href={`/products/${item.product.id}`}
                            className="flex-shrink-0"
                          >
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.product.image ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
                                  {item.product.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/products/${item.product.id}`}>
                              <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            
                            {/* Options */}
                            <div className="space-y-1 mb-3">
                              {selectedOption && (
                                <p className="text-sm text-gray-600">
                                  الخطة: <span className="font-medium">{selectedOption.name}</span>
                                </p>
                              )}
                              {item.selectedColor && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  اللون: 
                                  <span
                                    className="w-5 h-5 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.selectedColor }}
                                  ></span>
                                </p>
                              )}
                              {item.selectedSize && (
                                <p className="text-sm text-gray-600">
                                  المقاس: <span className="font-medium">{item.selectedSize}</span>
                                </p>
                              )}
                            </div>

                            {/* Price and Quantity */}
                            <div className="flex items-center justify-between">
                              <div>
                                <CurrencyDisplay
                                  price={itemPrice}
                                  originalCurrency="USD"
                                  className="text-xl font-bold text-gray-900"
                                />
                                {item.quantity > 1 && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    الإجمالي: {formatPrice(itemTotal)}
                                  </p>
                                )}
                              </div>

                              {/* Quantity Controls */}
                              {item.product.type === 'physical' && (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">ملخص الطلب</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>المجموع الفرعي</span>
                      <span className="font-semibold">{formatPrice(totalPrice)}</span>
                    </div>
                    
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>الشحن</span>
                        <span className="font-semibold">{formatPrice(shippingCost)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-700">
                      <span>ضريبة القيمة المضافة (15%)</span>
                      <span className="font-semibold">{formatPrice(tax)}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-gray-900 text-lg font-bold">
                        <span>الإجمالي</span>
                        <span>{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-4"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    إتمام الطلب
                  </Link>

                  <Link
                    href="/products"
                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    متابعة التسوق
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Package className="w-5 h-5 text-green-600" />
                      <span>شحن مجاني للطلبات فوق 200 ريال</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Tag className="w-5 h-5 text-blue-600" />
                      <span>دفع آمن ومضمون</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

