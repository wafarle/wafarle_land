'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, Signal, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryConnection = () => {
    window.location.reload();
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Signal className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-4">
              تم استعادة الاتصال! 🎉
            </h1>
            
            <p className="text-white/80 mb-6">
              عاد الاتصال بالإنترنت. يمكنك الآن متابعة التصفح بشكل طبيعي.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              العودة للصفحة الرئيسية
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12"
        >
          {/* Offline Icon Animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.3,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="mb-8"
          >
            <motion.div
              animate={{ 
                y: [-5, 5, -5],
                rotate: [-2, 2, -2]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <WifiOff className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            </motion.div>
          </motion.div>

          {/* Offline Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              لا يوجد اتصال بالإنترنت
            </h1>
            
            <p className="text-xl text-white/80 mb-6 leading-relaxed">
              يبدو أن جهازك غير متصل بالإنترنت حالياً.
              تحقق من اتصالك وحاول مرة أخرى.
            </p>
            
            <div className="text-6xl mb-6">📶</div>
          </motion.div>

          {/* Network Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-semibold">حالة الشبكة</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm">غير متصل</span>
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <WifiOff className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">تحقق من الاتصال</h3>
              <p className="text-white/60 text-sm">تأكد من الـ WiFi أو البيانات</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">أعد المحاولة</h3>
              <p className="text-white/60 text-sm">حاول تحديث الصفحة</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retryConnection}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              أعد المحاولة
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                العودة للرئيسية
              </Link>
            </motion.div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <p className="text-white/60 text-sm mb-4">نصائح لاستعادة الاتصال:</p>
            <div className="text-sm text-white/70 space-y-1">
              <p>• تحقق من إشارة الـ WiFi أو البيانات الخلوية</p>
              <p>• جرب إعادة تشغيل جهاز التوجيه</p>
              <p>• تأكد من عدم تجاوز حد البيانات</p>
            </div>
          </motion.div>

          {/* Connection pulse animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <motion.div
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-orange-400/20 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
