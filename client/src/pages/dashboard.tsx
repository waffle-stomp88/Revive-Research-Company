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
  Diamond,
  Gem,
  Rocket,
  FlaskConical,
  Edit3,
  Pin,
  StickyNote,
  Download,
  MapPin,
  Bell,
  Lock,
  Monitor,
  Smartphone,
  Mail,
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
  const [addressEditDialogOpen, setAddressEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<{
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{id: string; title: string; content: string} | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

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

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<Array<{
    id: string;
    paypalSubscriptionId: string;
    status: string;
    frequency: string;
    productId: string;
    createdAt: string;
    nextBillingDate: string | null;
  }>>({
    queryKey: ["/api/user/subscriptions"],
    enabled: isAuthenticated,
  });

  const { data: researchNotes, isLoading: notesLoading } = useQuery<Array<{
    id: string;
    title: string;
    content: string;
    productId: string | null;
    tags: string[] | null;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
  }>>({
    queryKey: ["/api/research-notes"],
    enabled: isAuthenticated,
  });

  const { data: batchHistory } = useQuery<Array<{
    id: string;
    batchNumber: string;
    productName: string | null;
    verifiedAt: string;
  }>>({
    queryKey: ["/api/batch-verification-history"],
    enabled: isAuthenticated,
  });

  const { data: savedAddresses, isLoading: addressesLoading } = useQuery<Array<{
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>>({
    queryKey: ["/api/addresses"],
    enabled: isAuthenticated,
  });

  const { data: notificationPrefs, isLoading: prefsLoading } = useQuery<{
    id: string;
    emailOrderConfirmation: boolean | null;
    emailShippingUpdates: boolean | null;
    emailPromotions: boolean | null;
    emailNewsletter: boolean | null;
    emailAcademyUpdates: boolean | null;
    emailStockAlerts: boolean | null;
    smsOrderUpdates: boolean | null;
    smsPromotions: boolean | null;
  }>({
    queryKey: ["/api/notification-preferences"],
    enabled: isAuthenticated,
  });

  const { data: loginHistory, isLoading: loginHistoryLoading } = useQuery<Array<{
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    loginAt: string;
  }>>({
    queryKey: ["/api/login-history"],
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

  const createNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      return apiRequest("POST", "/api/research-notes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-notes"] });
      toast({ title: "Note Created", description: "Your research note has been saved." });
      setNoteDialogOpen(false);
      setNoteTitle("");
      setNoteContent("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create note. Please try again.", variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; content: string }) => {
      return apiRequest("PATCH", `/api/research-notes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-notes"] });
      toast({ title: "Note Updated", description: "Your changes have been saved." });
      setNoteDialogOpen(false);
      setEditingNote(null);
      setNoteTitle("");
      setNoteContent("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update note. Please try again.", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/research-notes/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-notes"] });
      toast({ title: "Note Deleted", description: "Your note has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete note. Please try again.", variant: "destructive" });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/research-notes/${id}/toggle-pin`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-notes"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to toggle pin. Please try again.", variant: "destructive" });
    },
  });

  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (data: Partial<{emailOrderConfirmation: boolean; emailShippingUpdates: boolean; emailPromotions: boolean; emailNewsletter: boolean; emailAcademyUpdates: boolean; emailStockAlerts: boolean; smsOrderUpdates: boolean; smsPromotions: boolean}>) => {
      return apiRequest("PATCH", "/api/notification-preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({ title: "Preferences Updated", description: "Your notification settings have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update preferences. Please try again.", variant: "destructive" });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/addresses/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Address Deleted", description: "Your address has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete address. Please try again.", variant: "destructive" });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/addresses/${id}/default`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Default Address Set", description: "Your default address has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to set default address. Please try again.", variant: "destructive" });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: { id: string; label: string; firstName: string; lastName: string; street: string; city: string; state: string; zipCode: string; country: string }) => {
      return apiRequest("PATCH", `/api/addresses/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Address Updated", description: "Your address has been updated." });
      setAddressEditDialogOpen(false);
      setEditingAddress(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update address. Please try again.", variant: "destructive" });
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

  const handleReorder = (order: Order) => {
    const product = products?.find(p => p.id === order.productId);
    if (!product) {
      toast({ title: "Cannot Reorder", description: "Product no longer available.", variant: "destructive" });
      return;
    }
    const dosage = product.dosageOptions?.[0];
    if (!dosage) {
      toast({ title: "Cannot Reorder", description: "No dosage options available.", variant: "destructive" });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: order.quantity,
      dosage,
      image: product.imageUrl || undefined,
    });
    toast({ title: "Added to Cart", description: `${product.name} added to your cart for reorder.` });
  };

  const getOrderNumber = (orderId: string) => {
    return `#${orderId.slice(-8).toUpperCase()}`;
  };

  const getStatusStep = (status: string | null) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const idx = steps.indexOf(status || 'pending');
    return idx >= 0 ? idx : 0;
  };

  const handleOpenNoteDialog = (note?: { id: string; title: string; content: string }) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteTitle("");
      setNoteContent("");
    }
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, title: noteTitle, content: noteContent });
    } else {
      createNoteMutation.mutate({ title: noteTitle, content: noteContent });
    }
  };

  const sortedNotes = researchNotes?.slice().sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }) || [];

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
            {/* Stylish Header with Gradient Accent */}
            <motion.div variants={itemVariants} className="relative mb-8">
              {/* Decorative gradient line */}
              <div className="absolute -top-4 left-0 right-0 h-1 bg-gradient-to-r from-[#E7FB10] via-[#21d8ff] to-[#9d4edd] rounded-full opacity-60" />
              
              <div className="flex items-center justify-between gap-4 pt-4 pb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className={`h-16 w-16 ring-2 ring-offset-2 ring-offset-background shadow-lg ${affiliate?.id ? 'ring-[#9d4edd]/70 shadow-[#9d4edd]/30' : 'ring-[#21d8ff]/50 shadow-[#21d8ff]/20'}`}>
                      {user?.profileImageUrl && (
                        <AvatarImage src={user.profileImageUrl} alt={user?.firstName || "User"} className="object-cover" />
                      )}
                      <AvatarFallback className={`text-xl font-bold ${affiliate?.id ? 'bg-gradient-to-br from-[#9d4edd]/30 to-[#ec4899]/30' : 'bg-gradient-to-br from-[#E7FB10]/30 to-[#21d8ff]/30'}`}>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Affiliate diamond or member sparkle indicator */}
                    {affiliate?.id ? (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-br from-[#9d4edd] to-[#ec4899] rounded-full border-2 border-background flex items-center justify-center diamond-sparkle">
                        <Diamond className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    {/* Holographic Welcome Greeting */}
                    <h1 className="text-2xl font-bold holographic-text" data-testid="text-user-name">
                      Welcome, {user?.firstName ? `${user.firstName}${user?.lastName ? ` ${user.lastName}` : ''}` : 'Guest'}!
                    </h1>
                    
                    {/* Status Badges Row */}
                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                      {/* Early Access Badge - based on join date before 2026 */}
                      {user?.createdAt && new Date(user.createdAt) < new Date('2026-02-01') && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-[#E7FB10]/15 border-[#E7FB10]/50 text-[#E7FB10] badge-glow-yellow text-xs px-2 py-0.5">
                              <Rocket className="h-3 w-3 mr-1" />
                              Early Access
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>Joined during Early Access phase</TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Affiliate Partner Badge */}
                      {affiliate?.id && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-[#9d4edd]/15 border-[#9d4edd]/50 text-[#9d4edd] badge-glow-purple text-xs px-2 py-0.5">
                              <Diamond className="h-3 w-3 mr-1" />
                              Affiliate Partner
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>Verified affiliate earning commissions</TooltipContent>
                        </Tooltip>
                      )}
                      
                      {/* Verified Researcher Badge - based on education progress */}
                      {researchProfile && researchProfile.phase !== 'Observer' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-[#21d8ff]/15 border-[#21d8ff]/50 text-[#21d8ff] badge-glow-cyan text-xs px-2 py-0.5">
                              <FlaskConical className="h-3 w-3 mr-1" />
                              {researchProfile.phase}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>Research phase: {researchProfile.phase}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1" data-testid="text-user-email">{user?.email}</p>
                  </div>
                </div>
                <a href="/api/logout">
                  <Button variant="outline" size="sm" className="border-white/20 hover:border-[#21d8ff]/50 transition-colors" data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </a>
              </div>
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
                  {/* Quick Stats - Glassmorphism Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="relative overflow-hidden p-4 bg-gradient-to-br from-[#E7FB10]/5 to-transparent border-[#E7FB10]/20 hover:border-[#E7FB10]/40 transition-all duration-300 group">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#E7FB10]/10 rounded-full blur-2xl group-hover:bg-[#E7FB10]/20 transition-colors" />
                      <div className="relative flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#E7FB10]/15 shadow-lg shadow-[#E7FB10]/10">
                          <ShoppingBag className="h-5 w-5 text-[#E7FB10]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#E7FB10]" data-testid="text-order-count">{orderCount}</p>
                          <p className="text-xs text-muted-foreground">Orders</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="relative overflow-hidden p-4 bg-gradient-to-br from-[#21d8ff]/5 to-transparent border-[#21d8ff]/20 hover:border-[#21d8ff]/40 transition-all duration-300 group">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#21d8ff]/10 rounded-full blur-2xl group-hover:bg-[#21d8ff]/20 transition-colors" />
                      <div className="relative flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#21d8ff]/15 shadow-lg shadow-[#21d8ff]/10">
                          <Package className="h-5 w-5 text-[#21d8ff]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#21d8ff]" data-testid="text-products-count">{uniqueProducts}</p>
                          <p className="text-xs text-muted-foreground">Products</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="relative overflow-hidden p-4 bg-gradient-to-br from-[#9d4edd]/5 to-transparent border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-all duration-300 group">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#9d4edd]/10 rounded-full blur-2xl group-hover:bg-[#9d4edd]/20 transition-colors" />
                      <div className="relative flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#9d4edd]/15 shadow-lg shadow-[#9d4edd]/10">
                          <Award className="h-5 w-5 text-[#9d4edd]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#9d4edd]" data-testid="text-badges-count">{badges.filter(b => b.earned).length}</p>
                          <p className="text-xs text-muted-foreground">Badges</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="relative overflow-hidden p-4 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors" />
                      <div className="relative flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-green-500/15 shadow-lg shadow-green-500/10">
                          <Calendar className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-400" data-testid="text-member-since">
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
                            <Button size="sm" className="bg-[#E7FB10] text-black" data-testid="button-browse-products-orders">
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
                              <Button size="icon" variant="ghost" onClick={() => handleAddToCart(product)} data-testid={`button-add-to-cart-${product.id}`}>
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-muted-foreground" onClick={() => removeMutation.mutate(product.id)} data-testid={`button-remove-wishlist-${product.id}`}>
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

                  {/* Achievements Trophy Case */}
                  <Card className="border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="p-1.5 rounded-lg bg-[#f97316]/20">
                            <Trophy className="h-4 w-4 text-[#f97316]" />
                          </div>
                          Achievements
                        </CardTitle>
                        <Badge variant="outline" className="bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316] text-xs">
                          {(() => {
                            let count = 0;
                            if (orders && orders.length > 0) count++; // First Order
                            if (orders && orders.length >= 5) count++; // Loyal Customer
                            if (researchProfile && researchProfile.educationCount >= 3) count++; // Academy Scholar
                            if (researchProfile && researchProfile.batchVerificationCount > 0) count++; // COA Verified
                            if (affiliate?.id) count++; // Affiliate Achievement
                            return count;
                          })()}/5 Unlocked
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {/* First Order Achievement */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex flex-col items-center p-3 rounded-xl border transition-all ${orders && orders.length > 0 ? 'bg-[#E7FB10]/10 border-[#E7FB10]/40 badge-glow-yellow' : 'bg-muted/30 border-muted/20 opacity-40'}`} data-testid="achievement-first-order">
                              <div className={`p-2 rounded-full mb-1 ${orders && orders.length > 0 ? 'bg-[#E7FB10]/20' : 'bg-muted/30'}`}>
                                <ShoppingBag className={`h-5 w-5 ${orders && orders.length > 0 ? 'text-[#E7FB10]' : 'text-muted-foreground'}`} />
                              </div>
                              <span className="text-[10px] text-center font-medium">First Order</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{orders && orders.length > 0 ? 'You made your first purchase!' : 'Make your first purchase to unlock'}</TooltipContent>
                        </Tooltip>

                        {/* Loyal Customer Achievement */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex flex-col items-center p-3 rounded-xl border transition-all ${orders && orders.length >= 5 ? 'bg-[#21d8ff]/10 border-[#21d8ff]/40 badge-glow-cyan' : 'bg-muted/30 border-muted/20 opacity-40'}`} data-testid="achievement-loyal">
                              <div className={`p-2 rounded-full mb-1 ${orders && orders.length >= 5 ? 'bg-[#21d8ff]/20' : 'bg-muted/30'}`}>
                                <Crown className={`h-5 w-5 ${orders && orders.length >= 5 ? 'text-[#21d8ff]' : 'text-muted-foreground'}`} />
                              </div>
                              <span className="text-[10px] text-center font-medium">Loyal</span>
                              {orders && orders.length < 5 && <span className="text-[8px] text-muted-foreground">{orders?.length || 0}/5</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{orders && orders.length >= 5 ? 'Loyal customer with 5+ orders!' : `Complete 5 orders to unlock (${orders?.length || 0}/5)`}</TooltipContent>
                        </Tooltip>

                        {/* Academy Scholar Achievement */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex flex-col items-center p-3 rounded-xl border transition-all ${researchProfile && researchProfile.educationCount >= 3 ? 'bg-[#9d4edd]/10 border-[#9d4edd]/40 badge-glow-purple' : 'bg-muted/30 border-muted/20 opacity-40'}`} data-testid="achievement-scholar">
                              <div className={`p-2 rounded-full mb-1 ${researchProfile && researchProfile.educationCount >= 3 ? 'bg-[#9d4edd]/20' : 'bg-muted/30'}`}>
                                <GraduationCap className={`h-5 w-5 ${researchProfile && researchProfile.educationCount >= 3 ? 'text-[#9d4edd]' : 'text-muted-foreground'}`} />
                              </div>
                              <span className="text-[10px] text-center font-medium">Scholar</span>
                              {researchProfile && researchProfile.educationCount < 3 && <span className="text-[8px] text-muted-foreground">{researchProfile?.educationCount || 0}/3</span>}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{researchProfile && researchProfile.educationCount >= 3 ? 'Academy scholar - completed 3+ lessons!' : `Complete 3 lessons in Academy (${researchProfile?.educationCount || 0}/3)`}</TooltipContent>
                        </Tooltip>

                        {/* COA Verified Achievement */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex flex-col items-center p-3 rounded-xl border transition-all ${researchProfile && researchProfile.batchVerificationCount > 0 ? 'bg-[#ec4899]/10 border-[#ec4899]/40 badge-glow-pink' : 'bg-muted/30 border-muted/20 opacity-40'}`} data-testid="achievement-coa">
                              <div className={`p-2 rounded-full mb-1 ${researchProfile && researchProfile.batchVerificationCount > 0 ? 'bg-[#ec4899]/20' : 'bg-muted/30'}`}>
                                <FileCheck className={`h-5 w-5 ${researchProfile && researchProfile.batchVerificationCount > 0 ? 'text-[#ec4899]' : 'text-muted-foreground'}`} />
                              </div>
                              <span className="text-[10px] text-center font-medium">Verified</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{researchProfile && researchProfile.batchVerificationCount > 0 ? 'Verified a batch COA!' : 'Verify your first batch COA to unlock'}</TooltipContent>
                        </Tooltip>

                        {/* Affiliate Achievement */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex flex-col items-center p-3 rounded-xl border transition-all ${affiliate?.id ? 'bg-green-500/10 border-green-500/40 badge-glow-green' : 'bg-muted/30 border-muted/20 opacity-40'}`} data-testid="achievement-affiliate">
                              <div className={`p-2 rounded-full mb-1 ${affiliate?.id ? 'bg-green-500/20' : 'bg-muted/30'}`}>
                                <Diamond className={`h-5 w-5 ${affiliate?.id ? 'text-green-500' : 'text-muted-foreground'}`} />
                              </div>
                              <span className="text-[10px] text-center font-medium">Partner</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{affiliate?.id ? 'Affiliate Partner!' : 'Join the affiliate program to unlock'}</TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Links - Animated Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/academy" data-testid="link-academy">
                      <Card className="relative overflow-hidden p-4 cursor-pointer h-full border-[#E7FB10]/20 hover:border-[#E7FB10]/50 bg-gradient-to-br from-[#E7FB10]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E7FB10]/0 via-[#E7FB10]/5 to-[#E7FB10]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="relative flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#E7FB10]/15 group-hover:shadow-lg group-hover:shadow-[#E7FB10]/20 transition-shadow">
                            <GraduationCap className="h-5 w-5 text-[#E7FB10]" />
                          </div>
                          <span className="font-medium text-sm group-hover:text-[#E7FB10] transition-colors">Academy</span>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 text-[#E7FB10] transition-opacity" />
                        </div>
                      </Card>
                    </Link>
                    <Link href="/coa" data-testid="link-coa">
                      <Card className="relative overflow-hidden p-4 cursor-pointer h-full border-[#21d8ff]/20 hover:border-[#21d8ff]/50 bg-gradient-to-br from-[#21d8ff]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#21d8ff]/0 via-[#21d8ff]/5 to-[#21d8ff]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="relative flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#21d8ff]/15 group-hover:shadow-lg group-hover:shadow-[#21d8ff]/20 transition-shadow">
                            <FileCheck className="h-5 w-5 text-[#21d8ff]" />
                          </div>
                          <span className="font-medium text-sm group-hover:text-[#21d8ff] transition-colors">Verify COA</span>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 text-[#21d8ff] transition-opacity" />
                        </div>
                      </Card>
                    </Link>
                    <Link href="/affiliate" data-testid="link-affiliate">
                      <Card className="relative overflow-hidden p-4 cursor-pointer h-full border-[#9d4edd]/20 hover:border-[#9d4edd]/50 bg-gradient-to-br from-[#9d4edd]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#9d4edd]/0 via-[#9d4edd]/5 to-[#9d4edd]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="relative flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#9d4edd]/15 group-hover:shadow-lg group-hover:shadow-[#9d4edd]/20 transition-shadow">
                            <Award className="h-5 w-5 text-[#9d4edd]" />
                          </div>
                          <span className="font-medium text-sm group-hover:text-[#9d4edd] transition-colors">Affiliate</span>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 text-[#9d4edd] transition-opacity" />
                        </div>
                      </Card>
                    </Link>
                    <Link href="/contact" data-testid="link-support">
                      <Card className="relative overflow-hidden p-4 cursor-pointer h-full border-[#ec4899]/20 hover:border-[#ec4899]/50 bg-gradient-to-br from-[#ec4899]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ec4899]/0 via-[#ec4899]/5 to-[#ec4899]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="relative flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/15 group-hover:shadow-lg group-hover:shadow-[#ec4899]/20 transition-shadow">
                            <MessageSquare className="h-5 w-5 text-[#ec4899]" />
                          </div>
                          <span className="font-medium text-sm group-hover:text-[#ec4899] transition-colors">Support</span>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 text-[#ec4899] transition-opacity" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                  {/* Subscriptions Section */}
                  {subscriptions && subscriptions.length > 0 && (
                    <Card className="border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <RefreshCw className="h-5 w-5 text-[#21d8ff]" />
                              Active Subscriptions
                            </CardTitle>
                            <CardDescription>Manage your recurring orders</CardDescription>
                          </div>
                          <Badge className="bg-[#21d8ff]/10 text-[#21d8ff] border-[#21d8ff]/30">
                            {subscriptions.filter(s => s.status === 'active').length} active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {subscriptions.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-4 p-4 rounded-lg border border-[#21d8ff]/20 bg-[#21d8ff]/5" data-testid={`subscription-${sub.id}`}>
                            <div className="h-10 w-10 rounded-full bg-[#21d8ff]/20 flex items-center justify-center">
                              <RefreshCw className="h-5 w-5 text-[#21d8ff]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{getProductName(sub.productId)}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="capitalize">{sub.frequency}</span>
                                {sub.nextBillingDate && (
                                  <>
                                    <span>•</span>
                                    <span>Next: {formatDate(sub.nextBillingDate)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge className={sub.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-muted text-muted-foreground'}>
                              {sub.status}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Order History */}
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
                          <Button size="sm" className="bg-[#E7FB10] text-black" data-testid="button-shop-more">
                            Shop More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                      ) : orders && orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.map((order, idx) => {
                            const colors = ['#E7FB10', '#21d8ff', '#9d4edd', '#ec4899', '#f97316'];
                            const color = colors[idx % colors.length];
                            const statusStep = getStatusStep(order.status);
                            return (
                              <div key={order.id} className="p-4 rounded-lg border" data-testid={`order-item-${order.id}`}>
                                {/* Order Header */}
                                <div className="flex items-start gap-4 mb-3">
                                  <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                                    <Package className="h-6 w-6" style={{ color }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium truncate">{getProductName(order.productId)}</p>
                                      <span className="text-xs text-muted-foreground font-mono">{getOrderNumber(order.id)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(order.createdAt)}</span>
                                      <span>•</span>
                                      <span>Qty: {order.quantity}</span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-semibold text-lg">${Number(order.totalAmount).toFixed(2)}</p>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="text-[#21d8ff]"
                                      onClick={() => handleReorder(order)}
                                      data-testid={`button-reorder-${order.id}`}
                                    >
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                      Reorder
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Status Timeline */}
                                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                                  {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                                    const isComplete = i <= statusStep;
                                    const isCurrent = i === statusStep;
                                    return (
                                      <div key={step} className="flex-1 flex items-center gap-1">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${isComplete ? 'bg-green-500' : 'bg-muted'} ${isCurrent ? 'ring-2 ring-green-500/30' : ''}`} />
                                        <div className={`flex-1 h-0.5 ${i < 3 ? (i < statusStep ? 'bg-green-500' : 'bg-muted') : 'hidden'}`} />
                                        <span className={`text-[10px] hidden sm:block ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`}>{step}</span>
                                      </div>
                                    );
                                  })}
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
                            <Button className="bg-[#E7FB10] text-black" data-testid="button-browse-products-history">Browse Products</Button>
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

                  {/* Research Notes */}
                  <Card className="border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <StickyNote className="h-5 w-5 text-[#9d4edd]" />
                            Research Notes
                          </CardTitle>
                          <CardDescription>Personal journal for your research observations</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => handleOpenNoteDialog()} data-testid="button-add-note">
                          <Plus className="h-4 w-4 mr-1" />
                          New Note
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {notesLoading ? (
                        <div className="space-y-3">
                          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                      ) : sortedNotes.length > 0 ? (
                        <div className="space-y-3">
                          {sortedNotes.slice(0, 5).map((note) => (
                            <div key={note.id} className="p-4 rounded-lg border border-[#9d4edd]/20 bg-[#9d4edd]/5 group" data-testid={`note-${note.id}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {note.isPinned && <Pin className="h-3 w-3 text-[#9d4edd]" />}
                                    <p className="font-medium truncate">{note.title}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{note.content}</p>
                                  <p className="text-xs text-muted-foreground mt-2">{formatDate(note.updatedAt)}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    disabled={togglePinMutation.isPending}
                                    onClick={() => togglePinMutation.mutate(note.id)}
                                    data-testid={`button-pin-${note.id}`}
                                  >
                                    <Pin className={`h-4 w-4 ${note.isPinned ? 'text-[#9d4edd]' : ''}`} />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleOpenNoteDialog({ id: note.id, title: note.title, content: note.content })}
                                    data-testid={`button-edit-${note.id}`}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="text-red-500"
                                    disabled={deleteNoteMutation.isPending}
                                    onClick={() => deleteNoteMutation.mutate(note.id)}
                                    data-testid={`button-delete-${note.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {sortedNotes.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center">+{sortedNotes.length - 5} more notes</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <StickyNote className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground mb-3">No research notes yet</p>
                          <Button size="sm" variant="outline" onClick={() => handleOpenNoteDialog()} data-testid="button-add-first-note">
                            <Plus className="h-4 w-4 mr-1" />
                            Create Your First Note
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Batch Verification History */}
                  <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-[#21d8ff]" />
                            Batch Verification History
                          </CardTitle>
                          <CardDescription>Track your verified COA batches</CardDescription>
                        </div>
                        <Link href="/coa">
                          <Button size="sm" variant="outline" className="border-[#21d8ff]/40" data-testid="button-verify-new">
                            <FileCheck className="h-4 w-4 mr-1" />
                            Verify New
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {batchHistory && batchHistory.length > 0 ? (
                        <div className="space-y-2">
                          {batchHistory.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#21d8ff]/20 bg-[#21d8ff]/5" data-testid={`batch-${item.id}`}>
                              <div className="h-8 w-8 rounded-full bg-[#21d8ff]/20 flex items-center justify-center shrink-0">
                                <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-sm font-medium">{item.batchNumber}</p>
                                {item.productName && <p className="text-xs text-muted-foreground truncate">{item.productName}</p>}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{formatDate(item.verifiedAt)}</span>
                              </div>
                            </div>
                          ))}
                          {batchHistory.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">+{batchHistory.length - 5} more verifications</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground mb-3">No batch verifications yet</p>
                          <Link href="/coa">
                            <Button size="sm" className="bg-[#21d8ff] text-black" data-testid="button-verify-first">
                              Verify Your First Batch
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

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
                      <Card className="relative overflow-hidden p-5 cursor-pointer border-[#E7FB10]/30 hover:border-[#E7FB10]/60 bg-gradient-to-r from-[#E7FB10]/10 via-[#E7FB10]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E7FB10]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-[#E7FB10]/20 shadow-lg shadow-[#E7FB10]/10 group-hover:shadow-[#E7FB10]/30 transition-shadow">
                              <GraduationCap className="h-6 w-6 text-[#E7FB10]" />
                            </div>
                            <div>
                              <p className="font-semibold group-hover:text-[#E7FB10] transition-colors">Research Academy</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3 text-[#E7FB10]" />
                                Learn and earn XP
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#E7FB10] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Card>
                    </Link>
                    <Link href="/coa" data-testid="link-coa-education">
                      <Card className="relative overflow-hidden p-5 cursor-pointer border-[#21d8ff]/30 hover:border-[#21d8ff]/60 bg-gradient-to-r from-[#21d8ff]/10 via-[#21d8ff]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#21d8ff]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-[#21d8ff]/20 shadow-lg shadow-[#21d8ff]/10 group-hover:shadow-[#21d8ff]/30 transition-shadow">
                              <FileCheck className="h-6 w-6 text-[#21d8ff]" />
                            </div>
                            <div>
                              <p className="font-semibold group-hover:text-[#21d8ff] transition-colors">Verify COA</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Shield className="h-3 w-3 text-[#21d8ff]" />
                                Check batch authenticity
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#21d8ff] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#21d8ff]/20">
                          <User className="h-5 w-5 text-[#21d8ff]" />
                        </div>
                        <span>Profile Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <User className="h-3 w-3" />
                            Name
                          </div>
                          <div className="font-medium">
                            {user?.firstName || user?.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                              : 'Not set'}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Email
                          </div>
                          <div className="font-medium">{user?.email || 'Not set'}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Member Since
                          </div>
                          <div className="font-medium">{formatDate(user?.createdAt || new Date())}</div>
                        </div>
                      </div>
                      <Link href="/account-settings">
                        <Button className="w-full bg-[#E7FB10] text-black" data-testid="button-account-settings">
                          Edit Profile
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Saved Addresses */}
                  <Card className="border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 via-transparent to-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-[#E7FB10]/20">
                            <MapPin className="h-5 w-5 text-[#E7FB10]" />
                          </div>
                          <span>Saved Addresses</span>
                        </CardTitle>
                        <Link href="/account-settings#addresses">
                          <Button size="sm" variant="outline" className="border-[#E7FB10]/40" data-testid="button-add-address">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {addressesLoading ? (
                        <div className="space-y-2">
                          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                      ) : savedAddresses && savedAddresses.length > 0 ? (
                        <div className="space-y-3">
                          {savedAddresses.slice(0, 3).map((addr) => (
                            <div key={addr.id} className="p-4 rounded-lg border border-[#E7FB10]/20 bg-[#E7FB10]/5 flex items-start justify-between gap-3 group" data-testid={`address-${addr.id}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{addr.label || "Address"}</p>
                                  {addr.isDefault && (
                                    <Badge className="bg-[#E7FB10]/10 text-[#E7FB10] border-[#E7FB10]/30 text-xs">Default</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {addr.firstName} {addr.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!addr.isDefault && (
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    disabled={setDefaultAddressMutation.isPending}
                                    onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                                    data-testid={`button-set-default-${addr.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setEditingAddress({
                                      id: addr.id,
                                      label: addr.label,
                                      firstName: addr.firstName,
                                      lastName: addr.lastName,
                                      street: addr.street,
                                      city: addr.city,
                                      state: addr.state,
                                      zipCode: addr.zipCode,
                                      country: addr.country,
                                    });
                                    setAddressEditDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-address-${addr.id}`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="text-red-500"
                                  disabled={deleteAddressMutation.isPending}
                                  onClick={() => deleteAddressMutation.mutate(addr.id)}
                                  data-testid={`button-delete-address-${addr.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {savedAddresses.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">+{savedAddresses.length - 3} more addresses</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <MapPin className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">No saved addresses</p>
                          <Link href="/account-settings#addresses">
                            <Button size="sm" variant="outline" data-testid="button-add-first-address">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Address
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notification Preferences */}
                  <Card className="border-[#ec4899]/20 bg-gradient-to-br from-[#ec4899]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#ec4899]/20">
                          <Bell className="h-5 w-5 text-[#ec4899]" />
                        </div>
                        <span>Notification Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {prefsLoading ? (
                        <div className="space-y-3">
                          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                      ) : notificationPrefs ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Order Updates</p>
                                <p className="text-xs text-muted-foreground">Shipping and delivery notifications</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.emailShippingUpdates ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ emailShippingUpdates: !notificationPrefs.emailShippingUpdates })}
                              data-testid="toggle-order-updates"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.emailShippingUpdates ? "On" : "Off"}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Promotions</p>
                                <p className="text-xs text-muted-foreground">Deals and special offers</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.emailPromotions ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ emailPromotions: !notificationPrefs.emailPromotions })}
                              data-testid="toggle-promotions"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.emailPromotions ? "On" : "Off"}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Newsletter</p>
                                <p className="text-xs text-muted-foreground">Research updates and news</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.emailNewsletter ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ emailNewsletter: !notificationPrefs.emailNewsletter })}
                              data-testid="toggle-newsletter"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.emailNewsletter ? "On" : "Off"}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">SMS Alerts</p>
                                <p className="text-xs text-muted-foreground">Text message notifications</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant={notificationPrefs.smsOrderUpdates ? "default" : "outline"}
                              disabled={updateNotificationPrefsMutation.isPending}
                              onClick={() => updateNotificationPrefsMutation.mutate({ smsOrderUpdates: !notificationPrefs.smsOrderUpdates })}
                              data-testid="toggle-sms"
                            >
                              {updateNotificationPrefsMutation.isPending ? "..." : notificationPrefs.smsOrderUpdates ? "On" : "Off"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">Loading preferences...</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Security & Login Activity */}
                  <Card className="border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#f97316]/20">
                          <Lock className="h-5 w-5 text-[#f97316]" />
                        </div>
                        <span>Security & Login Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Account Security</p>
                              <p className="text-xs text-muted-foreground">Your account is protected</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Secure</Badge>
                        </div>
                        
                        <div className="p-3 rounded-lg border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Password & Account</p>
                              <p className="text-xs text-muted-foreground">Managed securely by Auth0</p>
                            </div>
                          </div>
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Auth0</Badge>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Recent Login Activity
                          </p>
                          {loginHistoryLoading ? (
                            <div className="space-y-2">
                              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                          ) : loginHistory && loginHistory.length > 0 ? (
                            <div className="space-y-2">
                              {loginHistory.slice(0, 5).map((login, idx) => (
                                <div key={login.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 text-sm" data-testid={`login-${login.id}`}>
                                  <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate text-xs text-muted-foreground">
                                      {login.userAgent?.split(' ').slice(0, 3).join(' ') || 'Unknown device'}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(login.loginAt)}</span>
                                  {idx === 0 && <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">Current</Badge>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No login history available</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Affiliate Status */}
                  <Card className="border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 via-transparent to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#9d4edd]/20">
                          <Award className="h-5 w-5 text-[#9d4edd]" />
                        </div>
                        <span>Affiliate Program</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {affiliate?.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/40">
                            <div className="p-2 rounded-full bg-green-500/20">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <span className="text-green-400 font-semibold">Active Affiliate</span>
                              <p className="text-xs text-muted-foreground">Earning commissions on referrals</p>
                            </div>
                          </div>
                          <Link href="/affiliate/dashboard">
                            <Button variant="outline" className="w-full border-[#9d4edd]/40" data-testid="button-affiliate-dashboard">
                              View Dashboard
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl border border-[#9d4edd]/20 bg-[#9d4edd]/5">
                            <p className="text-sm text-muted-foreground flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-[#9d4edd] shrink-0 mt-0.5" />
                              Join our affiliate program and earn commissions on referrals. Get 10% on every sale!
                            </p>
                          </div>
                          <Link href="/affiliate">
                            <Button className="w-full bg-gradient-to-r from-[#9d4edd] to-[#9d4edd]/80 hover:from-[#9d4edd]/90 hover:to-[#9d4edd]/70 text-white" data-testid="button-join-affiliate">
                              Join Now
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
              className="bg-[#E7FB10] text-black"
              data-testid="button-submit-review"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={(open) => {
        setNoteDialogOpen(open);
        if (!open) {
          setEditingNote(null);
          setNoteTitle("");
          setNoteContent("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Note" : "New Research Note"}</DialogTitle>
            <DialogDescription>
              Record your research observations and insights
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="Note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                data-testid="input-note-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                placeholder="Write your observations..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
                data-testid="input-note-content"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)} data-testid="button-cancel-note">
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={createNoteMutation.isPending || updateNoteMutation.isPending || !noteTitle.trim() || !noteContent.trim()}
              data-testid="button-save-note"
            >
              {(createNoteMutation.isPending || updateNoteMutation.isPending) ? "Saving..." : editingNote ? "Update" : "Create"}
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


      {/* Address Edit Dialog */}
      <Dialog open={addressEditDialogOpen} onOpenChange={(open) => {
        setAddressEditDialogOpen(open);
        if (!open) setEditingAddress(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your address details.
            </DialogDescription>
          </DialogHeader>
          {editingAddress && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <Input 
                  value={editingAddress.label} 
                  onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                  placeholder="e.g., Home, Work"
                  data-testid="input-address-label"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    value={editingAddress.firstName} 
                    onChange={(e) => setEditingAddress({ ...editingAddress, firstName: e.target.value })}
                    data-testid="input-address-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    value={editingAddress.lastName} 
                    onChange={(e) => setEditingAddress({ ...editingAddress, lastName: e.target.value })}
                    data-testid="input-address-lastname"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <Input 
                  value={editingAddress.street} 
                  onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                  data-testid="input-address-street"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={editingAddress.city} 
                    onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                    data-testid="input-address-city"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input 
                    value={editingAddress.state} 
                    onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                    data-testid="input-address-state"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ZIP Code</label>
                  <Input 
                    value={editingAddress.zipCode} 
                    onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })}
                    data-testid="input-address-zipcode"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input 
                    value={editingAddress.country} 
                    onChange={(e) => setEditingAddress({ ...editingAddress, country: e.target.value })}
                    data-testid="input-address-country"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddressEditDialogOpen(false)} data-testid="button-cancel-address-edit">
              Cancel
            </Button>
            <Button
              onClick={() => editingAddress && updateAddressMutation.mutate(editingAddress)}
              disabled={updateAddressMutation.isPending || !editingAddress?.firstName || !editingAddress?.lastName || !editingAddress?.street || !editingAddress?.city || !editingAddress?.state || !editingAddress?.zipCode}
              data-testid="button-save-address"
            >
              {updateAddressMutation.isPending ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
