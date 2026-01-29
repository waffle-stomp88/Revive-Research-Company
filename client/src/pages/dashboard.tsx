import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  FileCheck,
  User,
  ShoppingBag,
  ArrowRight,
  LogOut,
  Calendar,
  CheckCircle,
  BookOpen,
  GraduationCap,
  Clock,
  Truck,
  Star,
  MessageSquare,
  Trophy,
  Award,
  Zap,
  Crown,
  RefreshCw,
  Sparkles,
  Target,
  Shield,
  Bookmark,
  X,
  Plus,
  ChevronRight,
  History,
  Boxes,
  HelpCircle,
  Settings,
  Home,
  Heart,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type { Order, Product, ReviewableOrder, Coa, ResearchPhase, ResearchTitle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("general");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ReviewableOrder | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your dashboard.",
        variant: "destructive",
      });
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: reviewableOrders, isLoading: reviewableLoading } = useQuery<ReviewableOrder[]>({
    queryKey: ["/api/orders/reviewable"],
    enabled: isAuthenticated,
  });

  const { data: wishlist } = useQuery<{ productId: string }[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const { data: researchProfile } = useQuery<{
    phase: ResearchPhase;
    title: ResearchTitle;
    educationCount: number;
    batchVerificationCount: number;
    compoundsTrackedCount: number;
    verifiedReviewsCount: number;
    safetyCompleted: boolean;
    coaEducationViewed: boolean;
    earlyAccessMember: boolean;
  }>({
    queryKey: ["/api/user/research-profile"],
    enabled: isAuthenticated,
  });

  const { data: affiliate } = useQuery<{ id: string } | null>({
    queryKey: ["/api/affiliate/me"],
    enabled: isAuthenticated,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { orderId: string; productId: string; rating: number; title: string; comment: string }) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      setReviewDialogOpen(false);
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/orders/reviewable"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Removed", description: "Item removed from wishlist." });
    },
  });

  const handleWriteReview = (order: ReviewableOrder) => {
    setSelectedOrder(order);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedOrder || reviewComment.length < 10) return;
    submitReviewMutation.mutate({
      orderId: selectedOrder.orderId,
      productId: selectedOrder.productId,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
  };

  const wishlistProducts = useMemo(() => {
    if (!wishlist || !products) return [];
    return products.filter(p => wishlist.some(w => w.productId === p.id));
  }, [wishlist, products]);

  const eligibleForReview = reviewableOrders?.filter(
    (o) => !o.hasReviewed && new Date() >= new Date(o.eligibleDate)
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
  const orderCount = orders?.length || 0;
  const uniqueProducts = new Set(orders?.map(o => o.productId) || []).size;

  const badges: CustomerBadge[] = useMemo(() => [
    {
      id: "first-order",
      title: "Research Initiated",
      description: "Placed your first order",
      icon: Zap,
      color: "#E7FB10",
      earned: orderCount >= 1,
      progress: Math.min(orderCount, 1),
      target: 1,
    },
    {
      id: "repeat-customer",
      title: "Active Researcher",
      description: "Made 5+ orders",
      icon: RefreshCw,
      color: "#21d8ff",
      earned: orderCount >= 5,
      progress: Math.min(orderCount, 5),
      target: 5,
    },
    {
      id: "explorer",
      title: "Compound Literacy",
      description: "Explored 3+ different compounds",
      icon: Target,
      color: "#9d4edd",
      earned: uniqueProducts >= 3,
      progress: Math.min(uniqueProducts, 3),
      target: 3,
    },
    {
      id: "sustained",
      title: "Sustained Engagement",
      description: "Consistent research activity",
      icon: Crown,
      color: "#E7FB10",
      earned: orderCount >= 3 && uniqueProducts >= 2,
      progress: Math.min(orderCount, 3),
      target: 3,
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
      id: "early-access",
      title: "Early Access Member",
      description: "Joined during early access",
      icon: Trophy,
      color: "#f97316",
      earned: orderCount >= 1,
      progress: 1,
      target: 1,
    },
  ], [orderCount, uniqueProducts]);

  const handleAddToCart = (product: Product) => {
    const dosage = product.dosageOptions?.[0];
    if (!dosage) {
      toast({ title: "Cannot Add", description: "No dosage options available.", variant: "destructive" });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      dosage,
      image: product.imageUrl || undefined,
    });
    toast({ title: "Added to Cart", description: `${product.name} added to your cart.` });
  };

  if (authLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
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
    <>
      <SEOHead title="My Account" description="Manage your orders and account settings." canonicalPath="/dashboard" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Clean Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-[#21d8ff]/30 ring-offset-2 ring-offset-background">
                  {user?.profileImageUrl && (
                    <AvatarImage src={user.profileImageUrl} alt={user?.firstName || "User"} className="object-cover" />
                  )}
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-[#E7FB10]/20 to-[#21d8ff]/20">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold" data-testid="text-user-name">
                      {user?.firstName ? `${user.firstName}${user?.lastName ? ` ${user.lastName}` : ''}` : 'My Account'}
                    </h1>
                    {affiliate?.id && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="bg-green-500/10 border-green-500/40 text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Affiliate
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Verified Affiliate Partner</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-user-email">{user?.email}</p>
                </div>
              </div>
              <a href="/api/logout">
                <Button variant="outline" size="sm" data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </a>
            </motion.div>

            {/* 4-Tab Layout */}
            <motion.div variants={itemVariants}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="general" className="gap-2" data-testid="tab-general">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">General</span>
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="gap-2" data-testid="tab-orders">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline">Orders</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="gap-2" data-testid="tab-education">
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden sm:inline">Education</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#E7FB10]/10">
                          <ShoppingBag className="h-5 w-5 text-[#E7FB10]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-order-count">{orderCount}</p>
                          <p className="text-xs text-muted-foreground">Orders</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#21d8ff]/10">
                          <Package className="h-5 w-5 text-[#21d8ff]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-products-count">{uniqueProducts}</p>
                          <p className="text-xs text-muted-foreground">Products</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#9d4edd]/10">
                          <Award className="h-5 w-5 text-[#9d4edd]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-badges-count">{badges.filter(b => b.earned).length}</p>
                          <p className="text-xs text-muted-foreground">Badges</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Calendar className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold" data-testid="text-member-since">
                            {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
                          </p>
                          <p className="text-xs text-muted-foreground">Member Since</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Recent Orders Preview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <History className="h-4 w-4 text-[#21d8ff]" />
                          Recent Orders
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} data-testid="button-view-all-orders">
                          View All
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                        </div>
                      ) : orders && orders.length > 0 ? (
                        <div className="space-y-3">
                          {orders.slice(0, 3).map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`order-preview-${order.id}`}>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{getProductName(order.productId)}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">${Number(order.totalAmount).toFixed(2)}</p>
                                <Badge variant={getStatusColor(order.status)} className="text-xs">
                                  {order.status || "pending"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground mb-3">No orders yet</p>
                          <Link href="/products">
                            <Button size="sm" className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" data-testid="button-browse-products-orders">
                              Browse Products
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Wishlist */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Heart className="h-4 w-4 text-[#ec4899]" />
                        Wishlist
                        {wishlistProducts.length > 0 && (
                          <Badge variant="secondary" className="ml-2">{wishlistProducts.length}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {wishlistProducts.length > 0 ? (
                        <div className="space-y-2">
                          {wishlistProducts.slice(0, 3).map(product => (
                            <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border" data-testid={`wishlist-item-${product.id}`}>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                              </div>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAddToCart(product)} data-testid={`button-add-to-cart-${product.id}`}>
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => removeMutation.mutate(product.id)} data-testid={`button-remove-wishlist-${product.id}`}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {wishlistProducts.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              +{wishlistProducts.length - 3} more items
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">No items saved</p>
                          <Link href="/products">
                            <Button variant="outline" size="sm" data-testid="button-browse-products-wishlist">Browse Products</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Links */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/academy" data-testid="link-academy">
                      <Card className="p-4 hover-elevate cursor-pointer h-full">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-[#E7FB10]" />
                          <span className="font-medium text-sm">Academy</span>
                        </div>
                      </Card>
                    </Link>
                    <Link href="/coa" data-testid="link-coa">
                      <Card className="p-4 hover-elevate cursor-pointer h-full">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-5 w-5 text-[#21d8ff]" />
                          <span className="font-medium text-sm">Verify COA</span>
                        </div>
                      </Card>
                    </Link>
                    <Link href="/affiliate" data-testid="link-affiliate">
                      <Card className="p-4 hover-elevate cursor-pointer h-full">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-[#9d4edd]" />
                          <span className="font-medium text-sm">Affiliate</span>
                        </div>
                      </Card>
                    </Link>
                    <Link href="/contact" data-testid="link-support">
                      <Card className="p-4 hover-elevate cursor-pointer h-full">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-[#ec4899]" />
                          <span className="font-medium text-sm">Support</span>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-[#9d4edd]" />
                            Order History
                          </CardTitle>
                          <CardDescription>View and track your orders</CardDescription>
                        </div>
                        <Link href="/products">
                          <Button size="sm" className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" data-testid="button-shop-more">
                            Shop More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                      ) : orders && orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.map((order, idx) => {
                            const colors = ['#E7FB10', '#21d8ff', '#9d4edd', '#ec4899', '#f97316'];
                            const color = colors[idx % colors.length];
                            return (
                              <div key={order.id} className="flex items-center gap-4 p-4 rounded-lg border" data-testid={`order-item-${order.id}`}>
                                <div className="h-12 w-12 rounded flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                                  <Package className="h-6 w-6" style={{ color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{getProductName(order.productId)}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(order.createdAt)}</span>
                                    <span>•</span>
                                    <span>Qty: {order.quantity}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">${Number(order.totalAmount).toFixed(2)}</p>
                                  <Badge variant={getStatusColor(order.status)} className="mt-1">
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status || "pending"}</span>
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                          <h3 className="font-medium mb-2">No orders yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">Start shopping to see your order history</p>
                          <Link href="/products">
                            <Button className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" data-testid="button-browse-products-history">Browse Products</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Reviews Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-[#ec4899]" />
                            Product Reviews
                          </CardTitle>
                          <CardDescription>Share your experience</CardDescription>
                        </div>
                        {eligibleForReview.length > 0 && (
                          <Badge className="bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/30">
                            {eligibleForReview.length} to review
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {reviewableLoading ? (
                        <div className="space-y-3">
                          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                        </div>
                      ) : eligibleForReview.length > 0 ? (
                        <div className="space-y-3">
                          {eligibleForReview.map((order) => (
                            <div key={order.orderId} className="flex items-center gap-4 p-4 rounded-lg border" data-testid={`reviewable-${order.orderId}`}>
                              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                                {order.productImageUrl ? (
                                  <img src={order.productImageUrl} alt={order.productName} className="h-full w-full object-cover" />
                                ) : (
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{order.productName}</p>
                                <p className="text-sm text-muted-foreground">Ordered {formatDate(order.orderDate)}</p>
                              </div>
                              <Button size="sm" onClick={() => handleWriteReview(order)} data-testid={`button-review-${order.orderId}`}>
                                <Star className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Star className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">No reviews available yet</p>
                          <p className="text-xs text-muted-foreground mt-1">You can review products 30 days after your order</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6">
                  {/* Research Progress */}
                  {researchProfile && (
                    <Card className="border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 to-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-[#E7FB10]" />
                              Research Progress
                            </CardTitle>
                            <CardDescription>Your learning journey</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-[#E7FB10]/10 border-[#E7FB10]/40 text-[#E7FB10]">
                              {researchProfile.phase}
                            </Badge>
                            <Badge variant="outline" className="bg-[#21d8ff]/10 border-[#21d8ff]/40 text-[#21d8ff]">
                              {researchProfile.title}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-2xl font-bold text-[#E7FB10]">{researchProfile.educationCount}</div>
                            <div className="text-xs text-muted-foreground">Articles Read</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-2xl font-bold text-[#21d8ff]">{researchProfile.batchVerificationCount}</div>
                            <div className="text-xs text-muted-foreground">Batches Verified</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-2xl font-bold text-[#22c55e]">{researchProfile.compoundsTrackedCount}</div>
                            <div className="text-xs text-muted-foreground">Compounds Tracked</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/30">
                            <div className="text-2xl font-bold text-[#f97316]">{researchProfile.verifiedReviewsCount}</div>
                            <div className="text-xs text-muted-foreground">Reviews</div>
                          </div>
                        </div>

                        {/* Phase Progress */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Phase Progression</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {(["Observer", "Initiate", "Researcher", "Analyst", "Specialist"] as ResearchPhase[]).map((phase, idx) => {
                              const phaseOrder = ["Observer", "Initiate", "Researcher", "Analyst", "Specialist"];
                              const currentIdx = phaseOrder.indexOf(researchProfile.phase);
                              const isActive = idx <= currentIdx;
                              const isCurrent = phase === researchProfile.phase;
                              return (
                                <div key={phase} className="flex-1">
                                  <div className={`h-2 rounded-full transition-all ${isActive ? isCurrent ? "bg-[#E7FB10]" : "bg-[#E7FB10]/50" : "bg-muted"}`} />
                                  <div className={`text-xs mt-1 text-center ${isCurrent ? "text-[#E7FB10] font-medium" : "text-muted-foreground"}`}>
                                    {phase}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {researchProfile.earlyAccessMember && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/30">
                            <Sparkles className="h-4 w-4 text-[#9d4edd]" />
                            <span className="text-sm text-[#9d4edd]">Early Access Member</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Achievements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#f97316]" />
                        Achievements
                      </CardTitle>
                      <CardDescription>Badges earned through your research journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {badges.map((badge) => {
                          const Icon = badge.icon;
                          return (
                            <div
                              key={badge.id}
                              className={`p-4 rounded-lg border text-center transition-all ${badge.earned ? 'border-' + badge.color : 'opacity-50'}`}
                              style={badge.earned ? { borderColor: badge.color, backgroundColor: `${badge.color}10` } : undefined}
                              data-testid={`badge-${badge.id}`}
                            >
                              <Icon className="h-8 w-8 mx-auto mb-2" style={{ color: badge.earned ? badge.color : undefined }} />
                              <p className="font-medium text-sm">{badge.title}</p>
                              <p className="text-xs text-muted-foreground">{badge.description}</p>
                              {!badge.earned && badge.progress !== undefined && badge.target && (
                                <p className="text-xs text-muted-foreground mt-1">{badge.progress}/{badge.target}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/academy" data-testid="link-academy-education">
                      <Card className="p-5 hover-elevate cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#E7FB10]/10">
                              <GraduationCap className="h-5 w-5 text-[#E7FB10]" />
                            </div>
                            <div>
                              <p className="font-medium">Research Academy</p>
                              <p className="text-sm text-muted-foreground">Learn and earn XP</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Card>
                    </Link>
                    <Link href="/coa" data-testid="link-coa-education">
                      <Card className="p-5 hover-elevate cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#21d8ff]/10">
                              <FileCheck className="h-5 w-5 text-[#21d8ff]" />
                            </div>
                            <div>
                              <p className="font-medium">Verify COA</p>
                              <p className="text-sm text-muted-foreground">Check batch authenticity</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#21d8ff]" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="p-4 rounded-lg border">
                          <div className="text-sm text-muted-foreground mb-1">Name</div>
                          <div className="font-medium">
                            {user?.firstName || user?.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                              : 'Not set'}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border">
                          <div className="text-sm text-muted-foreground mb-1">Email</div>
                          <div className="font-medium">{user?.email || 'Not set'}</div>
                        </div>
                        <div className="p-4 rounded-lg border">
                          <div className="text-sm text-muted-foreground mb-1">Member Since</div>
                          <div className="font-medium">{formatDate(user?.createdAt || new Date())}</div>
                        </div>
                      </div>
                      <Link href="/account-settings">
                        <Button className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" data-testid="button-account-settings">
                          Edit Profile
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Affiliate Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#9d4edd]" />
                        Affiliate Program
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {affiliate?.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-green-500 font-medium">Active Affiliate</span>
                          </div>
                          <Link href="/affiliate/dashboard">
                            <Button variant="outline" className="w-full" data-testid="button-affiliate-dashboard">
                              View Dashboard
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Join our affiliate program and earn commissions on referrals.
                          </p>
                          <Link href="/affiliate">
                            <Button variant="outline" className="w-full" data-testid="button-join-affiliate">
                              Learn More
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-red-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button 
                        variant="outline" 
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                        onClick={() => setDeleteDialogOpen(true)}
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Review Dialog */}
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
                    className="p-1 md:hover:scale-110 transition-transform"
                    data-testid={`button-star-${star}`}
                  >
                    <Star className={`h-8 w-8 ${star <= reviewRating ? "fill-[#E7FB10] text-[#E7FB10]" : "text-muted-foreground"}`} />
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
                placeholder="Tell us about your experience..."
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
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} data-testid="button-cancel-review">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitReviewMutation.isPending || reviewComment.length < 10}
              className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
              data-testid="button-submit-review"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data including orders, reviews, and preferences will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Link href="/account-settings">
              <Button variant="destructive" data-testid="button-confirm-delete">
                Continue to Delete
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
