import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  productId: string;
  bundleId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  /** Undiscounted per-vial base price — stored so pack discounts can be
   *  recalculated correctly when the user changes quantity in the cart. */
  basePrice?: number;
  quantity: number;
  dosage: string;
  image?: string;
  isBundle?: boolean;
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

// Maximum quantity allowed for a single cart line to prevent silent runaway accumulation.
const MAX_CART_QTY = 20;

/**
 * Merge a local (localStorage) cart with the authoritative server cart.
 *
 * Three scenarios:
 *   (a) Item only in server  → keep as-is (server is source of truth).
 *   (b) Item only in local   → push it (guest-session addition not yet on server).
 *   (c) Item in both         → use Math.max(serverQty, localQty).
 *       Using max (not sum) prevents exponential doubling: after the first restore
 *       the local cart is a mirror of the server, so adding them would double on
 *       every subsequent page load. Max still honours a guest who added more than
 *       the server has (e.g. guest +3, server 1 → max = 3).
 *
 * All quantities are clamped to MAX_CART_QTY as a safety ceiling.
 */
function mergeCartItems(local: CartItem[], server: CartItem[]): CartItem[] {
  const result = [...server];
  for (const localItem of local) {
    if (localItem.isFree) continue;
    const existingIndex = result.findIndex((s) => {
      if (s.isFree) return false;
      const samePackSize = (s.packSize || undefined) === (localItem.packSize || undefined);
      if (localItem.bundleId) {
        return s.bundleId === localItem.bundleId && s.dosage === localItem.dosage;
      }
      return (
        s.productId === localItem.productId &&
        s.dosage === localItem.dosage &&
        samePackSize
      );
    });
    if (existingIndex >= 0) {
      // (c) Item in both — take the higher of the two, but never add them together.
      const merged = Math.max(result[existingIndex].quantity, localItem.quantity);
      const clamped = Math.min(merged, MAX_CART_QTY);
      if (merged > MAX_CART_QTY) {
        console.warn(`[cart] quantity clamped for ${localItem.productId}: ${merged} → ${clamped}`);
      }
      result[existingIndex] = { ...result[existingIndex], quantity: clamped };
    } else {
      // (b) Item only in local — add it (guest-session addition).
      const clamped = Math.min(localItem.quantity, MAX_CART_QTY);
      if (localItem.quantity > MAX_CART_QTY) {
        console.warn(`[cart] quantity clamped for ${localItem.productId}: ${localItem.quantity} → ${clamped}`);
      }
      result.push({ ...localItem, quantity: clamped });
    }
  }
  // (a) Items only in server were already in `result` from the spread — apply ceiling too.
  return result.map((item) => {
    if (item.isFree) return item;
    const clamped = Math.min(item.quantity, MAX_CART_QTY);
    if (item.quantity > MAX_CART_QTY) {
      console.warn(`[cart] quantity clamped for ${item.productId}: ${item.quantity} → ${clamped}`);
    }
    return { ...item, quantity: clamped };
  });
}

interface FirstOrderStatusData {
  isFirstOrder: boolean;
  bacWaterProductId: string | null;
  bacWaterName: string | null;
  bacWaterImageUrl: string | null;
  bacWaterDosage: string | null;
  bacWaterPrice: number | null;
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

  // Auto-inject free BAC water for first-time buyers.
  // Depends on `items` so it re-evaluates whenever the cart changes — this
  // ensures the injection fires after the server cart restore populates paid
  // items, even when firstOrderStatus resolved earlier while the cart was empty.
  // The hasPaid guard inside the functional update means we never inject into
  // an empty cart (avoiding the "BAC water alone" scenario), and the
  // alreadyFree guard means we never double-inject.
  useEffect(() => {
    if (!authUser || !firstOrderStatus?.isFirstOrder || !firstOrderStatus.bacWaterProductId) return;
    if (typeof window !== "undefined" && localStorage.getItem(BAC_PROMO_DECLINED_KEY)) return;
    setItems((prev) => {
      // Never inject if no paid items exist yet
      const hasPaid = prev.some((i) => !i.isFree);
      if (!hasPaid) return prev;
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
          originalPrice: firstOrderStatus.bacWaterPrice || undefined,
          quantity: 1,
          dosage: firstOrderStatus.bacWaterDosage || "3ml",
          image: firstOrderStatus.bacWaterImageUrl || undefined,
          isFree: true,
        },
      ];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, firstOrderStatus, items]);

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
        const samePackSize = (i.packSize || undefined) === (item.packSize || undefined);
        return (
          i.productId === item.productId &&
          i.dosage === item.dosage &&
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
    setItems((prev) => {
      const next = prev.filter((i) => {
        if (i.isFree && i.productId === productId) return true;
        return !(
          i.productId === productId &&
          i.dosage === dosage &&
          (i.packSize || undefined) === (packSize || undefined)
        );
      });
      // If no paid items remain after removal, also evict free items.
      // This is done inside the functional update (not a separate useEffect)
      // so it is atomic and never races with the BAC water injection on mount.
      const hasPaid = next.some((i) => !i.isFree);
      return hasPaid ? next : next.filter((i) => !i.isFree);
    });
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
        if (
          i.productId === productId &&
          i.dosage === dosage &&
          (i.packSize || undefined) === (packSize || undefined)
        ) {
          // Recalculate per-vial price when the quantity crosses a pack tier
          // boundary. Only possible when basePrice was stored at add-to-cart time.
          if (i.basePrice && i.basePrice > 0 && !i.isBundle) {
            const discount =
              quantity >= 10 ? 0.20
              : quantity >= 5 ? 0.15
              : quantity >= 3 ? 0.10
              : 0;
            const newPrice = Math.round(i.basePrice * (1 - discount));
            return { ...i, quantity, price: newPrice };
          }
          return { ...i, quantity };
        }
        return i;
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
