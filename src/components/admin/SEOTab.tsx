'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  Eye, 
  Settings, 
  Image, 
  Link, 
  Tag, 
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Monitor,
  Smartphone,
  Zap,
  Target,
  BarChart3,
  Save,
  RefreshCw
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import RobotsGenerator from '../RobotsGenerator';
import SitemapGenerator from '../SitemapGenerator';

export const SEOTab = () => {
  const { settings, updateSettings, loading, error } = useSettings();
  const [seoSettings, setSeoSettings] = useState(settings.website.seo);
  const [saving, setSaving] = useState(false);
  const [activeSeoTab, setActiveSeoTab] = useState('meta');

  // Update local state when global settings change
  useEffect(() => {
    setSeoSettings(settings.website.seo);
  }, [settings]);

  const seoTabs = [
    { id: 'meta', name: 'Meta Tags', icon: Tag },
    { id: 'social', name: 'Social Media', icon: Globe },
    { id: 'structured', name: 'Structured Data', icon: FileText },
    { id: 'robots', name: 'Robots & Sitemap', icon: Settings }
  ];

  const handleSeoSettingChange = (field: string, value: any) => {
    setSeoSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleStructuredDataChange = (section: string, field: string, value: any) => {
    setSeoSettings(prev => ({
      ...prev,
      structuredData: {
        ...prev.structuredData,
        [section]: {
          ...prev.structuredData[section as keyof typeof prev.structuredData],
          [field]: value
        }
      }
    }));
  };

  const handleContactPointChange = (field: string, value: any) => {
    setSeoSettings(prev => ({
      ...prev,
      structuredData: {
        ...prev.structuredData,
        organization: {
          ...prev.structuredData.organization,
          contactPoint: {
            ...prev.structuredData.organization.contactPoint,
            [field]: value
          }
        }
      }
    }));
  };

  const handlePotentialActionChange = (field: string, value: any) => {
    setSeoSettings(prev => ({
      ...prev,
      structuredData: {
        ...prev.structuredData,
        website: {
          ...prev.structuredData.website,
          potentialAction: {
            ...prev.structuredData.website.potentialAction,
            [field]: value
          }
        }
      }
    }));
  };

  const saveSeoSettings = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      
      const newSettings = {
        ...settings,
        website: {
          ...settings.website,
          seo: seoSettings
        },
        updatedAt: new Date(),
        updatedBy: 'admin'
      };
      
      await updateSettings(newSettings);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      successDiv.innerHTML = '✅ تم حفظ إعدادات SEO بنجاح!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.remove();
      }, 3000);
    } catch (err) {
      console.error('❌ Error saving SEO settings:', err);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      errorDiv.innerHTML = '❌ فشل في حفظ إعدادات SEO!';
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
          <h2 className="text-3xl font-bold text-white">إعدادات SEO</h2>
          <p className="text-white/60 text-sm mt-2">تحسين ظهور الموقع في محركات البحث</p>
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
          onClick={saveSeoSettings}
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
              حفظ إعدادات SEO
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SEO Navigation */}
        <div className="space-y-2">
          {seoTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSeoTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeSeoTab === tab.id
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

        {/* SEO Content */}
        <div className="lg:col-span-3">
          {/* Meta Tags */}
          {activeSeoTab === 'meta' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-400" />
                  Meta Tags الأساسية
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">عنوان الصفحة (Meta Title)</label>
                    <input
                      type="text"
                      value={seoSettings.metaTitle}
                      onChange={(e) => handleSeoSettingChange('metaTitle', e.target.value)}
                      placeholder="عنوان الصفحة الرئيسية"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-white/50 text-xs mt-1">الطول المثالي: 50-60 حرف</p>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">وصف الصفحة (Meta Description)</label>
                    <textarea
                      value={seoSettings.metaDescription}
                      onChange={(e) => handleSeoSettingChange('metaDescription', e.target.value)}
                      rows={3}
                      placeholder="وصف مختصر عن الموقع"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-white/50 text-xs mt-1">الطول المثالي: 150-160 حرف</p>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">الكلمات المفتاحية (Keywords)</label>
                    <input
                      type="text"
                      value={seoSettings.metaKeywords}
                      onChange={(e) => handleSeoSettingChange('metaKeywords', e.target.value)}
                      placeholder="كلمة مفتاحية 1، كلمة مفتاحية 2، كلمة مفتاحية 3"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-white/50 text-xs mt-1">افصل الكلمات بفواصل</p>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">الرابط الأساسي (Canonical URL)</label>
                    <input
                      type="url"
                      value={seoSettings.canonicalUrl}
                      onChange={(e) => handleSeoSettingChange('canonicalUrl', e.target.value)}
                      placeholder="https://wafarle.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media */}
          {activeSeoTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  إعدادات السوشال ميديا
                </h3>
                
                <div className="space-y-6">
                  {/* Open Graph */}
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Facebook className="w-5 h-5 text-blue-500" />
                      Open Graph (Facebook)
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">عنوان المشاركة</label>
                        <input
                          type="text"
                          value={seoSettings.ogTitle}
                          onChange={(e) => handleSeoSettingChange('ogTitle', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">وصف المشاركة</label>
                        <textarea
                          value={seoSettings.ogDescription}
                          onChange={(e) => handleSeoSettingChange('ogDescription', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">صورة المشاركة</label>
                        <input
                          type="url"
                          value={seoSettings.ogImage}
                          onChange={(e) => handleSeoSettingChange('ogImage', e.target.value)}
                          placeholder="https://wafarle.com/images/og-image.jpg"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-white/50 text-xs mt-1">الأبعاد المثالية: 1200x630 بكسل</p>
                      </div>
                    </div>
                  </div>

                  {/* Twitter */}
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Twitter className="w-5 h-5 text-sky-500" />
                      Twitter Cards
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">نوع البطاقة</label>
                        <select
                          value={seoSettings.twitterCard}
                          onChange={(e) => handleSeoSettingChange('twitterCard', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="summary">ملخص</option>
                          <option value="summary_large_image">ملخص مع صورة كبيرة</option>
                          <option value="app">تطبيق</option>
                          <option value="player">مشغل</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">حساب الموقع</label>
                        <input
                          type="text"
                          value={seoSettings.twitterSite}
                          onChange={(e) => handleSeoSettingChange('twitterSite', e.target.value)}
                          placeholder="@wafarle"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">حساب المنشئ</label>
                        <input
                          type="text"
                          value={seoSettings.twitterCreator}
                          onChange={(e) => handleSeoSettingChange('twitterCreator', e.target.value)}
                          placeholder="@wafarle"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Structured Data */}
          {activeSeoTab === 'structured' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  البيانات المنظمة (Structured Data)
                </h3>
                
                <div className="space-y-6">
                  {/* Organization */}
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      بيانات المؤسسة
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">اسم المؤسسة</label>
                          <input
                            type="text"
                            value={seoSettings.structuredData.organization.name}
                            onChange={(e) => handleStructuredDataChange('organization', 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">رابط المؤسسة</label>
                          <input
                            type="url"
                            value={seoSettings.structuredData.organization.url}
                            onChange={(e) => handleStructuredDataChange('organization', 'url', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">شعار المؤسسة</label>
                        <input
                          type="url"
                          value={seoSettings.structuredData.organization.logo}
                          onChange={(e) => handleStructuredDataChange('organization', 'logo', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">وصف المؤسسة</label>
                        <textarea
                          value={seoSettings.structuredData.organization.description}
                          onChange={(e) => handleStructuredDataChange('organization', 'description', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">رقم الهاتف</label>
                          <input
                            type="tel"
                            value={seoSettings.structuredData.organization.contactPoint.telephone}
                            onChange={(e) => handleContactPointChange('telephone', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">نوع الاتصال</label>
                          <input
                            type="text"
                            value={seoSettings.structuredData.organization.contactPoint.contactType}
                            onChange={(e) => handleContactPointChange('contactType', e.target.value)}
                            placeholder="customer service"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">البريد الإلكتروني</label>
                          <input
                            type="email"
                            value={seoSettings.structuredData.organization.contactPoint.email}
                            onChange={(e) => handleContactPointChange('email', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-400" />
                      بيانات الموقع
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">اسم الموقع</label>
                          <input
                            type="text"
                            value={seoSettings.structuredData.website.name}
                            onChange={(e) => handleStructuredDataChange('website', 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">رابط الموقع</label>
                          <input
                            type="url"
                            value={seoSettings.structuredData.website.url}
                            onChange={(e) => handleStructuredDataChange('website', 'url', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">وصف الموقع</label>
                        <textarea
                          value={seoSettings.structuredData.website.description}
                          onChange={(e) => handleStructuredDataChange('website', 'description', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">رابط البحث</label>
                          <input
                            type="url"
                            value={seoSettings.structuredData.website.potentialAction.target}
                            onChange={(e) => handlePotentialActionChange('target', e.target.value)}
                            placeholder="https://wafarle.com/search?q={search_term_string}"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-white/70 text-sm font-medium mb-2">معامل البحث</label>
                          <input
                            type="text"
                            value={seoSettings.structuredData.website.potentialAction.queryInput}
                            onChange={(e) => handlePotentialActionChange('queryInput', e.target.value)}
                            placeholder="required name=search_term_string"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Robots & Sitemap */}
          {activeSeoTab === 'robots' && (
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-400" />
                  إعدادات الروبوتات والخريطة
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-400" />
                      إعدادات الفهرسة
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-medium">السماح بالفهرسة</h5>
                          <p className="text-white/60 text-sm">السماح لمحركات البحث بفهرسة الموقع</p>
                        </div>
                        <button
                          onClick={() => handleSeoSettingChange('robotsIndex', !seoSettings.robotsIndex)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            seoSettings.robotsIndex ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            seoSettings.robotsIndex ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-medium">السماح بالمتابعة</h5>
                          <p className="text-white/60 text-sm">السماح لمحركات البحث بمتابعة الروابط</p>
                        </div>
                        <button
                          onClick={() => handleSeoSettingChange('robotsFollow', !seoSettings.robotsFollow)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            seoSettings.robotsFollow ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            seoSettings.robotsFollow ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      أدوات SEO الإضافية
                    </h4>
                    
                    <div className="space-y-6">
                      <RobotsGenerator />
                      <SitemapGenerator />
                    </div>
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
