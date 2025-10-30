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
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBlogPost, getBlogCategories, getBlogPostsByCategory, updateBlogPostLikes, incrementBlogPostViews } from '@/lib/database';
import type { BlogPost, BlogCategory } from '@/lib/firebase';

interface BlogPostClientProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostClient({ params }: BlogPostClientProps) {
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
      console.log('📖 [LOAD_POST] Loading post with slug:', resolvedParams.slug);
      const postData = await getBlogPost(resolvedParams.slug);
      
      if (!postData) {
        console.log('❌ [LOAD_POST] Post not found');
        notFound();
        return;
      }

      console.log('✅ [LOAD_POST] Post loaded:', {
        id: postData.id,
        title: postData.title,
        slug: postData.slug
      });

      setPost(postData);
      setLikesCount((postData as any).likesCount || 0);
      
      // Check if user has already liked this post (from localStorage)
      const hasLiked = localStorage.getItem(`liked_${postData.id}`) === 'true';
      setLiked(hasLiked);
      
      // Increment view count
      try {
        console.log('👁️ [LOAD_POST] Incrementing views for post:', postData.id);
        await incrementBlogPostViews(postData.id);
      } catch (error) {
        console.error('❌ [LOAD_POST] Failed to increment views:', error);
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
      const newLikesCount = newLiked ? likesCount + 1 : likesCount - 1;
      
      setLiked(newLiked);
      setLikesCount(newLikesCount);
      
      // Save to localStorage
      localStorage.setItem(`liked_${post.id}`, newLiked.toString());
      
      // Update in database
      await updateBlogPostLikes(post.id, newLikesCount);
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert on error
      setLiked(!liked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط إلى الحافظة');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
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

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.seoTitle || post.seo?.title || post.title,
    "description": post.seoDescription || post.seo?.description || post.excerpt,
    "image": post.seoImage || post.seo?.image || post.featuredImage,
    "author": {
      "@type": "Person",
      "name": post.authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "وافرلي",
      "logo": {
        "@type": "ImageObject",
        "url": "https://wafarle.com/logo.png"
      }
    },
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": post.canonicalUrl || post.seo?.canonicalUrl || `https://wafarle.com/blog/${post.slug}`
    },
    "articleSection": category?.name,
    "keywords": (post.seoKeywords || post.seo?.keywords || post.tags)?.join(', ')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumb */}
      <div className="pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-white transition-colors">المدونة</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/10"
          >
            {/* Category */}
            {category && (
              <div className="mb-6">
                <Link 
                  href={`/blog?category=${category.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium hover:bg-blue-500/30 transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  {category.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/60 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('ar-SA')}</span>
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

            {/* Featured Image */}
            {post.featuredImage ? (
              <div className="mb-8">
                <img
                  src={post.featuredImage}
                  alt={post.seoAlt || post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-xl"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="mb-8 h-64 md:h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white/40" />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-invert prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                color: '#e2e8f0',
                lineHeight: '1.8'
              }}
            />

            {/* Additional Images Gallery */}
            {post.images && post.images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  معرض الصور
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {post.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">العلامات</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    liked 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
              </div>
            </div>
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8">مقالات ذات صلة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {relatedPost.featuredImage ? (
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
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
                      {relatedPost.title}
                    </h3>
                    
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(relatedPost.publishedAt || relatedPost.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
}
