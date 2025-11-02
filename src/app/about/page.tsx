'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Award, 
  Zap, 
  Shield, 
  Heart,
  TrendingUp,
  Globe,
  ChevronLeft,
  CheckCircle,
  Star,
  Package,
  ShoppingBag
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'عملاء سعداء', value: '10,000+', color: 'from-blue-500 to-cyan-500' },
    { icon: Package, label: 'منتج متوفر', value: '500+', color: 'from-purple-500 to-pink-500' },
    { icon: Globe, label: 'دولة', value: '50+', color: 'from-green-500 to-emerald-500' },
    { icon: Star, label: 'تقييم العملاء', value: '4.9/5', color: 'from-yellow-500 to-orange-500' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'الموثوقية',
      description: 'نضمن لك أعلى مستويات الأمان والموثوقية في جميع معاملاتك',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Zap,
      title: 'السرعة',
      description: 'خدمات فورية وسريعة لتوفير وقتك وجهدك',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      icon: Heart,
      title: 'رضا العملاء',
      description: 'نضع رضا عملائنا في المقام الأول ونسعى لتجاوز توقعاتهم',
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      icon: TrendingUp,
      title: 'التطوير المستمر',
      description: 'نعمل باستمرار على تحسين خدماتنا وإضافة مميزات جديدة',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
  ];

  const team = [
    {
      name: 'أحمد محمد',
      role: 'المؤسس والرئيس التنفيذي',
      image: '/api/placeholder/150/150',
      description: '10 سنوات خبرة في التجارة الإلكترونية'
    },
    {
      name: 'فاطمة علي',
      role: 'مديرة التسويق',
      image: '/api/placeholder/150/150',
      description: 'خبيرة في التسويق الرقمي والعلامات التجارية'
    },
    {
      name: 'خالد سالم',
      role: 'مدير التطوير',
      image: '/api/placeholder/150/150',
      description: 'متخصص في تطوير المنصات الإلكترونية'
    },
    {
      name: 'نورة حسن',
      role: 'مديرة خدمة العملاء',
      image: '/api/placeholder/150/150',
      description: 'ملتزمة بتقديم أفضل تجربة للعملاء'
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-gray-900 font-medium">من نحن</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                من نحن
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                منصة وفرلي هي وجهتك المثالية للحصول على أفضل عروض الاشتراكات الرقمية بأسعار تنافسية
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  قصتنا
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                  <p>
                    بدأت وفرلي من فكرة بسيطة: جعل الاشتراكات الرقمية في متناول الجميع بأسعار معقولة. 
                    في عالم أصبحت فيه الخدمات الرقمية ضرورية، أردنا أن نكون الجسر الذي يربط العملاء بأفضل العروض.
                  </p>
                  <p>
                    منذ انطلاقنا، نجحنا في خدمة آلاف العملاء عبر المنطقة، وأصبحنا الخيار الأول للكثيرين 
                    الذين يبحثون عن توفير حقيقي دون المساومة على الجودة.
                  </p>
                  <p>
                    نفخر بفريقنا المتخصص الذي يعمل على مدار الساعة لضمان حصولك على أفضل تجربة ممكنة.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/api/placeholder/600/400"
                    alt="وفرلي"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">رؤيتنا</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  أن نكون المنصة الرائدة في المنطقة لتوفير الاشتراكات الرقمية بأفضل الأسعار، 
                  ونساهم في تحسين تجربة الوصول إلى الخدمات الرقمية للجميع.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">رسالتنا</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg">
                  تقديم أفضل قيمة لعملائنا من خلال عروض حصرية وخدمة عملاء متميزة، 
                  مع الالتزام بأعلى معايير الجودة والأمان.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                قيمنا
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                المبادئ التي نؤمن بها ونعمل على تحقيقها كل يوم
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className={`w-14 h-14 ${value.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                فريقنا
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                مجموعة من الخبراء المتحمسين لخدمتك
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="relative mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-200 group-hover:ring-blue-500 transition-all">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                لماذا تختار وفرلي؟
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                نقدم لك تجربة فريدة ومميزة
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: CheckCircle,
                  title: 'أسعار تنافسية',
                  description: 'نوفر لك أفضل الأسعار في السوق مع عروض حصرية'
                },
                {
                  icon: Shield,
                  title: 'دفع آمن',
                  description: 'نستخدم أحدث تقنيات التشفير لحماية بياناتك'
                },
                {
                  icon: Zap,
                  title: 'خدمة سريعة',
                  description: 'تفعيل فوري لاشتراكاتك خلال دقائق'
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-white/80">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 text-center border border-blue-100"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                جاهز للبدء؟
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                انضم إلى آلاف العملاء السعداء واحصل على أفضل العروض
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-5 h-5" />
                  تصفح المنتجات
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
                >
                  تواصل معنا
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

