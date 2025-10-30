'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrCreateConversation, sendChatMessage, getChatMessages, subscribeToChatMessages, getProducts, addSubscription, addOrder, getOrders } from '@/lib/database';
import { ChatMessage, Product, Order } from '@/lib/firebase';
import { useFormatPrice } from '@/contexts/CurrencyContext';
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  User,
  Bot,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Headphones,
  Smile,
  FileText,
  Receipt,
  Download
} from 'lucide-react';

// Using ChatMessage interface from database
type Message = ChatMessage & {
  status?: 'sending' | 'sent' | 'delivered' | 'read';
};

interface LiveChatProps {
  customerName?: string;
  customerEmail?: string;
}

const LiveChat = ({ customerName = 'عميل', customerEmail }: LiveChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineAgents] = useState(3);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptionFlow, setSubscriptionFlow] = useState<{
    active: boolean;
    step: 'product' | 'duration' | 'confirmation';
    selectedProduct?: Product;
    selectedDuration?: number;
    selectedPlan?: string;
  }>({
    active: false,
    step: 'product'
  });
  
  const [invoiceFlow, setInvoiceFlow] = useState<{
    active: boolean;
    step: 'loading' | 'selection' | 'generating';
    customerOrders?: Order[];
    selectedOrder?: Order;
  }>({
    active: false,
    step: 'loading'
  });
  
  const { formatPrice } = useFormatPrice();

  // Quick responses
  const quickResponses = [
    'مشكلة في الاشتراك',
    'استفسار عن الدفع',
    'طلب إلغاء',
    'مشكلة تقنية',
    '🛒 أريد طلب منتج جديد',
    '💎 أريد اشتراك جديد',
    '🧾 أريد طلب فاتورة'
  ];

  // Handle subscription flow
  const startSubscriptionFlow = () => {
    setSubscriptionFlow({
      active: true,
      step: 'product'
    });
    
    // Send products list message
    setTimeout(() => {
      sendChatMessage(
        conversationId!,
        'اختر المنتج الذي تريد الاشتراك فيه:',
        'support',
        'سارة - فريق الدعم',
        undefined
      );
    }, 1000);
  };

  const handleProductSelection = async (product: Product) => {
    setSubscriptionFlow(prev => ({
      ...prev,
      step: 'duration',
      selectedProduct: product
    }));

    // Send duration options message
    await sendChatMessage(
      conversationId!,
      `ممتاز! اخترت ${product.name}\n\nالآن اختر مدة الاشتراك:`,
      'support',
      'سارة - فريق الدعم',
      undefined
    );
  };

  const handleDurationSelection = async (duration: number, planType: string) => {
    const { selectedProduct } = subscriptionFlow;
    if (!selectedProduct) return;

    // Calculate price correctly based on product options or fallback to base price
    let totalPrice: number;
    
    if (selectedProduct.hasOptions && selectedProduct.options) {
      // Find the matching option
      const matchingOption = selectedProduct.options.find(option => 
        option.duration === duration && option.name === planType
      );
      
      if (matchingOption) {
        totalPrice = matchingOption.price;
      } else {
        // Fallback: calculate based on base price
        totalPrice = selectedProduct.price * duration;
      }
    } else {
      // No options available, use base price calculation
      totalPrice = selectedProduct.price * duration;
    }

    // Ensure price is never 0 or invalid
    if (!totalPrice || totalPrice <= 0) {
      console.error('Invalid price calculated:', totalPrice, 'for product:', selectedProduct.name);
      totalPrice = selectedProduct.price || 1; // Fallback to base price or minimum of 1
    }

    setSubscriptionFlow(prev => ({
      ...prev,
      step: 'confirmation',
      selectedDuration: duration,
      selectedPlan: planType
    }));

    // Send confirmation message with correct price
    await sendChatMessage(
      conversationId!,
      `📋 **تفاصيل اشتراكك:**\n\n📦 المنتج: ${selectedProduct.name}\n⏰ المدة: ${duration} شهر (${planType})\n💰 السعر الإجمالي: ${formatPrice(totalPrice)}\n\n✅ هل تؤكد هذا الاشتراك؟`,
      'support',
      'سارة - فريق الدعم',
      undefined
    );
  };

  const handleSubscriptionConfirmation = async (confirmed: boolean) => {
    const { selectedProduct, selectedDuration, selectedPlan } = subscriptionFlow;
    
    if (confirmed && selectedProduct && selectedDuration) {
      // التحقق من نوع المنتج: المنتجات الملموسة أو التي تحتاج تنزيل لا يمكن أن تكون اشتراكات
      if (selectedProduct.productType === 'physical' || selectedProduct.productType === 'download') {
        if (conversationId) {
          await sendChatMessage(
            conversationId,
            `❌ عذراً، المنتج "${selectedProduct.name}" من نوع ${selectedProduct.productType === 'physical' ? 'منتج ملموس' : 'منتج يحتاج تنزيل'} ولا يمكن إنشاء اشتراك له.\n\n💡 يمكنك طلب هذا المنتج من صفحة المنتجات مباشرة.`,
            'support',
            'نظام الدعم',
            undefined
          );
        }
        setSubscriptionFlow({ active: false, step: 'product' });
        return;
      }

      try {
        // Calculate correct price based on product options
        let finalPrice: number;
        
        if (selectedProduct.hasOptions && selectedProduct.options) {
          // Find the matching option
          const matchingOption = selectedProduct.options.find(option => 
            option.duration === selectedDuration && option.name === selectedPlan
          );
          
          if (matchingOption) {
            finalPrice = matchingOption.price;
          } else {
            // Fallback: calculate based on base price
            finalPrice = selectedProduct.price * selectedDuration;
          }
        } else {
          // No options available, use base price calculation
          finalPrice = selectedProduct.price * selectedDuration;
        }

        // Ensure price is never 0 or invalid
        if (!finalPrice || finalPrice <= 0) {
          console.error('Invalid final price:', finalPrice, 'for product:', selectedProduct.name);
          finalPrice = selectedProduct.price || 1; // Fallback to base price or minimum of 1
        }

        // Create subscription in database
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + selectedDuration);
        const remainingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // First create an order
        const orderData = {
          customerName: customerName || 'عميل من الشات',
          customerEmail: customerEmail || 'unknown@example.com',
          customerPhone: 'غير متوفر', // Will be updated if provided
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productPrice: finalPrice / selectedDuration, // Price per month
          quantity: selectedDuration, // Duration as quantity
          totalAmount: finalPrice,
          status: 'confirmed' as const, // Auto-confirm chat orders
          paymentStatus: 'unpaid' as const, // Will be updated after payment
          paymentMethod: 'card' as const, // Default method
          notes: `طلب من الشات - ${selectedPlan} لمدة ${selectedDuration} شهر - محادثة ${conversationId || 'unknown'}`
        };

        console.log('📋 Creating order first:', orderData);
        const orderId = await addOrder(orderData);
        console.log('✅ Order created with ID:', orderId);

        // Then create subscription linked to the order
        const subscriptionData = {
          orderId: orderId, // Link to the actual order
          customerId: customerEmail || 'unknown',
          customerEmail: customerEmail || 'unknown@example.com',
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          productImage: selectedProduct.image,
          planType: selectedPlan || 'monthly',
          price: finalPrice,
          startDate: startDate,
          endDate: endDate,
          durationMonths: selectedDuration,
          status: 'pending' as const, // Pending until payment
          autoRenewal: false,
          paymentStatus: 'unpaid' as const, // Will be updated after payment
          remainingDays: remainingDays,
          usageCount: 0,
          maxUsage: 9999,
          features: selectedProduct.features || [],
          notes: `اشتراك من الشات - مرتبط بالطلب ${orderId}`
        };

        console.log('📊 Creating subscription with data:', subscriptionData);
        const subscriptionId = await addSubscription(subscriptionData);
        console.log('✅ Subscription created with ID:', subscriptionId);

        await sendChatMessage(
          conversationId!,
          `🎉 رائع! تم تأكيد طلب اشتراكك وحفظه في النظام.\n\n📦 ${selectedProduct.name}\n⏰ ${selectedDuration} شهر (${selectedPlan})\n💰 ${formatPrice(finalPrice)}\n📋 رقم الطلب: ${orderId}\n🔗 رقم الاشتراك: ${subscriptionId}\n\n📧 ستصلك تفاصيل الدفع على بريدك الإلكتروني قريباً.\n💳 بعد إتمام الدفع سيتم تفعيل اشتراكك فوراً.\n\n🎯 يمكنك متابعة حالة طلبك والاشتراك من لوحة التحكم.`,
          'support',
          'سارة - فريق الدعم',
          undefined
        );
      } catch (error) {
        console.error('Error creating subscription:', error);
        await sendChatMessage(
          conversationId!,
          'عذراً، حدث خطأ أثناء إنشاء الاشتراك. يرجى المحاولة مرة أخرى أو التواصل مع الدعم مباشرة.',
          'support',
          'سارة - فريق الدعم',
          undefined
        );
      }
    } else {
      await sendChatMessage(
        conversationId!,
        'لا مشكلة! يمكنك طلب اشتراك جديد في أي وقت. هل تحتاج مساعدة أخرى؟ 😊',
        'support',
        'سارة - فريق الدعم',
        undefined
      );
    }

    // Reset flow
    setSubscriptionFlow({
      active: false,
      step: 'product'
    });
  };

  // Handle invoice flow
  const startInvoiceFlow = async () => {
    if (!customerEmail) {
      await sendChatMessage(
        conversationId!,
        'عذراً، أحتاج لبريدك الإلكتروني أولاً لجلب طلباتك. يرجى تسجيل الدخول أو تقديم بريدك الإلكتروني.',
        'support',
        'سارة - فريق الدعم',
        undefined
      );
      return;
    }

    setInvoiceFlow({
      active: true,
      step: 'loading'
    });
    
    try {
      // جلب جميع الطلبات للعميل
      const allOrders = await getOrders();
      const customerOrders = allOrders.filter(order =>
        order.customerEmail.toLowerCase() === customerEmail.toLowerCase() &&
        order.paymentStatus === 'paid' // فقط الطلبات المدفوعة
      );

      if (customerOrders.length === 0) {
        await sendChatMessage(
          conversationId!,
          'لم أجد أي طلبات مدفوعة في حسابك حتى الآن. عندما تكمل أي طلب وتدفع ثمنه، ستتمكن من طلب فاتورة له.',
          'support',
          'سارة - فريق الدعم',
          undefined
        );
        
        setInvoiceFlow({
          active: false,
          step: 'loading'
        });
        return;
      }

      setInvoiceFlow({
        active: true,
        step: 'selection',
        customerOrders: customerOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // الأحدث أولاً
      });

      // إرسال رسالة مع قائمة الطلبات
      await sendChatMessage(
        conversationId!,
        `وجدت ${customerOrders.length} طلب مدفوع في حسابك. يرجى اختيار الطلب الذي تريد فاتورته:`,
        'support',
        'سارة - فريق الدعم',
        undefined
      );
    } catch (error) {
      console.error('Error loading customer orders:', error);
      await sendChatMessage(
        conversationId!,
        'عذراً، حدث خطأ أثناء جلب طلباتك. يرجى المحاولة مرة أخرى.',
        'support',
        'سارة - فريق الدعم',
        undefined
      );
      
      setInvoiceFlow({
        active: false,
        step: 'loading'
      });
    }
  };

  const handleOrderSelection = async (order: Order) => {
    setInvoiceFlow(prev => ({
      ...prev,
      step: 'generating',
      selectedOrder: order
    }));

    await sendChatMessage(
      conversationId!,
      `تم اختيار الطلب رقم ${order.id.slice(-8)}. جاري إنشاء الفاتورة...`,
      'support',
      'سارة - فريق الدعم',
      undefined
    );

    // محاكاة إنشاء الفاتورة
    setTimeout(async () => {
      await generateInvoice(order);
    }, 2000);
  };

  const generateInvoice = async (order: Order) => {
    try {
      // إنشاء محتوى الفاتورة
      const invoiceContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة رقم ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f9f9f9; }
            .invoice { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
            .company-info { color: #666; font-size: 14px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info div { background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1; margin: 0 10px; }
            .customer-info { background: #e8f2ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            .items-table th { background: #4F46E5; color: white; }
            .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
            .total-amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status-paid { background: #d4edda; color: #155724; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="logo">🌟 وافرلي wafarle</div>
              <div class="company-info">
                منصة الاشتراكات الرقمية المتميزة<br>
                البريد الإلكتروني: support@wafarle.com | الهاتف: 0593607607
              </div>
            </div>

            <div class="invoice-info">
              <div>
                <h4>📋 معلومات الفاتورة</h4>
                <p><strong>رقم الفاتورة:</strong> ${order.id}</p>
                <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
                <p><strong>تاريخ الطلب:</strong> ${order.createdAt.toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <h4>💳 معلومات الدفع</h4>
                <p><strong>حالة الدفع:</strong> <span class="status-badge status-paid">مدفوع ✅</span></p>
                <p><strong>طريقة الدفع:</strong> ${
                  order.paymentMethod === 'card' ? 'بطاقة ائتمان' :
                  order.paymentMethod === 'bank_transfer' ? 'حوالة بنكية' :
                  order.paymentMethod === 'digital_wallet' ? 'محفظة رقمية' : 'نقدي'
                }</p>
                <p><strong>تاريخ الدفع:</strong> ${order.confirmedAt?.toLocaleDateString('ar-SA') || 'غير محدد'}</p>
              </div>
            </div>

            <div class="customer-info">
              <h4>👤 معلومات العميل</h4>
              <p><strong>الاسم:</strong> ${order.customerName}</p>
              <p><strong>البريد الإلكتروني:</strong> ${order.customerEmail}</p>
              <p><strong>رقم الهاتف:</strong> ${order.customerPhone}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>المنتج/الخدمة</th>
                  <th>الكمية</th>
                  <th>السعر الوحدة</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${order.productName}</td>
                  <td>${order.quantity}</td>
                  <td>${order.productPrice} ر.س</td>
                  <td>${order.totalAmount} ر.س</td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <h3>💰 المجموع الإجمالي</h3>
              <div class="total-amount">${order.totalAmount} ر.س</div>
              <p style="margin-top: 10px; color: #666;">شاملاً جميع الرسوم والضرائب</p>
            </div>

            ${order.notes ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h4 style="color: #856404;">📝 ملاحظات:</h4>
              <p style="color: #856404; margin: 0;">${order.notes}</p>
            </div>
            ` : ''}

            <div class="footer">
              <p>شكراً لاختياركم خدمات وافرلي</p>
              <p>هذه فاتورة رسمية صادرة إلكترونياً | تاريخ الإنشاء: ${new Date().toLocaleString('ar-SA')}</p>
              <p style="font-size: 12px; color: #999; margin-top: 15px;">
                🔒 هذه فاتورة محمية ومؤمنة | 🌐 www.wafarle.com | 📞 0593607607
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // إنشاء نافذة جديدة للفاتورة
      const invoiceWindow = window.open('', '_blank', 'width=800,height=900');
      if (invoiceWindow) {
        invoiceWindow.document.write(invoiceContent);
        invoiceWindow.document.close();
      }

      await sendChatMessage(
        conversationId!,
        `✅ تم إنشاء فاتورتك بنجاح!\n\n📋 **تفاصيل الفاتورة:**\n• رقم الفاتورة: ${order.id.slice(-8)}\n• المنتج: ${order.productName}\n• المبلغ: ${order.totalAmount} ر.س\n• التاريخ: ${new Date().toLocaleDateString('ar-SA')}\n\n🖨️ تم فتح الفاتورة في نافذة جديدة يمكنك طباعتها أو حفظها.\n\n💡 يمكنك دائماً طلب فاتورة أخرى إذا احتجت لها.`,
        'support',
        'سارة - فريق الدعم',
        undefined
      );

      // إعادة تعيين حالة الفاتورة
      setInvoiceFlow({
        active: false,
        step: 'loading'
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      await sendChatMessage(
        conversationId!,
        'عذراً، حدث خطأ أثناء إنشاء الفاتورة. يرجى المحاولة مرة أخرى.',
        'support',
        'سارة - فريق الدعم',
        undefined
      );
      
      setInvoiceFlow({
        active: false,
        step: 'loading'
      });
    }
  };

  // Auto responses from support
  const getAutoResponse = (message: string) => {
    if (message.includes('🛒') || message.includes('طلب منتج')) {
      return 'ممتاز! سأساعدك في إنشاء طلب جديد. سأحتاج لبعض التفاصيل منك أولاً...';
    }
    if (message.includes('💎') || message.includes('اشتراك')) {
      // Start interactive subscription flow
      setTimeout(() => startSubscriptionFlow(), 2000);
      return 'رائع! سأعرض عليك منتجاتنا المتاحة للاشتراك...';
    }
    if (message.includes('🧾') || message.includes('فاتورة')) {
      // Start interactive invoice flow
      setTimeout(() => startInvoiceFlow(), 2000);
      return 'بالطبع! سأبحث عن طلباتك المدفوعة وأعرض عليك قائمة لاختيار الطلب الذي تريد فاتورته...';
    }
    const responses = [
      'شكراً لتواصلك معنا! سأراجع طلبك الآن...',
      'فهمت مشكلتك، دعني أتحقق من تفاصيل حسابك',
      'سأقوم بتحويلك لمتخصص في هذا الأمر',
      'تم تسجيل طلبك، ستصلك إجابة خلال دقائق',
      'هل تحتاج مساعدة أخرى؟'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const loadedProducts = await getProducts();
        setProducts(loadedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, []);

  // Initialize conversation when chat opens
  useEffect(() => {
    if (isOpen && !conversationId && customerEmail && customerName) {
      initializeConversation();
    }
  }, [isOpen, customerEmail, customerName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const initializeConversation = async () => {
    if (!customerEmail || !customerName) return;

    try {
      setLoading(true);
      const convId = await getOrCreateConversation(customerEmail, customerName);
      setConversationId(convId);

      // Subscribe to real-time messages
      const unsubscribe = subscribeToChatMessages(convId, (msgs) => {
        setMessages(msgs as Message[]);
      });
      unsubscribeRef.current = unsubscribe;

      // Send welcome message if it's a new conversation
      if (messages.length === 0) {
        await sendChatMessage(
          convId,
          `أهلاً وسهلاً ${customerName}! 👋 كيف يمكنني مساعدتك اليوم؟`,
          'support',
          'سارة - فريق الدعم',
          undefined // Support agents don't need email
        );
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageContent: string = newMessage) => {
    if (!messageContent.trim() || !conversationId || !customerEmail || !customerName) return;

    try {
      setNewMessage('');
      setLoading(true);

      // Send customer message
      await sendChatMessage(
        conversationId,
        messageContent,
        'customer',
        customerName,
        customerEmail
      );

      // Simulate support typing and response
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        
        // Send auto response from support
        const responseContent = getAutoResponse(messageContent);
        await sendChatMessage(
          conversationId,
          responseContent,
          'support',
          'سارة - فريق الدعم',
          undefined // Support agents don't need email
        );
      }, 2000 + Math.random() * 3000);

    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
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

  const getMessageStatusIcon = (status?: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <CheckCircle2 className="w-3 h-3 text-gray-500" />;
      case 'read':
        return <CheckCircle2 className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-50 group"
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Notification badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          <Headphones className="w-3 h-3" />
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          دعم مباشر 24/7
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 100 }}
      className={`fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200/50 backdrop-blur-sm overflow-hidden ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } transition-all duration-300 hover:shadow-3xl`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white p-4 flex items-center justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">دعم العملاء</h3>
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="font-medium">{onlineAgents} موظف متاح الآن</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-slate-600/50"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-red-500/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto h-96 bg-gradient-to-b from-slate-50 to-slate-100/50">
            <div className="space-y-5">
              {loading && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-500 border-t-transparent"></div>
                    <span className="text-sm font-medium">جاري تحضير المحادثة...</span>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.sender === 'customer' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.sender === 'customer' 
                        ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    }`}>
                      {message.sender === 'customer' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>

                    {/* Message content */}
                    <div className={`${message.sender === 'customer' ? 'text-right' : 'text-right'}`}>
                      {message.sender === 'support' && message.senderName && (
                        <div className="text-xs text-slate-500 mb-1 font-medium">{message.senderName}</div>
                      )}
                      
                      <div className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender === 'customer'
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                      style={{
                        boxShadow: message.sender === 'customer' 
                          ? '0 4px 12px rgba(71, 85, 105, 0.3)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>

                      <div className={`flex items-center gap-1 mt-2 text-xs text-slate-500 ${
                        message.sender === 'customer' ? 'justify-end' : 'justify-start'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === 'customer' && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Interactive Invoice Flow */}
          {invoiceFlow.active && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-200/50">
              {invoiceFlow.step === 'loading' && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-emerald-800 font-semibold text-lg">جاري البحث عن طلباتك...</p>
                  <p className="text-emerald-600 text-sm mt-1">يرجى الانتظار قليلاً</p>
                </div>
              )}

              {invoiceFlow.step === 'selection' && invoiceFlow.customerOrders && (
                <div className="space-y-4">
                  <h4 className="font-bold text-emerald-900 mb-4 flex items-center text-lg">
                    <Receipt className="w-5 h-5 ml-2" />
                    اختر الطلب للحصول على فاتورته:
                  </h4>
                  <div className="grid gap-3 max-h-60 overflow-y-auto scrollbar-hide">
                    {invoiceFlow.customerOrders.map(order => (
                      <motion.button
                        key={order.id}
                        onClick={() => handleOrderSelection(order)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-right p-4 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-base">
                              طلب #{order.id.slice(-8)}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">{order.productName}</p>
                            <p className="text-sm text-emerald-600 mt-2 font-medium">
                              {order.createdAt.toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div className="text-left">
                            <div className="text-emerald-600 font-bold text-lg">
                              {order.totalAmount} ر.س
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-2">
                              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                                مدفوع ✅
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => setInvoiceFlow({ active: false, step: 'loading' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 py-3 px-4 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                  >
                    إلغاء
                  </motion.button>
                </div>
              )}

              {invoiceFlow.step === 'generating' && (
                <div className="text-center py-6">
                  <div className="animate-pulse">
                    <FileText className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  </div>
                  <p className="text-emerald-800 font-bold text-lg">جاري إنشاء الفاتورة...</p>
                  <p className="text-sm text-emerald-600 mt-2">يرجى الانتظار...</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive Subscription Flow */}
          {subscriptionFlow.active && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200/50">
              {subscriptionFlow.step === 'product' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 mb-4 text-lg">اختر المنتج:</h4>
                  <div className="grid gap-3">
                    {products.map(product => (
                      <motion.button
                        key={product.id}
                        onClick={() => handleProductSelection(product)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-right p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-base">{product.name}</p>
                            <p className="text-sm text-slate-600 mt-1">{product.description}</p>
                          </div>
                          <div className="text-slate-600 font-bold text-lg">
                            {formatPrice(product.price)}/شهر
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {subscriptionFlow.step === 'duration' && subscriptionFlow.selectedProduct && (
                <div className="space-y-4">
                  <h4 className="font-bold text-blue-900 mb-4 text-lg">اختر مدة الاشتراك:</h4>
                  <div className="grid gap-3">
                    {subscriptionFlow.selectedProduct.hasOptions && subscriptionFlow.selectedProduct.options ? (
                      // Use product options if available
                      subscriptionFlow.selectedProduct.options.map((option) => (
                        <motion.button
                          key={option.id}
                          onClick={() => handleDurationSelection(option.duration, option.name)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`text-right p-4 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md ${
                            option.isPopular ? 'ring-2 ring-blue-300 relative' : ''
                          }`}
                        >
                          {option.isPopular && (
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              الأكثر شعبية
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="text-right">
                              <p className="font-bold text-gray-900 text-base">{option.name} - {option.duration} شهر</p>
                              {option.discount && option.discount > 0 && (
                                <p className="text-sm text-green-600 mt-1 font-medium">خصم {option.discount}%</p>
                              )}
                              {option.description && (
                                <p className="text-xs text-gray-500 mt-2">{option.description}</p>
                              )}
                            </div>
                            <div className="text-left">
                              {option.originalPrice && option.originalPrice > option.price ? (
                                <>
                                  <div className="text-blue-600 font-bold text-lg">
                                    {formatPrice(option.price)} <span className="text-xs text-gray-600">إجمالي</span>
                                  </div>
                                  <div className="text-xs text-gray-500 line-through">
                                    {formatPrice(option.originalPrice)} 
                                  </div>
                                  <div className="text-xs text-green-600 font-medium">
                                    وفر {formatPrice(option.originalPrice - option.price)}
                                  </div>
                                </>
                              ) : (
                                <div className="text-blue-600 font-bold text-lg">
                                  {formatPrice(option.price)} <span className="text-xs text-gray-600">إجمالي</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      // Fallback to default options if no product options exist
                      [
                        { duration: 1, plan: 'شهري', discount: 0 },
                        { duration: 3, plan: 'ربع سنوي', discount: 5 },
                        { duration: 6, plan: 'نصف سنوي', discount: 10 },
                        { duration: 12, plan: 'سنوي', discount: 20 }
                      ].map(({ duration, plan, discount }) => {
                        const basePrice = subscriptionFlow.selectedProduct!.price || 1;
                        const originalPrice = basePrice * duration;
                        const discountedPrice = originalPrice * (1 - discount / 100);
                        
                        return (
                          <motion.button
                            key={duration}
                            onClick={() => handleDurationSelection(duration, plan)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-right p-4 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-right">
                                <p className="font-bold text-gray-900 text-base">{plan} - {duration} شهر</p>
                                {discount > 0 && (
                                  <p className="text-sm text-green-600 mt-1 font-medium">خصم {discount}%</p>
                                )}
                              </div>
                              <div className="text-left">
                                {discount > 0 ? (
                                  <>
                                    <div className="text-blue-600 font-bold text-lg">
                                      {formatPrice(discountedPrice)} <span className="text-xs text-gray-600">إجمالي</span>
                                    </div>
                                    <div className="text-xs text-gray-500 line-through">
                                      {formatPrice(originalPrice)} 
                                    </div>
                                    <div className="text-xs text-green-600 font-medium">
                                      وفر {formatPrice(originalPrice - discountedPrice)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-blue-600 font-bold text-lg">
                                    {formatPrice(originalPrice)} <span className="text-xs text-gray-600">إجمالي</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {subscriptionFlow.step === 'confirmation' && subscriptionFlow.selectedProduct && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-lg">تأكيد الاشتراك:</h4>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-right shadow-sm">
                    <p className="text-base mb-2"><strong>المنتج:</strong> {subscriptionFlow.selectedProduct.name}</p>
                    <p className="text-base mb-2"><strong>المدة:</strong> {subscriptionFlow.selectedDuration} شهر ({subscriptionFlow.selectedPlan})</p>
                    <p className="text-base"><strong>السعر:</strong> {(() => {
                      // Calculate the correct final price for display
                      if (subscriptionFlow.selectedProduct && subscriptionFlow.selectedDuration && subscriptionFlow.selectedPlan) {
                        let finalPrice: number;
                        
                        if (subscriptionFlow.selectedProduct.hasOptions && subscriptionFlow.selectedProduct.options) {
                          // Find the matching option
                          const matchingOption = subscriptionFlow.selectedProduct.options.find(option => 
                            option.duration === subscriptionFlow.selectedDuration && option.name === subscriptionFlow.selectedPlan
                          );
                          
                          if (matchingOption) {
                            finalPrice = matchingOption.price;
                          } else {
                            finalPrice = subscriptionFlow.selectedProduct.price * subscriptionFlow.selectedDuration;
                          }
                        } else {
                          finalPrice = subscriptionFlow.selectedProduct.price * subscriptionFlow.selectedDuration;
                        }
                        
                        // Ensure price is valid
                        if (!finalPrice || finalPrice <= 0) {
                          finalPrice = subscriptionFlow.selectedProduct.price || 1;
                        }
                        
                        return formatPrice(finalPrice);
                      }
                      return formatPrice(0);
                    })()}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      onClick={() => handleSubscriptionConfirmation(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      ✅ أؤكد الاشتراك
                    </motion.button>
                    <motion.button
                      onClick={() => handleSubscriptionConfirmation(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-slate-300 text-slate-700 py-3 px-4 rounded-xl hover:bg-slate-400 transition-colors font-medium"
                    >
                      ❌ إلغاء
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick responses */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200/50">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickResponses.map((response, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSendMessage(response)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 px-4 py-2 bg-white text-slate-700 text-sm rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                >
                  {response}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200/50 bg-gradient-to-r from-white to-slate-50/50">
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-slate-400 hover:text-yellow-500 transition-colors rounded-lg hover:bg-yellow-50"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
              
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-right bg-white shadow-sm hover:shadow-md transition-all duration-200 placeholder-slate-400"
                />
                
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || loading || !conversationId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Contact options */}
            <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-slate-200/50">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors font-medium"
              >
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Phone className="w-4 h-4" />
                </div>
                <span>اتصال مباشر</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <span>إرسال إيميل</span>
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LiveChat;
