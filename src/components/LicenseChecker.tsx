'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, Loader, Shield } from 'lucide-react';
import { verifyLicense } from '@/lib/license-management';
import { License } from '@/lib/firebase';

interface LicenseCheckerProps {
  children: React.ReactNode;
}

export default function LicenseChecker({ children }: LicenseCheckerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [license, setLicense] = useState<License | null>(null);
  const [error, setError] = useState<string | null>(null);

  // صفحات لا تحتاج للتحقق من الترخيص
  const publicPaths = [
    '/admin/license/activate',
    '/admin/login',
    '/admin',
    '/',
    '/auth/login',
    '/auth/register'
  ];

  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

  useEffect(() => {
    checkLicense();
    
    // التحقق الدوري كل 24 ساعة
    const interval = setInterval(checkLicense, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [pathname]);

  const checkLicense = async () => {
    // إذا كانت صفحة عامة، لا نحتاج للتحقق
    if (isPublicPath) {
      setChecking(false);
      return;
    }

    try {
      const licenseKey = localStorage.getItem('license_key');
      const licenseInfoStr = localStorage.getItem('license_info');

      // إذا لم يوجد مفتاح، اذهب لصفحة التفعيل
      if (!licenseKey || !licenseInfoStr) {
        router.push('/admin/license/activate');
        return;
      }

      const licenseInfo = JSON.parse(licenseInfoStr);
      const domain = window.location.hostname;

      // التحقق من صحة الترخيص
      const result = await verifyLicense(licenseKey, domain, '1.0.0');

      if (result.valid && result.license) {
        // تحديث معلومات الترخيص
        localStorage.setItem('license_info', JSON.stringify(result.license));
        setLicense(result.license);
        setError(null);
      } else {
        // الترخيص غير صحيح
        setError(result.message || 'الترخيص غير صحيح');
        
        // إذا كان منتهي أو معلق، اذهب لصفحة الترخيص
        if (result.message?.includes('expired') || result.message?.includes('suspended')) {
          router.push('/admin/license');
        } else {
          // إذا كان غير موجود، اذهب لصفحة التفعيل
          router.push('/admin/license/activate');
        }
      }
    } catch (err) {
      console.error('Error checking license:', err);
      setError('حدث خطأ أثناء التحقق من الترخيص');
    } finally {
      setChecking(false);
    }
  };

  // شاشة التحميل
  if (checking && !isPublicPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Shield className="w-16 h-16 text-blue-500" />
          </motion.div>
          <p className="text-white/60 mt-4 text-lg">جاري التحقق من الترخيص...</p>
        </div>
      </div>
    );
  }

  // إذا كان هناك خطأ وليست صفحة عامة
  if (error && !isPublicPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/20 border border-red-400/30 rounded-2xl p-8 max-w-md text-center"
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">خطأ في الترخيص</h2>
          <p className="text-red-200/80 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/license')}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium"
          >
            إدارة الترخيص
          </button>
        </motion.div>
      </div>
    );
  }

  // إظهار تحذير إذا كان الترخيص سينتهي قريباً
  const showExpiryWarning = license && !license.isPermanent && license.expiryDate;
  let daysRemaining = 0;
  
  if (showExpiryWarning) {
    const today = new Date();
    const expiry = new Date(license.expiryDate!);
    const diffTime = expiry.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <>
      {/* تحذير انتهاء الترخيص قريباً */}
      <AnimatePresence>
        {showExpiryWarning && daysRemaining > 0 && daysRemaining <= 30 && !isPublicPath && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/95 backdrop-blur-sm border-b border-yellow-400/30 p-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-900 flex-shrink-0" />
                <div>
                  <p className="text-yellow-900 font-bold">
                    ⚠️ تحذير: الترخيص سينتهي خلال {daysRemaining} يوم
                  </p>
                  <p className="text-yellow-800 text-sm">
                    جدد اشتراكك الآن لتجنب انقطاع الخدمة
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/admin/license')}
                  className="px-4 py-2 bg-yellow-900 text-yellow-100 rounded-lg hover:bg-yellow-800 transition-all font-medium text-sm whitespace-nowrap"
                >
                  تجديد الآن
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* المحتوى الأساسي */}
      <div className={showExpiryWarning && daysRemaining > 0 && daysRemaining <= 30 && !isPublicPath ? 'pt-20' : ''}>
        {children}
      </div>
    </>
  );
}

