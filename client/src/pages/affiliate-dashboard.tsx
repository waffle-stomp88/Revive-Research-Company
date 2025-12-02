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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
  Trophy,
  Medal,
  Crown,
  Flame,
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
  basicReferralCode: string | null;
  payoutMethod: string;
  payoutEmail: string;
  venmoUsername: string | null;
  zelleEmail: string | null;
  pendingBalance: string;
}

interface EarningsDataPoint {
  weekStart: string;
  weekEnd: string;
  tier1: number;
  tier2: number;
  total: number;
}

interface LeaderboardEntry {
  rank: number;
  affiliateId: string;
  displayName: string;
  salesCount: number;
  totalRevenue: number;
  tier1Earnings: number;
  tier2Earnings: number;
}

export default function AffiliateDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [venmoUsername, setVenmoUsername] = useState("");
  const [zelleEmail, setZelleEmail] = useState("");
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"weekly" | "monthly">("monthly");

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

  useEffect(() => {
    if (affiliate) {
      setFullName(affiliate.fullName || "");
      setEmail(affiliate.email || "");
      setPayoutEmail(affiliate.payoutEmail || "");
      setVenmoUsername(affiliate.venmoUsername || "");
      setZelleEmail(affiliate.zelleEmail || "");
      setPayoutMethod(affiliate.payoutMethod || "paypal");
    }
  }, [affiliate]);

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

  const { data: earningsChart, isLoading: earningsChartLoading } = useQuery<EarningsDataPoint[]>({
    queryKey: ["/api/affiliate/earnings-chart", "12"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/earnings-chart?weeks=12", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch earnings chart");
      return res.json();
    },
    enabled: !!affiliate,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/affiliate/leaderboard", leaderboardPeriod],
    queryFn: async () => {
      const res = await fetch(`/api/affiliate/leaderboard?period=${leaderboardPeriod}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { 
      fullName?: string;
      email?: string;
      payoutMethod: string; 
      payoutEmail?: string;
      venmoUsername?: string;
      zelleEmail?: string;
    }) => {
      const response = await apiRequest("PATCH", "/api/affiliate/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/me"] });
      toast({
        title: "Settings Updated",
        description: "Your profile and payout settings have been saved.",
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
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold" data-testid="text-dashboard-title">
              WELCOME, {affiliate.fullName?.split(' ')[0]?.toUpperCase() || 'AFFILIATE'}
            </h1>
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
          </div>
          <p className="text-muted-foreground">
            {affiliate.email}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Referral Code - 10% */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#E7FB10] text-sm font-semibold">BASIC REFERRAL CODE</span>
                    <span className="text-xs bg-[#E7FB10]/20 text-[#E7FB10] px-2 py-0.5 rounded">10% OFF</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Share this code for customer referrals - they save 10%, you earn 10%</p>
                  <code className="text-lg bg-muted px-3 py-2 rounded font-mono block mb-3 text-center font-bold" data-testid="text-basic-referral-code">
                    {affiliate?.basicReferralCode || `${affiliate?.fullName?.split(' ')[0]?.toUpperCase() || 'CODE'}10`}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 h-8"
                    onClick={() => {
                      const code = affiliate?.basicReferralCode || `${affiliate?.fullName?.split(' ')[0]?.toUpperCase() || 'CODE'}10`;
                      navigator.clipboard.writeText(code);
                      toast({
                        title: "Code Copied",
                        description: "Your basic referral code has been copied to clipboard.",
                      });
                    }}
                    data-testid="button-copy-basic-code"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Code
                  </Button>
                </div>

                {/* Personal Code - 20% */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#21d8ff] text-sm font-semibold">PERSONAL CODE</span>
                    <span className="text-xs bg-[#21d8ff]/20 text-[#21d8ff] px-2 py-0.5 rounded">20% OFF</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Your exclusive personal-use discount for your own orders</p>
                  <code className="text-lg bg-muted px-3 py-2 rounded font-mono block mb-3 text-center font-bold" data-testid="text-personal-code">
                    {affiliate?.referralCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 h-8"
                    onClick={() => {
                      if (affiliate?.referralCode) {
                        navigator.clipboard.writeText(affiliate.referralCode);
                        toast({
                          title: "Code Copied",
                          description: "Your personal code has been copied to clipboard.",
                        });
                      }
                    }}
                    data-testid="button-copy-personal-code"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Code
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
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="w-full md:w-auto mb-6 flex-wrap">
              <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
                <Trophy className="h-4 w-4" />
                Analytics
              </TabsTrigger>
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

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Earnings Chart - Takes 2/3 width on large screens */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#E7FB10]" />
                      Earnings Over Time
                    </CardTitle>
                    <CardDescription>
                      Track your Tier 1 and Tier 2 earnings over the past 12 weeks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {earningsChartLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : earningsChart && earningsChart.length > 0 ? (
                      <div className="h-[400px]" data-testid="chart-earnings">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={earningsChart}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="tier1Gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E7FB10" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#E7FB10" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="tier2Gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#21d8ff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#21d8ff" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                              dataKey="weekEnd"
                              tick={{ fill: '#888', fontSize: 12 }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                              }}
                            />
                            <YAxis
                              tick={{ fill: '#888', fontSize: 12 }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1a1a1f',
                                border: '1px solid #333',
                                borderRadius: '8px',
                              }}
                              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                              labelFormatter={(label) => {
                                const date = new Date(label);
                                return `Week ending ${date.toLocaleDateString()}`;
                              }}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="tier1"
                              name="Tier 1 (Direct)"
                              stroke="#E7FB10"
                              strokeWidth={2}
                              fill="url(#tier1Gradient)"
                            />
                            <Area
                              type="monotone"
                              dataKey="tier2"
                              name="Tier 2 (Team)"
                              stroke="#21d8ff"
                              strokeWidth={2}
                              fill="url(#tier2Gradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No earnings data yet. Start making sales to see your progress!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Leaderboard - Takes 1/3 width on large screens */}
                <Card className="border-[#9d4edd]/30">
                  <CardHeader className="pb-3">
                    <div className="space-y-3">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#E7FB10]" />
                        Leaderboard
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant={leaderboardPeriod === "weekly" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLeaderboardPeriod("weekly")}
                          className="flex-1"
                          data-testid="button-leaderboard-weekly"
                        >
                          Weekly
                        </Button>
                        <Button
                          variant={leaderboardPeriod === "monthly" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLeaderboardPeriod("monthly")}
                          className="flex-1"
                          data-testid="button-leaderboard-monthly"
                        >
                          Monthly
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {leaderboardLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : leaderboard && leaderboard.length > 0 ? (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1" data-testid="leaderboard-list">
                        {leaderboard.map((entry) => {
                          const isCurrentUser = entry.affiliateId === affiliate?.id;
                          const totalEarnings = entry.tier1Earnings + entry.tier2Earnings;
                          
                          return (
                            <div
                              key={entry.affiliateId}
                              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                isCurrentUser
                                  ? "bg-[#E7FB10]/10 border border-[#E7FB10]/30"
                                  : "bg-muted/50"
                              }`}
                              data-testid={`leaderboard-entry-${entry.rank}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted shrink-0">
                                  {entry.rank === 1 ? (
                                    <Crown className="h-4 w-4 text-[#E7FB10]" />
                                  ) : entry.rank === 2 ? (
                                    <Medal className="h-4 w-4 text-gray-400" />
                                  ) : entry.rank === 3 ? (
                                    <Medal className="h-4 w-4 text-amber-700" />
                                  ) : entry.rank <= 10 ? (
                                    <Flame className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <span className="text-sm font-bold text-muted-foreground">
                                      {entry.rank}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate flex items-center gap-1">
                                    {entry.displayName}
                                    {isCurrentUser && (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">You</Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {entry.salesCount} sales
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-semibold text-sm text-[#E7FB10]">
                                  ${totalEarnings.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Show user's rank if not in top 50 */}
                        {affiliate && !leaderboard.find(e => e.affiliateId === affiliate.id) && (
                          <div className="pt-3 border-t border-muted mt-2">
                            <p className="text-center text-xs text-muted-foreground mb-2">Your Position</p>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#E7FB10]/10 border border-[#E7FB10]/30">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                                  <span className="text-sm font-bold text-muted-foreground">-</span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {affiliate.fullName.split(' ')[0]} {affiliate.fullName.split(' ').pop()?.[0]}.
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    No sales yet
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No leaderboard data yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Direct Sales (Tier 1)
                  </CardTitle>
                  <CardDescription>
                    You earn {stats?.commissionRate || 10}% commission on each sale you generate
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
                      <p>No team members yet.</p>
                      <p className="text-sm mt-2">
                        Referred affiliates who join will appear here.
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
                    Profile & Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your profile information and payment preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="font-semibold mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          data-testid="input-profile-fullname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profileEmail">Email Address</Label>
                        <Input
                          id="profileEmail"
                          type="email"
                          placeholder="your-email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          data-testid="input-profile-email"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Payout Settings</h3>
                    <div className="space-y-6">
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
                        <SelectItem value="zelle">Zelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(payoutMethod || affiliate.payoutMethod || "paypal") === "paypal" && (
                    <div className="space-y-2">
                      <Label htmlFor="payoutEmail">PayPal Email</Label>
                      <Input
                        id="payoutEmail"
                        type="email"
                        placeholder="your-paypal@email.com"
                        value={payoutEmail || affiliate.payoutEmail || ""}
                        onChange={(e) => setPayoutEmail(e.target.value)}
                        data-testid="input-payout-email"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the email address associated with your PayPal account
                      </p>
                    </div>
                  )}

                  {(payoutMethod || affiliate.payoutMethod) === "venmo" && (
                    <div className="space-y-2">
                      <Label htmlFor="venmoUsername">Venmo Username</Label>
                      <Input
                        id="venmoUsername"
                        placeholder="@YourVenmoUsername"
                        value={venmoUsername || affiliate.venmoUsername || ""}
                        onChange={(e) => setVenmoUsername(e.target.value)}
                        data-testid="input-venmo-username"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your Venmo username (include the @ symbol)
                      </p>
                    </div>
                  )}

                  {(payoutMethod || affiliate.payoutMethod) === "zelle" && (
                    <div className="space-y-2">
                      <Label htmlFor="zelleEmail">Zelle Email</Label>
                      <Input
                        id="zelleEmail"
                        type="email"
                        placeholder="your-email@example.com"
                        value={zelleEmail || affiliate.zelleEmail || ""}
                        onChange={(e) => setZelleEmail(e.target.value)}
                        data-testid="input-zelle-email"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the email address associated with your Zelle account
                      </p>
                    </div>
                  )}

                    <Button
                      onClick={() => {
                        const selectedMethod = payoutMethod || "paypal";
                        const data: {
                          fullName?: string;
                          email?: string;
                          payoutMethod: string;
                          payoutEmail?: string;
                          venmoUsername?: string;
                          zelleEmail?: string;
                        } = { 
                          fullName,
                          email,
                          payoutMethod: selectedMethod 
                        };
                        
                        if (selectedMethod === "paypal") {
                          data.payoutEmail = payoutEmail;
                        } else if (selectedMethod === "venmo") {
                          data.venmoUsername = venmoUsername;
                        } else if (selectedMethod === "zelle") {
                          data.zelleEmail = zelleEmail;
                        }
                        
                        updateSettingsMutation.mutate(data);
                      }}
                      disabled={updateSettingsMutation.isPending}
                      data-testid="button-save-settings"
                    >
                      {updateSettingsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Save Settings
                    </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
