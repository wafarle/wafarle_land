'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  CheckCircle, 
  AlertCircle,
  Loader,
  ShieldCheck,
  Store,
  Sparkles,
  ArrowRight,
  Copy,
  HelpCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { verifyLicense } from '@/lib/license-management';

export default function ActivateLicensePage() {
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    // Validate input
    if (!licenseKey.trim()) {
      setError('الرجاء إدخال مفتاح الترخيص');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get domain
      const domain = typeof window !== 'undefined' ? window.location.hostname : '';
      
      // Verify license
      const result = await verifyLicense(licenseKey.trim(), domain, '1.0.0');

      if (result.valid && result.license) {
        // Save license info to localStorage
        localStorage.setItem('license_key', licenseKey.trim());
        localStorage.setItem('license_info', JSON.stringify(result.license));
        localStorage.setItem('license_activated_at', new Date().toISOString());

        setSuccess(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      } else {
        setError(result.message || 'مفتاح الترخيص غير صحيح');
      }
    } catch (err) {
      console.error('Error activating license:', err);
      setError('حدث خطأ أثناء التحقق من الترخيص. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleActivate();
    }
  };

  const formatLicenseKey = (value: string) => {
    // Remove any non-alphanumeric characters except hyphens
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Auto-format to XXXX-XXXX-XXXX-XXXX
    const parts = cleaned.split('-').join('').match(/.{1,4}/g) || [];
    return parts.join('-');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setError('');
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const formatted = formatLicenseKey(text);
      setLicenseKey(formatted);
      setError('');
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            🎉 تم التفعيل بنجاح!
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/80 mb-8"
          >
            متجرك الآن جاهز للعمل
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white"
          />
          
          <p className="text-white/60 mt-4">جاري التوجيه...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 rounded-3xl mb-6 shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            تفعيل الترخيص
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </h1>
          
          <p className="text-xl text-white/80">
            أدخل مفتاح الترخيص لتفعيل متجرك
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
        >
          {/* Instructions */}
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">كيف تحصل على مفتاح الترخيص؟</h3>
                <ul className="text-white/80 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    تحقق من بريدك الإلكتروني بعد الشراء
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    المفتاح بصيغة: XXXX-XXXX-XXXX-XXXX
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    إذا لم تجد المفتاح، تواصل مع الدعم الفني
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* License Key Input */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-white mb-3">
              <Key className="w-5 h-5 inline ml-2" />
              مفتاح الترخيص
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
                disabled={loading}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-center text-2xl font-mono tracking-wider placeholder-white/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/30 transition-all disabled:opacity-50"
              />
              
              {!licenseKey && (
                <button
                  onClick={pasteFromClipboard}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="لصق من الحافظة"
                  type="button"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Character Counter */}
            <div className="flex justify-between items-center mt-2 px-2">
              <span className="text-sm text-white/60">
                {licenseKey.length} / 19 حرف
              </span>
              {licenseKey.length === 19 && (
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  صيغة صحيحة
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 mb-6 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">خطأ في التفعيل</p>
                <p className="text-red-200/80 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Domain Info */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-white/60" />
              <div>
                <p className="text-white/60 text-sm">النطاق المسجل:</p>
                <p className="text-white font-mono text-sm">
                  {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
                </p>
              </div>
            </div>
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={loading || !licenseKey.trim() || licenseKey.length < 19}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                تفعيل المتجر
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="text-center text-white/60 text-sm mt-6">
            بتفعيل الترخيص، أنت توافق على{' '}
            <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
              الشروط والأحكام
            </a>
          </p>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-8"
        >
          <p className="text-white/60 mb-3">تحتاج مساعدة؟</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:support@wafrly.com"
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              📧 البريد الإلكتروني
            </a>
            <span className="text-white/40">|</span>
            <a
              href="/help"
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              📖 مركز المساعدة
            </a>
            <span className="text-white/40">|</span>
            <button
              onClick={() => {/* فتح الشات */}}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              💬 الدعم المباشر
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

