'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Tag,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Package,
  CheckCircle2,
  XCircle,
  Copy,
  Eye,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import {
  getDiscountCodes,
  addDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  subscribeToDiscountCodes,
  getProducts
} from '@/lib/database';
import { DiscountCode, Product } from '@/lib/firebase';
import { useToast } from '@/hooks/useToast';

export const CouponsTab = () => {
  const { showSuccess, showError } = useToast();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    description: '',
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    usageLimitPerCustomer: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    applicableProductIds: [] as string[],
    excludeProductIds: [] as string[],
    // Advanced features
    priority: 1,
    stackable: false,
    autoApply: false,
    loyaltyTierOnly: '' as '' | 'bronze' | 'silver' | 'gold' | 'platinum',
    bulkDiscount: {
      enabled: false,
      tiers: [] as Array<{ minQuantity: number; discount: number }>
    },
    minimumItems: 0,
    freeShipping: false,
    buyXGetY: {
      enabled: false,
      buyQuantity: 1,
      getQuantity: 1,
      productId: ''
    }
  });

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDiscountCodes(setDiscountCodes);
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [codes, productsData] = await Promise.all([
        getDiscountCodes(),
        getProducts()
      ]);
      setDiscountCodes(codes);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (code?: DiscountCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        type: code.type,
        value: code.value,
        description: code.description || '',
        minPurchaseAmount: code.minPurchaseAmount || 0,
        maxDiscountAmount: code.maxDiscountAmount || 0,
        usageLimit: code.usageLimit || 0,
        usageLimitPerCustomer: code.usageLimitPerCustomer || 1,
        validFrom: code.validFrom ? new Date(code.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        validTo: code.validTo ? new Date(code.validTo).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: code.isActive,
        applicableProductIds: code.applicableProductIds || [],
        excludeProductIds: code.excludeProductIds || [],
        priority: code.priority || 1,
        stackable: code.stackable || false,
        autoApply: code.autoApply || false,
        loyaltyTierOnly: code.loyaltyTierOnly || '',
        bulkDiscount: code.bulkDiscount || { enabled: false, tiers: [] },
        minimumItems: code.minimumItems || 0,
        freeShipping: code.freeShipping || false,
        buyXGetY: code.buyXGetY ? {
          ...code.buyXGetY,
          productId: code.buyXGetY.productId ?? ''
        } : { enabled: false, buyQuantity: 1, getQuantity: 1, productId: '' }
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: 10,
        description: '',
        minPurchaseAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        usageLimitPerCustomer: 1,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        applicableProductIds: [],
        excludeProductIds: [],
        priority: 1,
        stackable: false,
        autoApply: false,
        loyaltyTierOnly: '',
        bulkDiscount: { enabled: false, tiers: [] },
        minimumItems: 0,
        freeShipping: false,
        buyXGetY: { enabled: false, buyQuantity: 1, getQuantity: 1, productId: '' }
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      showError('كود الخصم مطلوب');
      return;
    }

    if (formData.value <= 0) {
      showError('قيمة الخصم يجب أن تكون أكبر من صفر');
      return;
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      showError('النسبة المئوية لا يمكن أن تتجاوز 100%');
      return;
    }

    try {
      // Clean up empty fields
      const cleanedFormData: any = { ...formData };
      
      // Remove empty strings and zero values for optional fields
      if (cleanedFormData.loyaltyTierOnly === '') delete cleanedFormData.loyaltyTierOnly;
      if (cleanedFormData.minimumItems === 0) delete cleanedFormData.minimumItems;
      if (!cleanedFormData.bulkDiscount.enabled) delete cleanedFormData.bulkDiscount;
      if (!cleanedFormData.buyXGetY.enabled) delete cleanedFormData.buyXGetY;
      
      if (editingCode) {
        await updateDiscountCode(editingCode.id, {
          ...cleanedFormData,
          validFrom: new Date(cleanedFormData.validFrom),
          validTo: new Date(cleanedFormData.validTo),
        });
        showSuccess('تم تحديث كود الخصم بنجاح');
      } else {
        await addDiscountCode({
          ...cleanedFormData,
          validFrom: new Date(cleanedFormData.validFrom),
          validTo: new Date(cleanedFormData.validTo),
          createdBy: 'admin',
        });
        showSuccess('تم إضافة كود الخصم بنجاح');
      }
      handleCloseForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving discount code:', error);
      showError(error.message || 'حدث خطأ في حفظ كود الخصم');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف كود الخصم؟')) return;

    try {
      await deleteDiscountCode(id);
      showSuccess('تم حذف كود الخصم بنجاح');
      loadData();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      showError('حدث خطأ في حذف كود الخصم');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showSuccess('تم نسخ الكود');
  };

  const filteredCodes = discountCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const isCodeValid = (code: DiscountCode) => {
    const now = new Date();
    return code.isActive &&
           now >= new Date(code.validFrom) &&
           now <= new Date(code.validTo) &&
           (!code.usageLimit || code.usedCount < code.usageLimit);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">أكواد الخصم</h2>
          <p className="text-gray-600 mt-1">إدارة أكواد الخصم والكوبونات</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة كود خصم
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث في أكواد الخصم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Tag className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Codes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أكواد خصم</h3>
          <p className="text-gray-600 mb-6">ابدأ بإضافة كود خصم جديد</p>
          <button
            onClick={() => handleOpenForm()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            إضافة أول كود
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCodes.map((code) => (
            <motion.div
              key={code.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl p-6 border-2 ${
                isCodeValid(code)
                  ? 'border-green-200 hover:border-green-300'
                  : 'border-gray-200 hover:border-gray-300'
              } shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold font-mono text-gray-900">{code.code}</h3>
                    <button
                      onClick={() => handleCopyCode(code.code)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="نسخ الكود"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    {code.type === 'percentage' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <Percent className="w-3 h-3" />
                        {code.value}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        <DollarSign className="w-3 h-3" />
                        {code.value}
                      </span>
                    )}
                    {isCodeValid(code) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        <XCircle className="w-3 h-3" />
                        غير نشط
                      </span>
                    )}
                  </div>
                  {code.description && (
                    <p className="text-sm text-gray-600 mb-3">{code.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>من {formatDate(code.validFrom)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>إلى {formatDate(code.validTo)}</span>
                </div>
                {code.usageLimit && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>استخدم {code.usedCount} من {code.usageLimit}</span>
                  </div>
                )}
                {code.applicableProductIds && code.applicableProductIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>{code.applicableProductIds.length} منتج محدد</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <button
                  onClick={() => handleOpenForm(code)}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4 inline ml-1" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(code.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="min-h-screen bg-white"
          >
            {/* Header - Sticky */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
              <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingCode ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}
                  </h3>
                  <button
                    onClick={handleCloseForm}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كود الخصم *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                  placeholder="REVIEW10"
                  required
                  disabled={!!editingCode}
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الخصم *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قيمة الخصم *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    step={formData.type === 'percentage' ? 1 : 0.01}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="وصف كود الخصم..."
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البدء *
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الانتهاء *
                  </label>
                  <input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأدنى للشراء
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأقصى للخصم
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    disabled={formData.type === 'fixed'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حد الاستخدام الإجمالي
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              {/* Advanced Features Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  ميزات متقدمة
                </h3>
                
                <div className="space-y-4">
                  {/* Priority and Stacking */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الأولوية
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">1 = أعلى أولوية</p>
                    </div>
                    <div className="flex items-center gap-6 pt-7">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.stackable}
                          onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })}
                          className="w-4 h-4 text-green-500 rounded"
                        />
                        <span className="text-sm text-gray-700">يمكن دمجه مع كوبونات أخرى</span>
                      </label>
                    </div>
                  </div>

                  {/* Auto Apply */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="autoApply"
                      checked={formData.autoApply}
                      onChange={(e) => setFormData({ ...formData, autoApply: e.target.checked })}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="autoApply" className="text-sm font-medium text-gray-700 flex-1">
                      تطبيق تلقائي (يُطبق بدون إدخال الكود)
                    </label>
                  </div>

                  {/* Loyalty Tier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مخصص لفئة ولاء
                    </label>
                    <select
                      value={formData.loyaltyTierOnly}
                      onChange={(e) => setFormData({ ...formData, loyaltyTierOnly: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">جميع العملاء</option>
                      <option value="bronze">برونزي فقط</option>
                      <option value="silver">فضي فقط</option>
                      <option value="gold">ذهبي فقط</option>
                      <option value="platinum">بلاتيني فقط</option>
                    </select>
                  </div>

                  {/* Minimum Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحد الأدنى لعدد المنتجات
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minimumItems}
                      onChange={(e) => setFormData({ ...formData, minimumItems: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">يجب أن يحتوي الطلب على هذا العدد على الأقل</p>
                  </div>

                  {/* Free Shipping */}
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <input
                      type="checkbox"
                      id="freeShipping"
                      checked={formData.freeShipping}
                      onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                      className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                    />
                    <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700 flex-1">
                      شحن مجاني
                    </label>
                  </div>

                  {/* Bulk Discount */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="bulkDiscountEnabled"
                        checked={formData.bulkDiscount.enabled}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          bulkDiscount: { ...formData.bulkDiscount, enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-purple-500 rounded"
                      />
                      <label htmlFor="bulkDiscountEnabled" className="text-sm font-medium text-gray-700">
                        خصم على الكمية
                      </label>
                    </div>
                    {formData.bulkDiscount.enabled && (
                      <div className="space-y-3">
                        {formData.bulkDiscount.tiers.map((tier, index) => (
                          <div key={index} className="flex gap-3 items-end">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">الحد الأدنى للكمية</label>
                              <input
                                type="number"
                                min="1"
                                value={tier.minQuantity}
                                onChange={(e) => {
                                  const newTiers = [...formData.bulkDiscount.tiers];
                                  newTiers[index].minQuantity = parseInt(e.target.value) || 1;
                                  setFormData({ ...formData, bulkDiscount: { ...formData.bulkDiscount, tiers: newTiers } });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">الخصم (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={tier.discount}
                                onChange={(e) => {
                                  const newTiers = [...formData.bulkDiscount.tiers];
                                  newTiers[index].discount = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, bulkDiscount: { ...formData.bulkDiscount, tiers: newTiers } });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newTiers = formData.bulkDiscount.tiers.filter((_, i) => i !== index);
                                setFormData({ ...formData, bulkDiscount: { ...formData.bulkDiscount, tiers: newTiers } });
                              }}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              bulkDiscount: {
                                ...formData.bulkDiscount,
                                tiers: [...formData.bulkDiscount.tiers, { minQuantity: 1, discount: 0 }]
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors text-sm"
                        >
                          + إضافة مستوى خصم
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Buy X Get Y */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="buyXGetYEnabled"
                        checked={formData.buyXGetY.enabled}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          buyXGetY: { ...formData.buyXGetY, enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-blue-500 rounded"
                      />
                      <label htmlFor="buyXGetYEnabled" className="text-sm font-medium text-gray-700">
                        اشتر X واحصل على Y
                      </label>
                    </div>
                    {formData.buyXGetY.enabled && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">اشتري</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.buyXGetY.buyQuantity}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              buyXGetY: { ...formData.buyXGetY, buyQuantity: parseInt(e.target.value) || 1 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">احصل على</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.buyXGetY.getQuantity}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              buyXGetY: { ...formData.buyXGetY, getQuantity: parseInt(e.target.value) || 1 }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">المنتج (اختياري)</label>
                          <select
                            value={formData.buyXGetY.productId || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              buyXGetY: { ...formData.buyXGetY, productId: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">أي منتج</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 border-t border-gray-200 pt-6 mt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  كود نشط
                </label>
              </div>

              {/* Actions - Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-6 mt-8 pb-4 -mx-6 px-6 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <Save className="w-6 h-6" />
                    {editingCode ? 'تحديث كود الخصم' : 'إضافة كود الخصم'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </form>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

