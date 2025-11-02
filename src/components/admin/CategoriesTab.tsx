'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Tag, X, Save, XCircle, AlertCircle } from 'lucide-react';
import { Category } from '@/lib/firebase';
import { getCategories, addCategory, updateCategory, deleteCategory, subscribeToCategories } from '@/lib/database';

export const CategoriesTab = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3b82f6',
    order: 0,
    isActive: true,
    parentId: '',
  });
  const [saving, setSaving] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const cats = await getCategories();
        setCategories(cats);
        
        // Set max order for new category
        const maxOrder = cats.length > 0 ? Math.max(...cats.map(c => c.order)) : 0;
        setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToCategories((cats) => {
      setCategories(cats);
      const maxOrder = cats.length > 0 ? Math.max(...cats.map(c => c.order)) : 0;
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    });

    return () => unsubscribe();
  }, []);

  // Filter categories
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form open for new category
  const handleAddNew = () => {
    setFormData({
      name: '',
      nameEn: '',
      slug: '',
      description: '',
      icon: '',
      color: '#3b82f6',
      order: categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 1,
      isActive: true,
      parentId: '',
    });
    setEditingCategory(null);
    setShowForm(true);
  };

  // Handle form open for edit
  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3b82f6',
      order: category.order,
      isActive: category.isActive,
      parentId: category.parentId || '',
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم التصنيف');
      return;
    }

    try {
      setSaving(true);

      // Generate slug if not provided
      let slug = formData.slug.trim();
      if (!slug) {
        slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }

      // Prepare category data, filtering out empty strings
      const categoryData: any = {
        name: formData.name,
        slug,
        order: formData.order,
        isActive: formData.isActive,
      };

      // Only add optional fields if they have values
      if (formData.nameEn.trim()) categoryData.nameEn = formData.nameEn.trim();
      if (formData.description.trim()) categoryData.description = formData.description.trim();
      if (formData.icon.trim()) categoryData.icon = formData.icon.trim();
      if (formData.color) categoryData.color = formData.color;
      if (formData.parentId && formData.parentId.trim()) categoryData.parentId = formData.parentId.trim();

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        nameEn: '',
        slug: '',
        description: '',
        icon: '',
        color: '#3b82f6',
        order: categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 1,
        isActive: true,
        parentId: '',
      });
    } catch (error) {
      console.error('Error saving category:', error);
      alert('حدث خطأ أثناء حفظ التصنيف');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      return;
    }

    try {
      await deleteCategory(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('حدث خطأ أثناء حذف التصنيف');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">إدارة التصنيفات</h2>
          <p className="text-white/60 mt-2">إدارة تصنيفات المنتجات</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-2xl transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          إضافة تصنيف جديد
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في التصنيفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-lg">{category.name}</h3>
                    {category.nameEn && (
                      <p className="text-sm text-white/60">{category.nameEn}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-white/70 mb-3">{category.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {category.slug}
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ backgroundColor: category.color }} className="w-3 h-3 rounded-full"></span>
                  {category.color}
                </span>
                {category.productsCount !== undefined && (
                  <span>{category.productsCount} منتج</span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  category.isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {category.isActive ? 'نشط' : 'غير نشط'}
                </span>
                <span className="text-xs text-white/50">ترتيب: {category.order}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 text-lg">
            {searchTerm ? 'لا توجد تصنيفات تطابق البحث' : 'لا توجد تصنيفات بعد'}
          </p>
        </div>
      )}

      {/* Category Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <div className="min-h-full flex items-start justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 w-full max-w-4xl my-8 shadow-2xl"
              >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      اسم التصنيف (عربي) *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        // Auto-generate slug if empty
                        if (!formData.slug) {
                          const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                          setFormData(prev => ({ ...prev, slug }));
                        }
                      }}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                      placeholder="مثال: البث المباشر"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      اسم التصنيف (إنجليزي)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                      placeholder="مثال: Streaming"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Slug (رابط التصنيف)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                    placeholder="سيتم إنشاؤه تلقائياً إذا ترك فارغاً"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    يجب أن يكون فريداً وصالح للروابط (مثال: streaming)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 resize-none"
                    placeholder="وصف التصنيف..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      الأيقونة (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-center text-2xl"
                      placeholder="📺"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      اللون
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-12 rounded-lg border border-white/20 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      الترتيب
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      الحالة
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCategory(null);
                    }}
                    className="flex-1 px-4 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جارِ الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingCategory ? 'تحديث' : 'إضافة'} التصنيف
                      </>
                    )}
                  </button>
                </div>
              </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

