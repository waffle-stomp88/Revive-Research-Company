import { useEffect, useRef } from "react";
import { Truck } from "lucide-react";
import { Link } from "wouter";

const FREE_SHIPPING_THRESHOLD = 200;

export function FreeShippingBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const height = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--banner-height', `${height}px`);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 z-[60] bg-[#E7FB10] text-black py-2 px-2 sm:px-4 overflow-hidden"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0.5rem)',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }}
      data-testid="banner-free-shipping"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
        <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="truncate">
          <span className="font-bold text-red-500" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>FREE SHIPPING</span> on orders over ${FREE_SHIPPING_THRESHOLD}
          <span className="hidden sm:inline"> &bull; Same day shipping on orders placed before 12:00 PM CT</span>
        </span>
        <Link href="/peptides" className="ml-1 sm:ml-2 underline hover:no-underline font-semibold whitespace-nowrap flex-shrink-0">
          Shop Now
        </Link>
      </div>
    </div>
  );
}

export { FREE_SHIPPING_THRESHOLD };
