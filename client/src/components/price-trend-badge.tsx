import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { PriceTrend } from "@shared/schema";

interface PriceTrendBadgeProps {
  productId: string;
  className?: string;
  variant?: "default" | "compact";
}

export function PriceTrendBadge({ productId, className = "", variant = "default" }: PriceTrendBadgeProps) {
  const { data: trend, isLoading } = useQuery<PriceTrend | null>({
    queryKey: ['/api/products', productId, 'price-trend'],
    staleTime: 1000 * 60 * 5, // Refetch every 5 minutes for price updates
  });

  if (isLoading) {
    return null;
  }

  // Show "Stable" indicator for products without price history
  if (!trend) {
    if (variant === "compact") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={`cursor-help font-mono text-xs px-2 py-0.5 border bg-neutral-500/20 text-neutral-400 border-neutral-500/30 ${className}`}
              data-testid={`badge-price-trend-stable-${productId}`}
            >
              <span className="mr-1">→</span>
              Stable
            </Badge>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="max-w-[280px] bg-[#1a1a1f] border border-neutral-700 p-3"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neutral-400" />
                <span className="font-medium text-neutral-200">Price unchanged</span>
              </div>
              <div className="text-sm text-neutral-400">
                No price adjustments in the past 30 days
              </div>
              <div className="text-xs text-[#21d8ff]/70 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#21d8ff]" />
                Radical pricing transparency
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center gap-1.5 cursor-help ${className}`}
            data-testid={`badge-price-trend-stable-${productId}`}
          >
            <Badge 
              className="font-mono text-sm px-2.5 py-1 border flex items-center gap-1.5 bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Stable</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-[320px] bg-[#1a1a1f] border border-neutral-700 p-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-400" />
              <span className="font-medium text-neutral-200">Price unchanged</span>
            </div>
            <div className="text-sm text-neutral-400">
              No price adjustments in the past 30 days
            </div>
            <div className="text-xs text-neutral-500 pt-1 border-t border-neutral-700">
              We maintain stable, transparent pricing
            </div>
            <div className="text-xs text-[#21d8ff]/70 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#21d8ff]" />
              Radical pricing transparency
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const isIncrease = trend.direction === "up";
  const isDecrease = trend.direction === "down";
  const percentDisplay = trend.percentChange.toFixed(1);
  
  const daysSinceChange = trend.lastChangeDate 
    ? Math.floor((Date.now() - new Date(trend.lastChangeDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const getTimeAgo = () => {
    if (!daysSinceChange) return "";
    if (daysSinceChange === 0) return "today";
    if (daysSinceChange === 1) return "yesterday";
    if (daysSinceChange < 7) return `${daysSinceChange} days ago`;
    if (daysSinceChange < 30) return `${Math.floor(daysSinceChange / 7)} weeks ago`;
    return `${Math.floor(daysSinceChange / 30)} months ago`;
  };

  const Icon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : Minus;
  
  const badgeColors = isDecrease 
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : isIncrease 
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";

  const arrowSymbol = isIncrease ? "↑" : isDecrease ? "↓" : "→";

  if (variant === "compact") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`cursor-help font-mono text-xs px-2 py-0.5 border ${badgeColors} ${className}`}
            data-testid={`badge-price-trend-${productId}`}
          >
            <span className="mr-1">{arrowSymbol}</span>
            {percentDisplay}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-[280px] bg-[#1a1a1f] border border-neutral-700 p-3"
        >
          <PriceTrendTooltipContent 
            trend={trend} 
            timeAgo={getTimeAgo()} 
            isDecrease={isDecrease} 
          />
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`inline-flex items-center gap-1.5 cursor-help ${className}`}
          data-testid={`badge-price-trend-${productId}`}
        >
          <Badge 
            className={`font-mono text-sm px-2.5 py-1 border flex items-center gap-1.5 ${badgeColors}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{arrowSymbol} {percentDisplay}%</span>
          </Badge>
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeAgo()}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-[320px] bg-[#1a1a1f] border border-neutral-700 p-4"
      >
        <PriceTrendTooltipContent 
          trend={trend} 
          timeAgo={getTimeAgo()} 
          isDecrease={isDecrease}
          showDetails 
        />
      </TooltipContent>
    </Tooltip>
  );
}

interface TooltipContentProps {
  trend: PriceTrend;
  timeAgo: string;
  isDecrease: boolean;
  showDetails?: boolean;
}

function PriceTrendTooltipContent({ trend, timeAgo, isDecrease, showDetails = false }: TooltipContentProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isDecrease ? "bg-emerald-400" : "bg-red-400"}`} />
        <span className="font-medium text-neutral-200">
          Price {isDecrease ? "decreased" : "increased"} {trend.percentChange.toFixed(1)}%
        </span>
      </div>
      
      <div className="text-sm text-neutral-400">
        <span className="font-medium text-neutral-300">Why: </span>
        {trend.reasonDescription || trend.reason}
      </div>
      
      {trend.notes && showDetails && (
        <div className="text-sm text-neutral-400 italic">
          "{trend.notes}"
        </div>
      )}
      
      <div className="text-xs text-neutral-500 pt-1 border-t border-neutral-700">
        Changed {timeAgo} • 30-day price lock in effect
      </div>
      
      <div className="text-xs text-[#21d8ff]/70 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#21d8ff]" />
        Radical pricing transparency
      </div>
    </div>
  );
}

export function PriceTrendIndicator({ productId, className = "" }: { productId: string; className?: string }) {
  return <PriceTrendBadge productId={productId} variant="compact" className={className} />;
}
