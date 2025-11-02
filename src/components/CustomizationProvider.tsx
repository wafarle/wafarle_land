'use client';

import { useEffect } from 'react';
import { useCustomization } from '@/hooks/useCustomization';

/**
 * Component that applies customization settings to the document
 * This includes CSS variables for colors and fonts
 */
export default function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const { theme, typography } = useCustomization();

  useEffect(() => {
    // Apply theme colors as CSS variables only if they exist in database
    if (!theme) return;
    
    const root = document.documentElement;
    
    // Primary colors
    if (theme.primaryColor) {
      root.style.setProperty('--primary-blue', theme.primaryColor);
      root.style.setProperty('--primary-blue-light', theme.primaryColor);
      root.style.setProperty('--primary-blue-dark', theme.primaryColor);
    }
    
    // Secondary colors
    if (theme.secondaryColor) {
      root.style.setProperty('--accent-purple', theme.secondaryColor);
      root.style.setProperty('--accent-purple-light', theme.secondaryColor);
    }
    
    // Accent
    if (theme.accentColor) {
      root.style.setProperty('--secondary-emerald', theme.accentColor);
    }
    
    // Background
    if (theme.backgroundColor) {
      root.style.setProperty('--background', theme.backgroundColor);
    }
    
    // Text colors
    if (theme.textColor) {
      root.style.setProperty('--foreground', theme.textColor);
      root.style.setProperty('--text-primary', theme.textColor);
    }
    
    // Border
    if (theme.borderColor) {
      root.style.setProperty('--border-color', theme.borderColor);
    }
    
    // Success, Warning, Error
    if (theme.successColor) {
      root.style.setProperty('--success-color', theme.successColor);
    }
    if (theme.warningColor) {
      root.style.setProperty('--warning-color', theme.warningColor);
    }
    if (theme.errorColor) {
      root.style.setProperty('--error-color', theme.errorColor);
    }
    
    // Font family - only apply if exists in database
    if (typography?.fontFamily) {
      root.style.setProperty('--font-custom', typography.fontFamily);
      document.body.style.fontFamily = typography.fontFamily;
    }
    
    if (typography?.headingFont) {
      root.style.setProperty('--font-heading', typography.headingFont);
    }
    
    if (typography?.bodyFont) {
      root.style.setProperty('--font-body', typography.bodyFont);
    }
  }, [theme, typography]);

  return <>{children}</>;
}

