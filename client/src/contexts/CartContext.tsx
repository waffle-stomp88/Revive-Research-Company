import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface CartItem {
  productId: string;
  bundleId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  dosage: string;
  image?: string;
  isBundle?: boolean;
  isSubscription?: boolean;
  subscriptionInterval?: "weekly" | "biweekly" | "monthly";
  packSize?: number;
  isFree?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<boolean>;
  removeFromCart: (productId: string, dosage: string, packSize?: number) => void;
  removeBundleFromCart: (bundleId: string) => void;
  updateQuantity: (productId: string, dosage: string, quantity: number, packSize?: number) => void;
  clearCart: () => void;
  removeFreeItems: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "revive-research-cart";

export function stripFreeItemsFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return;
    const items: CartItem[] = JSON.parse(saved);
    const filtered = items.filter((i) => !i.isFree);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore parse errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback(async (item: CartItem): Promise<boolean> => {
    // Free items skip stock validation and are stored as singletons (no qty merging)
    if (item.isFree) {
      setItems((prev) => {
        const alreadyFree = prev.some((i) => i.isFree && i.productId === item.productId);
        if (alreadyFree) return prev;
        return [...prev, item];
      });
      return true;
    }

    if (item.isBundle || item.bundleId) {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.bundleId === item.bundleId && i.dosage === item.dosage
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].quantity += item.quantity;
          return updated;
        }
        return [...prev, item];
      });
      return true;
    }

    try {
      const res = await fetch("/api/stock/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            productId: item.productId,
            dosage: item.dosage,
            quantity: item.quantity,
          }],
        }),
      });
      const data = await res.json();
      if (!data.valid) {
        return false;
      }
    } catch {
      // If validation fails due to network, allow the add (checkout will re-validate)
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => {
          // Never merge a paid add into a free item — free items are immutable singletons
          if (i.isFree) return false;
          const sameSubscriptionType = i.isSubscription === item.isSubscription && 
            i.subscriptionInterval === item.subscriptionInterval;
          const samePackSize = (i.packSize || undefined) === (item.packSize || undefined);
          return i.productId === item.productId && i.dosage === item.dosage && sameSubscriptionType && samePackSize;
        }
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }

      return [...prev, item];
    });
    return true;
  }, []);

  const removeFromCart = (productId: string, dosage: string, packSize?: number) => {
    setItems((prev) =>
      prev.filter((i) => {
        // Protect free items from the normal remove path
        if (i.isFree && i.productId === productId) return true;
        return !(i.productId === productId && i.dosage === dosage && (i.packSize || undefined) === (packSize || undefined));
      })
    );
  };

  const removeBundleFromCart = (bundleId: string) => {
    setItems((prev) => prev.filter((i) => i.bundleId !== bundleId));
  };

  const updateQuantity = (productId: string, dosage: string, quantity: number, packSize?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, dosage, packSize);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        // Free items are always quantity 1 and cannot be adjusted
        if (i.isFree && i.productId === productId) return i;
        return i.productId === productId && i.dosage === dosage && (i.packSize || undefined) === (packSize || undefined)
          ? { ...i, quantity }
          : i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const removeFreeItems = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.isFree));
  }, []);

  // Watch auth state globally — strip free items whenever the session resolves to null
  // (covers explicit logout, session expiry, and any other sign-out path)
  const { data: authUser } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (authUser === null) {
      removeFreeItems();
    }
  }, [authUser, removeFreeItems]);

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
    // Free items are excluded from the subtotal and free-shipping threshold
    return items
      .filter((item) => !item.isFree)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        removeBundleFromCart,
        updateQuantity,
        clearCart,
        removeFreeItems,
        getItemCount,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
