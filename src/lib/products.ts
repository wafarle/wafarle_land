'use client';

import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/lib/firebase';
import { db, FIREBASE_ENABLED } from '@/lib/firebase';
import { collection } from 'firebase/firestore';

let productsCollection: any;
if (FIREBASE_ENABLED && db) {
  productsCollection = collection(db, 'products');
}

/**
 * جلب تفاصيل منتج واحد حسب المعرف من Firestore
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    // في حالة العمل بدون Firebase، يمكن استرجاع منتج تجريبي من قائمة وهمية
    const { getProducts } = await import('@/lib/database');
    const allProducts = await getProducts();
    return allProducts.find((p) => p.id === id) || null;
  }

  try {
    const productRef = doc(db, 'products', id);
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      return null;
    }
    return { id: productDoc.id, ...productDoc.data() } as Product;
  } catch (error) {
    console.error('Error getting product by id:', error);
    return null;
  }
};

