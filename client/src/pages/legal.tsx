import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
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
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { LegalDocument } from "@shared/schema";

const categories = [
  { id: "policies", label: "Policies", icon: FileText, color: "#E7FB10", bgColor: "bg-[#E7FB10]/10", borderColor: "border-[#E7FB10]/30", textColor: "text-[#E7FB10]" },
  { id: "compliance", label: "Compliance", icon: Shield, color: "#21d8ff", bgColor: "bg-[#21d8ff]/10", borderColor: "border-[#21d8ff]/30", textColor: "text-[#21d8ff]" },
  { id: "terms", label: "Terms & Legal", icon: Gavel, color: "#9d4edd", bgColor: "bg-[#9d4edd]/10", borderColor: "border-[#9d4edd]/30", textColor: "text-[#9d4edd]" },
];

const quickLinks = [
  { href: "/terms", title: "Terms of Service", description: "Usage agreement", color: "#9d4edd" },
  { href: "/privacy", title: "Privacy Policy", description: "Data practices", color: "#21d8ff" },
  { href: "/shipping", title: "Shipping Policy", description: "Delivery info", color: "#E7FB10" },
];

export default function LegalHub() {
  const [activeCategory, setActiveCategory] = useState("policies");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery<LegalDocument[]>({
    queryKey: ["/api/legal"],
  });

  // Auto-expand document if doc slug is in URL params
  useEffect(() => {
    if (!isLoading && documents.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const docSlug = params.get("doc");
      
      if (docSlug) {
        const doc = documents.find(d => d.slug === docSlug);
        if (doc) {
          setActiveCategory(doc.category);
          setExpandedDoc(doc.id);
        }
      }
    }
  }, [documents, isLoading]);

  const filteredDocs = documents.filter((doc) => doc.category === activeCategory);
  const activeConfig = categories.find(c => c.id === activeCategory) || categories[0];

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderMarkdown = (content: string) => {
    return content
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-6 mb-2 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^---$/gm, '<hr class="my-6 border-border/50" />')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\| (.*) \|/g, '<span class="font-mono text-sm">$1</span>');
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Legal Information" description="Legal notices and compliance information for research compound purchases. For qualified researchers only." canonicalPath="/legal" />
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#E7FB10]/20 via-[#21d8ff]/20 to-[#9d4edd]/20 mb-6">
            <Scale className="h-8 w-8 text-white" />
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
                  className="p-4 h-full cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{ borderColor: `${link.color}30` }}
                  data-testid={`link-${link.href.replace("/", "")}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold" style={{ color: link.color }}>{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5" style={{ color: link.color }} />
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
                    className="flex-1 gap-2 transition-all"
                    style={{
                      backgroundColor: activeCategory === cat.id ? `${cat.color}20` : undefined,
                      color: activeCategory === cat.id ? cat.color : undefined,
                    }}
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
                      className="overflow-hidden transition-all duration-300"
                      style={{ borderColor: `${cat.color}30` }}
                      data-testid={`card-doc-${doc.slug}`}
                    >
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${cat.color}20` }}
                              >
                                <cat.icon className="h-5 w-5" style={{ color: cat.color }} />
                              </div>
                              <h3 className="font-display text-xl font-bold">{doc.title}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground ml-13">
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
                          <Badge 
                            variant="outline" 
                            className="shrink-0"
                            style={{ borderColor: cat.color, color: cat.color }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        {doc.summary && (
                          <p className="text-muted-foreground">{doc.summary}</p>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-4"
                          style={{ color: cat.color }}
                        >
                          {expandedDoc === doc.id ? "Show Less" : "Read Full Document"}
                          <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expandedDoc === doc.id ? "rotate-90" : ""}`} />
                        </Button>
                      </div>
                      
                      {expandedDoc === doc.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-6 pb-6"
                        >
                          <Separator className="mb-6" style={{ backgroundColor: `${cat.color}30` }} />
                          <div 
                            className="prose prose-invert max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.content) }}
                          />
                        </motion.div>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center border-dashed border-2" style={{ borderColor: `${cat.color}30` }}>
                    <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: `${cat.color}50` }} />
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
          <Card className="p-8 border-destructive/30 bg-destructive/5 animate-pulse-subtle" data-testid="card-ruo-disclaimer">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
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
                      className="border-[#21d8ff]/30 hover:border-[#21d8ff] text-[#21d8ff]"
                      data-testid="button-what-we-dont-do"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      What We Don't Do
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="border-[#E7FB10]/30 hover:border-[#E7FB10] text-[#E7FB10]"
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
