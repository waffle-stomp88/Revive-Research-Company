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
  Brain,
  Copy,
} from "lucide-react";
import type { Order, Product, Coa, ResearchPhase, ResearchTitle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CompoundFinder } from "@/components/compound-finder";

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
  const [viewOrderDetails, setViewOrderDetails] = useState<Order | null>(null);
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
    queryKey: ["/api/orders/my-orders"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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

  const { data: graduateReward } = useQuery<{
    isGraduate: boolean;
    completedCount: number;
    totalLessons: number;
    discountCode: string | null;
    discountPercent: number;
    alreadyClaimed: boolean;
  }>({
    queryKey: ["/api/academy/graduate-reward"],
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

  const claimGraduateRewardMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/academy/claim-graduate-reward");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/academy/graduate-reward"] });
      toast({ title: "Reward Claimed", description: "Your 15% discount code has been generated. Use it at checkout!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not claim your reward. Please try again.", variant: "destructive" });
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


  const wishlistProducts = useMemo(() => {
    if (!wishlist || !products) return [];
    return products.filter(p => wishlist.some(w => w.productId === p.id));
  }, [wishlist, products]);

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

  const getStatusStep = (order: any) => {
    const fulfillment = order.fulfillmentStatus || 'pending';
    if (fulfillment === 'delivered') return 3;
    if (order.trackingNumber || fulfillment === 'ready') return 2;
    if (fulfillment === 'preparing') return 1;
    if (order.status === 'paid') return 0;
    return 0;
  };

  const getCarrierTrackingUrl = (carrier: string, trackingNumber: string) => {
    const c = carrier.toLowerCase();
    if (c.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    return `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`;
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
      <SEOHead title="My Dashboard" description="Manage your orders and account settings." canonicalPath="/dashboard" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative overflow-hidden">
        {/* Ambient Background Gradients for Welcoming Feel */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top left cyan glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#21d8ff]/8 rounded-full blur-[120px]" />
          {/* Top right yellow glow */}
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-[#E7FB10]/6 rounded-full blur-[100px]" />
          {/* Middle left purple glow */}
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#9d4edd]/8 rounded-full blur-[100px]" />
          {/* Bottom right cyan/teal glow */}
          <div className="absolute bottom-20 -right-32 w-96 h-96 bg-[#21d8ff]/6 rounded-full blur-[120px]" />
          {/* Center subtle warm glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E7FB10]/3 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
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
                    {/* Holographic Welcome Greeting with Time-Based Message */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h1 className="font-display text-2xl md:text-3xl font-bold holographic-text" data-testid="text-user-name">
                        {(() => {
                          const hour = new Date().getHours();
                          const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
                          return `${greeting}, ${user?.firstName || 'Guest'}!`;
                        })()}
                      </h1>
                      {/* Verified checkmark like affiliate dashboard */}
                      {user?.id && (
                        <div data-testid="badge-verified-member" title="Verified Member">
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#21d8ff" />
                            <path d="M9 12.5l2.5 2.5 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
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
                      
                      {/* Research Phase Badge */}
                      {researchProfile && (
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
                      
                      {/* Research Title Badge */}
                      {researchProfile?.title && researchProfile.title !== 'Getting Started' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge className="bg-green-500/15 border-green-500/50 text-green-400 text-xs px-2 py-0.5">
                              <Award className="h-3 w-3 mr-1" />
                              {researchProfile.title}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>Earned title: {researchProfile.title}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1.5" data-testid="text-user-email">{user?.email}</p>
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

                  {/* Two Column: Quick Navigation + Achievements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Quick Navigation - Left Column (Vertical Stack) */}
                    <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 via-transparent to-transparent">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="p-1.5 rounded-lg bg-[#21d8ff]/20">
                            <Rocket className="h-4 w-4 text-[#21d8ff]" />
                          </div>
                          Quick Navigation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {/* Orders Link */}
                          <div 
                            className="flex items-center gap-3 p-3 rounded-xl border border-[#E7FB10]/30 bg-[#E7FB10]/5 cursor-pointer hover-elevate transition-all"
                            onClick={() => setActiveTab("orders")}
                            data-testid="nav-orders"
                          >
                            <div className="p-2 rounded-full bg-[#E7FB10]/20">
                              <ShoppingBag className="h-5 w-5 text-[#E7FB10]" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">My Orders</p>
                              <p className="text-xs text-muted-foreground">{orders?.length || 0} order{orders?.length !== 1 ? 's' : ''} • View history & track</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[#E7FB10]" />
                          </div>
                          
                          {/* Academy Link */}
                          <Link href="/academy" data-testid="nav-academy">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#9d4edd]/30 bg-[#9d4edd]/5 cursor-pointer hover-elevate transition-all">
                              <div className="p-2 rounded-full bg-[#9d4edd]/20">
                                <GraduationCap className="h-5 w-5 text-[#9d4edd]" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Research Academy</p>
                                <p className="text-xs text-muted-foreground">Learn & earn XP badges</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-[#9d4edd]" />
                            </div>
                          </Link>
                          
                          {/* Verify COA Link */}
                          <Link href="/coa/verify-certificate-of-analysis" data-testid="nav-coa">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#21d8ff]/30 bg-[#21d8ff]/5 cursor-pointer hover-elevate transition-all">
                              <div className="p-2 rounded-full bg-[#21d8ff]/20">
                                <FileCheck className="h-5 w-5 text-[#21d8ff]" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Verify COA</p>
                                <p className="text-xs text-muted-foreground">Check batch authenticity</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-[#21d8ff]" />
                            </div>
                          </Link>
                          
                          {/* Products Link */}
                          <Link href="/products" data-testid="nav-products">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-green-500/30 bg-green-500/5 cursor-pointer hover-elevate transition-all">
                              <div className="p-2 rounded-full bg-green-500/20">
                                <FlaskConical className="h-5 w-5 text-green-500" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Browse Products</p>
                                <p className="text-xs text-muted-foreground">Explore our catalog</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-green-500" />
                            </div>
                          </Link>
                          
                          {/* Support Link */}
                          <Link href="/contact" data-testid="nav-support">
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#ec4899]/30 bg-[#ec4899]/5 cursor-pointer hover-elevate transition-all">
                              <div className="p-2 rounded-full bg-[#ec4899]/20">
                                <MessageSquare className="h-5 w-5 text-[#ec4899]" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Support</p>
                                <p className="text-xs text-muted-foreground">Get help & contact us</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-[#ec4899]" />
                            </div>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievements - Right Column (Vertical Stack) */}
                    <Card className="border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <div className="p-1.5 rounded-lg bg-[#f97316]/20">
                              <Trophy className="h-4 w-4 text-[#f97316]" />
                            </div>
                            Achievements
                          </CardTitle>
                          <Badge variant="outline" className="bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316] text-xs">
                            {(() => {
                              let count = 0;
                              if (orders && orders.length > 0) count++;
                              if (orders && orders.length >= 5) count++;
                              if (researchProfile && researchProfile.educationCount >= 3) count++;
                              if (researchProfile && researchProfile.batchVerificationCount > 0) count++;
                              if (affiliate?.id) count++;
                              return count;
                            })()}/5 Unlocked
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {/* First Order Achievement */}
                          <div 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${orders && orders.length > 0 ? 'bg-[#E7FB10]/10 border-[#E7FB10]/40' : 'bg-muted/30 border-muted/20 opacity-50'}`}
                            data-testid="achievement-first-order"
                          >
                            <motion.div 
                              className={`p-2 rounded-full ${orders && orders.length > 0 ? 'bg-[#E7FB10]/20' : 'bg-muted/30'}`}
                              animate={orders && orders.length > 0 ? { 
                                scale: [1, 1.15, 1],
                                boxShadow: ['0 0 0px rgba(231, 251, 16, 0)', '0 0 15px rgba(231, 251, 16, 0.6)', '0 0 0px rgba(231, 251, 16, 0)']
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <ShoppingBag className={`h-5 w-5 ${orders && orders.length > 0 ? 'text-[#E7FB10]' : 'text-muted-foreground'}`} />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm">First Order</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px]">
                                    <p className="text-xs">Complete your first purchase to unlock this achievement</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-xs text-muted-foreground">{orders && orders.length > 0 ? 'Unlocked!' : 'Make your first purchase'}</p>
                            </div>
                            {orders && orders.length > 0 && <CheckCircle className="h-4 w-4 text-[#E7FB10]" />}
                          </div>

                          {/* Loyal Customer Achievement */}
                          <div 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${orders && orders.length >= 5 ? 'bg-[#21d8ff]/10 border-[#21d8ff]/40' : 'bg-muted/30 border-muted/20 opacity-50'}`}
                            data-testid="achievement-loyal"
                          >
                            <motion.div 
                              className={`p-2 rounded-full ${orders && orders.length >= 5 ? 'bg-[#21d8ff]/20' : 'bg-muted/30'}`}
                              animate={orders && orders.length >= 5 ? { 
                                scale: [1, 1.15, 1],
                                boxShadow: ['0 0 0px rgba(33, 216, 255, 0)', '0 0 15px rgba(33, 216, 255, 0.6)', '0 0 0px rgba(33, 216, 255, 0)']
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                            >
                              <Crown className={`h-5 w-5 ${orders && orders.length >= 5 ? 'text-[#21d8ff]' : 'text-muted-foreground'}`} />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm">Loyal Customer</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px]">
                                    <p className="text-xs">Complete 5 orders to become a loyal customer</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-xs text-muted-foreground">{orders && orders.length >= 5 ? 'Unlocked!' : `${orders?.length || 0}/5 orders`}</p>
                            </div>
                            {orders && orders.length >= 5 && <CheckCircle className="h-4 w-4 text-[#21d8ff]" />}
                          </div>

                          {/* Academy Scholar Achievement */}
                          <div 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${researchProfile && researchProfile.educationCount >= 3 ? 'bg-[#9d4edd]/10 border-[#9d4edd]/40' : 'bg-muted/30 border-muted/20 opacity-50'}`}
                            data-testid="achievement-scholar"
                          >
                            <motion.div 
                              className={`p-2 rounded-full ${researchProfile && researchProfile.educationCount >= 3 ? 'bg-[#9d4edd]/20' : 'bg-muted/30'}`}
                              animate={researchProfile && researchProfile.educationCount >= 3 ? { 
                                scale: [1, 1.15, 1],
                                boxShadow: ['0 0 0px rgba(157, 78, 221, 0)', '0 0 15px rgba(157, 78, 221, 0.6)', '0 0 0px rgba(157, 78, 221, 0)']
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                            >
                              <GraduationCap className={`h-5 w-5 ${researchProfile && researchProfile.educationCount >= 3 ? 'text-[#9d4edd]' : 'text-muted-foreground'}`} />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm">Academy Scholar</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px]">
                                    <p className="text-xs">Read 3 education articles in the Academy to unlock</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-xs text-muted-foreground">{researchProfile && researchProfile.educationCount >= 3 ? 'Unlocked!' : `${researchProfile?.educationCount || 0}/3 articles`}</p>
                            </div>
                            {researchProfile && researchProfile.educationCount >= 3 && <CheckCircle className="h-4 w-4 text-[#9d4edd]" />}
                          </div>

                          {/* COA Verified Achievement */}
                          <div 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${researchProfile && researchProfile.batchVerificationCount > 0 ? 'bg-green-500/10 border-green-500/40' : 'bg-muted/30 border-muted/20 opacity-50'}`}
                            data-testid="achievement-coa"
                          >
                            <motion.div 
                              className={`p-2 rounded-full ${researchProfile && researchProfile.batchVerificationCount > 0 ? 'bg-green-500/20' : 'bg-muted/30'}`}
                              animate={researchProfile && researchProfile.batchVerificationCount > 0 ? { 
                                scale: [1, 1.15, 1],
                                boxShadow: ['0 0 0px rgba(34, 197, 94, 0)', '0 0 15px rgba(34, 197, 94, 0.6)', '0 0 0px rgba(34, 197, 94, 0)']
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                            >
                              <FileCheck className={`h-5 w-5 ${researchProfile && researchProfile.batchVerificationCount > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm">COA Verified</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px]">
                                    <p className="text-xs">Verify a batch Certificate of Analysis to unlock</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-xs text-muted-foreground">{researchProfile && researchProfile.batchVerificationCount > 0 ? 'Unlocked!' : 'Verify a batch COA'}</p>
                            </div>
                            {researchProfile && researchProfile.batchVerificationCount > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>

                          {/* Affiliate Achievement */}
                          <div 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${affiliate?.id ? 'bg-[#ec4899]/10 border-[#ec4899]/40' : 'bg-muted/30 border-muted/20 opacity-50'}`}
                            data-testid="achievement-affiliate"
                          >
                            <motion.div 
                              className={`p-2 rounded-full ${affiliate?.id ? 'bg-[#ec4899]/20' : 'bg-muted/30'}`}
                              animate={affiliate?.id ? { 
                                scale: [1, 1.15, 1],
                                boxShadow: ['0 0 0px rgba(236, 72, 153, 0)', '0 0 15px rgba(236, 72, 153, 0.6)', '0 0 0px rgba(236, 72, 153, 0)']
                              } : {}}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                            >
                              <Diamond className={`h-5 w-5 ${affiliate?.id ? 'text-[#ec4899]' : 'text-muted-foreground'}`} />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm">Affiliate Partner</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[200px]">
                                    <p className="text-xs">Apply and get approved for the affiliate program to unlock</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-xs text-muted-foreground">{affiliate?.id ? 'Unlocked!' : 'Join the affiliate program'}</p>
                            </div>
                            {affiliate?.id && <CheckCircle className="h-4 w-4 text-[#ec4899]" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Member Benefits Card */}
                  <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="p-1.5 rounded-lg bg-[#21d8ff]/20">
                          <Gem className="h-4 w-4 text-[#21d8ff]" />
                        </div>
                        Your Benefits
                      </CardTitle>
                      <CardDescription className="text-xs">Real value you've earned as a member</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Registered Member Benefits - Always unlocked */}
                        <div>
                          <p className="text-xs font-medium text-[#21d8ff] mb-2 flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3" />
                            MEMBER BENEFITS
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#21d8ff]/20 bg-[#21d8ff]/5">
                              <ShoppingBag className="h-3.5 w-3.5 text-[#21d8ff] shrink-0" />
                              <span className="text-xs">Order history & tracking</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#21d8ff]/20 bg-[#21d8ff]/5">
                              <Bookmark className="h-3.5 w-3.5 text-[#21d8ff] shrink-0" />
                              <span className="text-xs">Saved stacks & wishlist</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#21d8ff]/20 bg-[#21d8ff]/5">
                              <FlaskConical className="h-3.5 w-3.5 text-[#21d8ff] shrink-0" />
                              <span className="text-xs">Research phase progression</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#21d8ff]/20 bg-[#21d8ff]/5">
                              <Target className="h-3.5 w-3.5 text-[#21d8ff] shrink-0" />
                              <span className="text-xs">Compound Finder tool</span>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Perk */}
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-green-500/30 bg-green-500/5">
                          <div className="p-2 rounded-full bg-green-500/20">
                            <Truck className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Free Shipping</p>
                            <p className="text-xs text-muted-foreground">On all orders over $200</p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>

                        {/* Academy Graduate Reward */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                          graduateReward?.isGraduate
                            ? 'border-[#E7FB10]/40 bg-[#E7FB10]/10'
                            : 'border-muted/20 bg-muted/5'
                        }`}>
                          <div className={`p-2 rounded-full ${graduateReward?.isGraduate ? 'bg-[#E7FB10]/20' : 'bg-muted/20'}`}>
                            <GraduationCap className={`h-4 w-4 ${graduateReward?.isGraduate ? 'text-[#E7FB10]' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Academy Graduate Reward</p>
                            <p className="text-xs text-muted-foreground">
                              {graduateReward?.discountCode
                                ? <>Your code: <span className="font-mono font-semibold text-[#E7FB10] select-text">{graduateReward.discountCode}</span> ({graduateReward.discountPercent}% off)</>
                                : graduateReward?.isGraduate
                                  ? 'You earned it — claim your 15% discount below'
                                  : `Complete all ${graduateReward?.totalLessons || 17} Academy lessons to earn 15% off (${graduateReward?.completedCount || 0}/${graduateReward?.totalLessons || 17})`}
                            </p>
                          </div>
                          {graduateReward?.discountCode ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              data-testid="button-copy-grad-code"
                              onClick={() => {
                                navigator.clipboard.writeText(graduateReward.discountCode!);
                                toast({ title: "Copied", description: "Discount code copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4 text-[#E7FB10]" />
                            </Button>
                          ) : graduateReward?.isGraduate ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs shrink-0 border-[#E7FB10]/40 text-[#E7FB10]"
                              onClick={() => claimGraduateRewardMutation.mutate()}
                              disabled={claimGraduateRewardMutation.isPending}
                              data-testid="button-claim-graduate-reward"
                            >
                              {claimGraduateRewardMutation.isPending ? "Claiming..." : "Claim"}
                            </Button>
                          ) : (
                            <Link href="/academy">
                              <Button variant="ghost" size="sm" className="text-xs shrink-0" data-testid="button-go-academy">
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>

                        {/* Loyalty: Early Access */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                          (orders?.length || 0) >= 5
                            ? 'border-[#E7FB10]/40 bg-[#E7FB10]/10'
                            : 'border-muted/20 bg-muted/5'
                        }`}>
                          <div className={`p-2 rounded-full ${(orders?.length || 0) >= 5 ? 'bg-[#E7FB10]/20' : 'bg-muted/20'}`}>
                            <Rocket className={`h-4 w-4 ${(orders?.length || 0) >= 5 ? 'text-[#E7FB10]' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Early Access to New Launches</p>
                            <p className="text-xs text-muted-foreground">
                              {(orders?.length || 0) >= 5
                                ? 'Unlocked — you get first access to new compounds'
                                : `Place ${Math.max(0, 5 - (orders?.length || 0))} more order${Math.max(0, 5 - (orders?.length || 0)) === 1 ? '' : 's'} to unlock`}
                            </p>
                          </div>
                          {(orders?.length || 0) >= 5 && <CheckCircle className="h-4 w-4 text-[#E7FB10]" />}
                        </div>

                        {/* Affiliate Program */}
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                          affiliate?.id
                            ? 'border-[#9d4edd]/40 bg-[#9d4edd]/10'
                            : 'border-muted/20 bg-muted/5'
                        }`}>
                          <div className={`p-2 rounded-full ${affiliate?.id ? 'bg-[#9d4edd]/20' : 'bg-muted/20'}`}>
                            <Diamond className={`h-4 w-4 ${affiliate?.id ? 'text-[#9d4edd]' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Affiliate Earnings</p>
                            <p className="text-xs text-muted-foreground">
                              {affiliate?.id
                                ? 'Earn 10% on every referral'
                                : 'Apply to earn 10% commission on referrals'}
                            </p>
                          </div>
                          {affiliate?.id ? (
                            <CheckCircle className="h-4 w-4 text-[#9d4edd]" />
                          ) : (
                            <Link href="/affiliate">
                              <Button variant="ghost" size="sm" className="text-xs shrink-0" data-testid="button-apply-affiliate">
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compound Finder */}
                  <CompoundFinder
                    products={products || []}
                    onAddToCart={(product) => {
                      const defaultDosage = product.dosageOptions?.[0] || "";
                      addToCart({
                        productId: product.id,
                        name: product.name,
                        price: Number(product.price),
                        quantity: 1,
                        dosage: defaultDosage,
                        image: product.imageUrl || undefined,
                      });
                      toast({ title: "Added to Cart", description: `${product.name} has been added to your cart.` });
                    }}
                  />

                  {/* Join Affiliate Program CTA - Only show if not already an affiliate */}
                  {!affiliate?.id && (
                    <Card className="relative overflow-hidden border-[#9d4edd]/30 bg-gradient-to-r from-[#9d4edd]/10 via-[#ec4899]/5 to-transparent">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-[#9d4edd]/20 rounded-full blur-3xl" />
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-[#9d4edd]/30 to-[#ec4899]/20 shadow-lg">
                            <Diamond className="h-7 w-7 text-[#9d4edd]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">Become an Affiliate Partner</h3>
                            <p className="text-sm text-muted-foreground">Earn 10% commission on every referral. Share your unique code and build passive income.</p>
                          </div>
                          <Link href="/affiliate">
                            <Button className="bg-[#9d4edd] text-white shrink-0" data-testid="button-join-affiliate">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Apply Now
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
                            const statusStep = getStatusStep(order);
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

                                {order.trackingNumber && order.carrier && (
                                  <div className="p-3 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20 mb-3" data-testid={`tracking-info-${order.id}`}>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-[#21d8ff]" />
                                        <span className="text-sm font-medium">{order.carrier}</span>
                                        <span className="text-sm font-mono text-muted-foreground">{order.trackingNumber}</span>
                                      </div>
                                      <a 
                                        href={getCarrierTrackingUrl(order.carrier, order.trackingNumber)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        data-testid={`link-track-package-${order.id}`}
                                      >
                                        <Button size="sm" variant="outline" className="text-[#21d8ff] border-[#21d8ff]/30">
                                          Track Package
                                        </Button>
                                      </a>
                                    </div>
                                  </div>
                                )}
                                
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
                        <div className="grid grid-cols-3 gap-4">
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

                  {/* Two Column: Batch Verification + Achievements */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Batch Verification History - Left Column */}
                    <Card className="border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <History className="h-5 w-5 text-[#21d8ff]" />
                              Batch Verification
                            </CardTitle>
                            <CardDescription>Your verified COA batches</CardDescription>
                          </div>
                          <Link href="/coa/verify-certificate-of-analysis">
                            <Button size="sm" variant="outline" className="border-[#21d8ff]/40" data-testid="button-verify-new">
                              <FileCheck className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {batchHistory && batchHistory.length > 0 ? (
                          <div className="space-y-2">
                            {batchHistory.slice(0, 4).map((item) => (
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
                                </div>
                              </div>
                            ))}
                            {batchHistory.length > 4 && (
                              <p className="text-xs text-muted-foreground text-center pt-2">+{batchHistory.length - 4} more</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <FileCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground mb-3">No verifications yet</p>
                            <Link href="/coa/verify-certificate-of-analysis">
                              <Button size="sm" className="bg-[#21d8ff] text-black" data-testid="button-verify-first">
                                Verify First Batch
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Achievements - Right Column (Vertical Stack with Animations) */}
                    <Card className="border-[#f97316]/20 bg-gradient-to-br from-[#f97316]/5 via-transparent to-transparent">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <div className="p-1.5 rounded-lg bg-[#f97316]/20">
                              <Trophy className="h-4 w-4 text-[#f97316]" />
                            </div>
                            Research Badges
                          </CardTitle>
                          <Badge variant="outline" className="bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316] text-xs">
                            {badges.filter(b => b.earned).length}/{badges.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {badges.slice(0, 5).map((badge, index) => {
                            const Icon = badge.icon;
                            const hexToRgb = (hex: string) => {
                              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                              return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
                            };
                            return (
                              <div 
                                key={badge.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${badge.earned ? '' : 'opacity-50'}`}
                                style={badge.earned ? { borderColor: `${badge.color}66`, backgroundColor: `${badge.color}15` } : undefined}
                                data-testid={`badge-education-${badge.id}`}
                              >
                                <motion.div 
                                  className="p-2 rounded-full" 
                                  style={badge.earned ? { backgroundColor: `${badge.color}25` } : { backgroundColor: 'hsl(var(--muted)/0.3)' }}
                                  animate={badge.earned ? { 
                                    scale: [1, 1.15, 1],
                                    boxShadow: [`0 0 0px rgba(${hexToRgb(badge.color)}, 0)`, `0 0 15px rgba(${hexToRgb(badge.color)}, 0.6)`, `0 0 0px rgba(${hexToRgb(badge.color)}, 0)`]
                                  } : {}}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                                >
                                  <Icon className="h-5 w-5" style={{ color: badge.earned ? badge.color : 'hsl(var(--muted-foreground))' }} />
                                </motion.div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-medium text-sm">{badge.title}</p>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[200px]">
                                        <p className="text-xs">{badge.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {badge.earned ? 'Unlocked!' : badge.progress !== undefined && badge.target ? `${badge.progress}/${badge.target}` : badge.description}
                                  </p>
                                </div>
                                {badge.earned && <CheckCircle className="h-4 w-4" style={{ color: badge.color }} />}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

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
                    <Link href="/coa/verify-certificate-of-analysis" data-testid="link-coa-education">
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

                  {/* Wishlist Section */}
                  <Card className="border-[#ec4899]/20 bg-gradient-to-br from-[#ec4899]/5 to-transparent">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="p-1.5 rounded-lg bg-[#ec4899]/20">
                          <Heart className="h-4 w-4 text-[#ec4899]" />
                        </div>
                        Wishlist
                        {wishlistProducts.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/30">{wishlistProducts.length}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {wishlistProducts.length > 0 ? (
                        <div className="space-y-2">
                          {wishlistProducts.slice(0, 5).map(product => (
                            <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#ec4899]/20 bg-[#ec4899]/5 hover-elevate transition-all" data-testid={`wishlist-item-${product.id}`}>
                              <div className="flex-1 min-w-0">
                                <Link href={`/product/${product.id}`}>
                                  <p className="font-medium text-sm truncate hover:text-[#ec4899] transition-colors cursor-pointer">{product.name}</p>
                                </Link>
                                <p className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => handleAddToCart(product)} className="shrink-0" data-testid={`button-add-to-cart-${product.id}`}>
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-muted-foreground shrink-0" onClick={() => removeMutation.mutate(product.id)} data-testid={`button-remove-wishlist-${product.id}`}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {wishlistProducts.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              +{wishlistProducts.length - 5} more items
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">No items saved yet</p>
                          <Link href="/products">
                            <Button variant="outline" size="sm" className="border-[#ec4899]/40 text-[#ec4899]" data-testid="button-browse-products-wishlist">
                              Browse Products
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Research Quiz Recommendation Card */}
                  <Card className="relative overflow-hidden border-[#f97316]/30 bg-gradient-to-r from-[#f97316]/10 via-[#f97316]/5 to-transparent">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#f97316]/20 rounded-full blur-3xl" />
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <motion.div 
                          className="p-3 rounded-xl bg-gradient-to-br from-[#f97316]/30 to-[#E7FB10]/20 shadow-lg"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        >
                          <Brain className="h-7 w-7 text-[#f97316]" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                            Research Knowledge Quiz
                            <Badge variant="outline" className="bg-[#E7FB10]/10 text-[#E7FB10] border-[#E7FB10]/40 text-xs">Coming Soon</Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">Test your peptide research knowledge and earn bonus XP for your progress.</p>
                        </div>
                        <Button variant="outline" className="border-[#f97316]/40 text-[#f97316] shrink-0" disabled data-testid="button-research-quiz">
                          <Zap className="h-4 w-4 mr-2" />
                          Take Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
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

                  {/* Security & Login Activity - in left column */}
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
                              {loginHistory.slice(0, 3).map((login, idx) => (
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

                  {/* Affiliate Status - in left column */}
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
                            <Button className="w-full bg-gradient-to-r from-[#9d4edd] to-[#9d4edd]/80 text-white" data-testid="button-join-affiliate">
                              Join Now
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
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
                    </div>
                  </div>

                  {/* Danger Zone - Full Width */}
                  <div className="mt-6">
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
                        className="border-red-500/50 text-red-500"
                        onClick={() => setDeleteDialogOpen(true)}
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={!!viewOrderDetails} onOpenChange={(open) => !open && setViewOrderDetails(null)}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] border-[#21d8ff]/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <motion.div 
                className="p-2 rounded-lg bg-gradient-to-br from-[#21d8ff]/20 to-[#E7FB10]/10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Package className="h-5 w-5 text-[#21d8ff]" />
              </motion.div>
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">Order Details</span>
            </DialogTitle>
            <DialogDescription className="text-[#21d8ff]/70">
              Order #{viewOrderDetails?.id?.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {viewOrderDetails && (
            <div className="space-y-4 py-2">
              {/* Order Status Banner */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-[#21d8ff]/10 via-[#E7FB10]/5 to-transparent border border-[#21d8ff]/20">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={getStatusColor(viewOrderDetails.status)} className="capitalize">
                  {viewOrderDetails.status || "pending"}
                </Badge>
              </div>
              
              {/* Product Info with Image */}
              <Link href={`/peptides/${viewOrderDetails.productId}`}>
                <div className="p-4 rounded-lg border border-[#E7FB10]/20 bg-gradient-to-br from-[#E7FB10]/5 to-transparent cursor-pointer hover-elevate transition-all">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#21d8ff]/20 to-[#E7FB10]/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                      {(() => {
                        const product = products?.find(p => p.id === viewOrderDetails.productId);
                        return product?.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <FlaskConical className="h-8 w-8 text-[#21d8ff]/50" />
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Product</p>
                      <p className="font-medium text-white truncate">{getProductName(viewOrderDetails.productId)}</p>
                      <div className="flex items-center justify-between gap-3 mt-2 text-sm">
                        <span className="text-muted-foreground">Qty: {viewOrderDetails.quantity || 1}</span>
                        <span className="font-bold text-[#E7FB10]">${Number(viewOrderDetails.totalAmount).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-[#21d8ff] mt-2 flex items-center gap-1">
                        View product <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Shipping Info */}
              <div className="p-4 rounded-lg border border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-[#9d4edd]" />
                  <p className="text-xs text-muted-foreground">Shipping To</p>
                </div>
                <p className="font-medium">{viewOrderDetails.firstName} {viewOrderDetails.lastName}</p>
                <p className="text-sm text-muted-foreground">
                  {viewOrderDetails.address && (
                    <>
                      {viewOrderDetails.address}<br />
                      {viewOrderDetails.city}, {viewOrderDetails.state} {viewOrderDetails.zipCode}<br />
                      {viewOrderDetails.country || 'USA'}
                    </>
                  )}
                </p>
              </div>
              
              {/* Animated Shipping Timeline */}
              <div className="p-4 rounded-lg border border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
                <p className="text-xs text-muted-foreground mb-4">Fulfillment Progress</p>
                <div className="relative">
                  {/* Timeline Track */}
                  <div className="flex items-center justify-between relative">
                    {/* Connecting Line Background */}
                    <div className="absolute top-4 left-8 right-8 h-0.5 bg-muted/30" />
                    
                    {/* Animated Progress Line */}
                    <motion.div 
                      className="absolute top-4 left-8 h-0.5 bg-gradient-to-r from-[#21d8ff] to-[#E7FB10]"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: viewOrderDetails.fulfillmentStatus === 'delivered' ? "calc(100% - 64px)" : 
                               viewOrderDetails.fulfillmentStatus === 'ready' ? "calc(66% - 42px)" : 
                               viewOrderDetails.fulfillmentStatus === 'preparing' ? "calc(33% - 21px)" : "0%" 
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    
                    {/* Timeline Steps */}
                    {[
                      { id: 'pending', label: 'Confirmed', icon: CheckCircle, color: '#E7FB10' },
                      { id: 'preparing', label: 'Preparing', icon: Package, color: '#21d8ff' },
                      { id: 'ready', label: 'Shipped', icon: Truck, color: '#9d4edd' },
                      { id: 'delivered', label: 'Delivered', icon: CheckCircle, color: '#22c55e' }
                    ].map((step, idx) => {
                      const stepOrder = ['pending', 'preparing', 'ready', 'delivered'];
                      const currentIdx = stepOrder.indexOf(viewOrderDetails.fulfillmentStatus || 'pending');
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = stepOrder[currentIdx] === step.id;
                      const StepIcon = step.icon;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center z-10">
                          <motion.div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              isCompleted 
                                ? 'border-transparent' 
                                : 'border-muted/30 bg-background'
                            }`}
                            style={isCompleted ? { 
                              background: `linear-gradient(135deg, ${step.color}40, ${step.color}20)`,
                              borderColor: step.color
                            } : {}}
                            animate={isCurrent ? { 
                              scale: [1, 1.15, 1],
                              boxShadow: [`0 0 0px ${step.color}00`, `0 0 12px ${step.color}80`, `0 0 0px ${step.color}00`]
                            } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <StepIcon className="h-4 w-4" style={{ color: isCompleted ? step.color : 'hsl(var(--muted-foreground))' }} />
                          </motion.div>
                          <span className={`text-xs mt-2 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full mt-1"
                              style={{ backgroundColor: step.color }}
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Order Meta Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/20 border border-white/5">
                  <span className="text-muted-foreground block text-xs">Order Date</span>
                  <span className="font-medium">{formatDate(viewOrderDetails.createdAt)}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-white/5">
                  <span className="text-muted-foreground block text-xs">Payment</span>
                  <span className="font-medium capitalize">{viewOrderDetails.paymentMethod || 'PayPal'}</span>
                </div>
              </div>
            </div>
          )}
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
              This action cannot be undone. All your data including orders and preferences will be permanently deleted.
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
