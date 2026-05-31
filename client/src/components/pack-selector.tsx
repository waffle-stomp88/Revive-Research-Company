import { Lock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { ReactNode } from "react";
import { PriceTrendBadge } from "@/components/price-trend-badge";
import { PACK_TIERS, getPackPerVialPrice } from "@/lib/pack-tiers";
import type { PackQty } from "@/lib/pack-tiers";
export type { PackQty } from "@/lib/pack-tiers";
export { getPackTotalPrice } from "@/lib/pack-tiers";

interface PackSelectorProps {
  basePrice: number;
  selectedQty: PackQty;
  onSelect: (qty: PackQty) => void;
  softGated?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
}

export function PackSelector({ basePrice, selectedQty, onSelect, softGated = false, disabled = false, badge }: PackSelectorProps) {
  return (
    <div data-testid="pack-selector">
      <div className="grid grid-cols-2 gap-3 mb-2 sm:block">
        <p className="font-medium text-muted-foreground uppercase tracking-widest text-[12px] self-center">Pack Size</p>
        {badge && <div className="flex justify-center items-center">{badge}</div>}
      </div>
      <div className="flex flex-col gap-1">
        {PACK_TIERS.map((tier) => {
          const isSelected = selectedQty === tier.qty;
          const perVialActual = getPackPerVialPrice(basePrice, tier.discount);
          const perVialRounded = Math.round(perVialActual);

          return (
            <button
              key={tier.qty}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(tier.qty as PackQty)}
              data-testid={`pack-option-${tier.qty}`}
              className="relative w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 text-left overflow-hidden"
              style={{
                background: isSelected && tier.popular
                  ? "radial-gradient(ellipse at 50% 120%, rgba(212,255,31,0.18) 0%, rgba(26,26,34,1) 70%)"
                  : isSelected
                    ? "#1a1a22"
                    : tier.popular
                      ? "rgba(200,255,0,0.04)"
                      : "#111118",
                border: isSelected && tier.popular
                  ? "1.5px solid #D4FF1F"
                  : isSelected
                    ? "1.5px solid #D4FF1F"
                    : tier.popular
                      ? "1.5px solid #2a3a1a"
                      : "1.5px solid #1e1e2a",
                boxShadow: isSelected && tier.popular
                  ? "0 0 0 1px rgba(212,255,31,0.25), 0 0 22px rgba(212,255,31,0.28), inset 0 1px 0 rgba(212,255,31,0.15)"
                  : isSelected
                    ? "0 0 14px rgba(212,255,31,0.12)"
                    : "none",
              }}
              aria-pressed={isSelected}
            >
              {/* Radio indicator */}
              <span
                className="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                style={{
                  borderColor: isSelected ? "#D4FF1F" : "#3a3a4a",
                  background: isSelected ? "#D4FF1F" : "transparent",
                }}
              >
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#000" }}
                  />
                )}
              </span>

              {/* Label + savings */}
              <span className="flex-1 flex flex-col gap-0.5">
                <span
                  className="font-semibold text-sm"
                  style={{ color: isSelected ? "#ffffff" : "#d1d5db" }}
                >
                  {tier.label}
                </span>
                {tier.discount > 0 && !softGated && (
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: isSelected ? "rgba(212,255,31,0.75)" : "rgba(212,255,31,0.45)" }}
                  >
                    save ${Math.round(basePrice * tier.discount)}/vial
                  </span>
                )}
              </span>

              {/* Popular badge — inline, left of price */}
              {tier.popular && (
                <span
                  className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm flex-shrink-0"
                  style={{ background: "#D4FF1F", color: "#000" }}
                  data-testid="badge-popular"
                >
                  POPULAR
                </span>
              )}

              {/* Price or lock */}
              {softGated ? (
                <Lock
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{ color: "#21d8ff80" }}
                  data-testid={`pack-lock-${tier.qty}`}
                />
              ) : (
                <span className="flex items-baseline gap-1 flex-shrink-0">
                  <span
                    className="font-bold text-base"
                    style={{ color: isSelected ? "#ffffff" : "#9ca3af" }}
                    data-testid={`pack-price-${tier.qty}`}
                  >
                    ${perVialRounded}
                  </span>
                  <span className="text-[10px] text-gray-500">/ vial</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface OrderSummaryProps {
  basePrice: number;
  selectedQty: PackQty;
  singleVialQty?: number;
  productName: string;
  dosage: string;
  stockAmount: number;
  softGated?: boolean;
  productId?: string;
}

export function OrderSummary({ basePrice, selectedQty, singleVialQty = 1, productName, dosage, stockAmount, softGated = false, productId }: OrderSummaryProps) {
  const tier = PACK_TIERS.find(t => t.qty === selectedQty)!;
  const perVialActual = getPackPerVialPrice(basePrice, tier.discount);
  const perVialRounded = Math.round(perVialActual);

  const effectiveQty = selectedQty === 1 ? singleVialQty : selectedQty;
  const totalRounded = perVialRounded * effectiveQty;

  const singlePerVialRounded = Math.round(basePrice);
  const perVialDiff = singlePerVialRounded - perVialRounded;
  const showSavings = selectedQty > 1 && perVialDiff > 0;

  return (
    <div
      className="rounded-md p-3"
      style={{ background: "#0e0e14", border: "1px solid #1e1e2a" }}
      data-testid="order-summary"
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-500" style={{ fontSize: "10px" }}>
          {effectiveQty} × {productName} {dosage}
        </span>
        {!softGated && (
          <span className="text-gray-500" style={{ fontSize: "10px" }}>
            ${perVialRounded} / vial
          </span>
        )}
      </div>
      <div className="my-2 border-t border-[#1e1e2a]" />
      <div className="flex items-baseline gap-2.5 flex-wrap">
        {softGated ? (
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#21d8ff80" }} />
            <Link href="/login" className="text-sm font-medium" style={{ color: "#21d8ff" }}>
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <span
              className="font-black tracking-tight"
              style={{ fontSize: "34px", color: "#D4FF1F", lineHeight: 1 }}
              data-testid="order-summary-total"
            >
              ${totalRounded}
            </span>
            {productId && <PriceTrendBadge productId={productId} variant="compact" />}
            {showSavings && (
              <span
                className="text-[11px] text-gray-500 font-normal"
                data-testid="order-summary-comparison"
              >
                vs ${singlePerVialRounded * effectiveQty} at single-vial pricing
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
