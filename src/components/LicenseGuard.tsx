'use client';

import { useEffect, useState } from 'react';
import { verifyStoreLicense } from '@/lib/license-management';
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface LicenseStatus {
  isValid: boolean;
  isChecking: boolean;
  error: string | null;
  license?: any;
  message?: string;
}

export default function LicenseGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LicenseStatus>({
    isValid: false,
    isChecking: true,
    error: null,
  });

  useEffect(() => {
    checkLicense();
    
    // التحقق من الترخيص كل 5 دقائق
    const interval = setInterval(() => {
      checkLicense();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkLicense = async () => {
    try {
      setStatus(prev => ({ ...prev, isChecking: true, error: null }));
      
      // جلب النطاق الحالي
      const domain = window.location.hostname;
      
      console.log('🔍 Checking license for domain:', domain);
      
      // التحقق من الترخيص
      const result = await verifyStoreLicense(domain);
      
      console.log('📋 License verification result:', result);
      
      if (result.valid) {
        setStatus({
          isValid: true,
          isChecking: false,
          error: null,
          license: result.license,
          message: result.message,
        });
      } else {
        setStatus({
          isValid: false,
          isChecking: false,
          error: result.message || 'الترخيص غير صالح',
          license: result.license,
        });
      }
    } catch (error) {
      console.error('❌ License check error:', error);
      setStatus({
        isValid: false,
        isChecking: false,
        error: 'فشل التحقق من الترخيص',
      });
    }
  };

  // شاشة التحميل
  if (status.isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-white mb-2">جاري التحقق من الترخيص...</h2>
          <p className="text-white/60">الرجاء الانتظار</p>
        </motion.div>
      </div>
    );
  }

  // إذا كان الترخيص صالح، اعرض المحتوى
  if (status.isValid) {
    return <>{children}</>;
  }

  // إذا كان الترخيص غير صالح، اعرض صفحة الحظر
  return <LicenseBlockedPage status={status} onRetry={checkLicense} />;
}

// صفحة الحظر
function LicenseBlockedPage({ 
  status, 
  onRetry 
}: { 
  status: LicenseStatus; 
  onRetry: () => void;
}) {
  const domain = typeof window !== 'undefined' ? window.location.hostname : '';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl"
      >
        {/* أيقونة */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-500/30"
          >
            <Lock className="w-12 h-12 text-red-300" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-red-300" />
            المتجر غير مرخص
          </h1>
          
          <p className="text-xl text-white/80 mb-2">
            هذا المتجر يتطلب ترخيص صالح للعمل
          </p>
          <p className="text-white/60">
            جميع العمليات موقوفة حتى الحصول على ترخيص
          </p>
        </div>

        {/* معلومات المشكلة */}
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">سبب الحظر:</h3>
              <p className="text-white/90 text-lg mb-3">
                {status.error || 'الترخيص غير صالح أو منتهي'}
              </p>
              
              {status.license && (
                <div className="space-y-2 text-sm text-white/70 bg-black/20 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span>الحالة: {status.license.status === 'expired' ? 'منتهي' : 'غير نشط'}</span>
                  </div>
                  
                  {status.license.expiryDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span>
                        تاريخ الانتهاء: {new Date(status.license.expiryDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span>النطاق: {domain}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الإجراءات المطلوبة */}
        <div className="bg-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            للحصول على ترخيص:
          </h3>
          
          <ol className="space-y-3 text-white/80">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <span>
                تواصل مع فريق وفرلي للحصول على ترخيص
              </span>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <span>
                قدم معلومات المتجر والنطاق: <code className="bg-black/30 px-2 py-1 rounded">{domain}</code>
              </span>
            </li>
            
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <span>
                بعد الحصول على الترخيص، سيتم تفعيل المتجر تلقائياً
              </span>
            </li>
          </ol>
        </div>

        {/* معلومات التواصل */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 mb-8 border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-300" />
            معلومات التواصل:
          </h3>
          
          <div className="space-y-2 text-white/90">
            <div className="flex items-center gap-2">
              <span className="text-white/60">البريد الإلكتروني:</span>
              <a 
                href="mailto:admin@wafrly.com" 
                className="text-blue-300 hover:text-blue-200 underline"
              >
                admin@wafrly.com
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-white/60">الموقع:</span>
              <a 
                href="https://wafrly.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline"
              >
                wafrly.com
              </a>
            </div>
          </div>
        </div>

        {/* زر إعادة المحاولة */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
        >
          <Shield className="w-5 h-5" />
          إعادة التحقق من الترخيص
        </motion.button>

        {/* ملاحظة */}
        <p className="text-center text-white/50 text-sm mt-6">
          إذا حصلت على ترخيص حديثاً، اضغط على "إعادة التحقق" أعلاه
        </p>
      </motion.div>
    </div>
  );
}


