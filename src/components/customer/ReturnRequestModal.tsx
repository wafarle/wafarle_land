'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/firebase';
import { updateOrder } from '@/lib/database';

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReturnRequested: () => void;
}

export default function ReturnRequestModal({ isOpen, onClose, order, onReturnRequested }: ReturnRequestModalProps) {
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const returnReasons = [
    'المنتج لا يطابق الوصف',
    'المنتج معطوب',
    'المنتج لم يصل',
    'غير صحيح الحجم/اللون',
    'غير راضٍ عن الجودة',
    'أسباب أخرى'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;
    
    if (!returnReason.trim()) {
      setError('يرجى إدخال سبب الإرجاع');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await updateOrder(order.id, {
        returnStatus: returnType === 'return' ? 'requested' : 'requested',
        returnRequestedAt: new Date(),
        returnReason: returnReason,
      });

      onReturnRequested();
      onClose();
      setReturnReason('');
      setReturnType('return');
    } catch (error: any) {
      console.error('Error requesting return:', error);
      setError(error.message || 'حدث خطأ في طلب الإرجاع');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">طلب إرجاع/استبدال</h2>
                    <p className="text-sm text-white/90">طلب رقم: #{order.id.slice(-8)}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-3">معلومات الطلب</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">المنتج:</span>
                    <span className="text-gray-900 mr-2 font-medium">{order.productName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">المبلغ:</span>
                    <span className="text-gray-900 mr-2 font-medium">{order.totalAmount} {order.currency || 'SAR'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">الكمية:</span>
                    <span className="text-gray-900 mr-2 font-medium">{order.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">تاريخ الطلب:</span>
                    <span className="text-gray-900 mr-2 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Return Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  نوع الطلب
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setReturnType('return')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      returnType === 'return'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className={`w-5 h-5 ${returnType === 'return' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${returnType === 'return' ? 'text-orange-900' : 'text-gray-700'}`}>
                        إرجاع
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      إرجاع المنتج واسترداد المبلغ
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReturnType('exchange')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      returnType === 'exchange'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className={`w-5 h-5 ${returnType === 'exchange' ? 'text-orange-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${returnType === 'exchange' ? 'text-orange-900' : 'text-gray-700'}`}>
                        استبدال
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      استبدال المنتج بآخر
                    </p>
                  </button>
                </div>
              </div>

              {/* Return Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  سبب الإرجاع <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 mb-4">
                  {returnReasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReturnReason(reason)}
                      className={`w-full text-right p-3 rounded-lg border-2 transition-all ${
                        returnReason === reason
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="أو اكتب سبب الإرجاع بالتفصيل..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">ملاحظة مهمة:</p>
                    <ul className="list-disc list-inside space-y-1 text-right">
                      <li>سيتم مراجعة طلبك خلال 1-3 أيام عمل</li>
                      <li>سيتم إرسال رسالة بريد إلكتروني عند الموافقة</li>
                      <li>يرجى الاحتفاظ بالمنتج في حالة جيدة حتى يتم الموافقة</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}




