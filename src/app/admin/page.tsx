'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Zap, ArrowRight, Shield, Sparkles, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signInAdmin } from '@/lib/auth';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInAdmin(formData.email, formData.password);
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('المستخدم غير موجود');
      } else if (error.code === 'auth/wrong-password') {
        setError('كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صحيح');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول');
      }
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 md:p-8 relative overflow-hidden" style={{ paddingTop: '45px', paddingBottom: '45px' }}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { left: 10, top: 20, delay: 0, duration: 3 },
          { left: 80, top: 30, delay: 0.5, duration: 4 },
          { left: 30, top: 60, delay: 1, duration: 3.5 },
          { left: 70, top: 80, delay: 1.5, duration: 4.5 },
          { left: 20, top: 40, delay: 2, duration: 3.2 },
          { left: 90, top: 10, delay: 2.5, duration: 4.2 },
          { left: 50, top: 70, delay: 3, duration: 3.8 },
          { left: 15, top: 85, delay: 3.5, duration: 4.1 },
          { left: 75, top: 50, delay: 4, duration: 3.6 },
          { left: 40, top: 15, delay: 4.5, duration: 4.3 },
          { left: 85, top: 65, delay: 5, duration: 3.9 },
          { left: 25, top: 75, delay: 5.5, duration: 3.4 },
          { left: 60, top: 25, delay: 6, duration: 4.4 },
          { left: 95, top: 45, delay: 6.5, duration: 3.7 },
          { left: 35, top: 90, delay: 7, duration: 4.6 },
          { left: 65, top: 5, delay: 7.5, duration: 3.3 },
          { left: 5, top: 55, delay: 8, duration: 4.7 },
          { left: 55, top: 35, delay: 8.5, duration: 3.1 },
          { left: 45, top: 95, delay: 9, duration: 4.8 },
          { left: 12, top: 12, delay: 9.5, duration: 3.5 },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm md:max-w-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
          style={{ padding: '15px' }}
        >
          {/* Header */}
          <div className="text-center mb-10" style={{ marginBottom: '10px' }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="relative mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              مرحباً بك
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-white/70 text-lg"
            >
              في لوحة إدارة وفرلي
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-8"
            style={{ marginBottom: '10px' }}
          >
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/60 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 backdrop-blur-sm"
                  placeholder="admin@wafrly.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white/90">
                كلمة المرور
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/60 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 backdrop-blur-sm"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 text-red-200 text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            style={{ marginBottom: '10px' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-white/90">بيانات تجريبية:</h3>
            </div>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span><strong>البريد:</strong> admin@wafrly.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3" />
                <span><strong>كلمة المرور:</strong> admin123</span>
              </div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center mt-6"
          >
            <a
              href="/"
              className="text-white/70 hover:text-white font-medium transition-colors duration-300 flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              العودة إلى الموقع الرئيسي
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;