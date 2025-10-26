'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Clock, Shield, Zap } from 'lucide-react';
import { Product } from '@/lib/firebase';
import CurrencyDisplay from './CurrencyDisplay';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'الكل', icon: '🌟' },
    { id: 'streaming', name: 'البث المباشر', icon: '📺' },
    { id: 'music', name: 'الموسيقى', icon: '🎵' },
    { id: 'gaming', name: 'الألعاب', icon: '🎮' },
    { id: 'productivity', name: 'الإنتاجية', icon: '💼' },
  ];

  useEffect(() => {
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
      {
        id: '3',
        name: 'Shahid VIP',
        price: 7.99,
        image: '/api/placeholder/300/200',
        externalLink: 'https://shahid.mbc.net',
        description: 'محتوى عربي حصري من MBC وأفضل المسلسلات العربية',
        createdAt: new Date(),
        category: 'streaming',
        discount: '35%',
        rating: 4.7,
        features: ['محتوى عربي حصري', 'مسلسلات جديدة', 'أفلام عربية'],
      },
      {
        id: '4',
        name: 'Disney+ Premium',
        price: 11.99,
        image: '/api/placeholder/300/200',
        externalLink: 'https://disneyplus.com',
        description: 'Disney، Marvel، Star Wars، National Geographic والمزيد',
        createdAt: new Date(),
        category: 'streaming',
        discount: '45%',
        rating: 4.9,
        features: ['محتوى Disney حصري', 'أفلام Marvel', 'مسلسلات Star Wars'],
      },
      {
        id: '5',
        name: 'Apple Music',
        price: 10.99,
        image: '/api/placeholder/300/200',
        externalLink: 'https://music.apple.com',
        description: 'مكتبة موسيقية ضخمة مع ميزات Apple الحصرية',
        createdAt: new Date(),
        category: 'music',
        discount: '30%',
        rating: 4.6,
        features: ['مكتبة ضخمة', 'جودة Lossless', 'تكامل مع Apple'],
      },
      {
        id: '6',
        name: 'Adobe Creative Cloud',
        price: 52.99,
        image: '/api/placeholder/300/200',
        externalLink: 'https://adobe.com',
        description: 'جميع تطبيقات Adobe للإبداع والتصميم',
        createdAt: new Date(),
        category: 'productivity',
        discount: '60%',
        rating: 4.8,
        features: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects'],
      },
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <section id="services" className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الخدمات...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="bg-gray-50" style={{ paddingTop: '45px', paddingBottom: '45px' }}>
      <div className="container px-4 md:px-6" dir="rtl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
          style={{ marginBottom: '10px' }}
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            خدماتنا <span className="text-gradient">المميزة</span>
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            اكتشف مجموعة واسعة من خدمات الاشتراكات التي نقدمها بأسعار تنافسية وجودة عالية
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 md:gap-6 mb-12 md:mb-16"
          style={{ marginBottom: '10px' }}
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
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10" style={{ marginBottom: '10px' }}>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card group hover:scale-105"
              style={{ padding: '15px' }}
            >
              {/* Product Header */}
              <div className="relative mb-8">
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                </div>
                
                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    خصم {product.discount}
                  </div>
                )}

                {/* Rating */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              </div>

              {/* Product Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {product.features?.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CurrencyDisplay 
                        price={product.price} 
                        originalCurrency="USD"
                        className="text-3xl font-bold text-gradient"
                      />
                      <span className="text-sm text-gray-500 block">شهرياً</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>تسليم فوري</span>
                    </div>
                  </div>
                  
                  <a
                    href={product.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center"
                  >
                    اشتر الآن
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              لا تجد ما تبحث عنه؟
            </h3>
            <p className="text-gray-600 mb-6">
              تواصل معنا للحصول على عرض سعر مخصص لأي خدمة اشتراك أخرى
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact" className="btn-primary">
                تواصل معنا
              </a>
              <a href="tel:0593607607" className="btn-secondary">
                اتصل الآن
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Products;