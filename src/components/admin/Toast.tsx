'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';
import Portal from './Portal';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}) => {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      borderColor: 'border-red-600'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      borderColor: 'border-orange-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      borderColor: 'border-blue-600'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <Portal containerId="toast-root">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className={`
              fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999]
              min-w-80 max-w-md
              ${config.bgColor} ${config.textColor}
              rounded-xl shadow-2xl border ${config.borderColor}
              backdrop-blur-sm
            `}
            style={{
              position: 'fixed',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999,
              pointerEvents: 'auto'
            }}
          >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress Bar */}
          {duration > 0 && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="h-1 bg-white/30 rounded-b-xl"
            />
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default Toast;
