'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Globe,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}

const CurrencySettings = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([
    {
      id: '1',
      code: 'SAR',
      name: 'الريال السعودي',
      symbol: 'ر.س',
      rate: 1,
      isDefault: true,
      isActive: true,
    },
    {
      id: '2',
      code: 'USD',
      name: 'الدولار الأمريكي',
      symbol: '$',
      rate: 0.27,
      isDefault: false,
      isActive: true,
    },
    {
      id: '3',
      code: 'EUR',
      name: 'اليورو الأوروبي',
      symbol: '€',
      rate: 0.24,
      isDefault: false,
      isActive: true,
    },
    {
      id: '4',
      code: 'AED',
      name: 'الدرهم الإماراتي',
      symbol: 'د.إ',
      rate: 0.98,
      isDefault: false,
      isActive: false,
    },
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({
    code: '',
    name: '',
    symbol: '',
    rate: 0,
    isDefault: false,
    isActive: true,
  });

  const [editingCurrency, setEditingCurrency] = useState<Partial<Currency>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState('');

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setShowErrorMessage(message);
      setTimeout(() => setShowErrorMessage(''), 3000);
    } else {
      setShowSuccessMessage(message);
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const handleAddCurrency = () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      showMessage('يرجى ملء جميع الحقول المطلوبة', true);
      return;
    }

    if (currencies.some(c => c.code === newCurrency.code?.toUpperCase())) {
      showMessage('رمز العملة موجود بالفعل', true);
      return;
    }

    const currency: Currency = {
      id: Date.now().toString(),
      code: newCurrency.code.toUpperCase(),
      name: newCurrency.name,
      symbol: newCurrency.symbol,
      rate: newCurrency.rate || 0,
      isDefault: false,
      isActive: newCurrency.isActive || true,
    };
    
    setCurrencies([...currencies, currency]);
    setNewCurrency({
      code: '',
      name: '',
      symbol: '',
      rate: 0,
      isDefault: false,
      isActive: true,
    });
    setIsAddingNew(false);
    showMessage(`تم إضافة العملة ${currency.name} (${currency.code}) بنجاح`);
  };

  const handleEditCurrency = (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (currency) {
      setEditingCurrency(currency);
      setEditingId(id);
    }
  };

  const handleSaveEdit = () => {
    if (!editingCurrency.code || !editingCurrency.name || !editingCurrency.symbol) {
      showMessage('يرجى ملء جميع الحقول المطلوبة', true);
      return;
    }

    if (currencies.some(c => c.code === editingCurrency.code?.toUpperCase() && c.id !== editingId)) {
      showMessage('رمز العملة موجود بالفعل', true);
      return;
    }

    setCurrencies(currencies.map(currency => 
      currency.id === editingId ? { ...currency, ...editingCurrency } : currency
    ));
    setEditingId(null);
    setEditingCurrency({});
    showMessage(`تم تحديث العملة ${editingCurrency.name} (${editingCurrency.code}) بنجاح`);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCurrency({});
  };

  const handleDeleteCurrency = (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (currency && !currency.isDefault) {
      if (confirm(`هل أنت متأكد من حذف العملة ${currency.name} (${currency.code})؟`)) {
        setCurrencies(currencies.filter(currency => currency.id !== id));
        showMessage(`تم حذف العملة ${currency.name} (${currency.code}) بنجاح`);
      }
    }
  };

  const handleSetDefault = (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (currency && !currency.isDefault) {
      if (confirm(`هل تريد تعيين ${currency.name} (${currency.code}) كعملة افتراضية؟`)) {
        setCurrencies(currencies.map(currency => ({
          ...currency,
          isDefault: currency.id === id
        })));
        showMessage(`تم تعيين ${currency.name} (${currency.code}) كعملة افتراضية`);
      }
    }
  };

  const handleToggleActive = (id: string) => {
    setCurrencies(currencies.map(currency => 
      currency.id === id ? { ...currency, isActive: !currency.isActive } : currency
    ));
  };

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-emerald-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{showSuccessMessage}</span>
          </div>
        </motion.div>
      )}

      {showErrorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{showErrorMessage}</span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">إعدادات العملة</h2>
            <p className="text-white/60">إدارة العملات المتاحة وأسعار الصرف</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          إضافة عملة جديدة
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-white/60 text-sm">إجمالي العملات</p>
              <p className="text-2xl font-bold text-white">{currencies.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-white/60 text-sm">العملات النشطة</p>
              <p className="text-2xl font-bold text-white">
                {currencies.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-white/60 text-sm">العملة الافتراضية</p>
              <p className="text-lg font-bold text-white">
                {currencies.find(c => c.isDefault)?.code || 'غير محدد'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add New Currency Form */}
      {isAddingNew && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">إضافة عملة جديدة</h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">رمز العملة</label>
              <input
                type="text"
                value={newCurrency.code}
                onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
                placeholder="مثال: USD"
                maxLength={3}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">اسم العملة</label>
              <input
                type="text"
                value={newCurrency.name}
                onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
                placeholder="مثال: الدولار الأمريكي"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">رمز العملة</label>
              <input
                type="text"
                value={newCurrency.symbol}
                onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
                placeholder="مثال: $"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">سعر الصرف</label>
              <input
                type="number"
                step="0.0001"
                value={newCurrency.rate}
                onChange={(e) => setNewCurrency({ ...newCurrency, rate: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-blue-400 focus:outline-none"
                placeholder="مثال: 0.27"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={newCurrency.isActive}
                onChange={(e) => setNewCurrency({ ...newCurrency, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <span>نشط</span>
            </label>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddCurrency}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Save className="w-5 h-5" />
              حفظ العملة
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-6 py-3 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      )}

      {/* Currencies List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-xl font-bold text-white">قائمة العملات</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-right text-white/80 font-medium">العملة</th>
                <th className="px-6 py-4 text-right text-white/80 font-medium">الرمز</th>
                <th className="px-6 py-4 text-right text-white/80 font-medium">سعر الصرف</th>
                <th className="px-6 py-4 text-right text-white/80 font-medium">الحالة</th>
                <th className="px-6 py-4 text-right text-white/80 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((currency, index) => (
                <motion.tr
                  key={currency.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    {editingId === currency.id ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{editingCurrency.symbol || currency.symbol}</span>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editingCurrency.name || currency.name}
                            onChange={(e) => setEditingCurrency({ ...editingCurrency, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-blue-400 focus:outline-none text-sm"
                            placeholder="اسم العملة"
                          />
                          <input
                            type="text"
                            value={editingCurrency.code || currency.code}
                            onChange={(e) => setEditingCurrency({ ...editingCurrency, code: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-blue-400 focus:outline-none text-sm mt-1"
                            placeholder="رمز العملة"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{currency.symbol}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{currency.name}</p>
                          <p className="text-white/60 text-sm">{currency.code}</p>
                        </div>
                        {currency.isDefault && (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                            افتراضي
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === currency.id ? (
                      <input
                        type="text"
                        value={editingCurrency.symbol || currency.symbol}
                        onChange={(e) => setEditingCurrency({ ...editingCurrency, symbol: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-blue-400 focus:outline-none text-sm font-mono"
                        placeholder="رمز العملة"
                        maxLength={5}
                      />
                    ) : (
                      <span className="text-white font-mono">{currency.symbol}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === currency.id ? (
                      <input
                        type="number"
                        step="0.0001"
                        value={editingCurrency.rate || currency.rate}
                        onChange={(e) => setEditingCurrency({ ...editingCurrency, rate: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-blue-400 focus:outline-none text-sm"
                        placeholder="سعر الصرف"
                      />
                    ) : (
                      <span className="text-white font-medium">{currency.rate}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(currency.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        currency.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {currency.isActive ? 'نشط' : 'غير نشط'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {editingId === currency.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                            title="حفظ التعديلات"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-400 hover:bg-gray-500/20 rounded-lg transition-colors"
                            title="إلغاء التعديل"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {!currency.isDefault && (
                            <button
                              onClick={() => handleSetDefault(currency.id)}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                              title="تعيين كافتراضي"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditCurrency(currency.id)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!currency.isDefault && (
                            <button
                              onClick={() => handleDeleteCurrency(currency.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
