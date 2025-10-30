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

export default function BlogPageClient() {
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

  // Generate structured data for blog page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "مدونة وافرلي",
    "description": "اكتشف أحدث المقالات في عالم التقنية وريادة الأعمال والتسويق الرقمي. نصائح وإرشادات من خبراء الصناعة.",
    "url": "https://wafarle.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "وافرلي",
      "logo": {
        "@type": "ImageObject",
        "url": "https://wafarle.com/logo.png"
      }
    },
    "blogPost": posts.filter(post => post.status === 'published').map(post => ({
      "@type": "BlogPosting",
      "headline": post.seoTitle || post.seo?.title || post.title,
      "description": post.seoDescription || post.seo?.description || post.excerpt,
      "url": `https://wafarle.com/blog/${post.slug}`,
      "datePublished": post.publishedAt?.toISOString(),
      "dateModified": post.updatedAt.toISOString(),
      "author": {
        "@type": "Person",
        "name": post.authorName
      },
      "image": post.seoImage || post.seo?.image || post.featuredImage
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
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
            className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-12"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث في المقالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white/40" />
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

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold text-white mb-8">المقالات المميزة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg mb-4 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">جميع المقالات</h2>
              <span className="text-white/60 text-sm">
                {filteredPosts.length} مقال
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد مقالات</h3>
                <p className="text-white/60">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'لم نجد مقالات تطابق البحث المطلوب' 
                    : 'لم يتم نشر أي مقالات بعد'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg mb-4 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewCount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
