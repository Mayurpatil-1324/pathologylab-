'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CouponInfo } from './types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  itemCount: number;
  subtotal: number;
  mrpTotal: number;
  savingsTotal: number;
  coupon: CouponInfo | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  collectionFee: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hp_cart_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCoupon = localStorage.getItem('hp_cart_coupon');
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hp_cart_items', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (coupon) {
        localStorage.setItem('hp_cart_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('hp_cart_coupon');
      }
    }
  }, [coupon, isLoaded]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === newItem.id)) {
        return prev;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const isInCart = (id: string) => {
    return items.some((i) => i.id === id);
  };

  const mrpTotal = items.reduce((acc, item) => acc + (item.mrpPrice || item.price), 0);
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const savingsTotal = mrpTotal - subtotal + (coupon ? coupon.discountAmount : 0);

  // Free home collection for orders >= ₹499
  const collectionFee = subtotal >= 499 || items.length === 0 ? 0 : 99;

  let calculatedDiscount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      calculatedDiscount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.discountAmount && coupon.discountAmount > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, coupon.discountAmount);
      }
    } else {
      calculatedDiscount = coupon.discountValue;
    }
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);
  }

  const finalTotal = Math.max(0, subtotal - calculatedDiscount + collectionFee);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderValue: subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
      setCoupon(data.coupon);
      return { success: true, message: `Coupon ${data.coupon.code} applied successfully!` };
    } catch {
      return { success: false, message: 'Failed to validate coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        itemCount: items.length,
        subtotal,
        mrpTotal,
        savingsTotal,
        coupon,
        applyCoupon,
        removeCoupon,
        collectionFee,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
