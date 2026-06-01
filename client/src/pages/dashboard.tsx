import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";
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
  FileText,
  Monitor,
  Smartphone,
  Mail,
  Brain,
  Copy,
  BookMarked,
  Users,
  Activity,
} from "lucide-react";
import type { Order, Product, Coa, ResearchPhase, ResearchTitle, SavedStack } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CompoundFinder } from "@/components/compound-finder";
const LogbookTab = lazy(() =>
  import("@/components/logbook-tab").then((m) => ({ default: m.LogbookTab }))
);
const LogbookWipeCard = lazy(() =>
  import("@/components/logbook-tab").then((m) => ({ default: m.LogbookWipeCard }))
);
const CyclesTab = lazy(() =>
  import("@/components/cycles/CyclesTab").then((m) => ({ default: m.CyclesTab }))
);

// ── Configurable research tier ladder ──────────────────────────────────────
// Thresholds are placeholders; Grayson to tune post-launch. All tier names
// and progress copy are COMPLIANCE PENDING — route through legal before launch.
const RESEARCH_TIERS = [
  { name: "Researcher", minOrders: 0, label: "Tier 1" },           // COMPLIANCE PENDING
  { name: "Early Access Researcher", minOrders: 3, label: "Tier 2" }, // COMPLIANCE PENDING
  { name: "Founding Fellow", minOrders: 10, label: "Tier 3" },     // COMPLIANCE PENDING
] as const;

// Number of logbook entries required before the Cycles tool unlocks.
const CYCLES_UNLOCK_THRESHOLD = 3; // tunable post-launch

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
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
  const [newAddressDialogOpen, setNewAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", firstName: "", lastName: "", street: "", city: "", state: "", zipCode: "", country: "United States" });
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{id: string; title: string; content: string} | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Supabase processes the OAuth code asynchronously after the initial
      // session check resolves to null. Suppress the toast while the callback
      // is still in the URL so we don't flash an error that immediately clears.
      const isOAuthCallback =
        window.location.hash.includes("access_token") ||
        window.location.search.includes("code=");
      if (!isOAuthCallback) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your dashboard.",
          variant: "destructive",
        });
      }
    }
  }, [authLoading, isAuthenticated, toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const validTabs = ["general", "orders", "stacks", "logbook", "cycles", "education", "settings"];
    if (tab && validTabs.includes(tab)) {
      const sectionId = `section-${tab}`;
      const scroll = () => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", `/dashboard#${sectionId}`);
        }
      };
      const timer = setTimeout(scroll, 300);
      return () => clearTimeout(timer);
    }
  }, []);

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
    isFoundingMember: boolean;
    orderCount: number;
    completedLessons: string[];
    currentModuleId: string | null;
  }>({
    queryKey: ["/api/user/research-profile"],
    enabled: isAuthenticated,
  });

  const { data: logbookEntries } = useQuery<{ id: string }[]>({
    queryKey: ["/api/logbook"],
    enabled: isAuthenticated,
  });

  const { data: cyclesData } = useQuery<{ cycles: { status: string }[]; totalLogbookEntries: number }>({
    queryKey: ["/api/cycles"],
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

  const { data: savedStacks, isLoading: savedStacksLoading } = useQuery<SavedStack[]>({
    queryKey: ["/api/saved-stacks"],
    enabled: isAuthenticated,
  });

  const { data: reorderNudge } = useQuery<{
    dueCompounds: Array<{
      productId: string;
      name: string;
      weeksSince: number;
      lastQty: number;
    }>;
  }>({
    queryKey: ["/api/user/reorder-nudge"],
    enabled: isAuthenticated,
  });

  const deleteStackMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saved-stacks/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-stacks"] });
      toast({ title: "Stack deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete stack", variant: "destructive" });
    },
  });

  const toggleStackVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      return apiRequest("PATCH", `/api/saved-stacks/${id}/visibility`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-stacks"] });
    },
    onError: () => {
      toast({ title: "Failed to update visibility", variant: "destructive" });
    },
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

  const createAddressMutation = useMutation({
    mutationFn: async (data: { label: string; firstName: string; lastName: string; street: string; city: string; state: string; zipCode: string; country: string }) => {
      return apiRequest("POST", "/api/addresses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({ title: "Address Added", description: "Your new address has been saved." });
      setNewAddressDialogOpen(false);
      setNewAddress({ label: "", firstName: "", lastName: "", street: "", city: "", state: "", zipCode: "", country: "United States" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add address. Please try again.", variant: "destructive" });
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
      color: "#D4FF1F",
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
      color: "#D4FF1F",
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

  // ── Dashboard Home derived state ─────────────────────────────────────────
  const logbookCount = logbookEntries?.length ?? 0;
  const completedLessons = researchProfile?.completedLessons ?? [];
  const isFoundingMember = researchProfile?.isFoundingMember ?? false;
  const cyclesUnlocked = logbookCount >= CYCLES_UNLOCK_THRESHOLD;

  // isEmpty: no orders AND no logbook activity at all
  const isEmpty = orderCount === 0 && logbookCount === 0;

  // Resolve current tier based on real order count
  const currentTierIndex = RESEARCH_TIERS.reduce<number>((best, tier, i) =>
    orderCount >= tier.minOrders ? i : best, 0);
  const currentTier = RESEARCH_TIERS[currentTierIndex];
  const nextTier = currentTierIndex + 1 < RESEARCH_TIERS.length
    ? RESEARCH_TIERS[currentTierIndex + 1] : null;
  const ordersToNextTier = nextTier ? Math.max(0, nextTier.minOrders - orderCount) : 0;
  const tierProgress = nextTier
    ? (orderCount - currentTier.minOrders) / (nextTier.minOrders - currentTier.minOrders)
    : 1;

  // Deduplicated "order again" cards — one card per distinct product, most recent
  // order wins, live catalog price used (NOT historical order amount). Products
  // absent from the catalog are silently omitted.
  const reorderCards = useMemo(() => {
    if (!orders?.length || !products?.length) return [];
    const byProduct = new Map<string, Order>();
    [...orders]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .forEach(o => {
        if (o.productId && !byProduct.has(o.productId)) byProduct.set(o.productId, o);
      });
    return Array.from(byProduct.values())
      .map(o => {
        const product = products.find(p => p.id === o.productId);
        return product ? { order: o, product } : null;
      })
      .filter((x): x is { order: Order; product: Product } => x !== null);
    // No artificial cap — spec calls for all distinct past compounds in a horizontal scroll row
  }, [orders, products]);

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
          <div className="absolute -top-20 -right-40 w-80 h-80 bg-[#D4FF1F]/6 rounded-full blur-[100px]" />
          {/* Middle left purple glow */}
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-[#9d4edd]/8 rounded-full blur-[100px]" />
          {/* Bottom right cyan/teal glow */}
          <div className="absolute bottom-20 -right-32 w-96 h-96 bg-[#21d8ff]/6 rounded-full blur-[120px]" />
          {/* Center subtle warm glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4FF1F]/3 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Compact Greeting Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1
                    className="font-['Bebas_Neue'] text-3xl md:text-4xl tracking-wide text-white leading-none"
                    data-testid="text-user-name"
                  >
                    {isEmpty
                      ? `Welcome, ${user?.firstName || 'Researcher'}`
                      : (() => {
                          const hour = new Date().getHours();
                          const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
                          return `${g}, ${user?.firstName || 'Researcher'}`;
                        })()}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Standing tier chip — chartreuse */}
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#D4FF1F]/40 bg-[#D4FF1F]/10 text-[#D4FF1F] text-xs font-medium"
                      data-testid="badge-standing-tier"
                    >
                      <FlaskConical className="h-3 w-3" />
                      {currentTier.name}{/* COMPLIANCE PENDING */}
                    </span>
                    {/* Founding Member chip — only in populated state (spec: empty state shows Tier 1 chip only) */}
                    {isFoundingMember && !isEmpty && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#9d4edd]/40 bg-[#9d4edd]/10 text-[#9d4edd] text-xs font-medium"
                        data-testid="badge-founding-member"
                      >
                        <Crown className="h-3 w-3" />
                        Founding Member{/* COMPLIANCE PENDING */}
                      </span>
                    )}
                  </div>
                </div>
                <a href="/api/logout">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 shrink-0"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* 6-Tab Layout */}
            <motion.div variants={itemVariants}>
              <div className="w-full space-y-12">

                {/* General Section — rebuilt Phase 2 */}
                <section id="section-general" className="space-y-5">

                  {/* ── Reorder reminder banner ─────────────────────────────────
                      Only rendered when at least one compound is due per cadence.
                      Suppressed entirely for empty/new accounts (dueCompounds=[]).
                      All copy strings are COMPLIANCE PENDING.
                  ─────────────────────────────────────────────────────────────── */}
                  {reorderNudge && reorderNudge.dueCompounds.length > 0 && (() => {
                    const top = reorderNudge.dueCompounds[0];
                    const handleBannerClick = () => {
                      const card = document.querySelector(
                        `[data-testid="card-reorder-${top.productId}"]`
                      );
                      if (card) {
                        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                        (card as HTMLElement).classList.add("ring-1", "ring-[#D4FF1F]/40");
                        setTimeout(() => {
                          (card as HTMLElement).classList.remove("ring-1", "ring-[#D4FF1F]/40");
                        }, 1800);
                      }
                    };
                    return (
                      <motion.div variants={itemVariants}>
                        <button
                          type="button"
                          onClick={handleBannerClick}
                          className="w-full text-left"
                          data-testid="banner-reorder-nudge"
                          aria-label={`Restock reminder for ${top.name}`}
                        >
                          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#D4FF1F]/[0.06] border border-[#D4FF1F]/20 hover:bg-[#D4FF1F]/[0.10] transition-colors">
                            <Bell className="h-4 w-4 text-[#D4FF1F] shrink-0" />
                            <p className="text-sm text-[#D4FF1F]/90 flex-1 min-w-0">
                              {/* COMPLIANCE PENDING */}
                              It's been <span className="font-semibold">{top.weeksSince} {top.weeksSince === 1 ? "week" : "weeks"}</span> since your last{" "}
                              <span className="font-semibold">{top.name}</span> order — restock your research supply.
                              {/* COMPLIANCE PENDING */}
                            </p>
                            <ChevronRight className="h-4 w-4 text-[#D4FF1F]/60 shrink-0" />
                          </div>
                        </button>
                      </motion.div>
                    );
                  })()}

                  {/* ── 1. Order Again / Get Started ──────────────────────────── */}
                  {isEmpty ? (
                    /* ── Empty state: first-order prompt ── */
                    <motion.div variants={itemVariants}>
                      <Card className="border-white/10 bg-white/[0.03]">
                        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                          <div className="p-3 rounded-xl bg-[#D4FF1F]/10 border border-[#D4FF1F]/20 shrink-0">
                            <ShoppingBag className="h-6 w-6 text-[#D4FF1F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-base mb-1">
                              Place your first order{/* COMPLIANCE PENDING */}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              {/* COMPLIANCE PENDING: founding-member offer & "25% off for life" copy needs legal review */}
                              The first 50 customers receive Founding Member status — a permanent 25% discount on every future order.{/* COMPLIANCE PENDING */}
                            </p>
                          </div>
                          <Link href="/peptides">
                            <Button
                              className="bg-[#D4FF1F] text-black font-semibold shrink-0"
                              data-testid="button-get-started-shop"
                            >
                              Browse Compounds{/* COMPLIANCE PENDING */}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    /* ── Populated state: horizontal scroll row of reorder cards ── */
                    <motion.div variants={itemVariants} className="space-y-2">
                      <div className="flex items-center justify-between px-0.5">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                          Order Again
                        </h2>
                        <Link
                          href="#section-orders"
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                          data-testid="link-all-orders"
                        >
                          All orders
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                      {/* Horizontal scroll — prevents layout overflow per spec (f) */}
                      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth">
                        {reorderCards.map(({ order, product }) => {
                          const doseVariant = product.dosageOptions?.[0] ?? null;
                          return (
                            <Card
                              key={product.id}
                              className="border-white/10 bg-white/[0.03] shrink-0 w-48"
                              data-testid={`card-reorder-${product.id}`}
                            >
                              <CardContent className="p-4 flex flex-col gap-3 h-full">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-10 w-10 rounded-md object-cover border border-white/10"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <p
                                    className="font-medium text-sm leading-tight line-clamp-2"
                                    data-testid={`text-reorder-name-${product.id}`}
                                  >
                                    {product.name}
                                  </p>
                                  {doseVariant && (
                                    <p className="text-xs text-muted-foreground truncate" data-testid={`text-reorder-variant-${product.id}`}>
                                      {doseVariant}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground" data-testid={`text-reorder-qty-${product.id}`}>
                                    Qty: {order.quantity}
                                  </p>
                                  <p className="text-xs font-medium text-white" data-testid={`text-reorder-price-${product.id}`}>
                                    ${Number(product.price).toFixed(2)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full border-white/15 text-xs"
                                  onClick={() => handleReorder(order)}
                                  data-testid={`button-reorder-${product.id}`}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1.5" />
                                  Reorder
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ── 2. Your Research Standing ──────────────────────────────── */}
                  {/* Chartreuse border glow is ONLY on this card — nowhere else in the section */}
                  <motion.div variants={itemVariants}>
                    <Card
                      className="border-[#D4FF1F]/25 bg-white/[0.03] shadow-[0_0_24px_0_rgba(212,255,31,0.06)]"
                      data-testid="card-research-standing"
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                              Your Research Standing{/* COMPLIANCE PENDING */}
                            </p>
                            <h3 className="text-xl font-semibold text-[#D4FF1F]" data-testid="text-tier-name">
                              {currentTier.name}{/* COMPLIANCE PENDING */}
                            </h3>
                          </div>
                          <span
                            className="text-xs text-muted-foreground shrink-0 mt-1"
                            data-testid="text-tier-label"
                          >
                            Tier {currentTierIndex + 1} of {RESEARCH_TIERS.length}{/* COMPLIANCE PENDING */}
                          </span>
                        </div>
                        {/* Progress bar — always paired with a text label */}
                        <div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D4FF1F] rounded-full transition-all duration-700"
                              style={{ width: `${Math.round(tierProgress * 100)}%` }}
                              data-testid="bar-tier-progress"
                            />
                          </div>
                        </div>
                        {/* Next unlock text — below the bar */}
                        <p
                          className="text-xs text-muted-foreground"
                          data-testid="text-tier-next-unlock"
                        >
                          {nextTier
                            ? `Place ${ordersToNextTier} more order${ordersToNextTier !== 1 ? 's' : ''} to unlock ${nextTier.name}`
                            : `${currentTier.name} — highest tier reached`
                          }{/* COMPLIANCE PENDING */}
                        </p>
                        {/* Tier ladder pills */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {RESEARCH_TIERS.map((tier, i) => (
                            <span
                              key={tier.name}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                                i <= currentTierIndex
                                  ? 'bg-[#D4FF1F]/15 border border-[#D4FF1F]/35 text-[#D4FF1F]'
                                  : 'bg-white/5 border border-white/10 text-muted-foreground'
                              }`}
                              data-testid={`badge-tier-${i}`}
                            >
                              {i <= currentTierIndex && <CheckCircle className="h-2.5 w-2.5" />}
                              {tier.label}{/* COMPLIANCE PENDING */}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* ── 3. Continue / Start Here ───────────────────────────────── */}
                  {/* Decision is driven by currentModuleId (in-progress module), NOT completedLessons.length */}
                  <motion.div variants={itemVariants}>
                    <Card className="border-white/10 bg-white/[0.03]" data-testid="card-continue-here">
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 shrink-0">
                          <BookOpen className="h-5 w-5 text-[#21d8ff]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {researchProfile?.currentModuleId ? (
                            <>
                              <p className="font-semibold text-sm">Continue the Academy</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Pick up where you left off · {completedLessons.length} lesson{completedLessons.length !== 1 ? 's' : ''} completed
                                {/* COMPLIANCE PENDING */}
                              </p>
                            </>
                          ) : isEmpty ? (
                            <>
                              <p className="font-semibold text-sm">Start Here</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Build your research foundation · 0 / 6 modules{/* COMPLIANCE PENDING */}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-sm">Start the Academy</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                0 / 6 modules complete · begin your research education{/* COMPLIANCE PENDING */}
                              </p>
                            </>
                          )}
                        </div>
                        <Link
                          href={
                            researchProfile?.currentModuleId
                              ? `/academy?module=${researchProfile.currentModuleId}`
                              : '/academy'
                          }
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#21d8ff]/25 text-[#21d8ff] shrink-0"
                            data-testid="button-go-to-academy"
                          >
                            {researchProfile?.currentModuleId ? 'Continue' : isEmpty ? 'Start Here' : 'Start the Academy'}
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* ── 4. Research Tools Hub ──────────────────────────────────── */}
                  {/* 2-col grid: Stacks | Logbook, Cycles | Verify COA + full-width Academy row */}
                  <motion.div variants={itemVariants} className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-0.5">
                      Research Tools
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Stacks */}
                      <Link href="#section-stacks">
                        <Card
                          className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                          data-testid="card-tool-stacks"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/20 shrink-0">
                              <Boxes className="h-4 w-4 text-[#9d4edd]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">My Stacks</p>
                              <p className="text-xs text-muted-foreground" data-testid="text-tool-stacks-count">
                                {(savedStacks?.length ?? 0) === 0
                                  ? 'Build your first stack'
                                  : `${savedStacks!.length} saved`}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Logbook — privacy note in both states */}
                      <Link href="#section-logbook">
                        <Card
                          className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                          data-testid="card-tool-logbook"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 shrink-0">
                              <FileText className="h-4 w-4 text-[#21d8ff]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">Logbook</p>
                              <p className="text-xs text-muted-foreground" data-testid="text-tool-logbook-count">
                                {logbookCount === 0 ? 'Log your first entry' : `${logbookCount} entr${logbookCount === 1 ? 'y' : 'ies'}`}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight" data-testid="text-tool-logbook-privacy">
                                Private · wiped from Settings · not a medical record
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Cycles — locked state shows real progress toward threshold */}
                      {cyclesUnlocked ? (
                        <Link href="#section-cycles">
                          <Card
                            className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                            data-testid="card-tool-cycles"
                          >
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#D4FF1F]/10 border border-[#D4FF1F]/20 shrink-0">
                                <RefreshCw className="h-4 w-4 text-[#D4FF1F]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">Cycles</p>
                                <p className="text-xs text-muted-foreground" data-testid="text-tool-cycles-count">
                                  {(() => {
                                    const activeCycles = cyclesData?.cycles?.filter(c => c.status === 'active').length ?? 0;
                                    return activeCycles === 0
                                      ? 'No active cycles'
                                      : `${activeCycles} active cycle${activeCycles !== 1 ? 's' : ''}`;
                                  })()}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </CardContent>
                          </Card>
                        </Link>
                      ) : (
                        /* Locked — forward-looking progress, not a dead label */
                        <Card
                          className="border-white/8 bg-white/[0.015]"
                          data-testid="card-tool-cycles-locked"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/8 shrink-0">
                              <Lock className="h-4 w-4 text-muted-foreground/60" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-muted-foreground">Cycles</p>
                              <p className="text-xs text-muted-foreground/70" data-testid="text-tool-cycles-locked-hint">
                                Add {CYCLES_UNLOCK_THRESHOLD - logbookCount} more log {CYCLES_UNLOCK_THRESHOLD - logbookCount === 1 ? 'entry' : 'entries'} to unlock
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Verify COA — links to the real COA verification route */}
                      <Link href="/coa/verify-certificate-of-analysis">
                        <Card
                          className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                          data-testid="card-tool-verify-coa"
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                              <FileCheck className="h-4 w-4 text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">Verify COA</p>
                              <p className="text-xs text-muted-foreground" data-testid="text-tool-verify-coa-hint">
                                {researchProfile?.batchVerificationCount
                                  ? `${researchProfile.batchVerificationCount} batch${researchProfile.batchVerificationCount !== 1 ? 'es' : ''} verified`
                                  : 'Check batch certificates'}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    </div>

                    {/* Academy — full-width row below the 2-col grid */}
                    <Link href="/academy">
                      <Card
                        className="border-white/10 bg-white/[0.03] hover-elevate cursor-pointer"
                        data-testid="card-tool-academy"
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20 shrink-0">
                            <GraduationCap className="h-4 w-4 text-[#ec4899]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Research Academy</p>
                            <p className="text-xs text-muted-foreground" data-testid="text-tool-academy-count">
                              {completedLessons.length === 0
                                ? 'Start learning · 0 / 6 modules'
                                : `${completedLessons.length} / 17 lessons complete`}{/* COMPLIANCE PENDING */}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>

                  {/* ── 5. Account Rows ────────────────────────────────────────── */}
                  <motion.div variants={itemVariants}>
                    <Card className="border-white/10 bg-white/[0.03] divide-y divide-white/8" data-testid="card-account-rows">
                      {/* My Orders */}
                      <button
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                        onClick={() => document.getElementById('section-orders')?.scrollIntoView({ behavior: 'smooth' })}
                        data-testid="button-nav-orders"
                      >
                        <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">My Orders</p>
                          <p className="text-xs text-muted-foreground">
                            {orderCount === 0 ? 'No orders yet' : `${orderCount} order${orderCount !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>

                      {/* Your Benefits */}
                      <Link
                        href="/benefits"
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                        data-testid="button-nav-benefits"
                      >
                        <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Your Benefits</p>
                          <p className="text-xs text-muted-foreground">
                            {isFoundingMember ? 'Founding member perks active' : 'Loyalty rewards & perks'}
                            {/* COMPLIANCE PENDING */}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>

                      {/* Affiliate Earnings */}
                      {affiliate?.id ? (
                        <Link
                          href="/affiliate"
                          className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                          data-testid="button-nav-affiliate"
                        >
                          <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                            <Diamond className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Affiliate Earnings</p>
                            <p className="text-xs text-muted-foreground">View commissions &amp; payouts</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      ) : (
                        <Link
                          href="/affiliate"
                          className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                          data-testid="button-nav-affiliate-apply"
                        >
                          <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                            <Diamond className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Affiliate Earnings</p>
                            <p className="text-xs text-muted-foreground">Apply to earn commissions</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      )}

                      {/* Settings */}
                      <button
                        className="w-full flex items-center gap-3 px-5 py-4 text-left hover-elevate"
                        onClick={() => document.getElementById('section-settings')?.scrollIntoView({ behavior: 'smooth' })}
                        data-testid="button-nav-settings"
                      >
                        <div className="p-1.5 rounded-md bg-white/5 shrink-0">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Settings</p>
                          <p className="text-xs text-muted-foreground">Profile &amp; notifications</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    </Card>
                  </motion.div>

                </section>

                {/* Orders Section */}
                <section id="section-orders" className="space-y-6">
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
                          <Button size="sm" className="bg-[#D4FF1F] text-black" data-testid="button-shop-more">
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
                            const colors = ['#D4FF1F', '#21d8ff', '#9d4edd', '#ec4899', '#f97316'];
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
                            <Button className="bg-[#D4FF1F] text-black" data-testid="button-browse-products-history">Browse Products</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </section>

                {/* Stacks Section */}
                <section id="section-stacks" className="space-y-6">
                  {/* My Stacks */}
                  <Card className="border-[#2a2a32]">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-[#21d8ff]" />
                            My Stacks
                          </CardTitle>
                          <CardDescription>Research stacks you built in the stack builder</CardDescription>
                        </div>
                        <Link href="/research-stacks">
                          <Button variant="outline" size="sm" className="border-[#21d8ff]/40 text-[#21d8ff]" data-testid="button-build-stack">
                            <Plus className="h-4 w-4 mr-2" />
                            Build a Stack
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {savedStacksLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map(i => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : !savedStacks || savedStacks.filter(s => !s.sourceShareCode).length === 0 ? (
                        <div className="text-center py-10 space-y-3" data-testid="empty-my-stacks">
                          <FlaskConical className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm font-medium text-muted-foreground">No personal stacks yet</p>
                          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                            Build a custom research stack and save it to share with your research community.
                          </p>
                          <Link href="/research-stacks">
                            <Button variant="outline" size="sm" className="border-[#21d8ff]/40 text-[#21d8ff] mt-2" data-testid="button-go-build">
                              Build a Custom Stack
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3" data-testid="list-my-stacks">
                          {savedStacks.filter(s => !s.sourceShareCode).map((stack) => (
                            <div
                              key={stack.id}
                              className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#2a2a32] bg-[#0f0f12]"
                              data-testid={`row-stack-${stack.id}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 flex items-center justify-center flex-shrink-0">
                                  <FlaskConical className="h-4 w-4 text-[#21d8ff]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate" data-testid={`text-stack-name-${stack.id}`}>{stack.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-muted-foreground" data-testid={`text-stack-count-${stack.id}`}>{(stack.peptideNames || []).length} compound{(stack.peptideNames || []).length !== 1 ? "s" : ""}</span>
                                    {(stack.synergyScore ?? 0) > 0 && (
                                      <Badge variant="outline" className="text-[10px] border-[#21d8ff]/30 text-[#21d8ff]" data-testid={`badge-synergy-${stack.id}`}>
                                        {stack.synergyScore}% synergy
                                      </Badge>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${stack.isPublic ? "border-green-500/40 text-green-400" : "border-[#2a2a32] text-muted-foreground"}`}
                                      data-testid={`badge-visibility-${stack.id}`}
                                    >
                                      {stack.isPublic ? "Public" : "Private"}
                                    </Badge>
                                    {stack.createdAt && (
                                      <span className="text-[10px] text-muted-foreground/60">
                                        {new Date(stack.createdAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleStackVisibilityMutation.mutate({ id: stack.id, isPublic: !stack.isPublic })}
                                  disabled={toggleStackVisibilityMutation.isPending}
                                  className={`text-xs ${stack.isPublic ? "border-green-500/30 text-green-400" : "border-[#2a2a32] text-muted-foreground"}`}
                                  data-testid={`button-toggle-visibility-${stack.id}`}
                                >
                                  {stack.isPublic ? "Public" : "Private"}
                                </Button>
                                {stack.shareCode && stack.isPublic && (
                                  <Link href={`/stacks/${stack.shareCode}`}>
                                    <Button variant="outline" size="sm" className="border-[#2a2a32] text-muted-foreground text-xs" data-testid={`button-open-stack-${stack.id}`}>
                                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                      Open
                                    </Button>
                                  </Link>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-red-500/20 text-red-400"
                                  onClick={() => {
                                    if (confirm(`Delete "${stack.name}"? This action cannot be undone.`)) {
                                      deleteStackMutation.mutate(stack.id);
                                    }
                                  }}
                                  disabled={deleteStackMutation.isPending}
                                  data-testid={`button-delete-stack-${stack.id}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Saved from Community */}
                  <Card className="border-[#2a2a32]">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-[#a78bfa]" />
                            Saved from Community
                          </CardTitle>
                          <CardDescription>Stacks you collected from other researchers' share pages</CardDescription>
                        </div>
                        <Link href="/research-stacks">
                          <Button variant="outline" size="sm" className="border-[#a78bfa]/40 text-[#a78bfa]" data-testid="button-browse-community">
                            <BookMarked className="h-4 w-4 mr-2" />
                            Explore Stacks
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {savedStacksLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map(i => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : !savedStacks || savedStacks.filter(s => !!s.sourceShareCode).length === 0 ? (
                        <div className="text-center py-10 space-y-3" data-testid="empty-community-stacks">
                          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm font-medium text-muted-foreground">No community stacks saved yet</p>
                          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                            Browse shared stacks from other researchers and save them to your collection.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3" data-testid="list-community-stacks">
                          {savedStacks.filter(s => !!s.sourceShareCode).map((stack) => (
                            <div
                              key={stack.id}
                              className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#2a2a32] bg-[#0f0f12]"
                              data-testid={`row-community-stack-${stack.id}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center flex-shrink-0">
                                  <Users className="h-4 w-4 text-[#a78bfa]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate" data-testid={`text-community-stack-name-${stack.id}`}>{stack.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-muted-foreground" data-testid={`text-community-stack-count-${stack.id}`}>{(stack.peptideNames || []).length} compound{(stack.peptideNames || []).length !== 1 ? "s" : ""}</span>
                                    {(stack.synergyScore ?? 0) > 0 && (
                                      <Badge variant="outline" className="text-[10px] border-[#a78bfa]/30 text-[#a78bfa]" data-testid={`badge-community-synergy-${stack.id}`}>
                                        {stack.synergyScore}% synergy
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-[10px] border-[#a78bfa]/30 text-[#a78bfa]" data-testid={`badge-community-source-${stack.id}`}>
                                      Community
                                    </Badge>
                                    {stack.createdAt && (
                                      <span className="text-[10px] text-muted-foreground/60">
                                        Saved {new Date(stack.createdAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {stack.sourceShareCode && (
                                  <Link href={`/stacks/${stack.sourceShareCode}`}>
                                    <Button variant="outline" size="sm" className="border-[#a78bfa]/30 text-[#a78bfa] text-xs" data-testid={`button-view-source-${stack.id}`}>
                                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                      Original
                                    </Button>
                                  </Link>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-red-500/20 text-red-400"
                                  onClick={() => {
                                    if (confirm(`Remove "${stack.name}" from your collection? This action cannot be undone.`)) {
                                      deleteStackMutation.mutate(stack.id);
                                    }
                                  }}
                                  disabled={deleteStackMutation.isPending}
                                  data-testid={`button-remove-community-stack-${stack.id}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Logbook Section */}
                <section id="section-logbook" className="space-y-6">
                  <Suspense fallback={null}><LogbookTab /></Suspense>
                </section>

                {/* Cycles Section */}
                <section id="section-cycles" className="space-y-6">
                  <Suspense fallback={null}><CyclesTab /></Suspense>
                </section>

                {/* Education Section */}
                <section id="section-education" className="space-y-6">
                  {/* Research Progress */}
                  {researchProfile && (
                    <Card className="border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 to-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-[#D4FF1F]" />
                              Research Progress
                            </CardTitle>
                            <CardDescription>Your learning journey</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-[#D4FF1F]/10 border-[#D4FF1F]/40 text-[#D4FF1F]">
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
                            <div className="text-2xl font-bold text-[#D4FF1F]">{researchProfile.educationCount}</div>
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
                                  <div className={`h-2 rounded-full transition-all ${isActive ? isCurrent ? "bg-[#D4FF1F]" : "bg-[#D4FF1F]/50" : "bg-muted"}`} />
                                  <div className={`text-xs mt-1 text-center ${isCurrent ? "text-[#D4FF1F] font-medium" : "text-muted-foreground"}`}>
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
                      <Card className="relative overflow-hidden p-5 cursor-pointer border-[#D4FF1F]/30 hover:border-[#D4FF1F]/60 bg-gradient-to-r from-[#D4FF1F]/10 via-[#D4FF1F]/5 to-transparent transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF1F]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-[#D4FF1F]/20 shadow-lg shadow-[#D4FF1F]/10 group-hover:shadow-[#D4FF1F]/30 transition-shadow">
                              <GraduationCap className="h-6 w-6 text-[#D4FF1F]" />
                            </div>
                            <div>
                              <p className="font-semibold group-hover:text-[#D4FF1F] transition-colors">Research Academy</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3 text-[#D4FF1F]" />
                                Learn and earn XP
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#D4FF1F] group-hover:translate-x-1 transition-all" />
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
                                <p className="text-xs text-muted-foreground">${Math.round(Number(product.price))}</p>
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
                          className="p-3 rounded-xl bg-gradient-to-br from-[#f97316]/30 to-[#D4FF1F]/20 shadow-lg"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        >
                          <Brain className="h-7 w-7 text-[#f97316]" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                            Research Knowledge Quiz
                            <Badge variant="outline" className="bg-[#D4FF1F]/10 text-[#D4FF1F] border-[#D4FF1F]/40 text-xs">Coming Soon</Badge>
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
                </section>

                {/* Settings Section */}
                <section id="section-settings">
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
                        <Button className="w-full bg-[#D4FF1F] text-black" data-testid="button-account-settings">
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
                  <Card className="border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 via-transparent to-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-[#D4FF1F]/20">
                            <MapPin className="h-5 w-5 text-[#D4FF1F]" />
                          </div>
                          <span>Saved Addresses</span>
                        </CardTitle>
                        <Button size="sm" variant="outline" className="border-[#D4FF1F]/40" onClick={() => setNewAddressDialogOpen(true)} data-testid="button-add-address">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {addressesLoading ? (
                        <div className="space-y-2">
                          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                      ) : savedAddresses && savedAddresses.length > 0 ? (
                        <div className="space-y-3">
                          {savedAddresses.map((addr) => (
                            <div key={addr.id} className="p-4 rounded-lg border border-[#D4FF1F]/20 bg-[#D4FF1F]/5 flex items-start justify-between gap-3 group" data-testid={`address-${addr.id}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{addr.label || "Address"}</p>
                                  {addr.isDefault && (
                                    <Badge className="bg-[#D4FF1F]/10 text-[#D4FF1F] border-[#D4FF1F]/30 text-xs">Default</Badge>
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
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <MapPin className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">No saved addresses</p>
                          <Button size="sm" variant="outline" onClick={() => setNewAddressDialogOpen(true)} data-testid="button-add-first-address">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Address
                          </Button>
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
                      <Suspense fallback={null}><LogbookWipeCard /></Suspense>
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
                </section>
              </div>
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
                className="p-2 rounded-lg bg-gradient-to-br from-[#21d8ff]/20 to-[#D4FF1F]/10"
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
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-[#21d8ff]/10 via-[#D4FF1F]/5 to-transparent border border-[#21d8ff]/20">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={getStatusColor(viewOrderDetails.status)} className="capitalize">
                  {viewOrderDetails.status || "pending"}
                </Badge>
              </div>
              
              {/* Product Info with Image */}
              <Link href={`/peptides/${viewOrderDetails.productId}`}>
                <div className="p-4 rounded-lg border border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 to-transparent cursor-pointer hover-elevate transition-all">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#21d8ff]/20 to-[#D4FF1F]/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
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
                        <span className="font-bold text-[#D4FF1F]">${Number(viewOrderDetails.totalAmount).toFixed(2)}</span>
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
                      className="absolute top-4 left-8 h-0.5 bg-gradient-to-r from-[#21d8ff] to-[#D4FF1F]"
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
                      { id: 'pending', label: 'Confirmed', icon: CheckCircle, color: '#D4FF1F' },
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


      {/* New Address Dialog */}
      <Dialog open={newAddressDialogOpen} onOpenChange={(open) => {
        setNewAddressDialogOpen(open);
        if (!open) setNewAddress({ label: "", firstName: "", lastName: "", street: "", city: "", state: "", zipCode: "", country: "United States" });
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Save a new shipping address to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                placeholder="e.g., Home, Lab, Work"
                data-testid="input-new-address-label"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={newAddress.firstName}
                  onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                  placeholder="First name"
                  data-testid="input-new-address-firstname"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={newAddress.lastName}
                  onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                  placeholder="Last name"
                  data-testid="input-new-address-lastname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Street Address</label>
              <Input
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                placeholder="123 Main St"
                data-testid="input-new-address-street"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="City"
                  data-testid="input-new-address-city"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  placeholder="State"
                  data-testid="input-new-address-state"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                  placeholder="ZIP"
                  data-testid="input-new-address-zipcode"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  data-testid="input-new-address-country"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNewAddressDialogOpen(false)} data-testid="button-cancel-new-address">
              Cancel
            </Button>
            <Button
              onClick={() => createAddressMutation.mutate(newAddress)}
              disabled={createAddressMutation.isPending || !newAddress.firstName || !newAddress.lastName || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode}
              data-testid="button-save-new-address"
            >
              {createAddressMutation.isPending ? "Saving..." : "Save Address"}
            </Button>
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
