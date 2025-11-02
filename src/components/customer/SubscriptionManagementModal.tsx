'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Calendar, 
  CreditCard, 
  RefreshCw, 
  Pause, 
  Play, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Star,
  Download,
  Eye
} from 'lucide-react';
import { Subscription } from '@/lib/firebase';
import { useFormatPrice } from '@/contexts/CurrencyContext';

interface SubscriptionManagementModalProps {
  subscription: Subscription;
  onClose: () => void;
  onSubscriptionUpdated: () => void;
}

export default function SubscriptionManagementModal({ 
  subscription, 
  onClose, 
  onSubscriptionUpdated 
}: SubscriptionManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { formatPrice } = useFormatPrice();

  // Calculate remaining days
  const calculateRemainingDays = (endDate?: Date) => {
    if (!endDate) return 0;
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const remainingDays = calculateRemainingDays(subscription.endDate);
  const isExpiring = remainingDays <= 30 && remainingDays > 0;

  // Calculate progress
  const totalDays = subscription.endDate && subscription.startDate 
    ? Math.ceil((subscription.endDate.getTime() - subscription.startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const usedDays = totalDays - remainingDays;
  const progressPercentage = totalDays > 0 ? Math.max(0, Math.min(100, (usedDays / totalDays) * 100)) : 0;

  const handleRenewal = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate renewal process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('تم تجديد الاشتراك بنجاح!');
      setTimeout(() => {
        onSubscriptionUpdated();
        onClose();
      }, 1500);
    } catch (error) {
      setError('حدث خطأ في تجديد الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate pause process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('تم إيقاف الاشتراك مؤقتاً');
      setTimeout(() => {
        onSubscriptionUpdated();
        onClose();
      }, 1500);
    } catch (error) {
      setError('حدث خطأ في إيقاف الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء الاشتراك؟ لن تتمكن من الاستفادة من الخدمة بعد الإلغاء.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Simulate cancellation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('تم إلغاء الاشتراك بنجاح');
      setTimeout(() => {
        onSubscriptionUpdated();
        onClose();
      }, 1500);
    } catch (error) {
      setError('حدث خطأ في إلغاء الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Eye },
    { id: 'billing', label: 'الفواتير', icon: CreditCard },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
    { id: 'support', label: 'الدعم', icon: Shield }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">إدارة الاشتراك</h2>
                <p className="text-blue-100 mt-1">{subscription.productName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800">{success}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </motion.div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Subscription Status */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">حالة الاشتراك</h3>
                      <p className="text-sm text-gray-600">معلومات مفصلة عن اشتراكك</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status === 'active' ? 'نشط' : 'منتهي'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        المدة المتبقية: {remainingDays} يوم
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(progressPercentage)}% مستخدم
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className={`h-3 rounded-full ${
                          isExpiring ? 'bg-gradient-to-r from-yellow-400 to-red-500' :
                          'bg-gradient-to-r from-green-400 to-blue-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">تاريخ البداية:</span>
                      <span className="font-medium">{subscription.startDate?.toLocaleDateString('ar-SA') || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">تاريخ الانتهاء:</span>
                      <span className="font-medium">{subscription.endDate?.toLocaleDateString('ar-SA') || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-medium">{formatPrice(subscription.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">نوع الخطة:</span>
                      <span className="font-medium">{subscription.planType}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleRenewal}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      تجديد الاشتراك
                    </button>
                    <button
                      onClick={handlePause}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      <Pause className="w-4 h-4" />
                      إيقاف مؤقت
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الفواتير</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">الاشتراك الحالي</span>
                      <span className="font-medium">{formatPrice(subscription.price)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">نوع الدفع</span>
                      <span className="font-medium">بطاقة ائتمان</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">التجديد التلقائي</span>
                      <span className={`font-medium ${subscription.autoRenewal ? 'text-green-600' : 'text-red-600'}`}>
                        {subscription.autoRenewal ? 'مفعل' : 'معطل'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">تاريخ الدفع التالي</span>
                      <span className="font-medium">{subscription.endDate?.toLocaleDateString('ar-SA') || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    تحميل الفاتورة
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <CreditCard className="w-4 h-4" />
                    تحديث طريقة الدفع
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات الاشتراك</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">التجديد التلقائي</h4>
                        <p className="text-sm text-gray-600">تجديد الاشتراك تلقائياً عند الانتهاء</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={subscription.autoRenewal} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">إشعارات التجديد</h4>
                        <p className="text-sm text-gray-600">تلقي إشعارات قبل انتهاء الاشتراك</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">منطقة الخطر</h3>
                  <p className="text-red-700 mb-4">إلغاء الاشتراك سيمنعك من الاستفادة من الخدمة</p>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    إلغاء الاشتراك
                  </button>
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">الدعم الفني</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">دعم فوري</h4>
                        <p className="text-sm text-gray-600">احصل على مساعدة فورية عبر الدردشة المباشرة</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">ضمان الاسترداد</h4>
                        <p className="text-sm text-gray-600">استرداد كامل خلال 30 يوم من الشراء</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Zap className="w-4 h-4" />
                    الدردشة المباشرة
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Star className="w-4 h-4" />
                    تقييم الخدمة
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
