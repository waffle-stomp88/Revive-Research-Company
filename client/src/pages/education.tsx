import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useParams } from "wouter";
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  Thermometer,
  FileCheck,
  Clock,
  ChevronRight,
  ChevronDown,
  Beaker,
  Info,
  Shield,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Zap,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Filter,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArticleModeToggle, BeginnerBadge } from "@/components/education/article-mode-toggle";
import { BeginnerArticleContent, WhatIsPeptideSection } from "@/components/education/beginner-content";
import type { EducationArticle, Product } from "@shared/schema";
import { LearningRoadmap } from "@/components/infographics/learning-roadmap";
import { OrderingJourney } from "@/components/infographics/ordering-journey";
import { 
  COAAnatomyDiagram, 
  HPLCExplainer, 
  StorageTemperatureGuide,
  TelomereVisual,
  GLP1ReceptorComparison,
  GHAxisDiagram,
  HealingPathwayVisual,
  IGF1PathwayVisual,
  CellularEnergyVisual,
  NeuropeptideVisual,
  HormonalPathwayVisual,
  IpamorelinComparison,
  CJC1295DACMechanism,
  TesomorellinComparison,
  // New MOTS-C quality level infographics
  BPC157AngiogenesisVisual,
  TB500ActinVisual,
  GHKCuCopperVisual,
  EpithalonTelomeraseVisual,
  GLP1ReceptorVisual,
  IpamorelinSelectivityVisual,
  CJC1295AlbuminVisual,
  TesomorelinPulseVisual,
  IGF1SignalingVisual,
  SemaxNeuralVisual,
  HCGHormonalVisual,
  NADSirtuinVisual,
  GLOWSynergyVisual,
  // Educational peptide visuals (compounds not carried by company)
  KisspeptinVisual,
  PT141Visual,
  ThymosinAlpha1Visual,
  DSIPVisual,
  SelankVisual,
  AOD9604Visual,
  ThymulinVisual
} from "@/components/education";

const articleVisuals: Record<string, () => JSX.Element> = {
  "ordering-expectations": () => <OrderingJourney />,
  "how-to-read-coas": () => <COAAnatomyDiagram />,
  "understanding-peptide-purity": () => <HPLCExplainer />,
  "storage-101": () => <StorageTemperatureGuide />,
  // New MOTS-C quality level infographics - mechanism-specific visualizations
  "epithalon-research-guide": () => <EpithalonTelomeraseVisual />,
  "semaglutide-research-guide": () => <GLP1ReceptorVisual />,
  "tirzepatide-research-guide": () => <GLP1ReceptorVisual />,
  "retatrutide-research-guide": () => <GLP1ReceptorVisual />,
  "cjc-1295-research-guide": () => <CJC1295AlbuminVisual />,
  "ipamorelin-research-guide": () => <IpamorelinSelectivityVisual />,
  "tesamorelin-research-guide": () => <TesomorelinPulseVisual />,
  "bpc-157-research-guide": () => <BPC157AngiogenesisVisual />,
  "tb-500-research-guide": () => <TB500ActinVisual />,
  "ghk-cu-research-guide": () => <GHKCuCopperVisual />,
  "glow-peptide-complex-research-guide": () => <GLOWSynergyVisual />,
  "igf-1-lr3-research-guide": () => <IGF1SignalingVisual />,
  "mots-c-research-guide": () => <CellularEnergyVisual peptide="mots-c" />,
  "nad-precursor-research-guide": () => <NADSirtuinVisual />,
  "semax-research-guide": () => <SemaxNeuralVisual />,
  "hcg-research-guide": () => <HCGHormonalVisual />,
  // Educational peptides (compounds not carried by company)
  "kisspeptin-research-guide": () => <KisspeptinVisual />,
  "pt-141-bremelanotide-research-guide": () => <PT141Visual />,
  "thymosin-alpha-1-research-guide": () => <ThymosinAlpha1Visual />,
  "dsip-research-guide": () => <DSIPVisual />,
  "selank-research-guide": () => <SelankVisual />,
  "aod-9604-research-guide": () => <AOD9604Visual />,
  "thymulin-research-guide": () => <ThymulinVisual />,
};

const categories = [
  { id: "all", label: "All Articles", icon: BookOpen, color: "#ffffff" },
  { id: "peptides", label: "Peptide Profiles", icon: FlaskConical, color: "#ec4899" },
  { id: "basics", label: "Research Basics", icon: Beaker, color: "#21d8ff" },
  { id: "coa-guide", label: "Understanding COAs", icon: FileCheck, color: "#9d4edd" },
  { id: "storage", label: "Storage & Handling", icon: Thermometer, color: "#f97316" },
  { id: "safety", label: "Lab Safety", icon: AlertTriangle, color: "#ef4444" },
  { id: "glossary", label: "Terminology", icon: Info, color: "#22c55e" },
];

const peptideGroups = [
  { id: "all", label: "All Peptides", color: "#ec4899" },
  { id: "metabolic", label: "Metabolic / GLP-1", color: "#E7FB10", slugs: ["semaglutide", "tirzepatide", "retatrutide"] },
  { id: "growth-hormone", label: "Growth Hormone", color: "#21d8ff", slugs: ["cjc-1295", "ipamorelin", "tesamorelin", "igf-1-lr3"] },
  { id: "tissue-repair", label: "Tissue Repair", color: "#22c55e", slugs: ["bpc-157", "tb-500"] },
  { id: "skin-regeneration", label: "Skin & Regeneration", color: "#ec4899", slugs: ["ghk-cu", "glow-peptide-complex"] },
  { id: "longevity", label: "Longevity & Cellular", color: "#9d4edd", slugs: ["epithalon", "mots-c", "nad-precursor"] },
  { id: "cognitive", label: "Cognitive / Neuro", color: "#f97316", slugs: ["semax"] },
  { id: "hormonal", label: "Hormonal", color: "#21d8ff", slugs: ["hcg"] },
];

type SortOption = "a-z" | "z-a";

const getPeptideGroup = (slug: string): string => {
  for (const group of peptideGroups) {
    if (group.slugs?.some(s => slug.includes(s))) {
      return group.id;
    }
  }
  return "all";
};

const onboardingCourse = [
  { step: 1, title: "Research Use Only", slug: "research-use-only-explained", description: "Understanding the legal framework" },
  { step: 2, title: "Reading COAs", slug: "how-to-read-coas", description: "Interpreting lab certificates" },
  { step: 3, title: "Batch Numbers", slug: "understanding-batches", description: "Traceability and quality control" },
  { step: 4, title: "Storage 101", slug: "storage-101", description: "Proper handling fundamentals" },
  { step: 5, title: "Ordering Expectations", slug: "ordering-expectations", description: "What to expect from checkout to delivery" },
];

const getCategoryColor = (categoryId: string) => {
  const cat = categories.find(c => c.id === categoryId);
  return cat?.color || "#9d4edd";
};

const getCategoryLabel = (categoryId: string) => {
  const cat = categories.find(c => c.id === categoryId);
  return cat?.label || categoryId;
};

const parseMarkdownTable = (tableText: string): { headers: string[]; rows: string[][] } | null => {
  const lines = tableText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return null;
  
  const parseRow = (line: string): string[] => {
    return line.split('|')
      .map(cell => cell.trim())
      .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1 || (idx === 0 && cell) || (idx === arr.length - 1 && cell));
  };
  
  const headers = parseRow(lines[0]);
  if (headers.length === 0) return null;
  
  // Skip separator line (line with dashes)
  const dataStartIdx = lines[1]?.match(/^[\|\s\-:]+$/) ? 2 : 1;
  
  const rows: string[][] = [];
  for (let i = dataStartIdx; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length > 0) rows.push(row);
  }
  
  return { headers, rows };
};

const renderTable = (table: { headers: string[]; rows: string[][] }): string => {
  const headerCells = table.headers
    .map(h => `<th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#21d8ff] border-b border-[#21d8ff]/30">${h}</th>`)
    .join('');
  
  const bodyRows = table.rows
    .map((row, rowIdx) => {
      const cells = row
        .map((cell, cellIdx) => {
          const isFirstCol = cellIdx === 0;
          const cellClass = isFirstCol 
            ? 'px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap'
            : 'px-4 py-3 text-sm text-muted-foreground';
          return `<td class="${cellClass}">${cell}</td>`;
        })
        .join('');
      const rowClass = rowIdx % 2 === 0 ? 'bg-[#21d8ff]/5' : 'bg-transparent';
      return `<tr class="${rowClass} hover:bg-[#21d8ff]/10 transition-colors">${cells}</tr>`;
    })
    .join('');
  
  // Return on single line to avoid paragraph wrapping from renderMarkdown
  return `<div class="my-6 overflow-hidden rounded-lg border border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 to-transparent shadow-[0_0_15px_rgba(33,216,255,0.1)]"><table class="min-w-full divide-y divide-[#21d8ff]/20"><thead class="bg-[#21d8ff]/10"><tr>${headerCells}</tr></thead><tbody class="divide-y divide-border/50">${bodyRows}</tbody></table></div>`;
};

const renderMarkdown = (content: string) => {
  // First, find and replace markdown tables with styled HTML tables
  // Allow optional leading whitespace and handle tables at end of document
  const tableRegex = /(^\s*\|[^\n]+\|[ \t]*\n?)+/gm;
  let processedContent = content.replace(tableRegex, (match) => {
    const table = parseMarkdownTable(match);
    if (table && table.headers.length > 0 && table.rows.length > 0) {
      return renderTable(table);
    }
    return match; // Return original if parsing fails
  });
  
  // Remove any remaining table separator lines that weren't part of valid tables
  processedContent = processedContent.replace(/^\s*\|?[\s\-:]+\|[\s\-:|]+\s*$/gm, '');
  
  // Wrap consecutive numbered list items in <ol> tags
  processedContent = processedContent.replace(
    /(^(\d+)\. .+$(\n^(\d+)\. .+$)*)/gm,
    (match) => {
      const items = match
        .split('\n')
        .map(line => line.replace(/^\d+\. (.+)$/, '<li class="ml-4">$1</li>'))
        .join('');
      return `<ol class="list-decimal ml-4 my-4 space-y-1">${items}</ol>`;
    }
  );
  
  // Wrap consecutive unordered list items in <ul> tags
  processedContent = processedContent.replace(
    /(^- .+$(\n^- .+$)*)/gm,
    (match) => {
      const items = match
        .split('\n')
        .map(line => line.replace(/^- (.+)$/, '<li class="ml-4">$1</li>'))
        .join('');
      return `<ul class="list-disc ml-4 my-4 space-y-1">${items}</ul>`;
    }
  );
  
  // Then apply other markdown transformations
  return processedContent
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-6 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!\s*<)/gm, '<p class="mb-4">'); // Skip lines starting with HTML tags (with optional whitespace)
};

type ArticleMode = "deep-dive" | "quick-breakdown";

export default function Education() {
  const params = useParams<{ slug?: string }>();
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articleMode, setArticleMode] = useState<ArticleMode>("quick-breakdown");
  const [peptideSort, setPeptideSort] = useState<SortOption>("a-z");
  const [peptideGroupFilter, setPeptideGroupFilter] = useState<string>("all");

  const { data: articles = [], isLoading } = useQuery<EducationArticle[]>({
    queryKey: ["/api/education"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Helper to find matching product for a peptide article
  const getMatchingProduct = (slug: string): Product | undefined => {
    if (!slug?.endsWith('-research-guide')) return undefined;
    const peptideName = slug.replace('-research-guide', '').replace(/-/g, ' ').toLowerCase();
    return products.find(p => p.name.toLowerCase().includes(peptideName) || 
      peptideName.includes(p.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()));
  };

  const handleOpenArticle = (articleId: string) => {
    setExpandedArticle(articleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (params.slug && articles.length > 0) {
      const article = articles.find(a => a.slug === params.slug);
      if (article) {
        setExpandedArticle(article.id);
        setActiveCategory(article.category);
        setTimeout(() => {
          const element = document.getElementById(`article-${article.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [params.slug, articles]);

  const filteredArticles = (() => {
    let result = activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);
    
    // Apply peptide group filter if in peptides category
    if (activeCategory === "peptides" && peptideGroupFilter !== "all") {
      result = result.filter((a) => {
        const group = getPeptideGroup(a.slug || "");
        return group === peptideGroupFilter;
      });
    }
    
    // Apply sorting for peptides category (alphabetical by default)
    if (activeCategory === "peptides") {
      result = [...result].sort((a, b) => {
        const nameA = a.title.toLowerCase();
        const nameB = b.title.toLowerCase();
        if (peptideSort === "a-z") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }
    
    return result;
  })();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "peptides":
        return FlaskConical;
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

  const groupedArticles = categories.slice(1).map(cat => ({
    ...cat,
    articles: articles
      .filter(a => a.category === cat.id)
      .sort((a, b) => a.title.localeCompare(b.title))
  })).filter(cat => cat.articles.length > 0);

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <SEOHead title="Education Center" description="Learn about peptide research, proper handling, and storage. Free educational resources for researchers." canonicalPath="/education" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 mb-4">
            <GraduationCap className="h-4 w-4 text-[#ec4899]" />
            <span className="text-sm font-medium text-[#ec4899]">Researcher Education Center</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Learn Peptide Research
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about peptide research, from fundamentals to advanced topics.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="lg:sticky lg:top-28">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Browse by Topic
              </h2>
              <nav className="space-y-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const count = cat.id === 'all' 
                    ? articles.length 
                    : articles.filter(a => a.category === cat.id).length;
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setExpandedArticle(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-card border' 
                          : 'hover:bg-muted/50'
                      }`}
                      style={{
                        borderColor: isActive ? `${cat.color}40` : 'transparent',
                        backgroundColor: isActive ? `${cat.color}10` : undefined
                      }}
                      data-testid={`nav-category-${cat.id}`}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: `${cat.color}20`,
                          boxShadow: isActive ? `0 0 10px ${cat.color}30` : undefined
                        }}
                      >
                        <Icon 
                          className="h-4 w-4" 
                          style={{ color: cat.color }}
                        />
                      </div>
                      <span className={`flex-1 text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {cat.label}
                      </span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isActive ? `${cat.color}20` : 'hsl(var(--muted))',
                          color: isActive ? cat.color : undefined
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <Separator className="my-6" />

              <div className="p-5 rounded-lg bg-gradient-to-br from-[#ec4899]/15 via-[#9d4edd]/10 to-[#ec4899]/5 border border-[#ec4899]/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ec4899]/0 via-[#ec4899]/5 to-[#ec4899]/0 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-[#ec4899]" />
                    <span className="text-sm font-semibold">New to Research?</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Start with our 5-part onboarding course
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#ec4899] to-[#c2185b] hover:shadow-lg hover:shadow-[#ec4899]/40 text-white font-semibold transition-all duration-200 group"
                    onClick={() => {
                      setActiveCategory('basics');
                      setExpandedArticle(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    data-testid="button-start-learning"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Start Learning
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <Link href="/transparency">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Shield className="h-4 w-4 text-[#E7FB10]" />
                    <span className="text-sm text-muted-foreground">Quality Standards</span>
                  </div>
                </Link>
                <Link href="/faq">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Info className="h-4 w-4 text-[#9d4edd]" />
                    <span className="text-sm text-muted-foreground">FAQ</span>
                  </div>
                </Link>
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            {expandedArticle ? (
              <div>
                {(() => {
                  const article = articles.find(a => a.id === expandedArticle);
                  if (!article) return null;
                  const catColor = getCategoryColor(article.category);
                  const CategoryIcon = getCategoryIcon(article.category);

                  return (
                    <Card className="overflow-hidden" style={{ borderColor: `${catColor}30` }}>
                      <div className="p-6 border-b" style={{ borderColor: `${catColor}20` }}>
                        <button
                          onClick={() => setExpandedArticle(null)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer"
                          data-testid="button-back-to-articles"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to {getCategoryLabel(activeCategory)}
                        </button>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: `${catColor}50`, color: catColor }}
                          >
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {getCategoryLabel(article.category)}
                          </Badge>
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {article.readTimeMinutes} min read
                          </span>
                        </div>

                        <h1 className="font-display text-2xl md:text-3xl font-bold mb-3" style={{ color: catColor }}>
                          {article.title}
                        </h1>
                        <p className="text-muted-foreground mb-4">
                          {article.summary}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <ArticleModeToggle 
                            mode={articleMode} 
                            onModeChange={setArticleMode} 
                          />
                          {articleMode === "quick-breakdown" && <BeginnerBadge />}
                        </div>
                      </div>

                      <div className="p-6">
                        <AnimatePresence mode="wait">
                          {articleMode === "quick-breakdown" ? (
                            <motion.div
                              key="beginner"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <BeginnerArticleContent 
                                slug={article.slug || ""} 
                                title={article.title} 
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="deepdive"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              {article.slug && articleVisuals[article.slug] && (
                                <div className="mb-8">
                                  {articleVisuals[article.slug]()}
                                </div>
                              )}

                              {article.content && (
                                <div 
                                  className="prose prose-invert max-w-none text-muted-foreground"
                                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                                />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* RUO Disclaimer for peptide articles */}
                        {article.category === "peptides" && (
                          <div className="mt-8 p-4 rounded-lg border border-red-500/30 bg-red-950/20">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-red-400 mb-1">Research Use Only</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  This compound is intended for laboratory research purposes only. Not for human consumption, 
                                  veterinary use, or any therapeutic applications. All information provided is for 
                                  educational purposes and does not constitute medical advice.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Subtle product CTA for peptide articles */}
                        {article.category === "peptides" && (() => {
                          const matchingProduct = getMatchingProduct(article.slug || "");
                          if (!matchingProduct) return null;
                          return (
                            <div className="mt-6 pt-6 border-t border-border/50">
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Interested in this compound for your research?
                                  </span>
                                </div>
                                <Link href={`/peptides/${matchingProduct.id}`}>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs border-[#21d8ff]/30 text-[#21d8ff] hover:bg-[#21d8ff]/10 hover:border-[#21d8ff]"
                                    data-testid={`button-view-product-${matchingProduct.id}`}
                                  >
                                    View {matchingProduct.name}
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </Card>
                  );
                })()}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {activeCategory === 'all' ? 'All Articles' : getCategoryLabel(activeCategory)}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                {activeCategory === 'all' && (
                  <div className="mb-12 p-6 rounded-lg border border-[#9d4edd]/30 bg-gradient-to-br from-[#9d4edd]/5 to-[#ec4899]/5">
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9d4edd]/10 border border-[#9d4edd]/20 mb-3">
                        <Sparkles className="h-3 w-3 text-[#9d4edd]" />
                        <span className="text-xs font-semibold text-[#9d4edd]">Guided Onboarding</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-center" style={{ color: '#9d4edd' }}>Your Learning Path</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Complete our guided 5-part onboarding course to master the fundamentals
                      </p>
                    </div>
                    <LearningRoadmap 
                      onModuleClick={(slug: string) => {
                        const article = articles.find(a => a.slug === slug);
                        if (article) {
                          setExpandedArticle(article.id);
                          setActiveCategory(article.category);
                        }
                      }}
                    />
                  </div>
                )}

                {activeCategory === 'all' ? (
                  <div className="space-y-10">
                    {groupedArticles.map((group) => {
                      const Icon = group.icon;
                      return (
                        <div key={group.id}>
                          <div className="flex items-center gap-3 mb-4">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${group.color}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color: group.color }} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg" style={{ color: group.color }}>
                                {group.label}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {group.articles.length} article{group.articles.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            {group.articles.map((article) => (
                              <Card
                                key={article.id}
                                id={`article-${article.id}`}
                                className="p-4 cursor-pointer hover:bg-muted/30 transition-all group"
                                style={{ borderColor: `${group.color}20` }}
                                onClick={() => handleOpenArticle(article.id)}
                                data-testid={`card-article-${article.slug || article.id}`}
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium group-hover:text-foreground transition-colors">
                                      {article.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                      {article.summary}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs text-muted-foreground">
                                      {article.readTimeMinutes} min
                                    </span>
                                    <ChevronRight 
                                      className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" 
                                      style={{ color: group.color }}
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeCategory === "peptides" && (
                      <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          <Select value={peptideGroupFilter} onValueChange={setPeptideGroupFilter}>
                            <SelectTrigger className="w-[180px] h-9" data-testid="select-peptide-group">
                              <SelectValue placeholder="Filter by group" />
                            </SelectTrigger>
                            <SelectContent>
                              {peptideGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id} data-testid={`option-group-${group.id}`}>
                                  <span style={{ color: group.color }}>{group.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          <Select value={peptideSort} onValueChange={(v) => setPeptideSort(v as SortOption)}>
                            <SelectTrigger className="w-[130px] h-9" data-testid="select-peptide-sort">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a-z" data-testid="option-sort-az">
                                <span className="flex items-center gap-2">
                                  <SortAsc className="h-3 w-3" /> A to Z
                                </span>
                              </SelectItem>
                              <SelectItem value="z-a" data-testid="option-sort-za">
                                <span className="flex items-center gap-2">
                                  <SortDesc className="h-3 w-3" /> Z to A
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {peptideGroupFilter !== "all" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPeptideGroupFilter("all")}
                            className="h-9 px-3 text-muted-foreground hover:text-foreground"
                            data-testid="button-clear-filter"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear filter
                          </Button>
                        )}
                        
                        <span className="text-sm text-muted-foreground ml-auto">
                          {filteredArticles.length} peptide{filteredArticles.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    <div className="grid gap-3">
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => {
                        const catColor = getCategoryColor(article.category);
                        
                        return (
                          <Card
                            key={article.id}
                            id={`article-${article.id}`}
                            className="p-4 cursor-pointer hover:bg-muted/30 transition-all group"
                            style={{ borderColor: `${catColor}20` }}
                            onClick={() => handleOpenArticle(article.id)}
                            data-testid={`card-article-${article.slug || article.id}`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium group-hover:text-foreground transition-colors">
                                  {article.title}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                  {article.summary}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {activeCategory === "peptides" && article.slug && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs hidden sm:inline-flex"
                                    style={{ 
                                      borderColor: `${peptideGroups.find(g => g.id === getPeptideGroup(article.slug || ""))?.color || catColor}50`,
                                      color: peptideGroups.find(g => g.id === getPeptideGroup(article.slug || ""))?.color || catColor
                                    }}
                                  >
                                    {peptideGroups.find(g => g.id === getPeptideGroup(article.slug || ""))?.label || "Other"}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {article.readTimeMinutes} min
                                </span>
                                <ChevronRight 
                                  className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" 
                                  style={{ color: catColor }}
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    ) : (
                      <Card className="p-12 text-center border-dashed border-2">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-display text-xl font-bold mb-2">No Articles Yet</h3>
                        <p className="text-muted-foreground">
                          Articles for this category are coming soon.
                        </p>
                      </Card>
                    )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
