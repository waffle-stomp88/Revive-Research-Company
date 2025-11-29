import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingBag,
  Copy,
  ExternalLink,
  Wallet,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface AffiliateStats {
  directSalesCount: number;
  directSalesTotal: number;
  tier1Earnings: number;
  tier2Earnings: number;
  pendingBalance: number;
  teamSize: number;
  teamSalesCount: number;
  teamSalesTotal: number;
  totalPaidOut: number;
  referralCode: string;
  commissionRate: number;
}

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  referralCode: string;
  isActive: boolean;
  createdAt: string;
  salesCount: number;
  salesTotal: number;
  tier2EarningsFromMember: number;
}

interface AffiliateSale {
  id: string;
  orderId: string;
  orderTotal: string;
  commissionTier1: string;
  commissionTier2: string;
  tier1Status: string;
  tier2Status: string;
  createdAt: string;
}

interface AffiliatePayout {
  id: string;
  amount: string;
  payoutMethod: string;
  payoutEmail: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
  processedAt: string | null;
}

interface Affiliate {
  id: string;
  email: string;
  fullName: string;
  referralCode: string;
  payoutMethod: string;
  payoutEmail: string;
  pendingBalance: string;
}

export default function AffiliateDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to access your affiliate dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const { data: affiliate, isLoading: affiliateLoading, error: affiliateError } = useQuery<Affiliate>({
    queryKey: ["/api/affiliate/me"],
    enabled: isAuthenticated,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AffiliateStats>({
    queryKey: ["/api/affiliate/stats"],
    enabled: !!affiliate,
  });

  const { data: sales, isLoading: salesLoading } = useQuery<AffiliateSale[]>({
    queryKey: ["/api/affiliate/sales"],
    enabled: !!affiliate,
  });

  const { data: team, isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/affiliate/team"],
    enabled: !!affiliate,
  });

  const { data: payouts, isLoading: payoutsLoading } = useQuery<AffiliatePayout[]>({
    queryKey: ["/api/affiliate/payouts"],
    enabled: !!affiliate,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { payoutMethod: string; payoutEmail: string }) => {
      const response = await apiRequest("PATCH", "/api/affiliate/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/me"] });
      toast({
        title: "Settings Updated",
        description: "Your payout settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/affiliate/request-payout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/payouts"] });
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted for processing.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error?.message || "Failed to request payout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyReferralLink = () => {
    if (stats?.referralCode) {
      const link = `${window.location.origin}/?ref=${stats.referralCode}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied",
        description: "Your referral link has been copied to clipboard.",
      });
    }
  };

  if (authLoading || affiliateLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (affiliateError || !affiliate) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold mb-2">Not an Affiliate</h2>
          <p className="text-muted-foreground mb-6">
            You need to be an approved affiliate to access this dashboard.
          </p>
          <Link href="/affiliate">
            <Button data-testid="button-apply-affiliate">Apply to Become an Affiliate</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2" data-testid="text-dashboard-title">
            Affiliate Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {affiliate.fullName}! Here's your performance overview.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-[#E7FB10]/30 bg-gradient-to-r from-[#E7FB10]/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Referral Link</p>
                  <code className="text-sm bg-muted px-3 py-1.5 rounded font-mono" data-testid="text-referral-link">
                    {window.location.origin}/?ref={stats?.referralCode}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={copyReferralLink}
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`/?ref=${stats?.referralCode}`, "_blank")}
                    data-testid="button-preview-link"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#E7FB10]/10">
                  <DollarSign className="h-5 w-5 text-[#E7FB10]" />
                </div>
                <span className="text-sm text-muted-foreground">Tier 1 Earnings</span>
              </div>
              <p className="font-display text-2xl font-bold" data-testid="text-tier1-earnings">
                ${stats?.tier1Earnings?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#21d8ff]/10">
                  <TrendingUp className="h-5 w-5 text-[#21d8ff]" />
                </div>
                <span className="text-sm text-muted-foreground">Tier 2 Earnings</span>
              </div>
              <p className="font-display text-2xl font-bold" data-testid="text-tier2-earnings">
                ${stats?.tier2Earnings?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#9d4edd]/10">
                  <Wallet className="h-5 w-5 text-[#9d4edd]" />
                </div>
                <span className="text-sm text-muted-foreground">Pending Balance</span>
              </div>
              <p className="font-display text-2xl font-bold" data-testid="text-pending-balance">
                ${stats?.pendingBalance?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-sm text-muted-foreground">Team Size</span>
              </div>
              <p className="font-display text-2xl font-bold" data-testid="text-team-size">
                {stats?.teamSize || 0}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="w-full md:w-auto mb-6">
              <TabsTrigger value="sales" className="gap-2" data-testid="tab-sales">
                <ShoppingBag className="h-4 w-4" />
                My Sales
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
                <Users className="h-4 w-4" />
                My Team
              </TabsTrigger>
              <TabsTrigger value="payouts" className="gap-2" data-testid="tab-payouts">
                <Wallet className="h-4 w-4" />
                Payouts
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Direct Sales (Tier 1)
                  </CardTitle>
                  <CardDescription>
                    You earn {stats?.commissionRate || 20}% commission on each sale you generate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {salesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : sales && sales.length > 0 ? (
                    <div className="space-y-4">
                      {sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                          data-testid={`sale-${sale.id}`}
                        >
                          <div>
                            <p className="font-medium">Order #{sale.orderId.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#E7FB10]">
                              +${parseFloat(sale.commissionTier1).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Order: ${parseFloat(sale.orderTotal).toFixed(2)}
                            </p>
                          </div>
                          <Badge
                            variant={sale.tier1Status === "processed" ? "default" : "secondary"}
                          >
                            {sale.tier1Status === "processed" ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> Pending</>
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sales yet. Share your referral link to start earning!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Team (Tier 2)
                  </CardTitle>
                  <CardDescription>
                    You earn 10% of the commissions your team members generate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teamLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : team && team.length > 0 ? (
                    <div className="space-y-4">
                      {team.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                          data-testid={`team-member-${member.id}`}
                        >
                          <div>
                            <p className="font-medium">{member.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(member.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{member.salesCount}</p>
                            <p className="text-xs text-muted-foreground">Sales</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#21d8ff]">
                              +${member.tier2EarningsFromMember.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Your Override</p>
                          </div>
                          <Badge variant={member.isActive ? "default" : "secondary"}>
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members yet. Recruit affiliates using your link!</p>
                      <p className="text-sm mt-2">
                        Share: {window.location.origin}/affiliate?ref={stats?.referralCode}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Payout History
                    </CardTitle>
                    <CardDescription>
                      Minimum payout: $50 | Your balance: ${stats?.pendingBalance?.toFixed(2) || "0.00"}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => requestPayoutMutation.mutate()}
                    disabled={
                      requestPayoutMutation.isPending ||
                      (stats?.pendingBalance || 0) < 50
                    }
                    className="bg-[#E7FB10] hover:bg-[#E7FB10]/90"
                    data-testid="button-request-payout"
                  >
                    {requestPayoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Request Payout"
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  {payoutsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : payouts && payouts.length > 0 ? (
                    <div className="space-y-4">
                      {payouts.map((payout) => (
                        <div
                          key={payout.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                          data-testid={`payout-${payout.id}`}
                        >
                          <div>
                            <p className="font-medium">${parseFloat(payout.amount).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {payout.payoutMethod} - {payout.payoutEmail}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Requested: {new Date(payout.createdAt).toLocaleDateString()}
                            </p>
                            {payout.processedAt && (
                              <p className="text-sm text-muted-foreground">
                                Processed: {new Date(payout.processedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={payout.status === "processed" ? "default" : payout.status === "rejected" ? "destructive" : "secondary"}
                          >
                            {payout.status === "processed" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {payout.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No payouts yet. Build up your balance to $50 to request a payout.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Payout Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how you want to receive your commission payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="payoutMethod">Payout Method</Label>
                    <Select
                      value={payoutMethod || affiliate.payoutMethod || "paypal"}
                      onValueChange={setPayoutMethod}
                    >
                      <SelectTrigger id="payoutMethod" data-testid="select-payout-method">
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="venmo">Venmo</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payoutEmail">Payout Email/Username</Label>
                    <Input
                      id="payoutEmail"
                      placeholder="your@email.com or @username"
                      value={payoutEmail || affiliate.payoutEmail || ""}
                      onChange={(e) => setPayoutEmail(e.target.value)}
                      data-testid="input-payout-email"
                    />
                  </div>

                  <Button
                    onClick={() =>
                      updateSettingsMutation.mutate({
                        payoutMethod: payoutMethod || affiliate.payoutMethod || "paypal",
                        payoutEmail: payoutEmail || affiliate.payoutEmail || "",
                      })
                    }
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
