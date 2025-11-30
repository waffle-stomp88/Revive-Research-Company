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
  GraduationCap,
  BookOpen,
  FlaskConical,
  Thermometer,
  FileCheck,
  Clock,
  ChevronRight,
  Beaker,
  Info,
  Shield,
  AlertTriangle,
} from "lucide-react";
import type { EducationArticle } from "@shared/schema";

const categories = [
  { id: "all", label: "All Articles", icon: BookOpen, color: "#ffffff" },
  { id: "basics", label: "Research Basics", icon: Beaker, color: "#E7FB10" },
  { id: "coa-guide", label: "Understanding COAs", icon: FileCheck, color: "#21d8ff" },
  { id: "storage", label: "Storage & Handling", icon: Thermometer, color: "#9d4edd" },
  { id: "safety", label: "Lab Safety", icon: AlertTriangle, color: "#f97316" },
  { id: "glossary", label: "Terminology", icon: Info, color: "#22c55e" },
];

const getCategoryColor = (categoryId: string) => {
  const cat = categories.find(c => c.id === categoryId);
  return cat?.color || "#9d4edd";
};

export default function Education() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const { data: articles = [], isLoading } = useQuery<EducationArticle[]>({
    queryKey: ["/api/education"],
  });

  const filteredArticles =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "basics":
        return Beaker;
      case "coa-guide":
        return FileCheck;
      case "storage":
        return Thermometer;
      case "safety":
        return AlertTriangle;
      case "glossary":
        return Info;
      default:
        return BookOpen;
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.id === category)?.label || category;
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
      .replace(/\n\n/g, '</p><p class="mb-4">');
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#E7FB10]/20 via-[#21d8ff]/20 to-[#9d4edd]/20 mb-6">
            <GraduationCap className="h-8 w-8 text-white" />
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
          <Card className="p-6 border-[#21d8ff]/20 bg-gradient-to-br from-[#21d8ff]/5 to-transparent">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#21d8ff]/20 flex items-center justify-center">
                <FlaskConical className="h-6 w-6 text-[#21d8ff]" />
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
              const isActive = activeCategory === cat.id;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex-1 min-w-fit gap-2 transition-all"
                  style={{
                    backgroundColor: isActive ? `${cat.color}20` : undefined,
                    color: isActive && cat.id !== "all" ? cat.color : undefined,
                  }}
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
                  const catColor = getCategoryColor(article.category);
                  const isExpanded = expandedArticle === article.id;
                  
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={isExpanded ? "md:col-span-2" : ""}
                    >
                      <Card
                        className="h-full overflow-hidden transition-all duration-300 cursor-pointer group"
                        style={{ borderColor: `${catColor}30` }}
                        data-testid={`card-article-${article.slug || article.id}`}
                        onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                      >
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div 
                              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                              style={{ backgroundColor: `${catColor}20` }}
                            >
                              <CategoryIcon className="h-6 w-6" style={{ color: catColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{ borderColor: `${catColor}50`, color: catColor }}
                                >
                                  {getCategoryLabel(article.category)}
                                </Badge>
                                <span className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {article.readTimeMinutes} min read
                                </span>
                              </div>
                              <h3 
                                className="font-display text-lg font-bold mb-2 transition-colors"
                                style={{ color: isExpanded ? catColor : undefined }}
                              >
                                {article.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {article.summary}
                              </p>
                              <div 
                                className="flex items-center text-sm mt-3 group-hover:translate-x-1 transition-transform"
                                style={{ color: catColor }}
                              >
                                {isExpanded ? "Show Less" : "Read Article"}
                                <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && article.content && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="px-6 pb-6"
                          >
                            <Separator className="mb-6" style={{ backgroundColor: `${catColor}30` }} />
                            <div 
                              className="prose prose-invert max-w-none text-muted-foreground"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                            />
                          </motion.div>
                        )}
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
            <Card 
              className="p-6 h-full border-[#21d8ff]/20 hover:border-[#21d8ff]/40 transition-colors cursor-pointer group"
              data-testid="link-coa-library"
            >
              <FileCheck className="h-8 w-8 text-[#21d8ff] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#21d8ff] transition-colors">
                Browse COA Library
              </h3>
              <p className="text-sm text-muted-foreground">
                View our complete library of third-party verified certificates.
              </p>
            </Card>
          </Link>

          <Link href="/what-we-dont-do">
            <Card 
              className="p-6 h-full border-[#E7FB10]/20 hover:border-[#E7FB10]/40 transition-colors cursor-pointer group"
              data-testid="link-what-we-dont-do"
            >
              <Shield className="h-8 w-8 text-[#E7FB10] mb-4" />
              <h3 className="font-display text-lg font-bold mb-2 group-hover:text-[#E7FB10] transition-colors">
                Quality Standards
              </h3>
              <p className="text-sm text-muted-foreground">
                Learn about our commitment to quality and ethical practices.
              </p>
            </Card>
          </Link>

          <Link href="/faq">
            <Card 
              className="p-6 h-full border-[#9d4edd]/20 hover:border-[#9d4edd]/40 transition-colors cursor-pointer group"
              data-testid="link-faq"
            >
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
