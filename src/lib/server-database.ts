import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { BlogPost, Product } from '@/lib/firebase';
import { db, FIREBASE_ENABLED } from '@/lib/firebase';

// Server-side function to get blog post by slug
export const getBlogPostServer = async (slugOrId: string): Promise<BlogPost | null> => {
  
  if (!FIREBASE_ENABLED || !db) {
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
  
  if (!FIREBASE_ENABLED || !db) {
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
  
  if (!FIREBASE_ENABLED || !db) {
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

// Server-side function to get product by ID
export const getProductByIdServer = async (id: string): Promise<Product | null> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return null;
  }

  try {
    const productRef = doc(db, 'products', id);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      return null;
    }
    
    const docData = productDoc.data() as any;
    const product = {
      id: productDoc.id,
      ...docData,
      createdAt: docData.createdAt?.toDate() || new Date(),
    } as Product;
    
    return product;
  } catch (error) {
    console.error('❌ [GET_PRODUCT_BY_ID_SERVER] Error getting product:', error);
    return null;
  }
};
