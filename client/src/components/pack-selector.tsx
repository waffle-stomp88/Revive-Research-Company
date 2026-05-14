import { Lock, CheckCircle } from "lucide-react";

export const PACK_TIERS = [
  { qty: 1, label: "1 vial", discount: 0, popular: false },
  { qty: 3, label: "3-pack", discount: 0.10, popular: false },
  { qty: 5, label: "5-pack", discount: 0.15, popular: true },
  { qty: 10, label: "10-pack", discount: 0.20, popular: false },
] as const;

export type PackQty = 1 | 3 | 5 | 10;

export function getPackPerVialPrice(basePrice: number, discount: number): number {
  return basePrice * (1 - discount);
}

export function getPackTotalPrice(basePrice: number, qty: PackQty): number {
  const tier = PACK_TIERS.find(t => t.qty === qty)!;
  return getPackPerVialPrice(basePrice, tier.discount) * qty;
}

interface PackSelectorProps {
  basePrice: number;
  selectedQty: PackQty;
  onSelect: (qty: PackQty) => void;
  softGated?: boolean;
  disabled?: boolean;
}

export function PackSelector({ basePrice, selectedQty, onSelect, softGated = false, disabled = false }: PackSelectorProps) {
  return (
    <div className="space-y-2" data-testid="pack-selector">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Pack Size</p>
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
            className="relative w-full flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 text-left"
            style={{
              background: isSelected ? "rgba(231,251,16,0.05)" : "#111118",
              border: isSelected ? "1.5px solid #E7FB10" : "1.5px solid #1e1e2a",
              boxShadow: isSelected ? "0 0 12px rgba(231,251,16,0.15)" : "none",
            }}
            aria-pressed={isSelected}
          >
            {tier.popular && (
              <span
                className="absolute -top-2.5 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: "#E7FB10", color: "#000" }}
                data-testid="badge-popular"
              >
                POPULAR
              </span>
            )}

            <span
              className="font-semibold text-sm"
              style={{ color: isSelected ? "#E7FB10" : "#d1d5db" }}
            >
              {tier.label}
            </span>

            {softGated ? (
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" style={{ color: "#E7FB1055" }} />
                <span className="text-xs text-gray-600">Sign in</span>
              </span>
            ) : (
              <span className="flex items-baseline gap-1">
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
  );
}

interface OrderSummaryProps {
  basePrice: number;
  selectedQty: PackQty;
  productName: string;
  dosage: string;
  stockAmount: number;
  softGated?: boolean;
}

export function OrderSummary({ basePrice, selectedQty, productName, dosage, stockAmount, softGated = false }: OrderSummaryProps) {
  const tier = PACK_TIERS.find(t => t.qty === selectedQty)!;
  const perVialActual = getPackPerVialPrice(basePrice, tier.discount);
  const perVialRounded = Math.round(perVialActual);
  const totalRounded = Math.round(perVialActual * selectedQty);

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
          {selectedQty} × {productName} {dosage}
        </span>
        {!softGated && (
          <span className="text-gray-500" style={{ fontSize: "10px" }}>
            ${perVialRounded} / vial
          </span>
        )}
      </div>

      <div className="my-2 border-t border-[#1e1e2a]" />

      <div className="flex items-center justify-between">
        {softGated ? (
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" style={{ color: "#E7FB1055" }} />
            <span className="text-sm text-gray-600">Sign in to see total</span>
          </div>
        ) : (
          <span
            className="font-bold text-white"
            style={{ fontSize: "22px" }}
            data-testid="order-summary-total"
          >
            ${totalRounded}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          <span className="text-xs text-green-500">{stockAmount > 0 ? `${stockAmount} in stock` : "In stock"}</span>
        </div>
      </div>

      {showSavings && !softGated && (
        <p
          className="text-right mt-1 text-gray-500"
          style={{ fontSize: "9px" }}
          data-testid="order-summary-savings"
        >
          ${perVialDiff} less per vial than single
        </p>
      )}
    </div>
  );
}
