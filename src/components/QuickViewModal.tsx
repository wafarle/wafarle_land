'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Clock, 
  Shield, 
  Zap, 
  ShoppingCart, 
  ExternalLink,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Product } from '@/lib/firebase';
import CurrencyDisplay from './CurrencyDisplay';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onOrderClick: () => void;
}

export default function QuickViewModal({ 
  product, 
  onClose, 
  onOrderClick 
}: QuickViewModalProps) {
  const [selectedOption, setSelectedOption] = useState(0);

  const handleOrderClick = () => {
    onOrderClick();
  };

  const handleExternalLink = () => {
    window.open(product.externalLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">عرض سريع للمنتج</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-80 flex items-center justify-center">
                  {product.image && product.image !== '/api/placeholder/300/200' ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary-gold to-yellow-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 mx-auto">
                        {product.name.charAt(0)}
                      </div>
                      <p className="text-gray-500 text-lg font-medium">{product.name}</p>
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      خصم {product.discount}
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{product.averageRating || product.rating || 0}</span>
                    {product.reviewsCount && product.reviewsCount > 0 && (
                      <span className="text-xs text-gray-500">({product.reviewsCount})</span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-900">تسليم فوري</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-900">ضمان 100%</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-yellow-900">دعم 24/7</p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CurrencyDisplay 
                        price={product.price} 
                        originalCurrency="USD"
                        className="text-4xl font-bold text-gradient"
                      />
                      <span className="text-gray-500 block">شهرياً</span>
                    </div>
                    {product.discount && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500 line-through">
                          ${product.price * 2}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          وفر {product.discount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">المميزات الرئيسية</h4>
                  <div className="space-y-3">
                    {product.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleOrderClick}
                    className="w-full bg-gradient-to-r from-primary-gold to-yellow-500 hover:from-primary-gold/90 hover:to-yellow-500/90 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 text-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    اطلب الآن
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleExternalLink}
                    className="w-full bg-gradient-to-r from-primary-dark-navy to-blue-800 hover:from-primary-dark-navy/90 hover:to-blue-800/90 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3 text-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    اشتر مباشرة من الموقع الرسمي
                  </button>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>مضمون 100% - استرداد كامل خلال 30 يوم</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}






