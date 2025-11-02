'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronLeft, ChevronDown, Search, Package, CreditCard, Truck, RotateCcw, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = [
    { id: 'all', name: 'الكل', icon: HelpCircle },
    { id: 'orders', name: 'الطلبات', icon: Package },
    { id: 'payment', name: 'الدفع', icon: CreditCard },
    { id: 'shipping', name: 'الشحن', icon: Truck },
    { id: 'returns', name: 'الإرجاع', icon: RotateCcw },
    { id: 'account', name: 'الحساب', icon: Shield },
  ];

  const faqs = [
    {
      category: 'orders',
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'يمكنك تتبع طلبك من خلال لوحة التحكم الخاصة بك. بعد تسجيل الدخول، انتقل إلى قسم "طلباتي" حيث ستجد جميع تفاصيل طلباتك وحالة كل طلب. كما سنرسل لك إشعارات عبر البريد الإلكتروني عند تحديث حالة الطلب.'
    },
    {
      category: 'orders',
      question: 'ما هي مدة تنفيذ الطلب؟',
      answer: 'للمنتجات الرقمية: يتم التفعيل فوراً أو خلال 24 ساعة. للمنتجات الملموسة: يستغرق التوصيل من 3 إلى 7 أيام عمل حسب موقعك الجغرافي.'
    },
    {
      category: 'orders',
      question: 'هل يمكنني تعديل طلبي بعد إتمامه؟',
      answer: 'يمكنك تعديل الطلب قبل الشحن أو التفعيل فقط. يرجى التواصل مع خدمة العملاء فوراً إذا كنت ترغب في إجراء أي تعديلات.'
    },
    {
      category: 'payment',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نقبل الدفع عبر: بطاقات الائتمان (Visa, Mastercard, Mada)، PayPal، Apple Pay، والدفع عند الاستلام للمنتجات الملموسة في المدن المتاحة.'
    },
    {
      category: 'payment',
      question: 'هل الدفع آمن؟',
      answer: 'نعم، نستخدم أحدث تقنيات التشفير SSL/TLS لحماية معلومات الدفع الخاصة بك. جميع المعاملات تتم عبر بوابات دفع معتمدة وموثوقة.'
    },
    {
      category: 'payment',
      question: 'متى سيتم خصم المبلغ من حسابي؟',
      answer: 'يتم خصم المبلغ فوراً عند تأكيد الطلب. في حالة الإلغاء قبل الشحن/التفعيل، سيتم استرجاع المبلغ خلال 5-7 أيام عمل.'
    },
    {
      category: 'shipping',
      question: 'كم تبلغ رسوم الشحن؟',
      answer: 'رسوم الشحن 50 ريال للطلبات أقل من 200 ريال. الشحن مجاني للطلبات فوق 200 ريال. المنتجات الرقمية لا تحتاج شحن.'
    },
    {
      category: 'shipping',
      question: 'إلى أي مدن تقومون بالشحن؟',
      answer: 'نقوم بالشحن إلى جميع مدن المملكة العربية السعودية. للدول الأخرى، يرجى التواصل معنا للاستفسار عن التوفر.'
    },
    {
      category: 'shipping',
      question: 'ماذا لو لم أكن متواجداً عند التوصيل؟',
      answer: 'سيحاول مندوب التوصيل الاتصال بك. إذا لم تكن متواجداً، سيتم ترك إشعار وإعادة المحاولة في اليوم التالي أو يمكنك تحديد موعد آخر.'
    },
    {
      category: 'returns',
      question: 'ما هي سياسة الإرجاع؟',
      answer: 'يمكنك إرجاع المنتجات الملموسة خلال 14 يوم من الاستلام بشرط أن تكون في حالتها الأصلية. المنتجات الرقمية غير قابلة للإرجاع بعد التفعيل.'
    },
    {
      category: 'returns',
      question: 'كيف أطلب إرجاع منتج؟',
      answer: 'من لوحة التحكم، اذهب إلى "طلباتي"، اختر الطلب المراد إرجاعه، واضغط على "طلب إرجاع". سنراجع الطلب ونتواصل معك خلال 24-48 ساعة.'
    },
    {
      category: 'returns',
      question: 'متى سأحصل على استرجاع المبلغ؟',
      answer: 'بعد استلام المنتج المرتجع والتأكد من حالته، سيتم استرجاع المبلغ خلال 5-7 أيام عمل إلى نفس طريقة الدفع المستخدمة.'
    },
    {
      category: 'account',
      question: 'كيف أنشئ حساب جديد؟',
      answer: 'اضغط على "تسجيل" في أعلى الصفحة، أدخل بياناتك (الاسم، البريد الإلكتروني، كلمة المرور)، وأكد البريد الإلكتروني. ستتمكن بعدها من تتبع طلباتك والوصول إلى العروض الحصرية.'
    },
    {
      category: 'account',
      question: 'نسيت كلمة المرور، ماذا أفعل؟',
      answer: 'في صفحة تسجيل الدخول، اضغط على "نسيت كلمة المرور"، أدخل بريدك الإلكتروني، وسنرسل لك رابط لإعادة تعيين كلمة المرور.'
    },
    {
      category: 'account',
      question: 'كيف أحذف حسابي؟',
      answer: 'من إعدادات الحساب، يمكنك طلب حذف الحساب. سيتم حذف جميع بياناتك خلال 30 يوم. يرجى ملاحظة أن هذا الإجراء غير قابل للتراجع.'
    },
    {
      category: 'orders',
      question: 'هل يمكنني إلغاء طلبي؟',
      answer: 'نعم، يمكنك إلغاء الطلب قبل الشحن أو التفعيل دون أي رسوم. بعد الشحن أو التفعيل، يخضع الإلغاء لسياسة الإرجاع.'
    },
    {
      category: 'payment',
      question: 'هل تقدمون فواتير ضريبية؟',
      answer: 'نعم، يتم إصدار فاتورة ضريبية تلقائياً لكل طلب وإرسالها إلى بريدك الإلكتروني. يمكنك أيضاً تحميلها من لوحة التحكم.'
    },
    {
      category: 'shipping',
      question: 'هل تشحنون خارج السعودية؟',
      answer: 'حالياً نشحن داخل المملكة العربية السعودية فقط. نعمل على توسيع خدماتنا لتشمل دول الخليج قريباً.'
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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
              <span className="text-gray-900 font-medium">الأسئلة الشائعة</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <HelpCircle className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                الأسئلة الشائعة
              </h1>
              <p className="text-xl text-white/90">
                إجابات على أكثر الأسئلة شيوعاً
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث في الأسئلة الشائعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-lg"
                />
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-3 justify-center mb-12"
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </motion.div>

            {/* FAQs */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openItems.includes(index);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full px-6 py-5 flex items-center justify-between text-right hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-lg pr-2">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-5 pt-2 text-gray-700 leading-relaxed border-t border-gray-100">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  لم نجد أي نتائج مطابقة لبحثك
                </p>
              </div>
            )}

            {/* Still Have Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 text-center border border-purple-100"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                لم تجد إجابة لسؤالك؟
              </h3>
              <p className="text-gray-600 mb-6">
                فريق الدعم لدينا جاهز لمساعدتك على مدار الساعة
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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

