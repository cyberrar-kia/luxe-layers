"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartLine {
  productId: string;
  name: string;
  unitPriceKobo: number;
  image: string | null;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  totalKobo: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "luxe-layers-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore — a corrupted or blocked localStorage just starts empty
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (line, quantity) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === line.productId);
        if (existing) {
          return prev.map((l) => (l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l));
        }
        return [...prev, { ...line, quantity }];
      });
    };
    const setQuantity: CartContextValue["setQuantity"] = (productId, quantity) => {
      setLines((prev) =>
        quantity <= 0 ? prev.filter((l) => l.productId !== productId) : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
      );
    };
    const remove: CartContextValue["remove"] = (productId) => setLines((prev) => prev.filter((l) => l.productId !== productId));
    const clear = () => setLines([]);
    const totalKobo = lines.reduce((sum, l) => sum + l.unitPriceKobo * l.quantity, 0);
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    return { lines, add, setQuantity, remove, clear, totalKobo, count };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
