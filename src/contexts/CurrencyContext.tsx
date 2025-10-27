'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Currency, 
  CurrencySettings, 
  DEFAULT_CURRENCY_SETTINGS,
  formatPrice as baseFormatPrice,
  convertPrice as baseConvertPrice,
  getCurrencyByCode
} from '@/lib/currency';
import { getCurrencySettings, updateCurrencySettings } from '@/lib/database';

// Currency context type
interface CurrencyContextType {
  settings: CurrencySettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<CurrencySettings>) => Promise<void>;
  formatPrice: (amount: number, currency?: Currency, showSymbol?: boolean) => string;
  convertPrice: (amount: number, fromCurrency?: Currency, toCurrency?: Currency) => number;
  getCurrentCurrency: () => Currency;
  refreshSettings: () => Promise<void>;
}

// Create context
const CurrencyContext = createContext<CurrencyContextType | null>(null);

// Provider props
interface CurrencyProviderProps {
  children: ReactNode;
}

// Currency provider component
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<CurrencySettings>(DEFAULT_CURRENCY_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load currency settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await getCurrencySettings();
      setSettings(savedSettings || DEFAULT_CURRENCY_SETTINGS);
    } catch (error) {
      console.error('Error loading currency settings:', error);
      setSettings(DEFAULT_CURRENCY_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  // Update currency settings
  const updateSettings = async (newSettings: Partial<CurrencySettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Update in database
      await updateCurrencySettings(updatedSettings);
      
      // Update local state
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating currency settings:', error);
      throw error;
    }
  };

  // Format price using current settings
  const formatPrice = (
    amount: number, 
    currency?: Currency, 
    showSymbol: boolean = true
  ): string => {
    const targetCurrency = currency || settings.currentCurrency;
    
    // Convert price if needed
    let finalAmount = amount;
    if (settings.autoConvert && currency && currency.code !== settings.currentCurrency.code) {
      finalAmount = baseConvertPrice(amount, currency, settings.currentCurrency);
    }
    
    return baseFormatPrice(finalAmount, targetCurrency, showSymbol);
  };

  // Convert price using current settings
  const convertPrice = (
    amount: number,
    fromCurrency?: Currency,
    toCurrency?: Currency
  ): number => {
    const from = fromCurrency || settings.baseCurrency;
    const to = toCurrency || settings.currentCurrency;
    
    return baseConvertPrice(amount, from, to);
  };

  // Get current currency
  const getCurrentCurrency = (): Currency => {
    return settings.currentCurrency;
  };

  // Refresh settings
  const refreshSettings = async () => {
    await loadSettings();
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const contextValue: CurrencyContextType = {
    settings,
    loading,
    updateSettings,
    formatPrice,
    convertPrice,
    getCurrentCurrency,
    refreshSettings
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Hook for easy price formatting
export const useFormatPrice = () => {
  const { formatPrice, getCurrentCurrency } = useCurrency();
  
  return {
    formatPrice,
    currency: getCurrentCurrency(),
    // Convenience method for quick formatting
    format: (amount: number) => formatPrice(amount)
  };
};

// Hook for price conversion
export const usePriceConverter = () => {
  const { convertPrice, settings } = useCurrency();
  
  return {
    convert: convertPrice,
    convertToCurrent: (amount: number, fromCurrency?: Currency) => 
      convertPrice(amount, fromCurrency, settings.currentCurrency),
    convertFromCurrent: (amount: number, toCurrency: Currency) =>
      convertPrice(amount, settings.currentCurrency, toCurrency)
  };
};

