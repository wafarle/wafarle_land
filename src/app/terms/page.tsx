'use client';

import { motion } from 'framer-motion';
import { FileText, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSiteName } from '@/contexts/SettingsContext';

export default function TermsPage() {
  const siteName = useSiteName();

  const sections = [
    {
      title: '1. القبول بالشروط',
      content: `باستخدامك لموقع ${siteName}، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.`
    },
    {
      title: '2. استخدام الموقع',
      content: 'يحق لك استخدام الموقع للأغراض الشخصية والقانونية فقط. يُمنع استخدام الموقع لأي أغراض غير قانونية أو محظورة.',
      list: [
        'عدم نسخ أو توزيع المحتوى دون إذن',
        'عدم محاولة اختراق أو تعطيل الموقع',
        'عدم استخدام الموقع لأغراض احتيالية',
        'الالتزام بجميع القوانين المحلية والدولية'
      ]
    },
    {
      title: '3. حسابات المستخدمين',
      content: 'عند إنشاء حساب، فإنك توافق على:',
      list: [
        'تقديم معلومات دقيقة وحديثة',
        'الحفاظ على سرية كلمة المرور الخاصة بك',
        'إخطارنا فوراً بأي استخدام غير مصرح به لحسابك',
        'تحمل المسؤولية عن جميع الأنشطة التي تتم من خلال حسابك'
      ]
    },
    {
      title: '4. المنتجات والأسعار',
      content: 'نسعى لتقديم معلومات دقيقة عن المنتجات والأسعار، ولكن:',
      list: [
        'الأسعار عرضة للتغيير دون إشعار مسبق',
        'نحتفظ بالحق في تصحيح أي أخطاء في الأسعار',
        'التوفر غير مضمون حتى اكتمال عملية الشراء',
        'قد تختلف الصور عن المنتج الفعلي'
      ]
    },
    {
      title: '5. الطلبات والدفع',
      content: 'عند إتمام طلب، فإنك توافق على:',
      list: [
        'دفع جميع الرسوم المستحقة',
        'تقديم معلومات دفع صحيحة',
        'استلام تأكيد الطلب عبر البريد الإلكتروني',
        'قد نرفض أو نلغي أي طلب لأسباب معينة'
      ]
    },
    {
      title: '6. الشحن والتسليم',
      content: 'للمنتجات الملموسة:',
      list: [
        'مدة التوصيل المعتادة: 3-7 أيام عمل',
        'رسوم الشحن تُحسب عند الطلب',
        'نحن غير مسؤولين عن التأخير خارج إرادتنا',
        'يجب فحص المنتج عند الاستلام'
      ]
    },
    {
      title: '7. الإلغاء والاسترجاع',
      content: 'سياسة الإلغاء والاسترجاع:',
      list: [
        'يمكن إلغاء الطلب قبل الشحن',
        'يمكن إرجاع المنتجات الملموسة خلال 14 يوم',
        'المنتجات الرقمية غير قابلة للاسترجاع بعد التفعيل',
        'يجب أن يكون المنتج في حالته الأصلية'
      ]
    },
    {
      title: '8. الملكية الفكرية',
      content: `جميع الحقوق محفوظة لـ ${siteName}. المحتوى والعلامات التجارية والتصميمات محمية بموجب قوانين الملكية الفكرية.`
    },
    {
      title: '9. إخلاء المسؤولية',
      content: 'الموقع والخدمات مقدمة "كما هي" دون أي ضمانات. نحن غير مسؤولين عن:',
      list: [
        'أي أضرار مباشرة أو غير مباشرة',
        'فقدان البيانات أو الأرباح',
        'انقطاع الخدمة',
        'أخطاء أو سهو في المحتوى'
      ]
    },
    {
      title: '10. تعديل الشروط',
      content: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات تصبح سارية فور نشرها على الموقع. استمرارك في استخدام الموقع بعد التعديلات يعني قبولك لها.'
    },
    {
      title: '11. القانون الحاكم',
      content: 'تخضع هذه الشروط لقوانين المملكة العربية السعودية. أي نزاع ينشأ عن استخدام الموقع يحل وفقاً لهذه القوانين.'
    },
    {
      title: '12. التواصل',
      content: `لأي استفسارات حول هذه الشروط، يرجى التواصل معنا عبر صفحة "اتصل بنا".`
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
              <span className="text-gray-900 font-medium">الشروط والأحكام</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <FileText className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                الشروط والأحكام
              </h1>
              <p className="text-xl text-white/90">
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
              className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-gray-900 mb-2">مقدمة مهمة</h2>
                  <p className="text-gray-700">
                    يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام خدماتنا. 
                    استخدامك للموقع يعني موافقتك التامة على هذه الشروط.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h2>
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
              ))}
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center border border-blue-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                لديك استفسار؟
              </h3>
              <p className="text-gray-600 mb-6">
                إذا كان لديك أي أسئلة حول هذه الشروط، لا تتردد في التواصل معنا
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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

