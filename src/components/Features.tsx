'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, DollarSign, Headphones, Clock, Award } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'أمان وموثوقية',
      description: 'نضمن أمان بياناتك وخصوصيتك مع أعلى معايير الحماية',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
    },
    {
      icon: Zap,
      title: 'تسليم فوري',
      description: 'احصل على اشتراكاتك خلال دقائق من تأكيد الطلب',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
    },
    {
      icon: DollarSign,
      title: 'أسعار لا تُقاوم',
      description: 'وفر حتى 70% على اشتراكاتك مقارنة بالأسعار العادية',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
    },
    {
      icon: Headphones,
      title: 'دعم فني 24/7',
      description: 'فريق دعم متخصص متاح على مدار الساعة لمساعدتك',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
    },
    {
      icon: Clock,
      title: 'سهولة الإدارة',
      description: 'إدارة جميع اشتراكاتك من مكان واحد بسهولة تامة',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
    },
    {
      icon: Award,
      title: 'جودة مضمونة',
      description: 'نضمن جودة الخدمة أو استرداد كامل للمبلغ',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100',
    },
  ];

  return (
    <section id="features" className="bg-white" style={{ paddingTop: '45px', paddingBottom: '45px' }}>
      <div className="container px-4 md:px-6" dir="rtl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
          style={{ marginBottom: '10px' }}
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            لماذا تختار <span className="text-gradient">وفرلي</span>؟
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            نحن نقدم لك تجربة استثنائية مع أفضل الخدمات والأسعار في السوق
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10" style={{ marginBottom: '10px' }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="card h-full hover:scale-105 transition-all duration-300" style={{ padding: '15px' }}>
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-xl -z-10`}></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">10,000+</div>
                <div className="text-blue-100">عميل راضي</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">50+</div>
                <div className="text-blue-100">خدمة متاحة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">70%</div>
                <div className="text-blue-100">توفير متوسط</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">دعم فني</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              جاهز للبدء؟
            </h3>
            <p className="text-gray-600 mb-6">
              انضم إلى آلاف العملاء الراضين وابدأ في توفير المال اليوم
            </p>
            <a href="#services" className="btn-primary text-lg px-8 py-4">
              اكتشف العروض الآن
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;