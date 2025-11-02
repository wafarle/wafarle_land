'use client';

import { useSettings } from '@/contexts/SettingsContext';

/**
 * Hook to access store customization settings
 */
export const useCustomization = () => {
  const { settings } = useSettings();
  const customization = settings.website.customization;
  
  // Return only what's in the database, no defaults
  return {
    storeType: settings.website.storeType,
    theme: customization?.theme,
    typography: customization?.typography,
    layout: customization?.layout,
    productOptions: customization?.productOptions,
    categories: customization?.categories || [],
  };
};

