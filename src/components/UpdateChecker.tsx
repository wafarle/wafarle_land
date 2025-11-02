'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Download, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// System version - update this when releasing new versions
const CURRENT_VERSION = '1.0.0';
const LICENSE_KEY = process.env.NEXT_PUBLIC_LICENSE_KEY || '';
const SYSTEM_DOMAIN = typeof window !== 'undefined' ? window.location.hostname : '';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateInfo?: {
    version: string;
    title: string;
    description: string;
    features?: string[];
    bugFixes?: string[];
    breaking?: boolean;
    downloadUrl?: string;
    documentationUrl?: string;
    minRequiredVersion?: string;
  };
  message: string;
}

export default function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Check if notification was dismissed in this session
    const dismissedInSession = sessionStorage.getItem('update-notification-dismissed');
    if (dismissedInSession) {
      setDismissed(true);
      return;
    }

    // Check for updates
    checkForUpdates();

    // Set up interval to check every 6 hours
    const interval = setInterval(() => {
      checkForUpdates();
    }, 6 * 60 * 60 * 1000); // 6 hours

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    // Skip if no license key or in development
    if (!LICENSE_KEY || process.env.NODE_ENV === 'development') {
      return;
    }

    setChecking(true);

    try {
      const response = await fetch('/api/check-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey: LICENSE_KEY,
          domain: SYSTEM_DOMAIN,
          currentVersion: CURRENT_VERSION,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hasUpdate) {
          setUpdateInfo(data);
          setShowNotification(true);
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setDismissed(true);
    sessionStorage.setItem('update-notification-dismissed', 'true');
  };

  if (!updateInfo || !showNotification || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-20 right-4 left-4 md:left-auto md:w-96 z-40"
      >
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">تحديث جديد متاح!</h3>
                <p className="text-white/80 text-sm">
                  الإصدار {updateInfo.updateInfo?.version}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-4">
            <h4 className="text-white font-semibold">
              {updateInfo.updateInfo?.title}
            </h4>
            <p className="text-white/90 text-sm">
              {updateInfo.updateInfo?.description}
            </p>

            {updateInfo.updateInfo?.breaking && (
              <div className="flex items-start gap-2 p-3 bg-red-500/20 rounded-lg border border-red-400/30">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-200">
                  <span className="font-bold">تنبيه: </span>
                  هذا التحديث يحتوي على تغييرات جذرية قد تتطلب تعديلات في الكود
                </div>
              </div>
            )}

            {updateInfo.updateInfo?.features && updateInfo.updateInfo.features.length > 0 && (
              <div>
                <p className="text-white/80 text-xs font-semibold mb-2">ميزات جديدة:</p>
                <ul className="space-y-1">
                  {updateInfo.updateInfo.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-white/70">
                      <CheckCircle className="w-3 h-3 text-green-300 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {updateInfo.updateInfo.features.length > 3 && (
                    <li className="text-xs text-white/60">
                      +{updateInfo.updateInfo.features.length - 3} ميزات أخرى
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href="/changelog"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-white/90 transition-colors font-medium text-sm"
            >
              عرض التفاصيل
              <ExternalLink className="w-4 h-4" />
            </Link>
            {updateInfo.updateInfo?.downloadUrl && (
              <a
                href={updateInfo.updateInfo.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                تحميل
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

