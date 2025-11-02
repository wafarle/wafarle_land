'use client';

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app, FIREBASE_ENABLED } from './firebase';

let messaging: Messaging | null = null;

// Initialize Firebase Cloud Messaging (only in browser)
if (typeof window !== 'undefined' && 'Notification' in window && FIREBASE_ENABLED && app) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging initialization error:', error);
  }
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging || typeof window === 'undefined') return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

/**
 * Listen for incoming messages
 */
export function onMessageListener() {
  return new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

export { messaging };

