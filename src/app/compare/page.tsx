'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronLeft,
  X,
  Check,
  Minus,
  ShoppingCart,
  Star,
  Package,
  GitCompare
} from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CurrencyDisplay from '@/components/CurrencyDisplay';

export default function ComparePage() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
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

  // Prepare comparison attributes
  const attributes = [
    { key: 'price', label: 'السعر', render: (product: any) => <CurrencyDisplay price={product.price} originalCurrency="USD" className="font-bold text-lg" /> },
    { key: 'rating', label: 'التقييم', render: (product: any) => (
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="font-medium">{(product.averageRating || product.rating || 0).toFixed(1)}/5</span>
      </div>
    )},
    { key: 'discount', label: 'الخصم', render: (product: any) => product.discount ? (
      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">{product.discount}</span>
    ) : <Minus className="w-5 h-5 text-gray-300" /> },
    { key: 'productType', label: 'نوع المنتج', render: (product: any) => {
      const types = {
        digital: 'رقمي',
        physical: 'ملموس',
        download: 'تنزيل',
        service: 'خدمة'
      };
      return <span className="font-medium">{types[product.productType as keyof typeof types] || 'رقمي'}</span>;
    }},
    { key: 'stock', label: 'التوفر', render: (product: any) => {
      if (product.productType === 'physical' && product.stockManagementEnabled) {
        return product.outOfStock || (product.stock || 0) <= 0 ? (
          <span className="text-red-600 font-medium">نفد من المخزون</span>
        ) : (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Check className="w-4 h-4" />
            متوفر ({product.stock})
          </span>
        );
      }
      return <span className="text-green-600 font-medium flex items-center gap-1"><Check className="w-4 h-4" />متوفر</span>;
    }},
    { key: 'features', label: 'المميزات', render: (product: any) => product.features && product.features.length > 0 ? (
      <ul className="text-sm space-y-1">
        {product.features.slice(0, 3).map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    ) : <Minus className="w-5 h-5 text-gray-300" /> },
    { key: 'hasOptions', label: 'خيارات الاشتراك', render: (product: any) => product.hasOptions && product.options?.length > 0 ? (
      <span className="text-blue-600 font-medium">{product.options.length} خطط</span>
    ) : <Minus className="w-5 h-5 text-gray-300" /> },
  ];

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
              <span className="text-gray-900 font-medium">المقارنة</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <GitCompare className="w-10 h-10 text-blue-600" />
                مقارنة المنتجات
              </h1>
              <p className="text-gray-600">
                {items.length > 0 
                  ? `مقارنة ${items.length} منتج (يمكن مقارنة حتى 4 منتجات)` 
                  : 'لا توجد منتجات للمقارنة'}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف جميع المنتجات من المقارنة؟')) {
                    clearCompare();
                  }
                }}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <X className="w-5 h-5" />
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
              <GitCompare className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                لا توجد منتجات للمقارنة
              </h2>
              <p className="text-gray-600 mb-8">
                أضف منتجات لمقارنتها ومعرفة الفروقات
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
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-right font-semibold text-gray-900 bg-gray-50 sticky right-0 z-10 min-w-[150px]">
                      المنتج
                    </th>
                    {items.map((product, index) => (
                      <th key={product.id} className="p-4 min-w-[250px] relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2 left-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Product Images and Names */}
                  <tr className="border-b border-gray-200">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50 sticky right-0 z-10">
                      المعلومات
                    </td>
                    {items.map((product) => (
                      <td key={product.id} className="p-4">
                        <div className="text-center">
                          <Link href={`/products/${product.id}`}>
                            <div className="w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-100">
                              {product.images?.[0] || product.image ? (
                                <img
                                  src={product.images?.[0] || product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-3xl">
                                  {product.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Comparison Attributes */}
                  {attributes.map((attr) => (
                    <tr key={attr.key} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50 sticky right-0 z-10">
                        {attr.label}
                      </td>
                      {items.map((product) => (
                        <td key={product.id} className="p-4 text-center">
                          {attr.render(product)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Add to Cart Buttons */}
                  <tr>
                    <td className="p-4 font-medium text-gray-700 bg-gray-50 sticky right-0 z-10">
                      الإجراءات
                    </td>
                    {items.map((product) => (
                      <td key={product.id} className="p-4">
                        <div className="space-y-2">
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            أضف للسلة
                          </button>
                          <Link
                            href={`/products/${product.id}`}
                            className="w-full border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                          >
                            عرض التفاصيل
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Help Text */}
          {items.length > 0 && items.length < 4 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                يمكنك إضافة حتى {4 - items.length} منتج إضافي للمقارنة
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

