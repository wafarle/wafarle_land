'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Package, CreditCard, Truck, AlertCircle } from 'lucide-react';
import { useCustomerNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useCustomerNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return Package;
      case 'payment':
        return CreditCard;
      case 'shipping':
        return Truck;
      case 'subscription':
        return Check;
      default:
        return AlertCircle;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-600 bg-blue-50';
      case 'payment':
        return 'text-green-600 bg-green-50';
      case 'shipping':
        return 'text-purple-600 bg-purple-50';
      case 'subscription':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notifications Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute left-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">الإشعارات</h3>
                    <p className="text-xs text-white/80">
                      {unreadCount > 0 ? `${unreadCount} جديد` : 'لا توجد إشعارات جديدة'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      تعيين الكل كمقروء
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">لا توجد إشعارات بعد</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => {
                      const Icon = getIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor(notification.type)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.timestamp).toLocaleString('ar-SA', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              {notification.actionUrl && (
                                <Link
                                  href={notification.actionUrl}
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    setIsOpen(false);
                                  }}
                                  className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  عرض التفاصيل ←
                                </Link>
                              )}
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                                >
                                  تعيين كمقروء
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <Link
                    href="/customer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium text-center block"
                  >
                    عرض جميع الإشعارات
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

