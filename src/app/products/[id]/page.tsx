'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Star,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  Verified,
  Calendar,
  Minus,
  Plus,
  Info,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ShoppingCart,
  Heart,
  GitCompare,
} from 'lucide-react';
import { Product, Category } from '@/lib/firebase';
import { getProducts, getSubscriptionReviews, getCategories, getCategoryById } from '@/lib/database';
import { getProductById } from '@/lib/products';
import { SubscriptionReview } from '@/lib/firebase';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import OrderForm from '@/components/OrderForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductImageGallery from '@/components/ProductImageGallery';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';

// Define consistent className outside component to prevent hydration mismatch
const CONTAINER_CLASS_NAME = "min-h-screen";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<SubscriptionReview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'info'>('details');
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [sliderIndex, setSliderIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Cart, Wishlist, and Compare contexts
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  
  // Note: We'll use product-specific options instead of global customization

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !productId) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(productId);
        
        if (!productData) {
          setLoading(false);
          return;
        }

        setProduct(productData);

        // Load categories
        const allCategories = await getCategories();
        setCategories(allCategories);

        // Load related products
        const allProducts = await getProducts();
        // Get products that share at least one category
        const related = allProducts
          .filter(p => {
            if (p.id === productId) return false;
            if (productData.categories && productData.categories.length > 0) {
              return p.categories?.some(catId => productData.categories?.includes(catId)) ||
                     (productData.category && p.category === productData.category);
            }
            return p.category === productData.category;
          })
          .slice(0, 8);
        setRelatedProducts(related);

        // Load reviews for this product
        setReviewsLoading(true);
        try {
          const productReviews = await getSubscriptionReviews(undefined, productId, 'approved');
          setReviews(productReviews);
        } catch (error) {
          console.error('Error loading reviews:', error);
        } finally {
          setReviewsLoading(false);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, mounted]);

  const handleOrderClick = () => {
    // Validate subscription option selection if product has price options
    if (product?.hasPriceOptions && product.priceOptions && product.priceOptions.length > 0) {
      if (!selectedOptionId) {
        alert('يرجى اختيار خطة الاشتراك أولاً');
        return;
      }
    }
    setShowOrderForm(true);
  };

  // Get selected option
  const selectedOption = product?.hasPriceOptions && product.priceOptions 
    ? product.priceOptions.find(opt => opt.name === selectedOptionId) 
    : null;

  // Set default option on product load
  useEffect(() => {
    if (product?.hasPriceOptions && product.priceOptions && product.priceOptions.length > 0) {
      const defaultOption = product.priceOptions[0];
      if (defaultOption) {
        setSelectedOptionId(defaultOption.name);
      }
    }
    // Reset slider when product changes
    setSliderIndex(0);
  }, [product]);

  // Auto-slide for related products (pause when dragging)
  useEffect(() => {
    if (relatedProducts.length > 4 && !isDragging) {
      const interval = setInterval(() => {
        setSliderIndex((prev) => {
          const maxIndex = Math.ceil(relatedProducts.length / 4) - 1;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [relatedProducts.length, isDragging]);

  const handleCloseOrderForm = () => {
    setShowOrderForm(false);
  };

  if (!mounted || loading) {
    return (
      <div 
        className={CONTAINER_CLASS_NAME} 
        style={{
          background: 'linear-gradient(to bottom right, rgb(249 250 251), rgba(59 130 246 / 0.2), rgba(168 85 247 / 0.2))'
        }}
        dir="rtl" 
        suppressHydrationWarning
      >
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المنتج...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div 
        className={CONTAINER_CLASS_NAME} 
        style={{
          background: 'linear-gradient(to bottom right, rgb(249 250 251), rgba(59 130 246 / 0.2), rgba(168 85 247 / 0.2))'
        }}
        dir="rtl" 
        suppressHydrationWarning
      >
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-12 shadow-xl">
              <AlertCircle className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">المنتج غير موجود</h1>
              <p className="text-gray-600 mb-8">تعذر العثور على المنتج المطلوب</p>
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

  const productImages = product.images && product.images.length > 0
    ? product.images.filter(img => img && img !== '/api/placeholder/300/200')
    : (product.image && product.image !== '/api/placeholder/300/200' 
      ? [product.image] 
      : []);

  // Generate Structured Data for SEO (only after mount to avoid hydration mismatch)
  let structuredData: any = null;
  
  if (mounted) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wafarle.com';
    const productUrl = typeof window !== 'undefined' ? window.location.href : `https://wafarle.com/products/${product.id}`;
    
    const productStructuredData: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || '',
      brand: {
        '@type': 'Brand',
        name: 'وافرلي - wafarle',
      },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'SAR',
        availability: product.type === 'physical' && (!product.inStock || (product.stock || 0) <= 0)
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        url: productUrl,
      },
    };

    // Add image if available
    if (productImages.length > 0) {
      const imageUrl = productImages[0].startsWith('http') 
        ? productImages[0] 
        : `${baseUrl}${productImages[0]}`;
      productStructuredData.image = imageUrl;
    }

    // Add aggregate rating if available
    if (product.reviews && product.reviews.count > 0) {
      productStructuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.reviews.rating || product.rating || 0,
        reviewCount: product.reviews.count,
        bestRating: 5,
        worstRating: 1,
      };
    }

    // Add reviews if available
    if (reviews.length > 0) {
      productStructuredData.review = reviews
        .filter(r => r.isApproved)
        .slice(0, 5)
        .map((review) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.customerName,
          },
          datePublished: new Date(review.createdAt).toISOString(),
          reviewBody: review.comment,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
          },
        }));
    }

    // Breadcrumb Structured Data
    const breadcrumbItems: any[] = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'المنتجات',
        item: `${baseUrl}/products`,
      },
    ];

    // Add categories to breadcrumb
    let position = 3;
    if (product.categories && product.categories.length > 0 && categories.length > 0) {
      product.categories.forEach((catId) => {
        const category = categories.find(c => c.id === catId);
        if (category) {
          breadcrumbItems.push({
            '@type': 'ListItem',
            position: position++,
            name: category.name,
            item: `${baseUrl}/products/category/${category.slug}`,
          });
        }
      });
    } else if (product.category) {
      // Try to find category by id or name to get slug
      const oldCategory = categories.find(c => c.id === product.category || c.name === product.category);
      if (oldCategory) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: position++,
          name: oldCategory.name,
          item: `${baseUrl}/products/category/${oldCategory.slug}`,
        });
      } else {
        // Fallback to category name as slug
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: position++,
          name: product.category,
          item: `${baseUrl}/products/category/${encodeURIComponent(product.category)}`,
        });
      }
    }

    // Add product name
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: position,
      name: product.name,
      item: productUrl,
    });

    const breadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    };

    structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumbStructuredData,
        productStructuredData,
      ],
    };
  }

  return (
    <>
      {/* Structured Data for SEO */}
      {mounted && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      <div 
        className={CONTAINER_CLASS_NAME}
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)'
        }}
        dir="rtl" 
        suppressHydrationWarning
      >
      <Header />
      <main className="pt-20 pb-20">
        {/* Clean Breadcrumb */}
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
              {/* Show categories in breadcrumb */}
              {product.categories && product.categories.length > 0 && categories.length > 0 ? (
                product.categories.map((catId, index) => {
                  const category = categories.find(c => c.id === catId);
                  if (!category) return null;
                  return (
                    <span key={catId}>
                      {index > 0 && <ChevronLeft className="w-4 h-4 mx-1" />}
                      <Link
                        href={`/products/category/${category.slug}`}
                        className="hover:text-blue-600 transition-colors"
                        itemProp="item"
                      >
                        <span itemProp="name" className="flex items-center gap-1">
                          {category.icon && <span>{category.icon}</span>}
                          {category.name}
                        </span>
                      </Link>
                    </span>
                  );
                })
              ) : product.category ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  {(() => {
                    const oldCategory = categories.find(c => c.id === product.category || c.name === product.category);
                    if (oldCategory) {
                      return (
                        <Link
                          href={`/products/category/${oldCategory.slug}`}
                          className="hover:text-blue-600 transition-colors"
                          itemProp="item"
                        >
                          <span itemProp="name" className="flex items-center gap-1">
                            {oldCategory.icon && <span>{oldCategory.icon}</span>}
                            {oldCategory.name}
                          </span>
                        </Link>
                      );
                    }
                    return (
                      <span itemProp="name" className="text-gray-900 font-medium">
                        {product.category}
                      </span>
                    );
                  })()}
                </>
              ) : null}
              <ChevronLeft className="w-4 h-4" />
              <span className="text-gray-900 font-medium" itemProp="name">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
          {/* Main Product Section - E-commerce Style Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Product Images Gallery - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductImageGallery
                images={productImages}
                productName={product.name}
                discount={product.discount}
                stock={product.type === 'physical' ? product.stock : undefined}
                outOfStock={product.type === 'physical' ? !product.inStock : false}
                lowStockThreshold={10}
              />
            </motion.div>

            {/* Product Info - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Product Title */}
              <div>
                {/* Categories */}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.categories.map((catId) => {
                      const category = categories.find(c => c.id === catId);
                      if (!category) return null;
                      return (
                        <Link
                          key={catId}
                          href={`/products/category/${category.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                          style={{
                            backgroundColor: category.color ? `${category.color}15` : '#3b82f615',
                            color: category.color || '#3b82f6',
                            border: `1px solid ${category.color ? `${category.color}40` : '#3b82f640'}`
                          }}
                        >
                          {category.icon && <span>{category.icon}</span>}
                          <span>{category.name}</span>
                        </Link>
                      );
                    })}
                    {product.category && !product.categories.includes(product.category) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {product.category}
                      </span>
                    )}
                  </div>
                )}
                {(!product.categories || product.categories.length === 0) && product.category && (
                  <div className="mb-4">
                    {(() => {
                      const oldCategory = categories.find(c => c.id === product.category || c.name === product.category);
                      if (oldCategory) {
                        return (
                          <Link
                            href={`/products/category/${oldCategory.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
                          >
                            {oldCategory.icon && <span>{oldCategory.icon}</span>}
                            <span>{oldCategory.name}</span>
                          </Link>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {product.category}
                        </span>
                      );
                    })()}
                  </div>
                )}
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight" itemProp="name">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.floor(product.rating || product.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : star === Math.ceil(product.rating || product.rating || 0) && (product.rating || product.rating || 0) % 1 > 0
                            ? 'text-yellow-400 fill-yellow-400 opacity-50'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-700 font-semibold">
                    {(product.rating || product.rating || 0).toFixed(1)}/5
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="flex items-baseline gap-4">
                <CurrencyDisplay
                  price={selectedOption ? selectedOption.price : product.price}
                  originalCurrency="USD"
                  className="text-4xl font-bold text-gray-900"
                />
                {(!selectedOption && product.discount) && (
                  <span className="text-lg text-green-600 font-semibold">
                    خصم {product.discount}
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-700 leading-relaxed" itemProp="description">
                  {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                </p>
              </div>

              {/* Subscription Options (Duration Plans) */}
              {product.hasPriceOptions && product.priceOptions && product.priceOptions.length > 0 && (
                <div>
                  <label className="block text-gray-900 font-semibold mb-3">اختر خطة الاشتراك</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.priceOptions.map((option) => (
                      <button
                        key={option.name}
                        onClick={() => setSelectedOptionId(option.name)}
                        className={`p-4 rounded-xl border-2 transition-all text-right ${
                          selectedOptionId === option.name
                            ? 'border-gray-900 bg-gray-900 text-white ring-2 ring-gray-400'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${false ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{option.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{option.name}</p>
                          </div>
                          {false && (
                            <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              الأكثر شعبية
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <CurrencyDisplay
                            price={option.price}
                            originalCurrency="USD"
                            className={`text-xl font-bold ${selectedOptionId === option.name ? 'text-white' : 'text-gray-900'}`}
                          />
                          {0 && 0 > option.price && (
                            <>
                              <span className={`text-sm line-through ${selectedOptionId === option.name ? 'text-white/60' : 'text-gray-400'}`}>
                                ${0}
                              </span>
                              {0 && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  -{0}%
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection - From product data */}
              {product.hasColorOptions && product.colorOptions && product.colorOptions.length > 0 && (
                <div>
                  <label className="block text-gray-900 font-semibold mb-3">اختر اللون</label>
                  <div className="flex gap-3 flex-wrap">
                    {product.colorOptions.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          selectedColor === color.name
                            ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.hexCode || color.name }}
                        aria-label={`اختر اللون ${color.name}`}
                      >
                        {selectedColor === color.name && (
                          <CheckCircle className="w-6 h-6 text-white mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection - From product data */}
              {product.hasSizeOptions && product.sizeOptions && product.sizeOptions.length > 0 && (
                <div>
                  <label className="block text-gray-900 font-semibold mb-3">اختر المقاس</label>
                  <div className="flex gap-3 flex-wrap">
                    {product.sizeOptions.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size.name)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          selectedSize === size.name
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector - Only for physical products */}
              {product.type === 'physical' && true && (
                <div className="flex items-center gap-4">
                  <label className="text-gray-900 font-semibold">الكمية:</label>
                  <div className="flex items-center gap-4 bg-gray-100 rounded-lg px-4 py-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-semibold text-gray-900 w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Add to Cart Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (product) {
                      addToCart(product, quantity, {
                        selectedOptionId,
                        selectedColor,
                        selectedSize
                      });
                    }
                  }}
                  disabled={product.type === 'physical' && (!product.inStock || (product.stock || 0) <= 0)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    product.type === 'physical' && (!product.inStock || (product.stock || 0) <= 0)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.type === 'physical' && (!product.inStock || (product.stock || 0) <= 0)
                    ? 'نفد من المخزون'
                    : isInCart(product.id)
                    ? 'تمت الإضافة للسلة'
                    : 'أضف للسلة'}
                </motion.button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Order Now Button */}
                  <button
                    onClick={handleOrderClick}
                    disabled={product.type === 'physical' && (!product.inStock || (product.stock || 0) <= 0)}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      product.type === 'physical' && (!product.inStock || (product.stock || 0) <= 0)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    اطلب الآن
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => {
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlist(product);
                      }
                    }}
                    className={`py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isInWishlist(product.id)
                        ? 'bg-red-50 text-red-600 border-2 border-red-600'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-600 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    {isInWishlist(product.id) ? 'مضاف' : 'مفضلة'}
                  </button>
                </div>

                {/* Compare Button */}
                <button
                  onClick={() => {
                    if (isInCompare(product.id)) {
                      removeFromCompare(product.id);
                    } else {
                      if (canAddMore()) {
                        addToCompare(product);
                      } else {
                        alert('يمكنك مقارنة 4 منتجات كحد أقصى');
                      }
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isInCompare(product.id)
                      ? 'bg-purple-50 text-purple-600 border-2 border-purple-600'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600'
                  }`}
                >
                  <GitCompare className="w-5 h-5" />
                  {isInCompare(product.id) ? 'في المقارنة' : 'أضف للمقارنة'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Bottom Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-8">
                {[
                  { id: 'details', label: 'تفاصيل المنتج', icon: Info },
                  { id: 'reviews', label: `التقييمات والمراجعات`, icon: MessageSquare },
                  { id: 'info', label: 'الأسئلة الشائعة', icon: HelpCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-4 font-semibold transition-all duration-200 flex items-center gap-2 border-b-2 ${
                        isActive
                          ? 'text-gray-900 border-gray-900'
                          : 'text-gray-600 border-transparent hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8 md:p-10">
              {activeTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">وصف المنتج</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                    </p>
                  </div>
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">أهم الميزات</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {reviewsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">جاري تحميل المراجعات...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-xl text-gray-600 mb-2">لا توجد مراجعات بعد</p>
                      <p className="text-gray-500">كن أول من يقيم هذا المنتج!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-white via-gray-50/50 to-blue-50/40 rounded-2xl p-6 border-2 border-gray-100/80 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {review.customerName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">{review.customerName}</h4>
                                {review.isApproved && (
                                  <div className="bg-blue-100 p-1 rounded-full">
                                    <Verified className="w-5 h-5 text-blue-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm font-semibold text-gray-700 mr-2">({review.rating}/5)</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(review.createdAt).toLocaleDateString('ar-SA', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <h5 className="font-bold text-gray-900 mb-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{review.comment}</h5>
                          )}
                          <p className="text-gray-700 leading-relaxed bg-white/60 p-4 rounded-xl border border-gray-100">{review.comment}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'info' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">ما هي مدة الشحن؟</h3>
                    <p className="text-gray-700">عادة ما يتم الشحن خلال 3-5 أيام عمل.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">هل يمكن إرجاع المنتج؟</h3>
                    <p className="text-gray-700">نعم، يمكنك إرجاع المنتج خلال 30 يوماً من الشراء.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">ما هي طرق الدفع المتاحة؟</h3>
                    <p className="text-gray-700">نقبل جميع البطاقات الائتمانية والدفع عند الاستلام.</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Customer Reviews Section - Professional */}
          {reviews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mb-20"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 p-8 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8" />
                        آراء العملاء
                      </h2>
                      <p className="text-blue-100">تعرف على تجربة العملاء الآخرين مع هذا المنتج</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-6 h-6 fill-current" />
                        <span className="text-3xl font-bold">{(product.rating || product.rating || 0).toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-blue-100">
                        {product.reviews?.count || 0 || reviews.length} {product.reviews?.count || 0 || reviews.length === 1 ? 'تقييم' : 'تقييم'}
                      </div>
                    </div>
                  </div>
                </div>

              <div className="p-8 md:p-10">
                {reviewsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل المراجعات...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600 mb-2">لا توجد مراجعات بعد</p>
                    <p className="text-gray-500">كن أول من يقيم هذا المنتج!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {review.customerName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">{review.customerName}</h3>
                              {review.isApproved && (
                                <Verified className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">({review.rating}/5)</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(review.createdAt).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">{review.comment}</h4>
                        )}
                        
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                        {/* Helpful counter removed - not in interface */}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating Distribution - Clean Design */}
              {reviews.length > 0 && (
                <div className="bg-gray-50 p-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">توزيع التقييمات</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(r => r.rating === rating).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-4">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-sm font-semibold text-gray-700 w-4">{rating}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: rating * 0.1 }}
                              className="bg-yellow-500 h-full rounded-full"
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-16 text-left">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>
            </motion.div>
          )}

          {/* Related Products - Slider */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mb-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  منتجات مشابهة
                </h2>
                <p className="text-gray-600">اكتشف منتجات أخرى قد تهمك</p>
              </div>
              
              {/* Slider Container */}
              <div className="relative">
                {/* Navigation Buttons */}
                {relatedProducts.length > 4 && (
                  <>
                    <button
                      onClick={() => setSliderIndex(Math.max(0, sliderIndex - 1))}
                      disabled={sliderIndex === 0}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all ${
                        sliderIndex === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 hover:scale-110'
                      }`}
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setSliderIndex(Math.min(Math.ceil(relatedProducts.length / 4) - 1, sliderIndex + 1))}
                      disabled={sliderIndex >= Math.ceil(relatedProducts.length / 4) - 1}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all ${
                        sliderIndex >= Math.ceil(relatedProducts.length / 4) - 1
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 hover:scale-110'
                      }`}
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Slider Wrapper */}
                <div className="overflow-hidden relative" style={{ paddingRight: relatedProducts.length > 4 ? '3rem' : '0', paddingLeft: relatedProducts.length > 4 ? '3rem' : '0' }}>
                  <motion.div
                      drag="x"
                      dragConstraints={{ 
                        left: relatedProducts.length > 4 ? -((Math.ceil(relatedProducts.length / 4) - 1) * 100) : 0,
                        right: 0 
                      }}
                      dragElastic={0.2}
                      onDragStart={(e, info) => {
                        setDragStart(info.point.x);
                        setIsDragging(true);
                      }}
                      onDragEnd={(e, info) => {
                        setIsDragging(false);
                        const threshold = 50;
                        const diff = dragStart - info.point.x;
                        
                        if (Math.abs(diff) > threshold) {
                          if (diff > 0 && sliderIndex < Math.ceil(relatedProducts.length / 4) - 1) {
                            // Swipe right (next)
                            setSliderIndex(sliderIndex + 1);
                          } else if (diff < 0 && sliderIndex > 0) {
                            // Swipe left (previous)
                            setSliderIndex(sliderIndex - 1);
                          }
                        }
                      }}
                      animate={{
                        x: relatedProducts.length > 4 ? `-${sliderIndex * 100}%` : '0%'
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30
                      }}
                      className="flex cursor-grab active:cursor-grabbing"
                      style={{ width: `${Math.ceil(relatedProducts.length / 4) * 100}%` }}
                    >
                      {Array.from({ length: Math.ceil(relatedProducts.length / 4) }).map((_, slideIndex) => (
                        <div
                          key={slideIndex}
                          className="flex-shrink-0 flex gap-6"
                          style={{ width: '100%', scrollSnapAlign: 'start' }}
                        >
                          {relatedProducts.slice(slideIndex * 4, slideIndex * 4 + 4).map((relatedProduct, index) => (
                            <motion.div
                              key={relatedProduct.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1.1 + (slideIndex * 4 + index) * 0.05 }}
                              whileHover={{ y: -5 }}
                              className="flex-shrink-0"
                              style={{ 
                                width: 'calc(25% - 1.125rem)',
                                minWidth: 'calc(25% - 1.125rem)'
                              }}
                            >
                        <Link
                          href={`/products/${relatedProduct.id}`}
                          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group border border-gray-200 hover:border-blue-300 block h-full"
                          onClick={(e) => {
                            if (isDragging) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="relative h-48 bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
                            {relatedProduct.image ? (
                              <img
                                src={relatedProduct.image}
                                alt={relatedProduct.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="relative z-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <span className="text-white font-bold text-2xl">
                                  {relatedProduct.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            {relatedProduct.discount && (
                              <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md z-20">
                                {relatedProduct.discount}
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors text-base">
                              {relatedProduct.name}
                            </h3>
                            <div className="flex items-center justify-between">
                              <CurrencyDisplay
                                price={relatedProduct.price}
                                originalCurrency="USD"
                                className="text-xl font-bold text-gray-900"
                              />
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Link>
                          </motion.div>
                        ))}
                          </div>
                        ))}
                      </motion.div>
                </div>

                {/* Slider Indicators */}
                {relatedProducts.length > 4 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(relatedProducts.length / 4) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSliderIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          sliderIndex === index
                            ? 'bg-blue-600 w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />

      {/* Order Form Modal */}
      {product && showOrderForm && (
        <OrderForm
          product={product}
          isOpen={showOrderForm}
          onClose={handleCloseOrderForm}
          selectedOptionId={selectedOptionId || undefined}
        />
      )}
      </div>
    </>
  );
}
