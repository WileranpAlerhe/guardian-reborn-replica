import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Product } from "@/data/seed";

export interface CartItem {
  id: string;
  slug?: string;
  name: string;
  image: string;
  price: number;
  oldPrice: number;
  quantity: number;
  variant?: string;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  savings: number;
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CartContext = createContext<CartCtx | null>(null);
const KEY = "pratihome.cart.v1";

const keyOf = (id: string, variant?: string) => `${id}::${variant ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* noop */
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: string) => {
    setItems((prev) => {
      const k = keyOf(product.id, variant);
      const existing = prev.find((i) => keyOf(i.id, i.variant) === k);
      if (existing) {
        return prev.map((i) =>
          keyOf(i.id, i.variant) === k ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: product.price,
          oldPrice: product.oldPrice,
          quantity,
          variant,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string, variant?: string) => {
    setItems((prev) => prev.filter((i) => keyOf(i.id, i.variant) !== keyOf(id, variant)));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, variant?: string) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => keyOf(i.id, i.variant) !== keyOf(id, variant));
      return prev.map((i) =>
        keyOf(i.id, i.variant) === keyOf(id, variant) ? { ...i, quantity } : i,
      );
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = items.reduce((s, i) => s + Math.max(0, (i.oldPrice - i.price) * i.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        savings,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
