'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Crown,
  Package,
  ShoppingCart,
  Calendar,
  Shield,
  Star,
  TrendingUp,
  Copy,
  ExternalLink,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { License } from '@/lib/firebase';
import { verifyLicense } from '@/lib/license-management';

export default function LicenseManagementPage() {
  const router = useRouter();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadLicenseInfo();
  }, []);

  const loadLicenseInfo = () => {
    try {
      const licenseKey = localStorage.getItem('license_key');
      const licenseInfoStr = localStorage.getItem('license_info');
      
      if (!licenseKey || !licenseInfoStr) {
        router.push('/admin/license/activate');
        return;
      }

      const licenseInfo = JSON.parse(licenseInfoStr);
      setLicense(licenseInfo);
      setLoading(false);
    } catch (error) {
      console.error('Error loading license:', error);
      router.push('/admin/license/activate');
    }
  };

  const handleVerifyLicense = async () => {
    setVerifying(true);
    
    try {
      const licenseKey = localStorage.getItem('license_key');
      const domain = window.location.hostname;
      
      if (!licenseKey) {
        router.push('/admin/license/activate');
        return;
      }

      const result = await verifyLicense(licenseKey, domain, '1.0.0');
      
      if (result.valid && result.license) {
        localStorage.setItem('license_info', JSON.stringify(result.license));
        setLicense(result.license);
        alert('✅ تم التحقق من الترخيص بنجاح!');
      } else {
        alert('❌ الترخيص غير صحيح أو منتهي الصلاحية');
      }
    } catch (error) {
      console.error('Error verifying license:', error);
      alert('حدث خطأ أثناء التحقق');
    } finally {
      setVerifying(false);
    }
  };

  const copyLicenseKey = () => {
    const licenseKey = localStorage.getItem('license_key');
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      alert('✅ تم نسخ مفتاح الترخيص!');
    }
  };

  const getDaysRemaining = () => {
    if (!license?.expiryDate || license.isPermanent) return null;
    
    const today = new Date();
    const expiry = new Date(license.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'enterprise': return 'from-purple-500 to-purple-600';
      case 'professional': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enterprise': return <Crown className="w-5 h-5" />;
      case 'professional': return <Star className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'enterprise': return '🏢 مؤسسي';
      case 'professional': return '💼 احترافي';
      default: return '📦 أساسي';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white/60 mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!license) {
    return null;
  }

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30;
  const isExpired = license.status === 'expired' || (daysRemaining !== null && daysRemaining <= 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">إدارة الترخيص</h1>
            <p className="text-white/60">معلومات ترخيص متجرك</p>
          </div>
          
          <button
            onClick={handleVerifyLicense}
            disabled={verifying}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'جاري التحقق...' : 'تحقق من الترخيص'}
          </button>
        </div>

        {/* Warning Banner */}
        {isExpiringSoon && !isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-400/30 rounded-2xl p-6 mb-8 flex items-start gap-4"
          >
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-300 mb-2">⚠️ تحذير: الترخيص سينتهي قريباً!</h3>
              <p className="text-yellow-200/80 mb-3">
                الترخيص الخاص بك سينتهي خلال <strong>{daysRemaining} يوم</strong>. 
                جدد اشتراكك الآن لتجنب انقطاع الخدمة.
              </p>
              <button className="px-6 py-2 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 transition-all font-bold">
                تجديد الآن
              </button>
            </div>
          </motion.div>
        )}

        {isExpired && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-400/30 rounded-2xl p-6 mb-8 flex items-start gap-4"
          >
            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-300 mb-2">❌ الترخيص منتهي!</h3>
              <p className="text-red-200/80 mb-3">
                للأسف، انتهت صلاحية ترخيصك. جدد الاشتراك الآن لمواصلة استخدام المتجر.
              </p>
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-bold">
                تجديد الاشتراك
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* License Type Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${getTypeColor(license.type)} rounded-2xl p-6 text-white shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {getTypeIcon(license.type)}
              </div>
              <span className="text-2xl">{getTypeIcon(license.type)}</span>
            </div>
            <h3 className="text-lg text-white/80 mb-2">نوع الاشتراك</h3>
            <p className="text-3xl font-bold">{getTypeName(license.type)}</p>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-gradient-to-br ${
              license.status === 'active' ? 'from-green-600 to-green-700' :
              license.status === 'trial' ? 'from-yellow-600 to-yellow-700' :
              'from-red-600 to-red-700'
            } rounded-2xl p-6 text-white shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {license.status === 'active' ? <CheckCircle className="w-6 h-6" /> :
                 license.status === 'trial' ? <Clock className="w-6 h-6" /> :
                 <XCircle className="w-6 h-6" />}
              </div>
            </div>
            <h3 className="text-lg text-white/80 mb-2">حالة الترخيص</h3>
            <p className="text-3xl font-bold">
              {license.status === 'active' ? '✅ نشط' :
               license.status === 'trial' ? '⏱️ تجريبي' :
               license.status === 'expired' ? '❌ منتهي' : '⏸️ معلق'}
            </p>
          </motion.div>

          {/* Expiry Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg text-white/80 mb-2">تاريخ الانتهاء</h3>
            {license.isPermanent ? (
              <p className="text-3xl font-bold">♾️ دائم</p>
            ) : (
              <>
                <p className="text-2xl font-bold">
                  {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                </p>
                {daysRemaining !== null && daysRemaining > 0 && (
                  <p className="text-white/80 text-sm mt-2">
                    باقي {daysRemaining} يوم
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* License Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            تفاصيل الترخيص
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License Key */}
            <div>
              <label className="block text-white/60 text-sm mb-2">مفتاح الترخيص</label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                <Key className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <code className="flex-1 text-yellow-400 font-mono text-sm">
                  {localStorage.getItem('license_key')}
                </code>
                <button
                  onClick={copyLicenseKey}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="نسخ"
                >
                  <Copy className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Version */}
            <div>
              <label className="block text-white/60 text-sm mb-2">الإصدار المستخدم</label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-white">{license.version}</span>
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-white/60 text-sm mb-2">تاريخ الشراء</label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-white">
                  {new Date(license.purchaseDate).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-white/60 text-sm mb-2">حالة التفعيل</label>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                {license.isActive ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400">مُفعّل</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">غير مُفعّل</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Usage Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            حدود الاستخدام
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Products Limit */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">المنتجات</span>
                </div>
                <span className="text-white/60 text-sm">
                  {(license.maxProducts ?? 0) === 0 ? 'غير محدود ♾️' : `حتى ${license.maxProducts ?? 0}`}
                </span>
              </div>
              {(license.maxProducts ?? 0) > 0 && (
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: '45%' }} // هنا يجب جلب العدد الفعلي
                  />
                </div>
              )}
            </div>

            {/* Orders Limit */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">الطلبات الشهرية</span>
                </div>
                <span className="text-white/60 text-sm">
                  {(license.maxOrders ?? 0) === 0 ? 'غير محدود ♾️' : `حتى ${license.maxOrders ?? 0}`}
                </span>
              </div>
              {(license.maxOrders ?? 0) > 0 && (
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    style={{ width: '65%' }} // هنا يجب جلب العدد الفعلي
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Features */}
        {license.features && license.features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              الميزات المتاحة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {license.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium">
            <Crown className="w-5 h-5" />
            ترقية الباقة
            <ArrowRight className="w-5 h-5" />
          </button>

          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-medium">
            <RefreshCw className="w-5 h-5" />
            تجديد الاشتراك
          </button>

          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-medium">
            <ExternalLink className="w-5 h-5" />
            الدعم الفني
          </button>
        </motion.div>
      </div>
    </div>
  );
}

