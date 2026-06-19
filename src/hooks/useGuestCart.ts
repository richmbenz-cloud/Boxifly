import { useState, useEffect } from "react";

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

const GUEST_CART_KEY = "boxifly_guest_cart";

export function useGuestCart() {
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem(GUEST_CART_KEY);
    if (savedCart) {
      try {
        setGuestCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading guest cart:", e);
      }
    }
  }, []);

  const saveCart = (cart: GuestCartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    setGuestCart(cart);
  };

  const addToGuestCart = (productId: string, quantity: number) => {
    const existingIndex = guestCart.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      const newCart = [...guestCart];
      newCart[existingIndex].quantity += quantity;
      saveCart(newCart);
    } else {
      saveCart([...guestCart, { productId, quantity }]);
    }
  };

  const updateGuestCartQuantity = (productId: string, quantity: number) => {
    const newCart = guestCart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const removeFromGuestCart = (productId: string) => {
    saveCart(guestCart.filter(item => item.productId !== productId));
  };

  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    setGuestCart([]);
  };

  const getGuestCartCount = () => {
    return guestCart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    guestCart,
    addToGuestCart,
    updateGuestCartQuantity,
    removeFromGuestCart,
    clearGuestCart,
    getGuestCartCount,
  };
}
