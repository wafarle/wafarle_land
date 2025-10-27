'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Settings, 
  Globe, 
  TrendingUp, 
  RefreshCw,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  AVAILABLE_CURRENCIES, 
  Currency, 
  CurrencySettings,
  getCurrencyDisplay,
  formatPrice
} from '@/lib/currency';
import { useCurrency } from '@/contexts/CurrencyContext';
import Button from '@/components/admin/Button';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const CurrencyTab = () => {
  const { settings, loading, updateSettings, refreshSettings } = useCurrency();
  const { showSuccess, showError } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [formData, setFormData] = useState<CurrencySettings>({
    currentCurrency: settings.currentCurrency,
    baseCurrency: settings.baseCurrency,
    autoConvert: settings.autoConvert,
    showOriginalPrice: settings.showOriginalPrice
  });

  // Update form when settings change
  useEffect(() => {
    setFormData({
      currentCurrency: settings.currentCurrency,
      baseCurrency: settings.baseCurrency,
      autoConvert: settings.autoConvert,
      showOriginalPrice: settings.showOriginalPrice
    });
  }, [settings]);

  // Handle currency change
  const handleCurrencyChange = (field: 'currentCurrency' | 'baseCurrency', currencyCode: string) => {
    const selectedCurrency = AVAILABLE_CURRENCIES.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setFormData(prev => ({
        ...prev,
        [field]: selectedCurrency
      }));
    }
  };

  // Handle toggle change
  const handleToggleChange = (field: 'autoConvert' | 'showOriginalPrice') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateSettings(formData);
      showSuccess('تم تحديث إعدادات العملة بنجاح');
    } catch (error) {
      console.error('Error updating currency settings:', error);
      showError('حدث خطأ في تحديث إعدادات العملة');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshSettings();
      showSuccess('تم تحديث الإعدادات');
    } catch (error) {
      showError('حدث خطأ في تحديث الإعدادات');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إعدادات العملة</h2>
          <p className="text-gray-600">إدارة العملات المستخدمة في النظام</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          icon={<RefreshCw />}
        >
          تحديث
        </Button>
      </div>

      {/* Current Currency Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">العملة الحالية</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">{settings.currentCurrency.symbol}</div>
                <div className="text-blue-100">{settings.currentCurrency.name}</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-blue-100 text-sm">مثال</div>
            <div className="text-2xl font-bold">{formatPrice(100, settings.currentCurrency)}</div>
          </div>
        </div>
      </motion.div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">إعدادات العملة</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              العملة المستخدمة حالياً
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVAILABLE_CURRENCIES.map((currency) => (
                <motion.div
                  key={currency.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCurrencyChange('currentCurrency', currency.code)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.currentCurrency.code === currency.code
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{currency.symbol}</span>
                    {formData.currentCurrency.code === currency.code && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{currency.code}</div>
                  <div className="text-xs text-gray-600">{currency.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    مثال: {formatPrice(100, currency)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Base Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              العملة الأساسية للنظام
            </label>
            <select
              value={formData.baseCurrency.code}
              onChange={(e) => handleCurrencyChange('baseCurrency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {getCurrencyDisplay(currency)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              العملة التي يتم حفظ الأسعار بها في قاعدة البيانات
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">الإعدادات المتقدمة</h4>
            
            {/* Auto Convert */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">تحويل تلقائي للأسعار</div>
                <div className="text-sm text-gray-600">
                  تحويل الأسعار تلقائياً إلى العملة المختارة
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoConvert}
                  onChange={() => handleToggleChange('autoConvert')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Show Original Price */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">إظهار السعر الأصلي</div>
                <div className="text-sm text-gray-600">
                  إظهار السعر الأصلي بجانب السعر المحول
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showOriginalPrice}
                  onChange={() => handleToggleChange('showOriginalPrice')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">معلومات أسعار الصرف</h5>
                <div className="text-sm text-blue-700 space-y-1">
                  {AVAILABLE_CURRENCIES.map((currency) => (
                    <div key={currency.code} className="flex justify-between">
                      <span>1 {formData.baseCurrency.code} =</span>
                      <span>{currency.exchangeRate} {currency.code}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  * أسعار الصرف تقريبية ويتم تحديثها دورياً
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              loading={isUpdating}
              variant="primary"
              size="lg"
              icon={<Settings />}
            >
              {isUpdating ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Currency Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">معلومات العملات المتاحة</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_CURRENCIES.map((currency, index) => (
              <motion.div
                key={currency.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-gray-700">{currency.symbol}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{currency.code}</div>
                    <div className="text-xs text-gray-600">{currency.name}</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المنازل العشرية:</span>
                    <span className="font-medium">{currency.decimalPlaces}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">موضع الرمز:</span>
                    <span className="font-medium">
                      {currency.position === 'before' ? 'قبل الرقم' : 'بعد الرقم'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">مثال:</span>
                    <span className="font-medium">{formatPrice(1234.56, currency)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CurrencyTab;

