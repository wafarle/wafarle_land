'use client';

import { motion } from 'framer-motion';
import { Shield, ChevronLeft, Lock, Eye, Database, UserCheck, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSiteName } from '@/contexts/SettingsContext';

export default function PrivacyPage() {
  const siteName = useSiteName();

  const sections = [
    {
      icon: Database,
      title: '1. المعلومات التي نجمعها',
      content: 'نقوم بجمع المعلومات التالية عند استخدامك لخدماتنا:',
      list: [
        'المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف',
        'معلومات الطلب: تفاصيل المنتجات والمشتريات',
        'معلومات الدفع: يتم معالجتها بشكل آمن عبر بوابات دفع موثوقة',
        'معلومات التصفح: عنوان IP، نوع المتصفح، صفحات الزيارة',
        'معلومات الجهاز: نوع الجهاز، نظام التشغيل'
      ]
    },
    {
      icon: Eye,
      title: '2. كيفية استخدام معلوماتك',
      content: 'نستخدم المعلومات التي نجمعها للأغراض التالية:',
      list: [
        'معالجة وتنفيذ طلباتك',
        'التواصل معك بخصوص طلباتك',
        'تحسين تجربة المستخدم',
        'إرسال العروض والتحديثات (يمكنك إلغاء الاشتراك في أي وقت)',
        'منع الاحتيال وحماية الموقع',
        'الامتثال للمتطلبات القانونية'
      ]
    },
    {
      icon: Lock,
      title: '3. حماية معلوماتك',
      content: 'نتخذ إجراءات أمنية صارمة لحماية معلوماتك:',
      list: [
        'تشفير SSL/TLS لجميع البيانات المنقولة',
        'تخزين آمن للبيانات في خوادم محمية',
        'وصول محدود للموظفين المصرح لهم فقط',
        'مراقبة أمنية مستمرة',
        'نسخ احتياطي منتظم للبيانات'
      ]
    },
    {
      icon: UserCheck,
      title: '4. مشاركة المعلومات',
      content: 'لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع:',
      list: [
        'مزودي خدمات الدفع لمعالجة المدفوعات',
        'شركات الشحن لتوصيل المنتجات',
        'مزودي خدمات التسويق (بموافقتك)',
        'الجهات القانونية عند الطلب القانوني'
      ]
    },
    {
      icon: Mail,
      title: '5. ملفات تعريف الارتباط (Cookies)',
      content: 'نستخدم ملفات تعريف الارتباط لـ:',
      list: [
        'تحسين أداء الموقع',
        'تذكر تفضيلاتك',
        'تحليل استخدام الموقع',
        'عرض إعلانات مخصصة',
        'يمكنك التحكم في ملفات تعريف الارتباط من إعدادات المتصفح'
      ]
    },
    {
      icon: Shield,
      title: '6. حقوقك',
      content: 'لديك الحق في:',
      list: [
        'الوصول إلى معلوماتك الشخصية',
        'تصحيح أو تحديث معلوماتك',
        'حذف حسابك ومعلوماتك',
        'الاعتراض على معالجة بياناتك',
        'طلب نسخة من بياناتك',
        'إلغاء الاشتراك في الرسائل التسويقية'
      ]
    },
    {
      icon: AlertTriangle,
      title: '7. الخدمات الخارجية',
      content: 'قد يحتوي الموقع على روابط لمواقع خارجية. نحن غير مسؤولين عن سياسات الخصوصية أو محتوى هذه المواقع.'
    },
    {
      icon: Database,
      title: '8. الاحتفاظ بالبيانات',
      content: 'نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. بعد حذف الحساب، قد نحتفظ ببعض البيانات للأغراض القانونية أو الأرشفة.'
    },
    {
      icon: Shield,
      title: '9. خصوصية الأطفال',
      content: 'خدماتنا غير موجهة للأطفال دون سن 18 عاماً. لا نجمع عن قصد معلومات شخصية من الأطفال.'
    },
    {
      icon: Mail,
      title: '10. التواصل',
      content: `لأي استفسارات حول سياسة الخصوصية أو لممارسة حقوقك، يرجى التواصل معنا عبر صفحة "اتصل بنا".`
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
              <span className="text-gray-900 font-medium">سياسة الخصوصية</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <section className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Shield className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                سياسة الخصوصية
              </h1>
              <p className="text-xl text-white/90">
                نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية
              </p>
              <p className="text-sm text-white/80 mt-4">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-gray-900 mb-2">التزامنا بخصوصيتك</h2>
                  <p className="text-gray-700">
                    في {siteName}، نأخذ خصوصيتك على محمل الجد. 
                    توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {section.content}
                    </p>
                    {section.list && (
                      <ul className="space-y-2">
                        {section.list.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                لديك استفسار حول خصوصيتك؟
              </h3>
              <p className="text-gray-600 mb-6">
                نحن هنا لمساعدتك والإجابة على جميع أسئلتك
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                تواصل معنا
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

