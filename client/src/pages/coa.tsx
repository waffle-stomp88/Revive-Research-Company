import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
      const parts = result.split("|");
      return {
        compound: parts[0] || "Unknown",
        specification: parts[1] || "N/A",
        result: parts[2] || "N/A",
        status: parts[3] === "pass" ? "pass" : "fail",
      };
    });
  };

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-24">
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
            Certificate of Authenticity
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify the authenticity and purity of your research compounds. 
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
                            placeholder="Enter batch number (e.g., RVR-2024-001)"
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
                  className="font-display gap-2 h-12"
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

                  <h4 className="font-display font-semibold text-lg mb-4">
                    Test Results
                  </h4>

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                    <Shield className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-2">Why Verify?</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Our Certificate of Authenticity ensures you receive genuine, 
                      high-quality research compounds. Each batch is independently 
                      tested by third-party laboratories.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                    <FileCheck className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-2">Where to Find Your Batch Number</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your batch number can be found on the product label or 
                      included documentation. It typically starts with "RVR" 
                      followed by the year and sequence number.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
