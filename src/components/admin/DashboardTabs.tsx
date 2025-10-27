'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Package, 
  MessageSquare, 
  Settings,
  BarChart3,
  Target,
  Activity,
  Calendar,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Home,
  Sparkles,
  Crown,
  Award,
  Globe,
  Database,
  Layers,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Eye,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Monitor,
  Smartphone,
  Link,
  FileText,
  BookOpen,
  Tags,
  Save,
  Image
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  getBlogPosts, 
  getBlogCategories, 
  addBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  generateSlug, 
  calculateReadingTime 
} from '../../lib/database';

// Overview Tab Component
export const OverviewTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">نظرة عامة</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          الإحصائيات الأخيرة
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/70">المبيعات اليوم</span>
            <span className="text-white font-semibold">$2,450</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">الطلبات الجديدة</span>
            <span className="text-white font-semibold">23</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">العملاء النشطين</span>
            <span className="text-white font-semibold">1,234</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          النشاط الأخير
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-white/70 text-sm">طلب جديد من أحمد محمد</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white/70 text-sm">دفعة مستلمة بقيمة $99</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-white/70 text-sm">تحديث منتج Netflix</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Analytics Tab Component
export const AnalyticsTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">التحليلات</h2>
    <p className="text-white/60 text-lg">لوحة التحليلات قريباً...</p>
  </div>
);

// Customers Tab Component
export const CustomersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">العملاء</h2>
    <p className="text-white/60 text-lg">إدارة العملاء قريباً...</p>
  </div>
);

// Orders Tab Component
export const OrdersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">الطلبات</h2>
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">الطلبات الأخيرة</h3>
        <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
          عرض الكل
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <div>
              <p className="text-white font-medium">أحمد محمد</p>
              <p className="text-white/60 text-sm">Netflix Premium</p>
            </div>
          </div>
          <div className="text-right">
            <CurrencyDisplay price={12.99} originalCurrency="USD" className="text-white font-semibold" />
            <p className="text-white/60 text-sm">منذ 5 دقائق</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <div>
              <p className="text-white font-medium">سارة أحمد</p>
              <p className="text-white/60 text-sm">Spotify Premium</p>
            </div>
          </div>
          <div className="text-right">
            <CurrencyDisplay price={9.99} originalCurrency="USD" className="text-white font-semibold" />
            <p className="text-white/60 text-sm">منذ 15 دقيقة</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Messages Tab Component
export const MessagesTab = ({ notifications }: { notifications: any[] }) => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">الرسائل</h2>
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className={`w-3 h-3 rounded-full mt-2 ${
              notification.type === 'success' ? 'bg-emerald-400' :
              notification.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
            }`}></div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">{notification.title}</h3>
              <p className="text-white/70 mb-2">{notification.message}</p>
              <p className="text-white/50 text-sm">{notification.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings Tab Component
export const SettingsTab = () => {
  const { settings, updateSettings, loading, error } = useSettings();
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [websiteSettings, setWebsiteSettings] = useState(settings.website);
  const [securitySettings, setSecuritySettings] = useState(settings.security);
  const [notificationSettings, setNotificationSettings] = useState(settings.notifications);
  const [systemSettings, setSystemSettings] = useState(settings.system);
  const [analyticsSettings, setAnalyticsSettings] = useState(settings.analytics);
  const [saving, setSaving] = useState(false);

  // Update local state when global settings change
  useEffect(() => {
    setWebsiteSettings(settings.website);
    setSecuritySettings(settings.security);
    setNotificationSettings(settings.notifications);
    setSystemSettings(settings.system);
    setAnalyticsSettings(settings.analytics);
  }, [settings]);

  const settingsTabs = [
    { id: 'general', name: 'عام', icon: Settings },
    { id: 'social', name: 'السوشال ميديا', icon: Globe },
    { id: 'analytics', name: 'التحليلات', icon: BarChart },
    { id: 'security', name: 'الأمان', icon: Shield },
    { id: 'notifications', name: 'الإشعارات', icon: Bell },
    { id: 'system', name: 'النظام', icon: Database },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: RefreshCw }
  ];

  const handleWebsiteSettingChange = (field: string, value: any) => {
    setWebsiteSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecuritySettingChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationSettingChange = (field: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemSettingChange = (field: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setWebsiteSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleAnalyticsSettingChange = (tool: string, field: string, value: any) => {
    setAnalyticsSettings(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      
      const newSettings = {
        website: websiteSettings,
        security: securitySettings,
        notifications: notificationSettings,
        system: systemSettings,
        analytics: analyticsSettings,
        updatedAt: new Date(),
        updatedBy: 'admin'
      };
      
      await updateSettings(newSettings);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      successDiv.innerHTML = '✅ تم حفظ الإعدادات بنجاح!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.remove();
      }, 3000);
      
      console.log('✅ Settings saved successfully:', newSettings);
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      errorDiv.innerHTML = '❌ فشل في حفظ الإعدادات!';
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">الإعدادات</h2>
          {error && (
            <p className="text-red-400 text-sm mt-2">❌ {error}</p>
          )}
          {loading && (
            <p className="text-blue-400 text-sm mt-2 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              جارِ تحميل الإعدادات...
            </p>
          )}
        </div>
        <button
          onClick={saveSettings}
          disabled={saving || loading}
          className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2 ${
            saving || loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جارِ الحفظ...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              حفظ جميع الإعدادات
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="space-y-2">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeSettingsTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeSettingsTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  إعدادات الموقع العامة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">اسم الموقع</label>
                    <input
                      type="text"
                      value={websiteSettings.siteName}
                      onChange={(e) => handleWebsiteSettingChange('siteName', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={websiteSettings.contactEmail}
                      onChange={(e) => handleWebsiteSettingChange('contactEmail', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={websiteSettings.contactPhone}
                      onChange={(e) => handleWebsiteSettingChange('contactPhone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">المنطقة الزمنية</label>
                    <select
                      value={websiteSettings.timezone}
                      onChange={(e) => handleWebsiteSettingChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Riyadh">الرياض (UTC+3)</option>
                      <option value="Asia/Dubai">دبي (UTC+4)</option>
                      <option value="Africa/Cairo">القاهرة (UTC+2)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-white/70 text-sm font-medium mb-2">وصف الموقع</label>
                  <textarea
                    value={websiteSettings.siteDescription}
                    onChange={(e) => handleWebsiteSettingChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">وضع الصيانة</h4>
                    <p className="text-white/60 text-sm">تفعيل وضع الصيانة للموقع</p>
                  </div>
                  <button
                    onClick={() => handleWebsiteSettingChange('maintenanceMode', !websiteSettings.maintenanceMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      websiteSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      websiteSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

                  {/* Social Media Settings */}
                  {activeSettingsTab === 'social' && (
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-400" />
                          روابط السوشال ميديا
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-500" />
                                فيسبوك
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.facebook}
                                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                placeholder="https://facebook.com/yourpage"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Twitter className="w-4 h-4 text-sky-500" />
                                تويتر / X
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.twitter}
                                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                placeholder="https://twitter.com/youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-pink-500" />
                                انستجرام
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.instagram}
                                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                placeholder="https://instagram.com/youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Youtube className="w-4 h-4 text-red-500" />
                                يوتيوب
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.youtube}
                                onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                                placeholder="https://youtube.com/yourchannel"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Linkedin className="w-4 h-4 text-blue-600" />
                                لينكدإن
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.linkedin}
                                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                placeholder="https://linkedin.com/company/yourcompany"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-green-500" />
                                تيليجرام
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.telegram}
                                onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                                placeholder="https://t.me/yourchannel"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-yellow-500" />
                                تيك توك
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.tiktok}
                                onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                                placeholder="https://tiktok.com/@youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                                <Link className="w-4 h-4 text-purple-500" />
                                سناب شات
                              </label>
                              <input
                                type="url"
                                value={websiteSettings.socialLinks.snapchat}
                                onChange={(e) => handleSocialLinkChange('snapchat', e.target.value)}
                                placeholder="https://snapchat.com/add/youraccount"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-blue-400 text-sm">
                              💡 <strong>نصيحة:</strong> اتركي الحقل فارغًا إذا كنت لا تريدين عرض رابط معين. الروابط ستظهر في الفوتر والصفحات ذات الصلة.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics Settings */}
                  {activeSettingsTab === 'analytics' && (
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                          <BarChart className="w-5 h-5 text-purple-400" />
                          أدوات التحليلات والتتبع
                        </h3>
                        
                        <div className="space-y-8">
                          {/* Google Analytics */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <BarChart3 className="w-5 h-5 text-blue-400" />
                                  Google Analytics
                                </h4>
                                <p className="text-white/60 text-sm">تحليل الزوار وسلوكهم على الموقع</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('googleAnalytics', 'enabled', !analyticsSettings.googleAnalytics.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.googleAnalytics.enabled ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.googleAnalytics.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.googleAnalytics.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Measurement ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.googleAnalytics.measurementId}
                                  onChange={(e) => handleAnalyticsSettingChange('googleAnalytics', 'measurementId', e.target.value)}
                                  placeholder="G-XXXXXXXXXX"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">مثال: G-ABCD123456</p>
                              </div>
                            )}
                          </div>

                          {/* Microsoft Clarity */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Monitor className="w-5 h-5 text-orange-400" />
                                  Microsoft Clarity
                                </h4>
                                <p className="text-white/60 text-sm">تسجيل جلسات المستخدمين وخرائط الحرارة</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('microsoftClarity', 'enabled', !analyticsSettings.microsoftClarity.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.microsoftClarity.enabled ? 'bg-orange-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.microsoftClarity.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.microsoftClarity.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Project ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.microsoftClarity.projectId}
                                  onChange={(e) => handleAnalyticsSettingChange('microsoftClarity', 'projectId', e.target.value)}
                                  placeholder="abcdefghij"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">10 أحرف صغيرة</p>
                              </div>
                            )}
                          </div>

                          {/* Facebook Pixel */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Facebook className="w-5 h-5 text-blue-600" />
                                  Facebook Pixel
                                </h4>
                                <p className="text-white/60 text-sm">تتبع التحويلات والأحداث على فيسبوك</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('facebookPixel', 'enabled', !analyticsSettings.facebookPixel.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.facebookPixel.enabled ? 'bg-blue-600' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.facebookPixel.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.facebookPixel.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Pixel ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.facebookPixel.pixelId}
                                  onChange={(e) => handleAnalyticsSettingChange('facebookPixel', 'pixelId', e.target.value)}
                                  placeholder="123456789012345"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">15 رقم</p>
                              </div>
                            )}
                          </div>

                          {/* Google Tag Manager */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Target className="w-5 h-5 text-green-400" />
                                  Google Tag Manager
                                </h4>
                                <p className="text-white/60 text-sm">إدارة جميع العلامات والأكواد</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('googleTagManager', 'enabled', !analyticsSettings.googleTagManager.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.googleTagManager.enabled ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.googleTagManager.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.googleTagManager.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Container ID</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.googleTagManager.containerId}
                                  onChange={(e) => handleAnalyticsSettingChange('googleTagManager', 'containerId', e.target.value)}
                                  placeholder="GTM-XXXXXXX"
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">مثال: GTM-1234567</p>
                              </div>
                            )}
                          </div>

                          {/* Google Search Console */}
                          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                  <Search className="w-5 h-5 text-red-400" />
                                  Google Search Console
                                </h4>
                                <p className="text-white/60 text-sm">تحقق من ملكية الموقع لجوجل</p>
                              </div>
                              <button
                                onClick={() => handleAnalyticsSettingChange('googleSearchConsole', 'enabled', !analyticsSettings.googleSearchConsole.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  analyticsSettings.googleSearchConsole.enabled ? 'bg-red-500' : 'bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  analyticsSettings.googleSearchConsole.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            {analyticsSettings.googleSearchConsole.enabled && (
                              <div>
                                <label className="block text-white/70 text-sm font-medium mb-2">Verification Code</label>
                                <input
                                  type="text"
                                  value={analyticsSettings.googleSearchConsole.verificationCode}
                                  onChange={(e) => handleAnalyticsSettingChange('googleSearchConsole', 'verificationCode', e.target.value)}
                                  placeholder="abcd1234efgh5678..."
                                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-white/50 text-xs mt-1">الكود بدون علامات HTML</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <p className="text-purple-400 text-sm">
                              📊 <strong>معلومة:</strong> تأكد من الحصول على الأكواد الصحيحة من كل منصة. الأكواد ستعمل تلقائياً بعد التفعيل والحفظ.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeSettingsTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  إعدادات الأمان
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">المصادقة الثنائية</h4>
                      <p className="text-white/60 text-sm">تفعيل المصادقة الثنائية للحسابات الإدارية</p>
                    </div>
                    <button
                      onClick={() => handleSecuritySettingChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">محاولات تسجيل الدخول المسموحة</label>
                      <input
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => handleSecuritySettingChange('loginAttempts', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">انتهاء الجلسة (بالدقائق)</label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">سجل العمليات</h4>
                      <p className="text-white/60 text-sm">تسجيل جميع العمليات الإدارية</p>
                    </div>
                    <button
                      onClick={() => handleSecuritySettingChange('auditLog', !securitySettings.auditLog)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securitySettings.auditLog ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.auditLog ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSettingsTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  إعدادات الإشعارات
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">الإشعارات عبر البريد الإلكتروني</h4>
                      <p className="text-white/60 text-sm">استقبال الإشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('emailNotifications', !notificationSettings.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.emailNotifications ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">إشعارات الطلبات الجديدة</h4>
                      <p className="text-white/60 text-sm">إشعار فوري عند وصول طلب جديد</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('newOrderNotifications', !notificationSettings.newOrderNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.newOrderNotifications ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.newOrderNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">إشعارات الدفع</h4>
                      <p className="text-white/60 text-sm">إشعار عند استلام دفعة جديدة</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('paymentNotifications', !notificationSettings.paymentNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.paymentNotifications ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.paymentNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">التقارير الأسبوعية</h4>
                      <p className="text-white/60 text-sm">تقرير أسبوعي بالإحصائيات</p>
                    </div>
                    <button
                      onClick={() => handleNotificationSettingChange('weeklyReports', !notificationSettings.weeklyReports)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.weeklyReports ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeSettingsTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  إعدادات النظام
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">التخزين المؤقت</h4>
                      <p className="text-white/60 text-sm">تفعيل التخزين المؤقت لتحسين الأداء</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingChange('cacheEnabled', !systemSettings.cacheEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.cacheEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemSettings.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm font-medium mb-2">فترة الاحتفاظ بالسجلات (بالأيام)</label>
                      <input
                        type="number"
                        value={systemSettings.logRetention}
                        onChange={(e) => handleSystemSettingChange('logRetention', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>     
                      <label className="block text-white/70 text-sm font-medium mb-2">حد معدل API (طلب/ساعة)</label>
                      <input
                        type="number"
                        value={systemSettings.apiRateLimit}
                        onChange={(e) => handleSystemSettingChange('apiRateLimit', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">وضع التطوير</h4>
                      <p className="text-white/60 text-sm">تفعيل أدوات التطوير والتصحيح</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingChange('debugMode', !systemSettings.debugMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.debugMode ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeSettingsTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-400" />
                  النسخ الاحتياطي والصيانة
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">النسخ الاحتياطي التلقائي</h4>
                      <p className="text-white/60 text-sm">إنشاء نسخة احتياطية تلقائياً</p>
                    </div>
                    <button
                      onClick={() => handleSystemSettingChange('autoBackup', !systemSettings.autoBackup)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.autoBackup ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        systemSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">تكرار النسخ الاحتياطي</label>
                    <select
                      value={systemSettings.backupFrequency}
                      onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hourly">كل ساعة</option>
                      <option value="daily">يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      إنشاء نسخة احتياطية الآن
                    </button>
                    
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      تنظيف ذاكرة التخزين المؤقت
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  </div>
);
};

// Reports Tab Component
export const ReportsTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">التقارير</h2>
    <p className="text-white/60 text-lg">التقارير قريباً...</p>
  </div>
);

// Users Tab Component
export const UsersTab = () => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-6">المستخدمين</h2>
    <p className="text-white/60 text-lg">إدارة المستخدمين قريباً...</p>
  </div>
);
