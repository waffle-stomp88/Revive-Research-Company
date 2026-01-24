import { useEffect, useState, useCallback } from "react";
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
  Settings,
  Download,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertCoaSchema, type Product, type Coa, type Order, type Contact, type AffiliateApplication, type Affiliate, type AffiliatePayout, type ProductDosageStock, type ProductWithDosageStock } from "@shared/schema";
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

function DashboardOverview({ onNavigateToTab }: { onNavigateToTab: (tab: string) => void }) {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [topProductsSort, setTopProductsSort] = useState<"revenue" | "units">("revenue");
  
  const { data: pendingNotifications = [] } = useQuery<StockNotificationWithProduct[]>({
    queryKey: ["/api/admin/stock-notifications"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stock-notifications", {
        credentials: "include"
      });
      if (!response.ok) return [];
      return response.json();
    }
  });
  
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/admin/dashboard", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard?days=${timeRange}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard metrics");
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const attentionItems = [
    ...(metrics.pendingOrders > 0 ? [{
      type: "warning",
      icon: Clock,
      title: "Pending Orders",
      count: metrics.pendingOrders,
      color: "#E7FB10",
      targetTab: "orders"
    }] : []),
    ...(metrics.processingOrders > 0 ? [{
      type: "info",
      icon: Package,
      title: "Processing Orders",
      count: metrics.processingOrders,
      color: "#21d8ff",
      targetTab: "orders"
    }] : []),
    ...(metrics.outOfStockProducts.length > 0 ? [{
      type: "error",
      icon: PackageX,
      title: "Out of Stock",
      count: metrics.outOfStockProducts.length,
      color: "#ef4444",
      targetTab: "products"
    }] : []),
    ...(metrics.lowStockProducts.length > 0 ? [{
      type: "warning",
      icon: AlertCircle,
      title: "Low Stock Items",
      count: metrics.lowStockProducts.length,
      color: "#f59e0b",
      targetTab: "products"
    }] : []),
    ...(metrics.pendingAffiliateApplications > 0 ? [{
      type: "info",
      icon: Users,
      title: "Affiliate Applications",
      count: metrics.pendingAffiliateApplications,
      color: "#9d4edd",
      targetTab: "affiliates"
    }] : []),
    ...(metrics.pendingPayouts > 0 ? [{
      type: "warning",
      icon: CreditCard,
      title: "Pending Payouts",
      count: metrics.pendingPayouts,
      color: "#21d8ff",
      targetTab: "affiliates"
    }] : []),
    ...(metrics.recentContacts > 0 ? [{
      type: "info",
      icon: Inbox,
      title: "New Messages",
      count: metrics.recentContacts,
      color: "#21d8ff",
      targetTab: "contacts"
    }] : []),
    ...(pendingNotifications.length > 0 ? [{
      type: "info",
      icon: Bell,
      title: "Stock Notifications",
      count: pendingNotifications.length,
      color: "#21d8ff",
      targetTab: "notifications"
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold" data-testid="text-dashboard-title">Business Overview</h2>
          <p className="text-muted-foreground text-sm">Your store performance at a glance</p>
        </div>
        <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
          <SelectTrigger className="w-[140px]" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-[#E7FB10]/30 hover:border-[#E7FB10]/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-[#E7FB10]" data-testid="text-total-revenue">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#E7FB10]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#E7FB10]" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E7FB10]/50 to-[#E7FB10]" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-[#21d8ff]/30 hover:border-[#21d8ff]/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-[#21d8ff]" data-testid="text-total-orders">
                  {metrics.totalOrders}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#21d8ff]/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-[#21d8ff]" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#21d8ff]/50 to-[#21d8ff]" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-[#9d4edd]/30 hover:border-[#9d4edd]/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-[#9d4edd]" data-testid="text-avg-order">
                  {formatCurrency(metrics.averageOrderValue)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#9d4edd]/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#9d4edd]" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9d4edd]/50 to-[#9d4edd]" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-white/20 hover:border-white/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Products Sold</p>
                <p className="text-2xl font-bold" data-testid="text-products-sold">
                  {metrics.totalProductsSold}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/50 to-white" />
          </CardContent>
        </Card>
      </div>

      {attentionItems.length > 0 && (
        <Card className="border-[#E7FB10]/20 bg-[#E7FB10]/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#E7FB10]" />
              Items Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {attentionItems.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => onNavigateToTab(item.targetTab)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 hover:border-border transition-colors cursor-pointer text-left"
                  data-testid={`attention-item-${item.targetTab}-${index}`}
                >
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold" style={{ color: item.color }}>{item.count}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#21d8ff]" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]" data-testid="chart-revenue-trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueTrend}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#21d8ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#21d8ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(v) => `$${v}`}
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a1a1f", 
                      border: "1px solid #333",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { 
                      weekday: "short", 
                      month: "short", 
                      day: "numeric" 
                    })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#21d8ff" 
                    strokeWidth={2}
                    fill="url(#revenueGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#E7FB10]" />
                Top Products
              </CardTitle>
              <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                <button
                  onClick={() => setTopProductsSort("revenue")}
                  className={`px-3 py-1.5 transition-colors ${
                    topProductsSort === "revenue" 
                      ? "bg-[#E7FB10] text-black font-medium" 
                      : "bg-background hover:bg-muted"
                  }`}
                  data-testid="btn-sort-revenue"
                >
                  Revenue
                </button>
                <button
                  onClick={() => setTopProductsSort("units")}
                  className={`px-3 py-1.5 transition-colors ${
                    topProductsSort === "units" 
                      ? "bg-[#21d8ff] text-black font-medium" 
                      : "bg-background hover:bg-muted"
                  }`}
                  data-testid="btn-sort-units"
                >
                  Units Sold
                </button>
              </div>
            </div>
            <CardDescription>
              {topProductsSort === "revenue" ? "Best sellers by revenue" : "Most popular by quantity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topProducts.length > 0 ? (
              <div className="space-y-4">
                {[...metrics.topProducts]
                  .sort((a, b) => topProductsSort === "revenue" 
                    ? b.revenue - a.revenue 
                    : b.totalSold - a.totalSold
                  )
                  .map((product, index) => (
                  <div 
                    key={product.productId} 
                    className="flex items-center gap-3"
                    data-testid={`top-product-${index}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-[#E7FB10] text-black" : 
                      index === 1 ? "bg-[#21d8ff] text-black" : 
                      index === 2 ? "bg-[#9d4edd] text-white" : 
                      "bg-white/10 text-white"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {topProductsSort === "revenue" 
                          ? `${product.totalSold} sold` 
                          : formatCurrency(product.revenue)
                        }
                      </p>
                    </div>
                    <p className={`font-bold ${topProductsSort === "revenue" ? "text-[#E7FB10]" : "text-[#21d8ff]"}`}>
                      {topProductsSort === "revenue" 
                        ? formatCurrency(product.revenue)
                        : `${product.totalSold} units`
                      }
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-50" />
                <p>No sales data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#21d8ff]" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                    data-testid={`recent-order-${order.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#21d8ff]/10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-[#21d8ff]" />
                      </div>
                      <div>
                        <p className="font-medium">{order.firstName} {order.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#E7FB10]">{formatCurrency(parseFloat(order.totalAmount))}</p>
                      <Badge 
                        variant={order.status === "completed" || order.status === "shipped" ? "default" : "secondary"}
                        className={
                          order.status === "completed" || order.status === "shipped" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : order.status === "pending" 
                            ? "bg-[#E7FB10]/20 text-[#E7FB10] border-[#E7FB10]/30"
                            : "bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mb-3 opacity-50" />
                <p>No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#9d4edd]" />
              Affiliate Overview
            </CardTitle>
            <CardDescription>Partner program performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/30">
                <p className="text-sm text-muted-foreground mb-1">Active Affiliates</p>
                <p className="text-2xl font-bold text-[#9d4edd]" data-testid="text-active-affiliates">
                  {metrics.activeAffiliates}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30">
                <p className="text-sm text-muted-foreground mb-1">Total Commissions</p>
                <p className="text-2xl font-bold text-[#E7FB10]" data-testid="text-total-commissions">
                  {formatCurrency(metrics.totalAffiliateCommissions)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/30">
                <p className="text-sm text-muted-foreground mb-1">Pending Applications</p>
                <p className="text-2xl font-bold text-[#21d8ff]" data-testid="text-pending-applications">
                  {metrics.pendingAffiliateApplications}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className="text-sm text-muted-foreground mb-1">Pending Payouts</p>
                <p className="text-2xl font-bold text-orange-400" data-testid="text-pending-payouts">
                  {metrics.pendingPayouts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {(metrics.lowStockProducts.length > 0 || metrics.outOfStockProducts.length > 0) && (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>Products requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.outOfStockProducts.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                    <PackageX className="h-4 w-4" />
                    Out of Stock ({metrics.outOfStockProducts.length})
                  </h4>
                  <div className="space-y-2">
                    {metrics.outOfStockProducts.slice(0, 5).map((product) => (
                      <div 
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20"
                        data-testid={`out-of-stock-${product.id}`}
                      >
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {metrics.lowStockProducts.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Low Stock ({metrics.lowStockProducts.length})
                  </h4>
                  <div className="space-y-2">
                    {metrics.lowStockProducts.slice(0, 5).map((product) => (
                      <div 
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded bg-orange-500/10 border border-orange-500/20"
                        data-testid={`low-stock-${product.id}`}
                      >
                        <span className="text-sm">{product.name}</span>
                        <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {product.stockAmount} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
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

  // Fetch products with dosage stock data
  const { data: productsWithStock, isLoading } = useQuery<ProductWithDosageStock[]>({
    queryKey: ["/api/admin/products-with-stock"],
  });

  // Fallback to regular products for non-admin use
  const products = productsWithStock;

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

  const sortedProducts = products?.slice().sort((a, b) => {
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
    setDosageStocks(prev => prev.map((ds, i) => 
      i === index ? { ...ds, [field]: value } : ds
    ));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products ({products?.length || 0})</h2>
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
                              onClick={() => updateDosageStock(index, 'inStock', !ds.inStock)}
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCoas?.map((coa) => (
              <TableRow key={coa.id} data-testid={`row-coa-${coa.id}`}>
                <TableCell className="font-mono">{coa.batchNumber}</TableCell>
                <TableCell>{coa.productName}</TableCell>
                <TableCell>{coa.purity}</TableCell>
                <TableCell>{coa.labName}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { toast } = useToast();

  const { data: allOrders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  const getProductName = (productId: string) => {
    return products?.find((p) => p.id === productId)?.name || "Unknown Product";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <h2 className="text-xl font-semibold">Orders ({allOrders?.length || 0})</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOrders?.map((order) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.firstName} {order.lastName}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                  </div>
                </TableCell>
                <TableCell>{getProductName(order.productId)}</TableCell>
                <TableCell>${Number(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={order.status || "pending"}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {order.city}, {order.state}
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

function ContactsTab() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/admin/contacts/${id}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
    },
  });

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      markAsReadMutation.mutate(contact.id);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
    return formatDate(date);
  };

  const filteredContacts = contacts?.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Inbox className="h-5 w-5 text-[#21d8ff]" />
          Contact Submissions ({contacts?.length || 0})
        </h2>
        <div className="relative w-64">
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-contacts"
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="flex h-[600px] border rounded-lg overflow-hidden">
          <div className="w-1/3 border-r bg-background/50 overflow-y-auto">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left p-4 border-b transition-colors ${
                    selectedContact?.id === contact.id
                      ? "bg-[#21d8ff]/10 border-l-2 border-l-[#21d8ff]"
                      : !contact.isRead 
                        ? "bg-[#E7FB10]/5 hover:bg-[#E7FB10]/10 border-l-2 border-l-[#E7FB10]"
                        : "hover:bg-muted/50 border-l-2 border-l-transparent"
                  }`}
                  data-testid={`contact-item-${contact.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        !contact.isRead ? "bg-[#E7FB10]/20" : "bg-[#9d4edd]/20"
                      }`}>
                        <span className={`text-sm font-bold ${
                          !contact.isRead ? "text-[#E7FB10]" : "text-[#9d4edd]"
                        }`}>
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex items-center gap-2">
                        <span className={`font-medium truncate ${!contact.isRead ? "text-foreground" : ""}`}>{contact.name}</span>
                        {!contact.isRead && (
                          <Badge className="shrink-0 bg-[#E7FB10] text-black text-[10px] px-1.5 py-0">New</Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {getTimeAgo(contact.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate pl-10">
                    {contact.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-1 pl-10">
                    {contact.message}
                  </p>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No messages match your search</p>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col bg-background">
            {selectedContact ? (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#9d4edd]/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-[#9d4edd]">
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg" data-testid="text-selected-contact-name">
                          {selectedContact.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatFullDate(selectedContact.createdAt)}
                      </p>
                      <a
                        href={`mailto:${selectedContact.email}?subject=Re: Your inquiry to Revive Research`}
                        className="inline-flex items-center gap-1 text-sm text-[#21d8ff] hover:underline mt-1"
                        data-testid="link-reply-email"
                      >
                        <Mail className="h-3 w-3" />
                        Reply via Email
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-muted/30 rounded-lg p-6 border">
                    <p className="whitespace-pre-wrap leading-relaxed" data-testid="text-selected-contact-message">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t bg-muted/20">
                  <div className="flex items-center gap-3">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: Your inquiry to Revive Research`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-[#21d8ff] hover:bg-[#21d8ff]/90 text-black" data-testid="btn-reply-contact">
                        <Mail className="h-4 w-4 mr-2" />
                        Reply to {selectedContact.name.split(' ')[0]}
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedContact(null)}
                      data-testid="btn-close-contact"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <p className="font-medium mb-1">Select a message</p>
                <p className="text-sm">Click on a contact to view their full message</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">No Contact Submissions</h3>
          <p className="text-sm text-muted-foreground">
            Contact form submissions will appear here.
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

function ReviewsTab() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  const { data: reviews, isLoading } = useQuery<ReviewWithProduct[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const approveMutation = useMutation({
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

  const rejectMutation = useMutation({
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

  const deleteMutation = useMutation({
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

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredReviews = reviews?.filter(review => {
    if (filter === "all") return true;
    if (filter === "approved") return review.isApproved === true;
    if (filter === "pending") return review.isApproved === null;
    if (filter === "rejected") return review.isApproved === false;
    return true;
  }) || [];

  const pendingCount = reviews?.filter(r => r.isApproved === null).length || 0;
  const approvedCount = reviews?.filter(r => r.isApproved === true).length || 0;
  const rejectedCount = reviews?.filter(r => r.isApproved === false).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-[#E7FB10]" />
          Customer Reviews ({reviews?.length || 0})
        </h2>
        <div className="flex items-center gap-2">
          <Badge 
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All ({reviews?.length || 0})
          </Badge>
          <Badge 
            variant={filter === "pending" ? "default" : "outline"}
            className={`cursor-pointer ${filter === "pending" ? "bg-yellow-500" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({pendingCount})
          </Badge>
          <Badge 
            variant={filter === "approved" ? "default" : "outline"}
            className={`cursor-pointer ${filter === "approved" ? "bg-green-500" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Approved ({approvedCount})
          </Badge>
          <Badge 
            variant={filter === "rejected" ? "default" : "outline"}
            className={`cursor-pointer ${filter === "rejected" ? "bg-red-500" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({rejectedCount})
          </Badge>
        </div>
      </div>

      {filteredReviews.length > 0 ? (
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
                        className={review.isApproved === true ? "bg-green-500" : ""}
                      >
                        {review.isApproved === true ? "Approved" : review.isApproved === false ? "Rejected" : "Pending"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                  <div className="flex items-center gap-2">
                    {review.isApproved !== true && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-500 border-green-500/50 hover:bg-green-500/10"
                        onClick={() => approveMutation.mutate(review.id)}
                        disabled={approveMutation.isPending}
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
                        className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={rejectMutation.isPending}
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
                          className="text-muted-foreground hover:text-red-500"
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
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteMutation.mutate(review.id)}
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
          <h3 className="font-medium mb-2">No Reviews {filter !== "all" ? `(${filter})` : ""}</h3>
          <p className="text-sm text-muted-foreground">
            {filter === "all" 
              ? "Customer reviews will appear here once submitted."
              : `No ${filter} reviews found.`}
          </p>
        </Card>
      )}
    </div>
  );
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

function PricingOptimizerTab() {
  const { toast } = useToast();
  const [pricingData, setPricingData] = useState<PricingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [inventoryWeight, setInventoryWeight] = useState(1);
  const [marketWeight, setMarketWeight] = useState(1);
  const [complexityWeight, setComplexityWeight] = useState(1);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    // Check if we have cached data from a recent run (within 60 minutes)
    try {
      const cached = localStorage.getItem("pricingAnalysisCache");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const minutesSinceRun = (Date.now() - timestamp) / (1000 * 60);
        
        if (minutesSinceRun < AUTO_RUN_COOLDOWN_MINUTES) {
          // Use cached data instead of auto-running
          setPricingData(data);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load cached pricing data:", error);
    }
    
    // No recent cached data, run analysis
    generateSuggestions();
  }, []);

  const getRecentlyUpdatedProducts = (): string[] => {
    try {
      const stored = localStorage.getItem("recentPriceUpdates");
      if (!stored) return [];
      const updates = JSON.parse(stored) as Record<string, number>;
      const now = Date.now();
      const recent: string[] = [];
      
      Object.entries(updates).forEach(([productId, timestamp]) => {
        const hoursSinceUpdate = (now - timestamp) / (1000 * 60 * 60);
        if (hoursSinceUpdate < RECENT_UPDATE_WINDOW_HOURS) {
          recent.push(productId);
        }
      });
      
      return recent;
    } catch (error) {
      console.error("Failed to get recent updates:", error);
      return [];
    }
  };

  const markPriceAsUpdated = (productId: string) => {
    try {
      const stored = localStorage.getItem("recentPriceUpdates");
      const updates = stored ? JSON.parse(stored) : {};
      updates[productId] = Date.now();
      localStorage.setItem("recentPriceUpdates", JSON.stringify(updates));
    } catch (error) {
      console.error("Failed to mark price as updated:", error);
    }
  };

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, price, currentPrice }: { id: string; price: string; currentPrice?: number }) => {
      // Update the product price
      const response = await apiRequest("PATCH", `/api/admin/products/${id}`, { price });
      
      // Record the price change in history
      if (currentPrice && Number(price) !== currentPrice) {
        try {
          await apiRequest("POST", `/api/admin/products/${id}/price-change`, {
            newPrice: Number(price),
            reason: "AI Pricing Suggestion",
            notes: `Updated via AI pricing optimization (from $${currentPrice.toFixed(2)} to $${price})`
          });
        } catch (error) {
          console.error("Failed to record price change:", error);
          // Don't fail the mutation if history recording fails
        }
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      // Invalidate price-trend cache for this product so badge updates
      queryClient.invalidateQueries({ queryKey: ['/api/products', variables.id, 'price-trend'] });
      markPriceAsUpdated(variables.id);
      setAppliedSuggestions(prev => [...prev, variables.id]);
      toast({
        title: "Price Updated",
        description: "Product price has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product price.",
        variant: "destructive",
      });
    },
  });

  const generateSuggestions = async () => {
    setIsLoading(true);
    setAppliedSuggestions([]);
    try {
      const response = await fetch("/api/admin/pricing-suggestions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryWeight,
          marketWeight,
          complexityWeight
        })
      });
      
      if (!response.ok) throw new Error("Failed to generate suggestions");
      
      const data = await response.json();
      const recentlyUpdated = getRecentlyUpdatedProducts();
      
      // Filter out recently updated products and mark them
      const filtered = data.suggestions.map((s: PricingSuggestion) => ({
        ...s,
        wasRecentlyUpdated: recentlyUpdated.includes(s.productId)
      })).filter((s: PricingSuggestion & { wasRecentlyUpdated: boolean }) => !s.wasRecentlyUpdated);
      
      const filteredCount = data.suggestions.length - filtered.length;
      const totalAnalyzed = data.suggestions.length;
      
      const pricingResult: PricingResponse = {
        ...data,
        suggestions: filtered,
        filteredCount,
        totalAnalyzed
      };
      
      setPricingData(pricingResult);
      
      // Cache the results with timestamp
      try {
        localStorage.setItem("pricingAnalysisCache", JSON.stringify({
          data: pricingResult,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error("Failed to cache pricing data:", e);
      }
      
      const message = filteredCount > 0 
        ? `Generated ${filtered.length} suggestions (${filteredCount} recently updated products excluded)`
        : `Generated ${data.suggestions?.length || 0} pricing suggestions.`;
      
      toast({
        title: "Analysis Complete",
        description: message,
      });
    } catch (error) {
      console.error("Pricing generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate pricing suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyAllSuggestions = async () => {
    if (!pricingData?.suggestions) return;
    
    for (const suggestion of pricingData.suggestions) {
      if (suggestion.action !== "maintain" && !appliedSuggestions.includes(suggestion.productId)) {
        await updateProductMutation.mutateAsync({
          id: suggestion.productId,
          price: suggestion.suggestedPrice.toFixed(2),
        });
      }
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "increase": return "text-green-500";
      case "decrease": return "text-red-500";
      case "sale": return "text-[#E7FB10]";
      default: return "text-muted-foreground";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "increase": return <TrendingUp className="h-4 w-4" />;
      case "decrease": return <TrendingDown className="h-4 w-4" />;
      case "sale": return <Tag className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[confidence as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#E7FB10]/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-[#E7FB10]/10 to-[#21d8ff]/10 rounded-full p-6 border-2 border-[#E7FB10]/50 animate-pulse">
              <Loader2 className="h-12 w-12 text-[#E7FB10] animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#E7FB10] mb-1">Analyzing Your Pricing...</h3>
            <p className="text-sm text-muted-foreground">Running AI analysis on your product catalog</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E7FB10]" />
              AI-Powered Price Optimization
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get intelligent pricing suggestions with stable analysis and customizable factor weights.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="border-border"
              size="sm"
              data-testid="button-pricing-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {pricingData?.suggestions && pricingData.suggestions.length > 0 && (
              <Button
                variant="outline"
                onClick={applyAllSuggestions}
                disabled={updateProductMutation.isPending}
                className="border-[#E7FB10]/50 text-[#E7FB10] hover:bg-[#E7FB10]/10"
                data-testid="button-apply-all-prices"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply All
              </Button>
            )}
            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
              size="lg"
              data-testid="button-generate-pricing"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate Suggestions
            </Button>
          </div>
        </div>
      )}

      {showSettings && (
        <Card className="p-4 border-[#21d8ff]/30 bg-[#21d8ff]/5">
          <h3 className="font-medium mb-4">Factor Weights - How Each Affects Pricing</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3 p-3 rounded-lg border border-border/30">
              <div>
                <Label className="text-sm font-semibold">📦 Inventory Impact</Label>
                <div className="flex items-center gap-2 mt-2">
                  <RangeSlider
                    min={0.1}
                    max={3}
                    step={0.1}
                    value={inventoryWeight}
                    onChange={setInventoryWeight}
                    className="flex-1"
                    data-testid="slider-inventory-weight"
                  />
                  <span className="w-10 text-right font-medium text-[#E7FB10]">{inventoryWeight.toFixed(1)}x</span>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground"><strong>At {inventoryWeight.toFixed(1)}x:</strong></p>
                <div className="bg-background/40 p-2 rounded space-y-1">
                  <p>🟢 <strong>Low stock (5 units)</strong></p>
                  <p className="text-muted-foreground">→ Increase price to boost margin</p>
                  <p className="mt-2">🔴 <strong>High stock (100+ units)</strong></p>
                  <p className="text-muted-foreground">→ Decrease price to move inventory</p>
                </div>
                <p className="text-muted-foreground mt-2"><em>0.1x = ignore stock | 3x = heavily prioritize stock levels</em></p>
              </div>
            </div>
            <div className="space-y-3 p-3 rounded-lg border border-border/30">
              <div>
                <Label className="text-sm font-semibold">📊 Market Position</Label>
                <div className="flex items-center gap-2 mt-2">
                  <RangeSlider
                    min={0.1}
                    max={3}
                    step={0.1}
                    value={marketWeight}
                    onChange={setMarketWeight}
                    className="flex-1"
                    data-testid="slider-market-weight"
                  />
                  <span className="w-10 text-right font-medium text-[#21d8ff]">{marketWeight.toFixed(1)}x</span>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground"><strong>At {marketWeight.toFixed(1)}x:</strong></p>
                <div className="bg-background/40 p-2 rounded space-y-1">
                  <p>💰 <strong>Premium vs your catalog</strong></p>
                  <p className="text-muted-foreground">→ Maintain higher pricing</p>
                  <p className="mt-2">💵 <strong>Budget vs your catalog</strong></p>
                  <p className="text-muted-foreground">→ Suggest competitive pricing</p>
                </div>
                <p className="text-muted-foreground mt-2"><em>0.1x = ignore positioning | 3x = strongly compete in market</em></p>
              </div>
            </div>
            <div className="space-y-3 p-3 rounded-lg border border-border/30">
              <div>
                <Label className="text-sm font-semibold">⚗️ Product Complexity</Label>
                <div className="flex items-center gap-2 mt-2">
                  <RangeSlider
                    min={0.1}
                    max={3}
                    step={0.1}
                    value={complexityWeight}
                    onChange={setComplexityWeight}
                    className="flex-1"
                    data-testid="slider-complexity-weight"
                  />
                  <span className="w-10 text-right font-medium text-[#9d4edd]">{complexityWeight.toFixed(1)}x</span>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground"><strong>At {complexityWeight.toFixed(1)}x:</strong></p>
                <div className="bg-background/40 p-2 rounded space-y-1">
                  <p>🔬 <strong>Complex peptides</strong></p>
                  <p className="text-muted-foreground">→ Higher synthesis cost = higher prices</p>
                  <p className="mt-2">📋 <strong>Simple peptides</strong></p>
                  <p className="text-muted-foreground">→ Lower cost basis = competitive pricing</p>
                </div>
                <p className="text-muted-foreground mt-2"><em>0.1x = ignore complexity | 3x = maximize premium for complex</em></p>
              </div>
            </div>
          </div>
          <Button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="mt-4 w-full bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
            size="sm"
            data-testid="button-regenerate-with-weights"
          >
            Regenerate with New Weights
          </Button>
        </Card>
      )}

      {pricingData?.marketInsights && pricingData.suggestions.length > 0 && (
        <Card className="border-[#21d8ff]/30 bg-[#21d8ff]/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#21d8ff]/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-[#21d8ff]" />
              </div>
              <div>
                <h3 className="font-medium text-[#21d8ff]">Market Insights</h3>
                <p className="text-sm text-muted-foreground mt-1">{pricingData.marketInsights}</p>
                {pricingData.totalPotentialRevenue && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    <span className="text-[#E7FB10] font-semibold">{pricingData.totalPotentialRevenue}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pricingData?.suggestions && pricingData.suggestions.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-[#E7FB10]">{pricingData.suggestions.length}</div>
              <div className="text-sm text-muted-foreground">Total Suggestions</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {pricingData.suggestions.filter(s => s.action === "increase").length}
              </div>
              <div className="text-sm text-muted-foreground">Price Increases</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-500">
                {pricingData.suggestions.filter(s => s.action === "decrease").length}
              </div>
              <div className="text-sm text-muted-foreground">Price Decreases</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">
                {pricingData.suggestions.filter(s => s.action === "maintain").length}
              </div>
              <div className="text-sm text-muted-foreground">No Change</div>
            </Card>
          </div>

          <Card className="p-4 mb-4 border-[#E7FB10]/30 bg-[#E7FB10]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#E7FB10]" />
                <div>
                  <h3 className="font-medium">Ready to optimize your prices?</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply all {pricingData.suggestions.filter(s => s.action !== "maintain" && !appliedSuggestions.includes(s.productId)).length} pending suggestions with one click
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={applyAllSuggestions}
                disabled={updateProductMutation.isPending || pricingData.suggestions.filter(s => s.action !== "maintain" && !appliedSuggestions.includes(s.productId)).length === 0}
                className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 font-semibold px-6"
                data-testid="button-apply-all-suggestions"
              >
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply All Suggestions
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Suggested Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Reasoning</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingData.suggestions.map((suggestion) => (
                <TableRow key={suggestion.productId}>
                  <TableCell className="font-medium">{suggestion.productName}</TableCell>
                  <TableCell>${suggestion.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className={getActionColor(suggestion.action)}>
                    ${suggestion.suggestedPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${getActionColor(suggestion.action)}`}>
                      {getActionIcon(suggestion.action)}
                      <span>{suggestion.percentChange > 0 ? "+" : ""}{suggestion.percentChange.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getConfidenceBadge(suggestion.confidence)}>
                      {suggestion.confidence}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate" title={suggestion.reasoning}>
                      {suggestion.reasoning}
                    </p>
                  </TableCell>
                  <TableCell>
                    {appliedSuggestions.includes(suggestion.productId) ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    ) : suggestion.action === "maintain" ? (
                      <Badge variant="secondary">No Change</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProductMutation.mutate({
                          id: suggestion.productId,
                          price: suggestion.suggestedPrice.toFixed(2),
                          currentPrice: suggestion.currentPrice,
                        })}
                        disabled={updateProductMutation.isPending}
                        className="border-[#E7FB10]/50 hover:bg-[#E7FB10]/10"
                        data-testid={`button-apply-price-${suggestion.productId}`}
                      >
                        Apply
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !isLoading && pricingData ? (
        // Dashboard with all products recently updated
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-[#21d8ff]">{pricingData.totalAnalyzed || 0}</div>
              <div className="text-sm text-muted-foreground">Products Analyzed</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-[#E7FB10]">{pricingData.filteredCount || 0}</div>
              <div className="text-sm text-muted-foreground">Recently Updated</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-500">0</div>
              <div className="text-sm text-muted-foreground">New Suggestions</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">24h</div>
              <div className="text-sm text-muted-foreground">Cooldown Period</div>
            </Card>
          </div>

          <Card className="p-6 border-[#21d8ff]/30 bg-[#21d8ff]/5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#21d8ff]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-[#21d8ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#21d8ff] text-lg">All Products Recently Updated</h3>
                <p className="text-muted-foreground mt-1">
                  You've already applied pricing changes to all {pricingData.filteredCount || 0} products in the last 24 hours. 
                  New suggestions will be available after the cooldown period expires.
                </p>
                {pricingData.marketInsights && (
                  <div className="mt-4 p-3 bg-background/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Market Insights</p>
                    <p className="text-sm text-muted-foreground">{pricingData.marketInsights}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 text-center border-dashed">
            <p className="text-sm text-muted-foreground mb-3">
              Want to analyze again anyway? You can force a new analysis at any time.
            </p>
            <Button
              variant="outline"
              onClick={generateSuggestions}
              className="border-[#E7FB10]/50 hover:bg-[#E7FB10]/10"
              data-testid="button-force-reanalyze"
            >
              <Zap className="h-4 w-4 mr-2" />
              Force Re-Analyze
            </Button>
          </Card>
        </div>
      ) : !isLoading ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">No Pricing Suggestions Yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Click "Generate Suggestions" to analyze your product catalog and get AI-powered pricing recommendations.
          </p>
          <Button
            onClick={generateSuggestions}
            className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
            data-testid="button-generate-pricing-empty"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Suggestions
          </Button>
        </Card>
      ) : null}
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
              <TabsList className="grid w-full max-w-6xl grid-cols-10">
                <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2" data-testid="tab-products">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Products</span>
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
                <TabsTrigger value="reviews" className="flex items-center gap-2" data-testid="tab-reviews">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Reviews</span>
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

              <TabsContent value="reviews">
                <Card className="p-6">
                  <ReviewsTab />
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
