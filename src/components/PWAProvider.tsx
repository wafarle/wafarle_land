'use client';

import { useEffect } from 'react';

export default function PWAProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register('/sw.js');
          // Warm offline page
          fetch('/offline');
        } catch (err) {
          console.warn('SW registration failed', err);
        }
      };
      register();
    }
  }, []);

  return null;
}




