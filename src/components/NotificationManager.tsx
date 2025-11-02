'use client';

import { useEffect, useState } from 'react';
import { 
  requestNotificationPermission, 
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermission,
  showBrowserNotification
} from '@/lib/notifications';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export const NotificationManager = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    timestamp: Date;
  }>>([]);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState<{ orders: boolean; offers: boolean; updates: boolean }>(
    { orders: true, offers: true, updates: true }
  );

  useEffect(() => {
    // Load prefs from localStorage
    try {
      const saved = localStorage.getItem('notifPrefs');
      if (saved) setPrefs(JSON.parse(saved));
    } catch {}

    if (!isNotificationSupported()) {
      return;
    }

    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);

    // Show permission prompt if not granted and not denied
    if (currentPermission === 'default') {
      // Delay showing prompt to avoid annoying users immediately
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }

    // Request permission and set up listeners
    if (currentPermission === 'granted') {
      requestNotificationPermission();
      
      // Listen for foreground messages
      const unsubscribe = onForegroundMessage((payload: NotificationPayload) => {
        // Filter by type if provided
        const type = payload.data?.type as 'orders' | 'offers' | 'updates' | undefined;
        if (type && prefs[type] === false) return;
        const notification = {
          id: Date.now().toString(),
          title: payload.notification?.title || 'إشعار جديد',
          body: payload.notification?.body || '',
          data: payload.data,
          timestamp: new Date(),
        };

        setNotifications((prev) => [notification, ...prev.slice(0, 4)]); // Keep max 5

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        }, 5000);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleRequestPermission = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setPermission('granted');
      setShowPermissionPrompt(false);
      
      // Send token to server to save
      try {
        await fetch('/api/notifications/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch (error) {
        console.error('Error saving FCM token:', error);
      }
    } else {
      setPermission('denied');
      setShowPermissionPrompt(false);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {/* Preferences Panel Toggle */}
      <button
        onClick={() => setPrefsOpen(!prefsOpen)}
        className="fixed bottom-4 right-4 z-[9999] px-3 py-2 rounded-lg bg-white border border-gray-200 shadow hover:bg-gray-50 text-sm"
      >
        تفضيلات الإشعارات
      </button>

      {/* Preferences Panel */}
      <AnimatePresence>
        {prefsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 right-4 z-[9999] w-72 bg-white border border-gray-200 rounded-lg shadow"
          >
            <div className="p-3 border-b font-semibold">تفضيلات الإشعارات</div>
            <div className="p-3 space-y-2 text-sm">
              <label className="flex items-center justify-between">
                <span>طلبات</span>
                <input type="checkbox" checked={prefs.orders} onChange={(e) => {
                  const next = { ...prefs, orders: e.target.checked };
                  setPrefs(next);
                  localStorage.setItem('notifPrefs', JSON.stringify(next));
                }} />
              </label>
              <label className="flex items-center justify-between">
                <span>عروض</span>
                <input type="checkbox" checked={prefs.offers} onChange={(e) => {
                  const next = { ...prefs, offers: e.target.checked };
                  setPrefs(next);
                  localStorage.setItem('notifPrefs', JSON.stringify(next));
                }} />
              </label>
              <label className="flex items-center justify-between">
                <span>تحديثات</span>
                <input type="checkbox" checked={prefs.updates} onChange={(e) => {
                  const next = { ...prefs, updates: e.target.checked };
                  setPrefs(next);
                  localStorage.setItem('notifPrefs', JSON.stringify(next));
                }} />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Permission Prompt */}
      <AnimatePresence>
        {showPermissionPrompt && permission === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999]"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-2xl p-4 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Bell className="w-6 h-6 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">السماح بالإشعارات</h3>
                  <p className="text-sm text-purple-100 mb-3">
                    احصل على إشعارات فورية عند تحديث طلباتك أو طلبات جديدة
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRequestPermission}
                      className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-sm"
                    >
                      السماح
                    </button>
                    <button
                      onClick={() => setShowPermissionPrompt(false)}
                      className="px-4 py-2 bg-purple-500/20 text-white rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                    >
                      لاحقاً
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowPermissionPrompt(false)}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-App Notifications */}
      <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9998] pointer-events-none">
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 pointer-events-auto"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.timestamp.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};




