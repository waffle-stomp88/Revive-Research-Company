import { useState, useEffect } from "react";
import { X, Truck } from "lucide-react";
import { Link } from "wouter";

const FREE_SHIPPING_THRESHOLD = 175;

export function FreeShippingBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissed) {
      document.documentElement.style.setProperty('--banner-height', '36px');
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[60] bg-[#E7FB10] text-black py-2 px-4" 
      data-testid="banner-free-shipping"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <Truck className="h-4 w-4" />
        <span>
          <span className="font-bold text-red-500" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>FREE SHIPPING</span> on orders over ${FREE_SHIPPING_THRESHOLD}
          <span className="hidden sm:inline"> • Same day shipping on orders placed before 12:00 PM CT</span>
        </span>
        <Link href="/peptides" className="ml-2 underline hover:no-underline font-semibold">
          Shop Now
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded transition-colors"
        aria-label="Dismiss banner"
        data-testid="button-dismiss-banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export { FREE_SHIPPING_THRESHOLD };
