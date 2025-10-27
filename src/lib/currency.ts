'use client';

import { createContext, useContext } from 'react';

// Currency interface
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  position: 'before' | 'after'; // موضع رمز العملة
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  exchangeRate?: number; // سعر الصرف مقابل العملة الأساسية
}

// Available currencies
export const AVAILABLE_CURRENCIES: Currency[] = [
  {
    code: 'SAR',
    symbol: 'ر.س',
    name: 'الريال السعودي',
    position: 'after',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 1
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'الدولار الأمريكي',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 0.27 // تقريبي: 1 ريال = 0.27 دولار
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'اليورو',
    position: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 0.24 // تقريبي: 1 ريال = 0.24 يورو
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'الدرهم الإماراتي',
    position: 'after',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 0.98 // تقريبي: 1 ريال = 0.98 درهم
  },
  {
    code: 'EGP',
    symbol: 'ج.م',
    name: 'الجنيه المصري',
    position: 'after',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 13.2 // تقريبي: 1 ريال = 13.2 جنيه
  },
  {
    code: 'JOD',
    symbol: 'د.أ',
    name: 'الدينار الأردني',
    position: 'after',
    decimalPlaces: 3,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    exchangeRate: 0.19 // تقريبي: 1 ريال = 0.19 دينار
  }
];

// Default currency (SAR)
export const DEFAULT_CURRENCY = AVAILABLE_CURRENCIES[0];

// Currency settings interface
export interface CurrencySettings {
  currentCurrency: Currency;
  baseCurrency: Currency; // العملة الأساسية للنظام
  autoConvert: boolean; // تحويل تلقائي للأسعار
  showOriginalPrice: boolean; // إظهار السعر الأصلي
}

// Default currency settings
export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  currentCurrency: DEFAULT_CURRENCY,
  baseCurrency: DEFAULT_CURRENCY,
  autoConvert: false,
  showOriginalPrice: false
};

// Currency context
export const CurrencyContext = createContext<{
  settings: CurrencySettings;
  updateSettings: (settings: Partial<CurrencySettings>) => Promise<void>;
  formatPrice: (amount: number, currency?: Currency) => string;
  convertPrice: (amount: number, fromCurrency?: Currency, toCurrency?: Currency) => number;
}>({
  settings: DEFAULT_CURRENCY_SETTINGS,
  updateSettings: async () => {},
  formatPrice: (amount: number) => `${amount}`,
  convertPrice: (amount: number) => amount
});

// Format price with currency
export const formatPrice = (
  amount: number, 
  currency: Currency = DEFAULT_CURRENCY,
  showSymbol: boolean = true
): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency.position === 'before' 
      ? `${currency.symbol}0${currency.decimalSeparator}00`
      : `0${currency.decimalSeparator}00 ${currency.symbol}`;
  }

  // Format number with proper decimal places and separators
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
    useGrouping: true
  }).replace(/,/g, currency.thousandsSeparator);

  if (!showSymbol) {
    return formatted;
  }

  // Add currency symbol based on position
  return currency.position === 'before' 
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`;
};

// Convert price between currencies
export const convertPrice = (
  amount: number,
  fromCurrency: Currency = DEFAULT_CURRENCY,
  toCurrency: Currency = DEFAULT_CURRENCY
): number => {
  if (fromCurrency.code === toCurrency.code) {
    return amount;
  }

  // Convert to base currency first (SAR), then to target currency
  const baseAmount = amount / (fromCurrency.exchangeRate || 1);
  return baseAmount * (toCurrency.exchangeRate || 1);
};

// Get currency by code
export const getCurrencyByCode = (code: string): Currency => {
  return AVAILABLE_CURRENCIES.find(c => c.code === code) || DEFAULT_CURRENCY;
};

// Parse formatted price back to number
export const parsePrice = (formattedPrice: string, currency: Currency = DEFAULT_CURRENCY): number => {
  // Remove currency symbol and extra spaces
  let cleanPrice = formattedPrice.replace(currency.symbol, '').trim();
  
  // Replace thousands separator and decimal separator
  cleanPrice = cleanPrice
    .replace(new RegExp(`\\${currency.thousandsSeparator}`, 'g'), '')
    .replace(currency.decimalSeparator, '.');
    
  return parseFloat(cleanPrice) || 0;
};

// Validate currency amount
export const validateCurrencyAmount = (amount: number, currency: Currency = DEFAULT_CURRENCY): boolean => {
  return !isNaN(amount) && amount >= 0 && amount <= 999999999;
};

// Get currency display info
export const getCurrencyDisplay = (currency: Currency): string => {
  return `${currency.name} (${currency.symbol})`;
};

