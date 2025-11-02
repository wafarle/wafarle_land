'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/firebase';

interface CartItem {
  product: Product;
  quantity: number;
  selectedOptionId?: string;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: {
    selectedOptionId?: string;
    selectedColor?: string;
    selectedSize?: string;
  }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    options?: {
      selectedOptionId?: string;
      selectedColor?: string;
      selectedSize?: string;
    }
  ) => {
    setItems((prevItems) => {
      // Check if item already exists
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedOptionId === options?.selectedOptionId &&
          item.selectedColor === options?.selectedColor &&
          item.selectedSize === options?.selectedSize
      );

      if (existingIndex > -1) {
        // Update quantity
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            product,
            quantity,
            selectedOptionId: options?.selectedOptionId,
            selectedColor: options?.selectedColor,
            selectedSize: options?.selectedSize,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = item.selectedOptionId
        ? item.product.priceOptions?.find((opt) => opt.name === item.selectedOptionId)?.price || item.product.price
        : item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const isInCart = (productId: string) => {
    return items.some((item) => item.product.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

