'use client';

import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
  form
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-gold to-yellow-500 hover:from-primary-gold/90 hover:to-yellow-500/90 text-white shadow-lg hover:shadow-xl focus:ring-primary-gold/50 transform hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-500/50 hover:border-gray-400',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-500/50 transform hover:scale-[1.02] active:scale-[0.98]',
    success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500/50 transform hover:scale-[1.02] active:scale-[0.98]',
    warning: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-orange-500/50 transform hover:scale-[1.02] active:scale-[0.98]'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      form={form}
    >
      {loading ? (
        <>
          <LoadingSpinner 
            size={size === 'lg' ? 'md' : 'sm'} 
            color={variant === 'secondary' ? 'gray' : 'white'} 
          />
          <span>جاري التحميل...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'right' && (
            <div className={iconSizeClasses[size]}>
              {icon}
            </div>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'left' && (
            <div className={iconSizeClasses[size]}>
              {icon}
            </div>
          )}
        </>
      )}
    </motion.button>
  );
};

export default Button;

