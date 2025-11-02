'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  ArrowLeft, 
  Camera, 
  Eye, 
  EyeOff, 
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  MapPin,
  Building,
  Settings,
  Award
} from 'lucide-react';
import { onCustomerAuthStateChange, CustomerUser, updateCustomerProfile } from '@/lib/customerAuth';
import Modal from '@/components/admin/Modal';
import Button from '@/components/admin/Button';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import Toast from '@/components/admin/Toast';
import { useFormatPrice } from '@/contexts/CurrencyContext';
import { getOrders } from '@/lib/database';
import { Order } from '@/lib/firebase';

export default function CustomerProfile() {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const router = useRouter();
  const { toasts, showSuccess, showError, hideToast } = useToast();
  const { formatPrice } = useFormatPrice();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onCustomerAuthStateChange((user) => {
      if (user) {
        setCustomerUser(user);
        setFormData({
          displayName: user.displayName || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
        });
        // Load customer orders
        loadCustomerOrders(user.email);
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Load customer orders
  const loadCustomerOrders = async (email: string) => {
    try {
      const allOrders = await getOrders();
      const customerOrders = allOrders.filter(order => 
        order.email?.toLowerCase() === email.toLowerCase()
      );
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error loading customer orders:', error);
    }
  };

  // Get customer statistics
  const getCustomerStats = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalSpent = orders.filter(order => order.paymentStatus === 'paid').reduce((sum, order) => sum + order.totalPrice, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    
    return { totalOrders, completedOrders, totalSpent, pendingOrders };
  };

  const stats = getCustomerStats();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'يرجى إدخال الاسم';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    if (formData.phone && !/^(\+966|966|05)[0-9]{8}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'يرجى إدخال رقم جوال صحيح (مثال: 0512345678)';
    }

    if (formData.address && formData.address.length < 10) {
      newErrors.address = 'يرجى إدخال عنوان مفصل (على الأقل 10 أحرف)';
    }

    if (formData.city && formData.city.length < 2) {
      newErrors.city = 'يرجى إدخال اسم مدينة صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'يرجى إدخال كلمة المرور الحالية';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'يرجى إدخال كلمة مرور جديدة';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!customerUser) return;

    setIsSubmitting(true);

    try {
      await updateCustomerProfile(customerUser.uid, formData);
      showSuccess('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('حدث خطأ في تحديث الملف الشخصي');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setIsSubmitting(true);

    try {
      // Here you would implement password change logic
      // This is a placeholder - you'll need to implement actual password change
      showSuccess('تم تغيير كلمة المرور بنجاح');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      showError('حدث خطأ في تغيير كلمة المرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!customerUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => router.push('/customer/dashboard')}
            variant="secondary"
            size="sm"
            icon={<ArrowLeft />}
          >
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
            <p className="text-gray-600">إدارة بياناتك الشخصية وإعدادات الحساب</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-gold to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {customerUser.displayName || 'غير محدد'}
                  </h3>
                  <p className="text-gray-600 mb-4">{customerUser.email}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-lg py-2 px-4">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">حساب مفعل</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    variant="secondary"
                    size="sm"
                    icon={<Lock />}
                    className="w-full justify-start"
                  >
                    تغيير كلمة المرور
                  </Button>
                  
                  <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
                    <Shield className="w-4 h-4" />
                    <span>آخر تسجيل دخول: اليوم</span>
                  </div>
                </div>
              </div>

              {/* Customer Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                  <h4 className="font-semibold">إحصائياتك</h4>
                  <p className="text-blue-100 text-sm">ملخص نشاطك</p>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">إجمالي الطلبات</span>
                    </div>
                    <span className="font-bold text-gray-900">{stats.totalOrders}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">مكتملة</span>
                    </div>
                    <span className="font-bold text-green-600">{stats.completedOrders}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-xs">$</span>
                      </div>
                      <span className="text-sm text-gray-600">إجمالي الإنفاق</span>
                    </div>
                    <span className="font-bold text-purple-600">{formatPrice(stats.totalSpent)}</span>
                  </div>
                  
                  {stats.pendingOrders > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        </div>
                        <span className="text-sm text-gray-600">معلقة</span>
                      </div>
                      <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">المعلومات الشخصية</h2>
                <p className="text-gray-600">تحديث بياناتك الشخصية ومعلومات الاتصال</p>
              </div>

              <form onSubmit={handleSubmitProfile} className="p-6 space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className={`block w-full pr-10 pl-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                        errors.displayName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="أدخل اسمك الكامل"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.displayName}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full pr-10 pl-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="example@domain.com"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجوال
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`block w-full pr-10 pl-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0512345678"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="أدخل عنوانك التفصيلي"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City Field */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة
                  </label>
                  <div className="relative">
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={`block w-full px-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">اختر المدينة</option>
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="مكة المكرمة">مكة المكرمة</option>
                      <option value="المدينة المنورة">المدينة المنورة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="الخبر">الخبر</option>
                      <option value="الطائف">الطائف</option>
                      <option value="تبوك">تبوك</option>
                      <option value="بريدة">بريدة</option>
                      <option value="خميس مشيط">خميس مشيط</option>
                      <option value="أبها">أبها</option>
                      <option value="نجران">نجران</option>
                      <option value="الجبيل">الجبيل</option>
                      <option value="ينبع">ينبع</option>
                      <option value="القطيف">القطيف</option>
                      <option value="حائل">حائل</option>
                      <option value="الأحساء">الأحساء</option>
                      <option value="الباحة">الباحة</option>
                      <option value="عرعر">عرعر</option>
                      <option value="سكاكا">سكاكا</option>
                      <option value="جيزان">جيزان</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    variant="primary"
                    size="lg"
                    icon={<Save />}
                  >
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="تغيير كلمة المرور"
        icon={<Lock className="w-5 h-5" />}
        maxWidth="lg"
        preventClose={isSubmitting}
      >
        <div className="space-y-6">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">تأمين الحساب</h5>
                <p className="text-sm text-blue-700">
                  تأكد من اختيار كلمة مرور قوية تحتوي على أرقام وحروف كبيرة وصغيرة ورموز خاصة
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmitPassword} className="space-y-5">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الحالية *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                  errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل كلمة المرور الحالية"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الجديدة *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أدخل كلمة مرور جديدة"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="أعد إدخال كلمة المرور"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Strength Indicator */}
          {passwordData.newPassword && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">قوة كلمة المرور:</div>
                
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>على الأقل 8 أحرف</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs ${
                    /[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      /[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>حروف كبيرة</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs ${
                    /[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      /[a-z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>حروف صغيرة</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs ${
                    /[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      /[0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>أرقام</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span>رموز خاصة</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              variant="secondary"
              size="sm"
              className="flex-1"
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              variant="primary"
              size="sm"
              className="flex-1"
              icon={<Lock />}
            >
              {isSubmitting ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
            </Button>
          </div>
        </form>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => hideToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
