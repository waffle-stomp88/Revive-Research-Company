import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  Archive,
  FileCheck,
  Calendar,
  ExternalLink,
  Shield,
  Info,
  ArrowRight,
  Search,
  ChevronRight,
} from "lucide-react";
import type { Coa } from "@shared/schema";

export default function BatchArchive() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-json-ld-batch-archive";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Education Center",
          "item": "https://reviveresearch.co/guides/peptide-education-center"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Quality & Trust",
          "item": "https://reviveresearch.co/guides/peptide-education-center?tab=trust"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Batch Testing Archive",
          "item": "https://reviveresearch.co/coa/batch-testing-archive"
        }
      ]
    });
    document.getElementById("breadcrumb-json-ld-batch-archive")?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById("breadcrumb-json-ld-batch-archive")?.remove();
    };
  }, []);
  const { data: coas = [], isLoading } = useQuery<Coa[]>({
    queryKey: ["/api/coas"],
  });

  const archivedBatches = coas.filter(coa => {
    const testDate = new Date(coa.testDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return testDate < sixMonthsAgo;
  });

  const activeBatches = coas.filter(coa => {
    const testDate = new Date(coa.testDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return testDate >= sixMonthsAgo;
  });

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Batch Archive" description="Historical batch records and testing data. Full transparency on all research compounds we've produced." canonicalPath="/coa/batch-testing-archive" />
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6" data-testid="nav-breadcrumb">
          <ol className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
            <li>
              <Link href="/guides/peptide-education-center" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-education">
                Education Center
              </Link>
            </li>
            <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
            <li>
              <Link
                href="/guides/peptide-education-center?tab=trust"
                className="hover:text-foreground transition-colors font-medium"
                style={{ color: "#21d8ff" }}
                data-testid="link-breadcrumb-trust"
              >
                Quality &amp; Trust
              </Link>
            </li>
            <li><ChevronRight className="h-3 w-3 flex-shrink-0" /></li>
            <li className="text-foreground font-medium" data-testid="text-breadcrumb-current">Batch Testing Archive</li>
          </ol>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#9d4edd]/20 text-[#9d4edd] border-[#9d4edd]/30">
            Historical Records
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-archive-title">
            Batch Archive
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete historical record of all batches, including retired lots. 
            We maintain this archive for traceability and research continuity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-[#21d8ff] flex-shrink-0" />
              <div>
                <h2 className="font-display text-xl font-bold mb-2">Why We Keep Historical Records</h2>
                <p className="text-muted-foreground">
                  Complete batch traceability is essential for serious research. If you need to 
                  reference a past purchase, verify historical testing, or ensure consistency 
                  across research phases, our archive provides that continuity.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-[#E7FB10]/20">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-[#E7FB10] mb-1">
                {coas.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Batches</div>
            </div>
          </Card>
          <Card className="p-6 border-green-500/20">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-green-500 mb-1">
                {activeBatches.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Batches</div>
            </div>
          </Card>
          <Card className="p-6 border-[#9d4edd]/20">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-[#9d4edd] mb-1">
                {archivedBatches.length}
              </div>
              <div className="text-sm text-muted-foreground">Archived Batches</div>
            </div>
          </Card>
        </div>

        <Separator className="my-8" />

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {activeBatches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  Current Batches
                  <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeBatches.map((coa) => (
                    <Card 
                      key={coa.id} 
                      className="p-4 border-green-500/20 hover:border-green-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold">{coa.productName}</h3>
                          <p className="text-sm font-mono text-muted-foreground">{coa.batchNumber}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          {coa.purity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(coa.testDate).toLocaleDateString()}
                        </div>
                        {coa.imageUrl && (
                          <a 
                            href={coa.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-500 hover:underline"
                          >
                            View COA <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {archivedBatches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Archive className="h-5 w-5 text-[#9d4edd]" />
                  Archived Batches
                  <Badge variant="outline" className="text-[#9d4edd] border-[#9d4edd]/30">Historical</Badge>
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archivedBatches.map((coa) => (
                    <Card 
                      key={coa.id} 
                      className="p-4 border-[#9d4edd]/20 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold">{coa.productName}</h3>
                          <p className="text-sm font-mono text-muted-foreground">{coa.batchNumber}</p>
                        </div>
                        <Badge variant="outline" className="text-[#9d4edd] border-[#9d4edd]/30">
                          {coa.purity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(coa.testDate).toLocaleDateString()}
                        </div>
                        {coa.imageUrl && (
                          <a 
                            href={coa.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[#9d4edd] hover:underline"
                          >
                            View COA <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {coas.length === 0 && (
              <Card className="p-12 text-center border-dashed">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">No Batch Records Yet</h3>
                <p className="text-muted-foreground">
                  Batch records will appear here as products are tested and documented.
                </p>
              </Card>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <Link href="/coa-library">
            <Card className="p-6 border-[#21d8ff]/20 hover:border-[#21d8ff]/40 transition-colors cursor-pointer group" data-testid="link-search-coa">
              <div className="flex items-start gap-4">
                <Search className="h-8 w-8 text-[#21d8ff]" />
                <div>
                  <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#21d8ff] transition-colors">
                    Search COA Library
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Look up specific batches by number or product name in our searchable library.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/batch">
            <Card className="p-6 border-[#E7FB10]/20 hover:border-[#E7FB10]/40 transition-colors cursor-pointer group" data-testid="link-verify-batch">
              <div className="flex items-start gap-4">
                <FileCheck className="h-8 w-8 text-[#E7FB10]" />
                <div>
                  <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#E7FB10] transition-colors">
                    Verify a Batch
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a batch number to instantly verify analysis and view its COA.
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
