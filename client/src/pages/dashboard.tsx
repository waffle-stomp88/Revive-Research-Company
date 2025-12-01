import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import type { Order, Product, ReviewableOrder } from "@shared/schema";
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

  if (authLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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
      <div className="container mx-auto px-4 max-w-6xl">
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
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold" data-testid="text-user-name">
                    Welcome{user?.firstName ? `, ${user.firstName}` : ""}
                  </h1>
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

          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-orders">
                  {ordersLoading ? "..." : orders?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time purchases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-spent">
                  ${ordersLoading
                    ? "..."
                    : orders?.reduce((sum, o) => sum + Number(o.totalAmount), 0).toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Active</div>
                <p className="text-xs text-muted-foreground">
                  Member since {formatDate(user?.createdAt || new Date())}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Order History
                      </CardTitle>
                      <CardDescription>View your past orders and track shipments</CardDescription>
                    </div>
                    <Link href="/products">
                      <Button variant="outline" size="sm" data-testid="link-shop-more">
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
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover-elevate transition-colors"
                          data-testid={`order-item-${order.id}`}
                        >
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
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
                      ))}
                      {orders.length > 5 && (
                        <p className="text-center text-sm text-muted-foreground">
                          Showing 5 of {orders.length} orders
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium mb-2">No orders yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start shopping to see your order history here.
                      </p>
                      <Link href="/products">
                        <Button data-testid="button-start-shopping">
                          Browse Products
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Product Reviews
                      </CardTitle>
                      <CardDescription>Share your experience with our products</CardDescription>
                    </div>
                    {eligibleForReview.length > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    COA Verification
                  </CardTitle>
                  <CardDescription>
                    Verify product authenticity with batch numbers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Each product comes with a Certificate of Authenticity. Verify your batch number to ensure you have genuine Revive Research products.
                  </p>
                  <Link href="/coa">
                    <Button className="w-full" variant="outline" data-testid="link-verify-coa">
                      Verify Batch Number
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <div 
                className="rounded-lg p-6 overflow-hidden relative"
                style={{
                  background: 'linear-gradient(135deg, rgb(157, 78, 221) 0%, rgb(157, 78, 221) 50%, rgb(147, 51, 234) 100%)',
                }}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                        <TrendingUp className="h-5 w-5" />
                        Become an Affiliate
                      </h3>
                      <p className="text-white/90 text-sm">
                        Earn commissions by sharing Revive Research with others
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
                    <ul className="space-y-2 text-sm text-white/95">
                      <li className="flex items-start gap-2">
                        <span className="text-[#E7FB10] font-bold text-lg leading-none mt-0.5">✓</span>
                        <span>10% commission on direct sales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E7FB10] font-bold text-lg leading-none mt-0.5">✓</span>
                        <span>10% team override on recruits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E7FB10] font-bold text-lg leading-none mt-0.5">✓</span>
                        <span>20% personal-use discount</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E7FB10] font-bold text-lg leading-none mt-0.5">✓</span>
                        <span>Get paid monthly via PayPal, Venmo, or Zelle</span>
                      </li>
                    </ul>
                  </div>

                  <Link href="/affiliate-apply">
                    <Button 
                      className="w-full font-semibold text-base"
                      style={{
                        backgroundColor: '#E7FB10',
                        color: '#000',
                      }}
                      data-testid="button-affiliate-apply"
                    >
                      Apply to Our Program
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
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
