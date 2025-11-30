import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Scale,
  FileText,
  Shield,
  Building2,
  Calendar,
  ChevronRight,
  BookOpen,
  Gavel,
  AlertCircle,
} from "lucide-react";
import type { LegalDocument } from "@shared/schema";

const categories = [
  { id: "policies", label: "Policies", icon: FileText },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "terms", label: "Terms & Legal", icon: Gavel },
];

const quickLinks = [
  { href: "/terms", title: "Terms of Service", description: "Usage agreement" },
  { href: "/privacy", title: "Privacy Policy", description: "Data practices" },
  { href: "/shipping", title: "Shipping Policy", description: "Delivery info" },
];

export default function LegalHub() {
  const [activeCategory, setActiveCategory] = useState("policies");

  const { data: documents = [], isLoading } = useQuery<LegalDocument[]>({
    queryKey: ["/api/legal"],
  });

  const filteredDocs = documents.filter((doc) => doc.category === activeCategory);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#9d4edd]/20 mb-6">
            <Scale className="h-8 w-8 text-[#9d4edd]" />
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            data-testid="text-legal-title"
          >
            Legal & Compliance
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our commitment to transparency includes clear documentation of all policies, terms, and
            regulatory compliance information.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="font-display text-xl font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card
                  className="p-4 h-full cursor-pointer border-border/50 hover:border-[#9d4edd]/50 transition-colors"
                  data-testid={`link-${link.href.replace("/", "")}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full mb-8 bg-card border border-border/50">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="flex-1 gap-2 data-[state=active]:bg-[#9d4edd]/20 data-[state=active]:text-foreground"
                    data-testid={`tab-${cat.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {cat.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-6 bg-muted rounded w-1/3"></div>
                          <div className="h-4 bg-muted rounded w-full"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      className="p-6 border-border/50 hover:border-[#9d4edd]/30 transition-colors"
                      data-testid={`card-doc-${doc.slug}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-display text-xl font-bold mb-2">{doc.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Last Updated: {formatDate(doc.lastUpdated)}
                            </span>
                            {doc.effectiveDate && (
                              <span className="flex items-center gap-1">
                                <Gavel className="h-4 w-4" />
                                Effective: {formatDate(doc.effectiveDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {doc.summary && (
                        <p className="text-muted-foreground mb-4">{doc.summary}</p>
                      )}
                      <div className="prose prose-invert max-w-none text-muted-foreground">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: doc.content.substring(0, 500) + "...",
                          }}
                        />
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center border-dashed border-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-display text-xl font-bold mb-2">No Documents Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {cat.id === "policies"
                        ? "Policy documents are being prepared and will be available soon."
                        : cat.id === "compliance"
                        ? "Compliance documentation is being compiled."
                        : "Legal documents are being finalized."}
                    </p>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="p-8 border-[#9d4edd]/20 bg-[#9d4edd]/5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[#9d4edd]" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Research Use Only</h2>
                <p className="text-muted-foreground mb-4">
                  All products sold by Revive Research are strictly for laboratory and research
                  purposes. These products are not intended for human consumption, veterinary use,
                  or any therapeutic applications. By purchasing, you confirm that you are a
                  qualified researcher and will use products only for legitimate research purposes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/what-we-dont-do">
                    <Button
                      variant="outline"
                      className="border-[#9d4edd]/30 hover:border-[#9d4edd]"
                      data-testid="button-what-we-dont-do"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      What We Don't Do
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="border-[#9d4edd]/30 hover:border-[#9d4edd]"
                      data-testid="button-contact-legal"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Contact Legal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
