'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  ChevronLeft,
  Clock,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { addMessage } from '@/lib/database';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useContactInfo } from '@/contexts/SettingsContext';

export default function ContactPage() {
  const contactInfo = useContactInfo();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addMessage({
        name: formData.name,
        email: formData.email,
        message: `${formData.subject}\n\n${formData.message}`,
      });

      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
              <span className="text-gray-900 font-medium">اتصل بنا</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                تواصل معنا
              </h1>
              <p className="text-xl text-white/90">
                نحن هنا للإجابة على أسئلتك ومساعدتك في أي وقت
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Information */}
              <div className="lg:col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات التواصل</h2>
                  
                  <div className="space-y-6">
                    {/* Email */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">البريد الإلكتروني</h3>
                        <a
                          href={`mailto:${contactInfo.email}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">رقم الهاتف</h3>
                        <a
                          href={`tel:${contactInfo.phone}`}
                          className="text-green-600 hover:text-green-700 transition-colors"
                        >
                          {contactInfo.phone}
                        </a>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">ساعات العمل</h3>
                        <p className="text-gray-600">السبت - الخميس: 9 صباحاً - 5 مساءً</p>
                      </div>
                    </div>

                    {/* Live Chat */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">الدردشة المباشرة</h3>
                        <p className="text-gray-600">متاح على مدار الساعة</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل رسالة</h2>

                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6"
                    >
                      <div className="flex items-center gap-3 text-green-800">
                        <CheckCircle className="w-6 h-6" />
                        <div>
                          <h3 className="font-semibold">تم إرسال رسالتك بنجاح!</h3>
                          <p className="text-sm">سنتواصل معك قريباً</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          الاسم *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="أدخل اسمك"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          البريد الإلكتروني *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        الموضوع *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="موضوع الرسالة"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        الرسالة *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        placeholder="اكتب رسالتك هنا..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          إرسال الرسالة
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

