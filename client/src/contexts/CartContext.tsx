import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  declineFreeItem: (productId: string) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "revive-research-cart";
export const BAC_PROMO_DECLINED_KEY = "revive-bac-promo-declined";
const SYNC_DEBOUNCE_MS = 500;

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

function mergeCartItems(local: CartItem[], server: CartItem[]): CartItem[] {
  const result = [...server];
  for (const localItem of local) {
    if (localItem.isFree) continue;
    const existingIndex = result.findIndex((s) => {
      if (s.isFree) return false;
      const sameSubscription =
        s.isSubscription === localItem.isSubscription &&
        s.subscriptionInterval === localItem.subscriptionInterval;
      const samePackSize = (s.packSize || undefined) === (localItem.packSize || undefined);
      if (localItem.bundleId) {
        return s.bundleId === localItem.bundleId && s.dosage === localItem.dosage;
      }
      return (
        s.productId === localItem.productId &&
        s.dosage === localItem.dosage &&
        sameSubscription &&
        samePackSize
      );
    });
    if (existingIndex >= 0) {
      result[existingIndex] = {
        ...result[existingIndex],
        quantity: result[existingIndex].quantity + localItem.quantity,
      };
    } else {
      result.push(localItem);
    }
  }
  return result;
}

interface FirstOrderStatusData {
  isFirstOrder: boolean;
  bacWaterProductId: string | null;
  bacWaterName: string | null;
  bacWaterImageUrl: string | null;
  bacWaterDosage: string | null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const isRestoringRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAuthUserRef = useRef<{ id: string } | null | undefined>(undefined);
  const authUserRef = useRef<{ id: string } | null | undefined>(undefined);

  // Persist to localStorage on every change (strip free items so they are never persisted)
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.filter((i) => !i.isFree)));
  }, [items]);

  // Watch auth state
  const { data: authUser } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 30_000,
  });

  // Keep ref in sync with current auth user for use in the debounced sync effect
  useEffect(() => {
    authUserRef.current = authUser;
  }, [authUser]);

  // Query first-order status to auto-inject the free BAC water promo
  const { data: firstOrderStatus } = useQuery<FirstOrderStatusData | null>({
    queryKey: ["/api/my-first-order-status"],
    queryFn: async () => {
      const res = await fetch("/api/my-first-order-status", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60_000,
    enabled: !!authUser,
  });

  // Handle auth state transitions
  useEffect(() => {
    const prev = prevAuthUserRef.current;
    prevAuthUserRef.current = authUser;

    // Still loading — wait
    if (authUser === undefined) return;

    // LOGGED OUT: clear the local cart so guest sessions start clean
    if (authUser === null) {
      if (prev !== undefined && prev !== null) {
        // Was logged in, now logged out — wipe local cart and clear promo decline flag
        setItems([]);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
        localStorage.removeItem(BAC_PROMO_DECLINED_KEY);
      }
      return;
    }

    // LOGGED IN (page load with session, or explicit login): restore from server
    if (prev === undefined || prev === null) {
      const isExplicitLogin = prev === null;

      const restore = async () => {
        isRestoringRef.current = true;
        try {
          const res = await fetch("/api/cart", { credentials: "include" });
          if (!res.ok) return;
          const data = await res.json();
          const serverItems: CartItem[] = Array.isArray(data.items) ? data.items : [];

          // Read current local items (already populated from localStorage on mount)
          const localRaw = localStorage.getItem(CART_STORAGE_KEY);
          const localItems: CartItem[] = localRaw ? JSON.parse(localRaw) : [];
          const nonFreeLocal = localItems.filter((i) => !i.isFree);

          const merged = mergeCartItems(nonFreeLocal, serverItems);
          setItems(merged);

          // Show toast only on explicit login when there were items to restore
          if (isExplicitLogin && serverItems.length > 0) {
            const restoredCount = serverItems.reduce((sum, i) => sum + i.quantity, 0);
            toast({
              title: "Cart restored",
              description: `${restoredCount} item${restoredCount !== 1 ? "s" : ""} saved from your last session.`,
              duration: 4000,
            });
          }
        } catch {
          // Best-effort — don't interrupt the user
        } finally {
          // Small delay so the sync effect doesn't echo the just-restored items immediately
          setTimeout(() => {
            isRestoringRef.current = false;
          }, 1200);
        }
      };

      restore();
    }
  }, [authUser, toast]);

  // Auto-inject free BAC water for first-time buyers
  useEffect(() => {
    if (!authUser || !firstOrderStatus?.isFirstOrder || !firstOrderStatus.bacWaterProductId) return;
    // Respect the user's explicit decline
    if (typeof window !== "undefined" && localStorage.getItem(BAC_PROMO_DECLINED_KEY)) return;
    setItems((prev) => {
      const alreadyFree = prev.some(
        (i) => i.isFree && i.productId === firstOrderStatus.bacWaterProductId
      );
      if (alreadyFree) return prev;
      return [
        ...prev,
        {
          productId: firstOrderStatus.bacWaterProductId!,
          name: firstOrderStatus.bacWaterName || "Bacteriostatic Water",
          price: 0,
          quantity: 1,
          dosage: firstOrderStatus.bacWaterDosage || "3ml",
          image: firstOrderStatus.bacWaterImageUrl || undefined,
          isFree: true,
        },
      ];
    });
  }, [authUser, firstOrderStatus]);

  // Debounced server sync — runs on every cart change while logged in
  // Free items are excluded from server persistence.
  useEffect(() => {
    const user = authUserRef.current;
    if (!user || isRestoringRef.current) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      if (!authUserRef.current || isRestoringRef.current) return;
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: items.filter((i) => !i.isFree) }),
      }).catch(() => {
        // Best-effort
      });
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [items]);

  const addToCart = useCallback(async (item: CartItem): Promise<boolean> => {
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
      const existingIndex = prev.findIndex((i) => {
        if (i.isFree) return false;
        const sameSubscriptionType =
          i.isSubscription === item.isSubscription &&
          i.subscriptionInterval === item.subscriptionInterval;
        const samePackSize = (i.packSize || undefined) === (item.packSize || undefined);
        return (
          i.productId === item.productId &&
          i.dosage === item.dosage &&
          sameSubscriptionType &&
          samePackSize
        );
      });

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
        if (i.isFree && i.productId === productId) return true;
        return !(
          i.productId === productId &&
          i.dosage === dosage &&
          (i.packSize || undefined) === (packSize || undefined)
        );
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
        if (i.isFree && i.productId === productId) return i;
        return i.productId === productId &&
          i.dosage === dosage &&
          (i.packSize || undefined) === (packSize || undefined)
          ? { ...i, quantity }
          : i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    // Also clear server cart if logged in
    if (authUserRef.current) {
      fetch("/api/cart", { method: "DELETE", credentials: "include" }).catch(() => {});
    }
  };

  const removeFreeItems = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.isFree));
  }, []);

  // Remove a specific free item and record the user's decline so it isn't re-injected.
  const declineFreeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => !(i.isFree && i.productId === productId)));
    if (typeof window !== "undefined") {
      localStorage.setItem(BAC_PROMO_DECLINED_KEY, "1");
    }
    // Fire-and-forget: let the server know the promo was declined
    fetch("/api/promo/bac-water-declined", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).catch(() => {});
  }, []);

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
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
        declineFreeItem,
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
