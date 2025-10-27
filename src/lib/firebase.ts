import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Check if Firebase should be enabled (set this to false during development if Firebase isn't set up)
export const FIREBASE_ENABLED = false; // Temporarily disabled to avoid errors

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyADXAZf6_DAgya_HcwRYQvNxo1lUFu4LqE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "wafarle-63a71.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "wafarle-63a71",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "wafarle-63a71.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "234030784195",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:234030784195:web:fef98ef416f0c1bc388c76",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LH9ZENFJPY"
};

let app: any;
let db: any;
let auth: any;

// Only initialize Firebase if enabled
if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('Falling back to mock mode');
  }
}

export { app, db, auth };

// Initialize Analytics only in browser environment and if Firebase is enabled
let analytics;
if (typeof window !== 'undefined' && FIREBASE_ENABLED && app) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Analytics initialization error:', error);
  }
}
export { analytics };

export interface ProductOption {
  id: string;
  name: string; // مثل: "شهري", "ربع سنوي", "سنوي"
  duration: number; // عدد الأشهر
  price: number;
  originalPrice?: number; // السعر الأصلي قبل الخصم
  discount?: number; // نسبة الخصم
  isPopular?: boolean; // الخيار الأكثر شعبية
  description?: string; // وصف إضافي للخيار
}

export interface Product {
  id: string;
  name: string;
  price: number; // السعر الافتراضي للعرض العام
  image: string;
  externalLink: string;
  description?: string;
  createdAt: Date;
  category?: string;
  discount?: string;
  rating?: number;
  features?: string[];
  // النظام الجديد للخيارات
  hasOptions?: boolean; // هل المنتج له خيارات متعددة
  options?: ProductOption[]; // خيارات الاشتراك المختلفة
  defaultOptionId?: string; // الخيار الافتراضي
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  avatar?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  status: 'active' | 'inactive' | 'blocked';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  registrationDate: Date;
  notes?: string;
  tags?: string[];
  preferredPaymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
  notes?: string;
  createdAt: Date;
  confirmedAt?: Date;
  deliveredAt?: Date;
  // Subscription-related fields
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  subscriptionDurationMonths?: number;
  subscriptionStatus?: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenewal?: boolean;
}

// New Subscription interface
export interface Subscription {
  id: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  productId: string;
  productName: string;
  productImage?: string;
  planType: string; // شهري، ربع سنوي، سنوي
  price: number;
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'paused';
  autoRenewal: boolean;
  paymentStatus: 'paid' | 'unpaid' | 'failed';
  remainingDays: number;
  usageCount?: number; // عدد مرات الاستخدام
  maxUsage?: number; // الحد الأقصى للاستخدام
  features: string[]; // المميزات المتاحة
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// Chat interfaces
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: 'customer' | 'support';
  senderName?: string;
  senderEmail?: string; // Optional - support agents may not have email
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'system' | 'file';
  metadata?: Record<string, any>;
}

export interface ChatConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  supportAgentId?: string;
  supportAgentName?: string;
  status: 'active' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  subject?: string;
  lastMessage?: string;
  lastMessageTime: Date;
  createdAt: Date;
  closedAt?: Date;
  tags?: string[];
  satisfaction?: number; // 1-5 rating
}

// Blog System Interfaces
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  images?: string[]; // Array of image URLs/base64
  categoryId: string;
  categories?: string[];
  tags: string[];
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  visibility: 'public' | 'private' | 'password';
  password?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  // Additional fields
  readingTime: number; // in minutes
  language: 'ar' | 'en';
  featured: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  parentId?: string;
  postsCount: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  postsCount: number;
  createdAt: Date;
}

export interface BlogComment {
  id: string;
  postId: string;
  parentId?: string; // for replies
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'rejected';
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}
