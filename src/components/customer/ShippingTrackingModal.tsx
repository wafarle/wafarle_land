'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, MapPin, Calendar, Package, CheckCircle2, Clock, Package2, ArrowRight, Copy } from 'lucide-react';
import { Order } from '@/lib/firebase';

interface ShippingTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const ShippingTrackingModal = ({ isOpen, onClose, order }: ShippingTrackingModalProps) => {
  if (!order) return null;

  // Get shipping status config
  const getShippingStatusConfig = (status?: string) => {
    const configs: Record<string, { label: string; color: string; icon: any; bgColor: string; description: string }> = {
      pending_shipping: {
        label: 'بانتظار الشحن',
        color: 'text-gray-600',
        icon: Clock,
        bgColor: 'bg-gray-50',
        description: 'الطلب قيد التحضير وسيتم شحنه قريباً'
      },
      prepared: {
        label: 'تم التحضير',
        color: 'text-blue-600',
        icon: Package2,
        bgColor: 'bg-blue-50',
        description: 'تم تجهيز الطلب وجاهز للشحن'
      },
      shipped: {
        label: 'تم الشحن',
        color: 'text-purple-600',
        icon: Truck,
        bgColor: 'bg-purple-50',
        description: 'تم شحن الطلب وهو في طريق الوصول إليك'
      },
      in_transit: {
        label: 'في الطريق',
        color: 'text-yellow-600',
        icon: ArrowRight,
        bgColor: 'bg-yellow-50',
        description: 'الطلب في الطريق إلى عنوانك'
      },
      delivered: {
        label: 'تم التسليم',
        color: 'text-green-600',
        icon: CheckCircle2,
        bgColor: 'bg-green-50',
        description: 'تم تسليم الطلب بنجاح'
      }
    };
    return configs[status || 'pending_shipping'] || configs.pending_shipping;
  };

  const shippingStatus = order.shippingStatus || 'pending_shipping';
  const statusConfig = getShippingStatusConfig(shippingStatus);
  const StatusIcon = statusConfig.icon;

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'غير محدد';
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // يمكن إضافة toast notification هنا
  };

  // Shipping timeline steps
  const timelineSteps = [
    { status: 'pending_shipping', label: 'بانتظار الشحن', completed: true },
    { status: 'prepared', label: 'تم التحضير', completed: shippingStatus !== 'pending_shipping' },
    { status: 'shipped', label: 'تم الشحن', completed: ['shipped', 'in_transit', 'delivered'].includes(shippingStatus) },
    { status: 'in_transit', label: 'في الطريق', completed: ['in_transit', 'delivered'].includes(shippingStatus) },
    { status: 'delivered', label: 'تم التسليم', completed: shippingStatus === 'delivered' }
  ];

  const getCurrentStepIndex = () => {
    return timelineSteps.findIndex(step => step.status === shippingStatus);
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-xl"></div>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">تتبع الشحن</h2>
                      <p className="text-white/80 text-sm">رقم الطلب: #{order.id.slice(-8)}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm border border-white/30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Current Status */}
                <div className={`${statusConfig.bgColor} rounded-xl p-6 border-2 border-current border-opacity-20`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${statusConfig.color.replace('text-', 'bg-').replace('-600', '-100')} rounded-xl flex items-center justify-center`}>
                      <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">الحالة الحالية</p>
                      <h3 className={`text-2xl font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{statusConfig.description}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    خط سير الشحن
                  </h3>
                  <div className="space-y-4">
                    {timelineSteps.map((step, index) => {
                      const isActive = step.status === shippingStatus;
                      const isCompleted = step.completed;
                      const currentIndex = getCurrentStepIndex();
                      
                      return (
                        <div key={step.status} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isActive 
                                ? `${statusConfig.color.replace('text-', 'bg-').replace('-600', '-100')} border-current ${statusConfig.color}`
                                : isCompleted 
                                  ? 'bg-green-100 border-green-300 text-green-600' 
                                  : 'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                              {isCompleted && !isActive ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <StatusIcon className={`w-5 h-5 ${isActive ? statusConfig.color : ''}`} />
                              )}
                            </div>
                            {index < timelineSteps.length - 1 && (
                              <div className={`w-0.5 h-16 mt-2 ${
                                isCompleted ? 'bg-green-300' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className={`font-medium ${
                              isActive ? statusConfig.color : isCompleted ? 'text-green-700' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </p>
                            {isActive && index < timelineSteps.length - 1 && (
                              <p className="text-xs text-gray-500 mt-1">قيد المعالجة...</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">عنوان الشحن</p>
                          <p className="text-sm text-blue-700">{order.shippingAddress}</p>
                          <button
                            onClick={() => copyToClipboard(order.shippingAddress!)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            نسخ العنوان
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracking Number */}
                  {order.shippingTrackingNumber && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900 mb-1">رقم التتبع</p>
                          <p className="text-sm font-mono text-purple-700 mb-2">{order.shippingTrackingNumber}</p>
                          <button
                            onClick={() => copyToClipboard(order.shippingTrackingNumber!)}
                            className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            نسخ الرقم
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipped Date */}
                  {order.shippedAt && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900 mb-1">تاريخ الشحن</p>
                          <p className="text-sm text-green-700">{formatDate(order.shippedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Date */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">تاريخ الطلب</p>
                        <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-4">
                    <Package className="w-8 h-8 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.productName}</p>
                      <p className="text-sm text-gray-600">الكمية: {order.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t bg-gray-50 p-4 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  إغلاق
                </button>
                {shippingStatus !== 'delivered' && (
                  <button
                    onClick={() => {
                      // يمكن إضافة دالة للتواصل مع الدعم
                      window.open('/customer/dashboard?tab=messages', '_blank');
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    التواصل مع الدعم
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShippingTrackingModal;




