import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
  PieChart,
  Pie,
  Cell,
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
  Star,
  Zap,
  Target,
  Award,
  Sparkles,
  Calendar,
  Share2,
  MessageCircle,
  Link2,
  ArrowUp,
  Timer,
  PieChart as PieChartIcon,
  ChevronDown,
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

interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

const BADGE_COLORS = {
  yellow: "#E7FB10",
  cyan: "#21d8ff",
  purple: "#9d4edd",
  orange: "#f97316",
  pink: "#ec4899",
} as const;

const getBadgeStyles = (color: string, earned: boolean) => {
  if (!earned) return undefined;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return {
    background: `linear-gradient(135deg, rgba(${r},${g},${b},0.15) 0%, transparent 100%)`,
    borderColor: color,
    borderWidth: '1px',
    borderStyle: 'solid' as const,
    boxShadow: `0 0 20px rgba(${r},${g},${b},0.5), 0 0 40px rgba(${r},${g},${b},0.2)`,
  };
};

function AchievementBadges({ stats, team, sales }: { stats?: AffiliateStats; team?: TeamMember[]; sales?: AffiliateSale[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const badges: AchievementBadge[] = useMemo(() => {
    const salesCount = stats?.directSalesCount || 0;
    const teamSize = stats?.teamSize || 0;
    const totalEarnings = (stats?.tier1Earnings || 0) + (stats?.tier2Earnings || 0);
    
    const salesDates = sales?.map(s => new Date(s.createdAt).toISOString().split('T')[0]) || [];
    const uniqueMonths = new Set(sales?.map(s => {
      const d = new Date(s.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })).size;

    return [
      {
        id: "first-sale",
        title: "First Blood",
        description: "Made your first sale",
        icon: Zap,
        color: "#E7FB10",
        earned: salesCount >= 1,
        progress: Math.min(salesCount, 1),
        target: 1,
      },
      {
        id: "century",
        title: "Century Club",
        description: "Reach 100 total sales",
        icon: Trophy,
        color: "#E7FB10",
        earned: salesCount >= 100,
        progress: Math.min(salesCount, 100),
        target: 100,
      },
      {
        id: "team-builder",
        title: "Team Builder",
        description: "Build a team of 5+ affiliates",
        icon: Users,
        color: "#21d8ff",
        earned: teamSize >= 5,
        progress: Math.min(teamSize, 5),
        target: 5,
      },
      {
        id: "top-earner",
        title: "High Roller",
        description: "Earn $1,000+ in commissions",
        icon: Crown,
        color: "#9d4edd",
        earned: totalEarnings >= 1000,
        progress: Math.min(totalEarnings, 1000),
        target: 1000,
      },
      {
        id: "consistency",
        title: "Consistent Performer",
        description: "Make sales 3 months in a row",
        icon: Flame,
        color: "#f97316",
        earned: uniqueMonths >= 3,
        progress: Math.min(uniqueMonths, 3),
        target: 3,
      },
      {
        id: "rising-star",
        title: "Rising Star",
        description: "Reach 10 sales",
        icon: Star,
        color: "#ec4899",
        earned: salesCount >= 10,
        progress: Math.min(salesCount, 10),
        target: 10,
      },
    ];
  }, [stats, team, sales]);

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <Card className="border-[#E7FB10]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1"
            data-testid="button-achievements-toggle"
          >
            <Award className="h-5 w-5 text-[#E7FB10]" />
            Achievements
            <ChevronDown 
              className="h-4 w-4 transition-transform"
              style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
            />
          </button>
          <Badge variant="secondary" className="bg-[#E7FB10]/10 text-[#E7FB10] border border-[#E7FB10]/30 text-xs">
            {earnedCount}/{badges.length} Unlocked
          </Badge>
        </CardTitle>
      </CardHeader>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  const badgeStyles = getBadgeStyles(badge.color, badge.earned);
                  const r = parseInt(badge.color.slice(1, 3), 16);
                  const g = parseInt(badge.color.slice(3, 5), 16);
                  const b = parseInt(badge.color.slice(5, 7), 16);
                  
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative p-3 rounded-lg transition-all"
                      style={badge.earned ? badgeStyles : {
                        background: `linear-gradient(135deg, rgba(${r},${g},${b},0.05) 0%, transparent 100%)`,
                        borderColor: `rgba(${r},${g},${b},0.2)`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                      }}
                      data-testid={`badge-${badge.id}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={badge.earned ? { rotate: 360 } : { y: [0, -4, 0] }}
                          transition={badge.earned ? { duration: 4, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
                          className="p-1.5 rounded-lg"
                          style={{ 
                            backgroundColor: badge.earned ? `rgba(${r},${g},${b},0.2)` : `rgba(${r},${g},${b},0.1)`,
                            color: badge.earned ? badge.color : `rgba(${r},${g},${b},0.5)`
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </motion.div>
                        {badge.earned && (
                          <Sparkles className="h-3 w-3 animate-pulse" style={{ color: badge.color }} />
                        )}
                      </div>
                      <span 
                        className="text-sm font-bold block"
                        style={{ 
                          color: badge.color,
                          textShadow: badge.earned ? `0 0 8px rgba(${r},${g},${b},0.5)` : 'none'
                        }}
                      >
                        {badge.title}
                      </span>
                      <span className="text-xs mt-1 block" style={{ color: badge.earned ? `rgba(${r},${g},${b},0.8)` : `rgba(${r},${g},${b},0.5)` }}>{badge.description}</span>
                      {!badge.earned && badge.progress !== undefined && badge.target && (
                        <div className="mt-2">
                          <Progress 
                            value={(badge.progress / badge.target) * 100} 
                            className="h-1"
                            style={{ ['--progress-background' as string]: `rgba(${r},${g},${b},0.3)` }}
                          />
                          <span className="text-[9px] mt-1 block" style={{ color: `rgba(${r},${g},${b},0.6)` }}>
                            {badge.progress}/{badge.target}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function RevenueForecast({ stats, earningsChart }: { stats?: AffiliateStats; earningsChart?: EarningsDataPoint[] }) {
  const forecast = useMemo(() => {
    if (!earningsChart || earningsChart.length < 2) {
      return { currentPace: 0, projected: 0, trend: "neutral" as const };
    }

    const recentWeeks = earningsChart.slice(-4);
    const avgWeekly = recentWeeks.reduce((sum, w) => sum + w.total, 0) / recentWeeks.length;
    
    const now = new Date();
    const daysRemaining = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    const weeksRemaining = daysRemaining / 7;
    
    const currentMonthEarnings = recentWeeks.slice(-2).reduce((sum, w) => sum + w.total, 0);
    const projected = currentMonthEarnings + (avgWeekly * weeksRemaining);
    
    const previousMonth = earningsChart.slice(-8, -4).reduce((sum, w) => sum + w.total, 0);
    const trend = projected > previousMonth * 1.1 ? "up" : projected < previousMonth * 0.9 ? "down" : "neutral";

    return { currentPace: avgWeekly * 4, projected, trend };
  }, [earningsChart]);

  return (
    <Card className="border-[#21d8ff]/20 overflow-visible">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-[#21d8ff]" />
          Revenue Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Projected This Month</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#21d8ff]">
                ${forecast.projected.toFixed(0)}
              </span>
              {forecast.trend === "up" && (
                <span className="flex items-center text-green-500 text-xs">
                  <ArrowUp className="h-3 w-3" /> Trending up
                </span>
              )}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Weekly Average</p>
            <p className="text-lg font-semibold">${(forecast.currentPace / 4).toFixed(2)}/week</p>
          </div>

          <div className="text-xs text-muted-foreground">
            Based on your recent 4-week performance
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralPowerhouse({ affiliate, stats, toast }: { affiliate: Affiliate; stats?: AffiliateStats; toast: any }) {
  const referralLink = `${window.location.origin}/?ref=${stats?.referralCode || affiliate.referralCode}`;
  const basicCode = affiliate?.basicReferralCode || `${affiliate?.fullName?.split(' ')[0]?.toUpperCase() || 'CODE'}10`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const shareTemplates = [
    {
      platform: "Twitter/X",
      icon: MessageCircle,
      text: `Check out Revive Research for premium peptide research compounds! Use my code ${basicCode} for 10% off: ${referralLink}`,
    },
    {
      platform: "Discord",
      icon: MessageCircle,
      text: `Hey researchers! If you need high-purity peptides, check out Revive Research. Code **${basicCode}** = 10% off\n${referralLink}`,
    },
  ];

  return (
    <Card className="border-[#E7FB10]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-[#E7FB10]" />
          Quick Share Hub
        </CardTitle>
        <CardDescription>Share your referral link with one click</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={referralLink} 
            readOnly 
            className="text-xs font-mono bg-muted"
            data-testid="input-referral-link"
          />
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => copyToClipboard(referralLink, "Referral link")}
            data-testid="button-copy-link"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline"
            onClick={() => window.open(referralLink, "_blank")}
            data-testid="button-open-link"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => copyToClipboard(basicCode, "Discount code")}
            data-testid="button-copy-code-only"
          >
            <Link2 className="h-4 w-4" />
            Copy Code Only
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => copyToClipboard(referralLink, "Full link")}
            data-testid="button-copy-full-link"
          >
            <Link2 className="h-4 w-4" />
            Copy Full Link
          </Button>
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold mb-2 text-muted-foreground">SHARE TEMPLATES</p>
          <div className="space-y-2">
            {shareTemplates.map((template) => (
              <div 
                key={template.platform}
                className="p-3 rounded-lg bg-muted/30 hover-elevate cursor-pointer"
                onClick={() => copyToClipboard(template.text, `${template.platform} template`)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{template.platform}</span>
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{template.text}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EarningsCalendarHeatmap({ sales }: { sales?: AffiliateSale[] }) {
  const calendarData = useMemo(() => {
    if (!sales) return [];
    
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const salesByDate: Record<string, number> = {};
    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + parseFloat(sale.commissionTier1);
    });

    const days: { date: Date; earnings: number; dayOfWeek: number }[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: new Date(d),
        earnings: salesByDate[dateStr] || 0,
        dayOfWeek: d.getDay(),
      });
    }
    
    return days;
  }, [sales]);

  const maxEarnings = Math.max(...calendarData.map(d => d.earnings), 1);
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getIntensity = (earnings: number) => {
    if (earnings === 0) return "bg-muted/30";
    const ratio = earnings / maxEarnings;
    if (ratio > 0.75) return "bg-[#E7FB10] shadow-[0_0_8px_rgba(231,251,16,0.6)]";
    if (ratio > 0.5) return "bg-[#E7FB10]/70";
    if (ratio > 0.25) return "bg-[#E7FB10]/40";
    return "bg-[#E7FB10]/20";
  };

  return (
    <Card className="border-[#9d4edd]/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-[#9d4edd]" />
          Earnings Heatmap
        </CardTitle>
        <CardDescription>{monthName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarData.length > 0 && Array(calendarData[0].dayOfWeek).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {calendarData.map((day, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`aspect-square rounded-sm ${getIntensity(day.earnings)} relative group cursor-pointer`}
              data-testid={`calendar-day-${day.date.getDate()}`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-medium opacity-60">
                {day.date.getDate()}
              </div>
              {day.earnings > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border rounded px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  ${day.earnings.toFixed(2)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-[#E7FB10]/20" />
          <div className="w-3 h-3 rounded-sm bg-[#E7FB10]/40" />
          <div className="w-3 h-3 rounded-sm bg-[#E7FB10]/70" />
          <div className="w-3 h-3 rounded-sm bg-[#E7FB10]" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamQuickStats({ team }: { team?: TeamMember[] }) {
  if (!team || team.length === 0) return null;

  const sortedTeam = [...team].sort((a, b) => b.salesTotal - a.salesTotal).slice(0, 5);
  const maxSales = Math.max(...sortedTeam.map(m => m.salesTotal), 1);

  return (
    <Card className="border-[#21d8ff]/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-[#21d8ff]" />
          Top Team Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTeam.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
              data-testid={`team-quick-stat-${member.id}`}
            >
              <div className="w-6 h-6 rounded-full bg-[#21d8ff]/20 flex items-center justify-center text-xs font-bold text-[#21d8ff]">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{member.fullName.split(' ')[0]}</span>
                  <span className="text-xs text-[#21d8ff]">${member.tier2EarningsFromMember.toFixed(0)}</span>
                </div>
                <Progress 
                  value={(member.salesTotal / maxSales) * 100} 
                  className="h-1.5"
                />
              </div>
              {member.salesCount >= 10 && (
                <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PayoutCountdown({ stats, payouts }: { stats?: AffiliateStats; payouts?: AffiliatePayout[] }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0 });
  
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = nextMonth.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdown({ days, hours, mins });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const recentPayouts = payouts?.filter(p => p.status === "processed").slice(0, 3) || [];
  const pendingBalance = stats?.pendingBalance || 0;
  const progressToMinimum = Math.min((pendingBalance / 50) * 100, 100);

  return (
    <Card className="border-[#E7FB10]/20 overflow-visible">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="h-5 w-5 text-[#E7FB10]" />
          Next Payout Window
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-4 mb-4">
          {[
            { value: countdown.days, label: "Days" },
            { value: countdown.hours, label: "Hours" },
            { value: countdown.mins, label: "Mins" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-[#E7FB10] bg-[#E7FB10]/10 rounded-lg w-14 h-14 flex items-center justify-center">
                {item.value}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress to $50 minimum</span>
            <span className="font-medium">${pendingBalance.toFixed(2)}</span>
          </div>
          <Progress value={progressToMinimum} className="h-2" />
          {pendingBalance >= 50 && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Ready for payout!
            </p>
          )}
        </div>

        {recentPayouts.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">RECENT PAYOUTS</p>
            <div className="space-y-1">
              {recentPayouts.map((payout) => (
                <div key={payout.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(payout.processedAt || payout.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-green-500">+${parseFloat(payout.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommissionBreakdown({ stats }: { stats?: AffiliateStats }) {
  const tier1 = stats?.tier1Earnings || 0;
  const tier2 = stats?.tier2Earnings || 0;
  const total = tier1 + tier2;

  const pieData = [
    { name: "Tier 1 (Direct)", value: tier1, color: "#E7FB10" },
    { name: "Tier 2 (Team)", value: tier2, color: "#21d8ff" },
  ];

  const tier1Percent = total > 0 ? (tier1 / total) * 100 : 0;
  const tier2Percent = total > 0 ? (tier2 / total) * 100 : 0;

  return (
    <Card className="border-[#ec4899]/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChartIcon className="h-5 w-5 text-[#ec4899]" />
          Commission Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="flex items-center gap-4">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#E7FB10]" />
                  <span className="text-xs">Direct Sales</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">${tier1.toFixed(0)}</span>
                  <span className="text-xs text-muted-foreground">{tier1Percent.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#21d8ff]" />
                  <span className="text-xs">Team Override</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">${tier2.toFixed(0)}</span>
                  <span className="text-xs text-muted-foreground">{tier2Percent.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <PieChartIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No earnings yet</p>
          </div>
        )}
        
        {tier2 > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20">
            <p className="text-xs text-[#21d8ff]">
              Your team is generating ${tier2.toFixed(2)} in passive income!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/affiliate/delete-account", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your affiliate account has been permanently deleted.",
      });
      setTimeout(() => {
        window.location.href = "/api/logout";
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
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
            <h1 className="font-display text-2xl md:text-3xl font-bold holographic-text" data-testid="text-dashboard-title">
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

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#21d8ff] text-sm font-semibold">PRIVATE CODE</span>
                    <span className="text-xs bg-[#21d8ff]/20 text-[#21d8ff] px-2 py-0.5 rounded">20% OFF</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Your exclusive affiliate discount for your own orders</p>
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
                          description: "Your private affiliate code has been copied to clipboard.",
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
              <div className="space-y-6">
                <AchievementBadges stats={stats} team={team} sales={sales} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <div className="h-[300px]" data-testid="chart-earnings">
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
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1" data-testid="leaderboard-list">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <RevenueForecast stats={stats} earningsChart={earningsChart} />
                  <EarningsCalendarHeatmap sales={sales} />
                  <CommissionBreakdown stats={stats} />
                  <ReferralPowerhouse affiliate={affiliate} stats={stats} toast={toast} />
                </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
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

                <TeamQuickStats team={team} />
              </div>
            </TabsContent>

            <TabsContent value="payouts">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
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

                <PayoutCountdown stats={stats} payouts={payouts} />
              </div>
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
                        className="w-full"
                        data-testid="button-save-settings"
                      >
                        {updateSettingsMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Save Settings
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="border border-red-500/30 rounded-lg p-6 bg-red-500/5">
                    <h3 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Danger Zone
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your affiliate account, there is no going back. This will permanently delete your account, all earnings history, and remove you from the affiliate program.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      data-testid="button-delete-affiliate-account"
                    >
                      Delete Affiliate Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-500">Delete Affiliate Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete your affiliate account? This action cannot be undone. You will lose:
              </DialogDescription>
            </DialogHeader>
            <ul className="text-sm text-muted-foreground space-y-2 my-4">
              <li className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                All pending commission balance (${stats?.pendingBalance?.toFixed(2) || "0.00"})
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Your referral codes and links
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                All earnings history and team connections
              </li>
            </ul>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteAccountMutation.mutate()}
                disabled={deleteAccountMutation.isPending}
                data-testid="button-confirm-delete-affiliate"
              >
                {deleteAccountMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Yes, Delete My Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
