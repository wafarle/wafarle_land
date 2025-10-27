'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Portal from './Portal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'fullscreen';
  preventClose?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = '4xl',
  preventClose = false,
  showCloseButton = true
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'fullscreen': 'max-w-[95vw] h-[95vh]',
  };

  const handleOverlayClick = () => {
    if (!preventClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !preventClose) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Add modal-open class and save original overflow
      const originalOverflow = document.body.style.overflow;
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original state
        document.body.classList.remove('modal-open');
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] overflow-y-auto"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'auto'
            }}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
          {/* Enhanced Overlay with Backdrop Blur - Full Screen Coverage */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 1
            }}
            onClick={handleOverlayClick}
          />
          
          {/* Modal Container - Full Screen */}
          <div 
            className="flex min-h-full items-center justify-center p-4 text-center sm:p-6 lg:p-8"
            style={{
              position: 'relative',
              zIndex: 10,
              minHeight: '100vh',
              width: '50%',
              margin:'auto' ,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0.0, 0.2, 1],
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
              className={`relative w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-2xl bg-white text-right shadow-2xl transition-all`}
              style={{
                position: 'relative',
                zIndex: 20,
                maxHeight: '95vh'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Header with Gradient Background */}
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {icon && (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary-gold to-yellow-500 shadow-lg">
                        <div className="text-white">
                          {icon}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        {title}
                      </h3>
                      <div className="mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-primary-gold to-yellow-500" />
                    </div>
                  </div>
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      disabled={preventClose}
                      className="group rounded-lg p-2 transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <X className="h-6 w-6 text-gray-500 transition-colors group-hover:text-gray-700" />
                    </button>
                  )}
                </div>
              </div>

              {/* Enhanced Body with Custom Scrollbar */}
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                <div className="px-6 py-6 sm:px-8">
                  {children}
                </div>
              </div>

              {/* Enhanced Shadow Overlay for Depth */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
            </motion.div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default Modal;
