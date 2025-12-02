import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Package,
  FileCheck,
  User,
  ShoppingBag,
  ArrowRight,
  LogOut,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Truck,
  Star,
  MessageSquare,
  TrendingUp,
  Trophy,
  Award,
  Zap,
  Crown,
  Flame,
  Gift,
  Heart,
  RefreshCw,
  Sparkles,
  Target,
  Shield,
  PiggyBank,
  Bookmark,
  BookmarkCheck,
  X,
  Plus,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  History,
  Timer,
  Boxes,
} from "lucide-react";
import type { Order, Product, ReviewableOrder, Coa } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { BUNDLES, type Bundle } from "@/lib/bundles";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getStatusIcon(status: string | null) {
  switch (status) {
    case "completed":
    case "delivered":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "shipped":
      return <Truck className="h-4 w-4 text-blue-500" />;
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusColor(status: string | null): "default" | "secondary" | "outline" {
  switch (status) {
    case "completed":
    case "delivered":
      return "default";
    case "shipped":
      return "secondary";
    default:
      return "outline";
  }
}

interface CustomerBadge {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

const getBadgeStyles = (color: string, earned: boolean) => {
  if (!earned) return undefined;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return {
    background: `linear-gradient(135deg, rgba(${r},${g},${b},0.15) 0%, transparent 100%)`,
    borderColor: color,
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    boxShadow: `0 0 20px rgba(${r},${g},${b},0.5), 0 0 40px rgba(${r},${g},${b},0.2)`,
  };
};

function CustomerAchievements({ orders, totalSpent }: { orders?: Order[]; totalSpent: number }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const orderCount = orders?.length || 0;
  const uniqueProducts = new Set(orders?.map(o => o.productId) || []).size;
  
  const badges: CustomerBadge[] = useMemo(() => [
    {
      id: "first-order",
      title: "First Steps",
      description: "Placed your first order",
      icon: Zap,
      color: "#E7FB10",
      earned: orderCount >= 1,
      progress: Math.min(orderCount, 1),
      target: 1,
    },
    {
      id: "repeat-customer",
      title: "Repeat Researcher",
      description: "Made 5+ orders",
      icon: RefreshCw,
      color: "#21d8ff",
      earned: orderCount >= 5,
      progress: Math.min(orderCount, 5),
      target: 5,
    },
    {
      id: "explorer",
      title: "Compound Explorer",
      description: "Tried 3+ different products",
      icon: Target,
      color: "#9d4edd",
      earned: uniqueProducts >= 3,
      progress: Math.min(uniqueProducts, 3),
      target: 3,
    },
    {
      id: "big-spender",
      title: "Dedicated Researcher",
      description: "Spent $500+ total",
      icon: Crown,
      color: "#E7FB10",
      earned: totalSpent >= 500,
      progress: Math.min(totalSpent, 500),
      target: 500,
    },
    {
      id: "bundle-master",
      title: "Stack Specialist",
      description: "Ordered research stacks",
      icon: Boxes,
      color: "#ec4899",
      earned: orderCount >= 2 && uniqueProducts >= 2,
      progress: uniqueProducts >= 2 ? 1 : 0,
      target: 1,
    },
    {
      id: "loyal",
      title: "Loyal Partner",
      description: "10+ lifetime orders",
      icon: Trophy,
      color: "#f97316",
      earned: orderCount >= 10,
      progress: Math.min(orderCount, 10),
      target: 10,
    },
  ], [orderCount, uniqueProducts, totalSpent]);

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <Card className="border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 via-transparent to-[#9d4edd]/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1"
            data-testid="button-achievements-toggle"
          >
            <Trophy className="h-5 w-5 text-[#E7FB10]" />
            Achievements
            <ChevronDown 
              className="h-4 w-4 transition-transform"
              style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
            />
          </button>
          <Badge variant="secondary" className="bg-[#E7FB10]/10 text-[#E7FB10] border border-[#E7FB10]/30">
            {earnedCount}/{badges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  const badgeStyles = getBadgeStyles(badge.color, badge.earned);
                  const r = parseInt(badge.color.slice(1, 3), 16);
                  const g = parseInt(badge.color.slice(3, 5), 16);
                  const b = parseInt(badge.color.slice(5, 7), 16);
                  
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative p-3 rounded-lg transition-all"
                      style={badge.earned ? badgeStyles : {
                        background: `linear-gradient(135deg, rgba(${r},${g},${b},0.05) 0%, transparent 100%)`,
                        borderColor: `rgba(${r},${g},${b},0.2)`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      }}
                      data-testid={`customer-badge-${badge.id}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={badge.earned ? { rotate: 360 } : { y: [0, -4, 0] }}
                          transition={badge.earned ? { duration: 4, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
                          className="p-1.5 rounded-lg"
                          style={{ 
                            backgroundColor: badge.earned ? `rgba(${r},${g},${b},0.2)` : `rgba(${r},${g},${b},0.1)`,
                            color: badge.earned ? badge.color : `rgba(${r},${g},${b},0.5)`
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </motion.div>
                        {badge.earned && (
                          <Sparkles className="h-3 w-3 animate-pulse" style={{ color: badge.color }} />
                        )}
                      </div>
                      <span 
                        className="text-sm font-bold block"
                        style={{ 
                          color: badge.color,
                          textShadow: badge.earned ? `0 0 8px rgba(${r},${g},${b},0.5)` : 'none'
                        }}
                      >
                        {badge.title}
                      </span>
                      <span className="text-xs mt-1 block" style={{ color: badge.earned ? `rgba(${r},${g},${b},0.8)` : `rgba(${r},${g},${b},0.5)` }}>{badge.description}</span>
                      {!badge.earned && badge.progress !== undefined && badge.target && (
                        <div className="mt-2">
                          <Progress 
                            value={(badge.progress / badge.target) * 100} 
                            className="h-1"
                            style={{ ['--progress-background' as string]: `rgba(${r},${g},${b},0.3)` }}
                          />
                          <span className="text-[9px] mt-1 block" style={{ color: `rgba(${r},${g},${b},0.6)` }}>
                            {badge.id === "big-spender" ? `$${badge.progress.toFixed(0)}` : badge.progress}/{badge.id === "big-spender" ? `$${badge.target}` : badge.target}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function LoyaltyProgress({ totalSpent }: { totalSpent: number }) {
  const tiers = [
    { name: "Newcomer", min: 0, max: 100, color: "#64748b" },
    { name: "Explorer", min: 100, max: 300, color: "#21d8ff" },
    { name: "Researcher", min: 300, max: 750, color: "#9d4edd" },
    { name: "Scientist", min: 750, max: 1500, color: "#ec4899" },
    { name: "Elite", min: 1500, max: Infinity, color: "#E7FB10" },
  ];

  const currentTier = tiers.find(t => totalSpent >= t.min && totalSpent < t.max) || tiers[tiers.length - 1];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier 
    ? ((totalSpent - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;
  const toNextTier = nextTier ? nextTier.min - totalSpent : 0;
  
  const r = parseInt(currentTier.color.slice(1, 3), 16);
  const g = parseInt(currentTier.color.slice(3, 5), 16);
  const b = parseInt(currentTier.color.slice(5, 7), 16);

  return (
    <Card 
      className="border-opacity-30"
      style={{ 
        borderColor: `rgba(${r},${g},${b},0.3)`,
        background: `linear-gradient(135deg, rgba(${r},${g},${b},0.05) 0%, transparent 100%)`
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div 
            className="h-6 w-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `rgba(${r},${g},${b},0.15)` }}
          >
            <Award className="h-4 w-4" style={{ color: currentTier.color }} />
          </div>
          Loyalty Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg" style={{ color: currentTier.color }}>
            {currentTier.name}
          </span>
          {nextTier && (
            <span className="text-xs font-medium" style={{ color: nextTier.color }}>
              ${toNextTier.toFixed(0)} to {nextTier.name}
            </span>
          )}
        </div>
        <div className="mb-4">
          <div 
            className="h-3 rounded-full overflow-hidden bg-muted/30"
            style={{
              background: `linear-gradient(90deg, rgba(${r},${g},${b},0.15) 0%, transparent 100%)`
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${currentTier.color}, rgba(${r},${g},${b},0.4))`,
                boxShadow: `0 0 12px ${currentTier.color}`
              }}
            />
          </div>
          {nextTier && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {Math.round(progress)}% to {nextTier.name}
            </p>
          )}
        </div>
        <div className="flex justify-between gap-1.5 p-3 rounded-lg" style={{ background: `rgba(${r},${g},${b},0.05)` }}>
          {tiers.slice(0, 5).map((tier, i) => {
            const tierR = parseInt(tier.color.slice(1, 3), 16);
            const tierG = parseInt(tier.color.slice(3, 5), 16);
            const tierB = parseInt(tier.color.slice(5, 7), 16);
            const isAchieved = totalSpent >= tier.min;
            const isNext = nextTier && tier.name === nextTier.name;
            
            return (
              <Tooltip key={tier.name}>
                <TooltipTrigger>
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                      isAchieved ? 'scale-110' : isNext ? '' : 'opacity-30'
                    }`}
                    style={{ 
                      backgroundColor: isAchieved ? tier.color : isNext ? `rgba(${tierR},${tierG},${tierB},0.1)` : 'var(--muted)',
                      color: isAchieved ? '#000' : isNext ? tier.color : 'var(--muted-foreground)',
                      outline: isNext ? `2px solid ${tier.color}` : 'none',
                      boxShadow: isNext ? `0 0 16px ${tier.color}, inset 0 0 16px ${tier.color}50` : isAchieved ? `0 0 8px ${tier.color}` : 'none'
                    }}
                  >
                    {i + 1}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tier.name} (${tier.min}+)</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SavingsSummary({ orders, products }: { orders?: Order[]; products?: Product[] }) {
  const savings = useMemo(() => {
    if (!orders || !products) return { total: 0, deals: 0, bundles: 0 };
    
    let dealSavings = 0;
    orders.forEach(order => {
      const product = products.find(p => p.id === order.productId);
      if (product?.originalPrice && Number(product.originalPrice) > Number(product.price)) {
        dealSavings += (Number(product.originalPrice) - Number(product.price)) * order.quantity;
      }
    });

    return {
      total: dealSavings,
      deals: dealSavings,
      bundles: 0,
    };
  }, [orders, products]);

  if (savings.total === 0) return null;

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-green-500">
          <PiggyBank className="h-4 w-4" />
          You've Saved
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-500" data-testid="text-total-savings">
          ${savings.total.toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground">From deals and promotions</p>
      </CardContent>
    </Card>
  );
}

function QuickReorder({ orders, products }: { orders?: Order[]; products?: Product[] }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const recentProducts = useMemo(() => {
    if (!orders || !products) return [];
    const productCounts = new Map<string, number>();
    orders.forEach(o => {
      productCounts.set(o.productId, (productCounts.get(o.productId) || 0) + 1);
    });
    
    return Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([productId]) => products.find(p => p.id === productId))
      .filter(Boolean) as Product[];
  }, [orders, products]);

  const handleReorder = (product: Product) => {
    const dosage = product.dosageOptions?.[0];
    if (!dosage) {
      toast({
        title: "Cannot Add",
        description: "This product has no available dosage options.",
        variant: "destructive",
      });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      dosage,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (recentProducts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4 text-[#21d8ff]" />
          Quick Reorder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentProducts.map(product => {
          const hasDosage = product.dosageOptions && product.dosageOptions.length > 0;
          return (
            <div 
              key={product.id}
              className="flex items-center justify-between p-2 rounded-lg border hover-elevate"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleReorder(product)}
                disabled={!hasDosage}
                data-testid={`button-reorder-${product.id}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function RecommendedStacks({ orders, products }: { orders?: Order[]; products?: Product[] }) {
  const purchasedProductNames = useMemo(() => {
    if (!orders || !products) return new Set<string>();
    return new Set(
      orders.map(o => products.find(p => p.id === o.productId)?.name).filter(Boolean)
    );
  }, [orders, products]);

  const recommendations = useMemo(() => {
    return BUNDLES.filter(bundle => {
      const hasAny = bundle.products.some(p => purchasedProductNames.has(p));
      const hasAll = bundle.products.every(p => purchasedProductNames.has(p));
      return hasAny && !hasAll;
    }).slice(0, 2);
  }, [purchasedProductNames]);

  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Boxes className="h-4 w-4 text-[#9d4edd]" />
          Recommended Stacks
        </CardTitle>
        <CardDescription>Based on your research history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map(bundle => (
          <Link key={bundle.id} href={`/bundles/${bundle.id}`}>
            <div className="p-3 rounded-lg border hover-elevate cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{bundle.name}</span>
                <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500">
                  Save {bundle.savings}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{bundle.products.join(" + ")}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">${bundle.bundlePrice}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function WishlistWidget({ products }: { products?: Product[] }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const wishlistProducts = useMemo(() => {
    if (!products) return [];
    return wishlist.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [wishlist, products]);

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter(id => id !== productId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleAddToCart = (product: Product) => {
    const dosage = product.dosageOptions?.[0];
    if (!dosage) {
      toast({
        title: "Cannot Add",
        description: "This product has no available dosage options.",
        variant: "destructive",
      });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      dosage,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (wishlistProducts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-[#ec4899]" />
            Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground">No items saved yet</p>
            <Link href="/products">
              <Button variant="outline" size="sm" className="mt-2">
                Browse Products
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-[#ec4899]" />
            Wishlist
          </span>
          <Badge variant="secondary">{wishlistProducts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {wishlistProducts.slice(0, 3).map(product => {
          const hasDosage = product.dosageOptions && product.dosageOptions.length > 0;
          return (
            <div 
              key={product.id}
              className="flex items-center gap-2 p-2 rounded-lg border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
              </div>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-7 w-7"
                onClick={() => handleAddToCart(product)}
                disabled={!hasDosage}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => removeFromWishlist(product.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function MyCOAs({ orders, products }: { orders?: Order[]; products?: Product[] }) {
  const { data: coas } = useQuery<Coa[]>({
    queryKey: ["/api/coas"],
  });

  const myCoas = useMemo(() => {
    if (!orders || !coas) return [];
    const productIds = new Set(orders.map(o => o.productId));
    return coas.filter(coa => productIds.has(coa.productId)).slice(0, 3);
  }, [orders, coas]);

  if (myCoas.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileCheck className="h-4 w-4 text-[#21d8ff]" />
          My COAs
        </CardTitle>
        <CardDescription>Certificates for your products</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {myCoas.map(coa => (
          <Link key={coa.id} href={`/coa?batch=${coa.batchNumber}`}>
            <div className="flex items-center justify-between p-2 rounded-lg border hover-elevate cursor-pointer">
              <div>
                <p className="text-sm font-medium">{coa.productName}</p>
                <p className="text-xs text-muted-foreground">Batch: {coa.batchNumber}</p>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <Shield className="h-3 w-3" />
                <span className="text-xs">{coa.purity}</span>
              </div>
            </div>
          </Link>
        ))}
        <Link href="/coa">
          <Button variant="outline" size="sm" className="w-full mt-2">
            View All COAs
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function ResearchTimeline({ orders, products }: { orders?: Order[]; products?: Product[] }) {
  const timeline = useMemo(() => {
    if (!orders || !products) return [];
    return orders
      .filter(order => order.createdAt && order.status)
      .slice(0, 5)
      .map(order => {
        const parsedDate = new Date(order.createdAt!);
        const isValidDate = !isNaN(parsedDate.getTime());
        return {
          id: order.id,
          date: isValidDate ? parsedDate : new Date(),
          dateString: isValidDate ? parsedDate.toLocaleDateString() : "Recent",
          productName: products.find(p => p.id === order.productId)?.name || "Product",
          amount: Number(order.totalAmount) || 0,
          status: order.status || "pending",
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [orders, products]);

  if (timeline.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4 text-[#9d4edd]" />
          Research Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {timeline.map((event, i) => (
              <div key={event.id} className="relative pl-8">
                <div 
                  className="absolute left-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: event.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(33, 216, 255, 0.2)',
                    borderColor: event.status === 'delivered' ? '#22c55e' : '#21d8ff',
                    borderWidth: '2px',
                  }}
                >
                  {event.status === 'delivered' ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Package className="h-3 w-3 text-[#21d8ff]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{event.productName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{event.dateString}</span>
                    <span>•</span>
                    <span>${event.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ orders, products }: { orders?: Order[]; products?: Product[] }) {
  const activities = useMemo(() => {
    if (!orders) return [];
    
    const items = orders.slice(0, 8).map(order => ({
      id: order.id,
      type: 'order' as const,
      title: `Ordered ${products?.find(p => p.id === order.productId)?.name || 'Product'}`,
      date: new Date(order.createdAt || new Date()),
      icon: Package,
      color: '#21d8ff',
    }));

    return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [orders, products]);

  if (activities.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map(activity => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center gap-3">
                <div 
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: `${activity.color}20` }}
                >
                  <Icon className="h-3 w-3" style={{ color: activity.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ReviewableOrder | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my-orders"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: reviewableOrders, isLoading: reviewableLoading } = useQuery<ReviewableOrder[]>({
    queryKey: ["/api/reviews/my-reviewable-orders"],
    enabled: isAuthenticated,
  });

  const { data: affiliate } = useQuery<{ id: string } | null>({
    queryKey: ["/api/affiliate/me"],
    enabled: isAuthenticated,
    retry: false,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { orderId: string; rating: number; title: string; comment: string }) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setReviewDialogOpen(false);
      setSelectedOrder(null);
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/my-reviewable-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleWriteReview = (order: ReviewableOrder) => {
    setSelectedOrder(order);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedOrder) return;
    if (reviewComment.length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters in your review.",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate({
      orderId: selectedOrder.orderId,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
  };

  const eligibleForReview = reviewableOrders?.filter(
    (o) => !o.hasReviewed && new Date() >= new Date(o.eligibleDate)
  ) || [];

  const pendingReviews = reviewableOrders?.filter(
    (o) => !o.hasReviewed && new Date() < new Date(o.eligibleDate)
  ) || [];

  const getProductName = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalSpent = orders?.reduce((sum, o) => sum + Number(o.totalAmount), 0) || 0;

  if (authLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user?.profileImageUrl && (
                  <AvatarImage src={user.profileImageUrl} alt={user?.firstName || "User"} className="object-cover" />
                )}
                <AvatarFallback className="text-xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold holographic-text" data-testid="text-user-name">
                      Welcome{user?.firstName ? `, ${user.firstName}` : ""}
                    </h1>
                    {affiliate?.id && (
                      <div data-testid="badge-verified-affiliate" title="Verified Affiliate">
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle cx="12" cy="12" r="10" fill="#22c55e" />
                          <path d="M9 12.5l2.5 2.5 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <Link href="/account-settings">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="button-edit-profile">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                  </Link>
                </div>
                <p className="text-muted-foreground" data-testid="text-user-email">{user?.email}</p>
              </div>
            </div>
            <a href="/api/logout">
              <Button variant="outline" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-[#E7FB10]/30 bg-gradient-to-br from-[#E7FB10]/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <div className="h-8 w-8 rounded-full bg-[#E7FB10]/10 flex items-center justify-center">
                  <Package className="h-4 w-4 text-[#E7FB10]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#E7FB10]" data-testid="text-total-orders">
                  {ordersLoading ? "..." : orders?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time purchases
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#22c55e]/30 bg-gradient-to-br from-[#22c55e]/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <div className="h-8 w-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-[#22c55e]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#22c55e]" data-testid="text-total-spent">
                  ${ordersLoading ? "..." : totalSpent.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime value
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <div className="h-8 w-8 rounded-full bg-[#21d8ff]/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-[#21d8ff]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#21d8ff]">Active</div>
                <p className="text-xs text-muted-foreground">
                  Member since {formatDate(user?.createdAt || new Date())}
                </p>
              </CardContent>
            </Card>

            <SavingsSummary orders={orders} products={products} />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <CustomerAchievements orders={orders} totalSpent={totalSpent} />
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-[#9d4edd]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#9d4edd]/15 flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-[#9d4edd]" />
                        </div>
                        Order History
                      </CardTitle>
                      <CardDescription>View your past orders and track shipments</CardDescription>
                    </div>
                    <Link href="/products">
                      <Button size="sm" className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" data-testid="link-shop-more">
                        Shop More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order, idx) => {
                        const colors = ['#E7FB10', '#21d8ff', '#9d4edd', '#ec4899', '#f97316'];
                        const color = colors[idx % colors.length];
                        return (
                        <div
                          key={order.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover-elevate transition-colors"
                          style={{ borderColor: `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.2)` }}
                          data-testid={`order-item-${order.id}`}
                        >
                          <div 
                            className="h-12 w-12 rounded flex items-center justify-center"
                            style={{ backgroundColor: `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},0.1)` }}
                          >
                            <Package className="h-6 w-6" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate" data-testid={`text-order-product-${order.id}`}>
                              {getProductName(order.productId)}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(order.createdAt)}</span>
                              <span>Qty: {order.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold" data-testid={`text-order-amount-${order.id}`}>
                              ${Number(order.totalAmount).toFixed(2)}
                            </p>
                            <Badge variant={getStatusColor(order.status)} className="mt-1">
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status || "pending"}</span>
                            </Badge>
                          </div>
                        </div>
                        );
                      })}
                      {orders.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground">
                          Showing 5 of {orders.length} orders
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 mx-auto rounded-full bg-[#9d4edd]/10 flex items-center justify-center mb-4">
                        <ShoppingBag className="h-8 w-8 text-[#9d4edd]" />
                      </div>
                      <h3 className="font-medium mb-2">No orders yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start shopping to see your order history here.
                      </p>
                      <Link href="/products">
                        <Button className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" data-testid="button-start-shopping">
                          Browse Products
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-[#ec4899]/20">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#ec4899]/15 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-[#ec4899]" />
                        </div>
                        Product Reviews
                      </CardTitle>
                      <CardDescription>Share your experience with our products</CardDescription>
                    </div>
                    {eligibleForReview.length > 0 && (
                      <Badge variant="secondary" className="bg-[#ec4899]/10 text-[#ec4899] border border-[#ec4899]/30">
                        {eligibleForReview.length} to review
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {reviewableLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : eligibleForReview.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Only verified purchasers can leave reviews. You can review products 30 days after your order.
                      </p>
                      {eligibleForReview.map((order) => (
                        <div
                          key={order.orderId}
                          className="flex items-center gap-4 p-4 rounded-lg border hover-elevate transition-colors"
                          data-testid={`reviewable-order-${order.orderId}`}
                        >
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                            {order.productImageUrl ? (
                              <img 
                                src={order.productImageUrl} 
                                alt={order.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{order.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Ordered {formatDate(order.orderDate)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleWriteReview(order)}
                            data-testid={`button-write-review-${order.orderId}`}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Write Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : pendingReviews.length > 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium mb-2">Reviews Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">
                        You can leave reviews 30 days after your order. Check back on{" "}
                        {formatDate(pendingReviews[0]?.eligibleDate)}.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium mb-2">No Reviews Available</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete an order to leave a verified review 30 days later.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <LoyaltyProgress totalSpent={totalSpent} />
                <QuickReorder orders={orders} products={products} />
                <RecommendedStacks orders={orders} products={products} />
              </div>
              
              <WishlistWidget products={products} />
              <MyCOAs orders={orders} products={products} />

              <Card className="border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#21d8ff]/15 flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                      </div>
                      Quick Actions
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/coa" className="block">
                    <Button className="w-full bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90 h-9" data-testid="link-verify-coa">
                      <FileCheck className="h-4 w-4 mr-2" />
                      Verify Batch Number
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground text-center">Verify product authenticity with batch numbers</p>
                </CardContent>
              </Card>
              <motion.div variants={itemVariants} className="mb-0">
                <div 
                  className="rounded-lg p-4 overflow-hidden relative group"
                  style={{
                    background: 'linear-gradient(135deg, #21d8ff 0%, #21d8ff 25%, #9d4edd 50%, #ec4899 75%, #21d8ff 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 8s ease infinite',
                  }}
                >
                  <style>{`
                    @keyframes gradient-shift {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                  `}</style>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-0.5">
                          <TrendingUp className="h-4 w-4" />
                          Become an Affiliate
                        </h3>
                        <p className="text-white/90 text-xs">
                          Earn commissions by sharing Revive Research
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <ul className="space-y-1 text-xs text-white/90">
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#E7FB10] font-bold leading-none mt-0.5">✓</span>
                          <span>10% commission on direct sales</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#E7FB10] font-bold leading-none mt-0.5">✓</span>
                          <span>10% team override on recruits</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#E7FB10] font-bold leading-none mt-0.5">✓</span>
                          <span>20% private discount</span>
                        </li>
                      </ul>
                    </div>

                    <Link href="/affiliate">
                      <Button 
                        className="w-full font-semibold text-sm glow-yellow"
                        style={{
                          backgroundColor: '#E7FB10',
                          color: '#000',
                        }}
                        data-testid="button-affiliate-apply"
                      >
                        Apply to Our Program
                        <ArrowRight className="h-3 w-3 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedOrder?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    data-testid={`button-star-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= reviewRating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-title">Title (optional)</Label>
              <Input
                id="review-title"
                placeholder="Summarize your experience"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                data-testid="input-review-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Your Review</Label>
              <Textarea
                id="review-comment"
                placeholder="Tell us about your experience with this product..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                data-testid="input-review-comment"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters ({reviewComment.length}/10)
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitReviewMutation.isPending || reviewComment.length < 10}
              data-testid="button-submit-review"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
