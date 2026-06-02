import { lazy, Suspense } from "react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CyclesTab = lazy(() =>
  import("@/components/cycles/CyclesTab").then((m) => ({ default: m.CyclesTab }))
);

export function DashboardCycles() {
  return (
    <>
      <SEOHead title="Research Cycles" description="Track your research compound cycles." canonicalPath="/dashboard/cycles" />
      <main className="min-h-screen pt-32 md:pt-40 pb-24 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground px-2 h-8" data-testid="button-back-to-dashboard">
                  <ChevronLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <span className="text-muted-foreground/40 select-none">/</span>
              <span className="text-sm font-medium text-foreground" aria-current="page">Cycles</span>
            </nav>
          </div>
          <Suspense fallback={null}>
            <CyclesTab />
          </Suspense>
        </div>
      </main>
    </>
  );
}

export default DashboardCycles;
