import { lazy, Suspense, useMemo } from "react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  GraduationCap,
  FileCheck,
  History,
  Trophy,
  CheckCircle,
  Zap,
  RefreshCw,
  Target,
  Crown,
  Boxes,
  Sparkles,
  Shield,
  ChevronRight,
  Brain,
  HelpCircle,
} from "lucide-react";
import type { Order, Product, ResearchPhase, ResearchTitle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

export function DashboardAcademy() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: researchProfile, isLoading: researchProfileLoading } = useQuery<{
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

  const { data: batchHistory } = useQuery<Array<{
    id: string;
    batchNumber: string;
    productName: string | null;
    verifiedAt: string;
  }>>({
    queryKey: ["/api/batch-verification-history"],
    enabled: isAuthenticated,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders/my-orders"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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

  return (
    <>
      <SEOHead title="Research Academy" description="Your research progress, badges, and learning journey." canonicalPath="/dashboard/academy" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" data-testid="button-back-to-dashboard">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
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
              {/* Batch Verification History */}
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

              {/* Research Badges */}
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
                    {badges.slice(0, 5).map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <div
                          key={badge.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${badge.earned ? "" : "opacity-50"}`}
                          style={badge.earned ? { borderColor: `${badge.color}66`, backgroundColor: `${badge.color}15` } : undefined}
                          data-testid={`badge-education-${badge.id}`}
                        >
                          <div
                            className="p-2 rounded-full"
                            style={badge.earned ? { backgroundColor: `${badge.color}25` } : { backgroundColor: "hsl(var(--muted)/0.3)" }}
                          >
                            <Icon className="h-5 w-5" style={{ color: badge.earned ? badge.color : "hsl(var(--muted-foreground))" }} />
                          </div>
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
                              {badge.earned ? "Unlocked!" : badge.progress !== undefined && badge.target ? `${badge.progress}/${badge.target}` : badge.description}
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

            {/* Research Knowledge Quiz */}
            <Card className="relative overflow-hidden border-[#f97316]/30 bg-gradient-to-r from-[#f97316]/10 via-[#f97316]/5 to-transparent">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f97316]/20 rounded-full blur-3xl" />
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#f97316]/30 to-[#D4FF1F]/20 shadow-lg">
                    <Brain className="h-7 w-7 text-[#f97316]" />
                  </div>
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
          </div>
        </div>
      </main>
    </>
  );
}

export default DashboardAcademy;
