'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Package, Check, AlertCircle, Clock, Star, Tag, ShoppingBag, CreditCard, Shield, Zap } from 'lucide-react';
import { addOrder, updateCustomerStats } from '@/lib/database';
import { Product, ProductOption } from '@/lib/firebase';
import { onCustomerAuthStateChange, CustomerUser } from '@/lib/customerAuth';
import Modal from '@/components/admin/Modal';
import Button from '@/components/admin/Button';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { useFormatPrice } from '@/contexts/CurrencyContext';

interface OrderFormProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const OrderForm = ({ product, isOpen, onClose }: OrderFormProps) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const { formatPrice, currency } = useFormatPrice();

  // Listen to customer auth state
  useEffect(() => {
    const unsubscribe = onCustomerAuthStateChange((user) => {
      setCustomerUser(user);
      
      // Auto-fill form if user is logged in
      if (user && isOpen) {
        setFormData({
          customerName: user.displayName || '',
          customerEmail: user.email || '',
          customerPhone: user.phone || '',
        });
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  // Set default option when product changes
  useEffect(() => {
    if (product && isOpen) {
      if (product.hasOptions && product.options && product.options.length > 0) {
        // Find default option or use first option
        const defaultOption = product.options.find(opt => opt.id === product.defaultOptionId) || product.options[0];
        setSelectedOption(defaultOption);
      } else {
        setSelectedOption(null);
      }
    }
  }, [product, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && customerUser) {
      setFormData({
        customerName: customerUser.displayName || '',
        customerEmail: customerUser.email || '',
        customerPhone: customerUser.phone || '',
      });
    } else if (!isOpen) {
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
      });
      setSelectedOption(null);
      setError('');
      setIsSubmitted(false);
    }
  }, [isOpen, customerUser]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setError('يرجى إدخال الاسم');
      return false;
    }
    if (!formData.customerEmail.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return false;
    }
    if (!formData.customerPhone.trim()) {
      setError('يرجى إدخال رقم الجوال');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }

    // Basic phone validation (Saudi format)
    const phoneRegex = /^(\+966|966|05)[0-9]{8}$/;
    if (!phoneRegex.test(formData.customerPhone.replace(/\s+/g, ''))) {
      setError('يرجى إدخال رقم جوال صحيح (مثال: 0512345678)');
      return false;
    }

    // Check if option is required and selected
    if (product.hasOptions && product.options && product.options.length > 0 && !selectedOption) {
      setError('يرجى اختيار خيار اشتراك');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Create order object
      const finalPrice = selectedOption ? selectedOption.price : product.price;
      const productDisplayName = selectedOption 
        ? `${product.name} - ${selectedOption.name} (${selectedOption.duration} شهر)`
        : product.name;

      const orderData = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim().toLowerCase(),
        customerPhone: formData.customerPhone.trim(),
        productId: product.id,
        productName: productDisplayName,
        productPrice: finalPrice,
        quantity: 1,
        totalAmount: finalPrice,
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
        paymentMethod: 'card' as const, // Default payment method
        notes: selectedOption 
          ? `خطة: ${selectedOption.name} | مدة: ${selectedOption.duration} شهر${selectedOption.description ? ` | وصف: ${selectedOption.description}` : ''}${selectedOption.originalPrice && selectedOption.price < selectedOption.originalPrice ? ` | خصم: ${Math.round(((selectedOption.originalPrice - selectedOption.price) / selectedOption.originalPrice) * 100)}%` : ''}`
          : `طلب جديد من الموقع للمنتج: ${product.name}`
      };

      // Submit to database
      await addOrder(orderData);
      
      // Update customer stats
      await updateCustomerStats(formData.customerEmail.trim().toLowerCase(), finalPrice);
      
      setIsSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ customerName: '', customerEmail: '', customerPhone: '' });
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting order:', error);
      setError('حدث خطأ في إرسال الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ customerName: '', customerEmail: '', customerPhone: '' });
      setError('');
      setIsSubmitted(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="طلب المنتج"
      icon={<ShoppingBag className="w-5 h-5" />}
      maxWidth="lg"
      preventClose={isSubmitting}
    >
      <div className="space-y-5">
              {!isSubmitted ? (
                <>
                  {/* Header Info */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-gold to-primary-gold/80 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
                        <p className="text-xs text-gray-600">اطلب الآن واحصل على خدمة مميزة</p>
                      </div>
                    </div>
                    
                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span>آمن</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-500" />
                        <span>سريع</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-purple-500" />
                        <span>موثوق</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Status */}
                  {customerUser && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 text-green-700">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold">مرحباً {customerUser.displayName}!</span>
                          <p className="text-xs text-green-600">تم ملء بياناتك تلقائياً</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Product Options */}
                  {product.hasOptions && product.options && product.options.length > 0 ? (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Clock className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">خطط الاشتراك</h4>
                          <p className="text-xs text-gray-600">اختر الخطة المناسبة</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {product.options.map((option, index) => (
                          <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedOption(option)}
                            className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                              selectedOption?.id === option.id
                                ? 'border-primary-gold bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-primary-gold/50 hover:shadow-md'
                            } ${option.isPopular ? 'ring-1 ring-yellow-400/50 shadow-md' : ''}`}
                          >
                            {option.isPopular && (
                              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                <Star className="w-2 h-2" />
                                شائع
                              </div>
                            )}
                            
                            <div className="text-center">
                              <div className="font-bold text-gray-900 text-sm">{option.name}</div>
                              <div className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                                <Clock className="w-2 h-2" />
                                {option.duration} شهر
                              </div>
                              <div className="mt-2">
                                <div className="text-lg font-bold text-primary-gold">{formatPrice(option.price)}</div>
                                {option.originalPrice && option.originalPrice > option.price && (
                                  <div className="flex items-center justify-center gap-1 mt-1">
                                    <span className="text-gray-400 line-through text-sm">{formatPrice(option.originalPrice)}</span>
                                    {(option.discount && option.discount > 0) && (
                                      <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-1 py-0.5 rounded text-xs font-semibold">
                                        -{option.discount || 0}%
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {option.description && (
                                <div className="text-xs text-gray-600 mt-2 bg-white/70 p-1.5 rounded">{option.description}</div>
                              )}
                            </div>

                            {selectedOption?.id === option.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      
                      {selectedOption && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-green-800">
                                  {selectedOption.name}
                                </span>
                                <p className="text-xs text-green-600">{selectedOption.duration} شهر</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-bold text-green-800">{formatPrice(selectedOption.price)}</div>
                              <div className="text-xs text-green-600">الإجمالي</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-primary-gold/10 to-amber-50 rounded-lg p-4 border border-primary-gold/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-gold to-amber-600 rounded-full flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">سعر المنتج</h4>
                            <p className="text-xs text-gray-600">سعر ثابت</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-gold">{formatPrice(product.price)}</div>
                          <div className="text-xs text-gray-600">الإجمالي</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">بياناتك الشخصية</h4>
                        <p className="text-xs text-gray-600">املأ البيانات لإتمام الطلب</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400 group-focus-within:text-primary-gold transition-colors" />
                          </div>
                          <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            placeholder="أدخل اسمك الكامل"
                            className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all shadow-sm hover:shadow-md"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </motion.div>

                      {/* Email Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          البريد الإلكتروني *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-primary-gold transition-colors" />
                          </div>
                          <input
                            type="email"
                            id="customerEmail"
                            name="customerEmail"
                            value={formData.customerEmail}
                            onChange={handleInputChange}
                            placeholder="example@domain.com"
                            className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all shadow-sm hover:shadow-md"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </motion.div>

                      {/* Phone Field */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الجوال *
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-primary-gold transition-colors" />
                          </div>
                          <input
                            type="tel"
                            id="customerPhone"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleInputChange}
                            placeholder="0512345678"
                            className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all shadow-sm hover:shadow-md"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </motion.div>

                      {/* Error Message */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-1"
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          loading={isSubmitting}
                          variant="primary"
                          size="lg"
                          icon={<ShoppingBag />}
                          className="w-full py-3 text-base font-semibold"
                        >
                          {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                        </Button>
                      </motion.div>

                      {/* Security & Support Info */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100"
                      >
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 mb-1">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span>آمن</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>رد سريع</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-purple-500" />
                            <span>مضمون</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          سيتم التواصل معك خلال 24 ساعة
                        </p>
                      </motion.div>
                    </form>
                  </div>
                </>
              ) : (
                /* Success Message */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="text-center py-6"
                >
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative mx-auto mb-4"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                    >
                      <Star className="w-3 h-3 text-yellow-800" />
                    </motion.div>
                  </motion.div>

                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-gray-900 mb-2"
                  >
                    تم إرسال طلبك بنجاح! 🎉
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-4 text-sm"
                  >
                    شكراً لثقتك بنا، سيتم التواصل معك قريباً
                  </motion.p>

                  {/* Order Summary */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3"
                  >
                    <h4 className="text-base font-semibold text-green-800 mb-3 flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" />
                      ملخص الطلب
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1 border-b border-green-200">
                        <span className="font-medium text-green-700">المنتج:</span>
                        <span className="text-green-800 text-right text-xs">
                          {selectedOption 
                            ? `${product.name} - ${selectedOption.name}`
                            : product.name
                          }
                        </span>
                      </div>
                      
                      {selectedOption && (
                        <div className="flex justify-between items-center py-1 border-b border-green-200">
                          <span className="font-medium text-green-700">المدة:</span>
                          <span className="text-green-800">{selectedOption.duration} شهر</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-2 bg-green-100 rounded px-3">
                        <span className="font-bold text-green-800">الإجمالي:</span>
                        <span className="text-lg font-bold text-green-800">
                          {formatPrice(selectedOption ? selectedOption.price : product.price)}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Next Steps */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-200"
                  >
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">الخطوات القادمة:</h5>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>التواصل خلال 24 ساعة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>تأكيد الطلب والدفع</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>بدء الخدمة</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
      </div>
    </Modal>
  );
};

export default OrderForm;
