import { createContext, useContext, ReactNode } from "react";
import { useCart } from "@/hooks/useCart";

// Cart context to share a single cart state (guest y autenticado) en toda la app
export type CartContextValue = ReturnType<typeof useCart>;

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext debe usarse dentro de CartProvider");
  }
  return context;
}
