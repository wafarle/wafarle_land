'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  AlertCircle,
  RefreshCw,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { getOrders, updateOrder } from '@/lib/database';
import { Order } from '@/lib/firebase';
import Modal from './Modal';

export const ReturnsTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['returnStatus']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders.filter(order => 
      order.returnStatus && order.returnStatus !== 'none'
    );

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.returnStatus === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleReturnAction = async (orderId: string, action: 'approve' | 'reject' | 'complete', refundAmount?: number) => {
    try {
      setProcessingReturn(orderId);
      
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updates: Partial<Order> = {};

      if (action === 'approve') {
        updates.returnStatus = 'approved';
        updates.returnApprovedAt = new Date();
        
        // Auto-refund if enabled
        if (refundAmount !== undefined && refundAmount > 0) {
          updates.refundAmount = refundAmount;
          updates.refundMethod = 'original';
        }
      } else if (action === 'reject') {
        updates.returnStatus = 'rejected';
      } else if (action === 'complete') {
        updates.returnStatus = 'returned';
        updates.returnCompletedAt = new Date();
        if (order.refundAmount) {
          updates.refundCompletedAt = new Date();
          updates.paymentStatus = 'refunded';
        }
      }

      await updateOrder(orderId, updates);
      await loadOrders();
      
      if (selectedOrder?.id === orderId) {
        const updatedOrder = await getOrders().then(orders => orders.find(o => o.id === orderId));
        if (updatedOrder) setSelectedOrder(updatedOrder);
      }

      alert(`تم ${action === 'approve' ? 'الموافقة على' : action === 'reject' ? 'رفض' : 'إكمال'} طلب الإرجاع بنجاح`);
    } catch (error) {
      console.error('Error processing return:', error);
      alert('حدث خطأ في معالجة طلب الإرجاع');
    } finally {
      setProcessingReturn(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getReturnStatusConfig = (status: Order['returnStatus']) => {
    switch (status) {
      case 'requested':
        return {
          label: 'مطلوب',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock
        };
      case 'approved':
        return {
          label: 'موافق عليه',
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      case 'returned':
        return {
          label: 'تم الإرجاع',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'exchanged':
        return {
          label: 'تم الاستبدال',
          color: 'bg-purple-100 text-purple-800',
          icon: RefreshCw
        };
      default:
        return {
          label: 'غير محدد',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle
        };
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">إدارة الإرجاع والاستبدال</h2>
          <p className="text-gray-600 mt-2">إدارة طلبات الإرجاع والاستبدال للعملاء</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">طلبات معلقة</p>
              <p className="text-2xl font-bold text-yellow-800">
                {orders.filter(o => o.returnStatus === 'requested').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">موافق عليها</p>
              <p className="text-2xl font-bold text-blue-800">
                {orders.filter(o => o.returnStatus === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">مكتملة</p>
              <p className="text-2xl font-bold text-green-800">
                {orders.filter(o => o.returnStatus === 'returned').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">مرفوضة</p>
              <p className="text-2xl font-bold text-red-800">
                {orders.filter(o => o.returnStatus === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في طلبات الإرجاع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">جميع الحالات</option>
          <option value="requested">مطلوبة</option>
          <option value="approved">موافق عليها</option>
          <option value="rejected">مرفوضة</option>
          <option value="returned">مكتملة</option>
          <option value="exchanged">مستبدلة</option>
        </select>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السبب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusConfig = getReturnStatusConfig(order.returnStatus!);
                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalAmount}
                      {order.refundAmount && (
                        <div className="text-xs text-green-600">استرجاع: ${order.refundAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {order.returnReason || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.returnRequestedAt ? formatDate(order.returnRequestedAt) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.returnStatus === 'requested' && (
                          <>
                            <button
                              onClick={() => handleReturnAction(order.id, 'approve', order.totalAmount)}
                              disabled={processingReturn === order.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="الموافقة على الإرجاع"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReturnAction(order.id, 'reject')}
                              disabled={processingReturn === order.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="رفض الإرجاع"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {order.returnStatus === 'approved' && (
                          <button
                            onClick={() => handleReturnAction(order.id, 'complete')}
                            disabled={processingReturn === order.id}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                            title="إكمال الإرجاع"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
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
            <RotateCcw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات إرجاع</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'لم يتم العثور على طلبات تطابق المعايير' 
                : 'لم يتم تقديم أي طلبات إرجاع بعد'}
            </p>
          </div>
        )}
      </div>

      {/* Return Details Modal */}
      <Modal
        isOpen={showDetails && selectedOrder !== null}
        onClose={() => setShowDetails(false)}
        title={`تفاصيل طلب الإرجاع #${selectedOrder?.id.slice(-8)}`}
        icon={<RotateCcw className="w-5 h-5" />}
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 ml-2" />
                معلومات الطلب
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">رقم الطلب:</span>
                  <span className="text-gray-900 mr-2 font-mono">#{selectedOrder.id.slice(-8)}</span>
                </div>
                <div>
                  <span className="text-gray-500">المنتج:</span>
                  <span className="text-gray-900 mr-2">{selectedOrder.productName}</span>
                </div>
                <div>
                  <span className="text-gray-500">المبلغ:</span>
                  <span className="text-gray-900 mr-2 font-medium">${selectedOrder.totalAmount}</span>
                </div>
                <div>
                  <span className="text-gray-500">تاريخ الطلب:</span>
                  <span className="text-gray-900 mr-2">{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 ml-2" />
                معلومات العميل
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">الاسم:</span>
                  <span className="text-gray-900 mr-2">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500">البريد:</span>
                  <span className="text-gray-900 mr-2">{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500">الهاتف:</span>
                  <span className="text-gray-900 mr-2">{selectedOrder.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Return Info */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <RotateCcw className="w-4 h-4 ml-2" />
                معلومات الإرجاع
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">الحالة:</span>
                  <span className={`mr-2 px-2 py-1 rounded text-xs ${getReturnStatusConfig(selectedOrder.returnStatus!).color}`}>
                    {getReturnStatusConfig(selectedOrder.returnStatus!).label}
                  </span>
                </div>
                {selectedOrder.returnReason && (
                  <div>
                    <span className="text-gray-500 block mb-1">سبب الإرجاع:</span>
                    <p className="text-gray-900 bg-white p-3 rounded border">{selectedOrder.returnReason}</p>
                  </div>
                )}
                {selectedOrder.returnRequestedAt && (
                  <div>
                    <span className="text-gray-500">تاريخ الطلب:</span>
                    <span className="text-gray-900 mr-2">{formatDate(selectedOrder.returnRequestedAt)}</span>
                  </div>
                )}
                {selectedOrder.returnApprovedAt && (
                  <div>
                    <span className="text-gray-500">تاريخ الموافقة:</span>
                    <span className="text-gray-900 mr-2">{formatDate(selectedOrder.returnApprovedAt)}</span>
                  </div>
                )}
                {selectedOrder.refundAmount && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <span className="text-green-700 font-medium">مبلغ الاسترجاع: ${selectedOrder.refundAmount}</span>
                    {selectedOrder.refundCompletedAt && (
                      <div className="text-xs text-green-600 mt-1">
                        تم الاسترجاع في: {formatDate(selectedOrder.refundCompletedAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedOrder.returnStatus === 'requested' && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleReturnAction(selectedOrder.id, 'approve', selectedOrder.totalAmount);
                    setShowDetails(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  الموافقة على الإرجاع
                </button>
                <button
                  onClick={() => {
                    handleReturnAction(selectedOrder.id, 'reject');
                    setShowDetails(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  رفض الإرجاع
                </button>
              </div>
            )}
            {selectedOrder.returnStatus === 'approved' && (
              <button
                onClick={() => {
                  handleReturnAction(selectedOrder.id, 'complete');
                  setShowDetails(false);
                }}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                إكمال الإرجاع
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};






