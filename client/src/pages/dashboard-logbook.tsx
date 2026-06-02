import { lazy, Suspense } from "react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const LogbookTab = lazy(() =>
  import("@/components/logbook-tab").then((m) => ({ default: m.LogbookTab }))
);

export function DashboardLogbook() {
  return (
    <>
      <SEOHead title="Research Logbook" description="Your private research logbook entries." canonicalPath="/dashboard/logbook" />
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
              <span className="text-sm font-medium text-foreground" aria-current="page">Logbook</span>
            </nav>
          </div>
          <Suspense fallback={null}>
            <LogbookTab />
          </Suspense>
        </div>
      </main>
    </>
  );
}

export default DashboardLogbook;
