'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, Bell, CheckCircle, AlertCircle, Info, Send } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import Button from './Button';

export const EmailNotificationsTab = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    newOrder: true,
    orderConfirmed: true,
    orderShipped: true,
    orderDelivered: true,
    orderCancelled: true,
    paymentReceived: true,
    refundProcessed: true,
    returnRequested: true,
    returnApproved: true
  });

  useEffect(() => {
    if (settings?.website?.emailNotifications) {
      setEmailSettings(settings.website.emailNotifications);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedSettings = {
        ...settings,
        website: {
          ...settings.website,
          emailNotifications: emailSettings
        }
      };

      await updateSettings(updatedSettings);
      alert('تم حفظ إعدادات الإشعارات بنجاح!');
    } catch (error) {
      console.error('Error saving email notification settings:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const NotificationCard = ({ 
    id, 
    label, 
    description 
  }: { 
    id: keyof typeof emailSettings;
    label: string;
    description: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          </div>
          <p className="text-sm text-gray-600 mr-8">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={emailSettings[id]}
            onChange={(e) => setEmailSettings({ ...emailSettings, [id]: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">إشعارات البريد الإلكتروني</h2>
          <p className="text-gray-600 mt-2">إدارة الإشعارات التي يتم إرسالها تلقائياً للعملاء</p>
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
            <h3 className="font-semibold text-blue-900 mb-2">معلومات الإشعارات</h3>
            <p className="text-sm text-blue-800">
              يمكنك تفعيل أو تعطيل أي نوع من الإشعارات. عند تفعيل الإشعار، سيتم إرسال بريد إلكتروني تلقائياً للعميل عند حدوث الحدث.
              يمكنك تخصيص قوالب البريد من إعدادات النظام.
            </p>
          </div>
        </div>
      </div>

      {/* Order Notifications */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-500" />
          إشعارات الطلبات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <NotificationCard
            id="newOrder"
            label="طلب جديد"
            description="إرسال إشعار عند إنشاء طلب جديد"
          />
          <NotificationCard
            id="orderConfirmed"
            label="تأكيد الطلب"
            description="إرسال إشعار عند تأكيد الطلب"
          />
          <NotificationCard
            id="orderShipped"
            label="شحن الطلب"
            description="إرسال إشعار عند شحن الطلب"
          />
          <NotificationCard
            id="orderDelivered"
            label="تسليم الطلب"
            description="إرسال إشعار عند تسليم الطلب"
          />
          <NotificationCard
            id="orderCancelled"
            label="إلغاء الطلب"
            description="إرسال إشعار عند إلغاء الطلب"
          />
        </div>
      </div>

      {/* Payment Notifications */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          إشعارات المدفوعات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <NotificationCard
            id="paymentReceived"
            label="استلام الدفع"
            description="إرسال إشعار عند استلام الدفع"
          />
          <NotificationCard
            id="refundProcessed"
            label="معالجة الاسترجاع"
            description="إرسال إشعار عند معالجة الاسترجاع المالي"
          />
        </div>
      </div>

      {/* Return Notifications */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          إشعارات الإرجاع
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NotificationCard
            id="returnRequested"
            label="طلب إرجاع"
            description="إرسال إشعار عند طلب العميل إرجاع الطلب"
          />
          <NotificationCard
            id="returnApproved"
            label="الموافقة على الإرجاع"
            description="إرسال إشعار عند الموافقة على طلب الإرجاع"
          />
        </div>
      </div>
    </div>
  );
};




