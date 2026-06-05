import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";
import {
  Search,
  FileCheck,
  FlaskConical,
  Download,
  ExternalLink,
  Filter,
  BookOpen,
  ChevronRight,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Coa, Product, CoaGlossaryTerm } from "@shared/schema";

interface TestResult {
  compound: string;
  specification: string;
  result: string;
  status: "pass" | "fail";
}

export default function CoaLibrary() {
  const [searchBatch, setSearchBatch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [showGlossary, setShowGlossary] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-json-ld-coa-library";
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
          "name": "COA Library",
          "item": "https://reviveresearch.co/coa-library"
        }
      ]
    });
    document.getElementById("breadcrumb-json-ld-coa-library")?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById("breadcrumb-json-ld-coa-library")?.remove();
    };
  }, []);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: coas = [], isLoading: coasLoading } = useQuery<Coa[]>({
    queryKey: ["/api/coa-library", selectedProduct, searchBatch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProduct && selectedProduct !== "all") {
        params.set("productId", selectedProduct);
      }
      if (searchBatch) {
        params.set("batchNumber", searchBatch);
      }
      const response = await fetch(`/api/coa-library?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch COAs");
      return response.json();
    },
  });

  const { data: glossaryTerms = [] } = useQuery<CoaGlossaryTerm[]>({
    queryKey: ["/api/coa-glossary"],
  });

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const parseResults = (results: string[] | null): TestResult[] => {
    if (!results) return [];
    return results.map((result) => {
      if (result.includes("|")) {
        const parts = result.split("|");
        return {
          compound: parts[0] || "Unknown",
          specification: parts[1] || "N/A",
          result: parts[2] || "N/A",
          status: parts[3] === "pass" ? "pass" : "fail",
        };
      }
      const colonIndex = result.indexOf(":");
      if (colonIndex > 0) {
        const label = result.substring(0, colonIndex).trim();
        const value = result.substring(colonIndex + 1).trim();
        return {
          compound: label,
          specification: "—",
          result: value,
          status: "pass" as const,
        };
      }
      return {
        compound: result,
        specification: "—",
        result: "—",
        status: "pass" as const,
      };
    });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="COA Library" description="Access all COAs for our research compounds. Independent lab verification ensures 98%+ purity on every batch." canonicalPath="/coa-library" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6" data-testid="nav-breadcrumb-coa-library">
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
            <li className="text-foreground font-medium" data-testid="text-breadcrumb-current">COA Library</li>
          </ol>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#9d4edd]/20 mb-6">
            <FileCheck className="h-8 w-8 text-[#9d4edd]" />
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            data-testid="text-coa-library-title"
          >
            COA Library
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Search and browse our complete library of third-party verified Certificates of
            Analysis. Every batch is tested for purity and identity.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Link href="/coa/verify-certificate-of-analysis">
              <Button variant="ghost" className="text-[#9d4edd] p-0 h-auto hover:bg-transparent hover:text-[#9d4edd]/80" data-testid="link-verify-batch">
                Verify a specific batch
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-[#9d4edd]" />
                <h2 className="font-display text-xl font-bold">Filters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Batch Number</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter batch #..."
                      value={searchBatch}
                      onChange={(e) => setSearchBatch(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-batch"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Filter by Product</label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger data-testid="select-product-filter">
                      <SelectValue placeholder="All products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                <Button
                  variant="outline"
                  className="w-full border-[#9d4edd]/30 hover:border-[#9d4edd] hover:bg-[#9d4edd]/10"
                  onClick={() => setShowGlossary(!showGlossary)}
                  data-testid="button-toggle-glossary"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {showGlossary ? "Hide" : "View"} COA Glossary
                </Button>
              </div>
            </Card>

            {showGlossary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="mt-4 p-6 border-[#9d4edd]/20">
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#9d4edd]" />
                    COA Glossary
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {glossaryTerms.length > 0 ? (
                      glossaryTerms.map((term) => (
                        <AccordionItem key={term.id} value={term.id} className="border-b-0">
                          <AccordionTrigger className="text-sm py-2 hover:no-underline hover:text-[#9d4edd]">
                            {term.term}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            {term.definition}
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">HPLC Purity</p>
                          <p className="text-muted-foreground">
                            High-Performance Liquid Chromatography measures the peptide content purity.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Mass Spectrometry (MS)</p>
                          <p className="text-muted-foreground">
                            Confirms molecular identity by measuring the mass-to-charge ratio.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Amino Acid Analysis</p>
                          <p className="text-muted-foreground">
                            Verifies the amino acid composition matches the expected sequence.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Endotoxin Testing</p>
                          <p className="text-muted-foreground">
                            Tests for bacterial endotoxins that could indicate contamination.
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Sterility Testing</p>
                          <p className="text-muted-foreground">
                            Confirms absence of viable microorganisms in the sample.
                          </p>
                        </div>
                      </div>
                    )}
                  </Accordion>
                </Card>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {coasLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 border-border/50">
                    <div className="animate-pulse space-y-4">
                      <div className="flex justify-between">
                        <div className="h-6 bg-muted rounded w-1/3"></div>
                        <div className="h-6 bg-muted rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-32 bg-muted rounded"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : coas.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2">
                <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">No COAs Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchBatch || selectedProduct !== "all"
                    ? "No certificates match your search criteria. Try adjusting your filters."
                    : "No certificates of analysis are currently available."}
                </p>
                {(searchBatch || selectedProduct !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchBatch("");
                      setSelectedProduct("all");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {coas.length} certificate{coas.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {coas.map((coa) => {
                  const results = parseResults(coa.results);
                  const allPassing = results.every((r) => r.status === "pass");

                  return (
                    <Card
                      key={coa.id}
                      className="overflow-hidden border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors"
                      data-testid={`card-coa-${coa.batchNumber}`}
                    >
                      <div className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-display font-bold text-[25px]">
                                {getProductName(coa.productId)}
                                {coa.dosage && <span className="text-muted-foreground ml-2 text-base font-normal">({coa.dosage})</span>}
                              </h3>
                              <Badge
                                className={
                                  allPassing
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                }
                              >
                                {allPassing ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    All Tests Passed
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Review Required
                                  </>
                                )}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FlaskConical className="h-4 w-4" />
                                Batch: {coa.batchNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Tested: {formatDate(coa.testDate)}
                              </span>
                              {coa.labName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  {coa.labName}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {coa.labVerificationUrl && (
                              <a href={coa.labVerificationUrl} target="_blank" rel="noopener noreferrer">
                                <Button
                                  size="sm"
                                  className="bg-[#9d4edd] text-white"
                                  data-testid={`button-verify-lab-${coa.batchNumber}`}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Verify with Lab
                                </Button>
                              </a>
                            )}
                            {coa.imageUrl && (
                              <a
                                href={coa.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#9d4edd]/30 hover:border-[#9d4edd]"
                                  data-testid={`button-download-coa-${coa.batchNumber}`}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  {coa.imageUrl.toLowerCase().endsWith(".pdf") ? "View PDF" : "View Document"}
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-[#9d4edd]/10">
                                <TableHead>Test</TableHead>
                                <TableHead>Specification</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {results.map((result, index) => (
                                <TableRow
                                  key={index}
                                  className="border-[#9d4edd]/10"
                                >
                                  <TableCell className="font-medium">
                                    {result.compound}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {result.specification}
                                  </TableCell>
                                  <TableCell>{result.result}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge
                                      className={
                                        result.status === "pass"
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-red-500/20 text-red-400"
                                      }
                                    >
                                      {result.status === "pass" ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                      ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                      )}
                                      {result.status.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="p-8 border-[#9d4edd]/20 bg-[#9d4edd]/5">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-2xl font-bold mb-4">
                Why Third-Party Testing Matters
              </h2>
              <p className="text-muted-foreground mb-6">
                Every batch of our peptides undergoes rigorous third-party testing at independent,
                ISO-certified laboratories. This ensures unbiased verification of purity, identity,
                and quality that you can trust for your research.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="font-medium">Verified Purity</p>
                    <p className="text-sm text-muted-foreground">
                      HPLC testing confirms 98%+ purity
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="font-medium">Identity Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      Mass spectrometry verifies structure
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#9d4edd]" />
                  </div>
                  <div>
                    <p className="font-medium">Independent Labs</p>
                    <p className="text-sm text-muted-foreground">
                      ISO-certified testing facilities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
