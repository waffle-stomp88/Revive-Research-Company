import { useState } from "react";
import { X, Truck } from "lucide-react";
import { Link } from "wouter";

const FREE_SHIPPING_THRESHOLD = 150;

export function FreeShippingBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 relative" data-testid="banner-free-shipping">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <Truck className="h-4 w-4" />
        <span>
          <span className="font-bold">FREE SHIPPING</span> on orders over ${FREE_SHIPPING_THRESHOLD}
          <span className="hidden sm:inline"> • Same day shipping on orders placed before 12:00 PM CT</span>
        </span>
        <Link href="/products" className="ml-2 underline hover:no-underline font-semibold">
          Shop Now
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-foreground/10 rounded transition-colors"
        aria-label="Dismiss banner"
        data-testid="button-dismiss-banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export { FREE_SHIPPING_THRESHOLD };
