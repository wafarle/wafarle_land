'use client';

import { 
  collection, 
  doc, 
  getDocs,
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  limit,
  runTransaction
} from 'firebase/firestore';
import { Product, ContactMessage, Order, Customer, Subscription, ChatMessage, ChatConversation, SubscriptionReview, DiscountCode, Category, License, SystemVersion, UpdateNotification, LicenseCheck } from '@/lib/firebase';
import { CurrencySettings, DEFAULT_CURRENCY_SETTINGS } from '@/lib/currency';
import { StaffUser, StaffRole } from '@/lib/firebase';
import { db, FIREBASE_ENABLED } from '@/lib/firebase';

const USE_FIREBASE = FIREBASE_ENABLED && db;

// Collections - only create if Firebase is enabled
let productsCollection: any;
let messagesCollection: any;
let ordersCollection: any;
let customersCollection: any;
let subscriptionsCollection: any;
let chatConversationsCollection: any;
let chatMessagesCollection: any;
let discountCodesCollection: any;
let staffCollection: any;
let staffActivityCollection: any;
let categoriesCollection: any;
let licensesCollection: any;
let versionsCollection: any;
let updateNotificationsCollection: any;
let licenseChecksCollection: any;



if (FIREBASE_ENABLED && db) {
  productsCollection = collection(db, 'products');
  messagesCollection = collection(db, 'messages');
  ordersCollection = collection(db, 'orders');
  customersCollection = collection(db, 'customers');
  subscriptionsCollection = collection(db, 'subscriptions');
  chatConversationsCollection = collection(db, 'chatConversations');
  chatMessagesCollection = collection(db, 'chatMessages');
  discountCodesCollection = collection(db, 'discountCodes');
  categoriesCollection = collection(db, 'categories');
  licensesCollection = collection(db, 'licenses');
  versionsCollection = collection(db, 'versions');
  updateNotificationsCollection = collection(db, 'updateNotifications');
  licenseChecksCollection = collection(db, 'licenseChecks');
}

// Mock data for development/fallback
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Netflix Premium',
    price: 45.99, // Converted to SAR
    image: '/api/placeholder/300/200',
    externalLink: 'https://netflix.com',
    description: 'مشاهدة أفلام ومسلسلات بجودة 4K بدون إعلانات',
    createdAt: new Date(),
    category: 'streaming',
    discount: '50%',
    rating: 4.9,
    features: ['4K Ultra HD', 'مشاهدة متعددة الأجهزة', 'تحميل للمشاهدة لاحقاً'],
    hasOptions: true,
    options: [
      {
        id: 'netflix-monthly',
        name: 'شهري',
        duration: 1,
        price: 45.99,
        isPopular: false,
        description: 'اشتراك شهري - يمكن إلغاؤه في أي وقت'
      },
      {
        id: 'netflix-quarterly',
        name: 'ربع سنوي',
        duration: 3,
        price: 129.99,
        originalPrice: 137.97,
        discount: 6,
        isPopular: true,
        description: 'وفر 6% مع الاشتراك الربع سنوي'
      },
      {
        id: 'netflix-yearly',
        name: 'سنوي',
        duration: 12,
        price: 499.99,
        originalPrice: 551.88,
        discount: 10,
        isPopular: false,
        description: 'أفضل قيمة - وفر 10% مع الاشتراك السنوي'
      }
    ],
    defaultOptionId: 'netflix-quarterly'
  },
  {
    id: '2',
    name: 'Spotify Premium',
    price: 35.99, // Converted to SAR
    image: '/api/placeholder/300/200',
    externalLink: 'https://spotify.com',
    description: 'استماع للموسيقى بدون إعلانات مع إمكانية التحميل',
    createdAt: new Date(),
    category: 'music',
    discount: '40%',
    rating: 4.8,
    features: ['بدون إعلانات', 'تحميل للاستماع بدون إنترنت', 'جودة عالية'],
    hasOptions: true,
    options: [
      {
        id: 'spotify-monthly',
        name: 'شهري',
        duration: 1,
        price: 35.99,
        isPopular: false,
        description: 'اشتراك شهري مرن'
      },
      {
        id: 'spotify-quarterly',
        name: 'ربع سنوي',
        duration: 3,
        price: 99.99,
        originalPrice: 107.97,
        discount: 7,
        isPopular: true,
        description: 'وفر 7% مع الاشتراك الربع سنوي'
      },
      {
        id: 'spotify-yearly',
        name: 'سنوي',
        duration: 12,
        price: 399.99,
        originalPrice: 431.88,
        discount: 7,
        isPopular: false,
        description: 'وفر 7% مع الاشتراك السنوي'
      }
    ],
    defaultOptionId: 'spotify-quarterly'
  },
  {
    id: '3',
    name: 'Shahid VIP',
    price: 29.99, // Converted to SAR
    image: '/api/placeholder/300/200',
    externalLink: 'https://shahid.mbc.net',
    description: 'محتوى عربي حصري من MBC وأفضل المسلسلات العربية',
    createdAt: new Date(),
    category: 'streaming',
    discount: '30%',
    rating: 4.7,
    features: ['محتوى عربي حصري', 'مسلسلات جديدة', 'أفلام عربية'],
    hasOptions: true,
    options: [
      {
        id: 'shahid-monthly',
        name: 'شهري',
        duration: 1,
        price: 29.99,
        isPopular: true,
        description: 'اشتراك شهري'
      },
      {
        id: 'shahid-quarterly',
        name: 'ربع سنوي',
        duration: 3,
        price: 84.99,
        originalPrice: 89.97,
        discount: 6,
        isPopular: false,
        description: 'وفر 6% مع الاشتراك الربع سنوي'
      },
      {
        id: 'shahid-yearly',
        name: 'سنوي',
        duration: 12,
        price: 319.99,
        originalPrice: 359.88,
        discount: 11,
        isPopular: false,
        description: 'وفر 11% مع الاشتراك السنوي'
      }
    ],
    defaultOptionId: 'shahid-monthly'
  },
  {
    id: '3t9ZmfoYU5icJYXh2MES',
    name: 'منتج تجريبي Firestore',
    description: 'هذا منتج وهمي بنفس المعرّف العشوائي لاختبار الربط.',
    price: 99.99,
    image: '/api/placeholder/300/200',
    category: 'test',
    discount: '10%',
    rating: 4.5,
    averageRating: 4.5,
    reviewsCount: 2,
    features: ['اختبار ID Firestore', 'ربط صحيح', 'بيانات جاهزة'],
  },
];
// بيانات تجريبية للموظفين - mock
const mockStaffUsers: StaffUser[] = [
  {
    uid: 'super-1',
    email: 'super@domain.com',
    name: 'Super Admin',
    role: 'super_admin',
    avatar: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'admin-1',
    email: 'admin@domain.com',
    name: 'مدير النظام',
    role: 'admin',
    avatar: '',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
const mockStaffLogs: any[] = [];
// Mock orders data for development/fallback
const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'أحمد محمد',
    customerEmail: 'ahmed@example.com',
    customerPhone: '+966501234567',
    productId: '1',
    productName: 'Netflix Premium',
    productPrice: 12.99,
    quantity: 1,
    totalAmount: 12.99,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'card',
    notes: 'طلب جديد، بانتظار التأكيد',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '2',
    customerName: 'فاطمة علي',
    customerEmail: 'fatima@example.com',
    customerPhone: '+966507654321',
    productId: '2',
    productName: 'Spotify Premium',
    productPrice: 9.99,
    quantity: 1,
    totalAmount: 9.99,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    notes: 'تم الدفع، جاري التفعيل',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    confirmedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
  },
  {
    id: '3',
    customerName: 'محمد سالم',
    customerEmail: 'mohammed@example.com',
    customerPhone: '+966509876543',
    productId: '3',
    productName: 'Shahid VIP',
    productPrice: 7.99,
    quantity: 2,
    totalAmount: 15.98,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'digital_wallet',
    notes: 'تم التسليم بنجاح',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Mock customers data for development/fallback
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'أحمد محمد العلي',
    email: 'ahmed.ali@email.com',
    phone: '+966501234567',
    avatar: '/api/placeholder/40/40',
    address: 'شارع الملك فهد، حي النهضة',
    city: 'الرياض',
    country: 'السعودية',
    gender: 'male',
    status: 'active',
    totalOrders: 15,
    totalSpent: 485.75,
    averageOrderValue: 32.38,
    lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    registrationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
    notes: 'عميل مميز، يفضل الدفع بالبطاقة الائتمانية',
    tags: ['VIP', 'عميل مميز'],
    preferredPaymentMethod: 'card'
  },
  {
    id: '2',
    name: 'فاطمة سالم الحربي',
    email: 'fatima.harbi@email.com',
    phone: '+966507654321',
    avatar: '/api/placeholder/40/40',
    address: 'شارع التحلية، حي السليمانية',
    city: 'جدة',
    country: 'السعودية',
    gender: 'female',
    status: 'active',
    totalOrders: 8,
    totalSpent: 156.90,
    averageOrderValue: 19.61,
    lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    registrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    notes: 'تفضل الاشتراكات الشهرية',
    tags: ['عميل نشط'],
    preferredPaymentMethod: 'bank_transfer'
  },
  {
    id: '3',
    name: 'عبدالله خالد المطيري',
    email: 'abdullah.mutairi@email.com',
    phone: '+966509876543',
    avatar: '/api/placeholder/40/40',
    address: 'شارع العروبة، حي الصفا',
    city: 'الدمام',
    country: 'السعودية',
    gender: 'male',
    status: 'inactive',
    totalOrders: 3,
    totalSpent: 67.45,
    averageOrderValue: 22.48,
    lastOrderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    registrationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
    notes: 'لم يقم بطلبات حديثة',
    tags: ['عميل غير نشط'],
    preferredPaymentMethod: 'digital_wallet'
  },
  {
    id: '4',
    name: 'نورا أحمد القحطاني',
    email: 'nora.qahtani@email.com',
    phone: '+966512345678',
    avatar: '/api/placeholder/40/40',
    address: 'شارع الأمير محمد بن عبدالعزيز، حي العليا',
    city: 'الرياض',
    country: 'السعودية',
    gender: 'female',
    status: 'active',
    totalOrders: 25,
    totalSpent: 892.30,
    averageOrderValue: 35.69,
    lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    notes: 'أفضل عميل لدينا، طلبات منتظمة',
    tags: ['VIP', 'عميل مميز', 'عميل قديم'],
    preferredPaymentMethod: 'card'
  },
  {
    id: '5',
    name: 'محمد عبدالرحمن الغامدي',
    email: 'mohammed.ghamdi@email.com',
    phone: '+966598765432',
    avatar: '/api/placeholder/40/40',
    address: 'شارع الملك عبدالعزيز، حي المروج',
    city: 'جدة',
    country: 'السعودية',
    gender: 'male',
    status: 'blocked',
    totalOrders: 2,
    totalSpent: 25.98,
    averageOrderValue: 12.99,
    lastOrderDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    notes: 'حُجب لمشاكل في الدفع',
    tags: ['محجوب'],
    preferredPaymentMethod: 'cash'
  }
];

// Mock subscriptions data
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    orderId: '1',
    customerId: '1',
    customerEmail: 'ahmed.ali@email.com',
    productId: '1',
    productName: 'Netflix Premium',
    productImage: '/api/placeholder/300/200',
    planType: 'شهري',
    price: 45.00,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    durationMonths: 1,
    status: 'active',
    autoRenewal: true,
    paymentStatus: 'paid',
    remainingDays: 20,
    usageCount: 145,
    maxUsage: 9999,
    features: ['4K Ultra HD', 'مشاهدة متعددة الأجهزة', 'تحميل للمشاهدة لاحقاً', 'بدون إعلانات'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: 'اشتراك نشط وممتاز'
  },
  {
    id: '2',
    orderId: '2',
    customerId: '2',
    customerEmail: 'fatima.ahmed@email.com',
    productId: '2',
    productName: 'Spotify Premium',
    productImage: '/api/placeholder/300/200',
    planType: 'ربع سنوي',
    price: 120.00,
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    endDate: new Date(Date.now() + (90 - 45) * 24 * 60 * 60 * 1000), // 45 more days (total 90 days for 3 months)
    durationMonths: 3,
    status: 'active',
    autoRenewal: false,
    paymentStatus: 'paid',
    remainingDays: 45, // 45 days remaining out of 90 total
    usageCount: 2890,
    maxUsage: 9999,
    features: ['بدون إعلانات', 'تحميل للاستماع بدون إنترنت', 'جودة عالية', 'تخطي غير محدود'],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '3',
    orderId: '3',
    customerId: '1',
    customerEmail: 'ahmed.ali@email.com',
    productId: '3',
    productName: 'Adobe Creative Cloud',
    productImage: '/api/placeholder/300/200',
    planType: 'سنوي',
    price: 800.00,
    startDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
    endDate: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000), // 165 days from now
    durationMonths: 12,
    status: 'active',
    autoRenewal: true,
    paymentStatus: 'paid',
    remainingDays: 165,
    usageCount: 450,
    maxUsage: 9999,
    features: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'تخزين سحابي 100GB'],
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: 'اشتراك سنوي مع خصم 20%'
  },
  {
    id: '4',
    orderId: '4',
    customerId: '3',
    customerEmail: 'omar.hassan@email.com',
    productId: '4',
    productName: 'YouTube Premium',
    productImage: '/api/placeholder/300/200',
    planType: 'شهري',
    price: 25.00,
    startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // expired 5 days ago
    durationMonths: 1,
    status: 'expired',
    autoRenewal: false,
    paymentStatus: 'unpaid',
    remainingDays: -5,
    usageCount: 87,
    maxUsage: 9999,
    features: ['بدون إعلانات', 'تشغيل في الخلفية', 'YouTube Music مجاناً'],
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: 'انتهت صلاحية الاشتراك - يحتاج تجديد'
  },
  {
    id: '5',
    orderId: '5',
    customerId: '1',
    customerEmail: 'ahmed.ali@email.com',
    productId: '5',
    productName: 'Office 365',
    productImage: '/api/placeholder/300/200',
    planType: 'ربع سنوي',
    price: 180.00,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 1 month ago
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Ends in 2 months (total 3 months)
    durationMonths: 3,
    status: 'active',
    autoRenewal: true,
    paymentStatus: 'paid',
    remainingDays: 60, // 60 days remaining (2 months)
    usageCount: 245,
    maxUsage: 9999,
    features: ['Word', 'Excel', 'PowerPoint', 'Teams', 'OneDrive 1TB'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    notes: 'اشتراك ربع سنوي نشط - تجديد تلقائي مفعل'
  }
];

// Get all chat conversations
export const getChatConversations = async (): Promise<ChatConversation[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return mockChatConversations;
  }

  try {
    const q = query(chatConversationsCollection, orderBy('lastMessageTime', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
      id: doc.id,
        ...data,
        lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        closedAt: data.closedAt?.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting chat conversations:', error);
    return mockChatConversations;
  }
};

// Subscribe to chat conversations real-time
export const subscribeToChatConversations = (
  callback: (conversations: ChatConversation[]) => void
): (() => void) => {
  if (!FIREBASE_ENABLED || !db) {
    callback(mockChatConversations);
    return () => {};
  }

  try {
    const q = query(chatConversationsCollection, orderBy('lastMessageTime', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const conversations = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
        id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          closedAt: data.closedAt?.toDate()
        };
      });
      callback(conversations);
    }, (error) => {
      console.error('Error in conversations subscription:', error);
      callback(mockChatConversations);
    });
  } catch (error) {
    console.error('Error subscribing to conversations:', error);
    callback(mockChatConversations);
    return () => {};
  }
};

export { productsCollection, messagesCollection, ordersCollection, customersCollection, subscriptionsCollection, chatConversationsCollection, chatMessagesCollection };

// ===============================
// Chat System - Mock Data & CRUD Operations
// ===============================

// Mock chat conversations
const mockChatConversations: ChatConversation[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'أحمد علي',
    customerEmail: 'ahmed.ali@email.com',
    supportAgentId: 'support-1',
    supportAgentName: 'سارة - فريق الدعم',
    status: 'active',
    priority: 'medium',
    category: 'billing',
    subject: 'استفسار عن الفاتورة',
    lastMessage: 'شكراً لك، سأراجع الموضوع وأعود إليك قريباً',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    tags: ['billing', 'subscription']
  }
];

// Mock chat messages
const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    conversationId: '1',
    content: 'أهلاً وسهلاً أحمد! 👋 كيف يمكنني مساعدتك اليوم؟',
    sender: 'support',
    senderName: 'سارة - فريق الدعم',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'read',
    type: 'text'
  },
  {
    id: '2',
    conversationId: '1',
    content: 'مرحباً، لدي استفسار عن فاتورة الاشتراك الشهري',
    sender: 'customer',
    senderName: 'أحمد علي',
    senderEmail: 'ahmed.ali@email.com',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000),
    status: 'read',
    type: 'text'
  },
  {
    id: '3',
    conversationId: '1',
    content: 'بالطبع! دعني أتحقق من تفاصيل اشتراكك. هل يمكنك إخباري برقم الطلب؟',
    sender: 'support',
    senderName: 'سارة - فريق الدعم',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000),
    status: 'read',
    type: 'text'
  }
];

// Get or create conversation for customer
export const getOrCreateConversation = async (customerEmail: string, customerName: string): Promise<string> => {
  if (!FIREBASE_ENABLED || !db) {
    // Check if conversation exists in mock data
    let conversation = mockChatConversations.find(c => c.customerEmail === customerEmail);
    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        customerId: customerEmail,
        customerName: customerName,
        customerEmail: customerEmail,
        status: 'active',
        priority: 'medium',
        lastMessage: '',
        lastMessageTime: new Date(),
        createdAt: new Date()
      };
      mockChatConversations.push(conversation);
    }
    return conversation.id;
  }

  try {
    // Check if conversation already exists
    const q = query(chatConversationsCollection, where('customerEmail', '==', customerEmail), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    // Create new conversation
    const conversationData: Omit<ChatConversation, 'id'> = {
      customerId: customerEmail,
      customerName: customerName,
      customerEmail: customerEmail,
      status: 'active',
      priority: 'medium',
      lastMessage: '',
      lastMessageTime: new Date(),
      createdAt: new Date()
    };

    // Filter out undefined values to prevent Firebase errors
    const filteredConversationData: Record<string, any> = {};
    Object.entries(conversationData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredConversationData[key] = value;
      }
    });

    const docRef = await addDoc(chatConversationsCollection, filteredConversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    throw error;
  }
};

// Send chat message
export const sendChatMessage = async (
  conversationId: string, 
  content: string, 
  sender: 'customer' | 'support',
  senderName?: string,
  senderEmail?: string
): Promise<ChatMessage> => {
  if (!FIREBASE_ENABLED || !db) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      conversationId,
      content,
      sender,
      senderName,
      senderEmail,
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    };
    mockChatMessages.push(message);
    return message;
  }

  try {
    const messageData: Omit<ChatMessage, 'id'> = {
      conversationId,
      content,
      sender,
      senderName,
      senderEmail,
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    };

    // Filter out undefined values to prevent Firebase errors
    const filteredMessageData: Record<string, any> = {};
    Object.entries(messageData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredMessageData[key] = value;
      }
    });

    // Only proceed if we have valid data
    if (Object.keys(filteredMessageData).length === 0) {
      throw new Error('No valid message data provided');
    }

    const docRef = await addDoc(chatMessagesCollection, filteredMessageData);
    
    // Update conversation last message - check if conversation exists first
    try {
      const conversationRef = doc(db, 'chatConversations', conversationId);
      
      // Check if the conversation document exists
      const conversationDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(conversationRef));
      
      if (conversationDoc.exists()) {
        await updateDoc(conversationRef, {
          lastMessage: content,
          lastMessageTime: new Date()
        });
      } else {
        console.warn(`⚠️ Conversation ${conversationId} not found in Firebase. Creating new conversation.`);
        
        // Create the conversation if it doesn't exist (for mock data compatibility)
        const newConversationData = {
          customerId: senderEmail || 'unknown',
          customerName: senderName || 'Unknown User',
          customerEmail: senderEmail || 'unknown@example.com',
          status: 'active' as const,
          priority: 'medium' as const,
          lastMessage: content,
          lastMessageTime: new Date(),
          createdAt: new Date()
        };
        
        // Filter undefined values
        const filteredConversationData: Record<string, any> = {};
        Object.entries(newConversationData).forEach(([key, value]) => {
          if (value !== undefined) {
            filteredConversationData[key] = value;
          }
        });
        
        await import('firebase/firestore').then(({ setDoc }) => 
          setDoc(conversationRef, filteredConversationData)
        );
      }
    } catch (conversationError) {
      console.error('Error updating conversation:', conversationError);
      // Don't throw error here, message was sent successfully
    }

    return {
      id: docRef.id,
      ...messageData
    } as ChatMessage;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

// Get chat messages for conversation
export const getChatMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return mockChatMessages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  try {
    // Try the compound query first (requires index)
    let q = query(
      chatMessagesCollection, 
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    let querySnapshot = await getDocs(q);
    
    let messages = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
      id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date()
      };
    });

    // Sort manually since we got the data
    messages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return messages;
    
  } catch (error: any) {
    // Check if it's an index error
    if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
      console.warn('🔥 Firebase Index Required for Chat Messages');
      console.warn('📋 Falling back to simple query without orderBy');
      console.warn('💡 To improve performance, create index: https://console.firebase.google.com/v1/r/project/wafarle-63a71/firestore/indexes');
      
      try {
        // Fallback to simple query without orderBy
        const q = query(chatMessagesCollection, where('conversationId', '==', conversationId));
        const querySnapshot = await getDocs(q);
        
        let messages = querySnapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
          id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date()
          };
        });

        // Sort manually in JavaScript
        messages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        return messages;
      } catch (fallbackError) {
        console.error('Error in fallback query:', fallbackError);
        throw fallbackError;
      }
    } else {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }
};

// Subscribe to chat messages real-time
export const subscribeToChatMessages = (
  conversationId: string, 
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  if (!FIREBASE_ENABLED || !db) {
    callback(mockChatMessages.filter(msg => msg.conversationId === conversationId));
    return () => {}; // Return empty unsubscribe function
  }

  // Helper function to process messages
  const processMessages = (querySnapshot: any) => {
    let messages = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as any),
      timestamp: (doc.data() as any).timestamp?.toDate() || new Date()
    }));

    // Sort manually to ensure correct order
    messages = messages.sort((a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime());
    callback(messages);
  };

  // Try compound query first (requires index)
  try {
    const q = query(
      chatMessagesCollection,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, processMessages, (error: any) => {
      // Handle index error in real-time subscription
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        console.warn('🔥 Firebase Index Required for Chat Messages Subscription');
        console.warn('📋 Falling back to simple query without orderBy for real-time updates');
        console.warn('💡 To improve performance, create index: https://console.firebase.google.com/v1/r/project/wafarle-63a71/firestore/indexes');
        
        // Create fallback subscription
        const fallbackQuery = query(chatMessagesCollection, where('conversationId', '==', conversationId));
        return onSnapshot(fallbackQuery, processMessages);
      } else {
        console.error('Error in chat messages subscription:', error);
        // Return empty messages on other errors
        callback([]);
      }
    });
  } catch (error) {
    console.error('Error creating chat messages subscription:', error);
    
    // Fallback to simple query subscription
    try {
      const fallbackQuery = query(chatMessagesCollection, where('conversationId', '==', conversationId));
      return onSnapshot(fallbackQuery, processMessages);
    } catch (fallbackError) {
      console.error('Error creating fallback subscription:', fallbackError);
      return () => {};
    }
  }
};

// Products CRUD Operations
export const getProducts = async (): Promise<Product[]> => {
  // Return mock data if Firebase is not enabled
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    return Promise.resolve(mockProducts);
  }

  try {
    const q = query(productsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const firestoreProducts = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }) as Product[];
    
    return firestoreProducts;
  } catch (error: any) {
    console.error('Error getting products:', error);
    
    if (error.code === 'permission-denied') {
    }
    
    return mockProducts;
  }
};

/**
 * جلب تفاصيل منتج واحد حسب المعرف من Firestore
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    // في حالة العمل بدون Firebase، يمكن استرجاع منتج تجريبي من قائمة وهمية
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

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    return Promise.resolve('mock-id-' + Date.now());
  }

  try {
    const docRef = await addDoc(productsCollection, {
      ...product,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    // Filter out undefined values to prevent Firebase errors
    const filteredProduct: Record<string, any> = {};
    Object.entries(product).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredProduct[key] = value;
      }
    });

    // Only update if we have valid fields
    if (Object.keys(filteredProduct).length === 0) {
      return;
    }

    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, filteredProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Messages CRUD Operations
export const getMessages = async (): Promise<ContactMessage[]> => {
  try {
    const q = query(messagesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
      id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }) as ContactMessage[];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const addMessage = async (message: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(messagesCollection, {
      ...message,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const deleteMessage = async (id: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', id);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    callback(mockProducts);
    return () => {}; // Return empty unsubscribe function
  }

  const q = query(productsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const products = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
      id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }) as Product[];
    callback(products);
  });
};

export const subscribeToMessages = (callback: (messages: ContactMessage[]) => void) => {
  const q = query(messagesCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
    })) as ContactMessage[];
    callback(messages);
  });
};

// Search functions
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const q = query(
      productsCollection,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
    })) as Product[];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(
      productsCollection,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
    })) as Product[];
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

// =====================================================
// ORDERS MANAGEMENT FUNCTIONS
// =====================================================

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    return Promise.resolve(mockOrders);
  }

  try {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const firestoreOrders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      confirmedAt: (doc.data() as any).confirmedAt?.toDate() || undefined,
      deliveredAt: (doc.data() as any).deliveredAt?.toDate() || undefined,
      shippedAt: (doc.data() as any).shippedAt?.toDate() || undefined,
      invoiceGeneratedAt: (doc.data() as any).invoiceGeneratedAt?.toDate() || undefined,
      invoiceSentAt: (doc.data() as any).invoiceSentAt?.toDate() || undefined,
    })) as Order[];
    return firestoreOrders;
  } catch (error: any) {
    console.error('Error getting orders:', error);
    return mockOrders;
  }
};

// Update product stock
export const updateProductStock = async (productId: string, quantityChange: number): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    return Promise.resolve();
  }

  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(productRef));
    
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }

    const productData = productDoc.data() as Product;
    
    // Only update stock if stock management is enabled
    if (productData.stockManagementEnabled && productData.productType === 'physical') {
      const currentStock = productData.stock || 0;
      const newStock = Math.max(0, currentStock + quantityChange);
      
      await updateDoc(productRef, {
        stock: newStock,
        outOfStock: newStock <= 0,
        updatedAt: serverTimestamp()
      });
      
      
      // Check for low stock warning
      if (newStock > 0 && newStock <= (productData.lowStockThreshold || 10)) {
        console.warn(`⚠️ Low stock warning for product ${productId}: ${newStock} units remaining`);
      }
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

// Check product stock availability
export const checkProductStock = async (productId: string, requestedQuantity: number): Promise<{
  available: boolean;
  currentStock: number;
  message?: string;
}> => {
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    return { available: true, currentStock: 999 };
  }

  try {
    const productRef = doc(db, 'products', productId);
    const productDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(productRef));
    
    if (!productDoc.exists()) {
      return { available: false, currentStock: 0, message: 'المنتج غير موجود' };
    }

    const productData = productDoc.data() as Product;
    
    // If stock management is not enabled, always available
    if (!productData.stockManagementEnabled || productData.productType !== 'physical') {
      return { available: true, currentStock: 999 };
    }

    const currentStock = productData.stock || 0;
    
    if (productData.outOfStock || currentStock <= 0) {
      return { 
        available: false, 
        currentStock: 0, 
        message: 'المنتج نفد من المخزون' 
      };
    }

    if (currentStock < requestedQuantity) {
      return { 
        available: false, 
        currentStock, 
        message: `المخزون المتاح: ${currentStock} وحدة فقط` 
      };
    }

    return { available: true, currentStock };
  } catch (error) {
    console.error('Error checking product stock:', error);
    return { available: false, currentStock: 0, message: 'حدث خطأ في التحقق من المخزون' };
  }
};

// Add new order
export const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    return Promise.resolve('mock-order-id-' + Date.now());
  }

  try {
    // Check stock availability for physical products
    if (order.productType === 'physical') {
      const stockCheck = await checkProductStock(order.productId, order.quantity || 1);
      
      if (!stockCheck.available) {
        throw new Error(stockCheck.message || 'المنتج غير متوفر في المخزون');
      }
    }

    // Filter out undefined values to prevent Firebase errors
    const cleanedOrder: Record<string, any> = {};
    Object.entries(order).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert Date objects to Firestore Timestamps
        if (value instanceof Date) {
          cleanedOrder[key] = value;
        } else {
          cleanedOrder[key] = value;
        }
      }
    });

    const docRef = await addDoc(ordersCollection, {
      ...cleanedOrder,
      createdAt: serverTimestamp(),
    });
    // Update product stock after order is created
    if (order.productType === 'physical') {
      const quantityToDeduct = -(order.quantity || 1);
      await updateProductStock(order.productId, quantityToDeduct);
    }

    // Send notification to admin about new order
    await sendNotificationToAdmin({
      title: 'طلب جديد',
      body: `طلب جديد من ${order.customerName}: ${order.productName}`,
      data: {
        orderId: docRef.id,
        type: 'new_order',
        customerEmail: order.customerEmail,
      },
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const orderRef = doc(db, 'orders', id);
    
    // Get the current order data first
    const orderDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(orderRef));
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    
    const currentOrder = orderDoc.data() as Order;
    
    // Add timestamp for status changes
    const timestampedUpdates: any = { ...updates };
    if (updates.status === 'confirmed' && !updates.confirmedAt) {
      timestampedUpdates.confirmedAt = serverTimestamp();
    }
    if (updates.status === 'completed' && !updates.deliveredAt) {
      timestampedUpdates.deliveredAt = serverTimestamp();
    }
    // Add timestamp for shipping status changes
    if (updates.shippingStatus === 'shipped' && !currentOrder.shippedAt) {
      timestampedUpdates.shippedAt = serverTimestamp();
    }
    if (updates.shippingStatus === 'delivered' && !currentOrder.deliveredAt && currentOrder.status !== 'completed') {
      timestampedUpdates.deliveredAt = serverTimestamp();
      // Auto-update order status to completed when delivered
      if (!updates.status) {
        timestampedUpdates.status = 'completed';
      }
    }

    // Filter out undefined values to prevent Firebase errors
    const filteredUpdates: Record<string, any> = {};
    Object.entries(timestampedUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    });

    // Only update if we have valid fields
    if (Object.keys(filteredUpdates).length === 0) {
      return;
    }
    
    await updateDoc(orderRef, filteredUpdates);
    // Check if order should be converted to subscription
    const finalOrder = { ...currentOrder, ...updates };
    await checkAndCreateSubscription(id, finalOrder);

    // Send notification to customer if order status changed
    if (updates.status && updates.status !== currentOrder.status) {
      const statusMessages: Record<string, { title: string; body: string }> = {
        confirmed: {
          title: 'تم تأكيد طلبك',
          body: `تم تأكيد طلبك رقم ${id} بنجاح`,
        },
        cancelled: {
          title: 'تم إلغاء طلبك',
          body: `تم إلغاء طلبك رقم ${id}`,
        },
        completed: {
          title: 'تم إكمال طلبك',
          body: `تم إكمال طلبك رقم ${id} بنجاح`,
        },
      };

      const message = statusMessages[updates.status];
      if (message) {
        await sendNotificationToCustomer(currentOrder.customerEmail, {
          title: message.title,
          body: message.body,
          data: {
            orderId: id,
            type: 'order_status_update',
            status: updates.status,
          },
        });
      }
    }

    // Send notification if shipping status changed
    if (updates.shippingStatus && updates.shippingStatus !== currentOrder.shippingStatus) {
      const shippingMessages: Record<string, { title: string; body: string }> = {
        shipped: {
          title: 'تم شحن طلبك',
          body: `تم شحن طلبك رقم ${id} ${updates.shippingTrackingNumber ? `رقم التتبع: ${updates.shippingTrackingNumber}` : ''}`,
        },
        delivered: {
          title: 'تم تسليم طلبك',
          body: `تم تسليم طلبك رقم ${id} بنجاح`,
        },
      };

      const message = shippingMessages[updates.shippingStatus];
      if (message) {
        await sendNotificationToCustomer(currentOrder.customerEmail, {
          title: message.title,
          body: message.body,
          data: {
            orderId: id,
            type: 'shipping_update',
            shippingStatus: updates.shippingStatus,
            trackingNumber: updates.shippingTrackingNumber || currentOrder.shippingTrackingNumber || '',
          },
        });
      }
    }
    
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Delete order and related subscription
export const deleteOrder = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    // In mock mode, also check for related subscriptions
    const relatedSubscription = mockSubscriptions.find(sub => sub.orderId === id);
    if (relatedSubscription) {
      // Remove from mock array (for demo purposes)
      const index = mockSubscriptions.findIndex(sub => sub.id === relatedSubscription.id);
      if (index > -1) {
        mockSubscriptions.splice(index, 1);
      }
    }
    
    return Promise.resolve();
  }

  try {
    // First check if there's a related subscription
    const subscriptions = await getSubscriptions();
    const relatedSubscription = subscriptions.find(sub => sub.orderId === id);
    
    if (relatedSubscription) {
      await deleteSubscription(relatedSubscription.id);
    }

    // Get order data before deleting for stats update
    const orderDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(doc(db, 'orders', id)));
    const orderData = orderDoc.exists() ? orderDoc.data() as Order : null;

    // Then delete the order
    const orderRef = doc(db, 'orders', id);
    await deleteDoc(orderRef);
    if (relatedSubscription) {
    }

    // Update customer stats after deletion (subtract the order amount)
    // This will automatically adjust loyalty points and tier
    if (orderData && orderData.customerEmail) {
      // Calculate points that were earned for this order
      const settings = await getWebsiteSettings();
      const loyaltyProgram = settings.website.loyaltyProgram;
      
      if (loyaltyProgram?.enabled && orderData.totalAmount) {
        const pointsEarned = await calculateLoyaltyPoints(orderData.totalAmount);
        if (pointsEarned > 0) {
          // Deduct the points that were earned for this order
          await redeemLoyaltyPoints(orderData.customerEmail, pointsEarned, 'Order cancelled - points deducted');
        }
      }
      
      // Update stats (negative amount will reduce totalSpent)
      await updateCustomerStats(orderData.customerEmail, -(orderData.totalAmount || 0));
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    return mockOrders.filter(order => order.status === status);
  }

  try {
    const q = query(
      ordersCollection,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      confirmedAt: (doc.data() as any).confirmedAt?.toDate() || undefined,
      deliveredAt: (doc.data() as any).deliveredAt?.toDate() || undefined,
      shippedAt: (doc.data() as any).shippedAt?.toDate() || undefined,
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by status:', error);
    return mockOrders.filter(order => order.status === status);
  }
};

// Get orders by payment status
export const getOrdersByPaymentStatus = async (paymentStatus: Order['paymentStatus']): Promise<Order[]> => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    return mockOrders.filter(order => order.paymentStatus === paymentStatus);
  }

  try {
    const q = query(
      ordersCollection,
      where('paymentStatus', '==', paymentStatus),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      confirmedAt: (doc.data() as any).confirmedAt?.toDate() || undefined,
      deliveredAt: (doc.data() as any).deliveredAt?.toDate() || undefined,
      shippedAt: (doc.data() as any).shippedAt?.toDate() || undefined,
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by payment status:', error);
    return mockOrders.filter(order => order.paymentStatus === paymentStatus);
  }
};

// Real-time orders subscription
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    callback(mockOrders);
    return () => {}; // Return empty unsubscribe function
  }

  const q = query(ordersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      confirmedAt: (doc.data() as any).confirmedAt?.toDate() || undefined,
      deliveredAt: (doc.data() as any).deliveredAt?.toDate() || undefined,
      shippedAt: (doc.data() as any).shippedAt?.toDate() || undefined,
      invoiceGeneratedAt: (doc.data() as any).invoiceGeneratedAt?.toDate() || undefined,
      invoiceSentAt: (doc.data() as any).invoiceSentAt?.toDate() || undefined,
    })) as Order[];
    callback(orders);
  });
};

// =====================================================
// CUSTOMERS MANAGEMENT FUNCTIONS
// =====================================================

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    return Promise.resolve(mockCustomers);
  }

  try {
    const q = query(customersCollection, orderBy('registrationDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const firestoreCustomers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      registrationDate: (doc.data() as any).registrationDate?.toDate() || new Date(),
      lastOrderDate: (doc.data() as any).lastOrderDate?.toDate() || undefined,
      dateOfBirth: (doc.data() as any).dateOfBirth?.toDate() || undefined,
    })) as Customer[];
    return firestoreCustomers;
  } catch (error: any) {
    console.error('Error getting customers:', error);
    return mockCustomers;
  }
};

// Add new customer
export const addCustomer = async (customer: Omit<Customer, 'id' | 'registrationDate' | 'totalOrders' | 'totalSpent' | 'averageOrderValue'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    return Promise.resolve('mock-customer-id-' + Date.now());
  }

  try {
    const docRef = await addDoc(customersCollection, {
      ...customer,
      registrationDate: serverTimestamp(),
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      // Set default loyalty values if not provided
      loyaltyPoints: customer.loyaltyPoints || 0,
      totalLoyaltyPointsEarned: customer.totalLoyaltyPointsEarned || 0,
      totalLoyaltyPointsRedeemed: customer.totalLoyaltyPointsRedeemed || 0,
      loyaltyTier: customer.loyaltyTier || 'bronze',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

// Update customer
export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    // Filter out undefined values to prevent Firebase errors
    const filteredUpdates: Record<string, any> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    });

    // Only update if we have valid fields
    if (Object.keys(filteredUpdates).length === 0) {
      return;
    }

    const customerRef = doc(db, 'customers', id);
    await updateDoc(customerRef, filteredUpdates);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// Delete customer
export const deleteCustomer = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const customerRef = doc(db, 'customers', id);
    await deleteDoc(customerRef);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Get customers by status
export const getCustomersByStatus = async (status: Customer['status']): Promise<Customer[]> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    return mockCustomers.filter(customer => customer.status === status);
  }

  try {
    const q = query(
      customersCollection,
      where('status', '==', status),
      orderBy('registrationDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      registrationDate: (doc.data() as any).registrationDate?.toDate() || new Date(),
      lastOrderDate: (doc.data() as any).lastOrderDate?.toDate() || undefined,
      dateOfBirth: (doc.data() as any).dateOfBirth?.toDate() || undefined,
    })) as Customer[];
  } catch (error) {
    console.error('Error getting customers by status:', error);
    return mockCustomers.filter(customer => customer.status === status);
  }
};

// Get top customers by spending
export const getTopCustomers = async (limit: number = 10): Promise<Customer[]> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    return mockCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }

  try {
    const q = query(
      customersCollection,
      orderBy('totalSpent', 'desc'),
      // Note: Firestore limit function would go here if available
    );
    const querySnapshot = await getDocs(q);
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      registrationDate: (doc.data() as any).registrationDate?.toDate() || new Date(),
      lastOrderDate: (doc.data() as any).lastOrderDate?.toDate() || undefined,
      dateOfBirth: (doc.data() as any).dateOfBirth?.toDate() || undefined,
    })) as Customer[];
    
    return customers.slice(0, limit);
  } catch (error) {
    console.error('Error getting top customers:', error);
    return mockCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }
};

// Search customers
export const searchCustomers = async (searchTerm: string): Promise<Customer[]> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    return mockCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
  }

  try {
    // Note: Firestore doesn't support full-text search natively
    // In a real app, you would use Algolia or implement compound queries
    const querySnapshot = await getDocs(customersCollection);
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      registrationDate: (doc.data() as any).registrationDate?.toDate() || new Date(),
      lastOrderDate: (doc.data() as any).lastOrderDate?.toDate() || undefined,
      dateOfBirth: (doc.data() as any).dateOfBirth?.toDate() || undefined,
    })) as Customer[];
    
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    return mockCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
  }
};

// Real-time customers subscription
export const subscribeToCustomers = (callback: (customers: Customer[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    callback(mockCustomers);
    return () => {}; // Return empty unsubscribe function
  }

  const q = query(customersCollection, orderBy('registrationDate', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      registrationDate: (doc.data() as any).registrationDate?.toDate() || new Date(),
      lastOrderDate: (doc.data() as any).lastOrderDate?.toDate() || undefined,
      dateOfBirth: (doc.data() as any).dateOfBirth?.toDate() || undefined,
    })) as Customer[];
    callback(customers);
  });
};

// ===============================
// Push Notifications Functions
// ===============================

/**
 * Send notification to admin
 */
export const sendNotificationToAdmin = async (notification: {
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> => {
  try {
    // In production, this would:
    // 1. Get all admin FCM tokens from database
    // 2. Send notification via Firebase Admin SDK
    
    // For now, we'll use the API route
    if (typeof window !== 'undefined') {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'admin',
          ...notification,
        }),
      });
    }
  } catch (error) {
    console.error('Error sending admin notification:', error);
    // Don't throw - notification failures shouldn't break the flow
  }
};

/**
 * Send notification to customer
 */
export const sendNotificationToCustomer = async (
  customerEmail: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
): Promise<void> => {
  try {
    if (!FIREBASE_ENABLED || !db) {
      return;
    }

    // Get customer's FCM token from database
    const tokensCollection = collection(db, 'fcm_tokens');
    const q = query(
      tokensCollection,
      where('userEmail', '==', customerEmail),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    // Send notification to all tokens for this customer
    const promises = querySnapshot.docs.map(async (tokenDoc) => {
      const tokenData = tokenDoc.data();
      if (typeof window !== 'undefined') {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'customer',
            token: tokenData.token,
            ...notification,
          }),
        });
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending customer notification:', error);
    // Don't throw - notification failures shouldn't break the flow
  }
};

// ===============================
// Loyalty Points Functions
// ===============================

/**
 * Calculate loyalty points earned for an order
 */
export const calculateLoyaltyPoints = async (orderAmount: number): Promise<number> => {
  try {
    const settings = await getWebsiteSettings();
    const loyaltyProgram = settings.website.loyaltyProgram;

    // If loyalty program is disabled, return 0
    if (!loyaltyProgram?.enabled) {
      return 0;
    }

    // Calculate points per dollar
    const pointsFromAmount = Math.floor(orderAmount * (loyaltyProgram.pointsPerDollar || 0));
    
    // Add fixed points per order
    const pointsPerOrder = loyaltyProgram.pointsPerOrder || 0;

    const totalPoints = pointsFromAmount + pointsPerOrder;
    return totalPoints;
  } catch (error) {
    console.error('Error calculating loyalty points:', error);
    return 0;
  }
};

/**
 * Determine loyalty tier based on total spent
 */
export const getLoyaltyTier = async (totalSpent: number): Promise<'bronze' | 'silver' | 'gold' | 'platinum'> => {
  try {
    const settings = await getWebsiteSettings();
    const loyaltyProgram = settings.website.loyaltyProgram;

    if (!loyaltyProgram?.enabled || !loyaltyProgram.tiers) {
      return 'bronze';
    }

    const { tiers } = loyaltyProgram;

    // Check tiers from highest to lowest
    if (totalSpent >= tiers.platinum.minSpent) {
      return 'platinum';
    } else if (totalSpent >= tiers.gold.minSpent) {
      return 'gold';
    } else if (totalSpent >= tiers.silver.minSpent) {
      return 'silver';
    } else {
      return 'bronze';
    }
  } catch (error) {
    console.error('Error determining loyalty tier:', error);
    return 'bronze';
  }
};

/**
 * Redeem (deduct) loyalty points from customer account
 */
export const redeemLoyaltyPoints = async (
  customerEmail: string,
  points: number,
  reason: string = 'Points redeemed'
): Promise<boolean> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    return false;
  }

  if (points <= 0) {
    return false;
  }

  try {
    // Find customer by email
    const q = query(customersCollection, where('email', '==', customerEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return false;
    }

    const customerDoc = querySnapshot.docs[0];
    const customerData = customerDoc.data() as Customer;
    
    const currentPoints = customerData.loyaltyPoints || 0;
    
    // Check if customer has enough points
    if (currentPoints < points) {
      return false;
    }

    const newPoints = currentPoints - points;
    const totalRedeemed = customerData.totalLoyaltyPointsRedeemed || 0;
    const newTotalRedeemed = totalRedeemed + points;
    
    await updateDoc(customerDoc.ref, {
      loyaltyPoints: newPoints,
      totalLoyaltyPointsRedeemed: newTotalRedeemed,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error redeeming loyalty points:', error);
    throw error;
  }
};

// Update customer stats (called when orders change)
export const updateCustomerStats = async (customerEmail: string, newOrderAmount: number): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    return Promise.resolve();
  }

  try {
    // Find customer by email
    const q = query(customersCollection, where('email', '==', customerEmail));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const customerDoc = querySnapshot.docs[0];
      const customerData = customerDoc.data() as Customer;
      
      const newTotalOrders = customerData.totalOrders + 1;
      const newTotalSpent = customerData.totalSpent + newOrderAmount;
      const newAverageOrderValue = newTotalSpent / newTotalOrders;
      
      // Get settings for loyalty program
      const settings = await getWebsiteSettings();
      const loyaltyProgram = settings.website.loyaltyProgram;

      const updates: Record<string, any> = {
        totalOrders: newTotalOrders,
        totalSpent: newTotalSpent,
        averageOrderValue: newAverageOrderValue,
        lastOrderDate: serverTimestamp()
      };

      // Calculate and add loyalty points if program is enabled
      if (loyaltyProgram?.enabled) {
        const pointsEarned = await calculateLoyaltyPoints(newOrderAmount);
        if (pointsEarned > 0) {
          const currentPoints = customerData.loyaltyPoints || 0;
          const totalEarned = customerData.totalLoyaltyPointsEarned || 0;
          updates.loyaltyPoints = currentPoints + pointsEarned;
          updates.totalLoyaltyPointsEarned = totalEarned + pointsEarned;
        }

        // Update loyalty tier
        const newTier = await getLoyaltyTier(newTotalSpent);
        const currentTier = customerData.loyaltyTier || 'bronze';
        if (newTier !== currentTier) {
          updates.loyaltyTier = newTier;
        }
      }
      
      await updateDoc(customerDoc.ref, updates);
    } else {
      // Create new customer if not exists
      const settings = await getWebsiteSettings();
      const loyaltyProgram = settings.website.loyaltyProgram;
      const pointsEarned = loyaltyProgram?.enabled ? await calculateLoyaltyPoints(newOrderAmount) : 0;
      
      await addCustomer({
        name: 'عميل جديد', // Default name, should be updated later
        email: customerEmail,
        phone: '', // Will be updated later
        status: 'active',
        lastOrderDate: new Date(),
        loyaltyPoints: pointsEarned,
        totalLoyaltyPointsEarned: pointsEarned,
        loyaltyTier: loyaltyProgram?.enabled ? await getLoyaltyTier(newOrderAmount) : 'bronze',
      });
    }
  } catch (error) {
    console.error('Error updating customer stats:', error);
  }
};

// ===============================
// Currency Settings Functions
// ===============================

// Get currency settings
export const getCurrencySettings = async (): Promise<CurrencySettings> => {
  if (!FIREBASE_ENABLED || !db) {
    return DEFAULT_CURRENCY_SETTINGS;
  }

  try {
    const settingsRef = doc(db, 'settings', 'currency');
    const settingsDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(settingsRef));
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        currentCurrency: data.currentCurrency || DEFAULT_CURRENCY_SETTINGS.currentCurrency,
        baseCurrency: data.baseCurrency || DEFAULT_CURRENCY_SETTINGS.baseCurrency,
        autoConvert: data.autoConvert ?? DEFAULT_CURRENCY_SETTINGS.autoConvert,
        showOriginalPrice: data.showOriginalPrice ?? DEFAULT_CURRENCY_SETTINGS.showOriginalPrice,
      };
    } else {
      // Create default settings if they don't exist
      await updateCurrencySettings(DEFAULT_CURRENCY_SETTINGS);
      return DEFAULT_CURRENCY_SETTINGS;
    }
  } catch (error) {
    console.error('Error getting currency settings:', error);
    return DEFAULT_CURRENCY_SETTINGS;
  }
};

// Update currency settings
export const updateCurrencySettings = async (settings: CurrencySettings): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const settingsRef = doc(db, 'settings', 'currency');
    await updateDoc(settingsRef, {
      currentCurrency: settings.currentCurrency,
      baseCurrency: settings.baseCurrency,
      autoConvert: settings.autoConvert,
      showOriginalPrice: settings.showOriginalPrice,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      // If document doesn't exist, create it
      const { setDoc } = await import('firebase/firestore');
      await setDoc(settingsRef, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    throw error;
  }
};

// Subscribe to currency settings changes
export const subscribeToCurrencySettings = (callback: (settings: CurrencySettings) => void) => {
  if (!FIREBASE_ENABLED || !db) {
    callback(DEFAULT_CURRENCY_SETTINGS);
    return () => {}; // Return empty unsubscribe function
  }

  const settingsRef = doc(db, 'settings', 'currency');
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const settings: CurrencySettings = {
        currentCurrency: data.currentCurrency || DEFAULT_CURRENCY_SETTINGS.currentCurrency,
        baseCurrency: data.baseCurrency || DEFAULT_CURRENCY_SETTINGS.baseCurrency,
        autoConvert: data.autoConvert ?? DEFAULT_CURRENCY_SETTINGS.autoConvert,
        showOriginalPrice: data.showOriginalPrice ?? DEFAULT_CURRENCY_SETTINGS.showOriginalPrice,
      };
      callback(settings);
    } else {
      callback(DEFAULT_CURRENCY_SETTINGS);
    }
  });
};

// ===============================
// Order to Subscription Conversion
// ===============================

// Check if order should be converted to subscription
// const checkAndCreateSubscription = async (orderId: string, order: Order): Promise<void> => {
//   try {
//     // Check if order qualifies for subscription creation
//     const shouldCreateSubscription = 
//       order.status === 'confirmed' && 
//       order.paymentStatus === 'paid' &&
//       !order.subscriptionStartDate; // Don't create duplicate subscriptions

//     if (!shouldCreateSubscription) {
//       return;
//     }

//     //     // Get product details to determine subscription duration
//     const products = await getProducts();
//     const product = products.find(p => p.id === order.productId);
    
//     if (!product) {
//       console.error('Product not found for order:', orderId);
//       return;
//     }

//     // Calculate subscription details
//     let durationMonths = 1; // Default to 1 month
//     let planType = 'شهري';
//     let subscriptionPrice = order.totalAmount;

//     // Check if order has product options (subscription plans)
//     if (order.notes && order.notes.includes('خطة:')) {
//       const planMatch = order.notes.match(/خطة:\s*(.+?)(?:\s|$|,)/);
//       if (planMatch) {
//         planType = planMatch[1].trim();
        
//         // Determine duration based on plan type
//         switch (planType.toLowerCase()) {
//           case 'شهري':
//           case 'monthly':
//             durationMonths = 1;
//             break;
//           case 'ربع سنوي':
//           case 'quarterly':
//             durationMonths = 3;
//             break;
//           case 'نصف سنوي':
//           case 'semi-annual':
//             durationMonths = 6;
//             break;
//           case 'سنوي':
//           case 'annual':
//             durationMonths = 12;
//             break;
//           default:
//             // Try to extract number from plan type
//             const durationMatch = planType.match(/(\d+)/);
//             if (durationMatch) {
//               durationMonths = parseInt(durationMatch[1]);
//             }
//         }
//       }
//     }

//     // Calculate start and end dates more accurately
//     const startDate = new Date();
//     const endDate = new Date();
    
//     // Add months more accurately considering different month lengths
//     for (let i = 0; i < durationMonths; i++) {
//       endDate.setMonth(endDate.getMonth() + 1);
//       // Handle edge case where the day doesn't exist in the new month
//       // e.g., Jan 31 -> Feb 28/29
//       if (endDate.getDate() !== startDate.getDate()) {
//         endDate.setDate(0); // Go to last day of previous month
//       }
//     }

//     // Calculate remaining days more precisely
//     const remainingDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

//     // Create subscription object
//     const subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
//       orderId: orderId,
//       customerId: order.customerEmail, // Using email as customer ID for now
//       customerEmail: order.customerEmail,
//       productId: order.productId,
//       productName: order.productName,
//       productImage: product.image,
//       planType: planType,
//       price: subscriptionPrice,
//       startDate: startDate,
//       endDate: endDate,
//       durationMonths: durationMonths,
//       status: 'active',
//       autoRenewal: false, // Default to manual renewal
//       paymentStatus: 'paid',
//       remainingDays: remainingDays,
//       usageCount: 0,
//       maxUsage: 9999,
//       features: product.features || [],
//       notes: `تم إنشاؤه تلقائياً من الطلب ${orderId}`
//     };

//     // Create the subscription
//     const subscriptionId = await addSubscription(subscription);

//     // Update the order with subscription details
//     if (FIREBASE_ENABLED && db) {
//       const orderRef = doc(db, 'orders', orderId);
//       await updateDoc(orderRef, {
//         subscriptionStartDate: startDate,
//         subscriptionEndDate: endDate,
//         subscriptionDurationMonths: durationMonths,
//         subscriptionStatus: 'active',
//         autoRenewal: false,
//         notes: order.notes ? 
//           `${order.notes} | اشتراك نشط: ${subscriptionId}` : 
//           `اشتراك نشط: ${subscriptionId}`
//       });
//     }

//     //     });

//     // Update customer stats
//     await updateCustomerStats(order.customerEmail, order.totalAmount || 0);

//   } catch (error) {
//     console.error('Error creating subscription from order:', error);
//     // Don't throw error to avoid breaking order update
//   }
// };

const checkAndCreateSubscription = async (orderId: string, order: Order): Promise<void> => {
  try {
    // الشرط: الطلب مؤكد ومدفوع
    const eligible = order.status === 'confirmed' && order.paymentStatus === 'paid';
    if (!eligible) return;
    // 1) احصل على تفاصيل المنتج (كما في كودك الأصلي)
    const products = await getProducts();
    const product = products.find(p => p.id === order.productId);
    if (!product) {
      console.error('Product not found for order:', orderId);
      return;
    }

    // 2) التحقق من نوع المنتج: المنتجات الملموسة أو التي تحتاج تنزيل لا تتحول إلى اشتراكات
    const productType = product.productType || order.productType;
    if (productType === 'physical' || productType === 'download') {
      return;
    }

    // 3) احسب تفاصيل الخطة والمدة
    let durationMonths = order.quantity;
    let planType =  order.quantity;
    let subscriptionPrice = order.totalAmount;

    // if (order.notes && order.notes.includes('خطة:')) {
    //   const planMatch = order.notes.match(/خطة:\s*(.+?)(?:\s|$|,)/);
    //   if (planMatch) {
    //     planType = planMatch[1].trim();
    //     switch (planType.toLowerCase()) {
    //       case 'شهري':
    //       case 'monthly':
    //         durationMonths = 1; break;
    //       case 'ربع سنوي':
    //       case 'quarterly':
    //         durationMonths = 3; break;
    //       case 'نصف سنوي':
    //       case 'semi-annual':
    //         durationMonths = 6; break;
    //       case 'سنوي':
    //       case 'annual':
    //         durationMonths = 12; break;
    //       default: {
    //         const m = planType.match(/(\d+)/);
    //         if (m) durationMonths = parseInt(m[1], 10);
    //       }
    //     }
    //   }
    // }

    // 3) تواريخ البداية والنهاية
    const startDate = new Date();
    const endDate = new Date();
    for (let i = 0; i < durationMonths; i++) {
      const originalDay = startDate.getDate();
      endDate.setMonth(endDate.getMonth() + 1);
      if (endDate.getDate() !== originalDay) endDate.setDate(0);
    }
    const remainingDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // 4) ابحث إن كان هناك اشتراك موجود لنفس orderId (قديم بمعرف عشوائي)
    if (!FIREBASE_ENABLED || !db) return;

    const subsCol = collection(db, 'subscriptions');
    const existingQ = query(subsCol, where('orderId', '==', orderId), limit(1));
    const existingSnap = await getDocs(existingQ);

    // لو موجود، استخدم نفس المستند؛ وإلا استخدم معرف ثابت = orderId
    const subRef = existingSnap.empty
      ? doc(db, 'subscriptions', orderId)
      : doc(db, 'subscriptions', existingSnap.docs[0].id);

    const orderRef = doc(db, 'orders', orderId);

    // 5) Transaction تضمن عدم التكرار في حالات السباق
    await runTransaction(db, async (tx) => {
      const subSnap = await tx.get(subRef);

      // البيانات التي نحدّثها/ننشيها
      const baseData = {
        orderId,
        customerId: order.customerEmail,
        customerEmail: order.customerEmail,
        productId: order.productId,
        productName: order.productName,
        productImage: product.image,
        planType,
        price: subscriptionPrice,
        startDate,
        endDate,
        durationMonths,
        status: 'active' as const,
        autoRenewal: false,
        paymentStatus: 'paid' as const,
        remainingDays,
        usageCount: subSnap.exists() ? (subSnap.data().usageCount ?? 0) : 0,
        maxUsage: subSnap.exists() ? (subSnap.data().maxUsage ?? 9999) : 9999,
        features: product.features || [],
        notes: `تم إنشاؤه/تحديثه تلقائيًا من الطلب ${orderId}`,
        updatedAt: serverTimestamp(),
      };

      if (subSnap.exists()) {
        // تحديث الاشتراك الحالي
        tx.update(subRef, baseData);
      } else {
        // إنشاء اشتراك جديد بمعرف حتمي
        tx.set(subRef, { ...baseData, createdAt: serverTimestamp() });
      }

      // حدّث الطلب بعلم الاشتراك ومعرّفه وتواريخه
      tx.update(orderRef, {
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionDurationMonths: durationMonths,
        subscriptionStatus: 'active',
        autoRenewal: false,
        subscriptionId: subRef.id,
        subscriptionCreated: true,
        notes: order.notes && !String(order.notes).includes('اشتراك نشط:')
          ? `${order.notes} | اشتراك نشط: ${subRef.id}`
          : (order.notes ?? `اشتراك نشط: ${subRef.id}`),
        updatedAt: serverTimestamp(),
      });
    });

    // 6) إحصائيات العميل (خارج الترانزاكشن)
    await updateCustomerStats(order.customerEmail, order.totalAmount || 0);

  } catch (error) {
    console.error('Error upserting subscription from order:', error);
    // لا نرمي الخطأ حتى لا نكسر عملية تحديث الطلب
  }
};

// Create subscription manually from order (for admin)
export const createSubscriptionFromOrder = async (orderId: string): Promise<string | null> => {
  try {
    const orders = await getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Force creation by temporarily modifying order
    const modifiedOrder = {
      ...order,
      status: 'confirmed' as const,
      paymentStatus: 'paid' as const,
      subscriptionStartDate: undefined
    };

    await checkAndCreateSubscription(orderId, modifiedOrder);
    return orderId;
  } catch (error) {
    console.error('Error creating manual subscription:', error);
    throw error;
  }
};

// ===============================
// Subscriptions CRUD Operations
// ===============================

// Get all subscriptions
export const getSubscriptions = async (): Promise<Subscription[]> => {
  if (!FIREBASE_ENABLED || !db || !subscriptionsCollection) {
    return Promise.resolve(mockSubscriptions);
  }

  try {
    const q = query(subscriptionsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const subscriptions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      startDate: (doc.data() as any).startDate?.toDate(),
      endDate: (doc.data() as any).endDate?.toDate(),
      createdAt: (doc.data() as any).createdAt?.toDate(),
      updatedAt: (doc.data() as any).updatedAt?.toDate(),
    }));
    return subscriptions;
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

// Get customer subscriptions
export const getCustomerSubscriptions = async (customerEmail: string): Promise<Subscription[]> => {
  if (!FIREBASE_ENABLED || !db || !subscriptionsCollection) {
    const customerSubs = mockSubscriptions.filter(sub => 
      sub.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    // Update remaining days for mock data with accurate calculation
    return customerSubs.map(sub => {
      const now = new Date();
      const remainingDays = Math.ceil((sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Math.ceil((sub.endDate.getTime() - sub.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...sub,
        remainingDays: remainingDays,
        // Also calculate usage percentage
        usagePercentage: totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - remainingDays) / totalDays) * 100)) : 0
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by created date desc
  }

  try {
    // Try the compound query first (requires index)
    let q = query(
      subscriptionsCollection,
      where('customerEmail', '==', customerEmail),
      orderBy('createdAt', 'desc')
    );
    
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (indexError: any) {
      // If index is missing, fall back to simpler query without orderBy
      q = query(subscriptionsCollection, where('customerEmail', '==', customerEmail));
      querySnapshot = await getDocs(q);
    }

    let subscriptions = querySnapshot.docs.map(doc => {
      const startDate = (doc.data() as any).startDate?.toDate();
      const endDate = (doc.data() as any).endDate?.toDate();
      const now = new Date();
      
      const remainingDays = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const totalDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const usagePercentage = totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - remainingDays) / totalDays) * 100)) : 0;
      
      return {
        id: doc.id,
        ...(doc.data() as any),
        startDate: startDate,
        endDate: endDate,
        createdAt: (doc.data() as any).createdAt?.toDate(),
        updatedAt: (doc.data() as any).updatedAt?.toDate(),
        remainingDays: remainingDays,
        usagePercentage: usagePercentage
      };
    });

    // Sort manually if we couldn't use orderBy in query
    subscriptions = subscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return subscriptions;
  } catch (error) {
    console.error('Error getting customer subscriptions:', error);
    // Return mock data as fallback
    const customerSubs = mockSubscriptions.filter(sub => 
      sub.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    return customerSubs.map(sub => ({
      ...sub,
      remainingDays: Math.ceil((sub.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
};

// Get active subscriptions
export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  const allSubscriptions = await getSubscriptions();
  return allSubscriptions.filter(sub => sub.status === 'active');
};

// Get expired subscriptions
export const getExpiredSubscriptions = async (): Promise<Subscription[]> => {
  const allSubscriptions = await getSubscriptions();
  return allSubscriptions.filter(sub => sub.status === 'expired');
};

// Add new subscription
export const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !subscriptionsCollection) {
    return Promise.resolve('mock-subscription-id');
  }

  try {
    const docRef = await addDoc(subscriptionsCollection, {
      ...subscription,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

// Update subscription
export const updateSubscription = async (id: string, updates: Partial<Subscription>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const subscriptionRef = doc(db, 'subscriptions', id);
    
    // Filter out undefined values to prevent Firebase errors
    const filteredUpdates: Record<string, any> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    });

    // Add timestamp
    filteredUpdates.updatedAt = serverTimestamp();

    // Only update if we have valid fields
    if (Object.keys(filteredUpdates).length > 1) { // > 1 because updatedAt is always added
      await updateDoc(subscriptionRef, filteredUpdates);
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (id: string, reason?: string): Promise<void> => {
  await updateSubscription(id, {
    status: 'cancelled',
    autoRenewal: false,
    notes: reason ? `ملغي: ${reason}` : 'تم إلغاء الاشتراك'
  });
};

// Renew subscription
export const renewSubscription = async (id: string, newEndDate: Date): Promise<void> => {
  const remainingDays = Math.ceil((newEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  await updateSubscription(id, {
    status: 'active',
    endDate: newEndDate,
    remainingDays: remainingDays,
    paymentStatus: 'paid'
  });
};

// Pause subscription
export const pauseSubscription = async (id: string): Promise<void> => {
  await updateSubscription(id, {
    status: 'paused'
  });
};

// Resume subscription
export const resumeSubscription = async (id: string): Promise<void> => {
  await updateSubscription(id, {
    status: 'active'
  });
};

// Delete subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const subscriptionRef = doc(db, 'subscriptions', id);
    await deleteDoc(subscriptionRef);
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// Subscribe to subscriptions changes
export const subscribeToSubscriptions = (callback: (subscriptions: Subscription[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !subscriptionsCollection) {
    callback(mockSubscriptions);
    return () => {}; // Return empty unsubscribe function
  }

  const q = query(subscriptionsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const subscriptions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      startDate: (doc.data() as any).startDate?.toDate(),
      endDate: (doc.data() as any).endDate?.toDate(),
      createdAt: (doc.data() as any).createdAt?.toDate(),
      updatedAt: (doc.data() as any).updatedAt?.toDate(),
      remainingDays: Math.ceil(((doc.data() as any).endDate?.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }));
    callback(subscriptions);
  });
};

// Subscribe to customer subscriptions changes
export const subscribeToCustomerSubscriptions = (
  customerEmail: string,
  callback: (subscriptions: Subscription[]) => void
) => {
  if (!FIREBASE_ENABLED || !db || !subscriptionsCollection) {
    const customerSubs = mockSubscriptions.filter(sub => 
      sub.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    // تصفية الاشتراكات: إزالة المنتجات الملموسة أو التي تحتاج تنزيل
    const filteredSubs = customerSubs.filter(sub => {
      const product = mockProducts.find(p => p.id === sub.productId);
      if (!product) return true; // إذا لم نجد المنتج، نعرضه (قديم)
      const productType = product.productType;
      return productType !== 'physical' && productType !== 'download';
    });
    callback(filteredSubs.map(sub => ({
      ...sub,
      remainingDays: Math.ceil((sub.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    return () => {}; // Return empty unsubscribe function
  }

  // Try compound query first, fallback to simple query if index missing
  let q = query(
    subscriptionsCollection,
    where('customerEmail', '==', customerEmail)
  );

  // Try to add orderBy, but handle index error gracefully
  try {
    q = query(
      subscriptionsCollection,
      where('customerEmail', '==', customerEmail),
      orderBy('createdAt', 'desc')
    );
  } catch (error) {
  }
  
  return onSnapshot(q, async (snapshot) => {
    let subscriptions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      startDate: (doc.data() as any).startDate?.toDate(),
      endDate: (doc.data() as any).endDate?.toDate(),
      createdAt: (doc.data() as any).createdAt?.toDate(),
      updatedAt: (doc.data() as any).updatedAt?.toDate(),
      remainingDays: Math.ceil(((doc.data() as any).endDate?.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }));
    
    // Sort manually to ensure consistent ordering
    subscriptions = subscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // تصفية الاشتراكات: إزالة المنتجات الملموسة أو التي تحتاج تنزيل
    const products = await getProducts();
    const filteredSubscriptions = subscriptions.filter(subscription => {
      const product = products.find(p => p.id === subscription.productId);
      if (!product) return true; // إذا لم نجد المنتج، نعرضه (قديم)
      const productType = product.productType;
      return productType !== 'physical' && productType !== 'download';
    });
    
    callback(filteredSubscriptions);
  }, (error) => {
    console.error('Error in subscription listener:', error);
    // Fallback to mock data on error
    const customerSubs = mockSubscriptions.filter(sub => 
      sub.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    // تصفية الاشتراكات: إزالة المنتجات الملموسة أو التي تحتاج تنزيل
    const filteredSubs = customerSubs.filter(sub => {
      const product = mockProducts.find(p => p.id === sub.productId);
      if (!product) return true; // إذا لم نجد المنتج، نعرضه (قديم)
      const productType = product.productType;
      return productType !== 'physical' && productType !== 'download';
    });
    callback(filteredSubs.map(sub => ({
      ...sub,
      remainingDays: Math.ceil((sub.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  });
};

// Utility functions for subscriptions
export const calculateRemainingDays = (endDate: Date): number => {
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isSubscriptionExpiringSoon = (subscription: Subscription, daysThreshold: number = 7): boolean => {
  return subscription.remainingDays <= daysThreshold && subscription.remainingDays > 0;
};

export const getSubscriptionStatusColor = (status: Subscription['status']): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'paused':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getSubscriptionStatusLabel = (status: Subscription['status']): string => {
  switch (status) {
    case 'active':
      return 'نشط';
    case 'expired':
      return 'منتهي الصلاحية';
    case 'cancelled':
      return 'ملغي';
    case 'pending':
      return 'معلق';
    case 'paused':
      return 'مؤقت';
    default:
      return 'غير محدد';
  }
};

// ===============================
// Website Settings Management
// ===============================

export interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  currency: string;
  language: string;
  timezone: string;
  maintenanceMode: boolean;
  logo?: string;
  favicon?: string;
  // Store Customization Settings
  storeType?: string; // نوع المتجر: 'clothing', 'shoes', 'electronics', 'general', etc.
  customization?: {
    // Color Theme
    theme: {
      primaryColor: string; // اللون الأساسي
      secondaryColor: string; // اللون الثانوي
      accentColor: string; // لون التمييز
      backgroundColor: string; // لون الخلفية
      textColor: string; // لون النص
      borderColor: string; // لون الحدود
      successColor: string; // لون النجاح
      warningColor: string; // لون التحذير
      errorColor: string; // لون الخطأ
    };
    // Typography
    typography: {
      fontFamily: string; // نوع الخط
      headingFont: string; // خط العناوين
      bodyFont: string; // خط النص
    };
    // Layout
    layout: {
      headerStyle: 'default' | 'minimal' | 'bold'; // أسلوب الهيدر
      footerStyle: 'default' | 'minimal' | 'detailed'; // أسلوب الفوتر
      productCardStyle: 'default' | 'modern' | 'classic'; // أسلوب بطاقة المنتج
      borderRadius: 'none' | 'small' | 'medium' | 'large'; // حجم الانحناء
    };
    // Product Display Options
    productOptions: {
      showColors: boolean; // إظهار اختيار الألوان
      showSizes: boolean; // إظهار اختيار المقاسات
      showQuantity: boolean; // إظهار محدد الكمية
      defaultColors?: string[]; // الألوان الافتراضية
      defaultSizes?: string[]; // المقاسات الافتراضية
    };
    // Custom Categories
    categories?: {
      id: string;
      name: string;
      nameEn?: string;
      icon?: string;
      description?: string;
      isActive: boolean;
      order: number;
    }[];
  };
  // Payment Gateways
  paymentGateways?: {
    paypal: {
      enabled: boolean;
      clientId?: string;
      secretKey?: string;
      mode: 'sandbox' | 'live';
    };
    stripe: {
      enabled: boolean;
      publishableKey?: string;
      secretKey?: string;
      mode: 'test' | 'live';
    };
    moyasar: {
      enabled: boolean;
      publishableKey?: string;
      secretKey?: string;
      mode: 'test' | 'live';
    };
  };
  // Email Notifications
  emailNotifications?: {
    newOrder: boolean;
    orderConfirmed: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    orderCancelled: boolean;
    paymentReceived: boolean;
    refundProcessed: boolean;
    returnRequested: boolean;
    returnApproved: boolean;
  };
  // Loyalty Program
  loyaltyProgram?: {
    enabled: boolean;
    pointsPerDollar: number; // نقاط لكل دولار
    pointsPerOrder: number; // نقاط إضافية لكل طلب
    redemptionRate: number; // قيمة النقطة بالدولار (مثال: 100 نقطة = 1 دولار)
    tiers: {
      bronze: { minSpent: number; discount: number };
      silver: { minSpent: number; discount: number };
      gold: { minSpent: number; discount: number };
      platinum: { minSpent: number; discount: number };
    };
  };
  // Returns and Refunds
  returnPolicy?: {
    enabled: boolean;
    returnPeriodDays: number; // فترة السماح بالإرجاع (أيام)
    refundMethod: 'original' | 'store_credit' | 'both';
    requireReason: boolean;
    autoApprove: boolean; // الموافقة التلقائية على الإرجاع
  };
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    snapchat: string;
    telegram: string;
  };
  reviewInvite: {
    enabled: boolean;
    discountCode: string;
    discountPercentage: number;
  };
  // Email Service Settings
  emailService?: {
    provider: 'resend' | 'sendgrid' | 'ses' | 'nodemailer' | 'none';
    apiKey?: string;
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    enabled: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterSite: string;
    twitterCreator: string;
    canonicalUrl: string;
    robotsIndex: boolean;
    robotsFollow: boolean;
    structuredData: {
      organization: {
        name: string;
        url: string;
        logo: string;
        description: string;
        contactPoint: {
          telephone: string;
          contactType: string;
          email: string;
        };
        sameAs: string[];
      };
      website: {
        name: string;
        url: string;
        description: string;
        potentialAction: {
          target: string;
          queryInput: string;
        };
      };
    };
  };
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAttempts: number;
  sessionTimeout: number;
  passwordExpiry: number;
  ipWhitelist: boolean;
  auditLog: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newOrderNotifications: boolean;
  paymentNotifications: boolean;
  errorNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export interface SystemSettings {
  autoBackup: boolean;
  backupFrequency: string;
  logRetention: number;
  cacheEnabled: boolean;
  compressionEnabled: boolean;
  debugMode: boolean;
  apiRateLimit: number;
}

export interface AnalyticsSettings {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
  };
  microsoftClarity: {
    enabled: boolean;
    projectId: string;
  };
  facebookPixel: {
    enabled: boolean;
    pixelId: string;
  };
  googleSearchConsole: {
    enabled: boolean;
    verificationCode: string;
  };
  googleTagManager: {
    enabled: boolean;
    containerId: string;
  };
}

export interface AllSettings {
  website: WebsiteSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  system: SystemSettings;
  analytics: AnalyticsSettings;
  updatedAt: Date;
  updatedBy: string;
}

// Default settings
export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  siteName: 'وافرلي - wafarle',
  siteDescription: 'منصة الاشتراكات الرقمية المتميزة',
  contactEmail: 'support@wafarle.com',
  contactPhone: '0593607607',
  currency: 'SAR',
  language: 'ar',
  timezone: 'Asia/Riyadh',
  maintenanceMode: false,
  storeType: 'general',
  customization: {
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#e5e7eb',
      successColor: '#10b981',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
    },
    typography: {
      fontFamily: 'Cairo, sans-serif',
      headingFont: 'Cairo, sans-serif',
      bodyFont: 'Cairo, sans-serif',
    },
    layout: {
      headerStyle: 'default',
      footerStyle: 'default',
      productCardStyle: 'default',
      borderRadius: 'medium',
    },
    productOptions: {
      showColors: true,
      showSizes: true,
      showQuantity: true,
      defaultColors: ['#84cc16', '#14b8a6', '#1e40af'],
      defaultSizes: ['صغير', 'متوسط', 'كبير', 'كبير جداً'],
    },
    categories: [],
  },
  // Payment Gateways
  paymentGateways: {
    paypal: {
      enabled: false,
      clientId: '',
      secretKey: '',
      mode: 'sandbox'
    },
    stripe: {
      enabled: false,
      publishableKey: '',
      secretKey: '',
      mode: 'test'
    },
    moyasar: {
      enabled: false,
      publishableKey: '',
      secretKey: '',
      mode: 'test'
    }
  },
  // Email Notifications
  emailNotifications: {
    newOrder: true,
    orderConfirmed: true,
    orderShipped: true,
    orderDelivered: true,
    orderCancelled: true,
    paymentReceived: true,
    refundProcessed: true,
    returnRequested: true,
    returnApproved: true
  },
  // Loyalty Program
  loyaltyProgram: {
    enabled: false,
    pointsPerDollar: 1, // نقطة واحدة لكل دولار
    pointsPerOrder: 10, // 10 نقاط إضافية لكل طلب
    redemptionRate: 100, // 100 نقطة = 1 دولار
    tiers: {
      bronze: { minSpent: 0, discount: 0 },
      silver: { minSpent: 500, discount: 5 },
      gold: { minSpent: 2000, discount: 10 },
      platinum: { minSpent: 5000, discount: 15 }
    }
  },
  // Returns and Refunds
  returnPolicy: {
    enabled: true,
    returnPeriodDays: 14, // 14 يوم للإرجاع
    refundMethod: 'original',
    requireReason: true,
    autoApprove: false
  },
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    snapchat: '',
    telegram: ''
  },
  reviewInvite: {
    enabled: true,
    discountCode: 'REVIEW10',
    discountPercentage: 10
  },
  // Email Service Settings
  emailService: {
    provider: 'resend',
    apiKey: '',
    fromEmail: 'noreply@wafarle.com',
    fromName: 'وافرلي - wafarle',
    replyTo: 'support@wafarle.com',
    enabled: false
  },
  seo: {
    metaTitle: 'وافرلي - أفضل عروض الاشتراكات الرقمية',
    metaDescription: 'وفر على اشتراكاتك المفضلة مع وافرلي. احصل على أفضل العروض لـ Netflix، Spotify، Shahid، والمزيد من الخدمات الرقمية.',
    metaKeywords: 'اشتراكات رقمية، Netflix، Spotify، Shahid، توفير، عروض، اشتراكات، خدمات رقمية',
    ogTitle: 'وافرلي - أفضل عروض الاشتراكات الرقمية',
    ogDescription: 'وفر على اشتراكاتك المفضلة مع وافرلي. احصل على أفضل العروض لـ Netflix، Spotify، Shahid، والمزيد.',
    ogImage: '/images/og-image.jpg',
    twitterCard: 'summary_large_image',
    twitterSite: '@wafarle',
    twitterCreator: '@wafarle',
    canonicalUrl: 'https://wafarle.com',
    robotsIndex: true,
    robotsFollow: true,
    structuredData: {
      organization: {
        name: 'وافرلي',
        url: 'https://wafarle.com',
        logo: 'https://wafarle.com/images/logo.png',
        description: 'منصة الاشتراكات الرقمية المتميزة',
        contactPoint: {
          telephone: '+966593607607',
          contactType: 'customer service',
          email: 'support@wafarle.com'
        },
        sameAs: []
      },
      website: {
        name: 'وافرلي',
        url: 'https://wafarle.com',
        description: 'منصة الاشتراكات الرقمية المتميزة',
        potentialAction: {
          target: 'https://wafarle.com/search?q={search_term_string}',
          queryInput: 'required name=search_term_string'
        }
      }
    }
  }
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorAuth: false,
  loginAttempts: 5,
  sessionTimeout: 30,
  passwordExpiry: 90,
  ipWhitelist: false,
  auditLog: true
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  newOrderNotifications: true,
  paymentNotifications: true,
  errorNotifications: true,
  weeklyReports: true,
  monthlyReports: true
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  autoBackup: true,
  backupFrequency: 'daily',
  logRetention: 30,
  cacheEnabled: true,
  compressionEnabled: true,
  debugMode: false,
  apiRateLimit: 1000
};

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  googleAnalytics: {
    enabled: false,
    measurementId: ''
  },
  microsoftClarity: {
    enabled: false,
    projectId: ''
  },
  facebookPixel: {
    enabled: false,
    pixelId: ''
  },
  googleSearchConsole: {
    enabled: false,
    verificationCode: ''
  },
  googleTagManager: {
    enabled: false,
    containerId: ''
  }
};

// Get website settings
export const getWebsiteSettings = async (): Promise<AllSettings> => {
  if (!FIREBASE_ENABLED || !db) {
    return {
      website: DEFAULT_WEBSITE_SETTINGS,
      security: DEFAULT_SECURITY_SETTINGS,
      notifications: DEFAULT_NOTIFICATION_SETTINGS,
      system: DEFAULT_SYSTEM_SETTINGS,
      analytics: DEFAULT_ANALYTICS_SETTINGS,
      updatedAt: new Date(),
      updatedBy: 'system'
    };
  }

  try {
    const settingsRef = doc(db, 'settings', 'website');
    const settingsDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(settingsRef));
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      return {
        website: { ...DEFAULT_WEBSITE_SETTINGS, ...data.website },
        security: { ...DEFAULT_SECURITY_SETTINGS, ...data.security },
        notifications: { ...DEFAULT_NOTIFICATION_SETTINGS, ...data.notifications },
        system: { ...DEFAULT_SYSTEM_SETTINGS, ...data.system },
        analytics: { ...DEFAULT_ANALYTICS_SETTINGS, ...data.analytics },
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || 'system'
      };
    } else {
      // Create default settings if they don't exist
      const defaultSettings = {
        website: DEFAULT_WEBSITE_SETTINGS,
        security: DEFAULT_SECURITY_SETTINGS,
        notifications: DEFAULT_NOTIFICATION_SETTINGS,
        system: DEFAULT_SYSTEM_SETTINGS,
        analytics: DEFAULT_ANALYTICS_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system'
      };
      await updateWebsiteSettings(defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting website settings:', error);
    return {
      website: DEFAULT_WEBSITE_SETTINGS,
      security: DEFAULT_SECURITY_SETTINGS,
      notifications: DEFAULT_NOTIFICATION_SETTINGS,
      system: DEFAULT_SYSTEM_SETTINGS,
      analytics: DEFAULT_ANALYTICS_SETTINGS,
      updatedAt: new Date(),
      updatedBy: 'system'
    };
  }
};

// Update website settings
export const updateWebsiteSettings = async (settings: AllSettings): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const settingsRef = doc(db, 'settings', 'website');
    await updateDoc(settingsRef, {
      website: settings.website,
      security: settings.security,
      notifications: settings.notifications,
      system: settings.system,
      analytics: settings.analytics,
      updatedAt: serverTimestamp(),
      updatedBy: settings.updatedBy || 'admin'
    }).catch(async () => {
      // If document doesn't exist, create it
      const { setDoc } = await import('firebase/firestore');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    });
    // If maintenance mode changed, log it specially
    if (settings.website.maintenanceMode) {
    } else {
    }
  } catch (error) {
    console.error('Error updating website settings:', error);
    throw error;
  }
};

// Subscribe to settings changes
export const subscribeToWebsiteSettings = (callback: (settings: AllSettings) => void) => {
  if (!FIREBASE_ENABLED || !db) {
    callback({
      website: DEFAULT_WEBSITE_SETTINGS,
      security: DEFAULT_SECURITY_SETTINGS,
      notifications: DEFAULT_NOTIFICATION_SETTINGS,
      system: DEFAULT_SYSTEM_SETTINGS,
      analytics: DEFAULT_ANALYTICS_SETTINGS,
      updatedAt: new Date(),
      updatedBy: 'system'
    });
    return () => {}; // Return empty unsubscribe function
  }

  const settingsRef = doc(db, 'settings', 'website');
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const settings: AllSettings = {
        website: { ...DEFAULT_WEBSITE_SETTINGS, ...data.website },
        security: { ...DEFAULT_SECURITY_SETTINGS, ...data.security },
        notifications: { ...DEFAULT_NOTIFICATION_SETTINGS, ...data.notifications },
        system: { ...DEFAULT_SYSTEM_SETTINGS, ...data.system },
        analytics: { ...DEFAULT_ANALYTICS_SETTINGS, ...data.analytics },
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || 'system'
      };
      callback(settings);
    } else {
      callback({
        website: DEFAULT_WEBSITE_SETTINGS,
        security: DEFAULT_SECURITY_SETTINGS,
        notifications: DEFAULT_NOTIFICATION_SETTINGS,
        system: DEFAULT_SYSTEM_SETTINGS,
        analytics: DEFAULT_ANALYTICS_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system'
      });
    }
  });
};

// ===============================
// Discount Codes Management
// ===============================

// Get all discount codes
export const getDiscountCodes = async (): Promise<DiscountCode[]> => {
  if (!FIREBASE_ENABLED || !db || !discountCodesCollection) {
    return [];
  }

  try {
    const q = query(discountCodesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      validFrom: (doc.data() as any).validFrom?.toDate() || new Date(),
      validTo: (doc.data() as any).validTo?.toDate() || new Date(),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
    })) as DiscountCode[];
  } catch (error) {
    console.error('Error getting discount codes:', error);
    return [];
  }
};

// Get discount code by code string
export const getDiscountCodeByCode = async (code: string): Promise<DiscountCode | null> => {
  if (!FIREBASE_ENABLED || !db || !discountCodesCollection) {
    return null;
  }

  try {
    const q = query(discountCodesCollection, where('code', '==', code.toUpperCase().trim()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as any),
      validFrom: (doc.data() as any).validFrom?.toDate() || new Date(),
      validTo: (doc.data() as any).validTo?.toDate() || new Date(),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
    } as DiscountCode;
  } catch (error) {
    console.error('Error getting discount code by code:', error);
    return null;
  }
};

// Validate discount code
export const validateDiscountCode = async (
  code: string,
  customerEmail?: string,
  productId?: string,
  totalAmount?: number
): Promise<{ valid: boolean; discountCode?: DiscountCode; error?: string; discountAmount?: number }> => {
  if (!code || !code.trim()) {
    return { valid: false, error: 'كود الخصم مطلوب' };
  }

  let discountCode = await getDiscountCodeByCode(code.trim());
  
  // If code doesn't exist in discount codes, check if it's the review invite code from settings
  if (!discountCode) {
    try {
      const settings = await getWebsiteSettings();
      const reviewInviteCode = settings.website.reviewInvite?.discountCode?.toUpperCase().trim();
      
      if (code.trim().toUpperCase() === reviewInviteCode && settings.website.reviewInvite?.enabled) {
        // Create a temporary discount code object from settings
        discountCode = {
          id: 'review-invite-code',
          code: reviewInviteCode || code.toUpperCase().trim(),
          type: 'percentage',
          value: settings.website.reviewInvite.discountPercentage || 10,
          description: 'كود خصم من دعوة التقييم',
          isActive: true,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          usageLimit: 0,
          usedCount: 0,
          usageLimitPerCustomer: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system'
        };
      }
    } catch (error) {
      console.error('Error checking review invite settings:', error);
    }
  }
  
  if (!discountCode) {
    return { valid: false, error: 'كود الخصم غير صحيح' };
  }

  if (!discountCode.isActive) {
    return { valid: false, error: 'كود الخصم غير نشط' };
  }

  const now = new Date();
  if (discountCode.validFrom && now < discountCode.validFrom) {
    return { valid: false, error: 'كود الخصم لم يبدأ بعد' };
  }

  if (discountCode.validTo && now > discountCode.validTo) {
    return { valid: false, error: 'كود الخصم منتهي الصلاحية' };
  }

  if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
    return { valid: false, error: 'تم استنفاد استخدامات كود الخصم' };
  }

  if (totalAmount && discountCode.minPurchaseAmount && totalAmount < discountCode.minPurchaseAmount) {
    return { valid: false, error: `الحد الأدنى للشراء ${discountCode.minPurchaseAmount}` };
  }

  if (productId) {
    if (discountCode.excludeProductIds?.includes(productId)) {
      return { valid: false, error: 'كود الخصم غير صالح لهذا المنتج' };
    }

    if (discountCode.applicableProductIds && discountCode.applicableProductIds.length > 0) {
      if (!discountCode.applicableProductIds.includes(productId)) {
        return { valid: false, error: 'كود الخصم غير صالح لهذا المنتج' };
      }
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (totalAmount) {
    if (discountCode.type === 'percentage') {
      discountAmount = (totalAmount * discountCode.value) / 100;
      if (discountCode.maxDiscountAmount && discountAmount > discountCode.maxDiscountAmount) {
        discountAmount = discountCode.maxDiscountAmount;
      }
    } else {
      discountAmount = discountCode.value;
      if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
      }
    }
  }

  return { valid: true, discountCode, discountAmount };
};

// Add discount code
export const addDiscountCode = async (discountCode: Omit<DiscountCode, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !discountCodesCollection) {
    return Promise.resolve('mock-discount-code-id');
  }

  try {
    // Check if code already exists
    const existingCode = await getDiscountCodeByCode(discountCode.code);
    if (existingCode) {
      throw new Error('كود الخصم موجود بالفعل');
    }

    const docRef = await addDoc(discountCodesCollection, {
      ...discountCode,
      code: discountCode.code.toUpperCase().trim(),
      usedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding discount code:', error);
    throw error;
  }
};

// Update discount code
export const updateDiscountCode = async (id: string, updates: Partial<DiscountCode>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !discountCodesCollection) {
    return Promise.resolve();
  }

  try {
    const codeRef = doc(db, 'discountCodes', id);
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // If code is being updated, check for duplicates
    if (updates.code) {
      const existingCode = await getDiscountCodeByCode(updates.code);
      if (existingCode && existingCode.id !== id) {
        throw new Error('كود الخصم موجود بالفعل');
      }
      updateData.code = updates.code.toUpperCase().trim();
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(codeRef, updateData);
  } catch (error) {
    console.error('Error updating discount code:', error);
    throw error;
  }
};

// Increment usage count for discount code
export const incrementDiscountCodeUsage = async (code: string, customerEmail?: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !discountCodesCollection) {
    return;
  }

  try {
    const discountCode = await getDiscountCodeByCode(code);
    if (discountCode) {
      await updateDiscountCode(discountCode.id, {
        usedCount: discountCode.usedCount + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing discount code usage:', error);
  }
};

// Delete discount code
export const deleteDiscountCode = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !discountCodesCollection) {
    return Promise.resolve();
  }

  try {
    const codeRef = doc(db, 'discountCodes', id);
    await deleteDoc(codeRef);
  } catch (error) {
    console.error('Error deleting discount code:', error);
    throw error;
  }
};

// Subscribe to discount codes
export const subscribeToDiscountCodes = (callback: (codes: DiscountCode[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !discountCodesCollection) {
    callback([]);
    return () => {};
  }

  const q = query(discountCodesCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const codes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      validFrom: (doc.data() as any).validFrom?.toDate() || new Date(),
      validTo: (doc.data() as any).validTo?.toDate() || new Date(),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
    })) as DiscountCode[];
    callback(codes);
  });
};

// ===============================
// Invoice Management Functions
// ===============================

// Generate sequential invoice number
export const generateInvoiceNumber = async (): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    // Generate mock invoice number based on timestamp
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}${month}-${timestamp}`;
  }

  try {
    // Get all orders to find the highest invoice number
    const ordersQuery = query(ordersCollection, where('invoiceNumber', '!=', null));
    const querySnapshot = await getDocs(ordersQuery);
    
    const invoiceNumbers: string[] = [];
    querySnapshot.docs.forEach(doc => {
      const invoiceNumber = (doc.data() as any).invoiceNumber;
      if (invoiceNumber && typeof invoiceNumber === 'string') {
        invoiceNumbers.push(invoiceNumber);
      }
    });

    // Extract numeric part from invoice numbers (format: INV-YYYYMM-NNNNNN)
    const numericParts = invoiceNumbers
      .map(inv => {
        const match = inv.match(/INV-\d{6}-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    const nextNumber = numericParts.length > 0 
      ? Math.max(...numericParts) + 1 
      : 1;

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequentialPart = String(nextNumber).padStart(6, '0');

    return `INV-${year}${month}-${sequentialPart}`;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback to timestamp-based number
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}${month}-${timestamp}`;
  }
};

// Generate invoice PDF
export const generateInvoicePDF = async (order: Order): Promise<Blob> => {
  // Dynamic import for client-side only
  const jsPDF = (await import('jspdf')).default;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set RTL direction and Arabic language support
  pdf.setLanguage('ar');
  
  // Try to use HTML rendering for better Arabic support as fallback
  // Ensure Arabic text renders correctly by embedding an Arabic-capable font if available
  // We look for fonts served from public/fonts: NotoNaskhArabic-Regular.ttf and -Bold.ttf
  let fontName = 'helvetica';
  let useArabicFont = false;
  
  try {
    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000;
      let binary = '';
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk) as unknown as number[]);
      }
      return btoa(binary);
    };

    // Regular
    const regularRes = await fetch('/fonts/NotoNaskhArabic-Regular.ttf');
    if (regularRes.ok) {
      const regularB64 = arrayBufferToBase64(await regularRes.arrayBuffer());
      pdf.addFileToVFS('NotoNaskhArabic-Regular.ttf', regularB64);
      pdf.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
      fontName = 'NotoNaskhArabic';
      useArabicFont = true;
    }
    // Bold (optional)
    const boldRes = await fetch('/fonts/NotoNaskhArabic-Bold.ttf');
    if (boldRes.ok) {
      const boldB64 = arrayBufferToBase64(await boldRes.arrayBuffer());
      pdf.addFileToVFS('NotoNaskhArabic-Bold.ttf', boldB64);
      pdf.addFont('NotoNaskhArabic-Bold.ttf', 'NotoNaskhArabic', 'bold');
    }
  } catch (e) {
    // If anything fails, we'll use html() method which supports Arabic better
    console.warn('Arabic font load failed, will use HTML rendering for better Arabic support:', e);
  }
  
  // Get company info from settings (or use defaults)
  let companyName = 'وافرلي wafarle';
  let companyEmail = 'support@wafarle.com';
  let companyPhone = '0593607607';
  let companyAddress = 'السعودية';

  try {
    const settings = await getWebsiteSettings();
    companyName = settings.website.siteName || companyName;
    companyEmail = settings.website.contactEmail || companyEmail;
    companyPhone = settings.website.contactPhone || companyPhone;
  } catch (error) {
    console.error('Error loading settings for invoice:', error);
  }

  // Colors
  const primaryColor = [79, 70, 229]; // #4F46E5
  const grayColor = [107, 114, 128]; // #6B7280

  // Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, 210, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont(fontName, 'bold');
  pdf.text('فاتورة', 105, 20, { align: 'center' });

  // Company Info (Right side)
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont(fontName, 'bold');
  pdf.text(companyName, 190, 45, { align: 'right' });
  
  pdf.setFontSize(10);
  pdf.setFont(fontName, 'normal');
  pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  pdf.text(`البريد: ${companyEmail}`, 190, 52, { align: 'right' });
  pdf.text(`الهاتف: ${companyPhone}`, 190, 58, { align: 'right' });
  if (companyAddress) {
    pdf.text(`العنوان: ${companyAddress}`, 190, 64, { align: 'right' });
  }

  // Invoice Info (Left side)
  pdf.setFontSize(12);
  pdf.setFont(fontName, 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('معلومات الفاتورة', 20, 45);
  
  pdf.setFontSize(10);
  pdf.setFont(fontName, 'normal');
  pdf.text(`رقم الفاتورة: ${order.invoiceNumber || 'غير محدد'}`, 20, 52);
  pdf.text(`تاريخ الفاتورة: ${new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(order.invoiceGeneratedAt || order.createdAt)}`, 20, 58);
  pdf.text(`order n : ${order.id}`, 20, 64);

  // Customer Info
  let yPos = 75;
  pdf.setFontSize(12);
  pdf.setFont(fontName, 'bold');
  pdf.text('معلومات العميل', 20, yPos);
  
  yPos += 7;
  pdf.setFontSize(10);
  pdf.setFont(fontName, 'normal');
  pdf.text(`الاسم: ${order.customerName}`, 20, yPos);
  yPos += 6;
  pdf.text(`البريد الإلكتروني: ${order.customerEmail}`, 20, yPos);
  yPos += 6;
  pdf.text(`الهاتف: ${order.customerPhone}`, 20, yPos);

  // Shipping address if exists
  if (order.shippingAddress) {
    yPos += 6;
    pdf.text(`عنوان الشحن: ${order.shippingAddress}`, 20, yPos);
  }

  // Items Table
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setFont(fontName, 'bold');
  pdf.text('تفاصيل الطلب', 20, yPos);

  yPos += 7;
  // Table Header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, yPos - 5, 170, 8, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont(fontName, 'bold');
  pdf.text('المنتج', 25, yPos);
  pdf.text('الكمية', 120, yPos);
  pdf.text('السعر', 145, yPos);
  pdf.text('الإجمالي', 180, yPos);

  // Table Row
  yPos += 8;
  pdf.setFont(fontName, 'normal');
  pdf.text(order.productName, 25, yPos);
  pdf.text(String(order.quantity || 1), 120, yPos);
  pdf.text(`${order.productPrice || 0} ر.س`, 145, yPos);
  pdf.text(`${order.totalAmount || 0} ر.س`, 180, yPos);

  // Discount info if exists
  if (order.discountCode || order.discountAmount) {
    yPos += 7;
    pdf.setFontSize(9);
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    if (order.originalAmount) {
      pdf.text(`المبلغ الأصلي: ${order.originalAmount} ر.س`, 150, yPos);
    }
    if (order.discountCode) {
      yPos += 5;
      pdf.text(`كود الخصم: ${order.discountCode}`, 150, yPos);
    }
    if (order.discountAmount) {
      yPos += 5;
      pdf.text(`الخصم: -${order.discountAmount} ر.س`, 150, yPos);
    }
    pdf.setTextColor(0, 0, 0);
  }

  // Total
  yPos += 12;
  pdf.setLineWidth(0.5);
  pdf.line(20, yPos, 190, yPos);
  
  yPos += 8;
  pdf.setFontSize(14);
  pdf.setFont(fontName, 'bold');
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setTextColor(255, 255, 255);
  pdf.rect(120, yPos - 6, 70, 10, 'F');
  
  pdf.text('المبلغ الإجمالي', 135, yPos);
  pdf.text(`${order.totalAmount || 0} ر.س`, 185, yPos);

  // Payment Status
  yPos += 15;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont(fontName, 'normal');
  const paymentStatus = order.paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع';
  const statusColor = order.paymentStatus === 'paid' ? [34, 197, 94] : [239, 68, 68];
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.setFont(fontName, 'bold');
  pdf.text(`حالة الدفع: ${paymentStatus}`, 20, yPos);
  
  // Order Status
  const statusLabels: Record<string, string> = {
    'pending': 'قيد الانتظار',
    'confirmed': 'مؤكد',
    'cancelled': 'ملغي',
    'completed': 'مكتمل'
  };
  const orderStatus = statusLabels[order.status] || order.status;
  pdf.text(`حالة الطلب: ${orderStatus}`, 140, yPos);

  // Footer
  yPos = 280;
  pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  pdf.setFontSize(8);
  pdf.setFont(fontName, 'normal');
  pdf.text('شكراً لك على ثقتك بنا!', 105, yPos, { align: 'center' });
  yPos += 5;
  pdf.text('للاستفسارات: ' + companyEmail, 105, yPos, { align: 'center' });

  // Generate blob
  return pdf.output('blob');
};

// Generate and save invoice for order
export const generateOrderInvoice = async (orderId: string): Promise<{
  invoiceNumber: string;
  pdfBlob: Blob;
}> => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    throw new Error('Firebase not enabled');
  }

  try {
    // Get order
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(orderRef));
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }

    const orderData = orderDoc.data() as any;
    const order: Order = {
      id: orderDoc.id,
      ...orderData,
      createdAt: orderData.createdAt?.toDate() || new Date(),
      confirmedAt: orderData.confirmedAt?.toDate(),
      deliveredAt: orderData.deliveredAt?.toDate(),
      shippedAt: orderData.shippedAt?.toDate(),
      invoiceGeneratedAt: orderData.invoiceGeneratedAt?.toDate(),
      invoiceSentAt: orderData.invoiceSentAt?.toDate(),
    };

    // Generate invoice number if not exists
    let invoiceNumber = order.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber();
    }

    // Generate PDF
    const pdfBlob = await generateInvoicePDF({
      ...order,
      invoiceNumber
    });

    // Update order with invoice info
    await updateDoc(orderRef, {
      invoiceNumber,
      invoiceGeneratedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return {
      invoiceNumber,
      pdfBlob
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

// Send invoice via email (simulated - in production, use email service)
export const sendInvoiceEmail = async (orderId: string): Promise<void> => {
  try {
    const { invoiceNumber, pdfBlob } = await generateOrderInvoice(orderId);
    
    // Get order to get customer email
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(orderRef));
    
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }

    const orderData = orderDoc.data() as any;
    const customerEmail = orderData.customerEmail;
    const customerName = orderData.customerName || 'عميلنا العزيز';

    // Get email service settings
    const settings = await getWebsiteSettings();
    const emailService = settings.website.emailService || {
      provider: 'none' as const,
      apiKey: '',
      fromEmail: settings.website.contactEmail,
      fromName: settings.website.siteName,
      replyTo: settings.website.contactEmail,
      enabled: false
    };

    // Check if email service is enabled
    if (!emailService.enabled || !emailService.apiKey || emailService.apiKey.trim() === '') {
      // Update order anyway
      await updateDoc(orderRef, {
        invoiceSentAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return;
    }

    // Convert PDF blob to base64 for email attachment
    const base64Pdf = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });

    // Import email template renderer
    const { getInvoiceTemplate } = await import('./email-templates');
    
    // Render email template
    const html = getInvoiceTemplate({
      companyName: settings.website.siteName,
      customerName,
      invoiceNumber,
      orderNumber: orderId,
      orderAmount: orderData.totalAmount || 0,
      currency: settings.website.currency || 'SAR',
      invoiceLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/customer/dashboard`,
    });

    // Send email via API with PDF attachment
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: customerEmail,
        subject: ` invoice number ${invoiceNumber}`,
        html,
        from: `${emailService.fromName || settings.website.siteName} <${emailService.fromEmail || settings.website.contactEmail}>`,
        replyTo: emailService.replyTo || settings.website.contactEmail,
        attachments: [
          {
            filename: `invoice-${invoiceNumber}.pdf`,
            content: base64Pdf,
          },
        ],
        apiKey: emailService.apiKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to send invoice email:', errorData);
      throw new Error(errorData.error || 'Failed to send invoice email');
    }

    // Update order to mark invoice as sent
    await updateDoc(orderRef, {
      invoiceSentAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const result = await response.json();
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (orderId: string): Promise<void> => {
  try {
    const { invoiceNumber, pdfBlob } = await generateOrderInvoice(orderId);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

// ===============================
// Email Notification Functions
// ===============================

// Send email notification
export const sendEmailNotification = async (
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>
): Promise<void> => {
  try {
    // Get email notification settings
    const settings = await getWebsiteSettings();
    const emailNotifications = settings.website.emailNotifications || {};
    const emailService = settings.website.emailService || {
      provider: 'none' as const,
      apiKey: '',
      fromEmail: settings.website.contactEmail,
      fromName: settings.website.siteName,
      replyTo: settings.website.contactEmail,
      enabled: false
    };
    
    // Check if notification type is enabled
    const notificationType = template as keyof typeof emailNotifications;
    if (emailNotifications[notificationType] === false) {
      return;
    }

    // Check if email service is enabled
    if (!emailService.enabled || !emailService.apiKey || emailService.apiKey.trim() === '') {
      return;
    }

    // Import email template renderer
    const { renderEmailTemplate } = await import('./email-templates');
    
    // Render email template
    const html = renderEmailTemplate(template, {
      ...data,
      companyName: settings.website.siteName,
    });

    // Send email via API
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from: `${emailService.fromName || settings.website.siteName} <${emailService.fromEmail || settings.website.contactEmail}>`,
        replyTo: emailService.replyTo || settings.website.contactEmail,
        apiKey: emailService.apiKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw error - email sending failures shouldn't break the flow
    // Just log it and continue
  }
};

// Note: renderEmailTemplate is now in email-templates.ts
// This function is kept for backward compatibility
export const renderEmailTemplate = async (template: string, data: Record<string, any>): Promise<string> => {
  const { renderEmailTemplate: renderTemplate } = await import('./email-templates');
  return renderTemplate(template, data);
};

// ===============================
// Dashboard Statistics Functions
// ===============================

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const [orders, customers, products, blogPosts] = await Promise.all([
      getOrders(),
      getCustomers(),
      getProducts(),
      getBlogPosts()
    ]);

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => 
      order.createdAt >= today && order.status === 'confirmed'
    );
    const todaySales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate new orders today
    const newOrdersToday = orders.filter(order => order.createdAt >= today).length;

    // Calculate active customers (customers with orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeCustomers = customers.filter(customer => 
      customer.lastOrderDate && customer.lastOrderDate >= thirtyDaysAgo
    ).length;

    // Calculate total revenue
    const totalRevenue = orders
      .filter(order => order.status === 'confirmed')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate average order value
    const confirmedOrders = orders.filter(order => order.status === 'confirmed');
    const averageOrderValue = confirmedOrders.length > 0 
      ? totalRevenue / confirmedOrders.length 
      : 0;

    // Get recent activity
    const recentOrders = orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Get recent blog posts
    const recentBlogPosts = blogPosts
      .filter(post => post.status === 'published')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);

    return {
      todaySales,
      newOrdersToday,
      activeCustomers,
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      recentOrders,
      recentBlogPosts,
      totalBlogPosts: blogPosts.length,
      publishedBlogPosts: blogPosts.filter(post => post.status === 'published').length
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      todaySales: 0,
      newOrdersToday: 0,
      activeCustomers: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      recentOrders: [],
      recentBlogPosts: [],
      totalBlogPosts: 0,
      publishedBlogPosts: 0
    };
  }
};

// Get orders by date range
export const getOrdersByDateRange = async (startDate: Date, endDate: Date) => {
  const orders = await getOrders();
  return orders.filter(order => 
    order.createdAt >= startDate && order.createdAt <= endDate
  );
};

// Get revenue by date range
export const getRevenueByDateRange = async (startDate: Date, endDate: Date) => {
  const orders = await getOrdersByDateRange(startDate, endDate);
  return orders
    .filter(order => order.status === 'confirmed')
    .reduce((sum, order) => sum + order.totalAmount, 0);
};

// Get top selling products
export const getTopSellingProducts = async (limit: number = 5) => {
  const orders = await getOrders();
  const productSales: { [key: string]: { product: Product; count: number; revenue: number } } = {};
  
  orders.forEach(order => {
    if (!productSales[order.productId]) {
      const product = mockProducts.find(p => p.id === order.productId);
      if (product) {
        productSales[order.productId] = {
          product,
          count: 0,
          revenue: 0
        };
      }
    }
    if (productSales[order.productId]) {
      productSales[order.productId].count += order.quantity;
      productSales[order.productId].revenue += order.productPrice * order.quantity;
    }
  });

  return Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// ===============================
// Blog System Management
// ===============================

// Import blog interfaces
import type { 
  BlogPost, 
  BlogCategory, 
  BlogTag, 
  BlogComment 
} from './firebase';

// Mock blog data for development
const mockCategories: BlogCategory[] = [
  {
    id: '1',
    name: 'التقنية والبرمجة',
    slug: 'tech-programming',
    description: 'أحدث أخبار التقنية والبرمجة والذكاء الاصطناعي',
    color: '#3B82F6',
    icon: '💻',
    postsCount: 5,
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'ريادة الأعمال',
    slug: 'entrepreneurship',
    description: 'نصائح وقصص نجاح في عالم ريادة الأعمال',
    color: '#10B981',
    icon: '🚀',
    postsCount: 3,
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    name: 'التسويق الرقمي',
    slug: 'digital-marketing',
    description: 'استراتيجيات التسويق الرقمي ووسائل التواصل الاجتماعي',
    color: '#F59E0B',
    icon: '📱',
    postsCount: 7,
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-22')
  }
];

// Force refresh of mockBlogPosts to ensure it loads properly
// No more mock data - all data comes from Firebase

// All blog tags come from Firebase

// Blog Categories Functions
export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return [];
  }

  try {
    const { collection, getDocs, orderBy, query, where } = await import('firebase/firestore');
    // Simplified query to avoid Firestore index requirements
    const categoriesQuery = query(
      collection(db, 'blogCategories'), 
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(categoriesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date()
    })) as BlogCategory[];
  } catch (error) {
    console.error('Error getting blog categories:', error);
    return [];
  }
};

export const addBlogCategory = async (categoryData: Omit<BlogCategory, 'id' | 'createdAt' | 'updatedAt' | 'postsCount'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db) {
    return Date.now().toString();
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'blogCategories'), {
      ...categoryData,
      postsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding blog category:', error);
    throw error;
  }
};

// Blog Posts Functions
export const getBlogPosts = async (limit?: number, category?: string, status?: string): Promise<BlogPost[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return [];
  }

  try {
    const { collection, getDocs, orderBy, query, where, limit: firestoreLimit } = await import('firebase/firestore');
    let postsQuery = query(collection(db, 'blogPosts'), orderBy('publishedAt', 'desc'));
    
    if (status) {
      postsQuery = query(postsQuery, where('status', '==', status));
    }
    if (category) {
      postsQuery = query(postsQuery, where('categoryId', '==', category));
    }
    if (limit) {
      postsQuery = query(postsQuery, firestoreLimit(limit));
    }
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
      publishedAt: (doc.data() as any).publishedAt?.toDate() || null,
      scheduledAt: (doc.data() as any).scheduledAt?.toDate() || null
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return [];
  }
};

export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null;
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'blogPosts', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const docData = docSnap.data();
    return {
      id: docSnap.id,
      ...docData,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate() || new Date(),
      publishedAt: docData.publishedAt?.toDate() || null,
      scheduledAt: docData.scheduledAt?.toDate() || null
    } as BlogPost;
  } catch (error) {
    console.error('Error getting blog post by ID:', error);
    return null;
  }
};

export const getBlogPost = async (slugOrId: string): Promise<BlogPost | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null;
  }

  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const postQuery = query(collection(db, 'blogPosts'), where('slug', '==', slugOrId));
    const snapshot = await getDocs(postQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const docData = doc.data();
    return {
      id: doc.id,
      ...docData,
      createdAt: docData.createdAt?.toDate() || new Date(),
      updatedAt: docData.updatedAt?.toDate() || new Date(),
      publishedAt: docData.publishedAt?.toDate() || null,
      scheduledAt: docData.scheduledAt?.toDate() || null
    } as BlogPost;
  } catch (error) {
    console.error('Error getting blog post:', error);
    return null;
  }
};

export const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likesCount' | 'commentsCount'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error('Firebase is not enabled');
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'blogPosts'), {
      ...postData,
      viewCount: 0,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding blog post:', error);
    throw error;
  }
};

export const updateBlogPost = async (id: string, postData: Partial<BlogPost>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error('Firebase is not enabled');
  }

  try {
    const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const docRef = doc(db, 'blogPosts', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`❌ [UPDATE_BLOG_POST] Blog post with ID ${id} does not exist`);
      throw new Error(`Blog post with ID ${id} does not exist`);
    }
    await updateDoc(docRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ [UPDATE_BLOG_POST] Error updating blog post:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error('Firebase is not enabled');
  }

  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'blogPosts', id));
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Blog Tags Functions
// Generate Firebase-like ID for consistency
function generateFirebaseId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const getBlogTags = async (): Promise<BlogTag[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return [];
  }

  try {
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const tagsQuery = query(collection(db, 'blogTags'), orderBy('postsCount', 'desc'));
    const snapshot = await getDocs(tagsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date()
    })) as BlogTag[];
  } catch (error) {
    console.error('Error getting blog tags:', error);
    return [];
  }
};

// Utility functions
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200; // Average reading speed
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length; // Remove HTML tags and count words
  return Math.ceil(words / wordsPerMinute);
};

export const getBlogPostsByCategory = async (categoryId: string, limit?: number): Promise<BlogPost[]> => {
  return getBlogPosts(limit, categoryId, 'published');
};

export const updateBlogPostLikes = async (postId: string, likesCount: number): Promise<void> => {
  try {
    if (USE_FIREBASE) {
      // Check if document exists before updating
      const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const docRef = doc(db, 'blogPosts', postId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.warn(`Blog post with ID ${postId} does not exist`);
        return;
      }
      
      await updateDoc(docRef, {
        likesCount,
        updatedAt: serverTimestamp()
      });
    }
    // Mock implementation for development
  } catch (error) {
    console.error('Error updating blog post likes:', error);
    throw error;
  }
};

export const incrementBlogPostViews = async (postId: string): Promise<void> => {
  try {
    if (USE_FIREBASE) {
      // Check if document exists before updating
      const { doc, getDoc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore');
      const docRef = doc(db, 'blogPosts', postId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.warn(`⚠️ [INCREMENT_VIEWS] Blog post with ID ${postId} does not exist`);
        return;
      }
      await updateDoc(docRef, {
        viewCount: increment(1),
        updatedAt: serverTimestamp()
      });
    }
    // Mock implementation for development
  } catch (error) {
    console.error('❌ [INCREMENT_VIEWS] Error incrementing blog post views:', error);
    throw error;
  }
};

export const getFeaturedBlogPosts = async (limit = 3): Promise<BlogPost[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return [];
  }

  try {
    const { collection, getDocs, orderBy, query, where, limit: firestoreLimit } = await import('firebase/firestore');
    const postsQuery = query(
      collection(db, 'blogPosts'),
      where('featured', '==', true),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      firestoreLimit(limit)
    );
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
      publishedAt: (doc.data() as any).publishedAt?.toDate() || null,
      scheduledAt: (doc.data() as any).scheduledAt?.toDate() || null
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting featured blog posts:', error);
    return [];
  }
};

// ===============================
// Subscription Reviews CRUD Operations
// ===============================

// Add subscription review
export const addSubscriptionReview = async (reviewData: Omit<SubscriptionReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db) {
    return 'mock-review-' + Date.now();
  }

  try {
    const reviewsCollection = collection(db, 'subscriptionReviews');
    const docRef = await addDoc(reviewsCollection, {
      ...reviewData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('❌ [ADD_SUBSCRIPTION_REVIEW] Error adding review:', error);
    throw error;
  }
};

// Get subscription reviews
export const getSubscriptionReviews = async (subscriptionId?: string, productId?: string, status?: string): Promise<SubscriptionReview[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return [];
  }

  try {
    const reviewsCollection = collection(db, 'subscriptionReviews');
    let q = query(reviewsCollection, orderBy('createdAt', 'desc'));
    
    if (subscriptionId) {
      q = query(q, where('subscriptionId', '==', subscriptionId));
    }
    
    if (productId) {
      q = query(q, where('productId', '==', productId));
    }
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date()

    })) as SubscriptionReview[];    return reviews;
  } catch (error) {
    console.error('❌ [GET_SUBSCRIPTION_REVIEWS] Error getting reviews:', error);
    return [];
  }
};

// Get customer reviews
export const getCustomerReviews = async (customerEmail: string): Promise<SubscriptionReview[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return [];
  }

  try {
    const reviewsCollection = collection(db, 'subscriptionReviews');
    const q = query(
      reviewsCollection, 
      where('customerEmail', '==', customerEmail),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date()
    })) as SubscriptionReview[];
    
    return reviews;
  } catch (error) {
    console.error('❌ [GET_CUSTOMER_REVIEWS] Error getting customer reviews:', error);
    return [];
  }
};

// Update subscription review
export const updateSubscriptionReview = async (reviewId: string, updates: Partial<SubscriptionReview>): Promise<void> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return;
  }

  try {
    const reviewRef = doc(db, 'subscriptionReviews', reviewId);
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error('❌ [UPDATE_SUBSCRIPTION_REVIEW] Error updating review:', error);
    throw error;
  }
};

// Delete subscription review
export const deleteSubscriptionReview = async (reviewId: string): Promise<void> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return;
  }

  try {
    const reviewRef = doc(db, 'subscriptionReviews', reviewId);
    await deleteDoc(reviewRef);
    
  } catch (error) {
    console.error('❌ [DELETE_SUBSCRIPTION_REVIEW] Error deleting review:', error);
    throw error;
  }
};

// Check if customer can review subscription
export const canCustomerReviewSubscription = async (customerEmail: string, subscriptionId: string): Promise<boolean> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return true;
  }

  try {
    // Check if customer already reviewed this subscription
    const existingReviews = await getSubscriptionReviews(subscriptionId);
    const hasExistingReview = existingReviews.some(review => 
      review.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    
    if (hasExistingReview) {
      return false;
    }
    
    // Check if customer has this subscription
    const customerSubscriptions = await getCustomerSubscriptions(customerEmail);
    const hasSubscription = customerSubscriptions.some(sub => sub.id === subscriptionId);
    
    if (!hasSubscription) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ [CAN_CUSTOMER_REVIEW] Error checking review eligibility:', error);
    return false;
  }
};

// Get product average rating
export const getProductAverageRating = async (productId: string): Promise<{ average: number; count: number }> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return { average: 4.5, count: 10 };
  }

  try {
    const reviews = await getSubscriptionReviews(undefined, productId, 'approved');
    
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;
    
    return { average: Math.round(average * 10) / 10, count: reviews.length };
  } catch (error) {
    console.error('❌ [GET_PRODUCT_AVERAGE_RATING] Error getting product rating:', error);
    return { average: 0, count: 0 };
  }
};

// Update product review statistics
export const updateProductReviewStats = async (productId: string): Promise<void> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return;
  }

  try {
    // Get all approved reviews for this product
    const reviews = await getSubscriptionReviews(undefined, productId, 'approved');
    
    const reviewsCount = reviews.length;
    const averageRating = reviewsCount > 0 
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount) * 10) / 10
      : 0;

    // Update product document
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      reviewsCount: reviewsCount,
      averageRating: averageRating,
      updatedAt: serverTimestamp()
    });

  
  } catch (error) {
    console.error('❌ [UPDATE_PRODUCT_REVIEW_STATS] Error updating product stats:', error);
    throw error;
  }
};

// Update all products review statistics
export const updateAllProductsReviewStats = async (): Promise<void> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return;
  }

  try {
    const products = await getProducts();
    
    for (const product of products) {
      await updateProductReviewStats(product.id);
    }

  } catch (error) {
    console.error('❌ [UPDATE_ALL_PRODUCTS_REVIEW_STATS] Error updating all products stats:', error);
    throw error;
  }
};

// Add sample reviews for testing
export const addSampleReviews = async (): Promise<void> => {
  
  if (!FIREBASE_ENABLED || !db) {
    return;
  }

  try {
    const sampleReviews = [
      {
        subscriptionId: 'sample-sub-1',
        customerId: 'customer1@example.com',
        customerEmail: 'customer1@example.com',
        customerName: 'أحمد محمد',
        productId: '1', // Netflix
        productName: 'Netflix Premium',
        rating: 5,
        title: 'خدمة ممتازة',
        comment: 'خدمة Netflix ممتازة جداً، المحتوى متنوع والجودة عالية. أنصح بها بشدة!',
        isVerified: true,
        helpful: 3,
        status: 'approved' as const
      },
      {
        subscriptionId: 'sample-sub-2',
        customerId: 'customer2@example.com',
        customerEmail: 'customer2@example.com',
        customerName: 'فاطمة أحمد',
        productId: '1', // Netflix
        productName: 'Netflix Premium',
        rating: 4,
        title: 'جيد جداً',
        comment: 'الخدمة جيدة والمحتوى ممتاز، لكن السعر مرتفع قليلاً.',
        isVerified: true,
        helpful: 1,
        status: 'approved' as const
      },
      {
        subscriptionId: 'sample-sub-3',
        customerId: 'customer3@example.com',
        customerEmail: 'customer3@example.com',
        customerName: 'محمد علي',
        productId: '2', // Spotify
        productName: 'Spotify Premium',
        rating: 5,
        title: 'أفضل منصة موسيقية',
        comment: 'Spotify هو الأفضل في مجال الموسيقى، المكتبة ضخمة والجودة ممتازة.',
        isVerified: true,
        helpful: 5,
        status: 'approved' as const
      },
      {
        subscriptionId: 'sample-sub-4',
        customerId: 'customer4@example.com',
        customerEmail: 'customer4@example.com',
        customerName: 'سارة خالد',
        productId: '2', // Spotify
        productName: 'Spotify Premium',
        rating: 4,
        title: 'ممتاز',
        comment: 'خدمة رائعة، الموسيقى بدون إعلانات والتحميل سريع.',
        isVerified: true,
        helpful: 2,
        status: 'approved' as const
      },
      {
        subscriptionId: 'sample-sub-5',
        customerId: 'customer5@example.com',
        customerEmail: 'customer5@example.com',
        customerName: 'خالد عبدالله',
        productId: '3', // Shahid
        productName: 'Shahid VIP',
        rating: 5,
        title: 'محتوى عربي ممتاز',
        comment: 'أفضل منصة للمحتوى العربي، المسلسلات والأفلام رائعة.',
        isVerified: true,
        helpful: 4,
        status: 'approved' as const
      },
      {
        subscriptionId: 'sample-sub-6',
        customerId: 'customer6@example.com',
        customerEmail: 'customer6@example.com',
        customerName: 'نورا سعد',
        productId: '4', // Disney+
        productName: 'Disney+ Premium',
        rating: 5,
        title: 'مثالي للأطفال',
        comment: 'محتوى Disney رائع، الأطفال يحبونه والجودة ممتازة.',
        isVerified: true,
        helpful: 3,
        status: 'approved' as const
      },
      {
        subscriptionId: 'sample-sub-7',
        customerId: 'customer7@example.com',
        customerEmail: 'customer7@example.com',
        customerName: 'عبدالرحمن محمد',
        productId: '5', // Apple Music
        productName: 'Apple Music',
        rating: 4,
        title: 'جيد',
        comment: 'خدمة جيدة لكن تحتاج تحسين في بعض الميزات.',
        isVerified: true,
        helpful: 1,
        status: 'approved' as const
      },
      {
        subscriptionId: 'sample-sub-8',
        customerId: 'customer8@example.com',
        customerEmail: 'customer8@example.com',
        customerName: 'ريم أحمد',
        productId: '6', // Adobe
        productName: 'Adobe Creative Cloud',
        rating: 5,
        title: 'أدوات احترافية',
        comment: 'أفضل مجموعة أدوات للتصميم والإبداع، لا غنى عنها للمصممين.',
        isVerified: true,
        helpful: 6,
        status: 'approved' as const
      }
    ];

    for (const reviewData of sampleReviews) {
      await addSubscriptionReview(reviewData);
    }

  } catch (error) {
    console.error('❌ [ADD_SAMPLE_REVIEWS] Error adding sample reviews:', error);
    throw error;
  }
};

// Categories CRUD Functions
export const getCategories = async (): Promise<Category[]> => {
  if (!FIREBASE_ENABLED || !db || !categoriesCollection) {
    // Mock data for development
    return [
      {
        id: '1',
        name: 'البث المباشر',
        nameEn: 'Streaming',
        slug: 'streaming',
        description: 'خدمات البث المباشر والاشتراكات',
        icon: '📺',
        color: '#3b82f6',
        order: 1,
        isActive: true,
        productsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'الألعاب',
        nameEn: 'Gaming',
        slug: 'gaming',
        description: 'اشتراكات الألعاب والمنصات',
        icon: '🎮',
        color: '#8b5cf6',
        order: 2,
        isActive: true,
        productsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'الموسيقى',
        nameEn: 'Music',
        slug: 'music',
        description: 'خدمات الموسيقى والبودكاست',
        icon: '🎵',
        color: '#10b981',
        order: 3,
        isActive: true,
        productsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  try {
    const q = query(categoriesCollection, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
    })) as Category[];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null;
  }

  try {
    const categoryDoc = await getDoc(doc(db, 'categories', id));
    if (categoryDoc.exists()) {
      const data = categoryDoc.data();
      return {
        id: categoryDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Category;
    }
    return null;
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
};

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productsCount'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !categoriesCollection) {
    return Promise.resolve('mock-category-id');
  }

  try {
    // Generate slug if not provided
    const slug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Filter out undefined values
    const categoryData: Record<string, any> = {
      name: category.name,
      slug,
      order: category.order,
      isActive: category.isActive,
      productsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (category.nameEn) categoryData.nameEn = category.nameEn;
    if (category.description) categoryData.description = category.description;
    if (category.icon) categoryData.icon = category.icon;
    if (category.color) categoryData.color = category.color;
    if (category.parentId) categoryData.parentId = category.parentId;
    
    const docRef = await addDoc(categoriesCollection, categoryData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    const categoryRef = doc(db, 'categories', id);
    const filteredUpdates: Record<string, any> = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      // Skip undefined values, id, and timestamp fields
      if (value !== undefined && value !== null && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        filteredUpdates[key] = value;
      }
    });

    // Handle empty strings for optional fields - remove them if they should be deleted
    if (updates.parentId === '' || updates.parentId === null) {
      filteredUpdates.parentId = null;
    }

    filteredUpdates.updatedAt = serverTimestamp();
    
    // Only update if we have valid fields (more than just updatedAt)
    if (Object.keys(filteredUpdates).length > 1) {
      await updateDoc(categoryRef, filteredUpdates);
    }
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    return Promise.resolve();
  }

  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !categoriesCollection) {
    callback([]);
    return () => {};
  }

  const q = query(categoriesCollection, orderBy('order', 'asc'));
  return onSnapshot(q, (querySnapshot) => {
    const categories = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as Category[];
    callback(categories);
  });
};

