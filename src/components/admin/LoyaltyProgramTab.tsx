'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Award, Coins, Save, Users, TrendingUp, Star, Sparkles, Info } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import Button from './Button';

export const LoyaltyProgramTab = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [loyaltySettings, setLoyaltySettings] = useState({
    enabled: false,
    pointsPerDollar: 1,
    pointsPerOrder: 10,
    redemptionRate: 100,
    tiers: {
      bronze: { minSpent: 0, discount: 0 },
      silver: { minSpent: 500, discount: 5 },
      gold: { minSpent: 2000, discount: 10 },
      platinum: { minSpent: 5000, discount: 15 }
    }
  });

  useEffect(() => {
    if (settings?.website?.loyaltyProgram) {
      setLoyaltySettings(settings.website.loyaltyProgram);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedSettings = {
        ...settings,
        website: {
          ...settings.website,
          loyaltyProgram: loyaltySettings
        }
      };

      await updateSettings(updatedSettings);
      alert('تم حفظ إعدادات برنامج الولاء بنجاح!');
    } catch (error) {
      console.error('Error saving loyalty program settings:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  const TierCard = ({ 
    tier, 
    color, 
    icon: Icon 
  }: { 
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    color: string;
    icon: any;
  }) => {
    const tierLabels = {
      bronze: 'برونزي',
      silver: 'فضي',
      gold: 'ذهبي',
      platinum: 'بلاتيني'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border-2 ${color} p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${color.replace('border', 'bg').replace('border-2', '')} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{tierLabels[tier]}</h3>
              <p className="text-sm text-gray-600">فئة {tierLabels[tier]}</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الحد الأدنى للإنفاق (دولار)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={loyaltySettings.tiers[tier].minSpent}
              onChange={(e) => {
                const newTiers = { ...loyaltySettings.tiers };
                newTiers[tier] = {
                  ...newTiers[tier],
                  minSpent: parseInt(e.target.value) || 0
                };
                setLoyaltySettings({ ...loyaltySettings, tiers: newTiers });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نسبة الخصم (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={loyaltySettings.tiers[tier].discount}
              onChange={(e) => {
                const newTiers = { ...loyaltySettings.tiers };
                newTiers[tier] = {
                  ...newTiers[tier],
                  discount: parseFloat(e.target.value) || 0
                };
                setLoyaltySettings({ ...loyaltySettings, tiers: newTiers });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            {loyaltySettings.tiers[tier].discount > 0 && (
              <p className="text-xs text-green-600 mt-1">
                خصم {loyaltySettings.tiers[tier].discount}% على جميع الطلبات
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">برنامج الولاء</h2>
          <p className="text-gray-600 mt-2">إدارة نظام نقاط الولاء وفئات العملاء</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={loyaltySettings.enabled}
            onChange={(e) => setLoyaltySettings({ ...loyaltySettings, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="mr-3 text-sm font-medium text-gray-700">تفعيل برنامج الولاء</span>
        </label>
      </div>

      {loyaltySettings.enabled && (
        <>
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">كيف يعمل برنامج الولاء</h3>
                <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                  <li>يحصل العميل على نقاط عند كل عملية شراء</li>
                  <li>يمكن للعميل استبدال النقاط بخصومات على الطلبات</li>
                  <li>كلما زاد الإنفاق، زادت الفئة ونسبة الخصم</li>
                  <li>النقاط تتراكم تلقائياً مع كل طلب</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Points Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-500" />
              إعدادات النقاط
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نقاط لكل دولار
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={loyaltySettings.pointsPerDollar}
                  onChange={(e) => setLoyaltySettings({ 
                    ...loyaltySettings, 
                    pointsPerDollar: parseFloat(e.target.value) || 0 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">عدد النقاط المكتسبة لكل دولار يتم إنفاقه</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نقاط إضافية لكل طلب
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={loyaltySettings.pointsPerOrder}
                  onChange={(e) => setLoyaltySettings({ 
                    ...loyaltySettings, 
                    pointsPerOrder: parseInt(e.target.value) || 0 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">نقاط إضافية ثابتة لكل طلب (بغض النظر عن المبلغ)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  قيمة النقطة (بالدولار)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={loyaltySettings.redemptionRate}
                  onChange={(e) => setLoyaltySettings({ 
                    ...loyaltySettings, 
                    redemptionRate: parseInt(e.target.value) || 100 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">مثال: 100 نقطة = 1 دولار (أدخل 100)</p>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>مثال:</strong> إذا اشترى عميل منتج بقيمة $100:
                <br />
                • النقاط من المبلغ: {loyaltySettings.pointsPerDollar} × 100 = {loyaltySettings.pointsPerDollar * 100} نقطة
                <br />
                • النقاط الإضافية: {loyaltySettings.pointsPerOrder} نقطة
                <br />
                • <strong>إجمالي النقاط: {loyaltySettings.pointsPerDollar * 100 + loyaltySettings.pointsPerOrder} نقطة</strong>
                <br />
                • قيمتها: ${((loyaltySettings.pointsPerDollar * 100 + loyaltySettings.pointsPerOrder) / loyaltySettings.redemptionRate).toFixed(2)} خصم
              </p>
            </div>
          </div>

          {/* Tiers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              فئات الولاء
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TierCard
                tier="bronze"
                color="border-amber-200 bg-amber-50"
                icon={Award}
              />
              <TierCard
                tier="silver"
                color="border-gray-300 bg-gray-50"
                icon={Star}
              />
              <TierCard
                tier="gold"
                color="border-yellow-300 bg-yellow-50"
                icon={Crown}
              />
              <TierCard
                tier="platinum"
                color="border-purple-300 bg-purple-50"
                icon={Sparkles}
              />
            </div>
          </div>
        </>
      )}

      {!loyaltySettings.enabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">برنامج الولاء غير مفعّل</h3>
          <p className="text-gray-500 mb-6">
            فعّل برنامج الولاء لبدء منح النقاط للعملاء وزيادة ولائهم
          </p>
          <button
            onClick={() => setLoyaltySettings({ ...loyaltySettings, enabled: true })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            تفعيل برنامج الولاء
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !loyaltySettings.enabled}
          loading={saving}
          icon={<Save className="w-5 h-5" />}
        >
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
};




