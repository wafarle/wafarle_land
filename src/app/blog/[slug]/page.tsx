import { Metadata } from 'next';
import { getBlogPostServer } from '@/lib/server-database';
import BlogPostClient from './BlogPostClient';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  console.log('🔍 [GENERATE_METADATA] Called with slug:', resolvedParams.slug);
  
  const post = await getBlogPostServer(resolvedParams.slug);
  
  if (!post) {
    console.log('❌ [GENERATE_METADATA] Post not found');
    return {
      title: 'المقال غير موجود',
      description: 'المقال المطلوب غير موجود أو تم حذفه'
    };
  }

  console.log('📄 [GENERATE_METADATA] Post found:', {
    id: post.id,
    title: post.title,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords,
    seoImage: post.seoImage,
    seoAlt: post.seoAlt,
    canonicalUrl: post.canonicalUrl,
    robotsIndex: post.robotsIndex,
    robotsFollow: post.robotsFollow,
    seo: post.seo
  });

  const seoTitle = post.seoTitle || post.seo?.title || post.title;
  const seoDescription = post.seoDescription || post.seo?.description || post.excerpt;
  const seoImage = post.seoImage || post.seo?.image || post.featuredImage;
  const seoKeywords = post.seoKeywords || post.seo?.keywords || post.tags;
  const seoAlt = post.seoAlt || post.seo?.alt || post.title;
  const canonicalUrl = post.canonicalUrl || post.seo?.canonicalUrl || `https://wafarle.com/blog/${post.slug}`;
  const robotsIndex = post.robotsIndex ?? post.seo?.robotsIndex ?? true;
  const robotsFollow = post.robotsFollow ?? post.seo?.robotsFollow ?? true;

  console.log('🎯 [GENERATE_METADATA] Final SEO values:', {
    seoTitle,
    seoDescription,
    seoImage,
    seoKeywords,
    seoAlt,
    canonicalUrl,
    robotsIndex,
    robotsFollow
  });

  console.log('🔍 [GENERATE_METADATA] Metadata object:', {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords?.join(', '),
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      images: seoImage ? [{ url: seoImage, alt: seoAlt }] : []
    },
    twitter: {
      title: seoTitle,
      description: seoDescription,
      images: seoImage ? [seoImage] : []
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow
    },
    alternates: {
      canonical: canonicalUrl
    }
  });

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords?.join(', '),
    authors: [{ name: post.authorName }],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      url: canonicalUrl,
      images: seoImage ? [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: seoAlt
        }
      ] : [],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      siteName: 'وافرلي'
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: seoImage ? [seoImage] : []
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow
    },
    alternates: {
      canonical: canonicalUrl
    },
    other: {
      'article:author': post.authorName,
      ...(post.publishedAt && { 'article:published_time': post.publishedAt.toISOString() }),
      'article:modified_time': post.updatedAt.toISOString(),
      'article:section': post.categoryId,
      ...(seoKeywords && { 'article:tag': seoKeywords.join(', ') })
    }
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return <BlogPostClient params={params} />;
}

