'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Eye, 
  Clock, 
  BookOpen, 
  Tag,
  ChevronRight,
  Filter
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBlogPosts, getBlogCategories, getFeaturedBlogPosts } from '@/lib/database';
import type { BlogPost, BlogCategory } from '@/lib/firebase';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsData, featuredData, categoriesData] = await Promise.all([
        getBlogPosts(),
        getFeaturedBlogPosts(3).then(posts => posts.filter(post => post.status === 'published')),
        getBlogCategories()
      ]);
      setPosts(postsData);
      setFeaturedPosts(featuredData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory;
    const isPublished = post.status === 'published';
    return matchesSearch && matchesCategory && isPublished;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-white">جارِ تحميل المقالات...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                مدونة وافرلي
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              اكتشف أحدث المقالات في عالم التقنية وريادة الأعمال والتسويق الرقمي
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-12"
          >
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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع التصنيفات</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-yellow-400" />
                المقالات المميزة
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => {
                  const category = categories.find(cat => cat.id === post.categoryId);
                  
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="h-48 bg-gradient-to-r from-blue-500/20 to-purple-500/20 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/30" />
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                          مميز
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {category && (
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block"
                            style={{ backgroundColor: category.color + '20', color: category.color }}
                          >
                            {category.icon} {category.name}
                          </span>
                        )}
                        
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>
                        
                        <p className="text-white/70 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {(post as any).views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.readingTime || 5} دقيقة
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.publishedAt!).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              جميع المقالات
            </h2>
            
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد مقالات</h3>
                <p className="text-white/60">جرب البحث بكلمات أخرى أو اختر تصنيف مختلف</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => {
                  const category = categories.find(cat => cat.id === post.categoryId);
                  
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="h-48 bg-gradient-to-r from-gray-500/20 to-gray-600/20 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/30" />
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {category && (
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block"
                            style={{ backgroundColor: category.color + '20', color: category.color }}
                          >
                            {category.icon} {category.name}
                          </span>
                        )}
                        
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>
                        
                        <p className="text-white/70 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {(post as any).views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.readingTime || 5} دقيقة
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.publishedAt!).toLocaleDateString('ar-SA')}
                          </span>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full flex items-center gap-1"
                              >
                                <Tag className="w-2 h-2" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                        >
                          اقرأ المزيد
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
