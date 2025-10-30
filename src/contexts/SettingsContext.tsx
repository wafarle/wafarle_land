'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  AllSettings, 
  getWebsiteSettings, 
  updateWebsiteSettings, 
  subscribeToWebsiteSettings,
  DEFAULT_WEBSITE_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_ANALYTICS_SETTINGS
} from '../lib/database';

interface SettingsContextType {
  settings: AllSettings;
  updateSettings: (newSettings: AllSettings) => Promise<void>;
  loading: boolean;
  error: string | null;
  isMaintenanceMode: boolean;
  refreshSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AllSettings>({
    website: DEFAULT_WEBSITE_SETTINGS,
    security: DEFAULT_SECURITY_SETTINGS,
    notifications: DEFAULT_NOTIFICATION_SETTINGS,
    system: DEFAULT_SYSTEM_SETTINGS,
    analytics: DEFAULT_ANALYTICS_SETTINGS,
    updatedAt: new Date(),
    updatedBy: 'system'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSettings = await getWebsiteSettings();
      setSettings(loadedSettings);
      console.log('✅ Settings loaded:', loadedSettings);
    } catch (err) {
      console.error('❌ Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettingsHandler = async (newSettings: AllSettings): Promise<void> => {
    try {
      setError(null);
      await updateWebsiteSettings({
        ...newSettings,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });
      
      // Update local state immediately for better UX
      setSettings(prev => ({
        ...newSettings,
        updatedAt: new Date(),
        updatedBy: 'admin'
      }));
      
      console.log('✅ Settings updated successfully');
    } catch (err) {
      console.error('❌ Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err; // Re-throw so calling code can handle it
    }
  };

  // Subscribe to real-time settings changes
  useEffect(() => {
    console.log('🔄 Setting up settings subscription...');
    
    const unsubscribe = subscribeToWebsiteSettings((updatedSettings) => {
      console.log('📥 Settings updated from subscription:', updatedSettings);
      setSettings(updatedSettings);
      setLoading(false);
    });

    // Initial load
    loadSettings();

    return () => {
      console.log('🔌 Unsubscribing from settings...');
      unsubscribe();
    };
  }, []);

  // Apply maintenance mode to document
  useEffect(() => {
    if (settings.website.maintenanceMode) {
      document.body.classList.add('maintenance-mode');
      console.log('🚧 Maintenance mode applied to body');
    } else {
      document.body.classList.remove('maintenance-mode');
      console.log('✅ Maintenance mode removed from body');
    }
  }, [settings.website.maintenanceMode]);

  // Apply site title
  useEffect(() => {
    if (settings.website.siteName) {
      document.title = settings.website.siteName;
    }
  }, [settings.website.siteName]);

  const value: SettingsContextType = {
    settings,
    updateSettings: updateSettingsHandler,
    loading,
    error,
    isMaintenanceMode: settings.website.maintenanceMode,
    refreshSettings: loadSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Helper hook to get specific setting values
export const useSiteName = () => {
  const { settings } = useSettings();
  return settings.website.siteName;
};

export const useContactInfo = () => {
  const { settings } = useSettings();
  return {
    email: settings.website.contactEmail,
    phone: settings.website.contactPhone
  };
};

export const useMaintenanceMode = () => {
  const { settings } = useSettings();
  return settings.website.maintenanceMode;
};

export const useCurrency = () => {
  const { settings } = useSettings();
  return settings.website.currency;
};

export const useSEO = () => {
  const { settings } = useSettings();
  return settings.website.seo;
};
