'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Check,
  ChevronLeft,
  AlertCircle,
  Package,
  Truck,
  Shield,
  Lock
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFormatPrice } from '@/contexts/CurrencyContext';
import { useRouter } from 'next/navigation';
import { addOrder } from '@/lib/database';
import { onCustomerAuthStateChange, CustomerUser } from '@/lib/customerAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import PaymentModal from '@/components/PaymentModal';
import { PaymentIntent } from '@/lib/payment';

export default function CheckoutPage() {
  const { items, clearCart, getTotalPrice } = useCart();
  const { formatPrice } = useFormatPrice();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    zipCode: '',
    notes: '',
    paymentMethod: 'card' as 'card' | 'cash',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load customer data if logged in
  useEffect(() => {
    const unsubscribe = onCustomerAuthStateChange((user) => {
      setCustomerUser(user);
      if (user) {
        setFormData(prev => ({
          ...prev,
          customerName: user.displayName || '',
          customerEmail: user.email || '',
          customerPhone: user.phone || '',
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items.length, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.customerName.trim()) {
        alert('يرجى إدخال الاسم');
        return false;
      }
      if (!formData.customerEmail.trim()) {
        alert('يرجى إدخال البريد الإلكتروني');
        return false;
      }
      if (!formData.customerPhone.trim()) {
        alert('يرجى إدخال رقم الهاتف');
        return false;
      }
    }

    if (step === 2) {
      const hasPhysicalProducts = items.some(item => item.product.type === 'physical');
      if (hasPhysicalProducts) {
        if (!formData.shippingAddress.trim()) {
          alert('يرجى إدخال عنوان الشحن');
          return false;
        }
        if (!formData.city.trim()) {
          alert('يرجى إدخال المدينة');
          return false;
        }
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setIsSubmitting(true);
      const orderIds: string[] = [];

      // Create an order for each cart item
      for (const item of items) {
        const selectedOption = item.selectedOptionId
          ? item.product.priceOptions?.find((opt) => opt.name === item.selectedOptionId)
          : null;
        
        const itemPrice = selectedOption?.price || item.product.price;
        const itemTotal = itemPrice * item.quantity;

        const orderData: any = {
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim().toLowerCase(),
          customerPhone: formData.customerPhone.trim(),
          productId: item.product.id,
          productName: selectedOption 
            ? `${item.product.name} - ${selectedOption.name}`
            : item.product.name,
          productPrice: itemPrice,
          quantity: item.quantity,
          totalAmount: itemTotal,
          status: 'pending' as const,
          paymentStatus: 'unpaid' as const,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || '',
        };

        // Add shipping info for physical products
        if (item.product.type === 'physical') {
          orderData.shippingAddress = formData.shippingAddress.trim();
        }

        // Add selected options to notes
        let optionsNotes = '';
        if (selectedOption) {
          optionsNotes += `خطة: ${selectedOption.name}`;
        }
        if (item.selectedColor) {
          optionsNotes += ` | اللون: ${item.selectedColor}`;
        }
        if (item.selectedSize) {
          optionsNotes += ` | المقاس: ${item.selectedSize}`;
        }
        if (optionsNotes) {
          orderData.notes = optionsNotes + (formData.notes ? ` | ${formData.notes}` : '');
        }

        const orderId = await addOrder(orderData);
        orderIds.push(orderId);
      }

      setCreatedOrderIds(orderIds);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating orders:', error);
      alert('حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: PaymentIntent) => {
    clearCart();
    router.push('/customer/dashboard?tab=orders');
  };

  const handlePaymentError = (error: string) => {
    alert(error || 'حدث خطأ في معالجة الدفع');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const totalPrice = getTotalPrice();
  const hasPhysicalProducts = items.some(item => item.product.type === 'physical');
  const shippingCost = hasPhysicalProducts ? 50 : 0;
  const tax = totalPrice * 0.15;
  const finalTotal = totalPrice + shippingCost + tax;

  const steps = [
    { id: 1, name: 'معلومات الاتصال', icon: User },
    { id: 2, name: 'عنوان الشحن', icon: MapPin },
    { id: 3, name: 'المراجعة والدفع', icon: CreditCard },
  ];

  return (
    <>
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
                <Link href="/cart" className="hover:text-blue-600 transition-colors">
                  السلة
                </Link>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-gray-900 font-medium">إتمام الطلب</span>
              </nav>
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-center">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : isActive
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-sm font-medium ${
                            isActive ? 'text-blue-600' : 'text-gray-600'
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-24 h-1 mx-4 ${
                            currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                {/* Step 1: Contact Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <User className="w-6 h-6 text-blue-600" />
                      معلومات الاتصال
                    </h2>

                    {customerUser && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800 text-sm flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          مرحباً {customerUser.displayName}! تم ملء بياناتك تلقائياً
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          الاسم الكامل *
                        </label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="أدخل اسمك الكامل"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          البريد الإلكتروني *
                        </label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={handleInputChange}
                            className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="example@email.com"
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
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleInputChange}
                            className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="05XXXXXXXX"
                            required
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleNextStep}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        التالي
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Shipping Address */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-blue-600" />
                      عنوان الشحن
                    </h2>

                    {!hasPhysicalProducts && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          لا يوجد منتجات تحتاج شحن. يمكنك تخطي هذه الخطوة.
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          العنوان الكامل {hasPhysicalProducts && '*'}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                          <textarea
                            name="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full pr-11 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="الشارع، الحي، رقم المبنى..."
                            required={hasPhysicalProducts}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            المدينة {hasPhysicalProducts && '*'}
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="الرياض، جدة، الدمام..."
                            required={hasPhysicalProducts}
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            الرمز البريدي
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="12345"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          ملاحظات إضافية
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="أي ملاحظات خاصة بالطلب..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all"
                        >
                          رجوع
                        </button>
                        <button
                          onClick={handleNextStep}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                        >
                          التالي
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review and Payment */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Review Information */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Package className="w-6 h-6 text-blue-600" />
                        مراجعة الطلب
                      </h2>

                      {/* Contact Info */}
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">معلومات الاتصال</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><span className="font-medium">الاسم:</span> {formData.customerName}</p>
                          <p><span className="font-medium">البريد:</span> {formData.customerEmail}</p>
                          <p><span className="font-medium">الجوال:</span> {formData.customerPhone}</p>
                        </div>
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
                        >
                          تعديل
                        </button>
                      </div>

                      {/* Shipping Address */}
                      {hasPhysicalProducts && (
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3">عنوان الشحن</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>{formData.shippingAddress}</p>
                            <p>{formData.city} {formData.zipCode && `- ${formData.zipCode}`}</p>
                          </div>
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
                          >
                            تعديل
                          </button>
                        </div>
                      )}

                      {/* Products Summary */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">المنتجات ({items.length})</h3>
                        <div className="space-y-3">
                          {items.map((item) => {
                            const selectedOption = item.selectedOptionId
                              ? item.product.priceOptions?.find((opt) => opt.name === item.selectedOptionId)
                              : null;
                            const itemPrice = selectedOption?.price || item.product.price;

                            return (
                              <div
                                key={`${item.product.id}-${item.selectedOptionId}`}
                                className="flex items-center gap-3 text-sm"
                              >
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  {item.product.images?.[0] || item.product.image ? (
                                    <img
                                      src={item.product.images?.[0] || item.product.image}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                                      {item.product.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.product.name}</p>
                                  {selectedOption && (
                                    <p className="text-xs text-gray-500">{selectedOption.name}</p>
                                  )}
                                  <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                                </div>
                                <span className="font-semibold text-gray-900">
                                  {formatPrice(itemPrice * item.quantity)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        طريقة الدفع
                      </h2>

                      <div className="space-y-3">
                        <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === 'card'}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-blue-600"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">بطاقة ائتمان</span>
                            <p className="text-sm text-gray-500">Visa, Mastercard, Mada</p>
                          </div>
                          <Lock className="w-5 h-5 text-gray-400" />
                        </label>

                        <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={formData.paymentMethod === 'cash'}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-blue-600"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">الدفع عند الاستلام</span>
                            <p className="text-sm text-gray-500">للمنتجات الملموسة فقط</p>
                          </div>
                          <Truck className="w-5 h-5 text-gray-400" />
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        رجوع
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            جاري المعالجة...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            تأكيد الطلب
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">ملخص الطلب</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>المجموع الفرعي</span>
                      <span className="font-semibold">{formatPrice(totalPrice)}</span>
                    </div>
                    
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>الشحن</span>
                        <span className="font-semibold">{formatPrice(shippingCost)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-700">
                      <span>ضريبة القيمة المضافة (15%)</span>
                      <span className="font-semibold">{formatPrice(tax)}</span>
                    </div>
                    
                    <div className="pt-4 border-t-2 border-gray-200">
                      <div className="flex justify-between text-gray-900 text-xl font-bold">
                        <span>الإجمالي</span>
                        <span>{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span>دفع آمن ومشفر</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span>شحن سريع وموثوق</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Package className="w-5 h-5 text-purple-600" />
                      <span>ضمان استرجاع المنتج</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && createdOrderIds.length > 0 && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            clearCart();
            router.push('/customer/dashboard?tab=orders');
          }}
          orderId={createdOrderIds[0]}
          amount={finalTotal}
          customerName={formData.customerName}
          customerEmail={formData.customerEmail}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </>
  );
}

