'use client';

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { Product, ContactMessage, Order, Customer, Subscription, ChatMessage, ChatConversation } from '@/lib/firebase';
import { CurrencySettings, DEFAULT_CURRENCY_SETTINGS } from '@/lib/currency';

// Temporarily disable Firebase to fix 400 errors
const FIREBASE_ENABLED = false;
const db = null;
console.log('🔧 [CONFIG] Firebase forced disabled - using mock data only');

const USE_FIREBASE = false; // Force disabled

// Collections - only create if Firebase is enabled
let productsCollection: any;
let messagesCollection: any;
let ordersCollection: any;
let customersCollection: any;
let subscriptionsCollection: any;
let chatConversationsCollection: any;
let chatMessagesCollection: any;

// Firebase disabled - collections not initialized
console.log('🔧 [COLLECTIONS] Skipping Firebase collection initialization');

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
    description: 'محتوى عربي حصري من MBC وأفضل المسलسلات العربية',
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
];

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
    console.log('Firebase not enabled, returning mock chat conversations');
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
    console.log('Falling back to mock data');
    return mockChatConversations;
  }
};

// Subscribe to chat conversations real-time
export const subscribeToChatConversations = (
  callback: (conversations: ChatConversation[]) => void
): (() => void) => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, using mock chat conversations');
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
      console.log('Falling back to mock data');
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
    console.log('Firebase not enabled, using mock conversation');
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
    console.log('Firebase not enabled, using mock chat message');
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
      console.log('No valid message data provided');
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
    console.log('Firebase not enabled, returning mock chat messages');
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
    
    console.log('✅ Chat messages loaded:', messages.length);
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
        
        console.log('✅ Chat messages loaded (fallback):', messages.length);
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
    console.log('Firebase not enabled, using mock chat subscription');
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
      console.log('🔄 Attempting fallback subscription without orderBy');
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
    console.log('Firebase not enabled, returning mock products');
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
    
    console.log(`✅ Successfully loaded ${firestoreProducts.length} products from Firestore`);
    return firestoreProducts;
  } catch (error: any) {
    console.error('Error getting products:', error);
    
    if (error.code === 'permission-denied') {
      console.log('🔒 Permission denied - please update Firestore security rules');
      console.log('📋 Falling back to mock products for now');
    }
    
    return mockProducts;
  }
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !productsCollection) {
    console.log('Firebase not enabled, simulating product addition');
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
    console.log('Firebase not enabled, simulating product update');
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
      console.log('No valid updates provided for product:', id);
      return;
    }

    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, filteredProduct);
    console.log('✅ Product updated successfully:', id);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, simulating product deletion');
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
    console.log('Firebase not enabled, using mock products for subscription');
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
    console.log('Firebase not enabled, returning mock orders');
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
    })) as Order[];
    
    console.log(`✅ Successfully loaded ${firestoreOrders.length} orders from Firestore`);
    return firestoreOrders;
  } catch (error: any) {
    console.error('Error getting orders:', error);
    console.log('📋 Falling back to mock orders');
    return mockOrders;
  }
};

// Add new order
export const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    console.log('Firebase not enabled, simulating order addition');
    return Promise.resolve('mock-order-id-' + Date.now());
  }

  try {
    const docRef = await addDoc(ordersCollection, {
      ...order,
      createdAt: serverTimestamp(),
    });
    console.log('✅ Order added successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, simulating order update');
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

    // Filter out undefined values to prevent Firebase errors
    const filteredUpdates: Record<string, any> = {};
    Object.entries(timestampedUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    });

    // Only update if we have valid fields
    if (Object.keys(filteredUpdates).length === 0) {
      console.log('No valid updates provided for order:', id);
      return;
    }
    
    await updateDoc(orderRef, filteredUpdates);
    console.log('✅ Order updated successfully:', id);

    // Check if order should be converted to subscription
    const finalOrder = { ...currentOrder, ...updates };
    await checkAndCreateSubscription(id, finalOrder);
    
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Delete order and related subscription
export const deleteOrder = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, simulating order deletion with subscription cleanup');
    
    // In mock mode, also check for related subscriptions
    const relatedSubscription = mockSubscriptions.find(sub => sub.orderId === id);
    if (relatedSubscription) {
      console.log('🔗 Mock: Found related subscription, simulating deletion:', relatedSubscription.id);
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
      console.log('🔗 Found related subscription, deleting:', relatedSubscription.id);
      await deleteSubscription(relatedSubscription.id);
    }

    // Get order data before deleting for stats update
    const orderDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(doc(db, 'orders', id)));
    const orderData = orderDoc.exists() ? orderDoc.data() as Order : null;

    // Then delete the order
    const orderRef = doc(db, 'orders', id);
    await deleteDoc(orderRef);
    
    console.log('✅ Order deleted successfully:', id);
    if (relatedSubscription) {
      console.log('✅ Related subscription also deleted:', relatedSubscription.id);
    }

    // Update customer stats after deletion
    if (orderData && orderData.customerEmail) {
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
    })) as Order[];
  } catch (error) {
    console.error('Error getting orders by payment status:', error);
    return mockOrders.filter(order => order.paymentStatus === paymentStatus);
  }
};

// Real-time orders subscription
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !ordersCollection) {
    console.log('Firebase not enabled, using mock orders for subscription');
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
    console.log('Firebase not enabled, returning mock customers');
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
    
    console.log(`✅ Successfully loaded ${firestoreCustomers.length} customers from Firestore`);
    return firestoreCustomers;
  } catch (error: any) {
    console.error('Error getting customers:', error);
    console.log('📋 Falling back to mock customers');
    return mockCustomers;
  }
};

// Add new customer
export const addCustomer = async (customer: Omit<Customer, 'id' | 'registrationDate' | 'totalOrders' | 'totalSpent' | 'averageOrderValue'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    console.log('Firebase not enabled, simulating customer addition');
    return Promise.resolve('mock-customer-id-' + Date.now());
  }

  try {
    const docRef = await addDoc(customersCollection, {
      ...customer,
      registrationDate: serverTimestamp(),
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
    });
    console.log('✅ Customer added successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

// Update customer
export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, simulating customer update');
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
      console.log('No valid updates provided for customer:', id);
      return;
    }

    const customerRef = doc(db, 'customers', id);
    await updateDoc(customerRef, filteredUpdates);
    console.log('✅ Customer updated successfully:', id);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// Delete customer
export const deleteCustomer = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, simulating customer deletion');
    return Promise.resolve();
  }

  try {
    const customerRef = doc(db, 'customers', id);
    await deleteDoc(customerRef);
    console.log('✅ Customer deleted successfully:', id);
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
    console.log('Firebase not enabled, using mock customers for subscription');
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

// Update customer stats (called when orders change)
export const updateCustomerStats = async (customerEmail: string, newOrderAmount: number): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !customersCollection) {
    console.log('Firebase not enabled, simulating customer stats update');
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
      
      await updateDoc(customerDoc.ref, {
        totalOrders: newTotalOrders,
        totalSpent: newTotalSpent,
        averageOrderValue: newAverageOrderValue,
        lastOrderDate: serverTimestamp()
      });
      
      console.log('✅ Customer stats updated successfully');
    } else {
      // Create new customer if not exists
      await addCustomer({
        name: 'عميل جديد', // Default name, should be updated later
        email: customerEmail,
        phone: '', // Will be updated later
        status: 'active',
        lastOrderDate: new Date(),
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
    console.log('Firebase not enabled, using default currency settings');
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
    console.log('Firebase not enabled, simulating currency settings update');
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
    
    console.log('✅ Currency settings updated successfully');
  } catch (error) {
    console.error('Error updating currency settings:', error);
    throw error;
  }
};

// Subscribe to currency settings changes
export const subscribeToCurrencySettings = (callback: (settings: CurrencySettings) => void) => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, using default currency settings for subscription');
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
const checkAndCreateSubscription = async (orderId: string, order: Order): Promise<void> => {
  try {
    // Check if order qualifies for subscription creation
    const shouldCreateSubscription = 
      order.status === 'confirmed' && 
      order.paymentStatus === 'paid' &&
      !order.subscriptionStartDate; // Don't create duplicate subscriptions

    if (!shouldCreateSubscription) {
      return;
    }

    console.log('🎯 Creating subscription for confirmed and paid order:', orderId);

    // Get product details to determine subscription duration
    const products = await getProducts();
    const product = products.find(p => p.id === order.productId);
    
    if (!product) {
      console.error('Product not found for order:', orderId);
      return;
    }

    // Calculate subscription details
    let durationMonths = 1; // Default to 1 month
    let planType = 'شهري';
    let subscriptionPrice = order.totalAmount;

    // Check if order has product options (subscription plans)
    if (order.notes && order.notes.includes('خطة:')) {
      const planMatch = order.notes.match(/خطة:\s*(.+?)(?:\s|$|,)/);
      if (planMatch) {
        planType = planMatch[1].trim();
        
        // Determine duration based on plan type
        switch (planType.toLowerCase()) {
          case 'شهري':
          case 'monthly':
            durationMonths = 1;
            break;
          case 'ربع سنوي':
          case 'quarterly':
            durationMonths = 3;
            break;
          case 'نصف سنوي':
          case 'semi-annual':
            durationMonths = 6;
            break;
          case 'سنوي':
          case 'annual':
            durationMonths = 12;
            break;
          default:
            // Try to extract number from plan type
            const durationMatch = planType.match(/(\d+)/);
            if (durationMatch) {
              durationMonths = parseInt(durationMatch[1]);
            }
        }
      }
    }

    // Calculate start and end dates more accurately
    const startDate = new Date();
    const endDate = new Date();
    
    // Add months more accurately considering different month lengths
    for (let i = 0; i < durationMonths; i++) {
      endDate.setMonth(endDate.getMonth() + 1);
      // Handle edge case where the day doesn't exist in the new month
      // e.g., Jan 31 -> Feb 28/29
      if (endDate.getDate() !== startDate.getDate()) {
        endDate.setDate(0); // Go to last day of previous month
      }
    }

    // Calculate remaining days more precisely
    const remainingDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Create subscription object
    const subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
      orderId: orderId,
      customerId: order.customerEmail, // Using email as customer ID for now
      customerEmail: order.customerEmail,
      productId: order.productId,
      productName: order.productName,
      productImage: product.image,
      planType: planType,
      price: subscriptionPrice,
      startDate: startDate,
      endDate: endDate,
      durationMonths: durationMonths,
      status: 'active',
      autoRenewal: false, // Default to manual renewal
      paymentStatus: 'paid',
      remainingDays: remainingDays,
      usageCount: 0,
      maxUsage: 9999,
      features: product.features || [],
      notes: `تم إنشاؤه تلقائياً من الطلب ${orderId}`
    };

    // Create the subscription
    const subscriptionId = await addSubscription(subscription);

    // Update the order with subscription details
    if (FIREBASE_ENABLED && db) {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionDurationMonths: durationMonths,
        subscriptionStatus: 'active',
        autoRenewal: false,
        notes: order.notes ? 
          `${order.notes} | اشتراك نشط: ${subscriptionId}` : 
          `اشتراك نشط: ${subscriptionId}`
      });
    }

    console.log('🎉 Subscription created successfully!', {
      orderId,
      subscriptionId,
      planType,
      durationMonths,
      endDate: endDate.toISOString()
    });

    // Update customer stats
    await updateCustomerStats(order.customerEmail, order.totalAmount || 0);

  } catch (error) {
    console.error('Error creating subscription from order:', error);
    // Don't throw error to avoid breaking order update
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
    console.log('✅ Manual subscription creation completed for order:', orderId);
    
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
    console.log('Firebase not enabled, returning mock subscriptions');
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
    console.log('✅ Subscriptions loaded from Firebase:', subscriptions.length);
    return subscriptions;
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

// Get customer subscriptions
export const getCustomerSubscriptions = async (customerEmail: string): Promise<Subscription[]> => {
  if (!FIREBASE_ENABLED || !db || !subscriptionsCollection) {
    console.log('Firebase not enabled, returning mock customer subscriptions');
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
      console.log('📋 Firebase Index Info: Composite index not available for subscriptions query');
      console.log('🔄 Using fallback: Simple query with manual sorting');
      console.log('💡 To improve performance, create index: https://console.firebase.google.com/v1/r/project/wafarle-63a71/firestore/indexes');
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
    
    console.log('✅ Customer subscriptions loaded:', subscriptions.length);
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
    console.log('Firebase not enabled, simulating subscription creation');
    return Promise.resolve('mock-subscription-id');
  }

  try {
    const docRef = await addDoc(subscriptionsCollection, {
      ...subscription,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Subscription added successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

// Update subscription
export const updateSubscription = async (id: string, updates: Partial<Subscription>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, simulating subscription update');
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
      console.log('✅ Subscription updated successfully:', id);
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
    console.log('Firebase not enabled, simulating subscription deletion');
    return Promise.resolve();
  }

  try {
    const subscriptionRef = doc(db, 'subscriptions', id);
    await deleteDoc(subscriptionRef);
    console.log('✅ Subscription deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// Subscribe to subscriptions changes
export const subscribeToSubscriptions = (callback: (subscriptions: Subscription[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !subscriptionsCollection) {
    console.log('Firebase not enabled, using mock subscriptions for subscription');
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
    console.log('Firebase not enabled, using mock customer subscriptions for subscription');
    const customerSubs = mockSubscriptions.filter(sub => 
      sub.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    callback(customerSubs.map(sub => ({
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
    console.log('📋 Real-time Subscriptions: Using simple query due to missing composite index');
    console.log('💡 Create index for better performance: https://console.firebase.google.com/v1/r/project/wafarle-63a71/firestore/indexes');
  }
  
  return onSnapshot(q, (snapshot) => {
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
    
    callback(subscriptions);
  }, (error) => {
    console.error('Error in subscription listener:', error);
    // Fallback to mock data on error
    const customerSubs = mockSubscriptions.filter(sub => 
      sub.customerEmail.toLowerCase() === customerEmail.toLowerCase()
    );
    callback(customerSubs.map(sub => ({
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
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    snapchat: '',
    telegram: ''
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
    console.log('Firebase not enabled, using default settings');
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
    console.log('Firebase not enabled, simulating settings update');
    console.log('Settings would be saved:', settings);
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
    
    console.log('✅ Website settings updated successfully');
    
    // If maintenance mode changed, log it specially
    if (settings.website.maintenanceMode) {
      console.log('🚧 Maintenance mode ENABLED');
    } else {
      console.log('✅ Maintenance mode DISABLED');
    }
  } catch (error) {
    console.error('Error updating website settings:', error);
    throw error;
  }
};

// Subscribe to settings changes
export const subscribeToWebsiteSettings = (callback: (settings: AllSettings) => void) => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, using default settings for subscription');
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
let mockBlogPosts: BlogPost[] = [];

// Save to localStorage
const saveMockBlogPostsToStorage = (posts: BlogPost[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('mockBlogPosts', JSON.stringify(posts));
      console.log('💾 [STORAGE] Blog posts saved to localStorage');
    } catch (error) {
      console.warn('Error saving blog posts to localStorage:', error);
    }
  }
};

// Load from localStorage if available
const loadMockBlogPostsFromStorage = (): BlogPost[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mockBlogPosts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : undefined,
        }));
      }
    } catch (error) {
      console.warn('Error loading blog posts from localStorage:', error);
    }
  }
  return [];
};

// Initialize mock data immediately
function initializeMockBlogPosts() {
  // First try to load from localStorage
  const storedPosts = loadMockBlogPostsFromStorage();
  
  if (storedPosts && storedPosts.length > 0) {
    mockBlogPosts = storedPosts;
    console.log('🔄 [INIT] Loaded', storedPosts.length, 'blog posts from localStorage');
    console.log('🔄 [INIT] Available IDs:', mockBlogPosts.map(p => p.id));
    return;
  }
  
  // If no stored posts, create default ones
  // If no stored posts, create default ones
  mockBlogPosts = [
    {
      id: 'qRBK8o4e9wPR9wwzawOi', // Real Firebase-like ID for testing
      title: 'مستقبل الذكاء الاصطناعي في الأعمال التجارية',
      slug: 'future-of-ai-in-business',
      excerpt: 'كيف يمكن للذكاء الاصطناعي أن يغير وجه الأعمال التجارية في السنوات القادمة ويخلق فرص جديدة للنمو والابتكار.',
    content: `<h2>مقدمة</h2>
<p>يشهد عالم الأعمال اليوم تحولاً جذرياً مع تطور تقنيات الذكاء الاصطناعي...</p>
<h3>التطبيقات الحالية للذكاء الاصطناعي</h3>
<ul>
<li>خدمة العملاء الآلية</li>
<li>تحليل البيانات والتنبؤات</li>
<li>التسويق الشخصي</li>
</ul>`,
    featuredImage: '/api/placeholder/800/400',
    images: ['/api/placeholder/800/400', '/api/placeholder/600/300', '/api/placeholder/700/350'],
    categoryId: '1',
    tags: ['ai', 'business', 'technology'],
    authorId: 'admin',
    authorName: 'فريق التحرير',
    status: 'published',
    visibility: 'public',
    publishedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20'),
    viewCount: 245,
    likesCount: 32,
    commentsCount: 8,
    seoTitle: 'مستقبل الذكاء الاصطناعي في الأعمال التجارية - دليل شامل',
    seoDescription: 'اكتشف كيف سيغير الذكاء الاصطناعي الأعمال التجارية في المستقبل وما هي الفرص والتحديات المتوقعة.',
    seoKeywords: ['ذكاء اصطناعي', 'أعمال', 'تقنية', 'مستقبل'],
    readingTime: 8,
    language: 'ar',
    featured: true
  },
  {
    id: 'xM3nP9fG2hR5kL8sT4vW', // Real Firebase-like ID for testing
    title: '10 نصائح لبدء مشروعك التقني الناجح',
    slug: '10-tips-successful-tech-startup',
    excerpt: 'دليل عملي للمبتدئين في عالم ريادة الأعمال التقنية مع نصائح مجربة من خبراء في المجال.',
    content: `<h2>البداية الصحيحة لمشروعك التقني</h2>
<p>بدء مشروع تقني ناجح يتطلب التخطيط والإعداد المناسب...</p>
<h3>النصائح الأساسية</h3>
<ol>
<li>ابحث عن مشكلة حقيقية لحلها</li>
<li>ادرس السوق والمنافسين</li>
<li>ابن فريق متكامل</li>
</ol>`,
    featuredImage: '/api/placeholder/800/400',
    images: ['/api/placeholder/800/400', '/api/placeholder/500/250'],
    categoryId: '2',
    tags: ['startup', 'entrepreneurship', 'tips'],
    authorId: 'admin',
    authorName: 'أحمد محمد',
    status: 'published',
    visibility: 'public',
    publishedAt: new Date('2024-01-18'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    viewCount: 189,
    likesCount: 27,
    commentsCount: 5,
    seoTitle: '10 نصائح لبدء مشروعك التقني الناجح - دليل ريادة الأعمال',
    seoDescription: 'تعلم كيفية بدء مشروعك التقني بنجاح مع 10 نصائح عملية من خبراء ريادة الأعمال.',
    seoKeywords: ['startup', 'entrepreneurship', 'tips', 'business'],
    readingTime: 6,
    language: 'ar',
    featured: false
  },
  {
    id: 'A7dK9mN4pQ8rS2vY6zC1', // Real Firebase-like ID for testing  
    title: 'دليل التسويق الرقمي للمبتدئين',
    slug: 'digital-marketing-guide-beginners',
    excerpt: 'تعلم أساسيات التسويق الرقمي خطوة بخطوة مع استراتيجيات عملية لتنمية أعمالك عبر الإنترنت.',
    content: `<h2>ما هو التسويق الرقمي؟</h2>
<p>التسويق الرقمي هو استخدام القنوات الرقمية للترويج للمنتجات والخدمات...</p>
<h3>أهم القنوات</h3>
<ul>
<li>وسائل التواصل الاجتماعي</li>
<li>البريد الإلكتروني</li>
<li>محركات البحث</li>
</ul>`,
    featuredImage: '/api/placeholder/800/400',
    images: ['/api/placeholder/800/400', '/api/placeholder/400/200'],
    categoryId: '1',
    tags: ['marketing', 'digital', 'social-media'],
    authorId: 'admin',
    authorName: 'سارة أحمد',
    status: 'published',
    visibility: 'public',
    publishedAt: new Date('2024-01-16'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
    viewCount: 156,
    likesCount: 19,
    commentsCount: 3,
    seoTitle: 'دليل التسويق الرقمي للمبتدئين - استراتيجيات التسويق الإلكتروني',
    seoDescription: 'دليل شامل للمبتدئين في التسويق الرقمي مع أفضل الاستراتيجيات والأدوات المجانية.',
    seoKeywords: ['تسويق رقمي', 'تسويق إلكتروني', 'وسائل التواصل الاجتماعي'],
    readingTime: 5,
    language: 'ar',
    featured: false
  }
];
  console.log('🔧 [INIT] Mock blog posts initialized:', mockBlogPosts.length, 'posts');
  console.log('🔧 [INIT] Available IDs:', mockBlogPosts.map(p => p.id));
  
  // Save initial posts to localStorage
  saveMockBlogPostsToStorage(mockBlogPosts);
}

// Initialize immediately - force execution
console.log('🔧 [STARTUP] Forcing mock blog posts initialization...');
initializeMockBlogPosts();
console.log('🔧 [STARTUP] Initialization complete. Posts count:', mockBlogPosts.length);

const mockBlogTags: BlogTag[] = [
  { id: '1', name: 'ذكاء اصطناعي', slug: 'ai', color: '#3B82F6', postsCount: 3, createdAt: new Date() },
  { id: '2', name: 'ريادة الأعمال', slug: 'entrepreneurship', color: '#10B981', postsCount: 5, createdAt: new Date() },
  { id: '3', name: 'تسويق رقمي', slug: 'digital-marketing', color: '#F59E0B', postsCount: 4, createdAt: new Date() },
  { id: '4', name: 'برمجة', slug: 'programming', color: '#8B5CF6', postsCount: 6, createdAt: new Date() },
  { id: '5', name: 'تطبيقات موبايل', slug: 'mobile-apps', color: '#EF4444', postsCount: 2, createdAt: new Date() }
];

// Blog Categories Functions
export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, using mock categories');
    return mockCategories;
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
    return mockCategories;
  }
};

export const addBlogCategory = async (categoryData: Omit<BlogCategory, 'id' | 'createdAt' | 'updatedAt' | 'postsCount'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db) {
    console.log('Firebase not enabled, simulating category creation');
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
    console.log('Firebase not enabled, using mock posts. Total posts:', mockBlogPosts.length);
    console.log('Mock posts summary:', mockBlogPosts.map(p => ({ id: p.id, title: p.title, status: p.status })));
    let filteredPosts = [...mockBlogPosts];
    
    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status);
    }
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.categoryId === category);
    }
    if (limit) {
      filteredPosts = filteredPosts.slice(0, limit);
    }
    
    return filteredPosts;
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
    return mockBlogPosts;
  }
};

export const getBlogPost = async (slugOrId: string): Promise<BlogPost | null> => {
  console.log('🚀 [GET_BLOG_POST] Called with ID/slug:', slugOrId);
  
  if (!FIREBASE_ENABLED || !db) {
    console.log('🔍 [GET_BLOG_POST] Using mock data, searching for:', slugOrId);
    
    // Ensure mock data is initialized
    initializeMockBlogPosts();
    
    console.log('📋 [GET_BLOG_POST] Available posts:', mockBlogPosts.map(p => ({ id: p.id, title: p.title })));
    
    // Search by ID first, then by slug
    let foundPost = mockBlogPosts.find(post => post.id === slugOrId);
    if (!foundPost) {
      foundPost = mockBlogPosts.find(post => post.slug === slugOrId);
      console.log('🔄 [GET_BLOG_POST] ID not found, tried slug search...');
    }
    
    if (foundPost) {
      console.log('✅ [GET_BLOG_POST] SUCCESS: Found post -', foundPost.title);
      return foundPost;
    } else {
      console.log('❌ [GET_BLOG_POST] FAILED: Post not found');
      console.log('❌ [GET_BLOG_POST] Available IDs:', mockBlogPosts.map(p => p.id));
      return null;
    }
  }

  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const postQuery = query(collection(db, 'blogPosts'), where('slug', '==', slugOrId));
    const snapshot = await getDocs(postQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate() || new Date(),
      publishedAt: (doc.data() as any).publishedAt?.toDate() || null,
      scheduledAt: (doc.data() as any).scheduledAt?.toDate() || null
    } as BlogPost;
  } catch (error) {
    console.error('Error getting blog post:', error);
    return null;
  }
};

export const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likesCount' | 'commentsCount'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db) {
    // Mock implementation for development - add to mockBlogPosts array
    const newId = generateFirebaseId(); // Generate Firebase-like ID
    const newPost: BlogPost = {
      ...postData,
      id: newId,
      viewCount: 0,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockBlogPosts.unshift(newPost);
    saveMockBlogPostsToStorage(mockBlogPosts); // Save to localStorage
    console.log('✅ Mock blog post created successfully:', newId, newPost.title);
    console.log('💾 New blog post saved to storage');
    return newId;
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
  console.log('📝 [UPDATE_BLOG_POST] Called with ID:', id);
  console.log('📝 [UPDATE_BLOG_POST] FIREBASE_ENABLED:', FIREBASE_ENABLED);
  console.log('📝 [UPDATE_BLOG_POST] db exists:', !!db);
  
  if (!FIREBASE_ENABLED || !db) {
    console.log('📝 [UPDATE_BLOG_POST] Using mock data for update');
    console.log('📝 [UPDATE_BLOG_POST] Updating mock blog post ID:', id);
    console.log('📝 [UPDATE_BLOG_POST] Update data:', postData);
    
    // Force reinitialize to ensure we have the latest data
    initializeMockBlogPosts();
    
    const index = mockBlogPosts.findIndex(post => post.id === id);
    console.log('📝 [UPDATE_BLOG_POST] Found post at index:', index);
    
    if (index !== -1) {
      const oldPost = mockBlogPosts[index];
      mockBlogPosts[index] = { 
        ...oldPost, 
        ...postData,
        updatedAt: new Date()
      };
      saveMockBlogPostsToStorage(mockBlogPosts); // Save to localStorage
      console.log('✅ [UPDATE_BLOG_POST] Mock blog post updated successfully');
      console.log('✅ [UPDATE_BLOG_POST] Updated post:', mockBlogPosts[index].title);
      console.log('💾 Updated post saved to storage');
      return;
    } else {
      console.warn('❌ [UPDATE_BLOG_POST] Mock blog post not found for ID:', id);
      console.warn('❌ [UPDATE_BLOG_POST] Available IDs:', mockBlogPosts.map(p => p.id));
      throw new Error(`Post with ID ${id} not found in mock data`);
    }
  }

  try {
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    await updateDoc(doc(db, 'blogPosts', id), {
      ...postData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db) {
    // Mock implementation for development - remove from mockBlogPosts array
    console.log('Firebase not enabled, deleting mock blog post:', id);
    const index = mockBlogPosts.findIndex(post => post.id === id);
    if (index !== -1) {
      const deletedPost = mockBlogPosts.splice(index, 1)[0];
      saveMockBlogPostsToStorage(mockBlogPosts); // Save to localStorage
      console.log('✅ Mock blog post deleted successfully:', deletedPost.title);
      console.log('💾 Deletion saved to storage');
    } else {
      console.warn('Mock blog post not found for ID:', id);
    }
    return;
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
    console.log('Firebase not enabled, using mock tags');
    return mockBlogTags;
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
    return mockBlogTags;
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
      await updateDoc(doc(db, 'blogPosts', postId), {
        likesCount,
        updatedAt: new Date()
      });
    }
    // Mock implementation for development
    console.log(`Updated likes for post ${postId} to ${likesCount}`);
  } catch (error) {
    console.error('Error updating blog post likes:', error);
    throw error;
  }
};

export const incrementBlogPostViews = async (postId: string): Promise<void> => {
  try {
    if (USE_FIREBASE) {
      await updateDoc(doc(db, 'blogPosts', postId), {
        views: increment(1),
        updatedAt: new Date()
      });
    }
    // Mock implementation for development
    console.log(`Incremented views for post ${postId}`);
  } catch (error) {
    console.error('Error incrementing blog post views:', error);
    throw error;
  }
};

export const getFeaturedBlogPosts = async (limit = 3): Promise<BlogPost[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return mockBlogPosts.filter(post => post.featured).slice(0, limit);
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
    return mockBlogPosts.filter(post => post.featured).slice(0, limit);
  }
};
