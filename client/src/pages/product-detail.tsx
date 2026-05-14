import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageLoader } from "@/components/image-loader";
import { addToRecentlyViewed, RecentlyViewed } from "@/components/recently-viewed";
import { renderChemicalFormula } from "@/lib/chemistry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { captureEmail } from "@/lib/waitlist-utils";
import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  Shield,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
  ShoppingBag,
  FileCheck,
  Truck,
  RefreshCw,
  Repeat,
  Percent,
  AlertTriangle,
  TrendingUp,
  Star,
  User,
  Thermometer,
  Snowflake,
  Eye,
  Clock,
  Beaker,
  ExternalLink,
  Calendar,
  GraduationCap,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Bell,
  Mail,
  Loader2,
  Heart,
  ArrowUp,
  Check,
  Sparkles,
  Lock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getVisitorId } from "@/lib/utils";
import { ModelViewer3D } from "@/components/model-viewer-3d";
import { PriceTrendBadge } from "@/components/price-trend-badge";
import type { Product, ProductStorageProfile, Batch, Coa, EducationArticle, ProductDosageStock } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { SEOHead } from "@/components/seo-head";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PharmacokineticsChart } from "@/components/pharmacokinetics-chart";
import { getHalfLifeByName, COMBO_STACK_CONSTITUENTS, resolveComboSlugKey } from "@/data/pharmacokinetics";
import { getSynergyPartners, normalizePeptideName } from "@/lib/synergy-data";
import { getTopPairingForProduct } from "@/lib/pairing-intelligence";
import { Layers, Zap, Atom, Dna } from "lucide-react";
import { flagRetiredContent, RETIRED_PRODUCT_SLUGS } from "@/lib/retired-redirects";
import { SoftGateBanner } from "@/components/soft-gate-banner";
import { AuthGate } from "@/components/auth-gate";
import { BlurredGate } from "@/components/blurred-gate";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getCompoundProfile } from "@/data/compound-profiles";
import { getStripeConfig } from "@/data/category-stripe-config";
import { PEPTIDE_PATHWAYS } from "@/data/peptide-pathways";
import { BODY_SYSTEM_HUBS } from "@/data/body-system-hubs";
import { resolvePrimarySystem } from "@/lib/peptide-systems";


// Badge priority system - max 2 badges per product
// Priority: Out of Stock > Low Stock > Selling Fast > Featured
type BadgeType = "out-of-stock" | "low-stock" | "selling-fast" | "featured";

interface ProductBadge {
  type: BadgeType;
  label: string;
  className: string;
  icon?: typeof TrendingUp;
}

const LOW_STOCK_THRESHOLD = 10;



function getProductBadges(
  product: Product, 
  sellingFastIds: string[]
): ProductBadge[] {
  const badges: ProductBadge[] = [];
  
  // Priority 1: Out of Stock (highest priority)
  if (product.inStock === false || (product.stockAmount !== null && product.stockAmount <= 0)) {
    badges.push({
      type: "out-of-stock",
      label: "Out of Stock",
      className: "bg-destructive text-destructive-foreground"
    });
  }
  
  // Priority 2: Low Stock
  if (product.inStock && product.stockAmount !== null && product.stockAmount > 0 && product.stockAmount <= LOW_STOCK_THRESHOLD) {
    badges.push({
      type: "low-stock",
      label: `Only ${product.stockAmount} left`,
      className: "bg-orange-500 text-white",
      icon: AlertTriangle
    });
  }
  
  // Priority 3: Selling Fast
  if (sellingFastIds.includes(product.id) && product.inStock) {
    badges.push({
      type: "selling-fast",
      label: "Selling Fast",
      className: "bg-[#E7FB10] text-black font-semibold",
      icon: TrendingUp
    });
  }
  
  // Priority 5: Featured (lowest priority)
  if (product.featured) {
    badges.push({
      type: "featured",
      label: "Featured",
      className: "bg-[#21d8ff] text-black"
    });
  }
  
  // Return max 2 badges based on priority order
  return badges.slice(0, 2);
}

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];

const dosageMultipliers: Record<string, number> = {
  "10mg": 1.0,
  "15mg": 1.25,
  "20mg": 1.50,
};

const SOFT_GATE_ENABLED = import.meta.env.VITE_SOFT_GATE_ENABLED !== "false";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isAuthenticated, login } = useAuth();
  const softGateEnabled = SOFT_GATE_ENABLED;
  const [quantity, setQuantity] = useState(1);
  // Capture the dosage query param once at mount so URL mutations (e.g. UUID→slug
  // replaceState) cannot invalidate it on a subsequent render.
  const urlDosageParamRef = useRef(new URLSearchParams(window.location.search).get("dosage") || "");
  const urlDosageParam = urlDosageParamRef.current;
  const [selectedDosage, setSelectedDosage] = useState<string>(urlDosageParam || "10mg");
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const twoColumnRef = useRef<HTMLDivElement>(null);
  const [showStickyPurchase, setShowStickyPurchase] = useState(false);
  const [quickAddSuccess, setQuickAddSuccess] = useState<Record<string, boolean>>({});
  const [activeResearchTab, setActiveResearchTab] = useState<"overview" | "pk" | "cert" | "partners">("overview");

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
    refetchInterval: 30000,
  });

  const productId = product?.id;

  // Compute parent body system for breadcrumbs + footer module (Task 1.3)
  // Computed before conditional returns so the useEffect below can run unconditionally.
  const peptidePathwayData = product ? PEPTIDE_PATHWAYS[product.slug ?? ""] : undefined;
  const systemId = peptidePathwayData ? resolvePrimarySystem(peptidePathwayData.systems) : null;
  const systemHub = systemId ? BODY_SYSTEM_HUBS.find(h => h.slug === systemId) ?? null : null;
  const systemPeptideCount = systemId
    ? Object.values(PEPTIDE_PATHWAYS).filter(p => resolvePrimarySystem(p.systems) === systemId).length
    : 0;

  // Inject BreadcrumbList JSON-LD into <head> when system resolves (SEO)
  useEffect(() => {
    if (!systemHub || !product) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-json-ld";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Education Center",
          "item": "https://reviveresearch.co/guides/peptide-education-center"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": systemHub.name,
          "item": `https://reviveresearch.co/systems/${systemHub.slug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": product.name,
          "item": `https://reviveresearch.co/peptides/${product.slug || product.id}`
        }
      ]
    });
    // Remove any stale script first
    document.getElementById("breadcrumb-json-ld")?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById("breadcrumb-json-ld")?.remove();
    };
  }, [systemHub, product]);

  // Query for selling fast products
  const { data: sellingFastIds = [] } = useQuery<string[]>({
    queryKey: ["/api/products/selling-fast"],
  });

  // Query for storage profile
  const { data: storageProfile } = useQuery<ProductStorageProfile>({
    queryKey: ["/api/products", productId, "storage"],
    enabled: !!productId,
  });

  // Query for recent batches with COAs
  const { data: batchesWithCoas = [] } = useQuery<(Batch & { coas?: Coa[] })[]>({
    queryKey: ["/api/products", productId, "batches"],
    enabled: !!productId,
  });

  // Query COAs directly by product ID (always shows even without batch records)
  const { data: productCoas = [] } = useQuery<Coa[]>({
    queryKey: ["/api/products", productId, "coas"],
    enabled: !!productId,
  });

  // Query for related education articles
  const { data: relatedArticles = [] } = useQuery<EducationArticle[]>({
    queryKey: ["/api/products", productId, "education"],
    enabled: !!productId,
  });

  // Query for dosage-specific stock information
  const { data: dosageStocks = [], isPending: isDosageStocksLoading } = useQuery<ProductDosageStock[]>({
    queryKey: ["/api/products", productId, "dosage-stocks"],
    enabled: !!productId,
    refetchInterval: 30000,
  });

  // Query for all products (for synergy recommendations)
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: voteCounts = [] } = useQuery<Array<{ productId: string; count: number }>>({
    queryKey: ["/api/products/votes"],
  });

  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("revive_voted_products");
      return stored ? (JSON.parse(stored) as string[]).includes(productId || "") : false;
    } catch { return false; }
  });

  const voteCount = voteCounts.find(v => v.productId === productId)?.count || 0;

  const voteMutation = useMutation({
    mutationFn: async (action: "vote" | "unvote") => {
      const visitorId = getVisitorId();
      if (action === "vote") {
        await apiRequest("POST", `/api/products/${productId}/vote`, { visitorId });
      } else {
        await apiRequest("DELETE", `/api/products/${productId}/vote`, { visitorId });
      }
      return action;
    },
    onSuccess: (action) => {
      setHasVoted(action === "vote");
      try {
        const stored = localStorage.getItem("revive_voted_products");
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (action === "vote" && productId && !list.includes(productId)) list.push(productId);
        else if (action === "unvote" && productId) {
          const idx = list.indexOf(productId);
          if (idx >= 0) list.splice(idx, 1);
        }
        localStorage.setItem("revive_voted_products", JSON.stringify(list));
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["/api/products/votes"] });
      if (action === "vote") {
        toast({
          title: "Thanks — we've noted your interest!",
          description: "We prioritize restocking based on community demand.",
        });
      }
    },
  });

  // Mutation for stock notification signup
  const stockNotifyMutation = useMutation({
    mutationFn: async (data: { productId: string; email: string }) => {
      const response = await apiRequest("POST", "/api/stock-notifications", data);
      return response.json() as Promise<{ message: string; alreadyExists?: boolean }>;
    },
    onSuccess: (response) => {
      setNotifySuccess(true);
      setNotifyEmail("");
      toast({
        title: response.alreadyExists ? "Already Subscribed" : "Success!",
        description: response.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !notifyEmail.trim()) return;
    stockNotifyMutation.mutate({ productId: product.id, email: notifyEmail.trim() });
    captureEmail(notifyEmail.trim(), "oos", product.id);
  };

  // Wishlist functionality
  const { data: wishlistStatus } = useQuery<{ isInWishlist: boolean }>({
    queryKey: ["/api/wishlist/check", productId],
    enabled: !!productId && isAuthenticated,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (pid: string) => {
      await apiRequest("POST", "/api/wishlist", { productId: pid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", productId] });
      toast({ title: "Added to Wishlist", description: "Product saved to your wishlist" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add to wishlist. Please try again.", variant: "destructive" });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (pid: string) => {
      await apiRequest("DELETE", `/api/wishlist/${pid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", productId] });
      toast({ title: "Removed from Wishlist", description: "Product removed from your wishlist" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove from wishlist. Please try again.", variant: "destructive" });
    },
  });

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({ 
        title: "Login Required", 
        description: "Please sign in to save items to your wishlist. Click the heart again after logging in.",
      });
      login();
      return;
    }
    if (!productId) return;
    
    if (wishlistStatus?.isInWishlist) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  const isInWishlist = wishlistStatus?.isInWishlist ?? false;

  // Set default dosage to lowest in-stock option — only once dosage stock data arrives.
  // We intentionally do NOT set a dosage before stock data loads to avoid flashing
  // an OOS dosage (e.g. BPC-157's dosageOptions[0] is 15mg which is OOS).
  // The default "10mg" from useState is safe because the product is already known
  // to be in-stock from the shop page — the full OOS treatment only applies
  // at the product level (product.inStock === false).
  const [hasSetInitialDosage, setHasSetInitialDosage] = useState(false);
  useEffect(() => {
    if (hasSetInitialDosage) return;
    if (!product?.dosageOptions || product.dosageOptions.length === 0) return;
    if (dosageStocks.length === 0) return;

    // If the URL specified a dosage and it's a valid option for this product,
    // honour it and skip the auto-select logic entirely.
    if (urlDosageParam && product.dosageOptions.includes(urlDosageParam)) {
      setHasSetInitialDosage(true);
      return;
    }

    const parseDosage = (dosage: string): number => {
      const match = dosage.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0;
    };

    const sortedDosages = [...product.dosageOptions].sort(
      (a, b) => parseDosage(a) - parseDosage(b)
    );

    const lowestInStock = sortedDosages.find(dosage => {
      const stockInfo = dosageStocks.find(ds => ds.dosage === dosage);
      return stockInfo && stockInfo.stockAmount > 0;
    });
    setSelectedDosage(lowestInStock || sortedDosages[0]);
    setHasSetInitialDosage(true);
  }, [product, dosageStocks, hasSetInitialDosage, urlDosageParam]);

  // Keep ?dosage= in the URL in sync with the selected dosage so that the
  // address bar is always shareable/deep-linkable.  replaceState is used so
  // the back button is not affected by dosage changes.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (selectedDosage) {
      searchParams.set("dosage", selectedDosage);
    } else {
      searchParams.delete("dosage");
    }
    const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${newSearch}${window.location.hash}`);
  }, [selectedDosage]);

  // Redirect UUID URLs to slug URLs for SEO
  // Use replaceState to update the URL bar without affecting navigation history,
  // so back button returns to the originating page (e.g. bulk-packs) instead of skipping it.
  // The product data is already loaded, so wouter route state desync is not a concern.
  useEffect(() => {
    if (product?.slug && params.id !== product.slug) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id || "");
      if (isUUID) {
        const search = window.location.search;
        window.history.replaceState(null, "", `/peptides/${product.slug}${search}`);
      }
    }
  }, [product, params.id]);

  // Graceful retirement handling: redirect to listing when product is not found.
  // Triggers immediately for known retired slugs, or after the query settles
  // for a genuine 404 response. Transient network errors are not treated as retirement.
  useEffect(() => {
    if (params.id && RETIRED_PRODUCT_SLUGS.includes(params.id)) {
      flagRetiredContent("product", params.id);
      setLocation("/peptides");
      return;
    }
    if (isLoading) return;
    const is404 = error instanceof Error && error.message.startsWith("404:");
    if (is404 || (!error && !product)) {
      flagRetiredContent("product", params.id);
      setLocation("/peptides");
    }
  }, [isLoading, error, product, params.id]);

  // Track recently viewed products
  useEffect(() => {
    if (productId) {
      addToRecentlyViewed(productId);
    }
  }, [productId]);

  const hasPkData = product
    ? (() => {
        const k = resolveComboSlugKey(product);
        if (k && COMBO_STACK_CONSTITUENTS[k]) {
          return COMBO_STACK_CONSTITUENTS[k].every((n) => !!getHalfLifeByName(n));
        }
        return !!getHalfLifeByName(product.name);
      })()
    : false;

  useEffect(() => {
    if (!hasPkData && activeResearchTab === "pk" && !(softGateEnabled && !isAuthenticated)) {
      setActiveResearchTab("overview");
    }
  }, [hasPkData, activeResearchTab, softGateEnabled, isAuthenticated]);

  // Feature 1: Sticky desktop purchase bar — scroll handler
  useEffect(() => {
    const productInStock = product?.inStock !== false &&
      (product?.stockAmount === null || product?.stockAmount === undefined || (product?.stockAmount ?? 0) > 0);
    if (!productInStock) {
      setShowStickyPurchase(false);
      return;
    }
    const handleScroll = () => {
      if (!twoColumnRef.current) return;
      const threshold = twoColumnRef.current.offsetTop + twoColumnRef.current.offsetHeight;
      setShowStickyPurchase(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [product]);


  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const getDosageMultiplier = () => {
    return dosageMultipliers[selectedDosage] || 1.0;
  };

  const getBasePrice = () => {
    if (!product) return 0;
    // Use dosage-specific price if available
    if (hasDosageStockData && selectedDosageStock?.price) {
      return Number(selectedDosageStock.price);
    }
    // Fallback to product price with dosage multiplier
    return Number(product.price) * getDosageMultiplier();
  };

  const getOriginalPrice = () => {
    if (!product) return null;
    // Use dosage-specific original price if available
    if (hasDosageStockData && selectedDosageStock?.originalPrice) {
      return Number(selectedDosageStock.originalPrice);
    }
    // Fallback to product original price with dosage multiplier
    if (product.originalPrice) {
      return Number(product.originalPrice) * getDosageMultiplier();
    }
    return null;
  };

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
  };

  const getDiscountedPrice = () => {
    const basePrice = getBasePrice();
    const discount = getSelectedDiscount();
    return basePrice * (1 - discount / 100);
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * quantity;
  };

  const handleBuyNow = async () => {
    if (product) {
      const isSubPurchase = purchaseType === "subscription";
      const added = await addToCart({
        productId: product.id,
        name: product.name,
        price: getBasePrice(),
        originalPrice: getOriginalPrice() || undefined,
        quantity,
        dosage: selectedDosage,
        image: product.imageUrl || productImage,
        isSubscription: isSubPurchase,
        subscriptionInterval: isSubPurchase ? subscriptionInterval : undefined,
      });
      if (!added) {
        toast({ title: "Out of Stock", description: `${product.name} (${selectedDosage}) is currently out of stock.`, variant: "destructive" });
        return;
      }
      setLocation('/checkout?fromCart=true');
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      const isSubPurchase = purchaseType === "subscription";
      const added = await addToCart({
        productId: product.id,
        name: product.name,
        price: getBasePrice(),
        originalPrice: getOriginalPrice() || undefined,
        quantity,
        dosage: selectedDosage,
        image: product.imageUrl || productImage,
        isSubscription: isSubPurchase,
        subscriptionInterval: isSubPurchase ? subscriptionInterval : undefined,
      });
      if (!added) {
        toast({ title: "Out of Stock", description: `${product.name} (${selectedDosage}) is currently out of stock.`, variant: "destructive" });
        return;
      }
      toast({
        title: isSubPurchase ? "Subscription added to cart" : "Added to cart",
        description: isSubPurchase 
          ? `${quantity}x ${product.name} (${selectedDosage}) - ${subscriptionInterval} subscription added.`
          : `${quantity}x ${product.name} (${selectedDosage}) added to your cart.`,
        action: (
          <ToastAction altText="View Cart" onClick={() => setLocation('/cart')} className="bg-[#E7FB10] text-black border-[#E7FB10] hover:bg-[#E7FB10]/90 font-semibold">
            View Cart
          </ToastAction>
        ),
      });
    }
  };

  // Feature 3: Quick-add synergy partner to cart
  const handleQuickAddSynergy = async (partnerProduct: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sortedDosages = [...(partnerProduct.dosageOptions || [])].sort((a, b) => {
      const num = (d: string) => parseFloat(d.match(/(\d+(?:\.\d+)?)/)?.[1] || "0");
      return num(a) - num(b);
    });
    const lowestDosage = sortedDosages[0] || "10mg";
    // Align with display price logic: prefer product price, then minPrice fallback
    const rawPrice = Number(partnerProduct.price) > 0
      ? Number(partnerProduct.price)
      : (partnerProduct as any).minPrice ? Number((partnerProduct as any).minPrice) : 0;
    const added = await addToCart({
      productId: partnerProduct.id,
      name: partnerProduct.name,
      price: rawPrice,
      quantity: 1,
      dosage: lowestDosage,
      image: partnerProduct.imageUrl || productImage,
    });
    if (!added) {
      toast({
        title: "Out of Stock",
        description: `${partnerProduct.name} (${lowestDosage}) is currently out of stock.`,
        variant: "destructive",
      });
      return;
    }
    setQuickAddSuccess(prev => ({ ...prev, [partnerProduct.id]: true }));
    setTimeout(() => {
      setQuickAddSuccess(prev => ({ ...prev, [partnerProduct.id]: false }));
    }, 2000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-12 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    const isServerError = error instanceof Error && !error.message.startsWith("404:");
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Compound Unavailable</h2>
          <p className="text-muted-foreground mb-6">
            {isServerError
              ? "There was a problem loading this compound. Please try again."
              : "This research compound is not currently available. Browse our full catalog below."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {isServerError && (
              <Button
                variant="outline"
                data-testid="button-retry-product"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products", params.id] })}
              >
                Try Again
              </Button>
            )}
            <Link href="/peptides">
              <Button data-testid="button-browse-products">Browse All Compounds</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  const benefits = product.benefits || [];

  // Helper function to get stock info for a specific dosage
  const getDosageStockInfo = (dosage: string) => {
    const dosageStock = dosageStocks.find(ds => ds.dosage === dosage);
    return dosageStock;
  };

  // Check if we have dosage-level stock data at all
  const hasDosageStockData = dosageStocks.length > 0;

  // Get current selected dosage stock info
  const selectedDosageStock = getDosageStockInfo(selectedDosage);
  
  // Out-of-stock check: trust the product-level inStock flag first.
  // If the product itself is OOS, show full OOS treatment immediately (no loading needed).
  // If the product is in-stock, only mark OOS when dosage stock data has loaded AND
  // the currently selected dosage is specifically out of stock.
  // This prevents any OOS flash while dosage data is loading.
  const isProductLevelOOS = product.inStock === false || (product.stockAmount !== null && product.stockAmount !== undefined && product.stockAmount <= 0);
  const isOutOfStock = (() => {
    if (isProductLevelOOS) return true;
    if (isDosageStocksLoading || !hasDosageStockData) return false;
    if (selectedDosageStock) {
      return !selectedDosageStock.inStock || selectedDosageStock.stockAmount <= 0;
    }
    return false;
  })();
  
  // Get display stock amount for selected dosage
  const displayStockAmount = (() => {
    // Only use dosage-specific stock if we have dosage stock data
    if (hasDosageStockData && selectedDosageStock) {
      return selectedDosageStock.stockAmount;
    }
    return product.stockAmount || 0;
  })();

  const seoTitle = `${product.name} ${selectedDosage} - Research Peptide`;
  const seoDescription = product.description 
    ? `${product.description.slice(0, 120)}... Third-party tested research peptide with COA.`
    : `Premium ${product.name} research peptide. Third-party lab tested with Certificate of Analysis. For research use only.`;

  return (
    <main className="min-h-screen pt-24 md:pt-40 pb-36 md:pb-12 [overflow-x:clip]">
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/peptides/${product.slug || product.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 pr-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-2 md:mb-4"
        >
          <Link href="/peptides">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 md:-ml-4 md:gap-2" data-testid="button-back-products">
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden md:inline">Back to Products</span>
              <span className="md:hidden">Back</span>
            </Button>
          </Link>
          {systemHub && (
            <nav aria-label="Breadcrumb" className="mt-2" data-testid="nav-breadcrumb">
              <ol className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                <li>
                  <Link href="/guides/peptide-education-center" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-education">
                    Education Center
                  </Link>
                </li>
                <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
                <li>
                  <Link
                    href={`/systems/${systemHub.slug}`}
                    className="hover:opacity-80 transition-opacity font-medium"
                    style={{ color: systemHub.color }}
                    data-testid="link-breadcrumb-system"
                  >
                    {systemHub.name}
                  </Link>
                </li>
                <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
                <li className="text-foreground font-medium" data-testid="text-breadcrumb-current">{product.name}</li>
              </ol>
            </nav>
          )}
        </motion.div>

        {softGateEnabled && !isAuthenticated && <SoftGateBanner />}

        <div ref={twoColumnRef} className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start relative [clip-path:inset(0)]">
          <div className="absolute -top-4 right-0 text-[120px] md:text-[160px] font-display font-black uppercase leading-none text-white/[0.04] select-none pointer-events-none tracking-tight">
            {product.name}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col"
          >
            {product.model3dUrl ? (
              <div className="sticky top-24 z-20">
                <ModelViewer3D 
                  modelUrl={product.model3dUrl}
                  productName={product.name}
                />
              </div>
            ) : (
              <div className="relative w-full md:sticky md:top-24 z-20">
                <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                  <ImageLoader 
                    src={product.imageUrl || productImage} 
                    alt={`${product.name} ${selectedDosage} research peptide - COA verified`}
                    className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-60' : ''}`}
                    containerClassName="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-lg"
                  />
                  {isOutOfStock && (
                    <>
                      <div className="absolute inset-0 pointer-events-none z-10 rounded-lg" style={{ boxShadow: 'inset 0 0 0 3px rgba(239, 68, 68, 0.9)' }} />
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg" data-testid="overlay-out-of-stock">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="absolute w-[150%] h-8 bg-red-600/90 transform -rotate-45 flex items-center justify-center shadow-lg">
                            <span className="text-white font-display font-bold text-sm uppercase tracking-wider">
                              Out of Stock
                            </span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/20 rounded-lg" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Learn About This Peptide - DESKTOP ONLY (all products) */}
            {relatedArticles.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="mt-2 pt-4 hidden md:block relative z-10 bg-background"
                data-testid="section-education-desktop"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#ec4899]" />
                    <h3 className="font-display text-lg font-bold">Learn About This Peptide</h3>
                  </div>
                  <Link href="/guides/peptide-education-center">
                    <Button variant="outline" size="sm" className="border-[#ec4899]/30 hover:border-[#ec4899]" data-testid="link-view-all-education">
                      All Articles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {relatedArticles.slice(0, 2).map((article) => (
                    <Link key={article.id} href={`/guides/${article.slug}`}>
                      <Card 
                        className="p-4 border-[#ec4899]/20 md:hover:border-[#ec4899]/40 transition-all duration-300 cursor-pointer group md:hover:scale-[1.02] md:active:scale-[1.02] md:hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                        data-testid={`card-article-${article.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/10 flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-[#ec4899]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-[#ec4899]/50 text-[#ec4899] text-xs">
                                Research Guide
                              </Badge>
                              <span className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {article.readTimeMinutes} min read
                              </span>
                            </div>
                            <h4 className="font-display text-base md:text-lg font-bold group-hover:text-[#ec4899] transition-colors uppercase tracking-tight leading-tight">
                              {article.title}
                            </h4>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}


          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {(() => {
                const stripe = getStripeConfig(product.slug, product.category, product.stripeLabel, product.stripeAccentColor);
                return (
                  <div className="flex items-center gap-2" data-testid="stripe-category">
                    <div className="w-0.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: stripe.accentColor }} />
                    <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: stripe.accentColor }}>
                      {stripe.label}
                    </span>
                  </div>
                );
              })()}
              {/* Smart badge system - max 2 badges based on priority; hidden while dosage stock is loading to prevent OOS flash */}
              {!isDosageStocksLoading && getProductBadges(product, sellingFastIds).map((badge) => (
                <Badge key={badge.type} className={`inline-flex items-center gap-1 ${badge.className}`}>
                  {badge.icon && <badge.icon className="h-3 w-3" />}
                  {badge.label}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-6xl font-bold mb-1 md:mb-2 uppercase tracking-wide leading-none" data-testid="text-product-name">
              {product.name}
            </h1>

            {(() => {
              const profile = getCompoundProfile(product.slug ?? "");
              if (!profile) return null;
              return (
                <>
                  <div
                    className="h-[3px] mt-2 mb-3 rounded-full -mx-4 md:-mx-6"
                    style={{ background: "linear-gradient(to right, #21d8ff, #E7FB10)" }}
                    data-testid="separator-gradient"
                  />
                  {profile?.mechanismDescriptor && (
                    <p className="text-xs text-muted-foreground/70 font-mono mb-3" data-testid="text-mechanism-descriptor">
                      {profile.mechanismDescriptor}
                    </p>
                  )}
                </>
              );
            })()}

            <div className="mb-2 md:mb-3">
              {softGateEnabled && !isAuthenticated ? (
                <div data-testid="text-product-price" className="flex items-center gap-2 py-1 mb-1">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#E7FB1065" }} />
                  <span className="text-sm" style={{ color: "#6b7280" }}>Sign in to see pricing</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                  <span className="font-display text-2xl md:text-3xl font-bold text-[#E7FB10]" data-testid="text-product-price">
                    ${getBasePrice().toFixed(2)}
                  </span>
                  <PriceTrendBadge productId={product.id} />
                </div>
              )}
            </div>



            <div className="border border-border/50 rounded-lg p-3 mb-3 md:mb-4 bg-white/[0.06]" data-testid="box-dosage">
              <div className="grid grid-cols-2 gap-3">
              {product.dosageOptions && product.dosageOptions.length > 0 && (
                <div>
                  <Label className="text-[10px] font-medium mb-1.5 block text-muted-foreground uppercase tracking-widest">Dosage</Label>
                  <Select value={selectedDosage} onValueChange={setSelectedDosage}>
                    <SelectTrigger data-testid="select-dosage" className="h-9">
                      <SelectValue placeholder="Select dosage" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...(product.dosageOptions || [])]
                        .sort((a, b) => {
                          const getDosageValue = (d: string) => {
                            const matches = d.match(/(\d+(?:\.\d+)?)/);
                            return matches ? parseFloat(matches[0]) : 0;
                          };
                          return getDosageValue(a) - getDosageValue(b);
                        })
                        .map((dosage) => {
                        const dosageStock = getDosageStockInfo(dosage);
                        // Only apply dosage-level stock restrictions if we have dosage stock data
                        const isDosageOutOfStock = hasDosageStockData && dosageStock 
                          ? (!dosageStock.inStock || dosageStock.stockAmount <= 0) 
                          : false;
                        // Show dosage-specific price if available (hidden when soft gate is active)
                        const dosagePrice = !softGateEnabled || isAuthenticated
                          ? (dosageStock?.price ? `$${Number(dosageStock.price).toFixed(2)}` : null)
                          : null;
                        const priceLabel = (softGateEnabled && !isAuthenticated) || !dosagePrice
                          ? ""
                          : ` (${dosagePrice})`;
                        return (
                          <SelectItem 
                            key={dosage} 
                            value={dosage}
                            disabled={isDosageOutOfStock}
                            className={isDosageOutOfStock ? "opacity-50" : ""}
                          >
                            {dosage}{priceLabel}
                            {isDosageOutOfStock && " (Out of Stock)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {(() => {
                    const blendCompositions: Record<string, string> = {
                      "glow-peptide-complex": "TB-500 10mg + BPC-157 10mg + GHK-Cu 50mg",
                      "klow-peptide-complex": "TB-500 10mg + BPC-157 10mg + GHK-Cu 50mg + KPV 10mg",
                      "bpc-157-tb-500-stack": "BPC-157 + TB-500 equal ratio blend",
                      "cag-sema-blend": "Cagrilintide + Semaglutide blend",
                    };
                    const composition = product.slug ? blendCompositions[product.slug] : null;
                    return composition ? (
                      <p className="text-xs text-muted-foreground mt-1.5" data-testid="text-blend-composition">
                        {composition}
                      </p>
                    ) : null;
                  })()}
                </div>
              )}

              <div>
                <Label className="text-[10px] font-medium mb-1.5 block text-muted-foreground uppercase tracking-widest">Quantity</Label>
                <div className={`flex items-center border rounded-md h-9 bg-background ${isOutOfStock ? 'border-red-500/50 opacity-50' : 'border-border'}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    data-testid="button-quantity-minus"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="flex-1 text-center font-medium text-sm" data-testid="text-quantity">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10 || isOutOfStock}
                    data-testid="button-quantity-plus"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              </div>
            </div>

            {/* Purchase Options - Hidden when out of stock */}
            {!isOutOfStock && (
              <div className="mb-3 md:mb-4">
                <Label className="text-[10px] font-medium mb-1.5 block text-muted-foreground uppercase tracking-widest">Purchase Option</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      purchaseType === "one-time" 
                        ? "border-[#E7FB10] bg-[#E7FB10]/5" 
                        : "border-border hover:border-border/80"
                    }`}
                    onClick={() => setPurchaseType("one-time")}
                    data-testid="option-one-time"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span className="font-medium text-sm">One-time</span>
                      </div>
                      {(!softGateEnabled || isAuthenticated) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ${getBasePrice().toFixed(2)}
                        </p>
                      )}
                    </div>
                    {purchaseType === "one-time" && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E7FB10] flex items-center justify-center flex-shrink-0" data-testid="check-one-time">
                        <Check className="h-3 w-3 text-black" />
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="relative flex items-center p-3 rounded-lg border-2 border-border/40 opacity-50 cursor-not-allowed select-none"
                    data-testid="option-subscription"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Repeat className="h-3.5 w-3.5" />
                        <span className="font-medium text-sm">Subscribe</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">Coming Soon</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Auto-delivery
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}


            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 md:mb-3">
              {!isOutOfStock && (
                <span className="flex items-center gap-1">
                  {displayStockAmount > 0 && displayStockAmount <= 10 ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-500 font-medium">Only {displayStockAmount} left</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {displayStockAmount} in stock
                    </>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 md:mb-3 border border-border/60 rounded-md overflow-hidden bg-muted/20" data-testid="bar-trust-badges">
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
                <Shield className="h-4 w-4 flex-shrink-0 text-[#21d8ff]" />
                <span>3rd Party Tested</span>
              </div>
              <div className="w-px self-stretch bg-border/60" />
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
                <FileCheck className="h-4 w-4 flex-shrink-0 text-[#21d8ff]" />
                <span>COA Included</span>
              </div>
              <div className="w-px self-stretch bg-border/60" />
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
                <RefreshCw className="h-4 w-4 flex-shrink-0 text-[#21d8ff]" />
                <span>Guaranteed</span>
              </div>
            </div>

            {/* Mobile-only compact RUO notice */}
            <div className="md:hidden flex items-center gap-2 p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 mb-3" data-testid="card-ruo-mobile">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400 font-medium">Research Use Only - Not for human consumption</span>
            </div>

            {/* Purchase buttons - only show when in stock */}
            {!isOutOfStock ? (
              softGateEnabled && !isAuthenticated ? (
                <div
                  className="blur-sm pointer-events-none select-none opacity-40 flex flex-col gap-2"
                  aria-hidden="true"
                  data-testid="stack-cta"
                >
                  <div className="w-full h-11 rounded-md bg-[#E7FB10] flex items-center justify-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-black" />
                    <span className="font-display font-bold text-black">Buy Now</span>
                  </div>
                  <div className="w-full h-11 rounded-md border-2 border-border flex items-center justify-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-foreground" />
                    <span className="font-display text-foreground">Add to Cart</span>
                  </div>
                </div>
              ) : (
              <div className="flex flex-col gap-2" data-testid="stack-cta">
                <Button
                  size="lg"
                  className={`w-full font-display font-bold gap-2 text-black transition-shadow duration-300 ${
                    purchaseType === "subscription"
                      ? "bg-[#21d8ff] border-[#21d8ff] shadow-[0_0_20px_rgba(33,216,255,0.4)] hover:shadow-[0_0_36px_rgba(33,216,255,0.75)]"
                      : "bg-[#E7FB10] border-[#E7FB10] shadow-[0_0_20px_rgba(231,251,16,0.4)] hover:shadow-[0_0_36px_rgba(231,251,16,0.75)]"
                  }`}
                  onClick={handleBuyNow}
                  data-testid="button-buy-now"
                >
                  {purchaseType === "subscription" ? (
                    <><Repeat className="h-5 w-5" />Subscribe Now</>
                  ) : (
                    <><ShoppingCart className="h-5 w-5" />Buy Now</>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-display gap-2 border-2 transition-shadow duration-300 hover:shadow-[0_0_18px_rgba(255,255,255,0.1)] hover:border-foreground/50"
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`w-full gap-2 transition-all duration-300 border-[#ec4899]/50 text-[#ec4899] md:hover:border-[#ec4899] md:hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] ${
                    isInWishlist ? "bg-[#ec4899]/10" : ""
                  }`}
                  onClick={handleToggleWishlist}
                  disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                  data-testid="button-toggle-wishlist"
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                  {isInWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
                </Button>
              </div>
              )
            ) : (
              /* Out of Stock - Show prominent notification signup */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-lg border-2 border-red-500/30 bg-red-500/5"
                data-testid="panel-out-of-stock"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-full bg-red-500/20">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-base text-red-400">Currently Out of Stock</h4>
                    <p className="text-xs text-muted-foreground">This product is temporarily unavailable</p>
                  </div>
                </div>

                <button
                  onClick={() => voteMutation.mutate(hasVoted ? "unvote" : "vote")}
                  disabled={voteMutation.isPending}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 mb-4 ${
                    hasVoted
                      ? "bg-[#21d8ff]/15 text-[#21d8ff] border border-[#21d8ff]/40"
                      : "bg-muted/30 text-muted-foreground border border-muted-foreground/20 hover:border-[#21d8ff]/40 hover:text-[#21d8ff]"
                  }`}
                  data-testid="button-vote-detail"
                >
                  {hasVoted ? <Check className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                  <span>{hasVoted ? "Wanted — We Hear You" : "Want This"}</span>
                </button>
                
                <Separator className="my-4" />
                
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4 text-[#21d8ff]" />
                  <h4 className="font-display font-semibold text-sm">Get Notified When Back in Stock</h4>
                </div>
                
                {notifySuccess ? (
                  <div className="flex items-center gap-2 text-sm text-green-400 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="h-5 w-5" />
                    <span>You'll be notified when this product is available!</span>
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          className="pl-9 h-11 bg-background/50"
                          required
                          data-testid="input-notify-email"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90 gap-1.5 px-5 h-11"
                        disabled={stockNotifyMutation.isPending}
                        data-testid="button-notify-me"
                      >
                        {stockNotifyMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Bell className="h-4 w-4" />
                            Notify Me
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <input 
                        type="checkbox" 
                        id="early-access-signup" 
                        className="rounded border-[#E7FB10]/30 bg-black/20"
                        onChange={async (e) => {
                          if (e.target.checked && notifyEmail) {
                            try {
                              await apiRequest("POST", "/api/newsletter/subscribe", { 
                                email: notifyEmail, 
                                source: "product_early_access" 
                              });
                            } catch (err) {
                              console.error("Early access signup error:", err);
                            }
                          }
                        }}
                      />
                      <label htmlFor="early-access-signup" className="text-[10px] text-muted-foreground leading-tight cursor-pointer">
                        Also notify me about new product drops and early access deals
                      </label>
                    </div>
                  </form>
                )}
                <p className="text-[10px] text-muted-foreground mt-3">
                  We'll send you one email when this product is restocked. No spam, ever.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#E7FB10]/60">
                  <Sparkles className="h-3 w-3" />
                  <span>Launching in 2-3 weeks after third-party testing</span>
                </div>
              </motion.div>
            )}


            <Separator className="my-4 md:my-6" />

            {/* RUO inline notice */}
            <div className="hidden md:flex items-center gap-2 mb-4 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/40 text-xs text-red-300" data-testid="notice-ruo-inline">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />
              <span>For lawful research use only. Not for human or animal consumption.</span>
            </div>

            {/* Mobile-only collapsible education section */}
            {relatedArticles.length > 0 && (
              <Collapsible 
                open={isEducationOpen} 
                onOpenChange={setIsEducationOpen}
                className="md:hidden mb-6"
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between border-[#ec4899]/30 hover:border-[#ec4899] text-sm"
                    data-testid="button-toggle-education-mobile"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#ec4899]" />
                      <span>Learn About This Peptide</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isEducationOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {relatedArticles.slice(0, 2).map((article) => (
                    <Link key={article.id} href={`/guides/${article.slug}`}>
                      <Card 
                        className="p-3 border-[#ec4899]/20 hover:border-[#ec4899]/40 transition-all cursor-pointer"
                        data-testid={`card-article-mobile-${article.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-[#ec4899] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{article.title}</h4>
                            <span className="text-xs text-muted-foreground">{article.readTimeMinutes} min read</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

          </motion.div>
        </div>

        {/* RUO Disclaimer - DESKTOP ONLY - Full width below both columns */}
        <Card className="hidden p-6 bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle mt-8" data-testid="card-ruo-disclaimer-desktop">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-lg mb-2">
                Research Use Only
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This product is sold for research purposes only and is not intended 
                for human consumption. By purchasing, you confirm you are a qualified 
                researcher and will use this product in accordance with all applicable 
                federal and state laws and regulations.
              </p>
            </div>
          </div>
        </Card>

        {/* === RESEARCH ZONE === */}

        <>
          {/* Zone separator */}
          <div className="mt-8 mb-0" />

          {/* Research container */}
          <div className="rounded-xl mt-0 px-4 md:px-8 py-8 border border-border/30" style={{ background: "linear-gradient(135deg, rgba(157,78,221,0.07) 0%, rgba(10,10,18,0.6) 40%, rgba(33,216,255,0.05) 100%)" }}>

              {/* Tab navigation */}
              <nav
                data-testid="nav-research-tabs"
                className="z-[48] backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 mb-8 border-b border-border/30 overflow-x-auto scrollbar-hide"
                style={{ background: "rgba(157,78,221,0.04)" }}
              >
                <div className="flex min-w-max">
                  {(
                    [
                      { key: "overview", label: "Overview", mobileLabel: "Overview", testId: "tab-overview" },
                      ...((hasPkData || (softGateEnabled && !isAuthenticated)) ? [{ key: "pk", label: "Pharmacokinetics", mobileLabel: "PK", testId: "tab-pk" }] : []),
                      { key: "cert", label: "Certification", mobileLabel: "COA", testId: "tab-cert" },
                      { key: "partners", label: "Research Partners", mobileLabel: "Partners", testId: "tab-partners" },
                    ] as { key: "overview" | "pk" | "cert" | "partners"; label: string; mobileLabel: string; testId: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      data-testid={tab.testId}
                      onClick={() => setActiveResearchTab(tab.key)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 text-center ${
                        activeResearchTab === tab.key
                          ? "border-[#E7FB10] text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="sm:hidden">{tab.mobileLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Section: Overview */}
              {activeResearchTab === "overview" && <section data-testid="section-overview-panel" className="relative overflow-hidden">
                <div className="absolute bottom-0 right-0 text-[100px] md:text-[130px] font-display font-black uppercase leading-none text-white/[0.07] select-none pointer-events-none tracking-tight">
                  {product.name}
                </div>
                {/* Product description + accent separator */}
                {product.description && (
                  <>
                    <p className="text-muted-foreground leading-relaxed mb-6" data-testid="text-overview-description">
                      {product.description}
                    </p>
                    <div className="mb-6 h-px bg-gradient-to-r from-[#9d4edd]/40 via-[#21d8ff]/30 to-transparent" />
                  </>
                )}

                {/* Molecular Identity — inline stat row */}
                {(() => {
                  const profile = getCompoundProfile(product.slug ?? "");
                  if (!profile) return null;
                  return (
                    <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" data-testid="section-molecular-identity">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Atom className="h-3.5 w-3.5 text-[#9d4edd]" />
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#9d4edd]/70">Identity</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Formula</span>
                        <span className="font-mono font-semibold">{renderChemicalFormula(profile.formula)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">MW</span>
                        <span className="font-semibold">{profile.molecularWeight}</span>
                      </div>
                      <a
                        href={profile.pubchemUrl ?? `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(profile.casNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#21d8ff]/80 hover:text-[#21d8ff] transition-colors"
                        data-testid="link-cas-pubchem"
                        title={
                          profile.pubchemUrl
                            ? profile.pubchemType === "substance"
                              ? "PubChem Substance record"
                              : "PubChem Compound record"
                            : "Search PubChem"
                        }
                      >
                        <span className="text-xs text-muted-foreground mr-0.5">CAS</span>
                        <span className="font-semibold">{profile.casNumber}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {profile.pubchemType === "substance" && (
                        <span
                          className="text-xs text-muted-foreground italic"
                          data-testid="label-pubchem-substance"
                        >
                          Substance record
                        </span>
                      )}
                      {profile.sequence && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-default text-muted-foreground" data-testid="chip-sequence">
                              <Dna className="h-3.5 w-3.5" />
                              <span>{profile.aminoAcids}-aa sequence</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs font-mono text-xs break-all">
                            {profile.sequence}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );
                })()}

                {/* Key Benefits — 2-column grid */}
                {benefits.length > 0 && (
                  <div className="mb-8" data-testid="list-benefits-overview">
                    <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-border bg-card text-sm">
                          <CheckCircle className="h-4 w-4 text-[#E7FB10] flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage / administration notes */}
                {product.usage && (
                  <div data-testid="section-usage-lower">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="h-5 w-5 text-[#21d8ff]" />
                      <h3 className="font-display font-semibold text-lg">Usage Information</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {product.usage}
                    </p>
                    <Link href="/guides/storage-101">
                      <Button
                        className="gap-2 bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] text-black font-semibold transition-shadow"
                        data-testid="link-learn-storage-lower"
                      >
                        <BookOpen className="h-4 w-4" />
                        Learn More: Storage Best Practices
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Healing Peptides Guide CTA — BPC-157, TB-500, GHK-Cu */}
                {["bpc-157", "tb-500", "ghk-cu"].includes(product.slug ?? "") && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="mt-8"
                    data-testid="section-healing-guide-cta"
                  >
                    <div className="h-px bg-gradient-to-r from-[#22c55e]/40 via-[#21d8ff]/30 to-transparent mb-8" />
                    <Link href="/guides/healing-peptides" data-testid="link-healing-peptides-guide">
                      <Card className="p-5 border-[#22c55e]/30 cursor-pointer hover-elevate transition-all duration-300 hover:border-[#22c55e]/60 hover:shadow-[0_0_24px_rgba(34,197,94,0.18)]">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-lg bg-[#22c55e]/10 flex-shrink-0">
                            <FlaskConical className="h-5 w-5 text-[#22c55e]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge className="bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 text-xs no-default-hover-elevate no-default-active-elevate">
                                Deep Dive
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Healing Peptides Guide</span>
                            </div>
                            <h4 className="font-display text-base md:text-lg font-bold leading-snug mb-1">
                              Learn the Science Behind This Compound
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Explore the tissue repair cascade, angiogenesis signaling, and how healing peptides work at the molecular level.
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                )}

                {/* Explore This System footer module */}
                {systemHub && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mt-8"
                    data-testid="section-explore-system"
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
                    <Link href={`/systems/${systemHub.slug}`} data-testid="link-explore-system">
                      <div
                        className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ borderColor: `${systemHub.color}33`, background: `${systemHub.color}08` }}
                      >
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-0.5">Part of the</p>
                          <p className="font-display font-semibold text-base" style={{ color: systemHub.color }} data-testid="text-system-name">
                            {systemHub.name} system
                          </p>
                          {systemPeptideCount > 1 && (
                            <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-system-count">
                              Explore {systemPeptideCount - 1} other compound{systemPeptideCount - 1 !== 1 ? "s" : ""} in this category
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: systemHub.color }} />
                      </div>
                    </Link>
                  </motion.div>
                )}
              </section>}

              {/* Section: Pharmacokinetics */}
              {activeResearchTab === "pk" && <section data-testid="section-pk-panel">
                {/* Auth gate for unauthenticated users — blurred teaser + overlaid CTA */}
                {softGateEnabled && !isAuthenticated ? (
                  <BlurredGate
                    testId="auth-gate-pk"
                    title="Sign in to view pharmacokinetics data"
                    description="Create a free account to access plasma concentration profiles and PK parameters"
                    previewContent={
                      <div className="rounded-xl border border-[#21d8ff]/20 bg-gradient-to-br from-[#0d1a2a] to-[#0a0f1a] overflow-hidden">
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#21d8ff]/10">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#21d8ff]/10">
                              <Clock className="h-5 w-5 text-[#21d8ff]" />
                            </div>
                            <div>
                              <h2 className="font-display text-lg font-bold text-white">Plasma Concentration Profile</h2>
                              <p className="text-xs text-[#21d8ff]/60 mt-0.5">Published pharmacokinetic data · primary literature</p>
                            </div>
                          </div>
                          <Badge className="text-xs no-default-hover-elevate no-default-active-elevate bg-[#21d8ff]/10 text-[#21d8ff] border border-[#21d8ff]/20">
                            PK Data
                          </Badge>
                        </div>
                        <div className="px-6 pb-6 pt-4">
                          <svg viewBox="0 0 400 160" className="w-full" style={{ maxHeight: 160 }}>
                            <defs>
                              <linearGradient id="pkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#21d8ff" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#21d8ff" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {[40, 80, 120].map((y) => (
                              <line key={y} x1="40" y1={y} x2="380" y2={y} stroke="#21d8ff" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4,4" />
                            ))}
                            <path d="M40,140 C60,140 70,30 100,28 C130,26 150,60 180,80 C210,100 240,115 280,125 C320,132 360,136 380,138 L380,140 Z" fill="url(#pkGrad)" />
                            <path d="M40,140 C60,140 70,30 100,28 C130,26 150,60 180,80 C210,100 240,115 280,125 C320,132 360,136 380,138" fill="none" stroke="#21d8ff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx="100" cy="28" r="4" fill="#21d8ff" />
                            <text x="40" y="155" fontSize="9" fill="#21d8ff" fillOpacity="0.5" fontFamily="monospace">0h</text>
                            <text x="180" y="155" fontSize="9" fill="#21d8ff" fillOpacity="0.5" fontFamily="monospace">12h</text>
                            <text x="360" y="155" fontSize="9" fill="#21d8ff" fillOpacity="0.5" fontFamily="monospace">24h</text>
                            <text x="2" y="32" fontSize="9" fill="#21d8ff" fillOpacity="0.5" fontFamily="monospace">Cmax</text>
                          </svg>
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            {["Half-life", "Tmax", "Bioavailability"].map((label, i) => (
                              <div key={label} className="rounded-lg border border-[#21d8ff]/15 bg-[#21d8ff]/5 px-3 py-2">
                                <p className="text-xs text-[#21d8ff]/60">{label}</p>
                                <p className="text-sm font-semibold text-white mt-0.5">{["~3 hrs", "30 min", "Sub-Q"][i]}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    }
                  />
                ) : (
                <>{/* PK Chart */}
                {(() => {
                  const slugKey = resolveComboSlugKey(product);
                  const constituentNames = slugKey ? COMBO_STACK_CONSTITUENTS[slugKey] : undefined;
                  let pkPeptides: { name: string; description: string }[];
                  if (constituentNames) {
                    if (!constituentNames.every((n) => !!getHalfLifeByName(n))) return null;
                    pkPeptides = constituentNames.map((n) => ({ name: n, description: "" }));
                  } else {
                    if (!getHalfLifeByName(product.name)) return null;
                    pkPeptides = [{ name: product.name, description: product.description || "" }];
                  }
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.13 }}
                      className="rounded-xl border border-[#21d8ff]/20 bg-gradient-to-br from-[#0d1a2a] to-[#0a0f1a] overflow-hidden"
                      data-testid="section-pk-chart"
                    >
                      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#21d8ff]/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#21d8ff]/10">
                            <Clock className="h-5 w-5 text-[#21d8ff]" />
                          </div>
                          <div>
                            <h2 className="font-display text-lg font-bold text-white">Plasma Concentration Profile</h2>
                            <p className="text-xs text-[#21d8ff]/60 mt-0.5">Published pharmacokinetic data · primary literature</p>
                          </div>
                        </div>
                        <Badge className="text-xs no-default-hover-elevate no-default-active-elevate bg-[#21d8ff]/10 text-[#21d8ff] border border-[#21d8ff]/20">
                          PK Data
                        </Badge>
                      </div>
                      <div className="px-2 pb-4 pt-2">
                        <PharmacokineticsChart
                          peptides={pkPeptides}
                          stackId={product.slug || product.id.toString()}
                        />
                      </div>
                    </motion.div>
                  );
                })()}
                </>
                )}
              </section>}

              {/* Section: Certification */}
              {activeResearchTab === "cert" && <section data-testid="section-cert-panel">
                {/* Auth gate for unauthenticated users — blurred teaser + overlaid CTA */}
                {softGateEnabled && !isAuthenticated ? (
                  <BlurredGate
                    testId="auth-gate-cert"
                    title="Sign in to view protocol & COA data"
                    description="Create a free account to access storage protocols and certificates of analysis"
                    previewContent={
                      <>
                        <div className="mb-8">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-[#9d4edd]" />
                              <h2 className="font-display text-base font-semibold tracking-wide uppercase text-muted-foreground">Storage & Stability</h2>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border border-border rounded-lg overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3">
                              <Snowflake className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Temperature</p>
                                <p className="text-sm font-semibold">{storageProfile?.storageTempDry || "-20°C to -80°C"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <Clock className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Stability</p>
                                <p className="text-sm font-semibold">{storageProfile?.stabilityWindowDry || "24 months"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <Eye className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Light</p>
                                <p className="text-sm font-semibold">{storageProfile?.lightSensitivity || "Protect from light"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <Beaker className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Form</p>
                                <p className="text-sm font-semibold">{storageProfile?.powderAppearance || "Lyophilized"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <FileCheck className="h-6 w-6 text-[#9d4edd]" />
                            <h2 className="font-display text-2xl font-bold">Certificates of Analysis</h2>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(productCoas.length > 0 ? productCoas.slice(0, 2) as Array<{ id: string | number; batchNumber: string; purity: string | null; labName: string; testDate: string; verified: boolean | null }> : [
                              { id: "preview-1", batchNumber: "BN-2024-001", purity: "99.4%", labName: "Janoshik Lab", testDate: "Jan 2024", verified: true },
                              { id: "preview-2", batchNumber: "BN-2024-002", purity: "99.1%", labName: "Janoshik Lab", testDate: "Mar 2024", verified: true },
                            ]).map((coa) => (
                              <Card key={coa.id} className="p-4 border-[#9d4edd]/20">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-mono font-bold text-sm">{coa.batchNumber}</span>
                                      {coa.verified && (
                                        <Badge className="bg-green-500/20 text-green-400 text-xs">Verified</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Tested: {coa.testDate}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm" className="border-2 border-[#9d4edd] text-[#9d4edd] font-semibold h-9 gap-2 px-3">
                                    <Eye className="h-4 w-4" />
                                    Verify
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">Test Results:</p>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-xs border-[#9d4edd]/30">
                                      Purity: {coa.purity}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-[#9d4edd]/30">
                                      Lab: {coa.labName}
                                    </Badge>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </>
                    }
                  />
                ) : (
                <>
                {/* Storage & Stability */}
                {storageProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.17 }}
                    className="mb-8"
                    data-testid="section-storage"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-[#9d4edd]" />
                        <h2 className="font-display text-base font-semibold tracking-wide uppercase text-muted-foreground">Storage & Stability</h2>
                      </div>
                      <Link href="/guides/storage-101">
                        <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground" data-testid="link-storage-guide">
                          Storage 101 <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border border-border rounded-lg overflow-hidden" data-testid="card-storage-temp">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Snowflake className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Temperature</p>
                          <p className="text-sm font-semibold">{storageProfile.storageTempDry || "Refrigerated"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3" data-testid="card-stability">
                        <Clock className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Stability</p>
                          <p className="text-sm font-semibold">{storageProfile.stabilityWindowDry || "24 months"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3" data-testid="card-light-sensitive">
                        <Eye className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Light</p>
                          <p className="text-sm font-semibold">{storageProfile.lightSensitivity || "Protect"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3" data-testid="card-form">
                        <Beaker className="h-4 w-4 text-[#9d4edd] flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Form</p>
                          <p className="text-sm font-semibold">{storageProfile.powderAppearance || "Lyophilized"}</p>
                        </div>
                      </div>
                    </div>
                    {storageProfile.handlingInstructions && (
                      <p className="mt-2 text-xs text-muted-foreground px-1" data-testid="card-handling-notes">
                        <span className="font-medium text-foreground/70">Note: </span>
                        {storageProfile.handlingInstructions}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* COA Section */}
                {productCoas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.18 }}
                    data-testid="section-batches"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-6 w-6 text-[#9d4edd]" />
                        <h2 className="font-display text-2xl font-bold">Certificates of Analysis</h2>
                      </div>
                      <Link href="/coa-library">
                        <Button variant="outline" size="sm" className="border-[#9d4edd]/30 hover:border-[#9d4edd]" data-testid="link-view-all-coas">
                          View All COAs
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>

                    {/* Purity timeline sparkline */}
                    {(() => {
                      const parsePurity = (p: string) => parseFloat((p || "").replace(/[^0-9.]/g, ""));
                      const parseTestDate = (d: string) => { const dt = new Date(d || ""); return isNaN(dt.getTime()) ? null : dt; };
                      const timelineData = productCoas
                        .map(coa => ({ date: parseTestDate(coa.testDate || ""), purity: parsePurity(coa.purity || "") }))
                        .filter((d): d is { date: Date; purity: number } => d.date !== null && !isNaN(d.purity) && d.purity > 0)
                        .sort((a, b) => a.date.getTime() - b.date.getTime());
                      if (timelineData.length < 2) return null;
                      const minPurity = Math.min(...timelineData.map(d => d.purity));
                      const maxPurity = Math.max(...timelineData.map(d => d.purity));
                      const yMin = Math.min(minPurity - 1, 95);
                      const yMax = Math.max(maxPurity + 0.5, 100);
                      const yRange = yMax - yMin;
                      const W = 300, H = 48, padX = 10, padY = 6;
                      const toX = (i: number) => padX + (i / (timelineData.length - 1)) * (W - padX * 2);
                      const toY = (p: number) => H - padY - ((p - yMin) / yRange) * (H - padY * 2);
                      const points = timelineData.map((d, i) => `${toX(i)},${toY(d.purity)}`).join(" ");
                      const last = timelineData[timelineData.length - 1];
                      const lastX = toX(timelineData.length - 1);
                      const lastY = toY(last.purity);
                      return (
                        <div className="mb-6 p-4 rounded-lg border border-[#9d4edd]/20 bg-[#9d4edd]/5" data-testid="chart-purity-timeline">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Purity over time</p>
                          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 48 }}>
                            <polyline points={points} fill="none" stroke="#9d4edd" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                            <circle cx={lastX} cy={lastY} r="4" fill="#9d4edd" />
                            <text x={lastX + 6} y={lastY + 4} fontSize="9" fill="#9d4edd" fontFamily="monospace">
                              {last.purity.toFixed(1)}%
                            </text>
                          </svg>
                          <p className="text-xs text-muted-foreground mt-1">
                            Consistent purity across {timelineData.length} batches
                          </p>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productCoas.slice(0, 4).map((coa) => (
                        <Card
                          key={coa.id}
                          className="p-4 border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors"
                          data-testid={`card-coa-${coa.id}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-sm">{coa.batchNumber}</span>
                                {coa.dosage && (
                                  <Badge variant="outline" className="text-xs border-[#9d4edd]/30">{coa.dosage}</Badge>
                                )}
                                {coa.verified && (
                                  <Badge className="bg-green-500/20 text-green-400 text-xs">Verified</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Tested: {coa.testDate}
                              </p>
                            </div>
                            <Link href={`/batch?batch=${coa.batchNumber}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-[#9d4edd] text-[#9d4edd] font-semibold hover:bg-[#9d4edd]/10 hover:border-[#9d4edd] h-9 gap-2 px-3"
                                data-testid={`button-verify-coa-${coa.id}`}
                              >
                                <Eye className="h-4 w-4" />
                                Verify
                              </Button>
                            </Link>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Test Results:</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs border-[#9d4edd]/30">
                                Purity: {coa.purity}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-[#9d4edd]/30">
                                Lab: {coa.labName}
                              </Badge>
                            </div>
                            {coa.labVerificationUrl && (
                              <a href={coa.labVerificationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#9d4edd] hover:underline mt-1" data-testid={`link-verify-lab-${coa.batchNumber}`}>
                                <ExternalLink className="h-3 w-3" />
                                Verify with Lab
                              </a>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
                </>
                )}
              </section>}

              {/* Section: Research Partners */}
              {activeResearchTab === "partners" && <section data-testid="section-partners-panel">
                {/* Auth gate for unauthenticated users — blurred teaser + overlaid CTA */}
                {softGateEnabled && !isAuthenticated ? (
                  <BlurredGate
                    testId="auth-gate-partners"
                    title="Sign in to discover research partner compounds"
                    description="Create a free account to explore synergy pairings and add partners to your stack"
                    previewContent={
                      <>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <Layers className="h-6 w-6 text-[#22c55e]" />
                          <h2 className="font-display text-2xl font-bold">Works Well With</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Research-backed pairings based on complementary mechanisms of action.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { name: "BPC-157", tier: { label: "Legendary", color: "#E7FB10", bg: "rgba(231,251,16,0.15)", border: "rgba(231,251,16,0.3)" }, score: 92, mechanism: "Synergistic tissue repair via GH receptor upregulation and angiogenic co-activation." },
                            { name: "TB-500", tier: { label: "Great", color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" }, score: 87, mechanism: "Complementary actin-binding pathway enhances systemic recovery and anti-inflammatory response." },
                            { name: "Ipamorelin", tier: { label: "Good", color: "#21d8ff", bg: "rgba(33,216,255,0.15)", border: "rgba(33,216,255,0.3)" }, score: 80, mechanism: "Pulse GH release amplified by combined GHRH and ghrelin receptor co-agonism." },
                          ].map((partner) => (
                            <Card key={partner.name} className="p-4 h-full" style={{ borderColor: partner.tier.border }}>
                              <div className="flex flex-wrap items-start gap-4 h-full">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0" />
                                <div className="flex-1 min-w-0 flex flex-col h-full">
                                  <p className="font-medium text-sm truncate">{partner.name}</p>
                                  <Badge
                                    className="mt-2 text-xs no-default-hover-elevate no-default-active-elevate w-fit"
                                    style={{ backgroundColor: partner.tier.bg, color: partner.tier.color, borderColor: partner.tier.border }}
                                  >
                                    <Zap className="h-3 w-3 mr-1" />
                                    {partner.score}% {partner.tier.label}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                                    {partner.mechanism}
                                  </p>
                                  <div className="flex items-center justify-between mt-2 gap-2">
                                    <p className="text-sm font-bold text-[#E7FB10]">From $XX.XX</p>
                                    <Button variant="outline" size="sm" className="flex-shrink-0 gap-1">
                                      <ShoppingBag className="h-3 w-3" />
                                      + Add
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>
                    }
                  />
                ) : (
                <>{/* Research Partners content */}
                {(() => {
                  const synergyPartners = getSynergyPartners(product.name);
                  if (synergyPartners.length === 0) return null;
                  const matchingProducts = allProducts.filter((p: Product) => {
                    if (p.category === "Research Stacks" || p.category === "Supplies" || p.category === "Research Compounds") return false;
                    const normalizedProductName = normalizePeptideName(p.name);
                    return synergyPartners.some(sp =>
                      normalizePeptideName(sp.partner) === normalizedProductName ||
                      normalizedProductName.includes(normalizePeptideName(sp.partner)) ||
                      normalizePeptideName(sp.partner).includes(normalizedProductName)
                    );
                  });
                  if (matchingProducts.length === 0) return null;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      data-testid="section-synergy"
                    >
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <Layers className="h-6 w-6 text-[#22c55e]" />
                        <h2 className="font-display text-2xl font-bold" data-testid="text-synergy-heading">Works Well With</h2>
                      </div>
                      <p className="text-muted-foreground mb-6" data-testid="text-synergy-description">
                        Research-backed pairings with {product.name} based on complementary mechanisms of action.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                        {matchingProducts.slice(0, 3).map((partnerProduct: Product) => {
                          const partnerSynergy = synergyPartners.find(sp =>
                            normalizePeptideName(sp.partner) === normalizePeptideName(partnerProduct.name) ||
                            normalizePeptideName(partnerProduct.name).includes(normalizePeptideName(sp.partner)) ||
                            normalizePeptideName(sp.partner).includes(normalizePeptideName(partnerProduct.name))
                          );
                          const pairingReason = getTopPairingForProduct(product.name, partnerProduct.name);
                          const score = partnerSynergy?.synergyBonus ?? 0;
                          const tier = score >= 90
                            ? { label: "Legendary", color: "#E7FB10", bg: "rgba(231,251,16,0.15)", border: "rgba(231,251,16,0.3)" }
                            : score >= 85
                            ? { label: "Great", color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" }
                            : score >= 75
                            ? { label: "Good", color: "#21d8ff", bg: "rgba(33,216,255,0.15)", border: "rgba(33,216,255,0.3)" }
                            : { label: "Basic", color: "#f97316", bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.3)" };
                          const isLegendary = score >= 90;
                          return (
                            <Link key={partnerProduct.id} href={`/peptides/${partnerProduct.slug || partnerProduct.id}`} className="h-full" data-testid={`link-synergy-${partnerProduct.id}`}>
                              <Card
                                className="p-4 cursor-pointer hover-elevate h-full transition-shadow duration-300"
                                style={{
                                  borderColor: tier.border,
                                  ...(isLegendary ? { boxShadow: `0 0 12px ${tier.bg}, 0 0 4px ${tier.bg}` } : {}),
                                }}
                                data-testid={`card-synergy-${partnerProduct.id}`}
                              >
                                <div className="flex flex-wrap items-start gap-4 h-full">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0">
                                    <img
                                      src={partnerProduct.imageUrl || productImage}
                                      alt={partnerProduct.name}
                                      className="w-full h-full object-cover"
                                      data-testid={`img-synergy-${partnerProduct.id}`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col h-full">
                                    <p className="font-medium text-sm truncate" data-testid={`text-synergy-name-${partnerProduct.id}`}>
                                      {partnerProduct.name}
                                    </p>
                                    {partnerSynergy && (
                                      <Badge
                                        className="mt-2 text-xs no-default-hover-elevate no-default-active-elevate"
                                        style={{ backgroundColor: tier.bg, color: tier.color, borderColor: tier.border }}
                                        data-testid={`badge-synergy-stack-${partnerProduct.id}`}
                                      >
                                        <Zap className="h-3 w-3 mr-1" />
                                        {partnerSynergy.stack.name} • {partnerSynergy.synergyBonus}% {tier.label}
                                      </Badge>
                                    )}
                                    {pairingReason && (
                                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1" data-testid={`text-pairing-reason-${partnerProduct.id}`}>
                                        {pairingReason.mechanism}
                                      </p>
                                    )}
                                    {!pairingReason && <div className="flex-1" />}
                                    <div className="flex items-center justify-between mt-2 mt-auto gap-2">
                                      <p className="text-sm font-bold text-[#E7FB10]" data-testid={`text-synergy-price-${partnerProduct.id}`}>
                                        {(() => {
                                          const displayPrice = Number(partnerProduct.price) > 0
                                            ? Number(partnerProduct.price)
                                            : (partnerProduct as any).minPrice ? Number((partnerProduct as any).minPrice) : 0;
                                          return displayPrice > 0 ? <>From ${displayPrice.toFixed(2)}</> : null;
                                        })()}
                                      </p>
                                      {partnerProduct.inStock !== false && (partnerProduct.stockAmount === null || partnerProduct.stockAmount === undefined || partnerProduct.stockAmount > 0) && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => handleQuickAddSynergy(partnerProduct, e)}
                                          className="flex-shrink-0 gap-1"
                                          data-testid={`button-quick-add-synergy-${partnerProduct.id}`}
                                        >
                                          {quickAddSuccess[partnerProduct.id] ? (
                                            <Check className="h-3 w-3" />
                                          ) : (
                                            <ShoppingBag className="h-3 w-3" />
                                          )}
                                          {quickAddSuccess[partnerProduct.id] ? "Added" : "+ Add"}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex justify-center">
                        <Link href="/research-stacks?tab=custom" data-testid="link-build-custom-stack">
                          <motion.div
                            className="inline-block relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <motion.div
                              className="absolute inset-0 rounded-md bg-[#21d8ff]/40 blur-xl pointer-events-none"
                              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <Button
                              size="lg"
                              className="relative font-display gap-3 bg-gradient-to-r from-[#21d8ff] to-[#0ea5e9] border border-[#21d8ff] text-black shadow-lg shadow-[#21d8ff]/30"
                              data-testid="button-build-custom-stack"
                            >
                              <Layers className="h-5 w-5" />
                              Build a Custom Stack
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })()}
                </>
                )}
              </section>}

            </div>
          </>

      </div>
      
      {/* Recently Viewed Sidebar */}
      <RecentlyViewed currentProductId={productId} variant="sidebar" />

      {/* Feature 1: Sticky Desktop Purchase Bar */}
      <AnimatePresence>
        {showStickyPurchase && !isOutOfStock && !(softGateEnabled && !isAuthenticated) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden md:block fixed left-0 right-0 z-[49] bg-background/95 backdrop-blur-sm border-b border-border"
            style={{ top: "calc(var(--banner-height, 36px) + 4rem)" }}
            data-testid="sticky-purchase-bar-desktop"
          >
            <div className="max-w-7xl mx-auto px-8 py-2 flex items-center justify-between gap-4 flex-wrap">
              <p className="font-display font-bold truncate max-w-xs">{product.name}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-muted-foreground">{selectedDosage}</span>
                <span className="font-bold text-[#E7FB10]">${getBasePrice().toFixed(2)}</span>
                <Button
                  onClick={handleAddToCart}
                  className="bg-[#E7FB10] text-black font-display gap-2 shadow-[0_0_15px_rgba(231,251,16,0.4)]"
                  data-testid="button-sticky-purchase-add-to-cart"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Add-to-Cart Bar */}
      {product && !isOutOfStock && !(softGateEnabled && !isAuthenticated) && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-3 safe-area-pb" data-testid="sticky-cart-bar-mobile">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{product.name}</p>
              <p className="text-lg font-bold text-[#E7FB10]">${getBasePrice().toFixed(2)}</p>
            </div>
            <Button
              size="lg"
              className="bg-[#E7FB10] text-black font-display gap-2 shadow-[0_0_15px_rgba(231,251,16,0.4)]"
              onClick={handleAddToCart}
              data-testid="button-sticky-add-to-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
