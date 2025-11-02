'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search,
  ChevronLeft,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  AlertCircle,
  Download,
  XCircle,
  Calendar
} from 'lucide-react';
import { getOrders } from '@/lib/database';
import { Order } from '@/lib/firebase';
import { useFormatPrice } from '@/contexts/CurrencyContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const { formatPrice } = useFormatPrice();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setSearched(true);

    if (!email.trim() || !phone.trim()) {
      setError('يرجى إدخال البريد الإلكتروني ورقم الجوال');
      return;
    }

    try {
      setLoading(true);
      const allOrders = await getOrders();
      
      // Find order matching email and phone
      const foundOrder = allOrders.find(
        o => o.email?.toLowerCase() === email.toLowerCase().trim() &&
             o.phone === phone.trim()
      );

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('لم نتمكن من العثور على طلب بهذه البيانات. يرجى التحقق من البريد الإلكتروني ورقم الجوال.');
      }
    } catch (error) {
      console.error('Error searching order:', error);
      setError('حدث خطأ أثناء البحث عن الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { label: 'بانتظار التأكيد', icon: Clock, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
      confirmed: { label: 'مؤكد', icon: CheckCircle, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
      completed: { label: 'مكتمل', icon: CheckCircle, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
      cancelled: { label: 'ملغي', icon: XCircle, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getShippingStatusConfig = (status?: string) => {
    const configs = {
      pending_shipping: { label: 'بانتظار الشحن', icon: Clock, color: 'gray' },
      prepared: { label: 'تم التحضير', icon: Package, color: 'blue' },
      shipped: { label: 'تم الشحن', icon: Truck, color: 'purple' },
      in_transit: { label: 'في الطريق', icon: Truck, color: 'yellow' },
      delivered: { label: 'تم التسليم', icon: CheckCircle, color: 'green' }
    };
    return configs[status as keyof typeof configs] || configs.pending_shipping;
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      unpaid: { label: 'غير مدفوع', color: 'bg-red-100 text-red-800' },
      paid: { label: 'مدفوع', color: 'bg-green-100 text-green-800' },
      refunded: { label: 'مسترد', color: 'bg-gray-100 text-gray-800' }
    };
    return configs[status as keyof typeof configs] || configs.unpaid;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-gray-900 font-medium">تتبع الطلب</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              تتبع طلبك
            </h1>
            <p className="text-lg text-gray-600">
              أدخل بياناتك لمعرفة حالة طلبك
            </p>
          </motion.div>

          {/* Search Form */}
          {!order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    رقم الجوال *
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XXXXXXXX"
                      className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      تتبع الطلب
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Found */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-xl font-bold text-green-900">تم العثور على طلبك!</h2>
                    <p className="text-green-700">رقم الطلب: #{order.id}</p>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">حالة الطلب</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Order Status */}
                  <div className={`${getStatusConfig(order.status).bg} border ${getStatusConfig(order.status).border} rounded-xl p-6`}>
                    {(() => {
                      const StatusIcon = getStatusConfig(order.status).icon;
                      return (
                        <>
                          <StatusIcon className={`w-8 h-8 ${getStatusConfig(order.status).text} mb-3`} />
                          <div className="text-sm text-gray-600 mb-1">حالة الطلب</div>
                          <div className={`font-bold ${getStatusConfig(order.status).text}`}>
                            {getStatusConfig(order.status).label}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Payment Status */}
                  <div className={`${getPaymentStatusConfig(order.paymentStatus || 'pending' || 'pending').color} rounded-xl p-6 border border-gray-200`}>
                    <div className="text-sm text-gray-600 mb-1">حالة الدفع</div>
                    <div className="font-bold">
                      {getPaymentStatusConfig(order.paymentStatus || 'pending').label}
                    </div>
                  </div>

                  {/* Shipping Status */}
                  {order.shippingStatus && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      {(() => {
                        const ShippingIcon = getShippingStatusConfig(order.shippingStatus || 'pending').icon;
                        return (
                          <>
                            <ShippingIcon className="w-8 h-8 text-gray-600 mb-3" />
                            <div className="text-sm text-gray-600 mb-1">حالة الشحن</div>
                            <div className="font-bold text-gray-900">
                              {getShippingStatusConfig(order.shippingStatus || 'pending').label}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">اسم العميل:</span>
                      <span className="font-medium text-gray-900 mr-2">{order.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ الطلب:</span>
                      <span className="font-medium text-gray-900 mr-2">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">المنتج:</span>
                      <span className="font-medium text-gray-900 mr-2">{order.product?.name || 'منتج'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الإجمالي:</span>
                      <span className="font-medium text-gray-900 mr-2">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>

                  {order.address && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600 mb-1">عنوان الشحن:</div>
                          <div className="text-gray-900">{order.address}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.shippingTrackingNumber && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="text-sm text-gray-600">رقم التتبع:</span>
                          <span className="font-mono font-bold text-blue-600 mr-2">
                            {order.shippingTrackingNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.downloadLink && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={order.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        تحميل المنتج
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Again */}
              <button
                onClick={() => {
                  setOrder(null);
                  setEmail('');
                  setPhone('');
                  setSearched(false);
                  setError('');
                }}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                البحث عن طلب آخر
              </button>
            </motion.div>
          )}

          {/* Help Section */}
          {!order && searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                نصائح للبحث
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>تأكد من إدخال البريد الإلكتروني المستخدم عند الطلب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>تأكد من إدخال رقم الجوال الصحيح</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>إذا كنت مسجلاً، يمكنك تتبع طلباتك من <Link href="/customer/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">لوحة التحكم</Link></span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>للمساعدة، <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">تواصل معنا</Link></span>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

