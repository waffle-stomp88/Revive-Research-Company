import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RangeSlider } from "@/components/ui/range-slider";
import {
  Package,
  FileCheck,
  ShoppingBag,
  Mail,
  Plus,
  Pencil,
  Trash2,
  Shield,
  AlertCircle,
  Users,
  Building2,
  Check,
  X,
  DollarSign,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  ImageIcon,
  Star,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Clock,
  PackageX,
  Inbox,
  CreditCard,
  Activity,
  BarChart3,
  Bell,
  Tag,
  ToggleLeft,
  ToggleRight,
  Zap,
  Sparkles,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Settings,
  Download,
  Eye,
  AlertTriangle,
  Copy,
  ShoppingCart,
  ChevronDown,
  ChevronLeft,
  UserCircle,
  Calendar,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertCoaSchema, type Product, type Coa, type Order, type Contact, type AffiliateApplication, type Affiliate, type AffiliatePayout, type ProductDosageStock, type ProductWithDosageStock, type ProductBehavioralMetrics } from "@shared/schema";
import { z } from "zod";

// Dosage stock item type for local state management
interface DosageStockItem {
  dosage: string;
  stockAmount: number;
  inStock: boolean;
  price: string | null;
  originalPrice: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  benefits: z.string().optional(),
  stockAmount: z.coerce.number().int().optional(),
  dosageOptions: z.string().optional(),
  isWeeklyDeal: z.boolean().optional(),
  weeklyDealEndDate: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const coaFormSchema = insertCoaSchema.extend({
  results: z.string().optional(),
  publiclyVisible: z.boolean().default(true),
  notes: z.string().optional(),
});

type CoaFormValues = z.infer<typeof coaFormSchema>;

type SortField = "name" | "category" | "price" | "status";
type SortDirection = "asc" | "desc";

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProductsSold: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  lowStockProducts: Array<{ id: string; name: string; stockAmount: number }>;
  outOfStockProducts: Array<{ id: string; name: string }>;
  outOfStockDosagesCount: number;
  lowStockDosagesCount: number;
  recentContacts: number;
  pendingAffiliateApplications: number;
  activeAffiliates: number;
  pendingPayouts: number;
  totalAffiliateCommissions: number;
  topProducts: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>;
  recentOrders: Order[];
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
}

interface StockNotificationWithProduct {
  id: string;
  email: string;
  productId: string;
  productName: string;
  status: string;
  createdAt: string;
}

interface RecentOrderInfo {
  id: string;
  firstName: string;
  lastName: string;
  totalAmount: string;
  status: string | null;
  createdAt: Date | null;
}

function DashboardOverview({ onNavigateToTab }: { onNavigateToTab: (tab: string) => void }) {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [topProductSort, setTopProductSort] = useState<'revenue' | 'units'>('revenue');
  const [selectedOrder, setSelectedOrder] = useState<RecentOrderInfo | null>(null);
  
  const { data: metrics, isLoading, error, refetch } = useQuery<DashboardMetrics>({
    queryKey: ["/api/admin/dashboard", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard?days=${timeRange}`, {
        credentials: "include"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch dashboard metrics");
      }
      return response.json();
    },
    retry: 2,
  });

  // Fetch newsletter stats for subscriber KPI
  const { data: newsletterStats } = useQuery<{ total: number; active: number; unsubscribed: number }>({
    queryKey: ["/api/admin/newsletter/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/stats", { credentials: "include" });
      if (!response.ok) return { total: 0, active: 0, unsubscribed: 0 };
      return response.json();
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">
          {error ? `Error: ${error.message}` : "Failed to load dashboard data"}
        </p>
        <Button variant="outline" onClick={() => refetch()} data-testid="button-retry-dashboard">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Calculate inventory alert counts
  const outOfStockCount = metrics.outOfStockProducts?.length || 0;
  const lowStockCount = metrics.lowStockProducts?.length || 0;
  const totalInventoryAlerts = outOfStockCount + lowStockCount;
  
  // Payment/fulfillment issues (orders with failed/refunded/chargeback status)
  const paymentIssues = metrics.recentOrders?.filter(o => 
    o.status === "refunded" || o.status === "failed" || o.status === "chargeback"
  ).length || 0;

  // Build actionable alert items - only Inventory Alerts and Payment Issues
  const alertItems = [
    ...(totalInventoryAlerts > 0 ? [{
      icon: PackageX,
      title: "Inventory Alerts",
      count: totalInventoryAlerts,
      detail: `${outOfStockCount} out, ${lowStockCount} low`,
      color: "#ef4444",
      targetTab: "products"
    }] : []),
    ...(paymentIssues > 0 ? [{
      icon: CreditCard,
      title: "Payment Issues",
      count: paymentIssues,
      detail: "Refunded or failed",
      color: "#f59e0b",
      targetTab: "orders"
    }] : []),
  ];

  // Get top 5 products by selected metric - only show if 2+ products have sales
  const topProducts = metrics.topProducts?.length >= 2 
    ? [...metrics.topProducts]
        .sort((a, b) => topProductSort === 'revenue' ? b.revenue - a.revenue : b.totalSold - a.totalSold)
        .slice(0, 5)
    : null;
  
  // Get max value for bar chart scaling
  const maxValue = topProducts 
    ? Math.max(...topProducts.map(p => topProductSort === 'revenue' ? p.revenue : p.totalSold))
    : 0;
  
  // Calculate subscriber net change for the period
  const subscriberNetChange = (newsletterStats?.active || 0) - (newsletterStats?.unsubscribed || 0);

  return (
    <div className="space-y-4">
      {/* Header with time range */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold" data-testid="text-dashboard-title">Overview</h2>
          <p className="text-muted-foreground text-xs">Quick health check</p>
        </div>
        <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
          <SelectTrigger className="w-[120px] h-8 text-xs" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* A) Top KPI Row - exactly 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-[#E7FB10]/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-xl font-bold text-[#E7FB10]" data-testid="text-total-revenue">
              {formatCurrency(metrics.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#21d8ff]/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-xl font-bold text-[#21d8ff]" data-testid="text-total-orders">
              {metrics.totalOrders}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#9d4edd]/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">AOV</p>
            <p className="text-xl font-bold text-[#9d4edd]" data-testid="text-avg-order">
              {formatCurrency(metrics.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Products Sold</p>
            <p className="text-xl font-bold" data-testid="text-products-sold">
              {metrics.totalProductsSold}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* B) Alert Strip - actionable items only */}
      {alertItems.length > 0 && (
        <Card className="border-[#E7FB10]/20 bg-[#E7FB10]/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-[#E7FB10]" />
              <span className="text-sm font-medium">Needs Attention</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alertItems.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => onNavigateToTab(item.targetTab)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/60 border border-border/50 hover:bg-background/80 transition-colors text-xs"
                  data-testid={`alert-item-${item.targetTab}`}
                >
                  <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                  <span className="font-medium" style={{ color: item.color }}>{item.count}</span>
                  <span className="text-muted-foreground">{item.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* C) Mid Section - Revenue Trend (smaller) + Top Product OR placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#21d8ff]" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-[180px]" data-testid="chart-revenue-trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueTrend}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#21d8ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#21d8ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tickFormatter={formatDate} stroke="#666" fontSize={10} />
                  <YAxis tickFormatter={(v) => `$${v}`} stroke="#666" fontSize={10} width={40} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1a1f", border: "1px solid #333", borderRadius: "6px", fontSize: "12px" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#21d8ff" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Products Chart - only show if 2+ products have sales */}
        {topProducts ? (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#E7FB10]" />
                  Top Products
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={topProductSort === 'revenue' ? 'default' : 'ghost'}
                    className={`h-6 px-2 text-xs ${topProductSort === 'revenue' ? 'bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90' : ''}`}
                    onClick={() => setTopProductSort('revenue')}
                    data-testid="button-sort-revenue"
                  >
                    Revenue
                  </Button>
                  <Button
                    size="sm"
                    variant={topProductSort === 'units' ? 'default' : 'ghost'}
                    className={`h-6 px-2 text-xs ${topProductSort === 'units' ? 'bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90' : ''}`}
                    onClick={() => setTopProductSort('units')}
                    data-testid="button-sort-units"
                  >
                    Units
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {topProducts.map((product, index) => {
                  const value = topProductSort === 'revenue' ? product.revenue : product.totalSold;
                  const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  const barColor = topProductSort === 'revenue' ? '#E7FB10' : '#21d8ff';
                  return (
                    <div key={product.productId} className="flex items-center gap-2" data-testid={`top-product-${index}`}>
                      <span className="text-xs text-muted-foreground w-4 shrink-0">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium truncate pr-2">{product.productName}</span>
                          <span className="text-xs font-bold shrink-0" style={{ color: barColor }}>
                            {topProductSort === 'revenue' ? formatCurrency(product.revenue) : `${product.totalSold} units`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <Package className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground text-center">Top Products shows when 2+ products have sales</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* D) Bottom Section - Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders (5 only) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#21d8ff]" />
                Recent Orders
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs border-[#E7FB10] text-[#E7FB10] hover:bg-[#E7FB10]/10 hover:text-[#E7FB10] shadow-[0_0_8px_rgba(231,251,16,0.3)]"
                onClick={() => onNavigateToTab("orders")}
                data-testid="button-view-all-orders"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {metrics.recentOrders.length > 0 ? (
              <div className="space-y-2">
                {metrics.recentOrders.slice(0, 5).map((order) => (
                  <button 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="w-full flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50 md:hover:bg-background/80 md:hover:border-[#21d8ff]/50 transition-colors text-left cursor-pointer"
                    data-testid={`recent-order-${order.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#21d8ff]/10 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-[#21d8ff]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{order.firstName} {order.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          order.status === "completed" || order.status === "shipped" 
                            ? "bg-green-500/20 text-green-400" 
                            : order.status === "pending" 
                            ? "bg-[#E7FB10]/20 text-[#E7FB10]"
                            : "bg-[#21d8ff]/20 text-[#21d8ff]"
                        }`}
                      >
                        {order.status}
                      </Badge>
                      <p className="text-sm font-bold text-[#E7FB10]">{formatCurrency(parseFloat(order.totalAmount))}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column - Inventory Alerts + Affiliate Summary */}
        <div className="space-y-4">
          {/* Inventory Alerts */}
          {(outOfStockCount > 0 || lowStockCount > 0 || (metrics.outOfStockDosagesCount || 0) > 0 || (metrics.lowStockDosagesCount || 0) > 0) && (
            <Card className="border-red-500/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                    <PackageX className="h-4 w-4" />
                    Inventory Alerts
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => onNavigateToTab("products")}
                  >
                    Fix
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {/* Dosage Summary */}
                <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground border-b border-muted-foreground/20 pb-2">
                  {(metrics.outOfStockDosagesCount || 0) > 0 && (
                    <span className="text-red-400">{metrics.outOfStockDosagesCount} out of stock</span>
                  )}
                  {(metrics.lowStockDosagesCount || 0) > 0 && (
                    <span className="text-orange-400">{metrics.lowStockDosagesCount} low stock</span>
                  )}
                  {(metrics.outOfStockDosagesCount || 0) === 0 && (metrics.lowStockDosagesCount || 0) === 0 && (
                    <span>All dosages stocked</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {metrics.outOfStockProducts?.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-1.5 rounded bg-red-500/10 text-xs">
                      <span className="truncate">{product.name}</span>
                      <Badge variant="destructive" className="text-[10px] h-5">Out</Badge>
                    </div>
                  ))}
                  {metrics.lowStockProducts?.slice(0, 2).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-1.5 rounded bg-orange-500/10 text-xs">
                      <span className="truncate">{product.name}</span>
                      <Badge className="text-[10px] h-5 bg-orange-500/20 text-orange-400">{product.stockAmount}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Affiliate Summary - minimized to 1 stat */}
          <Card>
            <CardContent className="p-4">
              <button 
                onClick={() => onNavigateToTab("affiliates")}
                className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#9d4edd]" />
                  <span className="text-sm text-muted-foreground">Affiliate Revenue</span>
                </div>
                <span className="text-lg font-bold text-[#9d4edd]">
                  {formatCurrency(metrics.totalAffiliateCommissions)}
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Subscriber KPI - always shown */}
          <Card>
            <CardContent className="p-4">
              <button 
                onClick={() => onNavigateToTab("email")}
                className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#21d8ff]" />
                  <span className="text-sm text-muted-foreground">Subscribers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#21d8ff]">{newsletterStats?.total || 0}</span>
                  <span className={`text-xs ${subscriberNetChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({subscriberNetChange >= 0 ? '+' : ''}{subscriberNetChange} net)
                  </span>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Quick View Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#21d8ff]" />
              Order #{selectedOrder?.id?.toString().slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.createdAt ? (selectedOrder.createdAt instanceof Date ? selectedOrder.createdAt : new Date(selectedOrder.createdAt)).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.firstName} {selectedOrder.lastName}</p>
                </div>
                <Badge 
                  variant="secondary"
                  className={`${
                    selectedOrder.status === "completed" || selectedOrder.status === "shipped" 
                      ? "bg-green-500/20 text-green-400" 
                      : selectedOrder.status === "pending" 
                      ? "bg-[#E7FB10]/20 text-[#E7FB10]"
                      : "bg-[#21d8ff]/20 text-[#21d8ff]"
                  }`}
                >
                  {selectedOrder.status}
                </Badge>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Order Total</p>
                <p className="text-2xl font-bold text-[#E7FB10]">
                  {formatCurrency(parseFloat(selectedOrder.totalAmount))}
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
                <Button
                  className="bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
                  onClick={() => {
                    setSelectedOrder(null);
                    onNavigateToTab("orders");
                  }}
                  data-testid="button-view-full-order"
                >
                  View Full Details
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductsTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dosageStocks, setDosageStocks] = useState<DosageStockItem[]>([]);
  const [newDosage, setNewDosage] = useState("");
  const { toast } = useToast();
  
  // Navigation/filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");

  // Fetch products with dosage stock data
  const { data: productsWithStock, isLoading } = useQuery<ProductWithDosageStock[]>({
    queryKey: ["/api/admin/products-with-stock"],
  });

  // Fallback to regular products for non-admin use
  const products = productsWithStock;
  
  // Get unique categories for filter tabs
  const categories = Array.from(new Set(products?.map(p => p.category) || [])).sort();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4 text-[#E7FB10]" />
      : <ArrowDown className="ml-2 h-4 w-4 text-[#E7FB10]" />;
  };

  // Helper to check product stock status
  const getProductStockStatus = (product: ProductWithDosageStock): "in-stock" | "low-stock" | "out-of-stock" => {
    const stocks = product.dosageStocks || [];
    if (stocks.length === 0) {
      return product.inStock ? "in-stock" : "out-of-stock";
    }
    const allOutOfStock = stocks.every(s => !s.inStock || s.stockAmount <= 0);
    if (allOutOfStock) return "out-of-stock";
    const hasLowStock = stocks.some(s => s.inStock && s.stockAmount > 0 && s.stockAmount <= 3);
    if (hasLowStock) return "low-stock";
    return "in-stock";
  };

  // Filter products based on search, category, and stock filters
  const filteredProducts = products?.filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesCategory = product.category.toLowerCase().includes(query);
      if (!matchesName && !matchesCategory) return false;
    }
    
    // Category filter
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
    
    // Stock filter
    if (stockFilter !== "all") {
      const status = getProductStockStatus(product as ProductWithDosageStock);
      if (stockFilter !== status) return false;
    }
    
    return true;
  });

  const sortedProducts = filteredProducts?.slice().sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "price":
        comparison = Number(a.price) - Number(b.price);
        break;
      case "status":
        const aStatus = a.inStock ? (a.featured ? 2 : 1) : 0;
        const bStatus = b.inStock ? (b.featured ? 2 : 1) : 0;
        comparison = aStatus - bStatus;
        break;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      originalPrice: "",
      category: "Peptides",
      inStock: true,
      featured: false,
      showOnLandingPage: false,
      benefits: "",
      usage: "",
      imageUrl: "",
      stockAmount: 0,
      dosageOptions: "",
    },
  });

  // Count products currently shown on landing page
  const landingPageProductCount = products?.filter(p => p.showOnLandingPage && p.inStock).length || 0;
  const isLandingPageFull = landingPageProductCount >= 3;

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/products", data);
      return response.json();
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/products/${id}`, data);
      return response.json();
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-stock"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  // Mutation for syncing dosage stocks
  const syncDosageStocksMutation = useMutation({
    mutationFn: async ({ productId, dosageStocks }: { productId: string; dosageStocks: DosageStockItem[] }) => {
      const response = await apiRequest("POST", `/api/admin/products/${productId}/dosage-stocks`, { dosageStocks });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
    },
    onError: () => {
      toast({ title: "Failed to update dosage inventory", variant: "destructive" });
    },
  });

  // Helper to get dosage stock summary for a product
  const getDosageStockSummary = (product: ProductWithDosageStock) => {
    const stocks = product.dosageStocks || [];
    if (stocks.length === 0) return null;
    const inStockCount = stocks.filter(s => s.inStock).length;
    return { inStock: inStockCount, total: stocks.length };
  };

  const handleOpenDialog = (product?: ProductWithDosageStock | Product) => {
    if (product) {
      setEditingProduct(product);
      setProductImageUrl(product.imageUrl || null);
      
      // Load existing dosage stocks or initialize from dosageOptions
      const productWithStock = product as ProductWithDosageStock;
      if (productWithStock.dosageStocks && productWithStock.dosageStocks.length > 0) {
        setDosageStocks(productWithStock.dosageStocks.map(ds => ({
          dosage: ds.dosage,
          stockAmount: ds.stockAmount,
          inStock: ds.inStock,
          price: ds.price,
          originalPrice: ds.originalPrice,
        })));
      } else if (product.dosageOptions && product.dosageOptions.length > 0) {
        // Initialize from dosageOptions with default values
        setDosageStocks(product.dosageOptions.map(dosage => ({
          dosage,
          stockAmount: Math.floor((product.stockAmount || 0) / product.dosageOptions!.length),
          inStock: product.inStock ?? true,
          price: null,
          originalPrice: null,
        })));
      } else {
        setDosageStocks([{ dosage: "10mg", stockAmount: product.stockAmount || 0, inStock: product.inStock ?? true, price: null, originalPrice: null }]);
      }
      
      form.reset({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        originalPrice: product.originalPrice || "",
        category: product.category,
        inStock: product.inStock ?? true,
        featured: product.featured ?? false,
        showOnLandingPage: product.showOnLandingPage ?? false,
        benefits: product.benefits?.join(", ") || "",
        usage: product.usage || "",
        imageUrl: product.imageUrl || "",
        stockAmount: product.stockAmount || 0,
        dosageOptions: product.dosageOptions?.join(", ") || "",
      });
    } else {
      setEditingProduct(null);
      setProductImageUrl(null);
      setDosageStocks([{ dosage: "10mg", stockAmount: 0, inStock: true, price: null, originalPrice: null }]);
      form.reset();
    }
    setNewDosage("");
    setIsDialogOpen(true);
  };

  // Dosage stock management helpers
  const updateDosageStock = (index: number, field: keyof DosageStockItem, value: any) => {
    setDosageStocks(prev => prev.map((ds, i) => {
      if (i !== index) return ds;
      const updated = { ...ds, [field]: value };
      // Enforce rule: if stockAmount = 0, status must be Out of Stock
      if (field === 'stockAmount' && value === 0) {
        updated.inStock = false;
      }
      return updated;
    }));
  };

  const addDosage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmedDosage = newDosage.trim().toUpperCase();
    if (!trimmedDosage) {
      toast({
        title: "Enter a dosage",
        description: "Please enter a dosage value (e.g., 15mg)",
        variant: "destructive",
      });
      return;
    }
    if (dosageStocks.some(ds => ds.dosage.toUpperCase() === trimmedDosage)) {
      toast({
        title: "Dosage exists",
        description: `${trimmedDosage} already exists in the inventory`,
        variant: "destructive",
      });
      return;
    }
    setDosageStocks(prev => [...prev, { dosage: trimmedDosage, stockAmount: 0, inStock: true, price: null, originalPrice: null }]);
    setNewDosage("");
    toast({
      title: "Dosage added",
      description: `${trimmedDosage} has been added to inventory`,
    });
  };

  const removeDosage = (index: number) => {
    if (dosageStocks.length > 1) {
      setDosageStocks(prev => prev.filter((_, i) => i !== index));
    }
  };

  const markAllInStock = () => {
    setDosageStocks(prev => prev.map(ds => ({ ...ds, inStock: true })));
  };

  const markAllOutOfStock = () => {
    setDosageStocks(prev => prev.map(ds => ({ ...ds, inStock: false, stockAmount: 0 })));
  };

  const handleProductImageUpload = useCallback(async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await response.json();
      return { method: "PUT" as const, url: uploadURL };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
    }
  }, []);

  const handleProductImageComplete = async (result: any) => {
    try {
      setIsUploadingImage(true);
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        const response = await apiRequest("PUT", "/api/objects/finalize", { uploadURL });
        const { objectPath } = await response.json();
        
        setProductImageUrl(objectPath);
        form.setValue("imageUrl", objectPath);
        toast({ title: "Image uploaded successfully" });
      }
    } catch (error) {
      console.error("Failed to finalize upload:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProductImage = async () => {
    if (productImageUrl) {
      try {
        await apiRequest("DELETE", "/api/objects/delete", { objectPath: productImageUrl });
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
    setProductImageUrl(null);
    form.setValue("imageUrl", "");
  };

  const onSubmit = async (values: ProductFormValues) => {
    // Calculate aggregate stock values from dosage stocks
    const totalStock = dosageStocks.reduce((sum, ds) => sum + ds.stockAmount, 0);
    const anyInStock = dosageStocks.some(ds => ds.inStock);
    
    const data = {
      ...values,
      benefits: values.benefits ? values.benefits.split(",").map((b) => b.trim()).filter(Boolean) : [],
      dosageOptions: dosageStocks.map(ds => ds.dosage), // Use dosages from inventory manager
      originalPrice: values.originalPrice || null,
      imageUrl: values.imageUrl || null,
      stockAmount: totalStock,
      inStock: anyInStock,
    };

    const handleSaveComplete = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    };

    if (editingProduct) {
      // Update product, then sync dosage stocks
      updateMutation.mutate({ id: editingProduct.id, data }, {
        onSuccess: () => {
          syncDosageStocksMutation.mutate(
            { productId: editingProduct.id, dosageStocks },
            {
              onSuccess: () => {
                toast({ title: "Product and inventory updated successfully" });
                handleSaveComplete();
              },
              onError: () => {
                toast({ title: "Product saved but inventory sync failed", variant: "destructive" });
                handleSaveComplete();
              }
            }
          );
        }
      });
    } else {
      // Create product, then sync dosage stocks
      createMutation.mutate(data, {
        onSuccess: (newProduct: Product) => {
          if (newProduct?.id) {
            syncDosageStocksMutation.mutate(
              { productId: newProduct.id, dosageStocks },
              {
                onSuccess: () => {
                  toast({ title: "Product created with inventory" });
                  handleSaveComplete();
                },
                onError: () => {
                  toast({ title: "Product created but inventory sync failed", variant: "destructive" });
                  handleSaveComplete();
                }
              }
            );
          } else {
            toast({ title: "Product created successfully" });
            handleSaveComplete();
          }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with title and Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inventory ({products?.length || 0})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update the product details below." : "Fill in the details for the new product."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-short-desc" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} data-testid="input-product-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!dosageStocks.length && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" data-testid="input-product-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" data-testid="input-product-original-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {/* Dosage Inventory Manager */}
                <div className="space-y-4 p-4 rounded-lg border border-[#21d8ff]/30 bg-[#21d8ff]/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#21d8ff]" />
                      <h4 className="font-semibold text-[#21d8ff]">Dosage Inventory</h4>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={markAllInStock}
                        className="text-xs border-green-500/50 text-green-500 hover:bg-green-500/10"
                        data-testid="button-mark-all-in-stock"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        All In Stock
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={markAllOutOfStock}
                        className="text-xs border-red-500/50 text-red-500 hover:bg-red-500/10"
                        data-testid="button-mark-all-out"
                      >
                        <X className="h-3 w-3 mr-1" />
                        All Out
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Manage stock levels for each dosage. Product availability is calculated from dosage stock.
                  </p>

                  {/* Dosage stock table */}
                  <div className="space-y-2">
                    {dosageStocks.map((ds, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          ds.inStock ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                        }`}
                        data-testid={`dosage-row-${index}`}
                      >
                        <div className="flex items-center gap-4 flex-wrap w-full">
                          <div className="min-w-[100px] flex-shrink-0">
                            <span className="font-display font-bold text-lg holographic-text">{ds.dosage}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Price</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={ds.price || ""}
                                onChange={(e) => updateDosageStock(index, 'price', e.target.value || null)}
                                className="w-24 h-9 pl-5 text-sm bg-background/50 border-[#21d8ff]/20 focus:border-[#21d8ff]/50"
                                data-testid={`input-price-${index}`}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Was</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={ds.originalPrice || ""}
                                onChange={(e) => updateDosageStock(index, 'originalPrice', e.target.value || null)}
                                className="w-24 h-9 pl-5 text-sm bg-background/50 border-white/10 text-muted-foreground"
                                data-testid={`input-original-price-${index}`}
                              />
                            </div>
                            {ds.originalPrice && Number(ds.originalPrice) > Number(ds.price) && (
                              <Badge className="h-5 bg-red-600 text-[10px] animate-pulse">SALE</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Stock</Label>
                            <Input
                              type="number"
                              min="0"
                              value={ds.stockAmount}
                              onChange={(e) => updateDosageStock(index, 'stockAmount', parseInt(e.target.value) || 0)}
                              className="w-20 h-9 text-center text-sm bg-background/50 border-[#E7FB10]/20"
                              data-testid={`input-stock-${index}`}
                            />
                          </div>
                          <div className="flex items-center gap-3 ml-auto">
                            <Button
                              type="button"
                              variant={ds.inStock ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                // Cannot mark "In Stock" if quantity is 0
                                if (!ds.inStock && ds.stockAmount === 0) {
                                  toast({
                                    title: "Cannot mark In Stock",
                                    description: "Add stock quantity first before marking as In Stock",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                updateDosageStock(index, 'inStock', !ds.inStock);
                              }}
                              className={`h-9 min-w-[100px] ${ds.inStock ? "bg-green-600 hover:bg-green-700 text-white" : "border-red-500/50 text-red-500 hover:bg-red-500/10"}`}
                              data-testid={`toggle-stock-${index}`}
                            >
                              {ds.inStock ? (
                                <><Check className="h-4 w-4 mr-2" /> In Stock</>
                              ) : (
                                <><X className="h-4 w-4 mr-2" /> Out</>
                              )}
                            </Button>
                            {dosageStocks.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDosage(index)}
                                className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                data-testid={`remove-dosage-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add new dosage */}
                  <div className="flex gap-2 pt-2 border-t border-[#21d8ff]/20">
                    <Input
                      placeholder="New dosage (e.g., 15mg)"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDosage();
                        }
                      }}
                      className="flex-1"
                      data-testid="input-new-dosage"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => addDosage(e)}
                      className="border-[#21d8ff]/50 text-[#21d8ff]"
                      data-testid="button-add-dosage"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Dosage
                    </Button>
                  </div>

                  {/* Stock summary */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#21d8ff]/20">
                    <span className="text-sm text-muted-foreground">Overall Status:</span>
                    <div className="flex items-center gap-3">
                      <Badge className={dosageStocks.some(ds => ds.inStock) ? "bg-green-600" : "bg-red-600"}>
                        {dosageStocks.filter(ds => ds.inStock).length}/{dosageStocks.length} In Stock
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Total: {dosageStocks.reduce((sum, ds) => sum + ds.stockAmount, 0)} units
                      </span>
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-product-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Benefit 1, Benefit 2, Benefit 3" data-testid="input-product-benefits" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Instructions</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-product-usage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            className="border-[#21d8ff]/50 data-[state=checked]:bg-[#21d8ff] data-[state=checked]:border-[#21d8ff]"
                            data-testid="checkbox-featured"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-[#21d8ff]" />
                          Featured Badge
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="showOnLandingPage"
                    render={({ field }) => {
                      const currentProductOnLandingPage = editingProduct?.showOnLandingPage ?? false;
                      const anyDosageInStock = dosageStocks.some(ds => ds.inStock);
                      const isOutOfStock = !anyDosageInStock;
                      const isDisabled = (isLandingPageFull && !currentProductOnLandingPage) || isOutOfStock;
                      
                      return (
                        <FormItem className={`flex items-start gap-3 p-3 rounded-lg border ${
                          isDisabled 
                            ? "border-muted-foreground/20 bg-muted/30 opacity-60" 
                            : "border-[#E7FB10]/30 bg-[#E7FB10]/5"
                        }`}>
                          <FormControl>
                            <Checkbox
                              checked={isOutOfStock ? false : (field.value ?? false)}
                              onCheckedChange={field.onChange}
                              disabled={isDisabled}
                              className="mt-0.5 border-[#E7FB10]/50 data-[state=checked]:bg-[#E7FB10] data-[state=checked]:border-[#E7FB10] disabled:opacity-50"
                              data-testid="checkbox-landing-page"
                            />
                          </FormControl>
                          <div className="flex flex-col gap-0.5">
                            <FormLabel className={`!mt-0 font-semibold flex items-center gap-2 ${isDisabled ? "text-muted-foreground" : "text-[#E7FB10]"}`}>
                              <Star className="h-4 w-4" />
                              Show on Landing Page
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              {isOutOfStock
                                ? `Product must be in stock to show on landing page`
                                : isLandingPageFull && !currentProductOnLandingPage
                                  ? `All 3 landing page slots are filled. Remove a product from landing page to add this one.`
                                  : `${landingPageProductCount}/3 slots used on homepage showcase`
                              }
                            </p>
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Weekly Deal Checkbox and Dropdown */}
                <FormField
                  control={form.control}
                  name="isWeeklyDeal"
                  render={({ field }) => (
                    <FormItem className={`flex items-start gap-3 p-3 rounded-lg border ${
                      field.value
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-muted-foreground/20 bg-muted/30"
                    }`}>
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          className="mt-0.5 border-red-500/50 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                          data-testid="checkbox-weekly-deal"
                        />
                      </FormControl>
                      <div className="flex flex-col gap-2 flex-1">
                        <FormLabel className={`!mt-0 font-semibold flex items-center gap-2 ${field.value ? "text-red-500" : "text-muted-foreground"}`}>
                          <Tag className="h-4 w-4" />
                          Mark as Weekly Deal
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Set this product as the featured sale of the week with a custom end date
                        </p>

                        {/* Deal End Date Dropdown - Only visible when checked */}
                        {field.value && (
                          <FormField
                            control={form.control}
                            name="weeklyDealEndDate"
                            render={({ field: dateField }) => (
                              <FormItem className="mt-2">
                                <FormLabel className="text-sm">Deal Ends</FormLabel>
                                <Select value={dateField.value || ""} onValueChange={dateField.onChange}>
                                  <FormControl>
                                    <SelectTrigger className="w-full" data-testid="select-weekly-deal-end-date">
                                      <SelectValue placeholder="Select end date" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Tomorrow">Tomorrow</SelectItem>
                                    <SelectItem value="End of This Week">End of This Week</SelectItem>
                                    <SelectItem value="Next Monday">Next Monday</SelectItem>
                                    <SelectItem value="End of This Month">End of This Month</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="flex items-center gap-4">
                    {productImageUrl ? (
                      <div className="relative">
                        <img
                          src={productImageUrl}
                          alt="Product"
                          className="w-24 h-24 object-cover rounded-md border"
                          data-testid="img-product-preview"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={handleRemoveProductImage}
                          data-testid="button-remove-product-image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <ObjectUploader
                      onGetUploadParameters={handleProductImageUpload}
                      onComplete={handleProductImageComplete}
                      buttonVariant="outline"
                      buttonSize="sm"
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {productImageUrl ? "Change Image" : "Upload Image"}
                        </>
                      )}
                    </ObjectUploader>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className={form.formState.isDirty ? "bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90" : ""}
                    data-testid="button-save-product"
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Product"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar - Search, Category, and Stock filters */}
      <div className="flex flex-col gap-3 p-4 rounded-lg border bg-card/50">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-products"
          />
        </div>
        
        {/* Filter Buttons Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Category:</span>
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
              data-testid="filter-category-all"
            >
              All
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                data-testid={`filter-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </Button>
            ))}
          </div>
          
          {/* Divider */}
          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
          
          {/* Stock Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Stock:</span>
            <Button
              variant={stockFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStockFilter("all")}
              data-testid="filter-stock-all"
            >
              All
            </Button>
            <Button
              variant={stockFilter === "in-stock" ? "default" : "outline"}
              size="sm"
              onClick={() => setStockFilter("in-stock")}
              className="border-green-500/50 text-green-500"
              data-testid="filter-stock-in"
            >
              In Stock
            </Button>
            <Button
              variant={stockFilter === "low-stock" ? "default" : "outline"}
              size="sm"
              onClick={() => setStockFilter("low-stock")}
              className="border-orange-500/50 text-orange-500"
              data-testid="filter-stock-low"
            >
              Low Stock
            </Button>
            <Button
              variant={stockFilter === "out-of-stock" ? "default" : "outline"}
              size="sm"
              onClick={() => setStockFilter("out-of-stock")}
              className="border-red-500/50 text-red-500"
              data-testid="filter-stock-out"
            >
              Out of Stock
            </Button>
          </div>
        </div>
        
        {/* Results count */}
        {(searchQuery || categoryFilter !== "all" || stockFilter !== "all") && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {sortedProducts?.length || 0} of {products?.length || 0} products
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStockFilter("all");
              }}
              data-testid="button-clear-filters"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Product Table with sticky header */}
      <div className="rounded-md border max-h-[60vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center hover:text-foreground transition-colors"
                  data-testid="sort-name"
                >
                  Name
                  {getSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("category")}
                  className="flex items-center hover:text-foreground transition-colors"
                  data-testid="sort-category"
                >
                  Category
                  {getSortIcon("category")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("price")}
                  className="flex items-center hover:text-foreground transition-colors"
                  data-testid="sort-price"
                >
                  Price
                  {getSortIcon("price")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center hover:text-foreground transition-colors"
                  data-testid="sort-status"
                >
                  Status
                  {getSortIcon("status")}
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts?.map((product) => {
              const productWithStock = product as ProductWithDosageStock;
              const stockSummary = getDosageStockSummary(productWithStock);
              const anyInStock = stockSummary ? stockSummary.inStock > 0 : product.inStock;
              
              return (
                <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {stockSummary ? (
                        <Badge 
                          variant={stockSummary.inStock > 0 ? "secondary" : "destructive"}
                          className={stockSummary.inStock === stockSummary.total ? "bg-green-600 text-white" : ""}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          {stockSummary.inStock}/{stockSummary.total} Dosages
                        </Badge>
                      ) : (
                        product.inStock ? (
                          <Badge variant="secondary">In Stock</Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )
                      )}
                      {product.featured && <Badge className="bg-[#21d8ff] text-black">Featured</Badge>}
                      {product.showOnLandingPage && anyInStock && <Badge className="bg-[#E7FB10] text-black">Landing</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(productWithStock)} data-testid={`button-edit-product-${product.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(product.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-product-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CoasTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoa, setEditingCoa] = useState<Coa | null>(null);
  const [coaImageUrl, setCoaImageUrl] = useState<string | null>(null);
  const [isUploadingCoaImage, setIsUploadingCoaImage] = useState(false);
  const { toast } = useToast();

  const { data: allCoas, isLoading } = useQuery<Coa[]>({
    queryKey: ["/api/admin/coas"],
  });

  // Use ProductWithDosageStock for accurate inventory status (matches Inventory tab)
  const { data: productsWithStock } = useQuery<ProductWithDosageStock[]>({
    queryKey: ["/api/admin/products-with-stock"],
  });
  
  // Also get basic products list for the form dropdown
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<CoaFormValues>({
    resolver: zodResolver(coaFormSchema),
    defaultValues: {
      batchNumber: "",
      productId: "",
      productName: "",
      testDate: "",
      expirationDate: "",
      purity: "",
      labName: "",
      verified: true,
      results: "",
      publiclyVisible: true,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/coas", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create COA", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/coas/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA updated successfully" });
      setIsDialogOpen(false);
      setEditingCoa(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update COA", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/coas/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coas"] });
      toast({ title: "COA deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete COA", variant: "destructive" });
    },
  });

  const handleOpenDialog = (coa?: Coa) => {
    if (coa) {
      setEditingCoa(coa);
      setCoaImageUrl(coa.imageUrl || null);
      form.reset({
        batchNumber: coa.batchNumber,
        productId: coa.productId,
        productName: coa.productName,
        testDate: coa.testDate,
        expirationDate: coa.expirationDate,
        purity: coa.purity,
        labName: coa.labName,
        verified: coa.verified ?? true,
        results: coa.results?.join(", ") || "",
        publiclyVisible: coa.publiclyVisible ?? true,
        notes: coa.notes || "",
      });
    } else {
      setEditingCoa(null);
      setCoaImageUrl(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const handleCoaImageUpload = useCallback(async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await response.json();
      return { method: "PUT" as const, url: uploadURL };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
    }
  }, []);

  const handleCoaImageComplete = async (result: any) => {
    try {
      setIsUploadingCoaImage(true);
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;
        
        const response = await apiRequest("PUT", "/api/objects/finalize", { uploadURL });
        const { objectPath } = await response.json();
        
        setCoaImageUrl(objectPath);
        toast({ title: "COA image uploaded successfully" });
      }
    } catch (error) {
      console.error("Failed to finalize upload:", error);
      toast({ title: "Failed to upload COA image", variant: "destructive" });
    } finally {
      setIsUploadingCoaImage(false);
    }
  };

  const handleRemoveCoaImage = async () => {
    if (coaImageUrl) {
      try {
        await apiRequest("DELETE", "/api/objects/delete", { objectPath: coaImageUrl });
      } catch (error) {
        console.error("Failed to delete COA image:", error);
      }
    }
    setCoaImageUrl(null);
  };

  const onSubmit = (values: CoaFormValues) => {
    const data = {
      ...values,
      results: values.results ? values.results.split(",").map((r) => r.trim()).filter(Boolean) : [],
      imageUrl: coaImageUrl || null,
    };

    if (editingCoa) {
      updateMutation.mutate({ id: editingCoa.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Certificates of Analysis ({allCoas?.length || 0})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-coa">
              <Plus className="h-4 w-4 mr-2" />
              Add COA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoa ? "Edit COA" : "Add New COA"}</DialogTitle>
              <DialogDescription>
                {editingCoa ? "Update the COA details below." : "Fill in the certificate of analysis details."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., BPC-2024-001" data-testid="input-coa-batch" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          const product = products?.find(p => p.id === value);
                          if (product) {
                            form.setValue("productName", product.name);
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-coa-product">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-coa-product-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="testDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-coa-test-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-coa-expiration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purity</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 99.2%" data-testid="input-coa-purity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lab Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Analytical Labs Inc." data-testid="input-coa-lab" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="results"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Results (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="HPLC Analysis: Pass, Mass Spectrometry: Confirmed, Sterility: Pass" data-testid="input-coa-results" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="verified"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-coa-verified"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Verified</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="publiclyVisible"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? true}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-coa-publicly-visible"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Publicly Visible</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Read-only Public URL */}
                {form.watch("batchNumber") && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Public URL</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={`/coa/${form.watch("batchNumber")}`}
                        readOnly
                        className="bg-muted font-mono text-sm"
                        data-testid="input-coa-public-url"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/coa/${form.watch("batchNumber")}`);
                          toast({ title: "URL copied to clipboard" });
                        }}
                        data-testid="button-copy-coa-url"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Internal Notes (Admin-only) */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Internal Notes
                        <Badge variant="secondary" className="text-xs" data-testid="badge-admin-only">Admin Only</Badge>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={2} 
                          placeholder="Internal notes (not visible to customers)" 
                          data-testid="input-coa-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label>COA Document Image</Label>
                  <div className="flex items-center gap-4">
                    {coaImageUrl ? (
                      <div className="relative">
                        <img
                          src={coaImageUrl}
                          alt="COA Document"
                          className="w-24 h-24 object-cover rounded-md border"
                          data-testid="img-coa-preview"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={handleRemoveCoaImage}
                          data-testid="button-remove-coa-image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/50">
                        <FileCheck className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <ObjectUploader
                      onGetUploadParameters={handleCoaImageUpload}
                      onComplete={handleCoaImageComplete}
                      buttonVariant="outline"
                      buttonSize="sm"
                      disabled={isUploadingCoaImage}
                    >
                      {isUploadingCoaImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {coaImageUrl ? "Change Image" : "Upload Image"}
                        </>
                      )}
                    </ObjectUploader>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-coa">
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save COA"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Purity</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCoas?.map((coa) => {
              // Use ProductWithDosageStock for accurate inventory status (matches Inventory tab)
              const linkedProduct = productsWithStock?.find(p => p.id === coa.productId);
              
              // Exact same logic as Inventory tab's getProductStockStatus function
              const getStockStatus = (): "Active" | "Low" | "Depleted" | "Unknown" => {
                if (!linkedProduct) return "Unknown";
                
                const stocks = linkedProduct.dosageStocks || [];
                if (stocks.length === 0) {
                  return linkedProduct.inStock ? "Active" : "Depleted";
                }
                // Match server-side LOW_STOCK_THRESHOLD = 3
                const allOutOfStock = stocks.every(s => !s.inStock || (s.stockAmount ?? 0) <= 0);
                if (allOutOfStock) return "Depleted";
                const hasLowStock = stocks.some(s => s.inStock && (s.stockAmount ?? 0) > 0 && (s.stockAmount ?? 0) <= 3);
                if (hasLowStock) return "Low";
                return "Active";
              };
              
              const stockStatus = getStockStatus();
              
              return (
                <TableRow key={coa.id} data-testid={`row-coa-${coa.id}`}>
                  <TableCell className="font-mono">{coa.batchNumber}</TableCell>
                  <TableCell>{coa.productName}</TableCell>
                  <TableCell>{coa.purity}</TableCell>
                  <TableCell>{coa.labName}</TableCell>
                  <TableCell>
                    {coa.publiclyVisible !== false ? (
                      <Badge variant="secondary" data-testid={`badge-coa-visible-${coa.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground" data-testid={`badge-coa-hidden-${coa.id}`}>
                        Hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        stockStatus === "Depleted" 
                          ? "border-red-500/50 text-red-500" 
                          : stockStatus === "Low" 
                            ? "border-orange-500/50 text-orange-500" 
                            : "border-green-500/50 text-green-500"
                      }
                      data-testid={`badge-coa-stock-${coa.id}`}
                    >
                      {stockStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coa.verified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coa)} data-testid={`button-edit-coa-${coa.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(coa.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-coa-${coa.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type OrderStats = {
  grossRevenue: number;
  paidOrders: number;
  aov: number;
  refundCount: number;
  refundAmount: number;
  emailFailures: number;
  needsAttention: {
    emailFailedPaid: number;
    pendingOver24h: number;
    refunds: number;
  };
};

function OrdersTab() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [hideTestOrders, setHideTestOrders] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  const { data: allOrders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: orderStats } = useQuery<OrderStats>({
    queryKey: ["/api/admin/orders/stats"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  const updateFulfillmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}/fulfillment`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/stats"] });
      toast({ title: "Fulfillment updated", duration: 3000 });
    },
    onError: () => {
      toast({ title: "Failed to update fulfillment", variant: "destructive" });
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/orders/${id}/resend-email`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/stats"] });
      toast({ title: "Email sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send email", variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/orders/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/stats"] });
      setIsViewDialogOpen(false);
      setSelectedOrder(null);
      toast({ title: "Order deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete order", variant: "destructive" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(id => apiRequest("DELETE", `/api/admin/orders/${id}`).then(r => r.json()).catch(() => null))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/stats"] });
      setSelectedOrderIds(new Set());
      toast({ title: `${selectedOrderIds.size} order(s) deleted successfully` });
    },
    onError: () => {
      toast({ title: "Failed to delete some orders", variant: "destructive" });
    },
  });

  const toggleOrderSelection = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrderIds.size === 0) return;
    if (confirm(`Delete ${selectedOrderIds.size} order(s)? This cannot be undone.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedOrderIds));
    }
  };

  const getProductName = (productId: string) => {
    return products?.find((p) => p.id === productId)?.name || "Unknown Product";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const getPaymentStatusBadge = (status: string | null, isRefunded?: boolean) => {
    if (isRefunded) {
      return <Badge variant="destructive">Refunded</Badge>;
    }
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      paid: { label: "Paid", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
      failed: { label: "Failed", variant: "destructive" },
    };
    const config = statusMap[status || "pending"] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFulfillmentStatusBadge = (status: string | null | undefined) => {
    // Manual fulfillment: pending → preparing → ready → delivered
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pending", variant: "outline" },
      preparing: { label: "Preparing", variant: "secondary" },
      ready: { label: "Ready", variant: "default" },
      delivered: { label: "Delivered", variant: "default" },
    };
    const config = statusMap[status || "pending"] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getOrderTypeBadge = (orderType: string | null | undefined) => {
    if (orderType === "subscription") {
      return <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">Sub</Badge>;
    }
    return null;
  };

  const getTestBadge = (isTest: boolean | null | undefined) => {
    if (isTest) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">TEST</Badge>;
    }
    return null;
  };

  const getEmailStatusBadge = (status: string | null | undefined) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pending", variant: "outline" },
      sent: { label: "Sent", variant: "default" },
      failed: { label: "Failed", variant: "destructive" },
    };
    const config = statusMap[status || "pending"] || statusMap.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Compute needsAttention flag per order:
  // (paid AND fulfillment ≠ delivered) OR emailStatus = failed OR isRefunded = true
  const computeNeedsAttention = (order: Order): boolean => {
    const isPaid = order.status === "paid";
    const notDelivered = order.fulfillmentStatus !== "delivered";
    const emailFailed = order.emailStatus === "failed";
    const isRefunded = order.isRefunded === true;
    return (isPaid && notDelivered) || emailFailed || isRefunded;
  };

  const needsAttentionOrders = allOrders?.filter(computeNeedsAttention) || [];

  const filteredOrders = allOrders?.filter((order) => {
    // Apply test order filter first
    if (hideTestOrders && order.isTest) return false;
    
    if (activeFilter === "all") return true;
    if (activeFilter === "needs-attention") return computeNeedsAttention(order);
    if (activeFilter === "paid") return order.status === "paid";
    if (activeFilter === "pending") {
      return order.status === "paid" && order.fulfillmentStatus !== "delivered";
    }
    if (activeFilter === "email-failed") return order.emailStatus === "failed";
    return true;
  }) || [];
  
  // Count test orders for display
  const testOrderCount = allOrders?.filter(o => o.isTest).length || 0;

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-orders-revenue" className="border-[#E7FB10]/30 bg-[#E7FB10]/5">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#E7FB10]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E7FB10]">{formatCurrency(orderStats?.grossRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Paid orders (30d)</p>
          </CardContent>
        </Card>

        <Card data-testid="card-orders-count" className="border-[#21d8ff]/30 bg-[#21d8ff]/5">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <Package className="h-4 w-4 text-[#21d8ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#21d8ff]">{orderStats?.paidOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card data-testid="card-orders-aov">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AOV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(orderStats?.aov || 0)}</div>
            <p className="text-xs text-muted-foreground">Avg order value</p>
          </CardContent>
        </Card>

        <Card data-testid="card-orders-email-failures" className={orderStats?.emailFailures ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Issues</CardTitle>
            <Mail className={`h-4 w-4 ${orderStats?.emailFailures ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${orderStats?.emailFailures ? "text-destructive" : ""}`}>
              {orderStats?.emailFailures || 0}
            </div>
            <p className="text-xs text-muted-foreground">Failed emails</p>
          </CardContent>
        </Card>
      </div>

      {needsAttentionOrders.length > 0 && (
        <Card className="border-[#E7FB10]/30 bg-[#E7FB10]/5" data-testid="card-needs-attention">
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#E7FB10]" />
                <span className="font-medium">{needsAttentionOrders.length} orders need attention</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#E7FB10]"
                onClick={() => setActiveFilter("needs-attention")}
                data-testid="button-filter-needs-attention"
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant={activeFilter === "all" ? "default" : "outline"}
          onClick={() => setActiveFilter("all")}
          data-testid="button-filter-all"
        >
          All ({allOrders?.length || 0})
        </Button>
        {needsAttentionOrders.length > 0 && (
          <Button 
            variant={activeFilter === "needs-attention" ? "default" : "outline"}
            className={activeFilter !== "needs-attention" ? "border-[#E7FB10]/50 text-[#E7FB10]" : ""}
            onClick={() => setActiveFilter("needs-attention")}
            data-testid="button-filter-needs-attention"
          >
            Needs Attention ({needsAttentionOrders.length})
          </Button>
        )}
        <Button 
          variant={activeFilter === "paid" ? "default" : "outline"}
          onClick={() => setActiveFilter("paid")}
          data-testid="button-filter-paid"
        >
          Paid
        </Button>
        <Button 
          variant={activeFilter === "pending" ? "default" : "outline"}
          onClick={() => setActiveFilter("pending")}
          data-testid="button-filter-pending-btn"
        >
          Pending
        </Button>
        <Button 
          variant={activeFilter === "email-failed" ? "default" : "outline"}
          onClick={() => setActiveFilter("email-failed")}
          data-testid="button-filter-email-failed-btn"
        >
          Email Failed
        </Button>
        
        {/* Test Order Toggle */}
        {testOrderCount > 0 && (
          <Button 
            variant={hideTestOrders ? "default" : "outline"}
            onClick={() => setHideTestOrders(!hideTestOrders)}
            className={hideTestOrders ? "bg-orange-500" : "border-orange-500/50 text-orange-400"}
            data-testid="button-toggle-test-orders"
          >
            {hideTestOrders ? "Show" : "Hide"} Test ({testOrderCount})
          </Button>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedOrderIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 border rounded-lg">
          <span className="text-sm font-medium">
            {selectedOrderIds.size} order{selectedOrderIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrderIds(new Set())}
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              data-testid="button-bulk-delete"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {bulkDeleteMutation.isPending ? "Deleting..." : `Delete ${selectedOrderIds.size}`}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={filteredOrders.length > 0 && selectedOrderIds.size === filteredOrders.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all orders"
                  data-testid="checkbox-select-all"
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const orderNeedsAttention = computeNeedsAttention(order);
                const fulfillmentBgClass = 
                  order.fulfillmentStatus === 'pending' ? 'bg-amber-500/5' :
                  order.fulfillmentStatus === 'preparing' ? 'bg-cyan-500/8' :
                  order.fulfillmentStatus === 'ready' ? 'bg-emerald-500/8' :
                  order.fulfillmentStatus === 'delivered' ? 'bg-green-500/10' : '';
                return (
                <TableRow 
                  key={order.id} 
                  data-testid={`row-order-${order.id}`}
                  className={`cursor-pointer hover-elevate ${fulfillmentBgClass} ${orderNeedsAttention ? "border-l-2 border-l-[#E7FB10]" : ""} ${selectedOrderIds.has(order.id) ? "bg-muted/50" : ""}`}
                  onClick={() => handleViewOrder(order)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedOrderIds.has(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id, { stopPropagation: () => {} } as React.MouseEvent)}
                      aria-label={`Select order ${order.id.slice(-8)}`}
                      data-testid={`checkbox-order-${order.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {orderNeedsAttention && (
                          <AlertTriangle className="h-3 w-3 text-[#E7FB10]" />
                        )}
                        <span className="font-mono text-sm">{order.id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getOrderTypeBadge(order.orderType)}
                        {getTestBadge(order.isTest)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.firstName} {order.lastName}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(order.totalAmount))}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.status, order.isRefunded ?? undefined)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={order.fulfillmentStatus || "pending"}
                      onValueChange={(status) => updateFulfillmentMutation.mutate({ 
                        id: order.id, 
                        data: { fulfillmentStatus: status }
                      })}
                      disabled={updateFulfillmentMutation.isPending}
                    >
                      <SelectTrigger className="w-28" data-testid={`select-fulfillment-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {getEmailStatusBadge(order.emailStatus)}
                      {order.emailStatus === "failed" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => resendEmailMutation.mutate(order.id)}
                          disabled={resendEmailMutation.isPending}
                          data-testid={`button-resend-email-${order.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${resendEmailMutation.isPending ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground md:hover:text-red-500 md:hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm(`Delete order #${order.id.slice(-8).toUpperCase()}? This cannot be undone.`)) {
                          deleteOrderMutation.mutate(order.id);
                        }
                      }}
                      disabled={deleteOrderMutation.isPending}
                      data-testid={`button-delete-order-${order.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <OrderViewDialog 
        order={selectedOrder}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        products={products || []}
        isFulfillmentPending={updateFulfillmentMutation.isPending}
        onUpdateFulfillment={(data, closeAfter = false) => {
          if (selectedOrder) {
            updateFulfillmentMutation.mutate({ id: selectedOrder.id, data }, {
              onSuccess: () => {
                if (closeAfter) {
                  setIsViewDialogOpen(false);
                }
              }
            });
          }
        }}
        onResendEmail={() => {
          if (selectedOrder) {
            resendEmailMutation.mutate(selectedOrder.id);
          }
        }}
        onUpdateStatus={(status) => {
          if (selectedOrder) {
            updateStatusMutation.mutate({ id: selectedOrder.id, status });
          }
        }}
      />
    </div>
  );
}

function OrderViewDialog({ 
  order, 
  open, 
  onOpenChange, 
  products,
  isFulfillmentPending,
  onUpdateFulfillment,
  onResendEmail,
  onUpdateStatus
}: { 
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  isFulfillmentPending?: boolean;
  onUpdateFulfillment: (data: any, closeAfter?: boolean) => void;
  onResendEmail: () => void;
  onUpdateStatus: (status: string) => void;
}) {
  const [notes, setNotes] = useState(order?.fulfillmentNotes || "");
  const [paymentConfirmed, setPaymentConfirmed] = useState(order?.paymentConfirmed || false);
  const [addressCollected, setAddressCollected] = useState(order?.addressCollected || false);
  const [packed, setPacked] = useState(order?.packed || false);

  useEffect(() => {
    if (order) {
      setNotes(order.fulfillmentNotes || "");
      setPaymentConfirmed(order.paymentConfirmed || false);
      setAddressCollected(order.addressCollected || false);
      setPacked(order.packed || false);
    }
  }, [order]);

  if (!order) return null;

  const product = products.find(p => p.id === order.productId);

  const handleSaveChecklist = () => {
    onUpdateFulfillment({
      paymentConfirmed,
      addressCollected,
      packed,
      fulfillmentNotes: notes,
    });
  };

  const handleMarkDelivered = () => {
    onUpdateFulfillment({
      fulfillmentStatus: "delivered",
      paymentConfirmed: true,
      addressCollected: true,
      packed: true,
      fulfillmentNotes: notes,
    }, true); // Close dialog after success
  };

  const isPaid = order.status === "paid";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order {order.id.slice(-8).toUpperCase()}
            <Badge variant={isPaid ? "default" : "secondary"}>
              {isPaid ? "Paid" : order.status || "Pending"}
            </Badge>
            {order.isTest && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">TEST</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Customer</h4>
              <div className="text-sm space-y-1">
                <p>{order.firstName} {order.lastName}</p>
                <p className="text-muted-foreground">{order.email}</p>
                {order.address && (
                  <div className="mt-2 text-muted-foreground">
                    <p>{order.address}</p>
                    <p>{order.city}, {order.state} {order.zipCode}</p>
                    <p>{order.country}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Order Details</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Type:</span> {order.orderType === 'subscription' ? 'Subscription' : 'One-time'}</p>
                <p><span className="text-muted-foreground">Product:</span> {product?.name || "Unknown"}</p>
                <p><span className="text-muted-foreground">Quantity:</span> {order.quantity}</p>
                <p><span className="text-muted-foreground">Total:</span> ${Number(order.totalAmount).toFixed(2)}</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date(order.createdAt!).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Email Status</h4>
            <div className="flex items-center gap-4">
              <Badge variant={order.emailStatus === "sent" ? "default" : order.emailStatus === "failed" ? "destructive" : "secondary"}>
                {order.emailStatus === "sent" ? "Sent" : order.emailStatus === "failed" ? "Failed" : "Pending"}
              </Badge>
              {order.emailSentAt && (
                <span className="text-sm text-muted-foreground">
                  Sent {new Date(order.emailSentAt).toLocaleString()}
                </span>
              )}
              {order.emailStatus === "failed" && (
                <Button size="sm" variant="outline" onClick={onResendEmail}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              {order.emailError && (
                <span className="text-sm text-destructive">{order.emailError}</span>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Fulfillment Checklist</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="payment-confirmed" 
                  checked={paymentConfirmed}
                  onCheckedChange={(checked) => setPaymentConfirmed(!!checked)}
                  data-testid="checkbox-payment-confirmed"
                />
                <label htmlFor="payment-confirmed" className="text-sm flex items-center gap-2">
                  Payment confirmed:
                  {order.paymentMethod === 'paypal' && (
                    <Badge variant="outline" className="bg-[#0070ba]/10 text-[#0070ba] border-[#0070ba]/30">PayPal</Badge>
                  )}
                  {order.paymentMethod === 'cashapp' && (
                    <Badge variant="outline" className="bg-[#00D632]/10 text-[#00D632] border-[#00D632]/30">CashApp</Badge>
                  )}
                  {order.paymentMethod === 'zelle' && (
                    <Badge variant="outline" className="bg-[#6D1ED4]/10 text-[#6D1ED4] border-[#6D1ED4]/30">Zelle</Badge>
                  )}
                  {!order.paymentMethod && (
                    <Badge variant="secondary">Unknown</Badge>
                  )}
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="address-collected" 
                  checked={addressCollected}
                  onCheckedChange={(checked) => setAddressCollected(!!checked)}
                  data-testid="checkbox-address-collected"
                />
                <label htmlFor="address-collected" className="text-sm">Address verified/collected</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="packed" 
                  checked={packed}
                  onCheckedChange={(checked) => setPacked(!!checked)}
                  data-testid="checkbox-packed"
                />
                <label htmlFor="packed" className="text-sm">Order packed</label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Notes</h4>
            <Textarea 
              placeholder="Add notes about this order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              data-testid="textarea-order-notes"
            />
          </div>

          {order.fulfilledAt && (
            <div className="border-t pt-4 text-sm text-muted-foreground">
              Delivered on {new Date(order.fulfilledAt).toLocaleString()}
              {order.fulfilledBy && ` by ${order.fulfilledBy}`}
            </div>
          )}

          {order.isRefunded && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-destructive">
                <Badge variant="destructive">Refunded</Badge>
                {order.refundAmount && (
                  <span className="text-sm">${Number(order.refundAmount).toFixed(2)}</span>
                )}
              </div>
              {order.refundReason && (
                <p className="text-sm text-muted-foreground mt-1">{order.refundReason}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end border-t pt-4">
            <Button variant="outline" onClick={handleSaveChecklist} data-testid="button-save-checklist">
              Save Changes
            </Button>
            {order.fulfillmentStatus !== "delivered" && (
              <Button 
                onClick={handleMarkDelivered} 
                disabled={isFulfillmentPending}
                data-testid="button-mark-delivered"
              >
                {isFulfillmentPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Mark Delivered
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CustomerWithStats {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isAdmin: boolean | null;
  createdAt: Date | null;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

function CustomersTab() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "orders" | "spent">("recent");
  const [reviewFilter, setReviewFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  const { data: customers, isLoading } = useQuery<CustomerWithStats[]>({
    queryKey: ["/api/admin/customers"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<ReviewWithProduct[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/admin/reviews/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review approved" });
    },
    onError: () => {
      toast({ title: "Failed to approve review", variant: "destructive" });
    }
  });

  const rejectReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/admin/reviews/${id}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject review", variant: "destructive" });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/reviews/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Review deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete review", variant: "destructive" });
    }
  });

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    let filtered = customers.filter(customer => {
      const searchLower = searchQuery.toLowerCase();
      return (
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.firstName?.toLowerCase().includes(searchLower) ||
        customer.lastName?.toLowerCase().includes(searchLower)
      );
    });

    switch (sortBy) {
      case "orders":
        filtered.sort((a, b) => b.orderCount - a.orderCount);
        break;
      case "spent":
        filtered.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case "recent":
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    return filtered;
  }, [customers, searchQuery, sortBy]);

  const customerOrders = useMemo(() => {
    if (!orders || !selectedCustomer) return [];
    return orders.filter(order => order.userId === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  const stats = useMemo(() => {
    if (!customers) return { total: 0, thisWeek: 0, thisMonth: 0 };
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: customers.length,
      thisWeek: customers.filter(c => c.createdAt && new Date(c.createdAt) >= weekAgo).length,
      thisMonth: customers.filter(c => c.createdAt && new Date(c.createdAt) >= monthAgo).length,
    };
  }, [customers]);

  const filteredReviews = reviews?.filter(review => {
    if (reviewFilter === "all") return true;
    if (reviewFilter === "approved") return review.isApproved === true;
    if (reviewFilter === "pending") return review.isApproved === null;
    if (reviewFilter === "rejected") return review.isApproved === false;
    return true;
  }) || [];

  const pendingReviewCount = reviews?.filter(r => r.isApproved === null).length || 0;
  const approvedReviewCount = reviews?.filter(r => r.isApproved === true).length || 0;
  const rejectedReviewCount = reviews?.filter(r => r.isApproved === false).length || 0;

  const formatReviewDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-muted-foreground">Manage and view your customer base</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E7FB10]/10">
              <Users className="h-5 w-5 text-[#E7FB10]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#21d8ff]/10">
              <Calendar className="h-5 w-5 text-[#21d8ff]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
              <p className="text-sm text-muted-foreground">New This Week</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-sm text-muted-foreground">New This Month</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-customer-search"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "orders" | "spent")}>
          <SelectTrigger className="w-[180px]" data-testid="select-customer-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="orders">Most Orders</SelectItem>
            <SelectItem value="spent">Highest Spent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No customers found matching your search" : "No customers yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedCustomer(customer)}
                  data-testid={`row-customer-${customer.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {customer.profileImageUrl ? (
                          <img src={customer.profileImageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {customer.firstName || customer.lastName 
                            ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                            : 'Unknown'}
                        </p>
                        {customer.isAdmin && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.email || '-'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={customer.orderCount > 0 ? "default" : "secondary"}>
                      {customer.orderCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${customer.totalSpent.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.createdAt 
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.lastOrderDate 
                      ? new Date(customer.lastOrderDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {selectedCustomer?.profileImageUrl ? (
                  <img src={selectedCustomer.profileImageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <span>
                  {selectedCustomer?.firstName || selectedCustomer?.lastName 
                    ? `${selectedCustomer?.firstName || ''} ${selectedCustomer?.lastName || ''}`.trim()
                    : 'Unknown Customer'}
                </span>
                {selectedCustomer?.isAdmin && (
                  <Badge variant="secondary" className="ml-2">Admin</Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 py-4">
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-[#E7FB10]">{selectedCustomer?.orderCount || 0}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-[#21d8ff]">${selectedCustomer?.totalSpent.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {selectedCustomer?.createdAt 
                  ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                  : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Member Since</p>
            </Card>
          </div>

          {customerOrders.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Order History</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt && new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(order.totalAmount).toFixed(2)}</p>
                      <Badge 
                        variant={order.status === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reviews Section */}
      <div className="border-t pt-8 mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-[#E7FB10]" />
            Customer Reviews ({reviews?.length || 0})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={reviewFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setReviewFilter("all")}
              data-testid="badge-filter-all"
            >
              All ({reviews?.length || 0})
            </Badge>
            <Badge 
              variant={reviewFilter === "pending" ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => setReviewFilter("pending")}
              data-testid="badge-filter-pending"
            >
              Pending ({pendingReviewCount})
            </Badge>
            <Badge 
              variant={reviewFilter === "approved" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setReviewFilter("approved")}
              data-testid="badge-filter-approved"
            >
              Approved ({approvedReviewCount})
            </Badge>
            <Badge 
              variant={reviewFilter === "rejected" ? "destructive" : "outline"}
              className="cursor-pointer"
              onClick={() => setReviewFilter("rejected")}
              data-testid="badge-filter-rejected"
            >
              Rejected ({rejectedReviewCount})
            </Badge>
          </div>
        </div>

        {reviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start gap-4">
                  {review.productImageUrl ? (
                    <img 
                      src={review.productImageUrl} 
                      alt={review.productName}
                      className="w-16 h-16 object-cover rounded-lg bg-muted"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-medium text-sm text-muted-foreground">{review.productName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${star <= review.rating ? "text-[#E7FB10] fill-[#E7FB10]" : "text-muted"}`}
                              />
                            ))}
                          </div>
                          {review.title && (
                            <span className="font-semibold">{review.title}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={review.isApproved === true ? "default" : review.isApproved === false ? "destructive" : "secondary"}
                        >
                          {review.isApproved === true ? "Approved" : review.isApproved === false ? "Rejected" : "Pending"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatReviewDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                    <div className="flex items-center gap-2">
                      {review.isApproved !== true && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => approveReviewMutation.mutate(review.id)}
                          disabled={approveReviewMutation.isPending}
                          data-testid={`btn-approve-review-${review.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {review.isApproved !== false && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectReviewMutation.mutate(review.id)}
                          disabled={rejectReviewMutation.isPending}
                          data-testid={`btn-reject-review-${review.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            data-testid={`btn-delete-review-${review.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this review. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteReviewMutation.mutate(review.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">No Reviews {reviewFilter !== "all" ? `(${reviewFilter})` : ""}</h3>
            <p className="text-sm text-muted-foreground">
              {reviewFilter === "all" 
                ? "Customer reviews will appear here once submitted."
                : `No ${reviewFilter} reviews found.`}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function ContactsTab() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "contact" | "wholesale" | "new">("all");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const selectedContactRef = useRef<string | null>(null);
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "new" | "read" | "responded" | "archived" }) => {
      const response = await apiRequest("PATCH", `/api/admin/contacts/${id}/status`, { status });
      return response.json();
    },
    onSuccess: (updatedContact: Contact) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      // Update selected contact with new data
      setSelectedContact(updatedContact);
      // Clear selection if it no longer matches "new" filter
      if (activeFilter === "new" && updatedContact.status !== "new") {
        setSelectedContact(null);
      }
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/contacts/${id}/notes`, { notes });
      return response.json();
    },
    onSuccess: (updatedContact: Contact) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      // Update selected contact with new data
      setSelectedContact(updatedContact);
      toast({ title: "Notes saved" });
    },
    onError: () => {
      toast({ title: "Failed to save notes", variant: "destructive" });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/contacts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setSelectedContact(null);
      toast({ title: "Contact deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete contact", variant: "destructive" });
    },
  });

  const handleSelectContact = (contact: Contact) => {
    selectedContactRef.current = contact.id;
    setSelectedContact(contact);
    setNotes(contact.notes || "");
  };

  // Auto-mark "new" contacts as "responded" after 5 seconds of viewing
  useEffect(() => {
    if (!selectedContact || selectedContact.status !== "new") return;
    
    const contactId = selectedContact.id;
    
    const timer = setTimeout(() => {
      // Only update if same contact is still selected and mutation isn't pending
      if (selectedContactRef.current === contactId && !updateStatusMutation.isPending) {
        updateStatusMutation.mutate({ id: contactId, status: "read" });
      }
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [selectedContact?.id, selectedContact?.status]);

  const handleStatusChange = (status: "new" | "read" | "responded" | "archived") => {
    if (selectedContact) {
      updateStatusMutation.mutate({ id: selectedContact.id, status });
    }
  };

  const handleSaveNotes = () => {
    if (selectedContact) {
      updateNotesMutation.mutate({ id: selectedContact.id, notes });
    }
  };

  const formatFullDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date: Date | string | null) => {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-[#E7FB10] text-black">New</Badge>;
      case "responded":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Responded</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === "wholesale") {
      return <Badge className="bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">Wholesale</Badge>;
    }
    return <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">Contact</Badge>;
  };

  // Filter contacts based on active filter and search
  const filteredContacts = contacts?.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.companyName?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case "contact":
        return contact.type === "contact";
      case "wholesale":
        return contact.type === "wholesale";
      case "new":
        return contact.status === "new";
      default:
        return true;
    }
  }) || [];

  // Count stats
  const stats = {
    all: contacts?.length || 0,
    contact: contacts?.filter(c => c.type === "contact").length || 0,
    wholesale: contacts?.filter(c => c.type === "wholesale").length || 0,
    new: contacts?.filter(c => c.status === "new").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex h-[600px] gap-4">
        <div className="w-1/3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Inbox className="h-5 w-5 text-[#21d8ff]" />
          Contacts Inbox
        </h2>
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-contacts"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("all")}
          data-testid="button-filter-all"
        >
          All ({stats.all})
        </Button>
        <Button
          variant={activeFilter === "contact" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("contact")}
          data-testid="button-filter-contact"
        >
          Contact ({stats.contact})
        </Button>
        <Button
          variant={activeFilter === "wholesale" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("wholesale")}
          data-testid="button-filter-wholesale"
        >
          Wholesale ({stats.wholesale})
        </Button>
        <Button
          variant={activeFilter === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("new")}
          className={activeFilter !== "new" && stats.new > 0 ? "border-[#E7FB10]/50" : ""}
          data-testid="button-filter-new"
        >
          New ({stats.new})
          {stats.new > 0 && activeFilter !== "new" && (
            <span className="ml-1 h-2 w-2 rounded-full bg-[#E7FB10]" />
          )}
        </Button>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="flex flex-col md:flex-row h-auto md:h-[600px] border rounded-lg overflow-hidden">
          {/* Contact List - hidden on mobile when contact selected */}
          <div className={`w-full md:w-1/3 border-b md:border-b-0 md:border-r bg-background/50 overflow-y-auto ${
            selectedContact ? "hidden md:block" : "block"
          }`}>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left p-4 border-b transition-colors ${
                    selectedContact?.id === contact.id
                      ? "bg-[#21d8ff]/10 border-l-2 border-l-[#21d8ff]"
                      : contact.status === "new"
                        ? "bg-[#E7FB10]/5 hover:bg-[#E7FB10]/10 border-l-2 border-l-[#E7FB10]"
                        : "hover:bg-muted/50 border-l-2 border-l-transparent"
                  }`}
                  data-testid={`contact-item-${contact.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        contact.type === "wholesale" ? "bg-[#9d4edd]/20" : "bg-[#21d8ff]/20"
                      }`}>
                        <span className={`text-sm font-bold ${
                          contact.type === "wholesale" ? "text-[#9d4edd]" : "text-[#21d8ff]"
                        }`}>
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{contact.name}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getTypeBadge(contact.type)}
                          {contact.status === "new" && (
                            <Badge className="bg-[#E7FB10] text-black text-[10px] px-1.5 py-0">New</Badge>
                          )}
                          {contact.isTest && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] px-1.5 py-0">TEST</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {getTimeAgo(contact.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate pl-10">
                    {contact.companyName ? `${contact.companyName} • ` : ""}{contact.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-1 pl-10">
                    {contact.message}
                  </p>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No contacts match your filter</p>
              </div>
            )}
          </div>

          {/* Contact Detail - full width on mobile when contact selected */}
          <div className={`flex-1 flex flex-col bg-background ${
            selectedContact ? "block" : "hidden md:flex"
          }`}>
            {selectedContact ? (
              <>
                {/* Mobile back button */}
                <div className="md:hidden p-3 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContact(null)}
                    className="text-[#21d8ff]"
                    data-testid="button-back-to-list"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Inbox
                  </Button>
                </div>
                
                <div className="p-4 sm:p-6 border-b">
                  <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 ${
                        selectedContact.type === "wholesale" ? "bg-[#9d4edd]/20" : "bg-[#21d8ff]/20"
                      }`}>
                        <span className={`text-base sm:text-lg font-bold ${
                          selectedContact.type === "wholesale" ? "text-[#9d4edd]" : "text-[#21d8ff]"
                        }`}>
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base sm:text-lg" data-testid="text-selected-contact-name">
                            {selectedContact.name}
                          </h3>
                          {getTypeBadge(selectedContact.type)}
                          {selectedContact.isTest && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">TEST</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{selectedContact.email}</p>
                        {selectedContact.companyName && (
                          <p className="text-sm text-muted-foreground truncate">{selectedContact.companyName}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatFullDate(selectedContact.createdAt)}
                      </p>
                      {getStatusBadge(selectedContact.status)}
                    </div>
                  </div>
                  
                  {/* Wholesale-specific info */}
                  {selectedContact.type === "wholesale" && (
                    <div className="mt-4 p-4 bg-[#9d4edd]/10 rounded-lg border border-[#9d4edd]/20">
                      <h4 className="text-sm font-semibold text-[#9d4edd] mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Wholesale Application Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {selectedContact.companyName && (
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Company</span>
                            <span className="font-medium">{selectedContact.companyName}</span>
                          </div>
                        )}
                        {selectedContact.phone && (
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Phone</span>
                            <span className="font-medium">{selectedContact.phone}</span>
                          </div>
                        )}
                        {selectedContact.orderVolume && (
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Est. Volume</span>
                            <span className="font-medium">{selectedContact.orderVolume}</span>
                          </div>
                        )}
                        {selectedContact.intendedUseCategory && (
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Intended Use</span>
                            <span className="font-medium">{selectedContact.intendedUseCategory}</span>
                          </div>
                        )}
                        {selectedContact.website && (
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Website</span>
                            <a href={selectedContact.website.startsWith("http") ? selectedContact.website : `https://${selectedContact.website}`} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="font-medium text-[#21d8ff] hover:underline">
                              {selectedContact.website}
                            </a>
                          </div>
                        )}
                        {selectedContact.targetTimeline && (
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">Timeline</span>
                            <span className="font-medium">{selectedContact.targetTimeline}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {/* Message */}
                  <div className="bg-muted/30 rounded-lg p-6 border">
                    <p className="whitespace-pre-wrap leading-relaxed" data-testid="text-selected-contact-message">
                      {selectedContact.message}
                    </p>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Internal Notes</label>
                    <Textarea
                      placeholder="Add notes about this contact..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="textarea-contact-notes"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveNotes}
                      disabled={updateNotesMutation.isPending || notes === (selectedContact.notes || "")}
                      data-testid="button-save-notes"
                    >
                      {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="p-3 sm:p-4 border-t bg-muted/20">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Select
                        value={selectedContact.status}
                        onValueChange={(value) => handleStatusChange(value as "new" | "read" | "responded" | "archived")}
                      >
                        <SelectTrigger className="w-[120px] sm:w-[140px]" data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="responded">Responded</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${selectedContact.email}?subject=Re: Your inquiry to Revive Research`}
                        className="flex-1 sm:flex-none"
                      >
                        <Button className="bg-[#21d8ff] text-black w-full sm:w-auto" data-testid="btn-reply-contact">
                          <Mail className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 border-red-500/30"
                            data-testid="btn-delete-contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this message from {selectedContact.name}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteContactMutation.mutate(selectedContact.id)}
                              className="bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedContact(null)}
                        className="hidden sm:flex"
                        data-testid="btn-close-contact"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Inbox className="h-8 w-8" />
                </div>
                <p className="font-medium mb-1">Select a contact</p>
                <p className="text-sm">Click on a contact to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">No Contacts Yet</h3>
          <p className="text-sm text-muted-foreground">
            Contact and wholesale inquiries will appear here.
          </p>
        </Card>
      )}
    </div>
  );
}

interface ReviewWithProduct {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  title: string | null;
  comment: string;
  isApproved: boolean | null;
  createdAt: Date | string | null;
  productName: string;
  productImageUrl: string | null;
}

interface StockNotificationWithProduct {
  id: string;
  email: string;
  productId: string;
  productName: string;
  status: string;
  createdAt: string;
  notifiedAt?: string;
}

function StockNotificationsTab() {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const { data: notifications, isLoading } = useQuery<StockNotificationWithProduct[]>({
    queryKey: ["/api/admin/stock-notifications"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stock-notifications", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    }
  });

  const markSentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/admin/stock-notifications/${id}/sent`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-notifications"] });
      toast({ title: "Notification marked as sent" });
    },
    onError: () => {
      toast({ title: "Failed to update notification", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/stock-notifications/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-notifications"] });
      toast({ title: "Notification deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete notification", variant: "destructive" });
    },
  });

  const deleteBulkMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiRequest("DELETE", "/api/admin/stock-notifications", { ids });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-notifications"] });
      setSelectedIds(new Set());
      toast({ title: "Notifications deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete notifications", variant: "destructive" });
    },
  });

  const toggleSelectId = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications?.map(n => n.id) || []));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">No Stock Notifications</h3>
        <p className="text-sm text-muted-foreground">
          When customers sign up for back-in-stock notifications, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold" data-testid="text-notifications-title">
            Stock Notifications
          </h2>
          <p className="text-muted-foreground text-sm">
            All notification requests (pending & sent)
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {notifications.length} total
        </Badge>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-muted/50 p-3 rounded-md flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteBulkMutation.mutate(Array.from(selectedIds))}
            disabled={deleteBulkMutation.isPending}
            data-testid="btn-delete-selected"
          >
            {deleteBulkMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Delete Selected
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.size === notifications.length && notifications.length > 0}
                  onChange={toggleSelectAll}
                  data-testid="checkbox-select-all"
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Notified At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow key={notification.id} data-testid={`row-notification-${notification.id}`}>
                <TableCell className="w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(notification.id)}
                    onChange={() => toggleSelectId(notification.id)}
                    data-testid={`checkbox-notification-${notification.id}`}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell className="font-medium">{notification.email}</TableCell>
                <TableCell>{notification.productName}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(notification.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {notification.notifiedAt ? formatDate(notification.notifiedAt) : "—"}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={notification.status === "pending" ? "secondary" : "default"}
                    className={notification.status === "pending" ? "bg-[#21d8ff]/20 text-[#21d8ff]" : "bg-green-500/20 text-green-400"}
                  >
                    {notification.status === "pending" ? "Waiting" : "Notified"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {notification.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markSentMutation.mutate(notification.id)}
                        disabled={markSentMutation.isPending}
                        data-testid={`btn-mark-sent-${notification.id}`}
                      >
                        {markSentMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(notification.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`btn-delete-${notification.id}`}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface EmailEvent {
  id: string;
  orderId: string;
  type: string;
  recipientEmail: string;
  subject: string;
  status: string;
  sesMessageId: string | null;
  error: string | null;
  createdAt: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  status: string;
  createdAt: string;
  lastEmailSentAt: string | null;
  unsubscribedAt: string | null;
  unsubscribeReason: string | null;
}

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
}

interface NewsletterData {
  stats: NewsletterStats;
  subscribers: NewsletterSubscriber[];
  bySource: Record<string, number>;
  unsubscribeReasons: Record<string, number>;
}

function LaunchSubscribersTab() {
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: subscriberData, isLoading } = useQuery<NewsletterData>({
    queryKey: ["/api/admin/newsletter/subscribers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/subscribers", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch subscribers");
      return response.json();
    }
  });

  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/newsletter/subscribers/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/subscribers"] });
      toast({ title: "Subscriber deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete subscriber", variant: "destructive" });
    },
  });

  const handleDeleteSubscriber = (id: string, email: string) => {
    if (confirm(`Delete subscriber "${email}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const exportToCSV = () => {
    if (!subscriberData?.subscribers) return;
    
    const csv = [
      ["Email", "Source", "Status", "Signed Up", "Last Email Sent", "Unsubscribe Reason"],
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.source || "website",
        sub.status,
        new Date(sub.createdAt).toLocaleDateString(),
        sub.lastEmailSentAt ? new Date(sub.lastEmailSentAt).toLocaleDateString() : "Never",
        sub.unsubscribeReason || ""
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Downloaded",
      description: `${filteredSubscribers.length} subscribers exported to CSV`,
    });
  };

  const filteredSubscribers = (subscriberData?.subscribers || []).filter(sub => {
    const effectiveSource = sub.source === 'early_access_modal' ? 'product_early_access' : (sub.source || 'website');
    const matchesSource = filterSource === "all" || effectiveSource === filterSource;
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    const matchesEmail = sub.email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesSource && matchesStatus && matchesEmail;
  });

  const sources = Array.from(new Set(subscriberData?.subscribers?.map(s => s.source === 'early_access_modal' ? 'product_early_access' : (s.source || "website")) || []));

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "footer": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "product_early_access": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "checkout_launch_notify": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "early_access_modal": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!subscriberData || (subscriberData.subscribers?.length || 0) === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-2">No Launch Subscribers Yet</h3>
        <p className="text-sm text-muted-foreground">
          Email signups will appear here as users subscribe for launch notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold">Launch Subscribers</h2>
          <p className="text-muted-foreground text-sm">
            Emails collected for launch notifications across all touchpoints
          </p>
        </div>
        <Button onClick={exportToCSV} size="sm" variant="outline" data-testid="btn-export-subscribers">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Simple Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-muted/30">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
            Total Subscribers
          </div>
          <div className="text-2xl font-bold">{subscriberData.stats?.total || subscriberData.subscribers?.length || 0}</div>
        </Card>
        <Card className="p-4 border-l-2 border-l-emerald-500">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
            Active
          </div>
          <div className="text-2xl font-bold text-emerald-500">{subscriberData.stats?.active || subscriberData.subscribers?.filter(s => s.status === 'subscribed').length || 0}</div>
        </Card>
        <Card className="p-4 border-l-2 border-l-red-500">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
            Unsubscribed
          </div>
          <div className="text-2xl font-bold text-red-400">{subscriberData.stats?.unsubscribed || subscriberData.subscribers?.filter(s => s.status === 'unsubscribed').length || 0}</div>
        </Card>
      </div>

      {/* Unsubscribe Reasons Breakdown (if any) */}
      {subscriberData.unsubscribeReasons && Object.keys(subscriberData.unsubscribeReasons).length > 0 && (
        <Card className="p-4">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-3">
            Unsubscribe Reasons
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(subscriberData.unsubscribeReasons).map(([reason, count]) => (
              <Badge key={reason} variant="outline" className="text-xs">
                {reason}: {count}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Search Email</Label>
            <Input
              placeholder="Filter by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="h-9 text-sm"
              data-testid="input-search-email"
            />
          </div>
          <div className="w-full sm:w-48">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Touchpoint</Label>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="h-9 text-sm" data-testid="select-filter-source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Touchpoints</SelectItem>
                <SelectItem value="footer">Footer Newsletter</SelectItem>
                <SelectItem value="product_early_access">Product Early Access</SelectItem>
                <SelectItem value="checkout_launch_notify">Checkout Launch Notify</SelectItem>
                <SelectItem value="website">General Website</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 text-sm" data-testid="select-filter-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground px-1">
          <span>Showing {filteredSubscribers.length} of {subscriberData?.stats?.total || subscriberData?.subscribers?.length || 0} subscribers</span>
        </div>

        <div className="rounded-lg border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Email Address</TableHead>
                <TableHead className="w-36 text-[10px] font-bold uppercase tracking-wider">Source</TableHead>
                <TableHead className="w-24 text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="w-28 text-[10px] font-bold uppercase tracking-wider">Signed Up</TableHead>
                <TableHead className="w-28 text-[10px] font-bold uppercase tracking-wider">Last Email</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                    No subscribers match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((sub) => (
                  <TableRow key={sub.id} data-testid={`row-subscriber-${sub.id}`} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm font-medium">{sub.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0 h-5 font-bold tracking-wider ${getSourceBadgeColor(sub.source || 'website')}`}>
                        {(sub.source || 'website').replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={sub.status === "subscribed" ? "default" : "secondary"} 
                        className={`text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider ${sub.status === "unsubscribed" ? "bg-red-500/10 text-red-400 border-red-500/20" : ""}`}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sub.lastEmailSentAt ? (
                        new Date(sub.lastEmailSentAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })
                      ) : (
                        <span className="text-muted-foreground/50">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                        disabled={deleteMutation.isPending}
                        data-testid={`btn-delete-subscriber-${sub.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function EmailLogsTab() {
  const [emailTab, setEmailTab] = useState("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: emailEvents, isLoading } = useQuery<EmailEvent[]>({
    queryKey: ["/api/admin/email-events"],
    queryFn: async () => {
      const response = await fetch("/api/admin/email-events?limit=100", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch email events");
      return response.json();
    }
  });

  const { data: orderEmails } = useQuery<EmailEvent[]>({
    queryKey: ["/api/admin/email-events/order", selectedOrderId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/email-events/order/${selectedOrderId}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch order emails");
      return response.json();
    },
    enabled: !!selectedOrderId
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getShortOrderRef = (orderId: string) => {
    return `#${orderId.slice(-8).toUpperCase()}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === "sent") {
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Sent</Badge>;
    } else if (status === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      order_confirmation: "Order Confirmation",
      shipping_notification: "Shipping",
      affiliate_welcome: "Affiliate Welcome",
      affiliate_payout: "Payout",
    };
    return <Badge variant="outline">{typeMap[type] || type}</Badge>;
  };

  const sentCount = emailEvents?.filter((e) => e.status === "sent").length || 0;
  const failedCount = emailEvents?.filter((e) => e.status === "failed").length || 0;
  const successRate = emailEvents && emailEvents.length > 0 ? Math.round((sentCount / emailEvents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Tabs value={emailTab} onValueChange={setEmailTab} className="space-y-4">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="launch">Launch</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !emailEvents || emailEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No Email Logs</h3>
              <p className="text-sm text-muted-foreground">
                Transactional email events will appear here once sent.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="font-display text-xl font-bold" data-testid="text-email-logs-title">
                    Email Logs
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Transactional email audit trail
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Total Sent
                  </div>
                  <div className="text-2xl font-bold">{emailEvents?.length || 0}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Success
                  </div>
                  <div className="text-2xl font-bold text-green-600">{sentCount}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Failed
                  </div>
                  <div className="text-2xl font-bold text-destructive">{failedCount}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    Success Rate
                  </div>
                  <div className="text-2xl font-bold">{successRate}%</div>
                </Card>
              </div>

              {selectedOrderId && orderEmails && (
                <Card className="p-4 bg-muted/40 border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm">Filtering: Order {getShortOrderRef(selectedOrderId)}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{orderEmails.length} email(s)</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrderId(null)}
                      data-testid="btn-clear-filter"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filter
                    </Button>
                  </div>
                  {orderEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No emails found for this order.</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {orderEmails.map((email) => (
                        <div key={email.id} className="flex items-center justify-between text-xs bg-background/50 p-2 rounded border border-border/50">
                          <div className="flex items-center gap-2 flex-1">
                            {getTypeBadge(email.type)}
                            <span className="text-muted-foreground truncate">{email.recipientEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {getStatusBadge(email.status)}
                            <span className="text-muted-foreground whitespace-nowrap">{formatDate(email.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              <div>
                <h3 className="font-semibold text-sm mb-3">Recent Email Events</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-32 text-xs font-semibold">Time</TableHead>
                        <TableHead className="w-28 text-xs font-semibold">Order</TableHead>
                        <TableHead className="text-xs font-semibold">Recipient</TableHead>
                        <TableHead className="w-40 text-xs font-semibold">Type</TableHead>
                        <TableHead className="w-24 text-xs font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailEvents.slice(0, 50).map((event) => (
                        <TableRow key={event.id} data-testid={`row-email-${event.id}`} className="hover:bg-muted/30">
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(event.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto font-mono text-xs text-primary hover:underline"
                              onClick={() => setSelectedOrderId(event.orderId)}
                              data-testid={`btn-order-${event.orderId}`}
                            >
                              {getShortOrderRef(event.orderId)}
                            </Button>
                          </TableCell>
                          <TableCell className="text-xs">{event.recipientEmail}</TableCell>
                          <TableCell>{getTypeBadge(event.type)}</TableCell>
                          <TableCell>{getStatusBadge(event.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {emailEvents.length > 50 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Showing 50 of {emailEvents.length} emails
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="launch">
          <LaunchSubscribersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discountPercent: string;
  type: string;
  affiliateId: string | null;
  freeShipping: boolean;
  isActive: boolean;
  maxUsages: number | null;
  usageCount: number | null;
  expiresAt: string | null;
  createdAt: string;
}

function DiscountCodesTab() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDiscountPercent, setNewDiscountPercent] = useState("10");
  const [newType, setNewType] = useState("promo");
  const [newFreeShipping, setNewFreeShipping] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDiscountPercent, setEditDiscountPercent] = useState("10");
  const [editType, setEditType] = useState("promo");
  const [editFreeShipping, setEditFreeShipping] = useState(false);

  const { data: discountCodes, isLoading } = useQuery<DiscountCode[]>({
    queryKey: ["/api/admin/discount-codes"],
    queryFn: async () => {
      const response = await fetch("/api/admin/discount-codes", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch discount codes");
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: { code: string; description: string; discountPercent: string; type: string; freeShipping: boolean }) => {
      const response = await apiRequest("POST", "/api/admin/discount-codes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
      setShowCreateDialog(false);
      setNewCode("");
      setNewDescription("");
      setNewDiscountPercent("10");
      setNewType("promo");
      setNewFreeShipping(false);
      toast({ title: "Discount code created" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create discount code", description: error.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/discount-codes/${id}/toggle`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
      toast({ title: "Discount code updated" });
    },
    onError: () => {
      toast({ title: "Failed to update discount code", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; description: string; discountPercent: string; type: string; freeShipping: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/discount-codes/${data.id}`, {
        description: data.description,
        discountPercent: data.discountPercent,
        type: data.type,
        freeShipping: data.freeShipping
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
      setEditingId(null);
      setEditCode("");
      setEditDescription("");
      setEditDiscountPercent("10");
      setEditType("promo");
      setEditFreeShipping(false);
      toast({ title: "Discount code updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update discount code", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/discount-codes/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
      toast({ title: "Discount code deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete discount code", variant: "destructive" });
    },
  });

  const startEdit = (code: DiscountCode) => {
    setEditingId(code.id);
    setEditCode(code.code);
    setEditDescription(code.description || "");
    setEditDiscountPercent(code.discountPercent);
    setEditType(code.type);
    setEditFreeShipping(code.freeShipping || false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold" data-testid="text-discount-codes-title">
            Discount Codes
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage promo codes and affiliate discount codes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#E7FB10] hover:bg-[#E7FB10]/90 text-black" data-testid="btn-create-discount-code">
              <Plus className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discount Code</DialogTitle>
              <DialogDescription>
                Create a new discount code for promotions or affiliates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  placeholder="e.g., SAVE10"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  data-testid="input-new-code"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="e.g., Summer sale discount"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  data-testid="input-new-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Percent {newFreeShipping ? "(Optional)" : ""}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscountPercent}
                  onChange={(e) => setNewDiscountPercent(e.target.value)}
                  placeholder={newFreeShipping ? "Leave as 0 for free shipping only" : "e.g., 10"}
                  data-testid="input-new-discount-percent"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger data-testid="select-new-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promo">Promo Code</SelectItem>
                    <SelectItem value="affiliate_referral">Affiliate Referral (10%)</SelectItem>
                    <SelectItem value="affiliate_personal">Affiliate Personal (20%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-shipping"
                  checked={newFreeShipping}
                  onCheckedChange={(checked) => setNewFreeShipping(checked === true)}
                  data-testid="checkbox-free-shipping"
                />
                <Label htmlFor="free-shipping" className="cursor-pointer">
                  Free Shipping
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate({
                  code: newCode,
                  description: newDescription,
                  discountPercent: newDiscountPercent,
                  type: newType,
                  freeShipping: newFreeShipping
                })}
                disabled={!newCode || createMutation.isPending}
                data-testid="btn-confirm-create"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Discount Code</DialogTitle>
            <DialogDescription>
              Update the discount code details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Code (read-only)</Label>
              <Input value={editCode} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="e.g., Summer sale discount"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                data-testid="input-edit-description"
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Percent {editFreeShipping ? "(Optional)" : ""}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editDiscountPercent}
                onChange={(e) => setEditDiscountPercent(e.target.value)}
                placeholder={editFreeShipping ? "Leave as 0 for free shipping only" : "e.g., 10"}
                data-testid="input-edit-discount-percent"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger data-testid="select-edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promo">Promo Code</SelectItem>
                  <SelectItem value="affiliate_referral">Affiliate Referral (10%)</SelectItem>
                  <SelectItem value="affiliate_personal">Affiliate Personal (20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-free-shipping"
                checked={editFreeShipping}
                onCheckedChange={(checked) => setEditFreeShipping(checked === true)}
                data-testid="checkbox-edit-free-shipping"
              />
              <Label htmlFor="edit-free-shipping" className="cursor-pointer">
                Free Shipping
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingId && updateMutation.mutate({
                id: editingId,
                description: editDescription,
                discountPercent: editDiscountPercent,
                type: editType,
                freeShipping: editFreeShipping
              })}
              disabled={updateMutation.isPending}
              data-testid="btn-confirm-edit"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!discountCodes || discountCodes.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Tag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">No Discount Codes</h3>
          <p className="text-sm text-muted-foreground">
            Create your first discount code to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Shipping</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discountCodes.map((code) => (
                <TableRow key={code.id} data-testid={`row-discount-code-${code.id}`}>
                  <TableCell className="select-none">
                    <code className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded">
                      {code.code}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm select-none">
                    {code.description || "-"}
                  </TableCell>
                  <TableCell className="select-none">
                    <Badge variant="secondary" className="bg-[#E7FB10]/20 text-[#E7FB10]">
                      {code.discountPercent}% OFF
                    </Badge>
                  </TableCell>
                  <TableCell className="select-none">
                    {code.freeShipping ? (
                      <Badge variant="secondary" className="bg-[#21d8ff]/20 text-[#21d8ff]">
                        Free Shipping
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="select-none">
                    <Badge variant="outline" className="capitalize">
                      {code.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="select-none">
                    <Badge variant={code.isActive ? "default" : "secondary"}>
                      {code.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm select-none">
                    {formatDate(code.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(code)}
                        data-testid={`btn-edit-${code.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMutation.mutate({ id: code.id, isActive: !code.isActive })}
                        disabled={toggleMutation.isPending}
                        data-testid={`btn-toggle-${code.id}`}
                      >
                        {code.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(code.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`btn-delete-${code.id}`}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function AffiliatesTab() {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState("affiliates");

  const { data: applications, isLoading: applicationsLoading } = useQuery<AffiliateApplication[]>({
    queryKey: ["/api/admin/affiliate-applications"],
  });

  const { data: affiliates, isLoading: affiliatesLoading } = useQuery<Affiliate[]>({
    queryKey: ["/api/admin/affiliates"],
  });

  const { data: payouts, isLoading: payoutsLoading } = useQuery<AffiliatePayout[]>({
    queryKey: ["/api/admin/affiliate-payouts"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/affiliate-applications/${id}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Application approved", description: "Affiliate has been created successfully." });
    },
    onError: () => {
      toast({ title: "Failed to approve application", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/affiliate-applications/${id}/reject`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Application rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject application", variant: "destructive" });
    },
  });

  const processPayoutMutation = useMutation({
    mutationFn: async ({ id, transactionId }: { id: string; transactionId: string }) => {
      const response = await apiRequest("POST", `/api/admin/affiliate-payouts/${id}/process`, { transactionId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Payout processed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to process payout", variant: "destructive" });
    },
  });

  const rejectPayoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/admin/affiliate-payouts/${id}/reject`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Payout rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject payout", variant: "destructive" });
    },
  });

  const deleteAffiliateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/affiliates/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Affiliate removed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to remove affiliate", variant: "destructive" });
    },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pendingApplications = applications?.filter(a => a.status === "pending") || [];
  const pendingPayouts = payouts?.filter(p => p.status === "pending") || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b pb-4">
        <Button
          variant={activeSubTab === "affiliates" ? "default" : "ghost"}
          onClick={() => setActiveSubTab("affiliates")}
          data-testid="subtab-affiliates"
        >
          Affiliates ({affiliates?.length || 0})
        </Button>
        <Button
          variant={activeSubTab === "applications" ? "default" : "ghost"}
          onClick={() => setActiveSubTab("applications")}
          className="relative"
          data-testid="subtab-applications"
        >
          Applications
          {pendingApplications.length > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
              {pendingApplications.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeSubTab === "payouts" ? "default" : "ghost"}
          onClick={() => setActiveSubTab("payouts")}
          className="relative"
          data-testid="subtab-payouts"
        >
          Payouts
          {pendingPayouts.length > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
              {pendingPayouts.length}
            </Badge>
          )}
        </Button>
      </div>

      {activeSubTab === "applications" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Affiliate Applications</h2>
          {applicationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} data-testid={`card-application-${application.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{application.fullName}</CardTitle>
                        <CardDescription>{application.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            application.status === "approved"
                              ? "default"
                              : application.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {application.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(application.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Social URL</p>
                        <a href={application.socialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {application.socialUrl}
                        </a>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Audience Size</p>
                        <p>{application.audienceSize}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Why They Want to Partner</p>
                      <p>{application.whyPartner}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Product Experience</p>
                      <p>{application.productExperience}</p>
                    </div>
                    {application.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(application.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-approve-${application.id}`}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><Check className="h-4 w-4 mr-1" /> Approve</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(application.id)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-${application.id}`}
                        >
                          {rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><X className="h-4 w-4 mr-1" /> Reject</>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No Applications</h3>
              <p className="text-sm text-muted-foreground">
                Affiliate applications will appear here.
              </p>
            </Card>
          )}
        </div>
      )}

      {activeSubTab === "affiliates" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Affiliates</h2>
          {affiliatesLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : affiliates && affiliates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Total Earned</TableHead>
                    <TableHead>Pending Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((affiliate) => (
                    <TableRow key={affiliate.id} data-testid={`row-affiliate-${affiliate.id}`}>
                      <TableCell className="font-medium">{affiliate.fullName}</TableCell>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{affiliate.referralCode}</code>
                      </TableCell>
                      <TableCell>{affiliate.commissionRate}%</TableCell>
                      <TableCell className="text-green-500">
                        ${(parseFloat(affiliate.totalEarnedTier1 || "0") + parseFloat(affiliate.totalEarnedTier2 || "0")).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-[#E7FB10]">
                        ${parseFloat(affiliate.pendingBalance || "0").toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={affiliate.isActive ? "default" : "secondary"}>
                          {affiliate.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              data-testid={`btn-delete-affiliate-${affiliate.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Affiliate</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {affiliate.fullName} as an affiliate? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAffiliateMutation.mutate(affiliate.id)}
                                disabled={deleteAffiliateMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive transition-colors"
                              >
                                {deleteAffiliateMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : null}
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No Affiliates</h3>
              <p className="text-sm text-muted-foreground">
                Approved affiliates will appear here.
              </p>
            </Card>
          )}
        </div>
      )}

      {activeSubTab === "payouts" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Payout Requests</h2>
          {payoutsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : payouts && payouts.length > 0 ? (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <Card key={payout.id} data-testid={`card-payout-${payout.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#E7FB10]/10">
                          <DollarSign className="h-5 w-5 text-[#E7FB10]" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">${parseFloat(payout.amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {payout.payoutMethod} - {payout.payoutEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Requested: {formatDate(payout.createdAt)}
                          </p>
                          {payout.processedAt && (
                            <p className="text-sm text-muted-foreground">
                              Processed: {formatDate(payout.processedAt)}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            payout.status === "processed"
                              ? "default"
                              : payout.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {payout.status}
                        </Badge>
                        {payout.status === "pending" && (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid={`button-process-payout-${payout.id}`}>
                                  <Check className="h-4 w-4 mr-1" /> Process
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Process Payout</DialogTitle>
                                  <DialogDescription>
                                    Enter the transaction ID after sending ${parseFloat(payout.amount).toFixed(2)} to {payout.payoutEmail}
                                  </DialogDescription>
                                </DialogHeader>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const transactionId = formData.get("transactionId") as string;
                                    processPayoutMutation.mutate({ id: payout.id, transactionId });
                                  }}
                                >
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="transactionId">Transaction ID</Label>
                                      <Input
                                        id="transactionId"
                                        name="transactionId"
                                        placeholder="Enter transaction ID"
                                        required
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit" disabled={processPayoutMutation.isPending}>
                                        {processPayoutMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          "Confirm Payment"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectPayoutMutation.mutate(payout.id)}
                              disabled={rejectPayoutMutation.isPending}
                              data-testid={`button-reject-payout-${payout.id}`}
                            >
                              {rejectPayoutMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <><X className="h-4 w-4 mr-1" /> Reject</>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-2">No Payout Requests</h3>
              <p className="text-sm text-muted-foreground">
                Affiliate payout requests will appear here.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

interface PricingSuggestion {
  productId: string;
  productName: string;
  currentPrice: number;
  suggestedPrice: number;
  percentChange: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  action: "increase" | "decrease" | "maintain" | "sale";
}

interface PricingResponse {
  suggestions: PricingSuggestion[];
  marketInsights: string;
  totalPotentialRevenue: string;
  filteredCount?: number;
  totalAnalyzed?: number;
}

const RECENT_UPDATE_WINDOW_HOURS = 24;
const AUTO_RUN_COOLDOWN_MINUTES = 60;

// Reason codes for pricing suggestions
type ReasonCode = 
  | "HIGH_VIEWS_LOW_PURCHASE"
  | "FAST_SELL_THROUGH"
  | "LOW_STOCK"
  | "SLOW_MOVING"
  | "NO_SALES_HISTORY"
  | "STABLE_PERFORMER"
  | "INSUFFICIENT_SIGNAL_OOS";

// Dosage-level pricing signal
interface DosagePricingSignal {
  dosageStockId: string;
  productId: string;
  productName: string;
  dosage: string;
  suggestedPrice: number | null;
  currentPrice: number;
  confidence: "low" | "medium" | "high";
  reasonCodes: ReasonCode[];
  expectedImpact: string | null;
  isDisabled: boolean;
  disabledReason: string | null;
  behavioralMetrics: {
    views: number;
    addToCart: number;
    checkoutStarted: number;
    purchased: number;
    daysSinceLastSale: number | null;
    conversionRate: number;
  };
  pricingSuggestionsEnabled: boolean;
  hasBaseline: boolean;
  stockAmount: number;
  inStock: boolean;
}

// Grouped by product for display
interface ProductDosageGroup {
  productId: string;
  productName: string;
  category: string;
  dosageSignals: DosagePricingSignal[];
}

function PricingOptimizerTab() {
  const { toast } = useToast();
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  const [selectedSignalFilter, setSelectedSignalFilter] = useState<string>("all");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const { data: productsWithStock = [] } = useQuery<ProductWithDosageStock[]>({
    queryKey: ["/api/admin/products-with-stock"],
  });

  const { data: dosageBehavioralMetrics = [] } = useQuery<ProductBehavioralMetrics[]>({
    queryKey: ["/api/admin/dosage-behavioral-metrics"],
  });

  const LOW_STOCK_THRESHOLD = 3;

  // Get dosage-level stock status
  const getDosageStockStatus = (dosageStock: ProductDosageStock): "in-stock" | "low-stock" | "out-of-stock" => {
    const stock = dosageStock.stockAmount ?? 0;
    if (!dosageStock.inStock || stock <= 0) return "out-of-stock";
    if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
    return "in-stock";
  };

  const toggleProductExpanded = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Compute dosage-level pricing signals
  const dosagePricingSignals: DosagePricingSignal[] = useMemo(() => {
    const signals: DosagePricingSignal[] = [];
    
    productsWithStock.forEach((product) => {
      const dosageStocks = product.dosageStocks || [];
      
      dosageStocks.forEach((dosageStock) => {
        // Find metrics for this specific product+dosage combination
        const metrics = dosageBehavioralMetrics.find(
          m => m.productId === product.id && m.dosage === dosageStock.dosage
        );
        
        const views = metrics?.productViews ?? 0;
        const addToCart = metrics?.addToCartCount ?? 0;
        const checkoutStarted = metrics?.checkoutStartedCount ?? 0;
        const purchased = metrics?.purchasedCount ?? 0;
        const lastSaleAt = metrics?.lastSaleAt ? new Date(metrics.lastSaleAt) : null;
        const daysSinceLastSale = lastSaleAt 
          ? Math.floor((Date.now() - lastSaleAt.getTime()) / (1000 * 60 * 60 * 24)) 
          : null;
        const conversionRate = views > 0 ? (purchased / views) * 100 : 0;
        
        // Use dosage-level stock status
        const stockStatus = getDosageStockStatus(dosageStock);
        const isOutOfStock = stockStatus === "out-of-stock";
        const isLowStock = stockStatus === "low-stock";
        
        const currentPrice = Number(dosageStock.price ?? product.price);
        
        // Determine reason codes - prioritized order
        const reasonCodes: ReasonCode[] = [];
        let confidence: "low" | "medium" | "high" = "low";
        let isDisabled = false;
        let disabledReason: string | null = null;
        let suggestedPrice: number | null = null;
        let expectedImpact: string | null = null;
        
        // Safeguard: OOS dosages - highest priority, blocks all suggestions
        if (isOutOfStock) {
          isDisabled = true;
          disabledReason = "Out of Stock";
          reasonCodes.push("INSUFFICIENT_SIGNAL_OOS");
          
          signals.push({
            dosageStockId: dosageStock.id,
            productId: product.id,
            productName: product.name,
            dosage: dosageStock.dosage,
            currentPrice,
            suggestedPrice: null,
            confidence: "low",
            reasonCodes,
            expectedImpact: null,
            isDisabled,
            disabledReason,
            behavioralMetrics: { views, addToCart, checkoutStarted, purchased, daysSinceLastSale, conversionRate },
            pricingSuggestionsEnabled: (dosageStock as any).pricingSuggestionsEnabled ?? false,
            hasBaseline: !!(dosageStock as any).baselinePrice,
            stockAmount: dosageStock.stockAmount ?? 0,
            inStock: dosageStock.inStock,
          });
          return;
        }
        
        // Data-driven confidence calculation
        if (views >= 50 && purchased >= 5) {
          confidence = "high";
        } else if (views >= 20 && purchased >= 1) {
          confidence = "medium";
        } else {
          confidence = "low";
        }
        
        // Primary signal detection (mutually exclusive, prioritized)
        let primarySignalSet = false;
        
        // 1. High views, low purchase
        if (views > 50 && conversionRate < 2 && purchased > 0 && !primarySignalSet) {
          reasonCodes.push("HIGH_VIEWS_LOW_PURCHASE");
          suggestedPrice = currentPrice * 0.9;
          expectedImpact = "May increase conversion by 15-25%";
          primarySignalSet = true;
        }
        
        // 2. Fast sell-through
        if (conversionRate > 5 && isLowStock && !primarySignalSet) {
          reasonCodes.push("FAST_SELL_THROUGH");
          suggestedPrice = currentPrice * 1.1;
          expectedImpact = "Maximize margin while demand is high";
          primarySignalSet = true;
        }
        
        // 3. Slow moving
        if (views < 20 && daysSinceLastSale && daysSinceLastSale > 30 && !primarySignalSet) {
          reasonCodes.push("SLOW_MOVING");
          suggestedPrice = currentPrice * 0.85;
          expectedImpact = "May attract new buyers";
          primarySignalSet = true;
        }
        
        // Secondary signals
        if (isLowStock && !reasonCodes.includes("FAST_SELL_THROUGH")) {
          reasonCodes.push("LOW_STOCK");
        }
        
        if (purchased === 0) {
          reasonCodes.push("NO_SALES_HISTORY");
          confidence = "low";
        }
        
        if (reasonCodes.length === 0) {
          reasonCodes.push("STABLE_PERFORMER");
        }
        
        signals.push({
          dosageStockId: dosageStock.id,
          productId: product.id,
          productName: product.name,
          dosage: dosageStock.dosage,
          currentPrice,
          suggestedPrice,
          confidence,
          reasonCodes,
          expectedImpact,
          isDisabled,
          disabledReason,
          behavioralMetrics: {
            views,
            addToCart,
            checkoutStarted,
            purchased,
            daysSinceLastSale,
            conversionRate,
          },
          pricingSuggestionsEnabled: (dosageStock as any).pricingSuggestionsEnabled ?? false,
          hasBaseline: !!(dosageStock as any).baselinePrice,
          stockAmount: dosageStock.stockAmount ?? 0,
          inStock: dosageStock.inStock,
        });
      });
    });
    
    return signals;
  }, [productsWithStock, dosageBehavioralMetrics]);

  // Group signals by product
  const productDosageGroups: ProductDosageGroup[] = useMemo(() => {
    const groupMap = new Map<string, ProductDosageGroup>();
    
    dosagePricingSignals.forEach((signal) => {
      if (!groupMap.has(signal.productId)) {
        const product = productsWithStock.find(p => p.id === signal.productId);
        groupMap.set(signal.productId, {
          productId: signal.productId,
          productName: signal.productName,
          category: product?.category || "Unknown",
          dosageSignals: [],
        });
      }
      groupMap.get(signal.productId)!.dosageSignals.push(signal);
    });
    
    return Array.from(groupMap.values());
  }, [dosagePricingSignals, productsWithStock]);

  // Compute alert counts from dosage-level signals
  const alertCounts = useMemo(() => {
    const highViewsLowPurchase = dosagePricingSignals.filter(s => s.reasonCodes.includes("HIGH_VIEWS_LOW_PURCHASE")).length;
    const fastSelling = dosagePricingSignals.filter(s => s.reasonCodes.includes("FAST_SELL_THROUGH")).length;
    const slowMoving = dosagePricingSignals.filter(s => s.reasonCodes.includes("SLOW_MOVING")).length;
    return { highViewsLowPurchase, fastSelling, slowMoving };
  }, [dosagePricingSignals]);

  // Filter groups based on selected filter and product search
  const filteredGroups = useMemo(() => {
    let groups = productDosageGroups;
    
    // Apply product name search filter
    if (productSearch.trim()) {
      const searchLower = productSearch.toLowerCase().trim();
      groups = groups.filter(group => 
        group.productName.toLowerCase().includes(searchLower) ||
        group.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply signal filter
    if (selectedSignalFilter !== "all") {
      groups = groups
        .map(group => {
          let filteredDosages = group.dosageSignals;
          
          if (selectedSignalFilter === "high-views-low-purchase") {
            filteredDosages = group.dosageSignals.filter(s => s.reasonCodes.includes("HIGH_VIEWS_LOW_PURCHASE"));
          } else if (selectedSignalFilter === "fast-selling") {
            filteredDosages = group.dosageSignals.filter(s => s.reasonCodes.includes("FAST_SELL_THROUGH"));
          } else if (selectedSignalFilter === "slow-moving") {
            filteredDosages = group.dosageSignals.filter(s => s.reasonCodes.includes("SLOW_MOVING"));
          } else if (selectedSignalFilter === "needs-baseline") {
            filteredDosages = group.dosageSignals.filter(s => !s.hasBaseline);
          }
          
          return { ...group, dosageSignals: filteredDosages };
        })
        .filter(group => group.dosageSignals.length > 0);
    }
    
    return groups;
  }, [productDosageGroups, selectedSignalFilter, productSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredGroups.length / PRODUCTS_PER_PAGE);
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredGroups.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredGroups, currentPage]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setProductSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedSignalFilter(filter);
    setCurrentPage(1);
  };

  const markDosagePriceAsUpdated = (dosageStockId: string) => {
    try {
      const stored = localStorage.getItem("recentDosagePriceUpdates");
      const updates = stored ? JSON.parse(stored) : {};
      updates[dosageStockId] = Date.now();
      localStorage.setItem("recentDosagePriceUpdates", JSON.stringify(updates));
    } catch (error) {
      console.error("Failed to mark dosage price as updated:", error);
    }
  };

  // Update dosage stock price mutation
  const updateDosagePriceMutation = useMutation({
    mutationFn: async ({ dosageStockId, productId, price, currentPrice, isDisabled }: { 
      dosageStockId: string; 
      productId: string;
      price: string; 
      currentPrice?: number; 
      isDisabled?: boolean 
    }) => {
      // Hard-block safeguard: prevent mutation when dosage is disabled (OOS)
      if (isDisabled) {
        throw new Error("Cannot apply pricing suggestion - dosage is out of stock");
      }
      
      const response = await apiRequest("PATCH", `/api/admin/dosage-stock/${dosageStockId}`, { price });
      
      // Record price change in product history for transparency
      if (currentPrice && Number(price) !== currentPrice) {
        try {
          await apiRequest("POST", `/api/admin/products/${productId}/price-change`, {
            newPrice: Number(price),
            reason: "Dosage Pricing Advisory",
            notes: `Dosage price updated (from $${currentPrice.toFixed(2)} to $${price})`
          });
        } catch (error) {
          console.error("Failed to record price change:", error);
        }
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-stock"] });
      markDosagePriceAsUpdated(variables.dosageStockId);
      setAppliedSuggestions(prev => [...prev, variables.dosageStockId]);
      toast({
        title: "Dosage Price Updated",
        description: "Dosage price has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update dosage price.",
        variant: "destructive",
      });
    },
  });

  // Toggle dosage-level pricing suggestions
  const toggleDosagePricingSuggestionsMutation = useMutation({
    mutationFn: async ({ dosageStockId, enabled }: { dosageStockId: string; enabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/dosage-stock/${dosageStockId}/pricing-suggestions`, { 
        enabled 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products-with-stock"] });
      toast({
        title: "Settings Updated",
        description: "Dosage pricing suggestions setting has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[confidence as keyof typeof colors] || colors.medium;
  };

  const getReasonCodeLabel = (code: ReasonCode): string => {
    const labels: Record<ReasonCode, string> = {
      "HIGH_VIEWS_LOW_PURCHASE": "High views, low conversion",
      "FAST_SELL_THROUGH": "Fast-selling",
      "LOW_STOCK": "Low stock",
      "SLOW_MOVING": "Slow moving",
      "NO_SALES_HISTORY": "No sales history",
      "STABLE_PERFORMER": "Stable performer",
      "INSUFFICIENT_SIGNAL_OOS": "Out of stock",
    };
    return labels[code];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#21d8ff]" />
            Dosage Pricing Advisory
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Per-dosage behavioral signals and pricing suggestions. Enable individually to apply changes.
          </p>
        </div>
      </div>

      {/* Pricing Signals Panel */}
      <div className="grid grid-cols-3 gap-4">
        <Card 
          className={`p-4 cursor-pointer transition-all ${selectedSignalFilter === 'high-views-low-purchase' ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
          onClick={() => handleFilterChange(selectedSignalFilter === 'high-views-low-purchase' ? 'all' : 'high-views-low-purchase')}
          data-testid="card-signal-high-views"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Eye className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{alertCounts.highViewsLowPurchase}</div>
              <div className="text-sm text-muted-foreground">High views, low conversion</div>
            </div>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all ${selectedSignalFilter === 'fast-selling' ? 'border-green-500/50 bg-green-500/5' : ''}`}
          onClick={() => handleFilterChange(selectedSignalFilter === 'fast-selling' ? 'all' : 'fast-selling')}
          data-testid="card-signal-fast-selling"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{alertCounts.fastSelling}</div>
              <div className="text-sm text-muted-foreground">Fast-selling candidates</div>
            </div>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer transition-all ${selectedSignalFilter === 'slow-moving' ? 'border-red-500/50 bg-red-500/5' : ''}`}
          onClick={() => handleFilterChange(selectedSignalFilter === 'slow-moving' ? 'all' : 'slow-moving')}
          data-testid="card-signal-slow-moving"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{alertCounts.slowMoving}</div>
              <div className="text-sm text-muted-foreground">Overstock slow movers</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-product-search"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedSignalFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
            data-testid="button-filter-all"
          >
            All ({filteredGroups.length})
          </Button>
          <Button
            variant={selectedSignalFilter === 'needs-baseline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('needs-baseline')}
            data-testid="button-filter-needs-baseline"
          >
            Needs Baseline
          </Button>
        </div>
      </div>

      {/* Results count and pagination info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {paginatedGroups.length} of {filteredGroups.length} products
          {productSearch && ` matching "${productSearch}"`}
        </span>
        {totalPages > 1 && (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>

      {/* Dosage-Level Grouped Table */}
      <div className="space-y-4">
        {paginatedGroups.map((group) => (
          <Card key={group.productId} data-testid={`card-product-group-${group.productId}`}>
            <div className="p-2">
              <Button 
                variant="ghost"
                className="w-full justify-between"
                onClick={() => toggleProductExpanded(group.productId)}
                data-testid={`button-expand-product-${group.productId}`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedProducts.has(group.productId) ? 'rotate-180' : ''
                    }`} 
                  />
                  <div className="text-left">
                    <h3 className="font-medium">{group.productName}</h3>
                    <p className="text-sm text-muted-foreground">{group.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {group.dosageSignals.length} dosage{group.dosageSignals.length !== 1 ? 's' : ''}
                  </Badge>
                  {group.dosageSignals.some(s => s.suggestedPrice !== null) && (
                    <Badge className="bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30 text-xs">
                      Has Suggestions
                    </Badge>
                  )}
                </div>
              </Button>
            </div>
            
            {expandedProducts.has(group.productId) && (
              <div className="overflow-hidden">
                <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead>Dosage</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Suggested</TableHead>
                    <TableHead>Metrics</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.dosageSignals.map((signal) => (
                    <TableRow key={signal.dosageStockId} data-testid={`row-dosage-${signal.dosageStockId}`}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {signal.dosage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm ${
                            signal.stockAmount <= 0 ? 'text-red-400' : 
                            signal.stockAmount <= LOW_STOCK_THRESHOLD ? 'text-yellow-400' : 
                            'text-green-400'
                          }`}>
                            {signal.stockAmount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${signal.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {signal.isDisabled ? (
                          <Badge variant="secondary" className="text-xs">
                            {signal.disabledReason}
                          </Badge>
                        ) : signal.suggestedPrice ? (
                          <span className={signal.suggestedPrice > signal.currentPrice ? "text-green-400" : "text-red-400"}>
                            ${signal.suggestedPrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span>{signal.behavioralMetrics.views}</span>
                            <ShoppingCart className="h-3 w-3 text-muted-foreground ml-2" />
                            <span>{signal.behavioralMetrics.addToCart}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Conv:</span>
                            <span>{signal.behavioralMetrics.conversionRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {signal.reasonCodes.slice(0, 2).map((code) => (
                            <Badge 
                              key={code} 
                              variant="outline" 
                              className="text-xs"
                              title={getReasonCodeLabel(code)}
                            >
                              {code.split("_")[0]}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getConfidenceBadge(signal.confidence)}>
                          {signal.confidence}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={signal.pricingSuggestionsEnabled}
                          onCheckedChange={(checked) => toggleDosagePricingSuggestionsMutation.mutate({
                            dosageStockId: signal.dosageStockId,
                            enabled: checked === true
                          })}
                          disabled={signal.isDisabled}
                          data-testid={`checkbox-enable-${signal.dosageStockId}`}
                        />
                      </TableCell>
                      <TableCell>
                        {appliedSuggestions.includes(signal.dosageStockId) ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Applied
                          </Badge>
                        ) : signal.isDisabled || !signal.suggestedPrice ? (
                          <Badge variant="secondary">N/A</Badge>
                        ) : signal.pricingSuggestionsEnabled ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDosagePriceMutation.mutate({
                              dosageStockId: signal.dosageStockId,
                              productId: signal.productId,
                              price: signal.suggestedPrice!.toFixed(2),
                              currentPrice: signal.currentPrice,
                              isDisabled: signal.isDisabled,
                            })}
                            disabled={updateDosagePriceMutation.isPending || signal.isDisabled}
                            className="border-[#E7FB10]/50"
                            data-testid={`button-apply-price-${signal.dosageStockId}`}
                          >
                            Apply
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Enable first
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            data-testid="button-page-first"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            data-testid="button-page-prev"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-9"
                  data-testid={`button-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            data-testid="button-page-next"
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            data-testid="button-page-last"
          >
            Last
          </Button>
        </div>
      )}

      {/* Empty state */}
      {filteredGroups.length === 0 && (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">No Dosages Found</h3>
          <p className="text-sm text-muted-foreground">
            {selectedSignalFilter !== 'all' 
              ? "No dosages match the selected filter. Try selecting a different filter."
              : "Add products with dosage options to start seeing pricing signals."}
          </p>
        </Card>
      )}
    </div>
  );
}

export default function Admin() {
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        login();
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user?.isAdmin) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12">
              <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-6" />
              <h1 className="font-display text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access the admin panel. 
                Please contact an administrator if you believe this is an error.
              </p>
              <Button onClick={() => window.location.href = "/dashboard"} data-testid="button-back-to-dashboard">
                Back to Dashboard
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Admin Dashboard" description="Manage products, orders, and site settings. Administrative control panel." canonicalPath="/admin" />
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold holographic-text" data-testid="text-admin-title">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">Manage products, orders, and site content</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-7xl grid-cols-12">
                <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2" data-testid="tab-products">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Inventory</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2" data-testid="tab-pricing">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Pricing</span>
                </TabsTrigger>
                <TabsTrigger value="coas" className="flex items-center gap-2" data-testid="tab-coas">
                  <FileCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">COAs</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2" data-testid="tab-orders">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex items-center gap-2" data-testid="tab-customers">
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Customers</span>
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-2" data-testid="tab-contacts">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Contacts</span>
                </TabsTrigger>
                <TabsTrigger value="affiliates" className="flex items-center gap-2" data-testid="tab-affiliates">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Affiliates</span>
                </TabsTrigger>
                <TabsTrigger value="discounts" className="flex items-center gap-2" data-testid="tab-discounts">
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Discounts</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notify</span>
                </TabsTrigger>
                <TabsTrigger value="email-logs" className="flex items-center gap-2" data-testid="tab-email-logs">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Emails</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <DashboardOverview onNavigateToTab={setActiveTab} />
              </TabsContent>

              <TabsContent value="products">
                <Card className="p-6">
                  <ProductsTab />
                </Card>
              </TabsContent>

              <TabsContent value="pricing">
                <Card className="p-6">
                  <PricingOptimizerTab />
                </Card>
              </TabsContent>

              <TabsContent value="coas">
                <Card className="p-6">
                  <CoasTab />
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card className="p-6">
                  <OrdersTab />
                </Card>
              </TabsContent>

              <TabsContent value="customers">
                <Card className="p-6">
                  <CustomersTab />
                </Card>
              </TabsContent>

              <TabsContent value="contacts">
                <Card className="p-6">
                  <ContactsTab />
                </Card>
              </TabsContent>

              <TabsContent value="affiliates">
                <Card className="p-6">
                  <AffiliatesTab />
                </Card>
              </TabsContent>

              <TabsContent value="discounts">
                <Card className="p-6">
                  <DiscountCodesTab />
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="p-6">
                  <StockNotificationsTab />
                </Card>
              </TabsContent>

              <TabsContent value="email-logs">
                <Card className="p-6">
                  <EmailLogsTab />
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
