"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ─── Type Definitions ─── */

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string;
}

export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (id: string) => number;
  /** True once the persisted cart has been re-hydrated from localStorage. */
  isHydrated: boolean;
  /** Id of the line most recently touched — drives the badge pulse. */
  lastTouchedId: string | null;
}

const CART_STORAGE_KEY = "ddc.cart.v1";
const MAX_QUANTITY = 99;

const CartContext = createContext<CartContextValue | null>(null);

function isCartItemArray(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      typeof (entry as CartItem).id === "string" &&
      typeof (entry as CartItem).title === "string" &&
      typeof (entry as CartItem).price === "number" &&
      typeof (entry as CartItem).quantity === "number"
  );
}

/* ─── Provider Component ─── */

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastTouchedId, setLastTouchedId] = useState<string | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Hydrate from localStorage after mount so SSR markup never mismatches. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isCartItemArray(parsed)) {
          setItems(
            parsed
              .map((entry) => ({
                ...entry,
                quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.round(entry.quantity))),
                imageUrl: typeof entry.imageUrl === "string" ? entry.imageUrl : "",
                category: typeof entry.category === "string" ? entry.category : "",
              }))
              .filter((entry) => Number.isFinite(entry.price) && entry.price >= 0)
          );
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown hydration error";
      console.error(`[CART_HYDRATE] ${msg}`);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  /* Persist after hydration. */
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown persist error";
      console.error(`[CART_PERSIST] ${msg}`);
    }
  }, [items, isHydrated]);

  useEffect(
    () => () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    },
    []
  );

  const pulse = useCallback((id: string) => {
    setLastTouchedId(id);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setLastTouchedId(null), 700);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      if (!item || !item.id || typeof item.id !== "string" || item.id.trim().length === 0) {
        console.error("[CART] Cannot add item: invalid ID.");
        return;
      }
      if (typeof item.price !== "number" || isNaN(item.price) || item.price < 0) {
        console.error("[CART] Cannot add item: invalid price.");
        return;
      }

      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) }
              : i
          );
        }
        return [
          ...prev,
          {
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: 1,
            imageUrl: item.imageUrl || "",
            category: item.category || "",
          },
        ];
      });
      pulse(item.id);
    },
    [pulse]
  );

  const removeItem = useCallback((id: string) => {
    if (!id || typeof id !== "string") return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const incrementItem = useCallback(
    (id: string) => {
      if (!id || typeof id !== "string") return;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) } : i
        )
      );
      pulse(id);
    },
    [pulse]
  );

  const decrementItem = useCallback((id: string) => {
    if (!id || typeof id !== "string") return;
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;
      if (target.quantity <= 1) {
        return prev.filter((i) => i.id !== id);
      }
      return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
    });
  }, []);

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      if (!id || typeof id !== "string") return;
      const next = Math.max(0, Math.min(MAX_QUANTITY, Math.round(quantity || 0)));
      if (next === 0) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        return;
      }
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: next } : i)));
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (id: string): number => {
      if (!id || typeof id !== "string") return 0;
      const found = items.find((i) => i.id === id);
      return found ? found.quantity : 0;
    },
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        if (typeof i.price !== "number" || isNaN(i.price)) return sum;
        return sum + i.price * i.quantity;
      }, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      incrementItem,
      decrementItem,
      setQuantity,
      clearCart,
      getItemQuantity,
      isHydrated,
      lastTouchedId,
    }),
    [
      items,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      incrementItem,
      decrementItem,
      setQuantity,
      clearCart,
      getItemQuantity,
      isHydrated,
      lastTouchedId,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ─── Consumer Hook ─── */

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(
      "useCart must be used within a <CartProvider>. " +
        "Wrap your component tree with <CartProvider> at the root layout level."
    );
  }
  return context;
}
