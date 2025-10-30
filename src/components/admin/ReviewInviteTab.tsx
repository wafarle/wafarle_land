'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, ToggleLeft, ToggleRight, Save, Info, CheckCircle2, XCircle, DollarSign, Hash, Eye } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/useToast';
import { getDiscountCodeByCode, addDiscountCode, updateDiscountCode } from '@/lib/database';

export const ReviewInviteTab = () => {
  const { settings, updateSettings } = useSettings();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    enabled: true,
    discountCode: 'REVIEW10',
    discountPercentage: 10
  });

  useEffect(() => {
    if (settings.website.reviewInvite) {
      setFormData({
        enabled: settings.website.reviewInvite.enabled ?? true,
        discountCode: settings.website.reviewInvite.discountCode || 'REVIEW10',
        discountPercentage: settings.website.reviewInvite.discountPercentage || 10
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const discountCodeValue = formData.discountCode.toUpperCase().trim();
      const discountPercentage = Math.max(1, Math.min(100, formData.discountPercentage));
      
      // Check if discount code exists, if not create it
      if (formData.enabled) {
        const existingCode = await getDiscountCodeByCode(discountCodeValue);
        
        if (!existingCode) {
          // Create the discount code automatically
          try {
            await addDiscountCode({
              code: discountCodeValue,
              type: 'percentage',
              value: discountPercentage,
              description: `كود خصم من دعوة التقييم - ${discountPercentage}%`,
              isActive: true,
              validFrom: new Date(),
              validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
              usageLimit: 0, // Unlimited
              usageLimitPerCustomer: 1, // One use per customer
              createdBy: 'system'
            });
            console.log('✅ Review invite discount code created automatically');
          } catch (error: any) {
            // If code exists, try to update it
            if (error.message?.includes('موجود بالفعل')) {
              console.log('⚠️ Discount code already exists, will be updated if needed');
            } else {
              console.error('Error creating review invite discount code:', error);
            }
          }
        } else {
          // Update existing code if percentage changed
          if (existingCode.value !== discountPercentage || !existingCode.isActive) {
            await updateDiscountCode(existingCode.id, {
              value: discountPercentage,
              type: 'percentage',
              isActive: true,
              description: `كود خصم من دعوة التقييم - ${discountPercentage}%`
            });
          }
        }
      }
      
      await updateSettings({
        ...settings,
        website: {
          ...settings.website,
          reviewInvite: {
            enabled: formData.enabled,
            discountCode: discountCodeValue,
            discountPercentage: discountPercentage
          }
        }
      });
      showSuccess('تم حفظ إعدادات دعوة التقييم بنجاح!');
    } catch (error) {
      console.error('Error saving review invite settings:', error);
      showError('حدث خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إعدادات دعوة التقييم</h2>
            <p className="text-gray-600 mt-1">تحكم في نافذة دعوة العملاء للتقييم مقابل كود خصم</p>
          </div>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <div>
              <h3 className="font-semibold text-gray-900">تفعيل دعوة التقييم</h3>
              <p className="text-sm text-gray-600">عرض نافذة دعوة التقييم للعملاء الذين لم يقيموا بعد</p>
            </div>
          </div>
          <button
            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
              formData.enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                formData.enabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
            {formData.enabled ? (
              <CheckCircle2 className="absolute top-1.5 right-2 w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="absolute top-1.5 left-2 w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        {formData.enabled && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                النافذة ستظهر تلقائياً للعملاء الذين ليس لديهم أي تقييمات. يمكن للعميل إغلاق النافذة ولن تظهر مرة أخرى لمدة 7 أيام.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Discount Code Settings */}
      {formData.enabled && (
        <>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">كود الخصم</h3>
                <p className="text-sm text-gray-600">الكود الذي سيحصل عليه العميل بعد التقييم</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كود الخصم
                </label>
                <input
                  type="text"
                  value={formData.discountCode}
                  onChange={(e) => setFormData({ ...formData, discountCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg"
                  placeholder="REVIEW10"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-2">سيتم تحويل الكود تلقائياً إلى أحرف كبيرة</p>
              </div>
            </div>
          </div>

          {/* Discount Percentage */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">نسبة الخصم</h3>
                <p className="text-sm text-gray-600">نسبة الخصم التي سيحصل عليها العميل</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نسبة الخصم (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, discountPercentage: Math.max(1, Math.min(100, value)) });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="10"
                />
                <div className="mt-3 flex items-center gap-4">
                  {[5, 10, 15, 20, 25].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setFormData({ ...formData, discountPercentage: percent })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.discountPercentage === percent
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600" />
              معاينة النافذة
            </h3>
            <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 shadow-md">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 mx-auto">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  قيمنا واحصل على خصم {formData.discountPercentage}%!
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  نحن نقدر رأيك! قم بتقييم خدماتنا واحصل على كود خصم حصري
                </p>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border-2 border-yellow-300">
                  <p className="text-sm text-gray-600 mb-2">كود الخصم</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
                    {formData.discountCode.toUpperCase() || 'REVIEW10'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </motion.button>
      </div>
    </div>
  );
};

