'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  Shield,
  Package,
  TrendingUp
} from 'lucide-react';
import { License } from '@/lib/firebase';
import {
  getLicenses,
  addLicense,
  updateLicense,
  deleteLicense,
  generateLicenseKey,
  subscribeToLicenses
} from '@/lib/license-management';

export default function LicensesTab() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = subscribeToLicenses((updatedLicenses) => {
      setLicenses(updatedLicenses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditingLicense(null);
    setShowForm(true);
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الترخيص؟')) {
      try {
        await deleteLicense(id);
      } catch (error) {
        console.error('Error deleting license:', error);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch = 
      license.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.domain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || license.status === filterStatus;
    const matchesType = filterType === 'all' || license.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    expired: licenses.filter(l => l.status === 'expired').length,
    trial: licenses.filter(l => l.status === 'trial').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي التراخيص</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <Key className="w-12 h-12 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">نشطة</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">منتهية</p>
              <p className="text-3xl font-bold mt-2">{stats.expired}</p>
            </div>
            <XCircle className="w-12 h-12 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">تجريبية</p>
              <p className="text-3xl font-bold mt-2">{stats.trial}</p>
            </div>
            <Clock className="w-12 h-12 opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم، الإيميل، مفتاح الترخيص، أو النطاق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
            />
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="expired">منتهية</option>
              <option value="suspended">معلقة</option>
              <option value="trial">تجريبية</option>
            </select>
          </div>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
          >
            <option value="all">كل الأنواع</option>
            <option value="basic">أساسي</option>
            <option value="professional">احترافي</option>
            <option value="enterprise">مؤسسي</option>
          </select>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            إضافة ترخيص
          </button>
        </div>
      </div>

      {/* Licenses List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-white/60 mt-4">جاري التحميل...</p>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10">
            <Key className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">لا توجد تراخيص</p>
          </div>
        ) : (
          filteredLicenses.map((license) => (
            <motion.div
              key={license.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* License Info */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Customer Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-semibold text-lg">
                        {license.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Mail className="w-4 h-4" />
                      {license.customerEmail}
                    </div>
                    {license.customerPhone && (
                      <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                        <Phone className="w-4 h-4" />
                        {license.customerPhone}
                      </div>
                    )}
                  </div>

                  {/* License Key */}
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
                    <Key className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <code className="text-yellow-400 font-mono text-sm flex-1">
                      {license.licenseKey}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(license.licenseKey);
                        alert('تم النسخ!');
                      }}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                      title="نسخ"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  {/* Domain */}
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 text-sm">{license.domain}</span>
                    {license.domains && license.domains.length > 0 && (
                      <span className="text-white/60 text-xs">
                        (+{license.domains.length} نطاقات إضافية)
                      </span>
                    )}
                  </div>
                </div>

                {/* License Details */}
                <div className="lg:col-span-4 space-y-3">
                  {/* Type Badge */}
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      license.type === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                      license.type === 'professional' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {license.type === 'enterprise' ? 'مؤسسي' :
                       license.type === 'professional' ? 'احترافي' : 'أساسي'}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      license.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      license.status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                      license.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {license.status === 'active' ? 'نشط' :
                       license.status === 'trial' ? 'تجريبي' :
                       license.status === 'expired' ? 'منتهي' : 'معلق'}
                    </span>
                  </div>

                  {/* Version */}
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>الإصدار: {license.version}</span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1 text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>تاريخ الشراء: {new Date(license.purchaseDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                    {license.expiryDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>تاريخ الانتهاء: {new Date(license.expiryDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
                    {license.isPermanent && (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>ترخيص دائم</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 flex lg:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(license)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(license.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>

              {/* Notes */}
              {license.notes && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">{license.notes}</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <LicenseForm
            license={editingLicense}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// License Form Component
function LicenseForm({ 
  license, 
  onClose 
}: { 
  license: License | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    licenseKey: license?.licenseKey || generateLicenseKey(),
    customerName: license?.customerName || '',
    customerEmail: license?.customerEmail || '',
    customerPhone: license?.customerPhone || '',
    domain: license?.domain || '',
    domains: license?.domains?.join(', ') || '',
    purchaseDate: license?.purchaseDate ? new Date(license.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    expiryDate: license?.expiryDate ? new Date(license.expiryDate).toISOString().split('T')[0] : '',
    isActive: license?.isActive ?? true,
    isPermanent: license?.isPermanent ?? false,
    version: license?.version || '1.0.0',
    allowedVersion: license?.allowedVersion || '',
    type: license?.type || 'basic',
    status: license?.status || 'active',
    maxProducts: license?.maxProducts || 0,
    maxOrders: license?.maxOrders || 0,
    notes: license?.notes || '',
    features: license?.features?.join(', ') || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const licenseData: any = {
        licenseKey: formData.licenseKey,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        domain: formData.domain,
        purchaseDate: new Date(formData.purchaseDate),
        isActive: formData.isActive,
        isPermanent: formData.isPermanent,
        version: formData.version,
        type: formData.type as 'basic' | 'professional' | 'enterprise',
        status: formData.status as 'active' | 'expired' | 'suspended' | 'trial',
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      };

      if (formData.customerPhone) licenseData.customerPhone = formData.customerPhone;
      if (formData.domains) licenseData.domains = formData.domains.split(',').map(d => d.trim()).filter(Boolean);
      if (formData.expiryDate && !formData.isPermanent) licenseData.expiryDate = new Date(formData.expiryDate);
      if (formData.allowedVersion) licenseData.allowedVersion = formData.allowedVersion;
      if (formData.maxProducts > 0) licenseData.maxProducts = formData.maxProducts;
      if (formData.maxOrders > 0) licenseData.maxOrders = formData.maxOrders;
      if (formData.notes) licenseData.notes = formData.notes;

      if (license) {
        await updateLicense(license.id, licenseData);
      } else {
        await addLicense(licenseData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving license:', error);
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
            {license ? 'تعديل الترخيص' : 'إضافة ترخيص جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* License Key */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  مفتاح الترخيص
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.licenseKey}
                    onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                    required
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-mono focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    readOnly={!!license}
                  />
                  {!license && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, licenseKey: generateLicenseKey() })}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                    >
                      توليد جديد
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  النطاق الرئيسي *
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  required
                  placeholder="example.com"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  نطاقات إضافية (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={formData.domains}
                  onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                  placeholder="domain1.com, domain2.com"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Type and Status */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  نوع الترخيص
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                >
                  <option value="basic">أساسي</option>
                  <option value="professional">احترافي</option>
                  <option value="enterprise">مؤسسي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                >
                  <option value="active">نشط</option>
                  <option value="trial">تجريبي</option>
                  <option value="expired">منتهي</option>
                  <option value="suspended">معلق</option>
                </select>
              </div>

              {/* Version */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الإصدار المشترى
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  آخر إصدار مسموح
                </label>
                <input
                  type="text"
                  value={formData.allowedVersion}
                  onChange={(e) => setFormData({ ...formData, allowedVersion: e.target.value })}
                  placeholder="2.0.0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  تاريخ الشراء
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  disabled={formData.isPermanent}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all disabled:opacity-50"
                />
              </div>

              {/* Limits */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الحد الأقصى للمنتجات (0 = غير محدود)
                </label>
                <input
                  type="number"
                  value={formData.maxProducts}
                  onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الحد الأقصى للطلبات شهرياً (0 = غير محدود)
                </label>
                <input
                  type="number"
                  value={formData.maxOrders}
                  onChange={(e) => setFormData({ ...formData, maxOrders: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  الميزات (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="تعدد اللغات, تخصيص كامل, دعم فني"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-400/30"
                  />
                  <span className="text-white/90">الترخيص نشط</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPermanent}
                    onChange={(e) => setFormData({ ...formData, isPermanent: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-400/30"
                  />
                  <span className="text-white/90">ترخيص دائم</span>
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
                {saving ? 'جاري الحفظ...' : license ? 'حفظ التعديلات' : 'إضافة الترخيص'}
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

