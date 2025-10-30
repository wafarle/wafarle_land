'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Gift, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface ReviewInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewClick: () => void;
  discountCode: string;
  discountPercentage: number;
  showDiscountCode?: boolean;
}

const ReviewInviteModal = ({ 
  isOpen, 
  onClose, 
  onReviewClick,
  discountCode,
  discountPercentage,
  showDiscountCode = false
}: ReviewInviteModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 opacity-10"></div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors z-10 shadow-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Gift Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
                  <Gift className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {showDiscountCode 
                    ? `شكراً لك! احصل على خصم ${discountPercentage}%`
                    : `قيمنا واحصل على خصم ${discountPercentage}%!`
                  }
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {showDiscountCode 
                    ? 'شكراً لتقييمك الإيجابي! استخدم كود الخصم التالي في طلبك القادم.'
                    : 'نحن نقدر رأيك! قم بتقييم خدماتنا واحصل على كود خصم حصري يمكنك استخدامه في طلبك القادم.'
                  }
                </p>

                {/* Discount Code Card - Show only if showDiscountCode is true */}
                {showDiscountCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-200"
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <p className="text-sm text-gray-600">كود الخصم الخاص بك</p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="bg-white rounded-lg px-6 py-3 border-2 border-yellow-300">
                        <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
                          {discountCode}
                        </p>
                      </div>
                      <button
                        onClick={handleCopy}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                          copied
                            ? 'bg-green-100 text-green-600 border-2 border-green-300'
                            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600 border-2 border-yellow-300'
                        }`}
                        title="نسخ الكود"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {copied ? 'تم النسخ!' : 'انقر لنسخ الكود'}
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                {!showDiscountCode ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        onReviewClick();
                        onClose();
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Star className="w-5 h-5 fill-white" />
                      تقييم الخدمات الآن
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      ربما لاحقاً
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      تم التنفيذ
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      الكود صالح لاستخدام واحد فقط
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewInviteModal;

