import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<boolean>;
  removeFromCart: (productId: string, dosage: string) => void;
  removeBundleFromCart: (bundleId: string) => void;
  updateQuantity: (productId: string, dosage: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "revive-research-cart";

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
          const sameSubscriptionType = i.isSubscription === item.isSubscription && 
            i.subscriptionInterval === item.subscriptionInterval;
          return i.productId === item.productId && i.dosage === item.dosage && sameSubscriptionType;
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

  const removeFromCart = (productId: string, dosage: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.dosage === dosage))
    );
  };

  const removeBundleFromCart = (bundleId: string) => {
    setItems((prev) => prev.filter((i) => i.bundleId !== bundleId));
  };

  const updateQuantity = (productId: string, dosage: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, dosage);
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.dosage === dosage
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
