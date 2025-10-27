'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { RefreshCw, Home, AlertCircle, Bug, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12"
        >
          {/* Error Icon Animation */}
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
                rotate: [0, -5, 5, 0],
                scale: [1, 1.05, 0.95, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            </motion.div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              عذراً، حدث خطأ غير متوقع!
            </h1>
            
            <p className="text-xl text-white/80 mb-6 leading-relaxed">
              واجهنا مشكلة تقنية أثناء تحميل هذه الصفحة.
              فريقنا التقني يعمل على حل المشكلة. يرجى المحاولة مرة أخرى.
            </p>
            
            <div className="text-5xl mb-6">⚠️</div>
          </motion.div>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">تفاصيل الخطأ (وضع التطوير)</span>
              </div>
              <pre className="text-red-300 text-xs font-mono overflow-x-auto">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-red-400/60 text-xs mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">حاول مرة أخرى</h3>
              <p className="text-white/60 text-sm">قد تكون المشكلة مؤقتة</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Home className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">العودة للرئيسية</h3>
              <p className="text-white/60 text-sm">تصفح الموقع من البداية</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              حاول مرة أخرى
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

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <p className="text-white/60 text-sm mb-4">
              إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="mailto:support@wafarle.com"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                support@wafarle.com
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-white/40">|</span>
              <a
                href="tel:0593607607"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                0593607607
              </a>
            </div>
          </motion.div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-400/30 rounded-full"
                animate={{
                  x: [0, 50, -50, 0],
                  y: [0, -50, 50, 0],
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                style={{
                  left: `${15 + i * 10}%`,
                  top: `${25 + i * 8}%`
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
