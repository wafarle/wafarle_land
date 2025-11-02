'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Bug,
  Zap
} from 'lucide-react';
import { SystemVersion } from '@/lib/firebase';
import {
  getVersions,
  addVersion,
  updateVersion,
  deleteVersion,
  subscribeToVersions
} from '@/lib/license-management';

export default function VersionsTab() {
  const [versions, setVersions] = useState<SystemVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVersion, setEditingVersion] = useState<SystemVersion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToVersions((updatedVersions) => {
      setVersions(updatedVersions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingVersion(null);
    setShowForm(true);
  };

  const handleEdit = (version: SystemVersion) => {
    setEditingVersion(version);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإصدار؟')) {
      try {
        await deleteVersion(id);
      } catch (error) {
        console.error('Error deleting version:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const filteredVersions = versions.filter((version) => 
    version.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const latestVersion = versions.find(v => v.isLatest);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">إدارة الإصدارات</h2>
            <p className="text-white/80">إصدار النظام الحالي: {latestVersion?.version || 'N/A'}</p>
          </div>
          <Package className="w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* Search and Add */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في الإصدارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
            />
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            إضافة إصدار جديد
          </button>
        </div>
      </div>

      {/* Versions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-white/60 mt-4">جاري التحميل...</p>
          </div>
        ) : filteredVersions.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10">
            <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">لا توجد إصدارات</p>
          </div>
        ) : (
          filteredVersions.map((version) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border transition-all ${
                version.isLatest ? 'border-blue-400/50 shadow-lg shadow-blue-500/20' : 'border-white/10 hover:border-blue-400/30'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Version Info */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Title and Badges */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        {version.version}
                      </h3>
                      {version.isLatest && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          أحدث إصدار
                        </span>
                      )}
                      {version.isStable && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          مستقر
                        </span>
                      )}
                      {version.isBeta && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                          Beta
                        </span>
                      )}
                      {version.breaking && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          تغييرات جذرية
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg text-white/90 font-semibold">{version.title}</h4>
                    <p className="text-white/60 text-sm mt-2">{version.description}</p>
                  </div>

                  {/* Features */}
                  {version.features && version.features.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="font-semibold text-sm">ميزات جديدة</span>
                      </div>
                      <ul className="space-y-1">
                        {version.features.map((feature, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bug Fixes */}
                  {version.bugFixes && version.bugFixes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <Bug className="w-4 h-4" />
                        <span className="font-semibold text-sm">إصلاحات</span>
                      </div>
                      <ul className="space-y-1">
                        {version.bugFixes.map((fix, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-4 text-sm">
                    {version.downloadUrl && (
                      <a
                        href={version.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </a>
                    )}
                    {version.documentationUrl && (
                      <a
                        href={version.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        الوثائق
                      </a>
                    )}
                  </div>
                </div>

                {/* Details and Actions */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Release Date */}
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(version.releaseDate).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>

                  {/* Min Required Version */}
                  {version.minRequiredVersion && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>يتطلب الإصدار {version.minRequiredVersion} أو أحدث</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-4">
                    <button
                      onClick={() => handleEdit(version)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(version.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <VersionForm
            version={editingVersion}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Version Form Component
function VersionForm({ 
  version, 
  onClose 
}: { 
  version: SystemVersion | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    version: version?.version || '',
    title: version?.title || '',
    titleEn: version?.titleEn || '',
    description: version?.description || '',
    descriptionEn: version?.descriptionEn || '',
    releaseDate: version?.releaseDate ? new Date(version.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isLatest: version?.isLatest ?? false,
    isStable: version?.isStable ?? true,
    isBeta: version?.isBeta ?? false,
    breaking: version?.breaking ?? false,
    minRequiredVersion: version?.minRequiredVersion || '',
    downloadUrl: version?.downloadUrl || '',
    documentationUrl: version?.documentationUrl || '',
    features: version?.features?.join('\n') || '',
    bugFixes: version?.bugFixes?.join('\n') || '',
    requirements: version?.requirements?.join('\n') || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const versionData: any = {
        version: formData.version,
        title: formData.title,
        description: formData.description,
        releaseDate: new Date(formData.releaseDate),
        isLatest: formData.isLatest,
        isStable: formData.isStable,
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
        bugFixes: formData.bugFixes.split('\n').map(f => f.trim()).filter(Boolean),
      };

      if (formData.titleEn) versionData.titleEn = formData.titleEn;
      if (formData.descriptionEn) versionData.descriptionEn = formData.descriptionEn;
      if (formData.isBeta) versionData.isBeta = formData.isBeta;
      if (formData.breaking) versionData.breaking = formData.breaking;
      if (formData.minRequiredVersion) versionData.minRequiredVersion = formData.minRequiredVersion;
      if (formData.downloadUrl) versionData.downloadUrl = formData.downloadUrl;
      if (formData.documentationUrl) versionData.documentationUrl = formData.documentationUrl;
      if (formData.requirements) versionData.requirements = formData.requirements.split('\n').map(r => r.trim()).filter(Boolean);

      if (version) {
        await updateVersion(version.id, versionData);
      } else {
        await addVersion(versionData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving version:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 w-full max-w-4xl my-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {version ? 'تعديل الإصدار' : 'إضافة إصدار جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Version Number */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  رقم الإصدار *
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                  placeholder="1.0.0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Release Date */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  تاريخ الإصدار
                </label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="تحديث كبير مع ميزات جديدة"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Title EN */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  العنوان (EN)
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Major Update with New Features"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الوصف *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="وصف مختصر للإصدار..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
                />
              </div>

              {/* Description EN */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الوصف (EN)
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  placeholder="Brief description..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
                />
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الميزات الجديدة (سطر لكل ميزة)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={5}
                  placeholder="واجهة جديدة أسرع وأكثر سلاسة&#10;دعم التعدد اللغات&#10;نظام إشعارات محسّن"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none font-mono text-sm"
                />
              </div>

              {/* Bug Fixes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الإصلاحات (سطر لكل إصلاح)
                </label>
                <textarea
                  value={formData.bugFixes}
                  onChange={(e) => setFormData({ ...formData, bugFixes: e.target.value })}
                  rows={5}
                  placeholder="إصلاح مشكلة في تحميل الصور&#10;تحسين أداء قاعدة البيانات&#10;إصلاح خطأ في صفحة المنتجات"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none font-mono text-sm"
                />
              </div>

              {/* Min Required Version */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الحد الأدنى من الإصدار المطلوب
                </label>
                <input
                  type="text"
                  value={formData.minRequiredVersion}
                  onChange={(e) => setFormData({ ...formData, minRequiredVersion: e.target.value })}
                  placeholder="0.9.0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Download URL */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  رابط التحميل
                </label>
                <input
                  type="url"
                  value={formData.downloadUrl}
                  onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Documentation URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  رابط الوثائق
                </label>
                <input
                  type="url"
                  value={formData.documentationUrl}
                  onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Requirements */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  المتطلبات (سطر لكل متطلب)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  placeholder="Node.js 18 أو أحدث&#10;Firebase 10.x"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none font-mono text-sm"
                />
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLatest}
                    onChange={(e) => setFormData({ ...formData, isLatest: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-400/30"
                  />
                  <span className="text-white/90">هذا هو أحدث إصدار</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isStable}
                    onChange={(e) => setFormData({ ...formData, isStable: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-400/30"
                  />
                  <span className="text-white/90">إصدار مستقر</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBeta}
                    onChange={(e) => setFormData({ ...formData, isBeta: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-400/30"
                  />
                  <span className="text-white/90">إصدار تجريبي (Beta)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.breaking}
                    onChange={(e) => setFormData({ ...formData, breaking: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-400/30"
                  />
                  <span className="text-white/90">يحتوي على تغييرات جذرية</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : version ? 'حفظ التعديلات' : 'إضافة الإصدار'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

