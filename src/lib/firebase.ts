import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Check if Firebase should be enabled (set this to false during development if Firebase isn't set up)
export const FIREBASE_ENABLED = true; // Re-enabled for production use

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
let googleProvider: any;
let messaging: Messaging | null = null;

// Only initialize Firebase if enabled
if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Initialize Firebase Cloud Messaging (only in browser)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        messaging = getMessaging(app);
        console.log('✅ Firebase Cloud Messaging initialized');
      } catch (error) {
        console.warn('Firebase Messaging initialization error:', error);
        console.log('Push notifications will not be available');
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.log('Falling back to mock mode');
  }
}

export { app, db, auth, googleProvider, messaging };

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

export type ProductType = 'digital' | 'physical' | 'download' | 'service';

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
  // حقول التقييمات
  reviewsCount?: number; // عدد التقييمات
  averageRating?: number; // متوسط التقييم
  // نوع المنتج
  productType?: ProductType; // نوع المنتج: رقمي، ملموس، تنزيل، خدمة
  // حقول خاصة بالمنتج الملموس
  weight?: number; // الوزن بالكيلوجرام
  dimensions?: string; // الأبعاد (مثل: 10x20x30 سم)
  requiresShipping?: boolean; // هل يحتاج شحن
  // حقول خاصة بالمنتج الرقمي/التنزيل
  downloadLink?: string; // رابط التحميل
  downloadExpiryDays?: number; // عدد الأيام المتاحة للتحميل
  // حقول خاصة بالخدمة
  serviceDuration?: string; // مدة الخدمة (مثل: "ساعتان", "يوم واحد")
  serviceDetails?: string; // تفاصيل إضافية للخدمة
  // Inventory Management
  stockManagementEnabled?: boolean; // تفعيل إدارة المخزون
  stock?: number; // الكمية المتاحة في المخزون
  lowStockThreshold?: number; // الحد الأدنى لتنبيه المخزون (افتراضي: 10)
  outOfStock?: boolean; // هل المنتج نفد من المخزون
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

export interface SubscriptionReview {
  id: string;
  subscriptionId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  productId: string;
  productName: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  isVerified: boolean; // true if customer actually used the subscription
  helpful: number; // number of helpful votes
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
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
  authProvider?: 'email' | 'google' | 'facebook' | 'apple';
  // Loyalty points
  loyaltyPoints?: number; // نقاط الولاء
  totalLoyaltyPointsEarned?: number; // إجمالي النقاط المكتسبة
  totalLoyaltyPointsRedeemed?: number; // إجمالي النقاط المستخدمة
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum'; // فئة الولاء
}

export type StaffRole = 'super_admin' | 'admin' | 'manager' | 'support';

export interface StaffUser {
  uid: string; // معرفه داخل Firebase Auth
  email: string;
  name: string;
  role: StaffRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
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
  // Shipping and download fields
  shippingAddress?: string; // العنوان للشحن (للمنتجات الملموسة)
  downloadLink?: string; // رابط التحميل (للمنتجات الرقمية/التنزيل)
  productType?: ProductType; // نوع المنتج
  shippingStatus?: 'pending_shipping' | 'prepared' | 'shipped' | 'in_transit' | 'delivered'; // حالة الشحن
  shippingTrackingNumber?: string; // رقم تتبع الشحن
  shippedAt?: Date; // تاريخ الشحن
  // Discount code fields
  discountCode?: string; // كود الخصم المستخدم
  discountAmount?: number; // قيمة الخصم المطبقة
  originalAmount?: number; // المبلغ الأصلي قبل الخصم
  // Invoice fields
  invoiceNumber?: string; // رقم الفاتورة التسلسلي
  invoiceGeneratedAt?: Date; // تاريخ توليد الفاتورة
  invoiceSentAt?: Date; // تاريخ إرسال الفاتورة
  // Payment gateway fields
  paymentGateway?: 'paypal' | 'stripe' | 'moyasar' | 'manual'; // بوابة الدفع المستخدمة
  paymentGatewayTransactionId?: string; // رقم المعاملة من البوابة
  paymentGatewayOrderId?: string; // رقم الطلب في البوابة
  // Return and refund fields
  returnStatus?: 'none' | 'requested' | 'approved' | 'rejected' | 'returned' | 'exchanged'; // حالة الإرجاع
  returnRequestedAt?: Date; // تاريخ طلب الإرجاع
  returnReason?: string; // سبب الإرجاع
  returnApprovedAt?: Date; // تاريخ الموافقة على الإرجاع
  returnCompletedAt?: Date; // تاريخ إكمال الإرجاع
  refundAmount?: number; // مبلغ الاسترجاع
  refundMethod?: 'original' | 'store_credit' | 'bank_transfer'; // طريقة الاسترجاع
  refundCompletedAt?: Date; // تاريخ إكمال الاسترجاع
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
  seoImage?: string;
  seoAlt?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    alt?: string;
    canonicalUrl?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    structuredData?: {
      article?: {
        headline?: string;
        description?: string;
        image?: string;
        author?: string;
        publisher?: string;
        datePublished?: string;
        dateModified?: string;
        mainEntityOfPage?: string;
      };
      breadcrumb?: {
        name: string;
        item: string;
      }[];
    };
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

// Discount Code interface
export interface DiscountCode {
  id: string;
  code: string; // كود الخصم (مثل: REVIEW10)
  type: 'percentage' | 'fixed'; // نوع الخصم: نسبة مئوية أو مبلغ ثابت
  value: number; // قيمة الخصم (نسبة مئوية أو مبلغ)
  description?: string; // وصف الكود
  minPurchaseAmount?: number; // الحد الأدنى للشراء
  maxDiscountAmount?: number; // الحد الأقصى للخصم (للكوبونات نسبة مئوية)
  usageLimit?: number; // الحد الأقصى لعدد الاستخدامات
  usedCount: number; // عدد مرات الاستخدام الحالية
  usageLimitPerCustomer?: number; // حد الاستخدام لكل عميل
  validFrom: Date; // تاريخ بدء الصلاحية
  validTo: Date; // تاريخ انتهاء الصلاحية
  isActive: boolean; // حالة الكود (نشط/معطل)
  applicableProductIds?: string[]; // منتجات محددة فقط (فارغ = جميع المنتجات)
  applicableCategories?: string[]; // فئات محددة فقط
  excludeProductIds?: string[]; // منتجات مستثناة من الخصم
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // من أنشأ الكود
  // Advanced features
  priority?: number; // أولوية الكوبون (1 = أعلى أولوية، يتم تطبيقه أولاً)
  stackable?: boolean; // هل يمكن استخدامه مع كوبونات أخرى
  autoApply?: boolean; // هل يتم تطبيقه تلقائياً
  loyaltyTierOnly?: 'bronze' | 'silver' | 'gold' | 'platinum'; // مخصص لفئة ولاء محددة
  bulkDiscount?: {
    enabled: boolean; // خصم على الكمية
    tiers: Array<{ minQuantity: number; discount: number }>; // مستويات الخصم
  };
  minimumItems?: number; // الحد الأدنى لعدد المنتجات
  freeShipping?: boolean; // شحن مجاني
  buyXGetY?: {
    enabled: boolean;
    buyQuantity: number;
    getQuantity: number;
    productId?: string; // منتج معين أو أي منتج
  };
}
