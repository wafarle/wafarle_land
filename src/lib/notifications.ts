/**
 * Push Notifications System
 * Handles Firebase Cloud Messaging (FCM) notifications
 */

import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

// VAPID key for web push (should be in environment variables)
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Browser does not support notifications');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      if (!messaging) {
        console.warn('Firebase Messaging not initialized');
        return null;
      }

      // Register service worker first if not already registered
      let serviceWorkerRegistration;
      if ('serviceWorker' in navigator) {
        // Check if already registered (try default scope first)
        serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
        
        if (!serviceWorkerRegistration) {
          try {
            // Register service worker at root scope
            serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('✅ Service Worker registered:', serviceWorkerRegistration);
          } catch (error: any) {
            console.error('Service Worker registration error:', error);
            // Don't fail completely, FCM might still work with existing registration
            serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
          }
        } else {
          console.log('✅ Service Worker already registered');
        }
      }

      const tokenOptions: any = {
        vapidKey: VAPID_KEY
      };

      // Add service worker registration if available
      if (serviceWorkerRegistration) {
        tokenOptions.serviceWorkerRegistration = serviceWorkerRegistration;
      } else {
        // Fallback: try to get any existing registration
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          tokenOptions.serviceWorkerRegistration = existingRegistration;
        }
      }

      const token = await getToken(messaging, tokenOptions);

      if (token) {
        console.log('FCM Token obtained:', token);
        
        // Save token to database or localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('fcm_token', token);
          // TODO: Send token to server to save in database
        }
        
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {}; // Return empty unsubscribe function
  }

  try {
    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
      
      // Show browser notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notificationTitle = payload.notification?.title || 'إشعار جديد';
        const notificationOptions: NotificationOptions = {
          body: payload.notification?.body || '',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: payload.data?.orderId || Date.now().toString(),
          ...(payload.data && { data: payload.data })
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return () => {};
  }
};

/**
 * Show browser notification (fallback for browsers without FCM)
 */
export const showBrowserNotification = (
  title: string,
  options: NotificationOptions = {}
): void => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  } else if (Notification.permission !== 'denied') {
    // Request permission
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      }
    });
  }
};

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Check current notification permission
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'default';
  }
  return Notification.permission;
};

