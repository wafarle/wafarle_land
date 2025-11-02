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
      } catch (error) {
        console.warn('Firebase Messaging initialization error:', error);
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

let analytics: any;
if (typeof window !== 'undefined' && FIREBASE_ENABLED && app) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Analytics initialization error:', error);
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging || typeof window === 'undefined') return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

export function onMessageListener() {
  return new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

export interface ProductOption {
  id?: string;
  name: string;
  price: number;
  duration: string | number;
  description?: string;
  originalPrice?: number;
  discount?: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number; // السعر الافتراضي للعرض العام
  image: string; // الصورة الرئيسية (للتوافق مع الكود القديم)
  images?: string[]; // صور متعددة للمنتج
  externalLink: string;
  description?: string;
  createdAt: Date;
  category?: string; // للتوافق مع الكود القديم
  categories?: string[]; // تصنيفات متعددة (IDs)
  discount?: string;
  rating?: number;
  averageRating?: number;
  reviewsCount?: number;
  features?: string[];
  type?: 'digital' | 'physical' | 'subscription';
  hasPriceOptions?: boolean;
  priceOptions?: {
    name: string;
    price: number;
  }[];
  hasColorOptions?: boolean;
  colorOptions?: {
    name: string;
    hexCode?: string;
    additionalPrice?: number;
  }[];
  hasSizeOptions?: boolean;
  sizeOptions?: {
    name: string;
    additionalPrice?: number;
  }[];
  durationOptions?: {
    name: string;
    duration: string;
    price: number;
  }[];
  hasDurationOptions?: boolean;
  hasOptions?: boolean;
  options?: ProductOption[];
  defaultOptionId?: string;
  productType?: 'physical' | 'digital' | 'download' | 'subscription';
  requiresShipping?: boolean;
  stockManagementEnabled?: boolean;
  downloadLink?: string;
  stock?: number;
  lowStockThreshold?: number;
  inStock?: boolean;
  outOfStock?: boolean;
  isAvailable?: boolean;
  deliveryTime?: string;
  reviews?: {
    rating: number;
    count: number;
  };
  badge?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string; // الاسم بالإنجليزية
  slug: string; // slug للرابط
  description?: string;
  icon?: string; // أيقونة التصنيف
  color?: string; // لون التصنيف
  parentId?: string; // التصنيف الأب (للتصنيفات الفرعية)
  order: number; // ترتيب العرض
  isActive: boolean;
  productsCount?: number; // عدد المنتجات في هذا التصنيف
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  isRead?: boolean;
  isArchived?: boolean;
  response?: string;
  responseDate?: Date;
}

export interface Order {
  id: string;
  customerName: string;
  email?: string;
  customerEmail?: string;
  phone: string;
  customerPhone?: string;
  productId?: string;
  productPrice?: number;
  productType?: 'physical' | 'digital' | 'download' | 'subscription';
  quantity?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  selectedOption?: string;
  selectedColor?: string;
  selectedSize?: string;
  selectedDuration?: string;
  country?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity?: number;
  };
  productName?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'confirmed' | 'shipped';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentProof?: string;
  paymentGateway?: string;
  paymentGatewayTransactionId?: string;
  paymentGatewayOrderId?: string;
  totalPrice: number;
  totalAmount?: number;
  originalPrice?: number;
  discount?: number;
  discountCode?: string;
  shipping?: number;
  tax?: number;
  shippingStatus?: 'pending' | 'preparing' | 'shipped' | 'out_for_delivery' | 'delivered';
  trackingNumber?: string;
  shippingTrackingNumber?: string;
  shippedAt?: Date;
  estimatedDelivery?: Date;
  notes?: string;
  staffNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
  confirmedAt?: Date;
  deliveredAt?: Date;
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  totalOrders?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  loyaltyPoints?: number;
  totalLoyaltyPointsEarned?: number;
  totalLoyaltyPointsRedeemed?: number;
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  status?: 'active' | 'inactive' | 'blocked';
  notes?: string;
  authProvider?: string;
  avatar?: string;
  gender?: string;
  tags?: string[];
  preferredPaymentMethod?: string;
  createdAt: Date;
  registrationDate?: Date;
  lastOrderDate?: Date;
  wishlist?: string[]; // Product IDs
  compareList?: string[]; // Product IDs
  notifications?: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }[];
}

export interface Subscription {
  id: string;
  orderId?: string;
  customerId?: string;
  customerEmail?: string;
  productId?: string;
  productImage?: string;
  name?: string;
  productName?: string;
  description?: string;
  price: number;
  duration?: string; // e.g., "شهري", "سنوي"
  planType?: string;
  durationMonths?: number;
  features?: string[];
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'expired';
  autoRenewal?: boolean;
  paymentStatus?: string;
  remainingDays?: number;
  usageCount?: number;
  maxUsage?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId?: string;
  senderType?: 'staff' | 'customer';
  senderName?: string;
  senderEmail?: string;
  sender?: string;
  content?: string;
  message?: string;
  timestamp: Date;
  status?: string;
  type?: string;
  isRead?: boolean;
}

export interface ChatConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  supportAgentId?: string;
  supportAgentName?: string;
  status: 'open' | 'closed' | 'active';
  priority?: string;
  category?: string;
  subject?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  createdAt: Date;
  closedAt?: Date;
  assignedTo?: string;
  tags?: string[];
}

export interface SubscriptionReview {
  id: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isApproved?: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  validFrom?: Date;
  validTo?: Date;
  maxUses?: number;
  currentUses?: number;
  minPurchase?: number;
  isActive: boolean;
  description?: string;
  autoApply?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface StaffRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  avatar?: string;
  phone?: string;
  department?: string;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  target?: string;
  targetId?: string;
  details?: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  pointsPerPurchase: number; // عدد النقاط لكل وحدة عملة
  tiers: {
    name: string;
    minPoints: number;
    benefits: string[];
    discount?: number;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earn' | 'redeem';
  points: number;
  reason: string;
  orderId?: string;
  createdAt: Date;
}

export interface DiscountPromotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'bundle' | 'bulk';
  value?: number;
  targetProducts?: string[];
  targetCategories?: string[];
  conditions?: {
    minPurchase?: number;
    minQuantity?: number;
    specificProducts?: string[];
  };
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  usageLimit?: number;
  currentUsage?: number;
  stackable?: boolean;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  bulkDiscount?: {
    enabled: boolean;
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

// License & Version Management Interfaces
export interface License {
  id: string;
  licenseKey: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  domain: string; // النطاق المسموح له
  domains?: string[]; // نطاقات إضافية
  purchaseDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  isPermanent: boolean; // ترخيص دائم أو مؤقت
  version: string; // الإصدار المشترى
  allowedVersion?: string; // آخر إصدار مسموح به
  type: 'basic' | 'professional' | 'enterprise'; // نوع الترخيص
  features: string[]; // الميزات المتاحة
  maxProducts?: number; // الحد الأقصى للمنتجات
  maxOrders?: number; // الحد الأقصى للطلبات شهرياً
  status: 'active' | 'expired' | 'suspended' | 'trial';
  lastCheckDate?: Date; // آخر تحقق من الترخيص
  installationId?: string; // معرف التثبيت الفريد
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemVersion {
  id: string;
  version: string; // e.g., "1.0.0"
  releaseDate: Date;
  isLatest: boolean;
  isStable: boolean;
  isBeta?: boolean;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  features: string[]; // قائمة الميزات الجديدة
  bugFixes: string[]; // قائمة الإصلاحات
  breaking?: boolean; // هل يحتوي على تغييرات جذرية
  minRequiredVersion?: string; // الحد الأدنى من الإصدار المطلوب للترقية
  downloadUrl?: string;
  documentationUrl?: string;
  requirements?: string[]; // متطلبات النظام
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNotification {
  id: string;
  version: string;
  title: string;
  message: string;
  type: 'update' | 'security' | 'feature' | 'bugfix';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetLicenses?: string[]; // تراخيص محددة أو الكل
  targetLicenseTypes?: ('basic' | 'professional' | 'enterprise')[];
  isActive: boolean;
  sendEmail: boolean;
  emailSent?: boolean;
  readBy?: string[]; // IDs of users who read the notification
  createdAt: Date;
  expiresAt?: Date;
}

export interface LicenseCheck {
  id: string;
  licenseKey: string;
  domain: string;
  checkDate: Date;
  currentVersion: string;
  latestVersion: string;
  isValid: boolean;
  status: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  coverImage: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  visibility?: 'public' | 'private' | 'protected';
  featured: boolean;
  views: number;
  likes: number;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metaTitle?: string;
  seoTitle?: string;
  metaDescription?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoImage?: string;
  seoAlt?: string;
  canonicalUrl?: string;
  readingTime?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    alt?: string;
    canonicalUrl?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
  };
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  images?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export { app, db, auth, googleProvider, analytics, messaging };
