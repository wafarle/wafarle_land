import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Products from '@/components/Products';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        
        {/* Quick Links Section */}
        <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/products"
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all group border border-gray-200 hover:border-blue-400"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600">جميع المنتجات</h3>
              </Link>

              <Link
                href="/deals"
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all group border border-gray-200 hover:border-red-400"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏷️</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-red-600">العروض والخصومات</h3>
              </Link>

              <Link
                href="/track-order"
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all group border border-gray-200 hover:border-green-400"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-green-600">تتبع طلبك</h3>
              </Link>

              <Link
                href="/faq"
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all group border border-gray-200 hover:border-purple-400"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">❓</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-purple-600">الأسئلة الشائعة</h3>
              </Link>
            </div>
          </div>
        </section>

        <Products />
        <Features />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
