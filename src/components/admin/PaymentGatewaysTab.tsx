'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle, Shield, Info } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import Button from './Button';

export const PaymentGatewaysTab = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  
  // PayPal Settings
  const [paypal, setPaypal] = useState({
    enabled: false,
    clientId: '',
    secretKey: '',
    mode: 'sandbox' as 'sandbox' | 'live',
    showSecret: false
  });

  // Stripe Settings
  const [stripe, setStripe] = useState({
    enabled: false,
    publishableKey: '',
    secretKey: '',
    mode: 'test' as 'test' | 'live',
    showSecret: false
  });

  // Moyasar Settings
  const [moyasar, setMoyasar] = useState({
    enabled: false,
    publishableKey: '',
    secretKey: '',
    mode: 'test' as 'test' | 'live',
    showSecret: false
  });

  // Load settings
  useEffect(() => {
    if (settings?.website?.paymentGateways) {
      const pg = settings.website.paymentGateways;
      
      if (pg.paypal) {
        setPaypal({
          enabled: pg.paypal.enabled || false,
          clientId: pg.paypal.clientId || '',
          secretKey: pg.paypal.secretKey || '',
          mode: pg.paypal.mode || 'sandbox',
          showSecret: false
        });
      }
      
      if (pg.stripe) {
        setStripe({
          enabled: pg.stripe.enabled || false,
          publishableKey: pg.stripe.publishableKey || '',
          secretKey: pg.stripe.secretKey || '',
          mode: pg.stripe.mode || 'test',
          showSecret: false
        });
      }
      
      if (pg.moyasar) {
        setMoyasar({
          enabled: pg.moyasar.enabled || false,
          publishableKey: pg.moyasar.publishableKey || '',
          secretKey: pg.moyasar.secretKey || '',
          mode: pg.moyasar.mode || 'test',
          showSecret: false
        });
      }
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedSettings = {
        ...settings,
        website: {
          ...settings.website,
          paymentGateways: {
            paypal: {
              enabled: paypal.enabled,
              clientId: paypal.clientId.trim(),
              secretKey: paypal.secretKey.trim(),
              mode: paypal.mode
            },
            stripe: {
              enabled: stripe.enabled,
              publishableKey: stripe.publishableKey.trim(),
              secretKey: stripe.secretKey.trim(),
              mode: stripe.mode
            },
            moyasar: {
              enabled: moyasar.enabled,
              publishableKey: moyasar.publishableKey.trim(),
              secretKey: moyasar.secretKey.trim(),
              mode: moyasar.mode
            }
          }
        }
      };

      await updateSettings(updatedSettings);
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error saving payment gateway settings:', error);
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

  const GatewayCard = ({ 
    title, 
    icon: Icon, 
    description, 
    config, 
    setConfig, 
    fields 
  }: {
    title: string;
    icon: any;
    description: string;
    config: any;
    setConfig: (config: any) => void;
    fields: { key: string; label: string; type: string; placeholder: string }[];
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {config.enabled && (
        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وضع التشغيل
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`${title.toLowerCase()}-mode`}
                  value={config.mode === 'sandbox' || config.mode === 'test' ? config.mode : 'test'}
                  checked={config.mode === 'sandbox' || config.mode === 'test'}
                  onChange={(e) => {
                    const newMode = title === 'PayPal' ? 'sandbox' : 'test';
                    setConfig({ ...config, mode: newMode });
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  {title === 'PayPal' ? 'Sandbox (تجريبي)' : 'Test (تجريبي)'}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`${title.toLowerCase()}-mode`}
                  value={title === 'PayPal' ? 'live' : 'live'}
                  checked={config.mode === 'live'}
                  onChange={() => setConfig({ ...config, mode: 'live' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Live (إنتاجي)</span>
              </label>
            </div>
            {config.mode === 'live' && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  تحذير: وضع الإنتاج سيستخدم بطاقات حقيقية. تأكد من حفظ المفاتيح بشكل آمن.
                </p>
              </div>
            )}
          </div>

          {/* Fields */}
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.type === 'password' && config.showSecret ? 'text' : field.type}
                  value={config[field.key] || ''}
                  onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, showSecret: !config.showSecret })}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {config.showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Security Info */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">أمان المفاتيح:</p>
              <p>يتم تشفير المفاتيح وتخزينها بشكل آمن. لا تقم بمشاركة مفاتيحك مع أي شخص.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">بوابات الدفع</h2>
          <p className="text-gray-600 mt-2">إدارة وتكوين بوابات الدفع المتاحة</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          loading={saving}
          icon={<Save className="w-5 h-5" />}
        >
          حفظ الإعدادات
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">معلومات مهمة</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>يمكنك تفعيل بوابة دفع واحدة أو أكثر في نفس الوقت</li>
              <li>استخدم وضع Sandbox/Test للتجربة قبل الانتقال للإنتاج</li>
              <li>تأكد من صحة المفاتيح قبل حفظ الإعدادات</li>
              <li>المفاتيح الحساسة مشفرة ومحمية</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* PayPal */}
        <GatewayCard
          title="PayPal"
          icon={CreditCard}
          description="بوابة دفع PayPal العالمية - تدعم البطاقات والمدفوعات عبر PayPal"
          config={paypal}
          setConfig={setPaypal}
          fields={[
            {
              key: 'clientId',
              label: 'Client ID',
              type: 'text',
              placeholder: 'أدخل Client ID من PayPal'
            },
            {
              key: 'secretKey',
              label: 'Secret Key',
              type: 'password',
              placeholder: 'أدخل Secret Key من PayPal'
            }
          ]}
        />

        {/* Stripe */}
        <GatewayCard
          title="Stripe"
          icon={CreditCard}
          description="بوابة دفع Stripe - تدعم البطاقات والمدفوعات الرقمية"
          config={stripe}
          setConfig={setStripe}
          fields={[
            {
              key: 'publishableKey',
              label: 'Publishable Key',
              type: 'text',
              placeholder: 'أدخل Publishable Key من Stripe'
            },
            {
              key: 'secretKey',
              label: 'Secret Key',
              type: 'password',
              placeholder: 'أدخل Secret Key من Stripe'
            }
          ]}
        />

        {/* Moyasar */}
        <GatewayCard
          title="Moyasar"
          icon={CreditCard}
          description="بوابة دفع Moyasar السعودية - تدعم البطاقات والمحافظ الرقمية المحلية"
          config={moyasar}
          setConfig={setMoyasar}
          fields={[
            {
              key: 'publishableKey',
              label: 'Publishable Key',
              type: 'text',
              placeholder: 'أدخل Publishable Key من Moyasar'
            },
            {
              key: 'secretKey',
              label: 'Secret Key',
              type: 'password',
              placeholder: 'أدخل Secret Key من Moyasar'
            }
          ]}
        />
      </div>
    </div>
  );
};

