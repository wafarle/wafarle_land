/**
 * Firebase Cloud Messaging Service Worker
 * This file must be in the public directory for FCM to work
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase
// Note: In production, these should be passed as a message or use environment variables
const firebaseConfig = {
  apiKey: self.firebaseConfig?.apiKey || "AIzaSyADXAZf6_DAgya_HcwRYQvNxo1lUFu4LqE",
  authDomain: self.firebaseConfig?.authDomain || "wafarle-63a71.firebaseapp.com",
  projectId: self.firebaseConfig?.projectId || "wafarle-63a71",
  storageBucket: self.firebaseConfig?.storageBucket || "wafarle-63a71.firebasestorage.app",
  messagingSenderId: self.firebaseConfig?.messagingSenderId || "234030784195",
  appId: self.firebaseConfig?.appId || "1:234030784195:web:fef98ef416f0c1bc388c76",
  measurementId: self.firebaseConfig?.measurementId || "G-LH9ZENFJPY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.orderId || Date.now().toString(),
    requireInteraction: false,
    silent: false,
    ...payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  // Handle click action based on notification data
  const data = event.notification.data || {};
  
  // Open or focus the app
  if (data.orderId) {
    event.waitUntil(
      clients.openWindow(`/customer/dashboard?orderId=${data.orderId}`)
    );
  } else if (data.type === 'new_order') {
    event.waitUntil(
      clients.openWindow('/admin/dashboard?tab=orders')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

