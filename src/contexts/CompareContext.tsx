'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/firebase';

interface CompareContextType {
  items: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  getTotalItems: () => number;
  canAddMore: () => boolean;
  maxItems: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  // Load compare list from localStorage on mount
  useEffect(() => {
    const savedCompare = localStorage.getItem('compare');
    if (savedCompare) {
      try {
        setItems(JSON.parse(savedCompare));
      } catch (error) {
        console.error('Error loading compare list:', error);
      }
    }
  }, []);

  // Save compare list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(items));
  }, [items]);

  const addToCompare = (product: Product) => {
    setItems((prevItems) => {
      // Check if already in compare
      if (prevItems.some((item) => item.id === product.id)) {
        return prevItems;
      }
      // Check if max limit reached
      if (prevItems.length >= MAX_COMPARE_ITEMS) {
        alert(`يمكنك مقارنة ${MAX_COMPARE_ITEMS} منتجات كحد أقصى`);
        return prevItems;
      }
      return [...prevItems, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCompare = () => {
    setItems([]);
  };

  const isInCompare = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const getTotalItems = () => {
    if (!Array.isArray(items)) return 0;
    return items.length;
  };

  const canAddMore = () => {
    return items.length < MAX_COMPARE_ITEMS;
  };

  return (
    <CompareContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        getTotalItems,
        canAddMore,
        maxItems: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

