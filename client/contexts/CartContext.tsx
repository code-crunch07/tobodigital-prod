'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  /** Unique line id inside cart */
  lineId: string;
  /** Product ID */
  _id: string;
  itemName: string;
  mainImage: string;
  yourPrice: number;
  quantity: number;
  freeShipping?: boolean;
  /** Variant info (optional) */
  variantId?: string;
  variantAttributes?: Record<string, string>;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'lineId'>) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed: any[] = JSON.parse(savedCart);
        const normalized: CartItem[] = parsed.map((item) => {
          const variantId = item.variantId;
          const baseLineId =
            item.lineId ||
            `${item._id}${variantId ? `:${variantId}` : ':base'}`;
          return {
            lineId: baseLineId,
            ...item,
          } as CartItem;
        });
        setCartItems(normalized);
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    // Dispatch custom event to notify Header component
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity' | 'lineId'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i._id === item._id && i.variantId === item.variantId,
      );
      const baseLineId =
        `${item._id}${item.variantId ? `:${item.variantId}` : ':base'}`;
      if (existingItem) {
        return prevItems.map((i) =>
          i.lineId === existingItem.lineId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      } else {
        return [...prevItems, { ...item, lineId: baseLineId, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.lineId === lineId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (lineId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.lineId !== lineId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
