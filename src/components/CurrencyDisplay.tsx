'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { getCurrencyByCode } from '@/lib/currency';

interface CurrencyDisplayProps {
  price: number;
  originalCurrency?: string;
  className?: string;
  showOriginalPrice?: boolean;
}

const CurrencyDisplay = ({ 
  price, 
  originalCurrency = 'USD', 
  className = '',
  showOriginalPrice 
}: CurrencyDisplayProps) => {
  const { formatPrice, convertPrice, settings } = useCurrency();
  
  // Get the original currency object
  const fromCurrency = getCurrencyByCode(originalCurrency);
  
  // Convert price to current currency if needed
  const convertedPrice = convertPrice(price, fromCurrency, settings.currentCurrency);
  
  // Format the converted price
  const formattedPrice = formatPrice(convertedPrice, settings.currentCurrency);
  
  // Show original price if enabled and currencies are different
  const shouldShowOriginal = (showOriginalPrice ?? settings.showOriginalPrice) && 
                            originalCurrency !== settings.currentCurrency.code;

  return (
    <span className={className}>
      {formattedPrice}
      {shouldShowOriginal && (
        <span className="text-xs text-gray-500 ml-1">
          ({formatPrice(price, fromCurrency)})
        </span>
      )}
    </span>
  );
};

export default CurrencyDisplay;

