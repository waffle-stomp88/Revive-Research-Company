import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  FlaskConical,
  Calendar,
  Building2,
  Package,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Loader2,
} from "lucide-react";
import type { Batch, Coa, Product } from "@shared/schema";

interface BatchLookupResult {
  batch: Batch;
  coa: Coa | null;
  product: Product | null;
}

interface TestResult {
  compound: string;
  specification: string;
  result: string;
  status: "pass" | "fail";
}

export default function BatchLookup() {
  const [location] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [searchBatch, setSearchBatch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const batchFromUrl = params.get("batch");
    if (batchFromUrl) {
      setSearchInput(batchFromUrl);
      setSearchBatch(batchFromUrl);
    }
  }, [location]);

  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useQuery<BatchLookupResult>({
    queryKey: ["/api/batches/lookup", searchBatch],
    queryFn: async () => {
      if (!searchBatch) throw new Error("No batch number");
      const response = await fetch(`/api/batches/lookup/${encodeURIComponent(searchBatch)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Batch not found");
        }
        throw new Error("Failed to lookup batch");
      }
      return response.json();
    },
    enabled: !!searchBatch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchBatch(searchInput.trim());
  };

  const parseResults = (results: string[] | null): TestResult[] => {
    if (!results) return [];
    return results.map((result) => {
      const parts = result.split("|");
      return {
        compound: parts[0] || "Unknown",
        specification: parts[1] || "N/A",
        result: parts[2] || "N/A",
        status: parts[3] === "pass" ? "pass" : "fail",
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

  const allPassing =
    result?.coa?.results && parseResults(result.coa.results).every((r) => r.status === "pass");

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#9d4edd]/20 mb-6">
            <QrCode className="h-8 w-8 text-[#9d4edd]" />
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            data-testid="text-batch-lookup-title"
          >
            Batch Verification
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scan the QR code on your product or enter the batch number to verify authenticity and
            view the Certificate of Authenticity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-6 border-[#9d4edd]/20">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter batch number (e.g., BPC-2024-001)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12"
                  data-testid="input-batch-number"
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-8 bg-[#9d4edd] hover:bg-[#9d4edd]/90"
                disabled={!searchInput.trim()}
                data-testid="button-search-batch"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify Batch
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {isLoading && (
          <Card className="p-12 text-center border-[#9d4edd]/20">
            <Loader2 className="h-12 w-12 mx-auto text-[#9d4edd] animate-spin mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Verifying Batch...</h3>
            <p className="text-muted-foreground">
              Checking batch number and retrieving certificate data.
            </p>
          </Card>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 border-red-500/30 bg-red-500/5 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">Batch Not Found</h3>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error && error.message === "Batch not found"
                  ? "The batch number you entered was not found in our system. Please check the number and try again."
                  : "An error occurred while verifying this batch. Please try again."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchInput("");
                    setSearchBatch("");
                  }}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
                <Link href="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-8 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Verified Authentic</h2>
                  <p className="text-muted-foreground">
                    This batch has been verified as a genuine Revive Research product.
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Batch Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="h-5 w-5 text-[#9d4edd]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Batch Number</p>
                        <p className="font-bold">{result.batch.batchNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[#9d4edd]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Manufacture Date</p>
                        <p className="font-bold">{formatDate(result.batch.manufactureDate)}</p>
                      </div>
                    </div>
                    {result.batch.expirationDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[#9d4edd]" />
                        <div>
                          <p className="text-sm text-muted-foreground">Expiration Date</p>
                          <p className="font-bold">{formatDate(result.batch.expirationDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {result.product && (
                  <div>
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                      Product Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-[#9d4edd]" />
                        <div>
                          <p className="text-sm text-muted-foreground">Product Name</p>
                          <p className="font-bold">{result.product.name}</p>
                        </div>
                      </div>
                      <Link href={`/products/${result.product.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          data-testid="button-view-product"
                        >
                          View Product Page
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {result.coa && (
              <Card className="p-8 border-[#9d4edd]/20">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-6 w-6 text-[#9d4edd]" />
                    <h3 className="font-display text-xl font-bold">Certificate of Authenticity</h3>
                  </div>
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

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Test Date: {formatDate(result.coa.testDate)}
                  </span>
                  {result.coa.labName && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Lab: {result.coa.labName}
                    </span>
                  )}
                  {result.coa.purity && (
                    <span className="flex items-center gap-1">
                      <FlaskConical className="h-4 w-4" />
                      Purity: {result.coa.purity}
                    </span>
                  )}
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
                      {parseResults(result.coa.results).map((testResult, index) => (
                        <TableRow key={index} className="border-[#9d4edd]/10">
                          <TableCell className="font-medium">{testResult.compound}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {testResult.specification}
                          </TableCell>
                          <TableCell>{testResult.result}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className={
                                testResult.status === "pass"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {testResult.status === "pass" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {testResult.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {!result.coa && (
              <Card className="p-8 border-yellow-500/30 bg-yellow-500/5 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">COA Pending</h3>
                <p className="text-muted-foreground mb-6">
                  The Certificate of Authenticity for this batch is currently being processed and
                  will be available soon.
                </p>
              </Card>
            )}
          </motion.div>
        )}

        {!searchBatch && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-8 border-[#9d4edd]/20 bg-[#9d4edd]/5 text-center">
              <QrCode className="h-12 w-12 mx-auto text-[#9d4edd] mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">
                Scan the QR Code on Your Product
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Every Revive Research product comes with a unique QR code that links directly to
                its batch verification page. Simply scan the code or enter the batch number above.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/coa-library">
                  <Button
                    variant="outline"
                    className="border-[#9d4edd]/30 hover:border-[#9d4edd]"
                    data-testid="button-browse-coas"
                  >
                    Browse COA Library
                  </Button>
                </Link>
                <Link href="/products">
                  <Button className="bg-[#9d4edd] hover:bg-[#9d4edd]/90" data-testid="button-shop">
                    Shop Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
