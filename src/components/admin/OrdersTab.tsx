'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Printer,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  User,
  Repeat,
  Truck,
  MapPin,
  FileText,
  Send,
  Receipt
} from 'lucide-react';
import { 
  getOrders,
  updateOrder,
  deleteOrder,
  getOrdersByStatus,
  getOrdersByPaymentStatus,
  createSubscriptionFromOrder,
  getProducts,
  generateOrderInvoice,
  downloadInvoicePDF,
  sendInvoiceEmail
} from '@/lib/database';
import { Order, Product } from '@/lib/firebase';
import Modal from './Modal';
import Button from './Button';

interface OrdersTabProps {
  onOrdersCountChange?: (count: number) => void;
}

const OrdersTab = ({ onOrdersCountChange }: OrdersTabProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | Order['paymentStatus']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [actionMenuOrder, setActionMenuOrder] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [convertingToSubscription, setConvertingToSubscription] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Status configurations
  const statusConfig = {
    pending: {
      label: 'بانتظار التأكيد',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      bgColor: 'bg-yellow-50'
    },
    confirmed: {
      label: 'مؤكد',
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircle,
      bgColor: 'bg-blue-50'
    },
    completed: {
      label: 'مكتمل',
      color: 'bg-green-100 text-green-800',
      icon: Check,
      bgColor: 'bg-green-50'
    },
    cancelled: {
      label: 'ملغي',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      bgColor: 'bg-red-50'
    }
  };

  const paymentStatusConfig = {
    unpaid: {
      label: 'غير مدفوع',
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle
    },
    paid: {
      label: 'مدفوع',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    refunded: {
      label: 'مسترد',
      color: 'bg-gray-100 text-gray-800',
      icon: RefreshCw
    }
  };

  // Shipping status configurations
  const shippingStatusConfig = {
    pending_shipping: {
      label: 'بانتظار الشحن',
      color: 'bg-gray-100 text-gray-800',
      icon: Clock
    },
    prepared: {
      label: 'تم التحضير',
      color: 'bg-blue-100 text-blue-800',
      icon: Package
    },
    shipped: {
      label: 'تم الشحن',
      color: 'bg-purple-100 text-purple-800',
      icon: Truck
    },
    in_transit: {
      label: 'في الطريق',
      color: 'bg-yellow-100 text-yellow-800',
      icon: RefreshCw
    },
    delivered: {
      label: 'تم التسليم',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    }
  };

  // Load orders function
  const loadOrders = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        getOrders(),
        getProducts()
      ]);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setProducts(productsData);
      onOrdersCountChange?.(ordersData.length);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, [onOrdersCountChange]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, confirmedAt: newStatus === 'confirmed' ? new Date() : order.confirmedAt }
            : order
        )
      );
      
      setActionMenuOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('حدث خطأ في تحديث حالة الطلب');
    }
  };

  // Update payment status
  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: Order['paymentStatus']) => {
    try {
      await updateOrder(orderId, { paymentStatus: newPaymentStatus });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, paymentStatus: newPaymentStatus }
            : order
        )
      );
      
      setActionMenuOrder(null);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('حدث خطأ في تحديث حالة الدفع');
    }
  };

  // Update shipping status
  const handleShippingStatusUpdate = async (orderId: string, newShippingStatus: Order['shippingStatus']) => {
    try {
      await updateOrder(orderId, { shippingStatus: newShippingStatus });
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const updated: any = { ...order, shippingStatus: newShippingStatus };
          // إضافة تاريخ الشحن إذا تم الشحن
          if (newShippingStatus === 'shipped' && !order.shippedAt) {
            updated.shippedAt = new Date();
          }
          // تحديث حالة الطلب إلى مكتمل عند التسليم
          if (newShippingStatus === 'delivered' && order.status !== 'completed') {
            updated.status = 'completed';
            updated.deliveredAt = new Date();
          }
          return updated;
        }
        return order;
      });
      
      setOrders(updatedOrders);
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        const updatedSelected = updatedOrders.find(o => o.id === orderId);
        if (updatedSelected) {
          setSelectedOrder(updatedSelected);
        }
      }
      
      setActionMenuOrder(null);
    } catch (error) {
      console.error('Error updating shipping status:', error);
      alert('حدث خطأ في تحديث حالة الشحن');
    }
  };

  // Create subscription from order
  const handleCreateSubscription = async (orderId: string) => {
    if (!confirm('هل تريد إنشاء اشتراك من هذا الطلب؟')) {
      return;
    }

    try {
      setLoading(true);
      await createSubscriptionFromOrder(orderId);
      
      // Reload orders to show updated subscription info
      const ordersData = await getOrders();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      
      alert('تم إنشاء الاشتراك بنجاح!');
      console.log('✅ Subscription created from order:', orderId);
    } catch (error) {
      console.error('❌ Error creating subscription from order:', error);
      alert('حدث خطأ في إنشاء الاشتراك');
    } finally {
      setLoading(false);
      setActionMenuOrder(null);
    }
  };

  // Delete order
  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(order => order.id === orderId);
    if (order) {
      setOrderToDelete(order);
      setShowDeleteConfirm(true);
      setActionMenuOrder(null);
    }
  };

  // Convert order to subscription
  const handleConvertToSubscription = async (orderId: string) => {
    try {
      setConvertingToSubscription(orderId);
      setActionMenuOrder(null);
      
      console.log('🔄 [CONVERT_TO_SUBSCRIPTION] Starting conversion for order:', orderId);
      
      const subscriptionId = await createSubscriptionFromOrder(orderId);
      
      if (subscriptionId) {
        console.log('✅ [CONVERT_TO_SUBSCRIPTION] Successfully created subscription:', subscriptionId);
        
        // Refresh orders to show updated data
        await loadOrders();
        
        alert('تم تحويل الطلب إلى اشتراك بنجاح!');
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('❌ [CONVERT_TO_SUBSCRIPTION] Error converting order to subscription:', error);
      alert('حدث خطأ في تحويل الطلب إلى اشتراك: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    } finally {
      setConvertingToSubscription(null);
    }
  };

  // Confirm delete order
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      setLoading(true);
      const hasSubscription = orderToDelete.subscriptionStartDate;
      
      await deleteOrder(orderToDelete.id);
      
      // Update local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete.id));
      
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
      
      if (hasSubscription) {
        alert('✅ تم حذف الطلب والاشتراك المرتبط به بنجاح');
      } else {
        alert('✅ تم حذف الطلب بنجاح');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('حدث خطأ في حذف الطلب');
    } finally {
      setLoading(false);
    }
  };

  // Generate and download invoice PDF
  const handleGenerateInvoice = async (orderId: string) => {
    try {
      await downloadInvoicePDF(orderId);
    } catch (error: any) {
      alert(error.message || 'حدث خطأ في تحميل الفاتورة');
    }
  };

  // Print invoice
  const handlePrintInvoice = (order: Order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>فاتورة رقم ${order.id}</title>
                <style>
                  body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
                  .invoice-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                  .invoice-details { margin-bottom: 30px; }
                  .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                  .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                  .invoice-table th { background-color: #f5f5f5; font-weight: bold; }
                  .invoice-footer { text-align: center; border-top: 2px solid #333; padding-top: 20px; }
                  .total { font-size: 18px; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="invoice-header">
                  <h1>وافرلي - wafarle</h1>
                  <h2>فاتورة رقم: ${order.id}</h2>
                  <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}</p>
                </div>

                <div class="invoice-details">
                  <h3>تفاصيل العميل:</h3>
                  <p><strong>الاسم:</strong> ${order.customerName}</p>
                  <p><strong>البريد الإلكتروني:</strong> ${order.customerEmail}</p>
                  <p><strong>رقم الهاتف:</strong> ${order.customerPhone}</p>
                </div>

                <table class="invoice-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${order.productName}</td>
                      <td>${order.quantity}</td>
                      <td>$${order.productPrice}</td>
                      <td>$${order.totalAmount}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="total">
                  <p>المجموع الكلي: $${order.totalAmount}</p>
                  <p>حالة الدفع: ${paymentStatusConfig[order.paymentStatus].label}</p>
                  <p>طريقة الدفع: ${order.paymentMethod === 'cash' ? 'نقدي' : 
                                   order.paymentMethod === 'card' ? 'بطاقة ائتمان' :
                                   order.paymentMethod === 'bank_transfer' ? 'حوالة بنكية' : 'محفظة رقمية'}</p>
                </div>

                <div class="invoice-footer">
                  <p>شكراً لاختياركم خدماتنا</p>
                  <p>وافرلي - wafarle</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }, 100);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get stats
  const getStats = () => {
    const pending = orders.filter(order => order.status === 'pending').length;
    const confirmed = orders.filter(order => order.status === 'confirmed').length;
    const completed = orders.filter(order => order.status === 'completed').length;
    const unpaid = orders.filter(order => order.paymentStatus === 'unpaid').length;
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return { pending, confirmed, completed, unpaid, totalRevenue };
  };

  const stats = getStats();

  // Send invoice to email
  const handleSendInvoiceEmail = async (orderId: string) => {
    try {
      await sendInvoiceEmail(orderId);
      alert('تم إرسال الفاتورة إلى البريد الإلكتروني بنجاح!');
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إرسال الفاتورة بالبريد');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">بانتظار التأكيد</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">مؤكدة</p>
              <p className="text-2xl font-bold text-blue-800">{stats.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">مكتملة</p>
              <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">غير مدفوعة</p>
              <p className="text-2xl font-bold text-red-800">{stats.unpaid}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-gold/20 to-primary-gold/30 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-dark-navy">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-primary-dark-navy">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-dark-navy" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث بالاسم، البريد، المنتج، أو رقم الطلب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
        >
          <option value="all">جميع الحالات</option>
          <option value="pending">بانتظار التأكيد</option>
          <option value="confirmed">مؤكدة</option>
          <option value="completed">مكتملة</option>
          <option value="cancelled">ملغية</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
        >
          <option value="all">جميع حالات الدفع</option>
          <option value="unpaid">غير مدفوع</option>
          <option value="paid">مدفوع</option>
          <option value="refunded">مسترد</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الطلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حالة الطلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حالة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حالة الشحن
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                const PaymentIcon = paymentStatusConfig[order.paymentStatus].icon;
                
                // التحقق من نوع المنتج
                const product = products.find(p => p.id === order.productId);
                const productType = product?.productType || order.productType;
                const isPhysicalProduct = productType === 'physical' && product?.requiresShipping;
                const currentShippingStatus = order.shippingStatus || 'pending_shipping';
                const ShippingIcon = shippingStatusConfig[currentShippingStatus]?.icon || Clock;
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">#{order.id.slice(-8)}</span>
                        {order.subscriptionStartDate && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200"
                               title="هذا الطلب له اشتراك مرتبط - حذفه سيحذف الاشتراك أيضاً">
                            <Package className="w-3 h-3" />
                            <span>مع اشتراك</span>
                          </div>
                        )}
                        {order.invoiceNumber && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full border border-indigo-200"
                               title={`فاتورة رقم: ${order.invoiceNumber}`}>
                            <Receipt className="w-3 h-3" />
                            <span className="font-mono">{order.invoiceNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                        <div className="text-sm text-gray-500">الكمية: {order.quantity}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusConfig[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusConfig[order.paymentStatus].color}`}>
                        <PaymentIcon className="w-4 h-4 mr-1" />
                        {paymentStatusConfig[order.paymentStatus].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isPhysicalProduct ? (
                        <select
                          value={currentShippingStatus}
                          onChange={(e) => handleShippingStatusUpdate(order.id, e.target.value as Order['shippingStatus'])}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${shippingStatusConfig[currentShippingStatus]?.color || 'bg-gray-100 text-gray-800'} hover:shadow-md transition-all`}
                          title="تغيير حالة الشحن"
                        >
                          <option value="pending_shipping">بانتظار الشحن</option>
                          <option value="prepared">تم التحضير</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="in_transit">في الطريق</option>
                          <option value="delivered">تم التسليم</option>
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center w-64 min-w-0">
                      <div className="flex items-center justify-center gap-1 relative flex-wrap">
                        {/* Primary Action Buttons */}
                        <div className="flex gap-1 flex-wrap">
                          {/* Status Action Buttons */}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                              title="تأكيد الطلب"
                            >
                              <CheckCircle className="w-3 h-3 ml-1" />
                              تأكيد
                            </button>
                          )}

                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'completed')}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                              title="إكمال الطلب"
                            >
                              <Check className="w-3 h-3 ml-1" />
                              إكمال
                            </button>
                          )}

                          {/* Payment Action Button */}
                          {order.paymentStatus === 'unpaid' && (
                            <button
                              onClick={() => handlePaymentStatusUpdate(order.id, 'paid')}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                              title="تأكيد الدفع"
                            >
                              <DollarSign className="w-3 h-3 ml-1" />
                              دفع
                            </button>
                          )}

                          {/* Convert to Subscription Button */}
                          {!order.subscriptionStartDate && order.status === 'completed' && order.paymentStatus === 'paid' && (
                            <button
                              onClick={() => handleConvertToSubscription(order.id)}
                              disabled={convertingToSubscription === order.id}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="تحويل إلى اشتراك"
                            >
                              {convertingToSubscription === order.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                                  جاري...
                                </>
                              ) : (
                                <>
                                  <Repeat className="w-3 h-3 ml-1" />
                                  اشتراك
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Secondary Action Buttons */}
                        <div className="flex gap-1">
                          {/* Generate/Download Invoice PDF Button */}
                          <button
                            onClick={() => handleGenerateInvoice(order.id)}
                            className="inline-flex items-center p-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                            title={order.invoiceNumber ? `تحميل الفاتورة ${order.invoiceNumber}` : 'توليد وتحميل الفاتورة PDF'}
                          >
                            {order.invoiceNumber ? (
                              <FileText className="w-3 h-3" />
                            ) : (
                              <Receipt className="w-3 h-3" />
                            )}
                          </button>

                          {/* Print Invoice Button */}
                          <button
                            onClick={() => handlePrintInvoice(order)}
                            className="inline-flex items-center p-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                            title="طباعة الفاتورة"
                          >
                            <Printer className="w-3 h-3" />
                          </button>

                          {/* View Details Button */}
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="inline-flex items-center p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>

                        {/* More Actions Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOrder(actionMenuOrder === order.id ? null : order.id)}
                            className="inline-flex items-center p-1.5 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            title="المزيد من الإجراءات"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </button>

                          {/* Dropdown Menu */}
                          {actionMenuOrder === order.id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActionMenuOrder(null)}
                              />
                              
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                                <div className="py-1">
                                  {/* Status Actions */}
                                  {order.status === 'pending' && (
                                    <button
                                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                      className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                    >
                                      <XCircle className="w-4 h-4 ml-2" />
                                      إلغاء الطلب
                                    </button>
                                  )}

                                  {/* Payment Actions */}
                                  {order.paymentStatus === 'paid' && (
                                    <button
                                      onClick={() => handlePaymentStatusUpdate(order.id, 'refunded')}
                                      className="w-full px-4 py-2 text-right text-sm text-orange-600 hover:bg-orange-50 flex items-center transition-colors"
                                    >
                                      <RefreshCw className="w-4 h-4 ml-2" />
                                      استرداد المبلغ
                                    </button>
                                  )}

                                  {/* Convert to Subscription Action */}
                                  {!order.subscriptionStartDate && order.status === 'completed' && order.paymentStatus === 'paid' && (
                                    <button
                                      onClick={() => handleConvertToSubscription(order.id)}
                                      disabled={convertingToSubscription === order.id}
                                      className="w-full px-4 py-2 text-right text-sm text-blue-600 hover:bg-blue-50 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {convertingToSubscription === order.id ? (
                                        <>
                                          <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                                          جاري التحويل...
                                        </>
                                      ) : (
                                        <>
                                          <Repeat className="w-4 h-4 ml-2" />
                                          تحويل إلى اشتراك
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* Invoice Actions */}
                                  <button
                                    onClick={() => {
                                      handleGenerateInvoice(order.id);
                                      setActionMenuOrder(null);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-indigo-600 hover:bg-indigo-50 flex items-center transition-colors"
                                  >
                                    <FileText className="w-4 h-4 ml-2" />
                                    {order.invoiceNumber ? `تحميل الفاتورة ${order.invoiceNumber}` : 'توليد الفاتورة PDF'}
                                  </button>

                                  <button
                                    onClick={() => {
                                      handleSendInvoiceEmail(order.id);
                                      setActionMenuOrder(null);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-blue-600 hover:bg-blue-50 flex items-center transition-colors"
                                    disabled={!order.invoiceNumber}
                                  >
                                    <Send className="w-4 h-4 ml-2" />
                                    {order.invoiceSentAt ? 'إعادة إرسال الفاتورة' : 'إرسال الفاتورة بالبريد'}
                                  </button>

                                  {/* Separator */}
                                  <hr className="my-1 border-gray-200" />

                                  {/* Delete Action */}
                                  <button
                                    onClick={() => {
                                      setActionMenuOrder(null);
                                      handleDeleteOrder(order.id);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف الطلب
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                ? 'لم يتم العثور على طلبات تطابق المعايير المحددة' 
                : 'لم يتم تقديم أي طلبات بعد'
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderDetails && selectedOrder !== null}
        onClose={() => setShowOrderDetails(false)}
        title={`تفاصيل الطلب #${selectedOrder?.id.slice(-8) || ''}`}
        icon={<Package className="w-5 h-5" />}
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    تفاصيل الطلب #{selectedOrder.id.slice(-8)}
                  </h3>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 ml-2" />
                      معلومات العميل
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">الاسم:</span>
                        <span className="text-gray-900 mr-2">{selectedOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">البريد الإلكتروني:</span>
                        <span className="text-gray-900 mr-2">{selectedOrder.customerEmail}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">رقم الهاتف:</span>
                        <span className="text-gray-900 mr-2">{selectedOrder.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 ml-2" />
                      معلومات المنتج
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">اسم المنتج:</span>
                        <span className="text-gray-900 mr-2">{selectedOrder.productName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">السعر:</span>
                        <span className="text-gray-900 mr-2">${selectedOrder.productPrice}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">الكمية:</span>
                        <span className="text-gray-900 mr-2">{selectedOrder.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">المجموع:</span>
                        <span className="text-gray-900 mr-2 font-medium">${selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Information */}
                  {(selectedOrder.invoiceNumber || selectedOrder.invoiceGeneratedAt) && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Receipt className="w-4 h-4 ml-2 text-indigo-600" />
                        معلومات الفاتورة
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {selectedOrder.invoiceNumber && (
                          <div>
                            <span className="text-gray-500">رقم الفاتورة:</span>
                            <span className="text-gray-900 mr-2 font-mono font-bold">{selectedOrder.invoiceNumber}</span>
                          </div>
                        )}
                        {selectedOrder.invoiceGeneratedAt && (
                          <div>
                            <span className="text-gray-500">تاريخ التوليد:</span>
                            <span className="text-gray-900 mr-2">{formatDate(selectedOrder.invoiceGeneratedAt)}</span>
                          </div>
                        )}
                        {selectedOrder.invoiceSentAt && (
                          <div>
                            <span className="text-gray-500">تاريخ الإرسال:</span>
                            <span className="text-gray-900 mr-2">{formatDate(selectedOrder.invoiceSentAt)}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleGenerateInvoice(selectedOrder.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          تحميل PDF
                        </button>
                        <button
                          onClick={() => handleSendInvoiceEmail(selectedOrder.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          disabled={!selectedOrder.invoiceNumber}
                        >
                          <Send className="w-4 h-4" />
                          {selectedOrder.invoiceSentAt ? 'إعادة الإرسال' : 'إرسال بالبريد'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Order Status */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Clock className="w-4 h-4 ml-2" />
                      حالة الطلب
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">حالة الطلب:</span>
                        <span className={`mr-2 px-2 py-1 rounded text-xs ${statusConfig[selectedOrder.status].color}`}>
                          {statusConfig[selectedOrder.status].label}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">حالة الدفع:</span>
                        <span className={`mr-2 px-2 py-1 rounded text-xs ${paymentStatusConfig[selectedOrder.paymentStatus].color}`}>
                          {paymentStatusConfig[selectedOrder.paymentStatus].label}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">طريقة الدفع:</span>
                        <span className="text-gray-900 mr-2">
                          {selectedOrder.paymentMethod === 'cash' ? 'نقدي' : 
                           selectedOrder.paymentMethod === 'card' ? 'بطاقة ائتمان' :
                           selectedOrder.paymentMethod === 'bank_transfer' ? 'حوالة بنكية' : 'محفظة رقمية'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information - Only for Physical Products */}
                  {(() => {
                    const product = products.find(p => p.id === selectedOrder.productId);
                    const productType = product?.productType || selectedOrder.productType;
                    const isPhysicalProduct = productType === 'physical' && product?.requiresShipping;
                    const currentShippingStatus = selectedOrder.shippingStatus || 'pending_shipping';
                    
                    if (isPhysicalProduct) {
                      return (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Truck className="w-4 h-4 ml-2 text-green-600" />
                            معلومات الشحن
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-gray-500 text-sm">حالة الشحن:</span>
                              <div className="mt-1">
                                <select
                                  value={currentShippingStatus}
                                  onChange={(e) => {
                                    handleShippingStatusUpdate(selectedOrder.id, e.target.value as Order['shippingStatus']);
                                    // Update local state immediately
                                    setSelectedOrder({
                                      ...selectedOrder,
                                      shippingStatus: e.target.value as Order['shippingStatus']
                                    });
                                  }}
                                  className={`mr-2 px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer ${shippingStatusConfig[currentShippingStatus]?.color || 'bg-gray-100 text-gray-800'} hover:shadow-md transition-all`}
                                  title="تغيير حالة الشحن"
                                >
                                  <option value="pending_shipping">بانتظار الشحن</option>
                                  <option value="prepared">تم التحضير</option>
                                  <option value="shipped">تم الشحن</option>
                                  <option value="in_transit">في الطريق</option>
                                  <option value="delivered">تم التسليم</option>
                                </select>
                              </div>
                            </div>
                            {selectedOrder.shippingAddress && (
                              <div>
                                <span className="text-gray-500 text-sm flex items-center gap-1 mb-1">
                                  <MapPin className="w-3 h-3" />
                                  عنوان الشحن:
                                </span>
                                <p className="text-gray-900 text-sm bg-white p-2 rounded border">{selectedOrder.shippingAddress}</p>
                              </div>
                            )}
                            {selectedOrder.shippingTrackingNumber && (
                              <div>
                                <span className="text-gray-500 text-sm">رقم التتبع:</span>
                                <span className="text-gray-900 mr-2 font-mono">{selectedOrder.shippingTrackingNumber}</span>
                              </div>
                            )}
                            {selectedOrder.shippedAt && (
                              <div>
                                <span className="text-gray-500 text-sm">تاريخ الشحن:</span>
                                <span className="text-gray-900 mr-2">{formatDate(selectedOrder.shippedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Dates */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-4 h-4 ml-2" />
                      التواريخ المهمة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">تاريخ الطلب:</span>
                        <span className="text-gray-900 mr-2">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      {selectedOrder.confirmedAt && (
                        <div>
                          <span className="text-gray-500">تاريخ التأكيد:</span>
                          <span className="text-gray-900 mr-2">{formatDate(selectedOrder.confirmedAt)}</span>
                        </div>
                      )}
                      {selectedOrder.deliveredAt && (
                        <div>
                          <span className="text-gray-500">تاريخ الإكمال:</span>
                          <span className="text-gray-900 mr-2">{formatDate(selectedOrder.deliveredAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">ملاحظات:</h4>
                      <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-between items-center pt-6 border-t mt-6">
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      icon={<Printer className="w-4 h-4" />}
                    >
                      طباعة الفاتورة
                    </Button>
                    
                    {/* Show create subscription button only for confirmed & paid orders without subscription */}
                    {selectedOrder.status === 'confirmed' && 
                     selectedOrder.paymentStatus === 'paid' && 
                     !selectedOrder.subscriptionStartDate && (
                      <Button
                        variant="success"
                        size="md"
                        onClick={() => handleCreateSubscription(selectedOrder.id)}
                        icon={<Package className="w-4 h-4" />}
                        loading={loading}
                      >
                        إنشاء اشتراك
                      </Button>
                    )}
                    
                    {/* Show subscription status if exists */}
                    {selectedOrder.subscriptionStartDate && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          اشتراك نشط
                          {selectedOrder.subscriptionEndDate && (
                            <span className="text-xs block text-green-600">
                              ينتهي: {formatDate(selectedOrder.subscriptionEndDate)}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowOrderDetails(false)}
                  >
                    إغلاق
                  </Button>
                </div>
              </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setOrderToDelete(null);
        }}
        title="تأكيد حذف الطلب"
        icon={<AlertCircle className="w-5 h-5 text-red-500" />}
        maxWidth="md"
      >
        {orderToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 mb-2">
                    هل أنت متأكد من حذف هذا الطلب؟
                  </h3>
                  <div className="text-sm text-red-700 space-y-2">
                    <p>
                      <strong>رقم الطلب:</strong> #{orderToDelete.id.slice(-8)}
                    </p>
                    <p>
                      <strong>العميل:</strong> {orderToDelete.customerName}
                    </p>
                    <p>
                      <strong>المنتج:</strong> {orderToDelete.productName}
                    </p>
                    
                    {orderToDelete.subscriptionStartDate && (
                      <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded">
                        <div className="flex items-center gap-2 text-orange-800">
                          <Package className="w-4 h-4" />
                          <strong>تحذير مهم!</strong>
                        </div>
                        <p className="text-sm text-orange-700 mt-1">
                          هذا الطلب مرتبط باشتراك نشط. حذف الطلب سيؤدي إلى حذف الاشتراك أيضاً وإلغاء خدمة العميل فوراً.
                        </p>
                      </div>
                    )}
                    
                    <p className="font-medium text-red-800 mt-3">
                      هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
              >
                إلغاء
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={confirmDeleteOrder}
                loading={loading}
                icon={<Trash2 className="w-4 h-4" />}
              >
                {orderToDelete.subscriptionStartDate ? 'حذف الطلب والاشتراك' : 'حذف الطلب'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden print content */}
      <div ref={printRef} className="hidden">
        {selectedOrder && (
          <div className="p-8">
            {/* This will be used for printing */}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTab;
