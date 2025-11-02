'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  MoreHorizontal,
  User,
  Users,
  UserCheck,
  UserX,
  Crown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Tag,
  Activity,
  X
} from 'lucide-react';
import { 
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersByStatus,
  searchCustomers,
  getTopCustomers,
  getOrders
} from '@/lib/database';
import { Customer, Order } from '@/lib/firebase';
import Modal from './Modal';
import Button from './Button';
import Toast from './Toast';
import { useToast } from '@/hooks/useToast';

interface CustomersTabProps {
  onCustomersCountChange?: (count: number) => void;
}

const CustomersTab = ({ onCustomersCountChange }: CustomersTabProps) => {
  // Toast notifications
  const { toasts, showSuccess, showError, hideToast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Customer['status']>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [actionMenuCustomer, setActionMenuCustomer] = useState<string | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [addCustomerData, setAddCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'السعودية',
    gender: 'male' as 'male' | 'female',
    notes: '',
    tags: [] as string[],
    preferredPaymentMethod: 'card' as 'cash' | 'card' | 'bank_transfer' | 'digital_wallet'
  });
  const [isSubmittingNewCustomer, setIsSubmittingNewCustomer] = useState(false);
  const [newCustomerError, setNewCustomerError] = useState('');

  // Status configurations
  const statusConfig = {
    active: {
      label: 'نشط',
      color: 'bg-green-100 text-green-800',
      icon: UserCheck,
      bgColor: 'bg-green-50'
    },
    inactive: {
      label: 'غير نشط',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      bgColor: 'bg-yellow-50'
    },
    blocked: {
      label: 'محجوب',
      color: 'bg-red-100 text-red-800',
      icon: UserX,
      bgColor: 'bg-red-50'
    }
  };

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersData = await getCustomers();
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        onCustomersCountChange?.(customersData.length);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [onCustomersCountChange]);

  // Filter customers
  useEffect(() => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);

  // Update customer status
  const handleStatusUpdate = async (customerId: string, newStatus: Customer['status']) => {
    try {
      await updateCustomer(customerId, { status: newStatus });
      
      // Update local state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === customerId 
            ? { ...customer, status: newStatus }
            : customer
        )
      );
      
      setActionMenuCustomer(null);
    } catch (error) {
      console.error('Error updating customer status:', error);
      showError('حدث خطأ في تحديث حالة العميل ❌');
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      await deleteCustomer(customerId);
      
      // Update local state
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId));
      setActionMenuCustomer(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      showError('حدث خطأ في حذف العميل ❌');
    }
  };

  // Load customer orders
  const loadCustomerOrders = async (customerEmail: string) => {
    try {
      const allOrders = await getOrders();
      const customerOrdersData = allOrders.filter(order => order.customerEmail === customerEmail);
      setCustomerOrders(customerOrdersData);
    } catch (error) {
      console.error('Error loading customer orders:', error);
      setCustomerOrders([]);
    }
  };

  // Handle add customer form input changes
  const handleAddCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
    if (newCustomerError) setNewCustomerError('');
  };

  // Handle tags input
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setAddCustomerData(prev => ({
      ...prev,
      tags: tags
    }));
  };

  // Validate add customer form
  const validateAddCustomerForm = () => {
    if (!addCustomerData.name.trim()) {
      setNewCustomerError('يرجى إدخال اسم العميل');
      return false;
    }
    if (!addCustomerData.email.trim()) {
      setNewCustomerError('يرجى إدخال البريد الإلكتروني');
      return false;
    }
    if (!addCustomerData.phone.trim()) {
      setNewCustomerError('يرجى إدخال رقم الجوال');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addCustomerData.email)) {
      setNewCustomerError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }

    // Phone validation (Saudi format)
    const phoneRegex = /^(\+966|966|05)[0-9]{8}$/;
    if (!phoneRegex.test(addCustomerData.phone.replace(/\s+/g, ''))) {
      setNewCustomerError('يرجى إدخال رقم جوال صحيح (مثال: 0512345678)');
      return false;
    }

    // Check if email already exists
    const emailExists = customers.some(customer => 
      customer.email.toLowerCase() === addCustomerData.email.toLowerCase()
    );
    if (emailExists) {
      setNewCustomerError('البريد الإلكتروني مُستخدم بالفعل');
      return false;
    }

    return true;
  };

  // Handle add customer form submission
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddCustomerForm()) return;

    setIsSubmittingNewCustomer(true);
    setNewCustomerError('');

    try {
      const customerData = {
        name: addCustomerData.name.trim(),
        email: addCustomerData.email.trim().toLowerCase(),
        phone: addCustomerData.phone.trim(),
        address: addCustomerData.address.trim() || undefined,
        city: addCustomerData.city.trim() || undefined,
        country: addCustomerData.country,
        gender: addCustomerData.gender,
        status: 'active' as const,
        notes: addCustomerData.notes.trim() || undefined,
        tags: addCustomerData.tags.length > 0 ? addCustomerData.tags : undefined,
        preferredPaymentMethod: addCustomerData.preferredPaymentMethod,
        lastOrderDate: new Date() // Set current date as initial date
      };

      const customerId = await addCustomer(customerData);
      // Reload customers list
      const updatedCustomers = await getCustomers();
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
      onCustomersCountChange?.(updatedCustomers.length);

      // Reset form and close modal
      resetAddCustomerForm();
      setShowAddCustomerForm(false);

      // Show success message
      showSuccess('تم إضافة العميل بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding customer:', error);
      setNewCustomerError('حدث خطأ في إضافة العميل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmittingNewCustomer(false);
    }
  };

  // Reset add customer form
  const resetAddCustomerForm = () => {
    setAddCustomerData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'السعودية',
      gender: 'male',
      notes: '',
      tags: [],
      preferredPaymentMethod: 'card'
    });
    setNewCustomerError('');
  };

  // Close add customer form
  const handleCloseAddCustomerForm = () => {
    if (!isSubmittingNewCustomer) {
      resetAddCustomerForm();
      setShowAddCustomerForm(false);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Format phone number
  const formatPhone = (phone: string) => {
    if (phone.startsWith('+966')) {
      return phone.replace('+966', '0');
    }
    return phone;
  };

  // Get customer avatar
  const getCustomerAvatar = (customer: Customer) => {
    return customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=f3f4f6&color=374151&size=40`;
  };

  // Get stats
  const getStats = () => {
    const active = customers.filter(customer => customer.status === 'active').length;
    const inactive = customers.filter(customer => customer.status === 'inactive').length;
    const blocked = customers.filter(customer => customer.status === 'blocked').length;
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageOrderValue = customers.length > 0 
      ? customers.reduce((sum, customer) => sum + customer.averageOrderValue, 0) / customers.length 
      : 0;

    return { active, inactive, blocked, totalRevenue, averageOrderValue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة العملاء</h2>
          <p className="text-gray-600 mt-1">إدارة ومتابعة عملائك وأنشطتهم</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <button 
            onClick={() => setShowAddCustomerForm(true)}
            className="bg-primary-gold hover:bg-primary-gold/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            إضافة عميل جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">العملاء النشطين</p>
              <p className="text-2xl font-bold text-green-800">{stats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">غير النشطين</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.inactive}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">المحجوبين</p>
              <p className="text-2xl font-bold text-red-800">{stats.blocked}</p>
            </div>
            <UserX className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي الإنفاق</p>
              <p className="text-2xl font-bold text-blue-800">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">متوسط قيمة الطلب</p>
              <p className="text-2xl font-bold text-purple-800">${stats.averageOrderValue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
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
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="blocked">محجوب</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات التواصل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إحصائيات الطلبات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر طلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ التسجيل
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const StatusIcon = statusConfig[customer.status].icon;
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={getCustomerAvatar(customer)}
                            alt={customer.name}
                          />
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {customer.name}
                            {customer.tags?.includes('VIP') && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">رقم العميل: #{customer.id.slice(-6)}</div>
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {customer.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                              {customer.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{customer.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm" dir="ltr">{formatPhone(customer.phone)}</span>
                        </div>
                        {customer.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{customer.city}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[customer.status].color}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusConfig[customer.status].label}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                          <span>{customer.totalOrders} طلب</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">${customer.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">متوسط: ${customer.averageOrderValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'لا يوجد'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.registrationDate)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center w-48">
                      <div className="flex items-center justify-center gap-1 relative">
                        {/* Primary Action Buttons */}
                        <div className="flex gap-1">
                          {/* Status Action Buttons */}
                          {customer.status === 'inactive' && (
                            <button
                              onClick={() => handleStatusUpdate(customer.id, 'active')}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                              title="تفعيل العميل"
                            >
                              <CheckCircle className="w-3 h-3 ml-1" />
                              تفعيل
                            </button>
                          )}

                          {customer.status === 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(customer.id, 'inactive')}
                              className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-xs font-medium"
                              title="إلغاء تفعيل العميل"
                            >
                              <Clock className="w-3 h-3 ml-1" />
                              إيقاف
                            </button>
                          )}

                          {customer.status !== 'blocked' && (
                            <button
                              onClick={() => handleStatusUpdate(customer.id, 'blocked')}
                              className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium"
                              title="حجب العميل"
                            >
                              <Ban className="w-3 h-3 ml-1" />
                              حجب
                            </button>
                          )}
                        </div>

                        {/* Secondary Action Buttons */}
                        <div className="flex gap-1">
                          {/* View Details Button */}
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              loadCustomerOrders(customer.email);
                              setShowCustomerDetails(true);
                            }}
                            className="inline-flex items-center p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          {/* Edit Button */}
                          <button
                            className="inline-flex items-center p-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            title="تعديل العميل"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>

                        {/* More Actions Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuCustomer(actionMenuCustomer === customer.id ? null : customer.id)}
                            className="inline-flex items-center p-1.5 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            title="المزيد من الإجراءات"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </button>

                          {/* Dropdown Menu */}
                          {actionMenuCustomer === customer.id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActionMenuCustomer(null)}
                              />
                              
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                                <div className="py-1">
                                  {/* Status Actions */}
                                  {customer.status === 'blocked' && (
                                    <button
                                      onClick={() => handleStatusUpdate(customer.id, 'active')}
                                      className="w-full px-4 py-2 text-right text-sm text-green-600 hover:bg-green-50 flex items-center transition-colors"
                                    >
                                      <CheckCircle className="w-4 h-4 ml-2" />
                                      إلغاء الحجب
                                    </button>
                                  )}

                                  {/* Separator */}
                                  <hr className="my-1 border-gray-200" />

                                  {/* Delete Action */}
                                  <button
                                    onClick={() => {
                                      setActionMenuCustomer(null);
                                      handleDeleteCustomer(customer.id);
                                    }}
                                    className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف العميل
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد عملاء</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'لم يتم العثور على عملاء يطابقون المعايير المحددة' 
                : 'لم يتم تسجيل أي عملاء بعد'
              }
            </p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={showCustomerDetails && selectedCustomer !== null}
        onClose={() => setShowCustomerDetails(false)}
        title={`تفاصيل العميل - ${selectedCustomer?.name || ''}`}
        icon={<User className="w-5 h-5" />}
        maxWidth="6xl"
      >
        {selectedCustomer && (
          <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <img 
                      className="h-16 w-16 rounded-full object-cover" 
                      src={getCustomerAvatar(selectedCustomer)}
                      alt={selectedCustomer.name}
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        {selectedCustomer.name}
                        {selectedCustomer.tags?.includes('VIP') && (
                          <Crown className="w-5 h-5 text-yellow-500" />
                        )}
                      </h3>
                      <p className="text-gray-600">#{selectedCustomer.id.slice(-8)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusConfig[selectedCustomer.status].color}`}>
                        {statusConfig[selectedCustomer.status].label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCustomerDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <User className="w-4 h-4 ml-2" />
                        معلومات العميل
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">البريد الإلكتروني:</span>
                          <span className="text-gray-900">{selectedCustomer.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">رقم الهاتف:</span>
                          <span className="text-gray-900" dir="ltr">{formatPhone(selectedCustomer.phone)}</span>
                        </div>
                        {selectedCustomer.city && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">المدينة:</span>
                            <span className="text-gray-900">{selectedCustomer.city}</span>
                          </div>
                        )}
                        {selectedCustomer.address && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">العنوان:</span>
                            <span className="text-gray-900">{selectedCustomer.address}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">تاريخ التسجيل:</span>
                          <span className="text-gray-900">{formatDate(selectedCustomer.registrationDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Activity className="w-4 h-4 ml-2" />
                        إحصائيات النشاط
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-800">{selectedCustomer.totalOrders}</div>
                          <div className="text-blue-600">إجمالي الطلبات</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-800">${selectedCustomer.totalSpent.toFixed(2)}</div>
                          <div className="text-green-600">إجمالي الإنفاق</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-800">${selectedCustomer.averageOrderValue.toFixed(2)}</div>
                          <div className="text-purple-600">متوسط قيمة الطلب</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-800">
                            {selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'لا يوجد'}
                          </div>
                          <div className="text-orange-600">آخر طلب</div>
                        </div>
                      </div>
                    </div>

                    {selectedCustomer.notes && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">ملاحظات:</h4>
                        <p className="text-sm text-gray-700">{selectedCustomer.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Customer Orders */}
                  <div>
                    <div className="bg-white border rounded-lg">
                      <div className="p-4 border-b">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <ShoppingBag className="w-4 h-4 ml-2" />
                          طلبات العميل ({customerOrders.length})
                        </h4>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {customerOrders.length > 0 ? (
                          <div className="divide-y">
                            {customerOrders.map((order) => (
                              <div key={order.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-medium text-gray-900">{order.productName}</div>
                                    <div className="text-sm text-gray-500">#{order.id.slice(-8)}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">${order.totalAmount}</div>
                                    <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.status === 'completed' ? 'مكتمل' :
                                     order.status === 'confirmed' ? 'مؤكد' :
                                     order.status === 'pending' ? 'معلق' : 'ملغي'}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    order.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.paymentStatus === 'paid' ? 'مدفوع' :
                                     order.paymentStatus === 'refunded' ? 'مسترد' : 'غير مدفوع'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>لا توجد طلبات لهذا العميل</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end pt-6 border-t mt-6 gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowCustomerDetails(false)}
                  >
                    إغلاق
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Edit className="w-4 h-4" />}
                  >
                    تعديل العميل
                  </Button>
                </div>
              </div>
        )}
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddCustomerForm}
        onClose={handleCloseAddCustomerForm}
        title="إضافة عميل جديد"
        icon={<UserPlus className="w-5 h-5" />}
        maxWidth="4xl"
        preventClose={isSubmittingNewCustomer}
      >

              <form onSubmit={handleAddCustomerSubmit}>
                {/* Error Message */}
                {newCustomerError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</div>
                      </div>
                      <span className="text-red-700 text-sm font-medium">{newCustomerError}</span>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        المعلومات الأساسية
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الاسم الكامل *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={addCustomerData.name}
                            onChange={handleAddCustomerInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            placeholder="أدخل الاسم الكامل"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            البريد الإلكتروني *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={addCustomerData.email}
                            onChange={handleAddCustomerInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            placeholder="example@domain.com"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            رقم الجوال *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={addCustomerData.phone}
                            onChange={handleAddCustomerInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            placeholder="0512345678"
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الجنس
                          </label>
                          <select
                            name="gender"
                            value={addCustomerData.gender}
                            onChange={handleAddCustomerInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          >
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        معلومات إضافية
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            العنوان
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={addCustomerData.address}
                            onChange={handleAddCustomerInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            placeholder="العنوان التفصيلي"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            المدينة
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={addCustomerData.city}
                            onChange={handleAddCustomerInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            placeholder="المدينة"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            البلد
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={addCustomerData.country}
                            onChange={handleAddCustomerInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            placeholder="البلد"
                          />
                        </div>

                        {/* Preferred Payment Method */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            طريقة الدفع المفضلة
                          </label>
                          <select
                            name="preferredPaymentMethod"
                            value={addCustomerData.preferredPaymentMethod}
                            onChange={handleAddCustomerInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                          >
                            <option value="card">بطاقة ائتمان</option>
                            <option value="cash">نقداً</option>
                            <option value="bank_transfer">تحويل بنكي</option>
                            <option value="digital_wallet">محفظة رقمية</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags and Notes */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        العلامات والملاحظات
                      </h4>
                      
                      <div className="space-y-4">
                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العلامات (فصل بفاصلة)
                      </label>
                      <input
                        type="text"
                        value={addCustomerData.tags.join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                        placeholder="عميل مميز, عميل دائم, طلبات كبيرة"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        أدخل العلامات مفصولة بفاصلة لتصنيف العميل
                      </p>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ملاحظات
                      </label>
                      <textarea
                        name="notes"
                        value={addCustomerData.notes}
                        onChange={handleAddCustomerInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                        placeholder="أي ملاحظات إضافية عن العميل..."
                      />
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 bg-gray-50 rounded-b-xl -mx-6 -mb-6 px-6 pb-6">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleCloseAddCustomerForm}
                    disabled={isSubmittingNewCustomer}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isSubmittingNewCustomer}
                    icon={<UserPlus className="w-4 h-4" />}
                    disabled={isSubmittingNewCustomer}
                  >
                    إضافة العميل
                  </Button>
                </div>
              </form>
      </Modal>
      
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => hideToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default CustomersTab;
