'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Search,
  Clock,
  User,
  Send,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  Headphones,
  Users,
  Plus,
  Package,
  ShoppingCart,
  X,
  Calendar
} from 'lucide-react';
import { getChatMessages, sendChatMessage, subscribeToChatMessages, getChatConversations, subscribeToChatConversations, getProducts, addOrder, addSubscription } from '@/lib/database';
import { ChatMessage, ChatConversation, Product } from '@/lib/firebase';
import { Button, Modal } from '@/components/admin';

interface ChatTabProps {
  onMessagesCountChange?: (count: number) => void;
}

const ChatTab = ({ onMessagesCountChange }: ChatTabProps) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ChatConversation['status']>('all');
  const [loading, setLoading] = useState(false);
  const [showIndexWarning, setShowIndexWarning] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    productId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: ''
  });
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    productId: '',
    customerName: '',
    customerEmail: '',
    planType: 'شهري',
    durationMonths: 1,
    notes: ''
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    open: 'bg-green-100 text-green-800 border-green-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conv as any).subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Load conversations and products on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load conversations
        const convs = await getChatConversations();
        setConversations(convs);
        
        // Load products
        const prods = await getProducts();
        setProducts(prods);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToChatConversations((convs) => {
      setConversations(convs);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    onMessagesCountChange?.(conversations.filter(c => (c as any).status === 'pending').length);
  }, [conversations, onMessagesCountChange]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const msgs = await getChatMessages(conversationId);
      setMessages(msgs);
      setShowIndexWarning(false); // Reset warning on success
    } catch (error: any) {
      console.error('Error loading messages:', error);
      
      // Check if it's an index error
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        setShowIndexWarning(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageToSend = newMessage.trim(); // Save message before clearing
    
    try {
      setLoading(true);
      setNewMessage(''); // Clear input immediately for better UX
      
      await sendChatMessage(
        selectedConversation.id,
        messageToSend,
        'support',
        'سارة - فريق الدعم',
        undefined // Support agents don't need email
      );
      
      // Reload messages to get the new message
      await loadMessages(selectedConversation.id);
      
      // Update the conversation in the list to reflect the new message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: messageToSend, lastMessageTime: new Date() }
          : conv
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageToSend); // Restore message on error
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  // Open order form with customer info pre-filled
  const handleCreateOrder = () => {
    if (selectedConversation) {
      setOrderFormData({
        productId: '',
        customerName: selectedConversation.customerName,
        customerEmail: selectedConversation.customerEmail || '',
        customerPhone: '',
        notes: `طلب من الشات - محادثة ${selectedConversation.id}`
      });
      setShowOrderForm(true);
    }
  };

  // Open subscription form with customer info pre-filled
  const handleCreateSubscription = () => {
    if (selectedConversation) {
      setSubscriptionFormData({
        productId: '',
        customerName: selectedConversation.customerName,
        customerEmail: selectedConversation.customerEmail || '',
        planType: 'شهري',
        durationMonths: 1,
        notes: `اشتراك من الشات - محادثة ${selectedConversation.id}`
      });
      setShowSubscriptionForm(true);
    }
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (!orderFormData.productId || !orderFormData.customerName || !orderFormData.customerEmail) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      
      const selectedProduct = products.find(p => p.id === orderFormData.productId);
      if (!selectedProduct) {
        alert('المنتج غير موجود');
        return;
      }

      const orderData = {
        customerName: orderFormData.customerName,
        email: orderFormData.customerEmail,
        phone: orderFormData.customerPhone || 'غير محدد',
        product: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          image: selectedProduct.image,
          quantity: 1,
        },
        totalPrice: selectedProduct.price,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        paymentMethod: 'cash',
        notes: orderFormData.notes
      };

      await addOrder(orderData);
      
      // Send notification message in chat
      if (selectedConversation) {
        await sendChatMessage(
          selectedConversation.id,
          `✅ تم إنشاء طلب جديد:\n📦 المنتج: ${selectedProduct.name}\n💰 السعر: $${selectedProduct.price}\n📋 الحالة: بانتظار التأكيد`,
          'support',
          'فريق الدعم - نظام الطلبات',
          undefined
        );
        await loadMessages(selectedConversation.id);
      }

      setShowOrderForm(false);
      setOrderFormData({ productId: '', customerName: '', customerEmail: '', customerPhone: '', notes: '' });
      alert('تم إنشاء الطلب بنجاح! 🎉');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('حدث خطأ في إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  // Submit subscription
  const handleSubmitSubscription = async () => {
    if (!subscriptionFormData.productId || !subscriptionFormData.customerName || !subscriptionFormData.customerEmail) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      
      const selectedProduct = products.find(p => p.id === subscriptionFormData.productId);
      if (!selectedProduct) {
        alert('المنتج غير موجود');
        return;
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + subscriptionFormData.durationMonths);
      const remainingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      const subscriptionData = {
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        duration: `${subscriptionFormData.durationMonths} شهر`,
        features: selectedProduct.features || [],
        isActive: true,
      };

      await addSubscription(subscriptionData);
      
      // Send notification message in chat
      if (selectedConversation) {
        await sendChatMessage(
          selectedConversation.id,
          `🎉 تم إنشاء اشتراك جديد:\n📦 المنتج: ${selectedProduct.name}\n📅 المدة: ${subscriptionFormData.durationMonths} شهر\n💎 النوع: ${subscriptionFormData.planType}\n🟢 الحالة: نشط`,
          'support',
          'فريق الدعم - نظام الاشتراكات',
          undefined
        );
        await loadMessages(selectedConversation.id);
      }

      setShowSubscriptionForm(false);
      setSubscriptionFormData({ productId: '', customerName: '', customerEmail: '', planType: 'شهري', durationMonths: 1, notes: '' });
      alert('تم إنشاء الاشتراك بنجاح! 🎉');
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('حدث خطأ في إنشاء الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة المحادثات</h2>
          <p className="text-gray-600">تتبع ورد على استفسارات العملاء</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            تحديث
          </Button>
          <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            <span className="text-sm font-medium">متصل</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المحادثات النشطة</p>
              <p className="text-2xl font-bold text-blue-600">
                {conversations.filter(c => c.status === 'open').length}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">في الانتظار</p>
              <p className="text-2xl font-bold text-yellow-600">
                {conversations.filter(c => c.status === 'open' && !c.lastMessage).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مغلقة اليوم</p>
              <p className="text-2xl font-bold text-green-600">
                {conversations.filter(c => c.status === 'closed').length}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عالية الأولوية</p>
              <p className="text-2xl font-bold text-red-600">
                {conversations.filter(c => c.status === 'open' && c.unreadCount && c.unreadCount > 0).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-2 bg-white rounded-lg border overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في المحادثات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="active">نشطة</option>
              <option value="closed">مغلقة</option>
            </select>
          </div>

          {/* Conversations */}
          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{conversation.customerName}</h4>
                      <p className="text-xs text-gray-500">{conversation.customerEmail}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {conversation.lastMessageTime ? formatRelativeTime(conversation.lastMessageTime) : 'لا توجد رسائل'}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {conversation.lastMessage}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[conversation.status]}`}>
                    {conversation.status === 'open' ? 'نشطة' : 'مغلقة'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[(conversation as any).priority as keyof typeof priorityColors] || priorityColors.low}`}>
                    {(conversation as any).priority === 'low' ? 'منخفضة' :
                     (conversation as any).priority === 'medium' ? 'متوسطة' :
                     (conversation as any).priority === 'high' ? 'عالية' : 'منخفضة'}
                  </span>
                </div>
              </motion.div>
            ))}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد محادثات</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-3 bg-white rounded-lg border overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.customerName}</h3>
                      <p className="text-sm text-gray-600">{selectedConversation.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedConversation.status]}`}>
                      {selectedConversation.status === 'open' ? 'نشطة' : 'مغلقة'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[(selectedConversation as any).priority as keyof typeof priorityColors] || priorityColors.low}`}>
                      {(selectedConversation as any).priority === 'low' ? 'منخفضة' :
                       (selectedConversation as any).priority === 'medium' ? 'متوسطة' :
                       (selectedConversation as any).priority === 'high' ? 'عالية' : 'منخفضة'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateOrder}
                    icon={<ShoppingCart className="w-4 h-4" />}
                    disabled={selectedConversation.status === 'closed'}
                  >
                    إنشاء طلب
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleCreateSubscription}
                    icon={<Package className="w-4 h-4" />}
                    disabled={selectedConversation.status === 'closed'}
                  >
                    إنشاء اشتراك
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Firebase Index Warning */}
                  {showIndexWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-orange-800 mb-1">
                            تحسين الأداء - Firebase Index
                          </p>
                          <p className="text-orange-700 mb-2">
                            لتحسين سرعة تحميل الرسائل، يُنصح بإنشاء فهرس Firebase. النظام يعمل حالياً مع ترتيب يدوي.
                          </p>
                          <div className="flex items-center gap-3">
                            <a
                              href="https://console.firebase.google.com/v1/r/project/wafarle-63a71/firestore/indexes?create_composite=ClJwcm9qZWN0cy93YWZhcmxlLTYzYTcxL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jaGF0TWVzc2FnZXMvaW5kZXhlcy9fEAEaEgoOY29udmVyc2F0aW9uSWQQARoNCgl0aW1lc3RhbXAQARoMCghfX25hbWVfXxAB"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition-colors"
                            >
                              إنشاء الفهرس
                            </a>
                            <button
                              onClick={() => setShowIndexWarning(false)}
                              className="text-xs text-orange-600 hover:text-orange-700"
                            >
                              إخفاء التحذير
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {loading && messages.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.senderType === 'staff' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] ${message.senderType === 'staff' ? 'text-right' : 'text-right'}`}>
                          <div className={`inline-block px-4 py-2 rounded-2xl ${
                            message.senderType === 'staff'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.senderName} • {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب ردك..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    disabled={selectedConversation.status === 'closed'}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || loading || selectedConversation.status === 'closed'}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>إرسال</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">اختر محادثة</h3>
                <p className="text-sm">اختر محادثة من القائمة للبدء في الرد</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Form Modal */}
      <Modal
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        title="إنشاء طلب جديد"
        icon={<ShoppingCart className="w-5 h-5" />}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <User className="w-4 h-4" />
              <span className="font-medium">معلومات العميل</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {orderFormData.customerName} ({orderFormData.customerEmail})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنتج المطلوب *
            </label>
            <select
              value={orderFormData.productId}
              onChange={(e) => setOrderFormData({ ...orderFormData, productId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر المنتج</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={orderFormData.customerPhone}
              onChange={(e) => setOrderFormData({ ...orderFormData, customerPhone: e.target.value })}
              placeholder="رقم الهاتف (اختياري)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={orderFormData.notes}
              onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
              placeholder="ملاحظات إضافية..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowOrderForm(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitOrder}
              loading={loading}
              icon={<Plus className="w-4 h-4" />}
            >
              إنشاء الطلب
            </Button>
          </div>
        </div>
      </Modal>

      {/* Subscription Form Modal */}
      <Modal
        isOpen={showSubscriptionForm}
        onClose={() => setShowSubscriptionForm(false)}
        title="إنشاء اشتراك جديد"
        icon={<Package className="w-5 h-5" />}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <User className="w-4 h-4" />
              <span className="font-medium">معلومات العميل</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {subscriptionFormData.customerName} ({subscriptionFormData.customerEmail})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنتج المطلوب *
            </label>
            <select
              value={subscriptionFormData.productId}
              onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, productId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">اختر المنتج</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الخطة
              </label>
              <select
                value={subscriptionFormData.planType}
                onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, planType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="شهري">شهري</option>
                <option value="ربع سنوي">ربع سنوي</option>
                <option value="نصف سنوي">نصف سنوي</option>
                <option value="سنوي">سنوي</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدة (بالأشهر)
              </label>
              <input
                type="number"
                value={subscriptionFormData.durationMonths}
                onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, durationMonths: parseInt(e.target.value) || 1 })}
                min="1"
                max="36"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={subscriptionFormData.notes}
              onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, notes: e.target.value })}
              placeholder="ملاحظات إضافية..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>ملاحظة:</strong> سيتم تفعيل الاشتراك فوراً وسيكون ساري لمدة {subscriptionFormData.durationMonths} شهر من اليوم.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowSubscriptionForm(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={handleSubmitSubscription}
              loading={loading}
              icon={<Plus className="w-4 h-4" />}
            >
              إنشاء الاشتراك
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatTab;
