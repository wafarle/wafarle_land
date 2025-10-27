'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Filter, Star, X, Clock, Tag, Zap } from 'lucide-react';
import { Product, ProductOption } from '@/lib/firebase';
import CurrencyDisplay from '@/components/CurrencyDisplay';

// Products Tab Component
export const ProductsTab = ({ 
  products, 
  searchTerm, 
  setSearchTerm, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}: {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}) => (
  <div>
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-white">إدارة المنتجات</h2>
        <p className="text-white/60 mt-2">إدارة جميع منتجات الاشتراك الخاصة بك</p>
      </div>
      <button
        onClick={onAddProduct}
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-2xl transition-all duration-300"
      >
        <Plus className="w-5 h-5" />
        إضافة منتج جديد
      </button>
    </div>

    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
        <input
          type="text"
          placeholder="البحث في المنتجات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
        />
      </div>
      <button className="px-4 py-4 border border-white/20 rounded-2xl hover:bg-white/10 transition-all duration-300">
        <Filter className="w-5 h-5 text-white/70" />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ marginBottom: '10px' }}>
      {products.map((product: Product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
          style={{ padding: '15px' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {product.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">{product.name}</h3>
              <p className="text-sm text-white/60">{product.description}</p>
            </div>
          </div>
          
          {/* عرض السعر والخيارات */}
          <div className="mb-4">
            {product.hasOptions && product.options && product.options.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-white/80 text-sm font-medium">خيارات الاشتراك ({product.options.length}):</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {product.options.map((option, index) => (
                    <div key={option.id} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      option.isPopular 
                        ? 'bg-yellow-400/10 border-yellow-400/30' 
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{option.name}</span>
                          {option.isPopular && (
                            <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded text-xs font-bold">
                              شائع
                            </span>
                          )}
                        </div>
                        <span className="text-white/60 text-xs">{option.duration} شهر</span>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay 
                          price={option.price} 
                          originalCurrency="USD" 
                          className="font-bold text-green-400 text-sm" 
                        />
                        {option.originalPrice && option.originalPrice > option.price && (
                          <div className="flex items-center gap-1">
                            <span className="text-white/40 line-through text-xs">
                              ${option.originalPrice}
                            </span>
                            {(option.discount && option.discount > 0) && (
                              <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs">
                                -{option.discount || 0}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                  <Zap className="w-3 h-3" />
                  <span>المنتج يحتوي على خيارات متعددة</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <CurrencyDisplay 
                  price={product.price} 
                  originalCurrency="USD" 
                  className="font-bold text-blue-400 text-xl" 
                />
                {product.discount && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-500/30">
                    {product.discount}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 mb-4">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-semibold text-white">{product.rating}</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onEditProduct(product)}
              className="flex-1 p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <Edit className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => onDeleteProduct(product.id)}
              className="flex-1 p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <Trash2 className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Product Form Component
export const ProductForm = ({
  product,
  onClose,
  onSave
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    image: product?.image || '',
    externalLink: product?.externalLink || '',
    description: product?.description || '',
    category: product?.category || '',
    discount: product?.discount || '',
    rating: product?.rating || 0,
    features: product?.features || [],
    hasOptions: product?.hasOptions || false,
    options: product?.options || [],
    defaultOptionId: product?.defaultOptionId || '',
  });

  const [currentOption, setCurrentOption] = useState<Partial<ProductOption>>({
    name: '',
    duration: 1,
    price: 0,
    originalPrice: 0,
    discount: 0,
    isPopular: false,
    description: '',
  });

  // إضافة خيار جديد
  const addOption = () => {
    if (!currentOption.name || !currentOption.price || !currentOption.duration) {
      alert('يرجى ملء جميع الحقول المطلوبة للخيار');
      return;
    }

    const newOption: ProductOption = {
      id: Date.now().toString(),
      name: currentOption.name!,
      duration: currentOption.duration!,
      price: currentOption.price!,
      originalPrice: currentOption.originalPrice || currentOption.price!,
      discount: currentOption.discount || 0,
      isPopular: currentOption.isPopular || false,
      description: currentOption.description || '',
    };

    setFormData({
      ...formData,
      options: [...formData.options, newOption],
      defaultOptionId: formData.options.length === 0 ? newOption.id : formData.defaultOptionId,
    });

    // إعادة تعيين النموذج
    setCurrentOption({
      name: '',
      duration: 1,
      price: 0,
      originalPrice: 0,
      discount: 0,
      isPopular: false,
      description: '',
    });
  };

  // حذف خيار
  const removeOption = (optionId: string) => {
    const updatedOptions = formData.options.filter(opt => opt.id !== optionId);
    setFormData({
      ...formData,
      options: updatedOptions,
      defaultOptionId: formData.defaultOptionId === optionId 
        ? (updatedOptions.length > 0 ? updatedOptions[0].id : '') 
        : formData.defaultOptionId,
    });
  };

  // تحديث حقول الخيار الحالي
  const updateCurrentOption = (field: keyof ProductOption, value: any) => {
    setCurrentOption(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الخيارات إذا كانت مفعلة
    if (formData.hasOptions && formData.options.length === 0) {
      alert('يرجى إضافة خيار واحد على الأقل أو إلغاء تفعيل الخيارات');
      return;
    }

    // إذا لم تكن هناك خيارات، تأكد من وجود سعر افتراضي
    if (!formData.hasOptions && !formData.price) {
      alert('يرجى تحديد سعر للمنتج');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-y-auto"
        style={{ padding: '20px' }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات المنتج الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                اسم المنتج
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                placeholder="أدخل اسم المنتج"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                السعر الافتراضي {!formData.hasOptions && '(مطلوب)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required={!formData.hasOptions}
                disabled={formData.hasOptions}
                className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 ${
                  formData.hasOptions ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="أدخل السعر (مثال: 9.99)"
              />
              {formData.hasOptions && (
                <p className="text-xs text-white/60 mt-1">
                  سيتم حساب السعر من الخيارات المتاحة
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              الرابط الخارجي
            </label>
            <input
              type="url"
              value={formData.externalLink}
              onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
              placeholder="أدخل الرابط الخارجي"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 resize-none"
              placeholder="أدخل وصف المنتج"
            />
          </div>

          {/* نظام خيارات الاشتراك */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  خيارات الاشتراك
                </h4>
                <p className="text-sm text-white/60 mt-1">إضافة خيارات متعددة بأسعار مختلفة حسب مدة الاشتراك</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70">تفعيل الخيارات</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasOptions: !formData.hasOptions, options: [] })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.hasOptions ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.hasOptions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {formData.hasOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6"
              >
                {/* نموذج إضافة خيار جديد */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h5 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة خيار جديد
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">اسم الخيار *</label>
                      <input
                        type="text"
                        value={currentOption.name}
                        onChange={(e) => updateCurrentOption('name', e.target.value)}
                        placeholder="مثل: شهري، ربع سنوي"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">المدة (بالأشهر) *</label>
                      <input
                        type="number"
                        min="1"
                        value={currentOption.duration}
                        onChange={(e) => updateCurrentOption('duration', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">السعر *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentOption.price}
                        onChange={(e) => updateCurrentOption('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">السعر الأصلي (اختياري)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={currentOption.originalPrice}
                        onChange={(e) => updateCurrentOption('originalPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">نسبة الخصم (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentOption.discount}
                        onChange={(e) => updateCurrentOption('discount', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={currentOption.isPopular}
                        onChange={(e) => updateCurrentOption('isPopular', e.target.checked)}
                        className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isPopular" className="text-xs text-white/80 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        الأكثر شعبية
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-white/80 mb-1">وصف الخيار (اختياري)</label>
                    <input
                      type="text"
                      value={currentOption.description}
                      onChange={(e) => updateCurrentOption('description', e.target.value)}
                      placeholder="وصف قصير للخيار"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-medium text-sm hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة الخيار
                  </button>
                </div>

                {/* عرض الخيارات المضافة */}
                {formData.options.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-md font-semibold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      الخيارات المضافة ({formData.options.length})
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.options.map((option) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`bg-white/5 border rounded-xl p-4 relative ${
                            option.isPopular ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-white/10'
                          }`}
                        >
                          {option.isPopular && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              الأكثر شعبية
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h6 className="text-white font-medium">{option.name}</h6>
                              <p className="text-white/60 text-sm">{option.duration} شهر</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-green-400 font-bold">${option.price}</span>
                                {option.originalPrice && option.originalPrice > option.price && (
                                  <span className="text-white/40 line-through text-sm">${option.originalPrice}</span>
                                )}
                                {(option.discount && option.discount > 0) && (
                                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs">
                                    -{option.discount || 0}%
                                  </span>
                                )}
                              </div>
                              {option.description && (
                                <p className="text-white/50 text-xs mt-1">{option.description}</p>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  defaultOptionId: option.id
                                })}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  formData.defaultOptionId === option.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                              >
                                {formData.defaultOptionId === option.id ? 'افتراضي' : 'تعيين كافتراضي'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => removeOption(option.id)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors group"
                              >
                                <X className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/20 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300"
            >
              {product ? 'تحديث' : 'إضافة'} المنتج
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
