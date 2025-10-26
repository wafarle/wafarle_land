'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Filter, Star } from 'lucide-react';
import { Product } from '@/lib/firebase';
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
          
          <div className="flex justify-between items-center mb-4">
            <CurrencyDisplay 
              price={product.price} 
              originalCurrency="USD" 
              className="font-bold text-blue-400 text-xl" 
            />
            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-500/30">
              {product.discount}
            </span>
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20"
        style={{ padding: '15px', marginBottom: '10px' }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              السعر
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
              placeholder="أدخل السعر (مثال: 9.99)"
            />
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
