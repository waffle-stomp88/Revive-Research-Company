import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VerificationJourney } from "@/components/infographics/verification-journey";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Shield,
  CheckCircle,
  XCircle,
  FileCheck,
  FlaskConical,
  Download,
  AlertCircle,
  Beaker,
  Calendar,
  Building2,
  Archive,
  ArrowRight,
  GraduationCap,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import type { Coa } from "@shared/schema";

const searchSchema = z.object({
  batchNumber: z.string().min(1, "Please enter a batch number"),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface TestResult {
  compound: string;
  specification: string;
  result: string;
  status: "pass" | "fail";
}

export default function CoaVerification() {
  const { toast } = useToast();
  const [searchedCoa, setSearchedCoa] = useState<Coa | null>(null);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      batchNumber: "",
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: SearchFormData) => {
      const response = await apiRequest("GET", `/api/coa/${encodeURIComponent(data.batchNumber)}`);
      const coa = await response.json();
      return coa as Coa;
    },
    onSuccess: (data: Coa) => {
      setSearchedCoa(data);
      setNotFound(false);
    },
    onError: () => {
      setSearchedCoa(null);
      setNotFound(true);
      toast({
        title: "Batch Not Found",
        description: "No certificate found for this batch number. Please check and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SearchFormData) => {
    setSearchedCoa(null);
    setNotFound(false);
    searchMutation.mutate(data);
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

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="COA Verifier" description="Verify your Certificate of Analysis. Every batch is third-party tested for purity, identity, and sterility." canonicalPath="/coa" />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <FileCheck className="h-8 w-8 text-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-coa-title">
            Certificate of Analysis
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify the purity and identity of your research compounds. 
            Enter your batch number below to view the complete test results.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-6 md:p-8 mb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Enter batch number (e.g., RT10-2601A)"
                            className="pl-12 h-12 text-base"
                            {...field}
                            data-testid="input-batch-number"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="font-display gap-2 h-12 bg-[#E7FB10] border-2 border-[#E7FB10] shadow-glow-sm md:hover:shadow-glow-lg transition-shadow duration-300"
                  disabled={searchMutation.isPending}
                  data-testid="button-verify-coa"
                >
                  {searchMutation.isPending ? (
                    "Searching..."
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Verify
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-8 text-center border-destructive/20 bg-destructive/5">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2" data-testid="text-coa-not-found">
                  Batch Not Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find a certificate for this batch number. Please double-check 
                  the batch number on your product label and try again.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error, please contact our support team.
                </p>
              </Card>
            </motion.div>
          )}

          {searchedCoa && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-primary/5 p-6 md:p-8 border-b border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center">
                        <FlaskConical className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold" data-testid="text-coa-product-name">
                          {searchedCoa.productName}
                        </h3>
                        <p className="font-mono text-sm text-muted-foreground" data-testid="text-coa-batch-number">
                          Batch: {searchedCoa.batchNumber}
                        </p>
                      </div>
                    </div>
                    {searchedCoa.verified ? (
                      <Badge className="gap-1 text-sm py-1.5 px-3 bg-primary text-primary-foreground">
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1 text-sm py-1.5 px-3">
                        <XCircle className="h-4 w-4" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Beaker className="h-4 w-4" />
                        Purity
                      </div>
                      <p className="font-display text-2xl font-bold" data-testid="text-coa-purity">
                        {searchedCoa.purity}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Test Date
                      </div>
                      <p className="font-semibold" data-testid="text-coa-test-date">
                        {searchedCoa.testDate}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Expiration
                      </div>
                      <p className="font-semibold" data-testid="text-coa-expiration">
                        {searchedCoa.expirationDate}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                        <Building2 className="h-4 w-4" />
                        Laboratory
                      </div>
                      <p className="font-semibold" data-testid="text-coa-lab">
                        {searchedCoa.labName}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold text-lg">
                      Test Results
                    </h4>
                    <Link href="/guides/how-to-read-coas">
                      <div className="flex items-center gap-2 text-sm text-[#ec4899] hover:underline cursor-pointer" data-testid="link-learn-read-coas">
                        <GraduationCap className="h-4 w-4" />
                        <span>Learn how to read COAs</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test</TableHead>
                          <TableHead>Specification</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parseResults(searchedCoa.results).map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{result.compound}</TableCell>
                            <TableCell className="text-muted-foreground">{result.specification}</TableCell>
                            <TableCell>{result.result}</TableCell>
                            <TableCell className="text-right">
                              {result.status === "pass" ? (
                                <Badge variant="secondary" className="gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Pass
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Fail
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="gap-2" data-testid="button-download-coa">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!searchedCoa && !notFound && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 relative"
            >
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[#21d8ff]/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#9d4edd]/5 blur-3xl" />
              </div>
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-[#21d8ff]/10 text-[#21d8ff] border-[#21d8ff]/30 hover:bg-[#21d8ff]/20">
                  Complete Traceability
                </Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                  How Verification Works
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  From QR code to certified lab results in seconds
                </p>
              </div>
              <VerificationJourney />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <div className="grid md:grid-cols-3 gap-6">
              <Link href="/guides/how-to-read-coas">
                <Card className="p-6 cursor-pointer h-full border-2 border-[#ec4899]/40 md:hover:border-[#ec4899]/100 md:hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-[#ec4899]/10 mb-4">
                    <GraduationCap className="h-8 w-8 text-[#ec4899]" />
                  </div>
                  <h3 className="font-display font-semibold mb-3 text-lg">How to Read COAs</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    Learn what each test means, how to interpret purity percentages, and what to look for in a Certificate of Analysis.
                  </p>
                  <div className="flex items-center gap-1 text-[#ec4899] text-sm font-medium" data-testid="link-education-coa">
                    Read Guide
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Card>
              </Link>

              <Card className="p-6 h-full border-2 border-white/20 md:hover:border-white/60 md:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-foreground/10 mb-4">
                  <FileCheck className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-3 text-lg">Where to Find Your Batch Number</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  Your batch number can be found on the product label or included documentation, such as RT10-2601A.
                </p>
              </Card>

              <Link href="/coa-library">
                <Card className="p-6 cursor-pointer h-full border-2 border-[#21d8ff]/40 md:hover:border-[#21d8ff]/100 md:hover:shadow-[0_0_20px_rgba(33,216,255,0.3)] transition-all duration-300 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-[#21d8ff]/10 mb-4">
                    <Archive className="h-8 w-8 text-[#21d8ff]" />
                  </div>
                  <h3 className="font-display font-semibold mb-3 text-lg">Browse COA Library</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    Search all certificates in our comprehensive database or explore certificates by product and batch number.
                  </p>
                  <div className="flex items-center gap-1 text-[#21d8ff] text-sm font-medium">
                    View Library
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Card>
              </Link>
            </div>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
