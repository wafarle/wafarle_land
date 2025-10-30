'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen, 
  Tags, 
  Calendar,
  Image,
  Search,
  Filter,
  RefreshCw,
  Database
} from 'lucide-react';
import { 
  getBlogPosts, 
  getBlogCategories, 
  deleteBlogPost
} from '../../lib/database';
import type { BlogPost, BlogCategory } from '../../lib/firebase';

export const BlogTab = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  // Debug: Log posts when they change
  useEffect(() => {
    if (posts.length > 0) {
      console.log('📝 Blog posts loaded:', posts.length, 'posts');
      console.log('Posts summary:', posts.map(p => ({ id: p.id, title: p.title, status: p.status })));
    }
  }, [posts]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsData, categoriesData] = await Promise.all([
        getBlogPosts(),
        getBlogCategories()
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (postId: string) => {
    router.push(`/admin/blog/edit/${postId}`);
  };


  const handleDelete = async (postId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      try {
        await deleteBlogPost(postId);
        await loadData();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('حدث خطأ في حذف المقال');
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published': return 'bg-green-500 text-white';
      case 'draft': return 'bg-gray-500 text-white';
      case 'scheduled': return 'bg-blue-500 text-white';
      case 'archived': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: BlogPost['status']) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'scheduled': return 'مجدول';
      case 'archived': return 'مؤرشف';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Firebase Notice */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center gap-3 text-green-200">
          <Database className="w-5 h-5" />
          <div>
            <p className="font-medium">قاعدة البيانات Firebase مُفعّلة</p>
            <p className="text-sm text-green-300/70">جميع البيانات (المقالات، المنتجات، العملاء) تُحفظ في قاعدة البيانات الحقيقية</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">إدارة المدونة</h2>
          <p className="text-white/60">إدارة مقالات ومحتوى المدونة</p>
        </div>
        
        <button
          onClick={() => router.push('/admin/blog/new')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          مقال جديد
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/50" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
              <option value="scheduled">مجدول</option>
              <option value="archived">مؤرشف</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد مقالات</h3>
          <p className="text-white/60 mb-6">ابدأ بإنشاء مقالك الأول</p>
          <button
            onClick={() => router.push('/admin/blog/new')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            إنشاء مقال جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => {
            const category = categories.find(cat => cat.id === post.categoryId);
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="h-48 relative">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {post.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          ⭐ مميز
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {category && (
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          {category.name}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {getStatusText(post.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(post.id)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="تحرير"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 text-white/80 rounded text-xs">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-white/50 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {(post as any).views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.readingTime || 0} دقيقة
                      </span>
                    </div>
                    
                    <div className="text-xs">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};