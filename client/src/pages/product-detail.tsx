import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageLoader } from "@/components/image-loader";
import { addToRecentlyViewed, RecentlyViewed } from "@/components/recently-viewed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
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
  CheckCircle2,
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
  Heart
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ModelViewer3D } from "@/components/model-viewer-3d";
import { PriceTrendBadge } from "@/components/price-trend-badge";
import type { Product, Review, ProductStorageProfile, Batch, Coa, EducationArticle } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";
import { SEOHead } from "@/components/seo-head";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Badge priority system - max 2 badges per product
// Priority: Out of Stock > Low Stock > Sale > Selling Fast > Featured
type BadgeType = "out-of-stock" | "low-stock" | "sale" | "selling-fast" | "featured";

interface ProductBadge {
  type: BadgeType;
  label: string;
  className: string;
  icon?: typeof TrendingUp;
}

const LOW_STOCK_THRESHOLD = 20;

function getProductBadges(
  product: Product, 
  sellingFastIds: string[]
): ProductBadge[] {
  const badges: ProductBadge[] = [];
  
  // Priority 1: Out of Stock (highest priority)
  if (!product.inStock || (product.stockAmount !== null && product.stockAmount <= 0)) {
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
  
  // Priority 3: Sale
  if (product.originalPrice) {
    badges.push({
      type: "sale",
      label: "SALE",
      className: "bg-red-600 text-white font-bold animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"
    });
  }
  
  // Priority 4: Selling Fast
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

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { isAuthenticated, login } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedDosage, setSelectedDosage] = useState<string>("10mg");
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", params.id],
  });

  // Query for selling fast products
  const { data: sellingFastIds = [] } = useQuery<string[]>({
    queryKey: ["/api/products/selling-fast"],
  });

  // Query for product reviews
  const { data: reviewsData } = useQuery<{ reviews: (Review & { reviewerName: string; isVerifiedPurchase: boolean })[]; average: number; count: number }>({
    queryKey: ["/api/products", params.id, "reviews"],
    enabled: !!params.id,
  });

  // Query for storage profile
  const { data: storageProfile } = useQuery<ProductStorageProfile>({
    queryKey: ["/api/products", params.id, "storage"],
    enabled: !!params.id,
  });

  // Query for recent batches with COAs
  const { data: batchesWithCoas = [] } = useQuery<(Batch & { coas?: Coa[] })[]>({
    queryKey: ["/api/products", params.id, "batches"],
    enabled: !!params.id,
  });

  // Query for related education articles
  const { data: relatedArticles = [] } = useQuery<EducationArticle[]>({
    queryKey: ["/api/products", params.id, "education"],
    enabled: !!params.id,
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
  };

  // Wishlist functionality
  const { data: wishlistStatus } = useQuery<{ isInWishlist: boolean }>({
    queryKey: ["/api/wishlist/check", params.id],
    enabled: !!params.id && isAuthenticated,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", params.id] });
      toast({ title: "Added to Wishlist", description: "Product saved to your wishlist" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add to wishlist. Please try again.", variant: "destructive" });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/check", params.id] });
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
    if (!params.id) return;
    
    if (wishlistStatus?.isInWishlist) {
      removeFromWishlistMutation.mutate(params.id);
    } else {
      addToWishlistMutation.mutate(params.id);
    }
  };

  const isInWishlist = wishlistStatus?.isInWishlist ?? false;

  useEffect(() => {
    if (product?.dosageOptions && product.dosageOptions.length > 0) {
      setSelectedDosage(product.dosageOptions[0]);
    }
  }, [product]);

  // Track recently viewed products
  useEffect(() => {
    if (params.id) {
      addToRecentlyViewed(params.id);
    }
  }, [params.id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const getDosageMultiplier = () => {
    return dosageMultipliers[selectedDosage] || 1.0;
  };

  const getBasePrice = () => {
    if (!product) return 0;
    return Number(product.price) * getDosageMultiplier();
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

  const handleBuyNow = () => {
    if (product) {
      let url = `/checkout?productId=${product.id}&quantity=${quantity}&dosage=${selectedDosage}`;
      if (purchaseType === "subscription") {
        url += `&subscription=true&interval=${subscriptionInterval}`;
      }
      setLocation(url);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: getBasePrice(),
        originalPrice: product.originalPrice ? Number(product.originalPrice) * getDosageMultiplier() : undefined,
        quantity,
        dosage: selectedDosage,
        image: product.imageUrl || productImage,
      });
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} (${selectedDosage}) added to your cart.`,
      });
    }
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
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const benefits = product.benefits || [];
  
  // Unified out-of-stock check - considers BOTH inStock flag AND stockAmount
  const isOutOfStock = !product.inStock || (product.stockAmount !== null && product.stockAmount !== undefined && product.stockAmount <= 0);

  const seoTitle = `${product.name} ${selectedDosage} - Research Peptide`;
  const seoDescription = product.description 
    ? `${product.description.slice(0, 120)}... Third-party tested research peptide with COA.`
    : `Premium ${product.name} research peptide. Third-party lab tested with Certificate of Analysis. For research use only.`;

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-12">
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/products/${product.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link href="/products">
            <Button variant="ghost" className="gap-2 -ml-4" data-testid="button-back-products">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col"
          >
            {product.model3dUrl ? (
              <div className="sticky top-24">
                <ModelViewer3D 
                  modelUrl={product.model3dUrl}
                  productName={product.name}
                />
              </div>
            ) : (
              <div className={`relative aspect-square sticky top-24 overflow-hidden rounded-lg ${isOutOfStock ? 'border-2 border-red-500' : ''}`}>
                <ImageLoader 
                  src={product.imageUrl || productImage} 
                  alt={`${product.name} ${selectedDosage} research peptide - COA verified`}
                  className={`w-full h-full object-contain p-6 ${isOutOfStock ? 'opacity-60' : ''}`}
                  containerClassName="relative w-full h-full bg-gradient-to-br from-muted to-muted/50 overflow-hidden rounded-lg"
                />
              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 pointer-events-none" data-testid="overlay-out-of-stock">
                  {/* Diagonal red stripe */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-[150%] h-8 bg-red-600/90 transform -rotate-45 flex items-center justify-center shadow-lg">
                      <span className="text-white font-display font-bold text-sm uppercase tracking-wider">
                        Out of Stock
                      </span>
                    </div>
                  </div>
                  {/* Subtle dark overlay */}
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}
              </div>
            )}
            
            {/* Learn About This Peptide - DESKTOP ONLY (hidden on mobile, shown below purchase on mobile) */}
            {relatedArticles.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="mt-6 hidden md:block"
                data-testid="section-education-desktop"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#ec4899]" />
                    <h3 className="font-display text-lg font-bold">Learn About This Peptide</h3>
                  </div>
                  <Link href="/education">
                    <Button variant="outline" size="sm" className="border-[#ec4899]/30 hover:border-[#ec4899]" data-testid="link-view-all-education">
                      All Articles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {relatedArticles.slice(0, 1).map((article) => (
                    <Link key={article.id} href={`/education/${article.slug}`}>
                      <Card 
                        className="p-4 border-[#ec4899]/20 hover:border-[#ec4899]/40 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
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
                            <h4 className="font-display text-sm font-bold group-hover:text-[#ec4899] transition-colors">
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

            {/* RUO Disclaimer - DESKTOP ONLY (compact version shown on mobile in product info section) */}
            <Card className="p-6 bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle mt-6 hidden md:block" data-testid="card-ruo-disclaimer-desktop">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                {product.category}
              </Badge>
              {/* Smart badge system - max 2 badges based on priority */}
              {getProductBadges(product, sellingFastIds).map((badge) => (
                <Badge key={badge.type} className={`inline-flex items-center gap-1 ${badge.className}`}>
                  {badge.icon && <badge.icon className="h-3 w-3" />}
                  {badge.label}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2" data-testid="text-product-name">
              {product.name}
            </h1>

            <div className="mb-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-3xl font-bold text-[#E7FB10]" data-testid="text-product-price">
                  ${getBasePrice().toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${(Number(product.originalPrice) * getDosageMultiplier()).toFixed(2)}
                  </span>
                )}
                {selectedDosage !== "10mg" && (
                  <Badge variant="outline" className="text-xs">
                    +{((getDosageMultiplier() - 1) * 100).toFixed(0)}% for {selectedDosage}
                  </Badge>
                )}
                <PriceTrendBadge productId={product.id} />
              </div>
              <span className="text-xs font-semibold text-[#E7FB10] mt-1 block">Early access pricing preview — subject to change at launch</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid="text-product-description">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {product.dosageOptions && product.dosageOptions.length > 0 && (
                <div>
                  <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Dosage</Label>
                  <Select value={selectedDosage} onValueChange={setSelectedDosage}>
                    <SelectTrigger data-testid="select-dosage" className="h-9">
                      <SelectValue placeholder="Select dosage" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.dosageOptions.map((dosage) => (
                        <SelectItem key={dosage} value={dosage}>
                          {dosage} {dosage !== "10mg" && `(+${((dosageMultipliers[dosage] || 1) - 1) * 100}%)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Quantity</Label>
                <div className={`flex items-center border rounded-md h-9 ${isOutOfStock ? 'border-red-500/50 opacity-50' : 'border-border'}`}>
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

            {/* Purchase Options - Hidden when out of stock */}
            {!isOutOfStock && (
              <div className="mb-4">
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Purchase Option</Label>
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${getBasePrice().toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div 
                    className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      purchaseType === "subscription" 
                        ? "border-[#21d8ff] bg-[#21d8ff]/5" 
                        : "border-border hover:border-border/80"
                    }`}
                    onClick={() => setPurchaseType("subscription")}
                    data-testid="option-subscription"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Repeat className="h-3.5 w-3.5" />
                        <span className="font-medium text-sm">Subscribe</span>
                        <Badge className="bg-[#21d8ff] text-[10px] px-1 py-0">15% off</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Auto-delivery
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {purchaseType === "subscription" && !isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Delivery Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {subscriptionOptions.map((option) => {
                    const discountedPrice = getBasePrice() * (1 - option.discount / 100);
                    return (
                      <div 
                        key={option.value}
                        className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          subscriptionInterval === option.value 
                            ? "border-[#21d8ff] bg-[#21d8ff]/5" 
                            : "border-border hover:border-border/80"
                        }`}
                        onClick={() => setSubscriptionInterval(option.value)}
                        data-testid={`option-interval-${option.value}`}
                      >
                        <span className="font-medium text-xs">{option.label}</span>
                        <span className="text-[10px] text-[#21d8ff]">{option.discount}% off</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              {isOutOfStock ? (
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Out of Stock
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  {product.stockAmount && product.stockAmount <= 20 ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-500 font-medium">Only {product.stockAmount} left</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {product.stockAmount || 0} in stock
                    </>
                  )}
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Lab Tested</span>
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Ship</span>
              </div>
            </div>

            {/* Mobile-only compact RUO notice */}
            <div className="md:hidden flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-500/40 mb-4" data-testid="card-ruo-mobile">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400 font-medium">Research Use Only - Not for human consumption</span>
            </div>

            {/* Purchase buttons - only show when in stock */}
            {!isOutOfStock ? (
              <>
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 font-display gap-2 border-2"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    className={`flex-1 font-display gap-2 transition-shadow duration-300 text-black ${
                      purchaseType === "subscription" 
                        ? "bg-[#21d8ff] border-[#21d8ff] hover:bg-[#21d8ff]/90 shadow-[0_0_20px_rgba(33,216,255,0.4)] hover:shadow-[0_0_40px_rgba(33,216,255,0.6)]" 
                        : "bg-[#E7FB10] border-[#E7FB10] hover:bg-[#E7FB10]/90 shadow-[0_0_20px_rgba(231,251,16,0.4)] hover:shadow-[0_0_40px_rgba(231,251,16,0.6)]"
                    }`}
                    onClick={handleBuyNow}
                    data-testid="button-buy-now"
                  >
                    {purchaseType === "subscription" ? (
                      <>
                        <Repeat className="h-5 w-5" />
                        Subscribe
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Buy Now
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className={`border-2 transition-all duration-300 ${
                      isInWishlist 
                        ? "border-[#ec4899] bg-[#ec4899]/10 text-[#ec4899]" 
                        : "border-[#2a2a32] text-muted-foreground hover:border-[#ec4899] hover:text-[#ec4899]"
                    }`}
                    onClick={handleToggleWishlist}
                    disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                    data-testid="button-toggle-wishlist"
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                  </Button>
                </div>

                {purchaseType === "subscription" && (
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Save ${((getBasePrice() - getDiscountedPrice()) * quantity).toFixed(2)} per order • Cancel anytime
                  </p>
                )}
              </>
            ) : (
              /* Out of Stock - Show prominent notification signup */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-lg border-2 border-red-500/30 bg-red-500/5"
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
              </motion.div>
            )}

            <Separator className="my-6" />

            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">3rd Party Tested</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">COA Included</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Guaranteed</span>
              </div>
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
                    <Link key={article.id} href={`/education/${article.slug}`}>
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

            {benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#E7FB10] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.usage && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Usage Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {product.usage}
                </p>
                <Link href="/education/storage-101">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="gap-2 bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] text-black font-semibold hover:shadow-[0_0_20px_rgba(33,216,255,0.6)] transition-shadow" 
                      data-testid="link-learn-storage"
                    >
                      <BookOpen className="h-4 w-4" />
                      Learn More: Storage Best Practices
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Storage & Stability Section */}
        {storageProfile && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-12"
            data-testid="section-storage"
          >
            <div className="flex items-center gap-3 mb-6">
              <Thermometer className="h-6 w-6 text-[#9d4edd]" />
              <h2 className="font-display text-2xl font-bold">Storage & Stability</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors" data-testid="card-storage-temp">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#9d4edd]/10">
                    <Snowflake className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Storage Temperature (Dry)</p>
                    <p className="font-bold">{storageProfile.storageTempDry || "Refrigerated"}</p>
                    {storageProfile.storageTempReconstituted && (
                      <p className="text-xs text-muted-foreground mt-1">Reconstituted: {storageProfile.storageTempReconstituted}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors" data-testid="card-stability">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#9d4edd]/10">
                    <Clock className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Stability Window</p>
                    <p className="font-bold">{storageProfile.stabilityWindowDry || "24 months"}</p>
                    {storageProfile.stabilityWindowReconstituted && (
                      <p className="text-xs text-muted-foreground mt-1">After reconstitution: {storageProfile.stabilityWindowReconstituted}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors" data-testid="card-light-sensitive">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#9d4edd]/10">
                    <Eye className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Light Sensitivity</p>
                    <p className="font-bold">{storageProfile.lightSensitivity || "Protect from light"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors" data-testid="card-form">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#9d4edd]/10">
                    <Beaker className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Appearance</p>
                    <p className="font-bold">{storageProfile.powderAppearance || "White lyophilized powder"}</p>
                  </div>
                </div>
              </Card>
            </div>

            {storageProfile.handlingInstructions && (
              <Card className="mt-4 p-4 border-[#9d4edd]/20 bg-[#9d4edd]/5" data-testid="card-handling-notes">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Handling Instructions: </span>
                  {storageProfile.handlingInstructions}
                </p>
              </Card>
            )}

            {/* Storage Education Link */}
            <div className="mt-6 flex items-center justify-between p-4 rounded-lg border border-[#9d4edd]/20 bg-gradient-to-r from-[#9d4edd]/5 to-transparent">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-[#9d4edd]" />
                <div>
                  <p className="text-sm font-medium">New to peptide storage?</p>
                  <p className="text-xs text-muted-foreground">Our guide covers everything you need to know</p>
                </div>
              </div>
              <Link href="/education/storage-101">
                <Button variant="outline" size="sm" className="border-[#9d4edd]/30 hover:border-[#9d4edd] gap-2" data-testid="link-storage-guide">
                  Storage 101
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.section>
        )}

        {/* Batch & COA Section */}
        {batchesWithCoas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mt-12"
            data-testid="section-batches"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileCheck className="h-6 w-6 text-[#9d4edd]" />
                <h2 className="font-display text-2xl font-bold">Recent Batches & COAs</h2>
              </div>
              <Link href="/coa-library">
                <Button variant="outline" size="sm" className="border-[#9d4edd]/30 hover:border-[#9d4edd]" data-testid="link-view-all-coas">
                  View All COAs
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batchesWithCoas.slice(0, 4).map((batch) => (
                <Card 
                  key={batch.id} 
                  className="p-4 border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors"
                  data-testid={`card-batch-${batch.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm">{batch.batchNumber}</span>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">Verified</Badge>
                      </div>
                      {batch.manufactureDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Manufactured: {new Date(batch.manufactureDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Link href={`/batch?batch=${batch.batchNumber}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-2 border-[#9d4edd] text-[#9d4edd] font-semibold hover:bg-[#9d4edd]/10 hover:border-[#9d4edd] h-9 gap-2 px-3" 
                        data-testid={`button-verify-batch-${batch.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        Verify
                      </Button>
                    </Link>
                  </div>

                  {batch.coas && batch.coas.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Test Results:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs border-[#9d4edd]/30">
                          Purity: {batch.coas[0].purity}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-[#9d4edd]/30">
                          Lab: {batch.coas[0].labName}
                        </Badge>
                        {batch.coas[0].verified && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12"
          data-testid="section-reviews"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
              {reviewsData && reviewsData.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(reviewsData.average)
                            ? "text-[#E7FB10] fill-[#E7FB10]"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{reviewsData.average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewsData.count} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Verified Purchase Notice */}
          <Card className="p-4 mb-6 border border-muted bg-muted/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">Verified Purchase Reviews Only</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Only customers who have purchased this product can leave a review. 
                  {isAuthenticated ? (
                    <> Reviews can be submitted 30 days after your order from your <Link href="/dashboard" className="text-primary hover:underline">dashboard</Link>.</>
                  ) : (
                    <> <span onClick={() => login()} style={{cursor: "pointer"}} className="text-primary hover:underline">Sign in</span> and make a purchase to leave a verified review.</>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {reviewsData && reviewsData.reviews.length > 0 ? (
            <div className="space-y-4">
              {reviewsData.reviews.map((review) => (
                <Card key={review.id} className="p-5" data-testid={`card-review-${review.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" data-testid={`text-reviewer-${review.id}`}>
                            {review.reviewerName}
                          </span>
                          {review.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-[10px] gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? "text-[#E7FB10] fill-[#E7FB10]"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {review.createdAt && new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold mb-2" data-testid={`text-review-title-${review.id}`}>
                      {review.title}
                    </h4>
                  )}
                  <p className="text-muted-foreground leading-relaxed" data-testid={`text-review-comment-${review.id}`}>
                    {review.comment}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Star className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No reviews yet</h3>
              <p className="text-sm text-muted-foreground">
                Reviews from verified purchasers will appear here.
              </p>
            </Card>
          )}
        </motion.section>
      </div>
      
      {/* Recently Viewed Sidebar */}
      <RecentlyViewed currentProductId={params.id} variant="sidebar" />

      {/* Sticky Mobile Add-to-Cart Bar */}
      {product && !isOutOfStock && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-3 safe-area-pb" data-testid="sticky-cart-bar-mobile">
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
