'use client';

import { motion } from 'framer-motion';
import { RotateCcw, ChevronLeft, CheckCircle, X, AlertCircle, Package, Clock, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ReturnsPage() {
  const eligibleProducts = [
    'المنتجات الملموسة في حالتها الأصلية',
    'المنتجات غير المستخدمة وبكامل ملحقاتها',
    'المنتجات التي لم يمض عليها أكثر من 14 يوم',
    'المنتجات المعيبة أو التالفة'
  ];

  const nonEligibleProducts = [
    'المنتجات الرقمية بعد التفعيل',
    'الاشتراكات المستخدمة',
    'المنتجات المخصصة أو المصنوعة حسب الطلب',
    'المنتجات التي تم فتح عبوتها (حسب النوع)'
  ];

  const returnSteps = [
    {
      icon: Package,
      title: 'تقديم طلب الإرجاع',
      description: 'من لوحة التحكم، اختر الطلب واضغط على "طلب إرجاع"، ثم اختر سبب الإرجاع'
    },
    {
      icon: CheckCircle,
      title: 'المراجعة والموافقة',
      description: 'سنراجع طلبك خلال 24-48 ساعة ونرسل لك تأكيد الموافقة أو الرفض'
    },
    {
      icon: Package,
      title: 'إعادة المنتج',
      description: 'بعد الموافقة، قم بتعبئة المنتج جيداً وإرساله إلى العنوان المحدد'
    },
    {
      icon: DollarSign,
      title: 'استرجاع المبلغ',
      description: 'بعد فحص المنتج، سنقوم باسترجاع المبلغ خلال 5-7 أيام عمل'
    }
  ];

  const conditions = [
    {
      icon: CheckCircle,
      title: 'شروط الإرجاع المقبول',
      items: [
        'المنتج في حالته الأصلية',
        'العبوة الأصلية سليمة',
        'جميع الملحقات والمواد موجودة',
        'لم يمض أكثر من 14 يوم على الاستلام',
        'فاتورة الشراء الأصلية'
      ],
      color: 'green'
    },
    {
      icon: X,
      title: 'حالات رفض الإرجاع',
      items: [
        'تلف المنتج بسبب سوء الاستخدام',
        'فقدان العبوة الأصلية',
        'مرور أكثر من 14 يوم',
        'المنتجات الرقمية المفعّلة',
        'عدم تطابق المنتج مع الطلب المسجل'
      ],
      color: 'red'
    }
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
              <span className="text-gray-900 font-medium">سياسة الإرجاع والاستبدال</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <section className="bg-gradient-to-br from-orange-600 to-red-600 text-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <RotateCcw className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                سياسة الإرجاع والاستبدال
              </h1>
              <p className="text-xl text-white/90">
                نهتم برضاك ونوفر سياسة إرجاع مرنة وسهلة
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-12"
            >
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-gray-900 mb-2 text-xl">فترة الإرجاع: 14 يوم</h2>
                  <p className="text-gray-700">
                    يمكنك إرجاع معظم المنتجات خلال 14 يوم من تاريخ الاستلام للحصول على استرجاع كامل للمبلغ، 
                    بشرط أن يكون المنتج في حالته الأصلية.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Eligible vs Non-Eligible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-green-50 border border-green-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">منتجات قابلة للإرجاع</h3>
                </div>
                <ul className="space-y-3">
                  {eligibleProducts.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-red-50 border border-red-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <X className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">منتجات غير قابلة للإرجاع</h3>
                </div>
                <ul className="space-y-3">
                  {nonEligibleProducts.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Return Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                خطوات الإرجاع
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {returnSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center relative"
                    >
                      <div className="absolute top-8 right-1/2 w-full h-0.5 bg-gray-300 -z-10 hidden lg:block"
                        style={{ 
                          width: index === returnSteps.length - 1 ? '0' : '100%',
                          transform: 'translateX(50%)'
                        }}
                      />
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <Icon className="w-8 h-8 text-white" />
                        <span className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm border-2 border-orange-500">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {conditions.map((condition, index) => {
                const Icon = condition.icon;
                const colors = {
                  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', text: 'text-green-700' },
                  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-700' }
                };
                const color = colors[condition.color as keyof typeof colors];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`${color.bg} border ${color.border} rounded-2xl p-6`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className={`w-7 h-7 ${color.icon}`} />
                      <h3 className="text-xl font-bold text-gray-900">{condition.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {condition.items.map((item, idx) => (
                        <li key={idx} className={`flex items-start gap-3 ${color.text}`}>
                          <Icon className={`w-5 h-5 ${color.icon} flex-shrink-0 mt-0.5`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>

            {/* Important Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 text-lg">ملاحظات مهمة</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>رسوم الشحن الأصلية غير قابلة للاسترجاع</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>العميل يتحمل تكلفة شحن الإرجاع إلا في حالة العيب المصنعي</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>يتم فحص المنتج المرتجع قبل استرجاع المبلغ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>الاستبدال متاح حسب توفر المنتج البديل</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 text-center border border-orange-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                تريد إرجاع منتج؟
              </h3>
              <p className="text-gray-600 mb-6">
                ابدأ عملية الإرجاع من لوحة التحكم الخاصة بك
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/customer/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <RotateCcw className="w-5 h-5" />
                  طلب إرجاع
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold border-2 border-gray-300 hover:border-orange-600 hover:text-orange-600 transition-all duration-300"
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

