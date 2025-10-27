'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Eye, 
  Clock, 
  Tag, 
  ArrowRight, 
  BookOpen, 
  Share2, 
  Heart,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBlogPost, getBlogCategories, getBlogPostsByCategory, updateBlogPostLikes, incrementBlogPostViews } from '@/lib/database';
import type { BlogPost, BlogCategory } from '@/lib/firebase';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    loadPost();
  }, [resolvedParams.slug]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const postData = await getBlogPost(resolvedParams.slug);
      
      if (!postData) {
        notFound();
        return;
      }

      setPost(postData);
      setLikesCount((postData as any).likesCount || 0);
      
      // Check if user has already liked this post (from localStorage)
      const hasLiked = localStorage.getItem(`liked_${postData.id}`) === 'true';
      setLiked(hasLiked);
      
      // Increment view count
      try {
        await incrementBlogPostViews(postData.id);
      } catch (error) {
        console.error('Failed to increment views:', error);
      }

      // Load category and related posts
      const [categories, related] = await Promise.all([
        getBlogCategories(),
        getBlogPostsByCategory(postData.categoryId, 3)
      ]);

      const postCategory = categories.find(cat => cat.id === postData.categoryId);
      setCategory(postCategory || null);
      
      // Filter out current post from related posts
      setRelatedPosts(related.filter(p => p.id !== postData.id));
    } catch (error) {
      console.error('Error loading blog post:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || isLiking) return;
    
    setIsLiking(true);
    try {
      const newLiked = !liked;
      const newCount = newLiked ? likesCount + 1 : likesCount - 1;
      
      setLiked(newLiked);
      setLikesCount(newCount);
      
      // Save to localStorage
      if (newLiked) {
        localStorage.setItem(`liked_${post.id}`, 'true');
      } else {
        localStorage.removeItem(`liked_${post.id}`);
      }
      
      // Update in database
      try {
        await updateBlogPostLikes(post.id, newCount);
      } catch (error) {
        console.error('Failed to update likes in database:', error);
        // Continue with local update even if database update fails
      }
      
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert changes on error
      setLiked(!liked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    const shareUrl = window.location.href;
    const shareTitle = post.title;
    const shareText = post.excerpt;

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare(shareUrl);
      }
    } else {
      fallbackShare(shareUrl);
    }
  };

  const fallbackShare = (url: string) => {
    // Copy to clipboard as fallback
    navigator.clipboard.writeText(url).then(() => {
      alert('تم نسخ رابط المقال إلى الحافظة!');
    }).catch(() => {
      // If clipboard API fails, show a prompt
      prompt('انسخ هذا الرابط:', url);
    });
  };

  const shareOnSocial = (platform: string) => {
    if (!post) return;
    
    const url = window.location.href;
    const title = encodeURIComponent(post.title);
    const text = encodeURIComponent(post.excerpt);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${title}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-white">جارِ تحميل المقال...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header />
      
      {/* Breadcrumb */}
      <section className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-white transition-colors">المدونة</Link>
            <ChevronRight className="w-4 h-4" />
            {category && (
              <>
                <span className="text-white/40">{category.name}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-white/40 truncate">{post.title}</span>
          </nav>
        </div>
      </section>

      {/* Article Header */}
      <section className="pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Featured Image */}
            <div className="h-64 md:h-80 bg-gradient-to-r from-blue-500/20 to-purple-500/20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white/30" />
              </div>
              {post.featured && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
                  مميز
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              {/* Category */}
              {category && (
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icon} {category.name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/60 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.publishedAt!).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} دقيقة قراءة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} مشاهدة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>بواسطة</span>
                  <span className="text-blue-400 font-medium">{post.authorName}</span>
                </div>
              </div>

              {/* Excerpt */}
              <div className="text-lg text-white/80 mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                {post.excerpt}
              </div>

              {/* Content */}
              <div 
                className="prose prose-invert prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  color: '#e2e8f0',
                  lineHeight: '1.8'
                }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    العلامات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-sm hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        liked 
                          ? 'bg-red-500/30 text-red-300' 
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                      <span>{likesCount}</span>
                    </button>
                    
                    <div className="relative group">
                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        مشاركة
                      </button>
                      
                      {/* Social Share Dropdown */}
                      <div className="absolute bottom-full left-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-3 min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => shareOnSocial('facebook')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-blue-400 hover:bg-white/10 rounded transition-colors"
                          >
                            <span className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-xs text-white">f</span>
                            Facebook
                          </button>
                          <button 
                            onClick={() => shareOnSocial('twitter')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-sky-400 hover:bg-white/10 rounded transition-colors"
                          >
                            <span className="w-4 h-4 bg-sky-500 rounded flex items-center justify-center text-xs text-white">𝕏</span>
                            Twitter
                          </button>
                          <button 
                            onClick={() => shareOnSocial('whatsapp')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-green-400 hover:bg-white/10 rounded transition-colors"
                          >
                            <span className="w-4 h-4 bg-green-500 rounded flex items-center justify-center text-xs text-white">W</span>
                            WhatsApp
                          </button>
                          <button 
                            onClick={() => shareOnSocial('telegram')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-blue-400 hover:bg-white/10 rounded transition-colors"
                          >
                            <span className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-xs text-white">T</span>
                            Telegram
                          </button>
                          <button 
                            onClick={() => fallbackShare(window.location.href)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-gray-300 hover:bg-white/10 rounded transition-colors"
                          >
                            <span className="w-4 h-4 bg-gray-500 rounded flex items-center justify-center text-xs text-white">📋</span>
                            نسخ الرابط
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href="/blog"
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    العودة للمدونة
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                مقالات ذات صلة
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.article
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="h-48 bg-gradient-to-r from-gray-500/20 to-gray-600/20 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/30" />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relatedPost.readingTime} دقيقة
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(relatedPost.publishedAt!).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
