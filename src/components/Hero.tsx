'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Users, Award, Zap } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    { name: 'أحمد محمد', text: 'وفرت أكثر من 50% على اشتراكاتي' },
    { name: 'فاطمة علي', text: 'خدمة ممتازة وأسعار لا تُقاوم' },
    { name: 'محمد حسن', text: 'أفضل موقع للاشتراكات في السعودية' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const stats = [
    { icon: Users, value: '10,000+', label: 'عميل راضي' },
    { icon: Award, value: '50%', label: 'توفير متوسط' },
    { icon: Zap, value: '24/7', label: 'دعم فني' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50" style={{ paddingTop: '45px', paddingBottom: '45px' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-pattern"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="container relative z-10 px-4 md:px-6" dir="rtl">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
            style={{ marginBottom: '10px' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-[10px] inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200"
            >
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">أكثر من 10,000 عميل راضي</span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
              style={{ marginBottom: '10px' }}
            >
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight" style={{ width: '110%' }}>
                  وفر على <span className="text-gradient"> اشتراكاتك  </span>
                <br />
                المفضلة
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-lg leading-relaxed">
                احصل على أفضل العروض والخصومات على جميع خدمات الاشتراكات المفضلة لديك. 
                Netflix، Spotify، Shahid، وأكثر بأسعار لا تُقاوم.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
              style={{ marginBottom: '10px' }}
            >
              <Link href="#services" className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4">
                اكتشف العروض
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
              <button className="btn-outline text-base md:text-lg px-6 md:px-8 py-3 md:py-4 flex items-center gap-2">
                <Play className="w-4 h-4 md:w-5 md:h-5" />
                شاهد الفيديو
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-4 md:gap-8 pt-6"
              style={{ marginBottom: '10px' }}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="!m-auto w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center  ">
                      <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 mt-6"
              style={{ padding: '15px' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">"{testimonials[currentTestimonial].text}"</p>
                  <p className="text-sm text-gray-500 mt-1">- {testimonials[currentTestimonial].name}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">N</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Netflix Premium</h3>
                      <p className="text-sm text-gray-500">4K Ultra HD</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-2xl font-bold text-gradient">$12.99</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Spotify Premium</h3>
                      <p className="text-sm text-gray-500">موسيقى بدون إعلانات</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-2xl font-bold text-gradient">$9.99</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Sh</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Shahid VIP</h3>
                      <p className="text-sm text-gray-500">محتوى عربي حصري</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-2xl font-bold text-gradient">$7.99</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">المجموع</span>
                      <span className="text-3xl font-bold text-gradient">$30.97</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-emerald-600 font-medium">وفرت</span>
                      <span className="text-xl font-bold text-emerald-600">$15.48</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                <span className="text-white font-bold text-lg">50%</span>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;