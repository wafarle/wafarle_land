'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Save,
  X,
  FileText,
  Eye,
  Calendar,
  Tag,
  Image as ImageIcon,
  Settings,
  Trash2,
  Upload,
  Search
} from 'lucide-react';
import { 
  getBlogCategories, 
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  generateSlug, 
  calculateReadingTime 
} from '../../../../../lib/database';
import type { BlogPost, BlogCategory } from '../../../../../lib/firebase';

interface EditBlogPostProps {
  params: Promise<{ id: string }>;
}

const EditBlogPost = ({ params }: EditBlogPostProps) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    categories: [] as string[],
    tags: [] as string[],
    status: 'draft' as BlogPost['status'],
    visibility: 'public' as BlogPost['visibility'],
    featuredImage: '',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [] as string[],
    seoImage: '',
    seoAlt: '',
    canonicalUrl: '',
    robotsIndex: true,
    robotsFollow: true,
    images: [] as string[] // Array of image URLs/base64
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      const [postData, categoriesData] = await Promise.all([
        getBlogPostById(resolvedParams.id),
        getBlogCategories()
      ]);
      if (postData) {
        
        setPost(postData);
        setFormData({
          title: postData.title,
          excerpt: postData.excerpt || '',
          content: postData.content,
          categoryId: postData.categories?.[0] || '',
          categories: postData.categories || [],
          tags: postData.tags || [],
          status: postData.status,
          visibility: postData.visibility,
          featuredImage: postData.featuredImage || '',
          featured: postData.featured,
          seoTitle: postData.seoTitle || postData.seo?.title || '',
          seoDescription: postData.seoDescription || postData.seo?.description || '',
          seoKeywords: postData.seoKeywords || postData.seo?.keywords || [],
          seoImage: postData.seoImage || postData.seo?.image || '',
          seoAlt: postData.seoAlt || postData.seo?.alt || '',
          canonicalUrl: postData.canonicalUrl || postData.seo?.canonicalUrl || '',
          robotsIndex: postData.robotsIndex ?? postData.seo?.robotsIndex ?? true,
          robotsFollow: postData.robotsFollow ?? postData.seo?.robotsFollow ?? true,
          images: postData.images || [] // Load existing images
        });
        
        // Set image preview if featured image exists
        if (postData.featuredImage) {
          setImagePreview(postData.featuredImage);
        }
      } else {
        console.error('❌ [EDIT PAGE] Post not found with ID:', resolvedParams.id);
        console.error('❌ [EDIT PAGE] This should not happen if mock data is working!');
        alert('المقال غير موجود - تأكد من صحة رابط المقال');
        router.push('/admin/dashboard?tab=blog');
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('يرجى ملء العنوان والمحتوى');
      return;
    }

    setLoading(true);
    
    try {
      const slug = generateSlug(formData.title);
      const readingTime = calculateReadingTime(formData.content);
      
      const updatedPost: Partial<BlogPost> = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt,
        content: formData.content,
        categories: formData.categories.length > 0 ? formData.categories : (formData.categoryId ? [formData.categoryId] : []),
        tags: formData.tags,
        status: formData.status,
        visibility: formData.visibility,
        featuredImage: formData.featuredImage,
        images: formData.images,
        featured: formData.featured,
        readingTime,
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
        seoKeywords: formData.seoKeywords,
        seoImage: formData.seoImage || formData.featuredImage,
        seoAlt: formData.seoAlt,
        canonicalUrl: formData.canonicalUrl,
        robotsIndex: formData.robotsIndex,
        robotsFollow: formData.robotsFollow,
        seo: {
          title: formData.seoTitle || formData.title,
          description: formData.seoDescription || formData.excerpt,
          keywords: formData.seoKeywords,
          image: formData.seoImage || formData.featuredImage,
          alt: formData.seoAlt,
          canonicalUrl: formData.canonicalUrl,
          robotsIndex: formData.robotsIndex,
          robotsFollow: formData.robotsFollow
        },
        updatedAt: new Date(),
        ...(formData.status === 'published' && !post?.publishedAt && { publishedAt: new Date() }),
        ...(formData.status === 'published' && post?.publishedAt && { publishedAt: post.publishedAt }),
        ...(formData.status === 'scheduled' && { scheduledAt: new Date() })
      };

      await updateBlogPost(resolvedParams.id, updatedPost);
      
      // Navigate back to blog tab
      router.push('/admin/dashboard?tab=blog');
    } catch (error) {
      console.error('❌ [SAVE] Error updating post:', error);
      if (error instanceof Error && error.message.includes('does not exist')) {
        alert('المقال غير موجود في قاعدة البيانات. يرجى العودة إلى قائمة المقالات.');
        router.push('/admin/dashboard?tab=blog');
      } else {
        alert('حدث خطأ في تحديث المقال: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        setLoading(true);
        await deleteBlogPost(resolvedParams.id);
        router.push('/admin/dashboard?tab=blog');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('حدث خطأ في حذف المقال');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const tag = target.value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, WebP, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData(prev => ({ 
        ...prev, 
        featuredImage: result,
        images: [...prev.images, result]
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ 
      ...prev, 
      featuredImage: '',
      images: prev.images.filter(img => img !== imagePreview)
    }));
  };

  const setAsFeaturedImage = (imageUrl: string) => {
    setFormData(prev => ({ 
      ...prev, 
      featuredImage: imageUrl
    }));
    setImagePreview(imageUrl);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل المقال...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">المقال غير موجود</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard?tab=blog')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-400" />
                  تحرير المقال
                </h1>
                <p className="text-white/60 text-sm">تحرير: {post.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard?tab=blog')}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? 'جاري الحفظ...' : 'تحديث المقال'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              المعلومات الأساسية
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <label className="block text-white/70 text-base font-medium mb-3">عنوان المقال</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اكتب عنوان المقال هنا..."
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 text-base font-medium mb-3">التصنيف</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-base font-medium mb-3">الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BlogPost['status'] }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">مسودة</option>
                  <option value="published">نشر</option>
                  <option value="scheduled">جدولة</option>
                  <option value="archived">أرشفة</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-white/70 text-base font-medium mb-3">المقدمة</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="مقدمة قصيرة عن المقال..."
                />
              </div>

              {/* Featured Image Upload */}
              <div className="lg:col-span-2">
                <label className="block text-white/70 text-base font-medium mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-400" />
                  الصورة المميزة
                </label>
                
                {imagePreview ? (
                  <div className="relative mb-4">
                    <img 
                      src={imagePreview} 
                      alt="معاينة الصورة" 
                      className="w-full h-48 object-cover rounded-lg border border-white/20"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 bg-green-500/80 text-white text-xs rounded">
                        صورة مميزة
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer flex flex-col items-center gap-3 text-white/60 hover:text-white/80 transition-all"
                    >
                      <Upload className="w-12 h-12" />
                      <div className="text-center">
                        <p className="text-lg font-medium">اضغط لرفع صورة</p>
                        <p className="text-sm">JPG, PNG, WebP, GIF (حتى 5MB)</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-white/70 text-base font-medium mb-3">العلامات</label>
                <div className="space-y-3">
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-200 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    onKeyDown={handleTagsChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="اكتب علامة واضغط Enter أو فاصلة لإضافتها..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              محتوى المقال
            </h2>
            
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={20}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white text-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[500px]"
              placeholder="اكتب محتوى المقال هنا..."
              required
            />
          </div>

          {/* Images Gallery */}
          {formData.images.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                معرض الصور
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`صورة ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg border border-white/20"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAsFeaturedImage(image)}
                        className="p-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full transition-all"
                        title="تعيين كصورة مميزة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          images: prev.images.filter((_, i) => i !== index)
                        }))}
                        className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {formData.featuredImage === image && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-green-500/80 text-white text-xs rounded">
                          مميزة
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Toggle */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-yellow-400" />
                  مقال مميز
                </h3>
                <p className="text-white/60 text-sm mt-1">سيظهر في قسم المقالات المميزة على الصفحة الرئيسية</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.featured ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.featured ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* SEO Settings */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-green-400" />
                إعدادات SEO
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">عنوان SEO</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder={formData.title || "عنوان المقال"}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-white/50 text-xs mt-1">الطول المثالي: 50-60 حرف</p>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">وصف SEO</label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder={formData.excerpt || "وصف المقال"}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-white/50 text-xs mt-1">الطول المثالي: 150-160 حرف</p>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">الكلمات المفتاحية</label>
                  <input
                    type="text"
                    value={formData.seoKeywords.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      seoKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    }))}
                    placeholder="كلمة مفتاحية 1، كلمة مفتاحية 2، كلمة مفتاحية 3"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-white/50 text-xs mt-1">افصل الكلمات بفواصل</p>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">صورة SEO</label>
                  <input
                    type="url"
                    value={formData.seoImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoImage: e.target.value }))}
                    placeholder="https://example.com/seo-image.jpg"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-white/50 text-xs mt-1">الأبعاد المثالية: 1200x630 بكسل</p>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">نص بديل للصورة</label>
                  <input
                    type="text"
                    value={formData.seoAlt}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoAlt: e.target.value }))}
                    placeholder="وصف الصورة للمحركات البحث"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">الرابط الأساسي</label>
                  <input
                    type="url"
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                    placeholder="https://wafarle.com/blog/article-slug"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">السماح بالفهرسة</h4>
                    <p className="text-white/60 text-sm">السماح لمحركات البحث بفهرسة المقال</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, robotsIndex: !prev.robotsIndex }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.robotsIndex ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.robotsIndex ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">السماح بالمتابعة</h4>
                    <p className="text-white/60 text-sm">السماح لمحركات البحث بمتابعة الروابط</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, robotsFollow: !prev.robotsFollow }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.robotsFollow ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.robotsFollow ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlogPost;
