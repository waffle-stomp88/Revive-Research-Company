import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Package,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Calendar,
  CheckCircle,
  Truck,
  Clock,
  ChevronLeft,
  MapPin,
  ExternalLink,
  FlaskConical,
  Eye,
} from "lucide-react";
import type { Order, Product } from "@shared/schema";

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

function getStatusStep(order: Order) {
  const fulfillment = (order as any).fulfillmentStatus || "pending";
  if (fulfillment === "delivered") return 3;
  if ((order as any).trackingNumber || fulfillment === "ready") return 2;
  if (fulfillment === "preparing") return 1;
  if (order.status === "paid") return 0;
  return 0;
}

function getCarrierTrackingUrl(carrier: string, trackingNumber: string) {
  const c = carrier.toLowerCase();
  if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  if (c.includes("dhl")) return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
  return `https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`;
}

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function DashboardOrders() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [viewOrderDetails, setViewOrderDetails] = useState<Order | null>(null);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my-orders"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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

  const getProductName = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const getOrderNumber = (orderId: string) => `#${orderId.slice(-8).toUpperCase()}`;

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

  return (
    <>
      <SEOHead title="My Orders" description="View and manage your orders." canonicalPath="/dashboard/orders" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground px-2 h-8" data-testid="button-back-to-dashboard">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground/40 select-none">/</span>
              <span className="text-sm font-medium text-foreground" aria-current="page">Orders</span>
            </nav>
          </div>

          <div className="space-y-6">
            {/* Active Subscriptions */}
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
                      {subscriptions.filter(s => s.status === "active").length} active
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
                      <Badge className={sub.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-muted text-muted-foreground"}>
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
                  <Link href="/peptides">
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
                      const colors = ["#D4FF1F", "#21d8ff", "#9d4edd", "#ec4899", "#f97316"];
                      const color = colors[idx % colors.length];
                      const statusStep = getStatusStep(order);
                      return (
                        <div key={order.id} className="p-4 rounded-lg border" data-testid={`order-item-${order.id}`}>
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
                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <p className="font-semibold text-lg">${Number(order.totalAmount).toFixed(2)}</p>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-muted-foreground"
                                  onClick={() => setViewOrderDetails(order)}
                                  data-testid={`button-view-details-${order.id}`}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View details
                                </Button>
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
                          </div>

                          {(order as any).trackingNumber && (order as any).carrier && (
                            <div className="p-3 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20 mb-3" data-testid={`tracking-info-${order.id}`}>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-[#21d8ff]" />
                                  <span className="text-sm font-medium">{(order as any).carrier}</span>
                                  <span className="text-sm font-mono text-muted-foreground">{(order as any).trackingNumber}</span>
                                </div>
                                <a
                                  href={getCarrierTrackingUrl((order as any).carrier, (order as any).trackingNumber)}
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

                          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                            {["Confirmed", "Processing", "Shipped", "Delivered"].map((step, i) => {
                              const isComplete = i <= statusStep;
                              const isCurrent = i === statusStep;
                              return (
                                <div key={step} className="flex-1 flex items-center gap-1">
                                  <div className={`h-2 w-2 rounded-full shrink-0 ${isComplete ? "bg-green-500" : "bg-muted"} ${isCurrent ? "ring-2 ring-green-500/30" : ""}`} />
                                  <div className={`flex-1 h-0.5 ${i < 3 ? (i < statusStep ? "bg-green-500" : "bg-muted") : "hidden"}`} />
                                  <span className={`text-[10px] hidden sm:block ${isComplete ? "text-green-500" : "text-muted-foreground"}`}>{step}</span>
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
                    <Link href="/peptides">
                      <Button className="bg-[#D4FF1F] text-black" data-testid="button-browse-products-history">Browse Products</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Order Details Dialog — state + dialog live here; "Details" button on each row triggers it */}
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
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-[#21d8ff]/10 via-[#D4FF1F]/5 to-transparent border border-[#21d8ff]/20">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={getStatusColor(viewOrderDetails.status)} className="capitalize">
                  {viewOrderDetails.status || "pending"}
                </Badge>
              </div>

              {/* Fulfillment progress */}
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-xs text-muted-foreground mb-3">Fulfillment Progress</p>
                <div className="flex items-center gap-1">
                  {["Confirmed", "Processing", "Shipped", "Delivered"].map((step, i) => {
                    const statusStep = getStatusStep(viewOrderDetails);
                    const isComplete = i <= statusStep;
                    const isCurrent = i === statusStep;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex items-center w-full">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${isComplete ? "bg-green-500" : "bg-muted"} ${isCurrent ? "ring-2 ring-green-500/30" : ""}`} />
                          {i < 3 && <div className={`flex-1 h-0.5 ${i < statusStep ? "bg-green-500" : "bg-muted"}`} />}
                        </div>
                        <span className={`text-[9px] text-center ${isComplete ? "text-green-500" : "text-muted-foreground"}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking info */}
              {(viewOrderDetails as any).trackingNumber && (viewOrderDetails as any).carrier && (
                <div className="p-3 rounded-lg bg-[#21d8ff]/5 border border-[#21d8ff]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-[#21d8ff]" />
                    <p className="text-xs text-muted-foreground">Tracking</p>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium">{(viewOrderDetails as any).carrier}</p>
                      <p className="text-xs font-mono text-muted-foreground">{(viewOrderDetails as any).trackingNumber}</p>
                    </div>
                    <a
                      href={getCarrierTrackingUrl((viewOrderDetails as any).carrier, (viewOrderDetails as any).trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-dialog-track-package"
                    >
                      <Button size="sm" variant="outline" className="text-[#21d8ff] border-[#21d8ff]/30">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Track
                      </Button>
                    </a>
                  </div>
                </div>
              )}
              <Link href={`/peptides/${viewOrderDetails.productId}`}>
                <div className="p-4 rounded-lg border border-[#D4FF1F]/20 bg-gradient-to-br from-[#D4FF1F]/5 to-transparent cursor-pointer hover-elevate transition-all">
                  <div className="flex items-start gap-4">
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
              <div className="p-4 rounded-lg border border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-[#9d4edd]" />
                  <p className="text-xs text-muted-foreground">Shipping To</p>
                </div>
                <p className="font-medium">{(viewOrderDetails as any).firstName} {(viewOrderDetails as any).lastName}</p>
                <p className="text-sm text-muted-foreground">
                  {(viewOrderDetails as any).address && (
                    <>
                      {(viewOrderDetails as any).address}<br />
                      {(viewOrderDetails as any).city}, {(viewOrderDetails as any).state} {(viewOrderDetails as any).zipCode}<br />
                      {(viewOrderDetails as any).country || "USA"}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DashboardOrders;
