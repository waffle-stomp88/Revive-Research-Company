import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Activity, FlaskConical, Calendar, RefreshCw, ShoppingBag } from "lucide-react";
import type { Product, Order } from "@shared/schema";

// Rolling window used for all stats on this page — mirrors the recap card gate logic.
const ROLLING_DAYS = 30;

export default function DashboardSummary() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: logbookEntries, isLoading: logbookLoading } = useQuery<{
    id: string;
    productId: string | null;
    tags: string[] | null;
    createdAt: string;
    administeredAt: string | null;
  }[]>({
    queryKey: ["/api/logbook"],
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders/my-orders"],
    enabled: isAuthenticated,
  });

  const { data: cyclesData } = useQuery<{ cycles: { status: string }[]; totalLogbookEntries: number }>({
    queryKey: ["/api/cycles"],
    enabled: isAuthenticated,
  });

  // Rolling-30-day windowed entries + all 4 recap stats
  const { windowedEntries, compoundRows, activeCycles, windowedOrderCount } = useMemo(() => {
    const cutoff = new Date(Date.now() - ROLLING_DAYS * 24 * 60 * 60 * 1000);

    const windowed = (logbookEntries ?? []).filter((e) => {
      const ts = e.administeredAt ?? e.createdAt;
      return new Date(ts) >= cutoff;
    });

    // Group by compound — use productId or compound: tag as the key
    const byCompound = new Map<
      string,
      { key: string; name: string; entryCount: number; lastLogDate: string }
    >();

    for (const e of windowed) {
      let key: string;
      let displayName: string;

      if (e.productId) {
        key = e.productId;
        const product = products?.find((p) => p.id === e.productId);
        displayName = product?.name ?? "Unknown compound"; // COMPLIANCE PENDING
      } else {
        const compoundTag = (e.tags ?? []).find((t) => t.startsWith("compound:"));
        if (compoundTag) {
          key = compoundTag;
          displayName = compoundTag.replace(/^compound:/, "");
        } else {
          key = `entry:${e.id}`;
          displayName = "Unidentified compound"; // COMPLIANCE PENDING
        }
      }

      const ts = e.administeredAt ?? e.createdAt;
      const existing = byCompound.get(key);
      if (!existing) {
        byCompound.set(key, { key, name: displayName, entryCount: 1, lastLogDate: ts });
      } else {
        existing.entryCount += 1;
        if (new Date(ts) > new Date(existing.lastLogDate)) {
          existing.lastLogDate = ts;
        }
      }
    }

    // Sort by most recent log date descending
    const rows = Array.from(byCompound.values()).sort(
      (a, b) => new Date(b.lastLogDate).getTime() - new Date(a.lastLogDate).getTime(),
    );

    // Active research cycles (not windowed — cycles have their own state)
    const active = cyclesData?.cycles?.filter((c) => c.status === "active").length ?? 0;

    // Orders placed in rolling window
    const ordersInWindow = (orders ?? []).filter(
      (o) => o.createdAt && new Date(o.createdAt) >= cutoff,
    ).length;

    return {
      windowedEntries: windowed,
      compoundRows: rows,
      activeCycles: active,
      windowedOrderCount: ordersInWindow,
    };
  }, [logbookEntries, products, cyclesData, orders]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (authLoading || logbookLoading) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Recent Activity — Research Summary"
        description="A summary of your research activity over the last 30 days."
        canonicalPath="/dashboard/summary"
      />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative overflow-hidden">
        {/* Ambient background — matches dashboard */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#21d8ff]/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#21d8ff]/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          {/* Back link */}
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 -ml-1 text-muted-foreground"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to dashboard{/* COMPLIANCE PENDING */}
            </Button>
          </Link>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-['Bebas_Neue'] text-3xl md:text-4xl tracking-wide text-white leading-none mb-1">
              Recent Activity{/* COMPLIANCE PENDING */}
            </h1>
            <p className="text-sm text-muted-foreground">
              Studies you've tracked in the last {ROLLING_DAYS} days{/* COMPLIANCE PENDING */}
            </p>
          </div>

          {/* Summary stats strip — all 4 recap data points */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card
              className="border-[#21d8ff]/20 bg-white/[0.03]"
              data-testid="stat-summary-compounds"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#21d8ff]/10 border border-[#21d8ff]/20 shrink-0">
                  <FlaskConical className="h-4 w-4 text-[#21d8ff]" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">{compoundRows.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {compoundRows.length === 1
                      ? "compound tracked" // COMPLIANCE PENDING
                      : "compounds tracked"}{/* COMPLIANCE PENDING */}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="border-white/10 bg-white/[0.03]"
              data-testid="stat-summary-entries"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/8 border border-white/10 shrink-0">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">{windowedEntries.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {windowedEntries.length === 1
                      ? "observation logged" // COMPLIANCE PENDING
                      : "observations logged"}{/* COMPLIANCE PENDING */}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="border-white/10 bg-white/[0.03]"
              data-testid="stat-summary-cycles"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#D4FF1F]/10 border border-[#D4FF1F]/20 shrink-0">
                  <RefreshCw className="h-4 w-4 text-[#D4FF1F]" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">{activeCycles}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeCycles === 1
                      ? "active cycle" // COMPLIANCE PENDING
                      : "active cycles"}{/* COMPLIANCE PENDING */}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="border-white/10 bg-white/[0.03]"
              data-testid="stat-summary-orders"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/8 border border-white/10 shrink-0">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">{windowedOrderCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {windowedOrderCount === 1
                      ? "order placed" // COMPLIANCE PENDING
                      : "orders placed"}{/* COMPLIANCE PENDING */}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compound rows */}
          <Card
            className="border-[#21d8ff]/20 bg-white/[0.03]"
            data-testid="card-summary-compound-list"
          >
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Compounds studied{/* COMPLIANCE PENDING */}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-0">
              {compoundRows.length === 0 ? (
                <div className="py-8 text-center" data-testid="text-summary-no-compounds">
                  <p className="text-sm text-muted-foreground">
                    No studies tracked in the last {ROLLING_DAYS} days.{/* COMPLIANCE PENDING */}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add logbook entries to see your activity here.{/* COMPLIANCE PENDING */}
                  </p>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-white/20"
                      data-testid="button-summary-go-to-logbook"
                    >
                      Go to Logbook{/* COMPLIANCE PENDING */}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/8">
                  {compoundRows.map((row, i) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between py-3 gap-4"
                      data-testid={`row-compound-${i}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium text-white truncate"
                          data-testid={`text-compound-name-${i}`}
                        >
                          {row.name}{/* COMPLIANCE PENDING */}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-xs text-muted-foreground"
                            data-testid={`text-compound-entries-${i}`}
                          >
                            {row.entryCount} {row.entryCount === 1 ? "entry" : "entries"}{/* COMPLIANCE PENDING */}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                            data-testid={`text-compound-last-log-${i}`}
                          >
                            <Calendar className="h-3 w-3" />
                            {formatDate(row.lastLogDate)}{/* COMPLIANCE PENDING */}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground/60 text-center mt-6 leading-relaxed">
            This summary reflects studies you've personally tracked.
            It is a personal record only — not a medical log, not a clinical assessment.{/* COMPLIANCE PENDING */}
          </p>
        </div>
      </main>
    </>
  );
}
