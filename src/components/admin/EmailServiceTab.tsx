'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Mail, Send, Settings as SettingsIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmailServiceTab = () => {
  const { settings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const emailService = settings?.website?.emailService || {
    provider: 'resend',
    apiKey: '',
    fromEmail: 'noreply@wafarle.com',
    fromName: 'وافرلي - wafarle',
    replyTo: 'support@wafarle.com',
    enabled: false
  };

  const [formData, setFormData] = useState({
    provider: emailService.provider || 'resend',
    apiKey: emailService.apiKey || '',
    fromEmail: emailService.fromEmail || 'noreply@wafarle.com',
    fromName: emailService.fromName || 'وافرلي - wafarle',
    replyTo: emailService.replyTo || 'support@wafarle.com',
    enabled: emailService.enabled || false,
  });

  useEffect(() => {
    if (settings?.website?.emailService) {
      setFormData({
        provider: settings.website.emailService.provider || 'resend',
        apiKey: settings.website.emailService.apiKey || '',
        fromEmail: settings.website.emailService.fromEmail || 'noreply@wafarle.com',
        fromName: settings.website.emailService.fromName || 'وافرلي - wafarle',
        replyTo: settings.website.emailService.replyTo || 'support@wafarle.com',
        enabled: settings.website.emailService.enabled || false,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings({
        ...settings,
        website: {
          ...settings.website,
          emailService: {
            provider: formData.provider as 'resend' | 'sendgrid' | 'ses' | 'nodemailer' | 'none',
            apiKey: formData.apiKey.trim(),
            fromEmail: formData.fromEmail.trim(),
            fromName: formData.fromName.trim(),
            replyTo: formData.replyTo.trim(),
            enabled: formData.enabled,
          },
        },
      });
      
      alert('تم حفظ إعدادات البريد الإلكتروني بنجاح!');
    } catch (error) {
      console.error('Error saving email settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!formData.apiKey || formData.apiKey.trim() === '') {
      setTestResult({
        success: false,
        message: 'يرجى إدخال مفتاح API أولاً',
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      // Get admin email from settings
      const adminEmail = settings?.website?.contactEmail || 'admin@wafarle.com';

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: adminEmail,
          subject: 'اختبار البريد الإلكتروني من وافرلي',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; text-align: right;">
              <h2 style="color: #667eea;">🎉 تم إرسال البريد بنجاح!</h2>
              <p>مرحباً،</p>
              <p>إذا استلمت هذا البريد، فهذا يعني أن خدمة البريد الإلكتروني تعمل بشكل صحيح.</p>
              <p>شكراً لك!</p>
              <p><strong>فريق وافرلي</strong></p>
            </div>
          `,
          from: `${formData.fromName} <${formData.fromEmail}>`,
          replyTo: formData.replyTo,
          apiKey: formData.apiKey,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: result.simulated 
            ? 'تم محاكاة الإرسال بنجاح (لا توجد بيانات اعتماد صحيحة)'
            : `تم الإرسال بنجاح! معرف الرسالة: ${result.messageId || 'غير متوفر'}`,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'فشل إرسال البريد الإلكتروني',
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'حدث خطأ أثناء إرسال البريد',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة البريد الإلكتروني</h2>
          <p className="text-gray-600">قم بإعداد وإدارة خدمة البريد الإلكتروني</p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          مزود الخدمة
        </label>
        <select
          value={formData.provider}
          onChange={(e) => setFormData({ ...formData, provider: e.target.value as 'resend' | 'sendgrid' | 'ses' | 'nodemailer' | 'none' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="resend">Resend (مُوصى به)</option>
          <option value="sendgrid">SendGrid</option>
          <option value="ses">AWS SES</option>
          <option value="nodemailer">Nodemailer (SMTP)</option>
          <option value="none">لا شيء (محاكاة فقط)</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          {formData.provider === 'resend' && 'قم بإنشاء حساب على resend.com والحصول على API key'}
          {formData.provider === 'sendgrid' && 'قم بإنشاء حساب على sendgrid.com والحصول على API key'}
          {formData.provider === 'ses' && 'قم بإعداد AWS SES والحصول على Access Key'}
          {formData.provider === 'nodemailer' && 'ستحتاج إلى إعداد SMTP (Gmail, Outlook, إلخ)'}
          {formData.provider === 'none' && 'سيتم محاكاة إرسال البريد فقط (للتطوير)'}
        </p>
      </div>

      {/* API Key */}
      {formData.provider !== 'none' && (
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مفتاح API (API Key)
            <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder="re_xxxxxxxxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            احتفظ بمفتاح API في مكان آمن ولا تشاركه
          </p>
        </div>
      )}

      {/* From Email */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          البريد الإلكتروني المرسل منه
          <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.fromEmail}
          onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
          placeholder="noreply@wafarle.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          يجب أن يكون مسجل في مزود الخدمة (Resend/SendGrid)
        </p>
      </div>

      {/* From Name */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اسم المرسل
        </label>
        <input
          type="text"
          value={formData.fromName}
          onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
          placeholder="وافرلي - wafarle"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Reply To */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الرد على (Reply To)
        </label>
        <input
          type="email"
          value={formData.replyTo}
          onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
          placeholder="support@wafarle.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Enable/Disable */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تفعيل خدمة البريد الإلكتروني
            </label>
            <p className="text-xs text-gray-500">
              عندما تكون معطلة، سيتم محاكاة الإرسال فقط
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Test Email */}
      {formData.provider !== 'none' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-600" />
            اختبار البريد الإلكتروني
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            قم بإرسال بريد اختباري للتأكد من صحة الإعدادات
          </p>
          <button
            onClick={handleTestEmail}
            disabled={loading || !formData.apiKey}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                إرسال بريد اختباري
              </>
            )}
          </button>

          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                testResult.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm">{testResult.message}</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <SettingsIcon className="w-5 h-5" />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>
    </div>
  );
};




