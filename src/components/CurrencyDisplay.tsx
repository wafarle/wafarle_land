'use client';

import { useState, useEffect } from 'react';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}

interface CurrencyDisplayProps {
  price: number;
  originalCurrency?: string;
  className?: string;
}

const CurrencyDisplay = ({ price, originalCurrency = 'USD', className = '' }: CurrencyDisplayProps) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(null);
  const [convertedPrice, setConvertedPrice] = useState<number>(price);

  // Mock currencies data (same as in CurrencySettings)
  useEffect(() => {
    const mockCurrencies: Currency[] = [
      {
        id: '1',
        code: 'SAR',
        name: 'الريال السعودي',
        symbol: 'ر.س',
        rate: 1,
        isDefault: true,
        isActive: true,
      },
      {
        id: '2',
        code: 'USD',
        name: 'الدولار الأمريكي',
        symbol: '$',
        rate: 0.27,
        isDefault: false,
        isActive: true,
      },
      {
        id: '3',
        code: 'EUR',
        name: 'اليورو الأوروبي',
        symbol: '€',
        rate: 0.24,
        isDefault: false,
        isActive: true,
      },
      {
        id: '4',
        code: 'AED',
        name: 'الدرهم الإماراتي',
        symbol: 'د.إ',
        rate: 0.98,
        isDefault: false,
        isActive: true,
      },
    ];

    setCurrencies(mockCurrencies);
    const defaultCurr = mockCurrencies.find(c => c.isDefault);
    setDefaultCurrency(defaultCurr || null);
  }, []);

  // Convert price to default currency
  useEffect(() => {
    if (defaultCurrency && currencies.length > 0) {
      const originalCurr = currencies.find(c => c.code === originalCurrency);
      if (originalCurr) {
        // Convert from original currency to SAR (default), then to display currency
        const priceInSAR = price / originalCurr.rate;
        const finalPrice = priceInSAR * defaultCurrency.rate;
        setConvertedPrice(finalPrice);
      } else {
        // If original currency not found, assume it's already in default currency
        setConvertedPrice(price);
      }
    }
  }, [price, originalCurrency, defaultCurrency, currencies]);

  if (!defaultCurrency) {
    return <span className={className}>${price}</span>;
  }

  return (
    <span className={className}>
      {defaultCurrency.symbol}{convertedPrice.toFixed(2)}
    </span>
  );
};

export default CurrencyDisplay;
