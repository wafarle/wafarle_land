import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { BlogPost } from '@/lib/firebase';
import { db, FIREBASE_ENABLED } from '@/lib/firebase';

// Server-side function to get blog post by slug
export const getBlogPostServer = async (slugOrId: string): Promise<BlogPost | null> => {
  console.log('🚀 [GET_BLOG_POST_SERVER] Called with ID/slug:', slugOrId);
  
  if (!FIREBASE_ENABLED || !db) {
    console.log('🔍 [GET_BLOG_POST_SERVER] Firebase not enabled, returning null');
    return null;
  }

  try {
    const postQuery = query(collection(db, 'blogPosts'), where('slug', '==', slugOrId));
    const snapshot = await getDocs(postQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const docData = doc.data() as any;
    
    console.log('📄 [GET_BLOG_POST_SERVER] Document data:', {
      id: doc.id,
      title: docData.title,
      seoTitle: docData.seoTitle,
      seoDescription: docData.seoDescription,
      seoKeywords: docData.seoKeywords,
      seoImage: docData.seoImage,
      seoAlt: docData.seoAlt,
      canonicalUrl: docData.canonicalUrl,
      robotsIndex: docData.robotsIndex,
      robotsFollow: docData.robotsFollow,
      seo: docData.seo
    });
    
    return {
      id: doc.id,
      ...docData,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate() || new Date(),
      publishedAt: docData.publishedAt?.toDate() || null,
      scheduledAt: docData.scheduledAt?.toDate() || null
    } as BlogPost;
  } catch (error) {
    console.error('Error getting blog post (server):', error);
    return null;
  }
};

// Server-side function to get blog posts
export const getBlogPostsServer = async (limit?: number, category?: string, status?: string): Promise<BlogPost[]> => {
  console.log('🚀 [GET_BLOG_POSTS_SERVER] Called with limit:', limit, 'category:', category, 'status:', status);
  
  if (!FIREBASE_ENABLED || !db) {
    console.log('🔍 [GET_BLOG_POSTS_SERVER] Firebase not enabled, returning empty array');
    return [];
  }

  try {
    let postQuery = query(collection(db, 'blogPosts'));
    
    // Add filters
    if (status) {
      postQuery = query(postQuery, where('status', '==', status));
    }
    
    if (category) {
      postQuery = query(postQuery, where('categoryId', '==', category));
    }
    
    // Add ordering and limit
    postQuery = query(postQuery, orderBy('publishedAt', 'desc'));
    
    if (limit) {
      postQuery = query(postQuery, firestoreLimit(limit));
    }
    
    const snapshot = await getDocs(postQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
      publishedAt: (doc.data() as any).publishedAt?.toDate() || null,
      scheduledAt: (doc.data() as any).scheduledAt?.toDate() || null
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting blog posts (server):', error);
    return [];
  }
};

// Server-side function to get blog categories
export const getBlogCategoriesServer = async () => {
  console.log('🚀 [GET_BLOG_CATEGORIES_SERVER] Called');
  
  if (!FIREBASE_ENABLED || !db) {
    console.log('🔍 [GET_BLOG_CATEGORIES_SERVER] Firebase not enabled, returning empty array');
    return [];
  }

  try {
    const categoriesQuery = query(collection(db, 'blogCategories'), orderBy('name', 'asc'));
    const snapshot = await getDocs(categoriesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting blog categories (server):', error);
    return [];
  }
};
