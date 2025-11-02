'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onCustomerAuthStateChange, CustomerUser } from '@/lib/customerAuth';
import { subscribeToOrders, subscribeToCustomerSubscriptions } from '@/lib/database';
import { Order, Subscription } from '@/lib/firebase';

export interface CustomerNotification {
  id: string;
  type: 'order' | 'subscription' | 'payment' | 'shipping' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: string;
}

interface NotificationContextType {
  notifications: CustomerNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<CustomerNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const CustomerNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [lastSubCount, setLastSubCount] = useState(0);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customerNotifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('customerNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Listen to customer auth
  useEffect(() => {
    const unsubscribe = onCustomerAuthStateChange((user) => {
      setCustomerUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to orders for notifications
  useEffect(() => {
    if (!customerUser) return;

    const unsubscribeOrders = subscribeToOrders((orders) => {
      const customerOrders = orders.filter(
        o => o.customerEmail?.toLowerCase() === customerUser.email.toLowerCase()
      );

      // Check for new orders or status changes
      if (lastOrderCount > 0 && customerOrders.length > lastOrderCount) {
        const newOrder = customerOrders[0]; // Newest order
        addNotification({
          type: 'order',
          title: 'طلب جديد',
          message: `تم إنشاء طلب جديد: ${newOrder.productName}`,
          actionUrl: '/customer/dashboard?tab=orders'
        });
      }

      // Check for status changes
      customerOrders.forEach((order) => {
        if (order.status === 'confirmed' && order.createdAt) {
          const timeDiff = Date.now() - new Date(order.createdAt).getTime();
          if (timeDiff < 60000) { // Within last minute
            addNotification({
              type: 'order',
              title: 'تم تأكيد الطلب',
              message: `طلبك ${order.productName} تم تأكيده بنجاح`,
              actionUrl: '/customer/dashboard?tab=orders'
            });
          }
        }

        if (order.shippingStatus === 'shipped' && order.shippedAt) {
          const timeDiff = Date.now() - new Date(order.shippedAt).getTime();
          if (timeDiff < 60000) {
            addNotification({
              type: 'shipping',
              title: 'تم الشحن',
              message: `طلبك ${order.productName} في الطريق إليك`,
              actionUrl: '/customer/dashboard?tab=orders'
            });
          }
        }
      });

      setLastOrderCount(customerOrders.length);
    });

    return () => unsubscribeOrders();
  }, [customerUser, lastOrderCount]);

  const addNotification = (notification: Omit<CustomerNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: CustomerNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('customerNotifications');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useCustomerNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useCustomerNotifications must be used within a CustomerNotificationProvider');
  }
  return context;
};

