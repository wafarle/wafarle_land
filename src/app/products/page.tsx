'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Clock, ShoppingCart, Eye, Package, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/firebase';
import { getProducts } from '@/lib/database';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import OrderForm from '@/components/OrderForm';
import QuickViewModal from '@/components/QuickViewModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AllProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categories = [
    { id: 'all', name: 'الكل', icon: '🌟' },
    { id: 'streaming', name: 'البث المباشر', icon: '📺' },
    { id: 'music', name: 'الموسيقى', icon: '🎵' },
    { id: 'gaming', name: 'الألعاب', icon: '🎮' },
    { id: 'productivity', name: 'الإنتاجية', icon: '💼' },
  ];

  useEffect(() => {
    if (!mounted) return;
    
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [mounted]);

  // Generate Structured Data for SEO (BreadcrumbList and ItemList)
  const structuredData = mounted ? {
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
        ],
      },
      {
        '@type': 'ItemList',
        name: 'جميع المنتجات',
        description: 'قائمة بجميع خدمات الاشتراكات المتاحة',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((product, index) => ({
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

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderForm(true);
  };

  const handleQuickViewClick = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
    setSelectedProduct(null);
  };

  const handleCloseQuickView = () => {
    setShowQuickView(false);
    setQuickViewProduct(null);
  };

  const filteredProducts = (selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory))
    .filter(p => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.features || []).some(f => f.toLowerCase().includes(q))
      );
    });

  return (
    <>
      {/* Structured Data for SEO */}
      {mounted && structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <ArrowRight className="w-4 h-4" />
                الرئيسية
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              جميع <span className="text-gradient">المنتجات</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto" itemProp="description">
              اكتشف مجموعة واسعة من خدمات الاشتراكات التي نقدمها بأسعار تنافسية وجودة عالية
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل المنتجات...</p>
            </div>
          ) : (
            <>
              {/* Category & Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-12"
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm md:text-base ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
                <div className="w-full md:w-auto md:ml-auto max-w-md">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن خدمة أو ميزة..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </motion.div>

              {/* Products Count */}
              {!loading && (
                <div className="mb-6 text-center">
                  <p className="text-gray-600">
                    عرض <span className="font-bold text-blue-600">{filteredProducts.length}</span> من أصل{' '}
                    <span className="font-bold">{products.length}</span> منتج
                  </p>
                </div>
              )}

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-xl text-gray-600 mb-4">لم يتم العثور على منتجات</p>
                  <p className="text-gray-500">جرب تغيير الفئة أو البحث بكلمات مختلفة</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filteredProducts.filter(p => p.id).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                      onClick={(e) => {
                        const tag = (e.target as HTMLElement).tagName;
                        if (tag === 'BUTTON' || tag === 'A' || tag === 'LABEL' || 
                            (e.target as HTMLElement).closest('button') || 
                            (e.target as HTMLElement).closest('a') || 
                            (e.target as HTMLElement).closest('label')) {
                          return;
                        }
                        router.push(`/products/${product.id}`);
                      }}
                    >
                      {/* Product Image/Icon */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-3xl">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                        
                        {/* Discount Badge */}
                        {product.discount && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            خصم {product.discount}
                          </div>
                        )}

                        {/* Stock Status Badge */}
                        {product.type === 'physical' && true && (
                          <div className="absolute bottom-4 right-4">
                            {!product.inStock || (product.stock || 0) <= 0 ? (
                              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <X className="w-3 h-3" />
                                نفد من المخزون
                              </div>
                            ) : (product.stock || 0) <= 10 ? (
                              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                آخر {product.stock} قطعة
                              </div>
                            ) : (
                              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                متوفر ({product.stock})
                              </div>
                            )}
                          </div>
                        )}

                        {/* Rating */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{product.rating || product.rating || 0}</span>
                          {product.reviews?.count && product.reviews?.count > 0 && (
                            <span className="text-xs text-gray-500">({product.reviews?.count})</span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                          <div className="space-y-1 mb-4">
                            {product.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Price & Actions */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <CurrencyDisplay 
                                price={product.price} 
                                originalCurrency="USD"
                                className="text-2xl font-bold text-gradient"
                              />
                              <span className="text-xs text-gray-500 block">شهرياً</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>تسليم فوري</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleQuickViewClick(product)}
                              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 text-xs"
                            >
                              <Eye className="w-3 h-3" />
                              عرض سريع
                            </button>
                            <button
                              onClick={() => handleOrderClick(product)}
                              disabled={product.type === 'physical' && true && (!product.inStock || (product.stock || 0) <= 0)}
                              className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 text-xs ${
                                product.type === 'physical' && true && (!product.inStock || (product.stock || 0) <= 0)
                                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                              }`}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              {product.type === 'physical' && true && (!product.inStock || (product.stock || 0) <= 0) ? 'نفد' : 'اطلب الآن'}
                            </button>
                          </div>
                          <a
                            href={product.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full bg-gradient-to-r from-primary-dark-navy to-blue-800 hover:from-primary-dark-navy/90 hover:to-blue-800/90 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            اشتر مباشرة
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Order Form Modal */}
      {selectedProduct && (
        <OrderForm
          product={selectedProduct}
          isOpen={showOrderForm}
          onClose={handleCloseOrderForm}
        />
      )}

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={handleCloseQuickView}
          onOrderClick={() => {
            setShowQuickView(false);
            setSelectedProduct(quickViewProduct);
            setShowOrderForm(true);
          }}
        />
      )}
      </div>
    </>
  );
}

