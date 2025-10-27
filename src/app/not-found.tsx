'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, Search, ArrowRight, AlertTriangle, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12"
        >
          {/* 404 Animation */}
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
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 0.9, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
              >
                404
              </motion.div>
              
              {/* Floating icons around 404 */}
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 -right-4 md:-right-8"
              >
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [10, -10, 10],
                  rotate: [360, 180, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-0 -left-4 md:-left-8"
              >
                <Compass className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              عذراً، الصفحة غير موجودة!
            </h1>
            
            <p className="text-xl text-white/80 mb-6 leading-relaxed">
              يبدو أن الصفحة التي تبحث عنها قد انتقلت أو لم تعد موجودة.
              لا تقلق، يمكنك العودة إلى الصفحة الرئيسية أو استكشاف أقسامنا المختلفة!
            </p>
            
            <div className="text-6xl mb-6">🔍</div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Search className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">ابحث عن المحتوى</h3>
              <p className="text-white/60 text-sm">استخدم البحث للعثور على ما تريد</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Home className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">العودة للرئيسية</h3>
              <p className="text-white/60 text-sm">تصفح منتجاتنا وعروضنا المميزة</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                العودة للرئيسية
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
                العودة للخلف
              </button>
            </motion.div>
          </motion.div>

          {/* Popular Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 pt-6 border-t border-white/10"
          >
            <p className="text-white/60 text-sm mb-4">روابط مفيدة:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/customer/dashboard"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                لوحة العملاء
              </Link>
              <Link
                href="/admin"
                className="text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                لوحة الإدارة
              </Link>
              <Link
                href="/"
                className="text-green-400 hover:text-green-300 transition-colors underline"
              >
                المنتجات
              </Link>
            </div>
          </motion.div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                animate={{
                  x: [0, 100, -100, 0],
                  y: [0, -100, 100, 0],
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
