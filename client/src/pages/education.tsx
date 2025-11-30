import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  Thermometer,
  FileCheck,
  Clock,
  ChevronRight,
  Beaker,
  Info,
} from "lucide-react";
import type { EducationArticle } from "@shared/schema";

const categories = [
  { id: "all", label: "All Articles", icon: BookOpen },
  { id: "basics", label: "Research Basics", icon: Beaker },
  { id: "coa-guide", label: "Understanding COAs", icon: FileCheck },
  { id: "storage", label: "Storage & Handling", icon: Thermometer },
  { id: "glossary", label: "Terminology", icon: Info },
];

const defaultArticles = [
  {
    id: "1",
    slug: "understanding-peptide-purity",
    title: "Understanding Peptide Purity",
    category: "basics",
    summary:
      "Learn what purity percentages mean and why they matter for your research. HPLC testing explained in simple terms.",
    readTimeMinutes: 5,
  },
  {
    id: "2",
    slug: "how-to-read-coa",
    title: "How to Read a Certificate of Authenticity",
    category: "coa-guide",
    summary:
      "A step-by-step guide to interpreting COA documents. Understand what each test measures and what the results mean.",
    readTimeMinutes: 8,
  },
  {
    id: "3",
    slug: "proper-peptide-storage",
    title: "Proper Peptide Storage Guidelines",
    category: "storage",
    summary:
      "Best practices for storing lyophilized peptides before and after reconstitution. Temperature, light, and humidity considerations.",
    readTimeMinutes: 6,
  },
  {
    id: "4",
    slug: "reconstitution-basics",
    title: "Reconstitution Basics",
    category: "storage",
    summary:
      "How to properly reconstitute lyophilized peptides for research use. Recommended solvents and techniques.",
    readTimeMinutes: 7,
  },
  {
    id: "5",
    slug: "common-testing-methods",
    title: "Common Testing Methods Explained",
    category: "coa-guide",
    summary:
      "HPLC, Mass Spectrometry, Amino Acid Analysis - what these tests are and why they're important for quality verification.",
    readTimeMinutes: 10,
  },
  {
    id: "6",
    slug: "peptide-terminology",
    title: "Peptide Research Terminology",
    category: "glossary",
    summary:
      "A comprehensive glossary of terms commonly used in peptide research and quality testing.",
    readTimeMinutes: 5,
  },
];

export default function Education() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: articles = [], isLoading } = useQuery<EducationArticle[]>({
    queryKey: ["/api/education"],
  });

  const displayArticles = articles.length > 0 ? articles : defaultArticles;
  const filteredArticles =
    activeCategory === "all"
      ? displayArticles
      : displayArticles.filter((a) => a.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "basics":
        return Beaker;
      case "coa-guide":
        return FileCheck;
      case "storage":
        return Thermometer;
      case "glossary":
        return Info;
      default:
        return BookOpen;
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.id === category)?.label || category;
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
            <GraduationCap className="h-8 w-8 text-[#9d4edd]" />
          </div>
          <h1
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            data-testid="text-education-title"
          >
            Education Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resources and guides to help you understand peptide research, quality testing, and
            proper handling procedures.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center">
                <FlaskConical className="h-6 w-6 text-[#9d4edd]" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2">For Researchers</h2>
                <p className="text-muted-foreground">
                  These educational materials are designed to help researchers understand the
                  quality verification process, proper handling techniques, and scientific
                  terminology used in peptide research.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full flex-wrap h-auto gap-1 mb-8 bg-card border border-border/50 p-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex-1 min-w-fit gap-2 data-[state=active]:bg-[#9d4edd]/20 data-[state=active]:text-foreground"
                  data-testid={`tab-${cat.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeCategory}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article, index) => {
                  const CategoryIcon = getCategoryIcon(article.category);
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Card
                        className="h-full p-6 border-border/50 hover:border-[#9d4edd]/40 transition-colors cursor-pointer group"
                        data-testid={`card-article-${article.slug}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#9d4edd]/10 flex items-center justify-center group-hover:bg-[#9d4edd]/20 transition-colors">
                            <CategoryIcon className="h-6 w-6 text-[#9d4edd]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className="border-[#9d4edd]/30 text-[#9d4edd] text-xs"
                              >
                                {getCategoryLabel(article.category)}
                              </Badge>
                              <span className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {article.readTimeMinutes} min read
                              </span>
                            </div>
                            <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#9d4edd] transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex items-center text-sm text-[#9d4edd] mt-3 group-hover:translate-x-1 transition-transform">
                              Read Article
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-2">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">No Articles Found</h3>
                <p className="text-muted-foreground">
                  No articles are available in this category yet. Check back soon for new content.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link href="/coa-library">
            <Card className="p-6 h-full border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors cursor-pointer group">
              <FileCheck className="h-8 w-8 text-[#9d4edd] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#9d4edd] transition-colors">
                Browse COA Library
              </h3>
              <p className="text-sm text-muted-foreground">
                View our complete library of third-party verified certificates.
              </p>
            </Card>
          </Link>

          <Link href="/what-we-dont-do">
            <Card className="p-6 h-full border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors cursor-pointer group">
              <FlaskConical className="h-8 w-8 text-[#9d4edd] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#9d4edd] transition-colors">
                Quality Standards
              </h3>
              <p className="text-sm text-muted-foreground">
                Learn about our commitment to quality and ethical practices.
              </p>
            </Card>
          </Link>

          <Link href="/faq">
            <Card className="p-6 h-full border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors cursor-pointer group">
              <Info className="h-8 w-8 text-[#9d4edd] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#9d4edd] transition-colors">
                FAQ
              </h3>
              <p className="text-sm text-muted-foreground">
                Find answers to frequently asked questions about our products.
              </p>
            </Card>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
