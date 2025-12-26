import { useState, useEffect, useMemo } from "react";
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
  Compass,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleModeToggle, BeginnerBadge } from "@/components/education/article-mode-toggle";
import { BeginnerArticleContent, WhatIsPeptideSection, hasQuickBreakdown } from "@/components/education/beginner-content";
import type { EducationArticle, Product } from "@shared/schema";
import { ResearchOrientationMap } from "@/components/education/research-orientation-map";
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
  KLOWSynergyVisual,
  // Educational peptide visuals (compounds not carried by company)
  KisspeptinVisual,
  PT141Visual,
  ThymosinAlpha1Visual,
  DSIPVisual,
  SelankVisual,
  AOD9604Visual,
  ThymulinVisual,
  // New compound research visuals
  Amino1MQNADVisual,
  DihexaSynapseVisual,
  GlutathioneRedoxVisual,
  B12MethylationVisual,
  MelanotanReceptorVisual
} from "@/components/education";

// Articles that are part of the Academy curriculum (for cross-linking)
const ACADEMY_ARTICLE_SLUGS = [
  "ordering-expectations",
  "understanding-peptide-purity", 
  "storage-101",
  "reconstitution-101",
  "how-to-read-coas",
];

const isAcademyArticle = (slug: string | null) => {
  return slug ? ACADEMY_ARTICLE_SLUGS.includes(slug) : false;
};

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
  "klow-peptide-complex-research-guide": () => <KLOWSynergyVisual />,
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
  // New compound research visuals
  "5-amino-1mq-research-guide": () => <Amino1MQNADVisual />,
  "dihexa-research-guide": () => <DihexaSynapseVisual />,
  "glutathione-research-guide": () => <GlutathioneRedoxVisual />,
  "vitamin-b12-research-guide": () => <B12MethylationVisual />,
  "melanotan-research-guide": () => <MelanotanReceptorVisual />,
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

// Tab definitions for the 3-tab structure
const EDUCATION_TABS = [
  { 
    id: "peptides", 
    label: "Peptide Research Guides", 
    icon: FlaskConical, 
    color: "#ec4899",
    categories: ["peptides"]
  },
  { 
    id: "general", 
    label: "General Education", 
    icon: BookOpen, 
    color: "#21d8ff",
    categories: ["basics", "coa-guide", "storage", "glossary"]
  },
  { 
    id: "lab-guides", 
    label: "Lab Guides", 
    icon: Beaker, 
    color: "#22c55e",
    categories: ["safety"]
  },
];

const peptideGroups = [
  { id: "all", label: "All Peptides", color: "#ec4899" },
  { id: "metabolic", label: "Metabolic / GLP-1", color: "#E7FB10", slugs: ["semaglutide", "tirzepatide", "retatrutide", "aod-9604", "5-amino-1mq"] },
  { id: "growth-hormone", label: "Growth Hormone", color: "#21d8ff", slugs: ["cjc-1295", "ipamorelin", "tesamorelin", "igf-1-lr3"] },
  { id: "tissue-repair", label: "Tissue Repair", color: "#22c55e", slugs: ["bpc-157", "tb-500"] },
  { id: "skin-regeneration", label: "Skin & Regeneration", color: "#ec4899", slugs: ["ghk-cu", "glow-peptide-complex", "melanotan"] },
  { id: "longevity", label: "Longevity & Cellular", color: "#9d4edd", slugs: ["epithalon", "mots-c", "nad-precursor", "thymosin-alpha-1", "thymulin", "glutathione", "vitamin-b12"] },
  { id: "cognitive", label: "Cognitive / Neuro", color: "#f97316", slugs: ["semax", "pt-141", "dsip", "selank", "dihexa"] },
  { id: "hormonal", label: "Hormonal", color: "#21d8ff", slugs: ["hcg", "kisspeptin"] },
];

const generalEdCategories = [
  { id: "all", label: "All Articles", color: "#21d8ff" },
  { id: "basics", label: "Research Basics", color: "#21d8ff" },
  { id: "coa-guide", label: "Understanding COAs", color: "#9d4edd" },
  { id: "storage", label: "Storage & Handling", color: "#f97316" },
  { id: "glossary", label: "Terminology", color: "#22c55e" },
];

// Multi-category articles: complex peptides that appear under multiple research groups
const multiCategoryArticles: Record<string, string[]> = {
  "glow-peptide-complex-research-guide": ["skin-regeneration", "tissue-repair", "longevity"],
  "klow-peptide-complex-research-guide": ["tissue-repair", "longevity", "immune"],
};

type SortOption = "a-z" | "z-a";

const getPeptideGroup = (slug: string): string => {
  for (const group of peptideGroups) {
    if (group.slugs?.some(s => slug.includes(s))) {
      return group.id;
    }
  }
  return "all";
};


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
    .map(h => `<th class="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-[#21d8ff] border-b border-[#21d8ff]/30">${h}</th>`)
    .join('');
  
  const bodyRows = table.rows
    .map((row, rowIdx) => {
      const cells = row
        .map((cell, cellIdx) => {
          const isFirstCol = cellIdx === 0;
          const cellClass = isFirstCol 
            ? 'px-3 py-2 text-xs font-medium text-foreground whitespace-nowrap'
            : 'px-3 py-2 text-xs text-muted-foreground';
          return `<td class="${cellClass}">${cell}</td>`;
        })
        .join('');
      const rowClass = rowIdx % 2 === 0 ? 'bg-[#21d8ff]/5' : 'bg-transparent';
      return `<tr class="${rowClass} hover:bg-[#21d8ff]/10 transition-colors">${cells}</tr>`;
    })
    .join('');
  
  // Return on single line to avoid paragraph wrapping from renderMarkdown
  return `<div class="my-4 overflow-hidden rounded-lg border border-[#21d8ff]/30 bg-gradient-to-br from-[#21d8ff]/5 to-transparent shadow-[0_0_15px_rgba(33,216,255,0.1)]"><table class="min-w-full divide-y divide-[#21d8ff]/20"><thead class="bg-[#21d8ff]/10"><tr>${headerCells}</tr></thead><tbody class="divide-y divide-border/50">${bodyRows}</tbody></table></div>`;
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
        .map(line => line.replace(/^\d+\. (.+)$/, '<li class="ml-3">$1</li>'))
        .join('');
      return `<ol class="list-decimal ml-3 my-3 space-y-1 text-sm">${items}</ol>`;
    }
  );
  
  // Wrap consecutive unordered list items in <ul> tags
  processedContent = processedContent.replace(
    /(^- .+$(\n^- .+$)*)/gm,
    (match) => {
      const items = match
        .split('\n')
        .map(line => line.replace(/^- (.+)$/, '<li class="ml-3">$1</li>'))
        .join('');
      return `<ul class="list-disc ml-3 my-3 space-y-1 text-sm">${items}</ul>`;
    }
  );

  // Handle blockquotes/callouts (lines starting with >)
  processedContent = processedContent.replace(
    /^> (.+)$/gm,
    '<div class="my-3 pl-3 border-l-2 border-[#E7FB10]/50 bg-[#E7FB10]/5 py-2 pr-3 rounded-r text-sm italic text-muted-foreground">$1</div>'
  );
  
  // Then apply other markdown transformations - compact but readable
  return processedContent
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold mt-4 mb-2 text-foreground flex items-center gap-2"><span class="w-1 h-4 bg-[#9d4edd] rounded-full"></span>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold mt-5 mb-2 text-foreground border-b border-[#21d8ff]/20 pb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mt-5 mb-3 text-foreground">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-2 text-sm leading-relaxed">')
    .replace(/^(?!\s*<)/gm, '<p class="mb-2 text-sm leading-relaxed">'); // Skip lines starting with HTML tags (with optional whitespace)
};

type ArticleMode = "deep-dive" | "quick-breakdown";

export default function Education() {
  const params = useParams<{ slug?: string }>();
  const [activeTab, setActiveTab] = useState("peptides");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articleMode, setArticleMode] = useState<ArticleMode>("quick-breakdown");
  const [peptideSort, setPeptideSort] = useState<SortOption>("a-z");
  const [peptideGroupFilter, setPeptideGroupFilter] = useState<string>("all");
  const [generalEdCategoryFilter, setGeneralEdCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles = [], isLoading } = useQuery<EducationArticle[]>({
    queryKey: ["/api/education"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Helper to find matching products for a peptide article
  const getMatchingProducts = (slug: string): Product[] => {
    if (!slug?.endsWith('-research-guide')) return [];
    
    // Special case for Melanotan article which covers both MT-1 and MT-2
    if (slug === "melanotan-research-guide") {
      return products.filter(p => 
        p.name.toLowerCase().includes("melanotan i") || 
        p.name.toLowerCase().includes("melanotan 1") ||
        p.name.toLowerCase().includes("melanotan ii") ||
        p.name.toLowerCase().includes("melanotan 2")
      );
    }

    const peptideName = slug.replace('-research-guide', '').replace(/-/g, ' ').toLowerCase();
    const directMatch = products.find(p => p.name.toLowerCase().includes(peptideName) || 
      peptideName.includes(p.name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()));
    
    return directMatch ? [directMatch] : [];
  };

  const handleOpenArticle = (articleId: string) => {
    setExpandedArticle(articleId);
    setArticleMode("quick-breakdown");
  };

  // Handle URL-based article opening
  useEffect(() => {
    if (params.slug && articles.length > 0) {
      const article = articles.find(a => a.slug === params.slug);
      if (article) {
        setExpandedArticle(article.id);
        setActiveCategory(article.category);
        setArticleMode("quick-breakdown");
      }
    }
  }, [params.slug, articles]);

  // Scroll to top of article when it expands
  useEffect(() => {
    if (expandedArticle) {
      // Use requestAnimationFrame to wait for DOM render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = document.getElementById('expanded-article');
          if (element) {
            const headerOffset = 100; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        });
      });
    }
  }, [expandedArticle]);

  // Calculate peptide article counts per group for dropdown badges
  const peptideGroupCounts = useMemo(() => {
    const peptideArticles = articles.filter(a => a.category === "peptides");
    const counts: Record<string, number> = { all: peptideArticles.length };
    peptideArticles.forEach(a => {
      const group = getPeptideGroup(a.slug || "");
      if (group && group !== "all") {
        counts[group] = (counts[group] || 0) + 1;
      }
      // Also count in any additional categories from multi-category mapping
      const additionalGroups = multiCategoryArticles[a.slug || ""] || [];
      additionalGroups.forEach(addGroup => {
        counts[addGroup] = (counts[addGroup] || 0) + 1;
      });
    });
    return counts;
  }, [articles]);

  // Calculate general education article counts per category
  const generalEdCategoryCounts = useMemo(() => {
    const genEdArticles = articles.filter(a => EDUCATION_TABS.find(t => t.id === "general")?.categories.includes(a.category));
    const counts: Record<string, number> = { all: genEdArticles.length };
    generalEdCategories.slice(1).forEach(cat => {
      counts[cat.id] = genEdArticles.filter(a => a.category === cat.id).length;
    });
    return counts;
  }, [articles]);

  // Calculate article counts per tab
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    EDUCATION_TABS.forEach(tab => {
      counts[tab.id] = articles.filter(a => tab.categories.includes(a.category)).length;
    });
    return counts;
  }, [articles]);

  // Get articles for a specific tab
  const getTabArticles = (tabId: string) => {
    const tab = EDUCATION_TABS.find(t => t.id === tabId);
    if (!tab) return [];
    return articles.filter(a => tab.categories.includes(a.category));
  };

  const filteredArticles = (() => {
    // Get articles based on active tab
    const currentTab = EDUCATION_TABS.find(t => t.id === activeTab);
    let result = currentTab 
      ? articles.filter(a => currentTab.categories.includes(a.category))
      : articles;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) => 
        a.title.toLowerCase().includes(query) || 
        (a.summary || "").toLowerCase().includes(query)
      );
    }
    
    // Apply peptide group filter if in peptides tab
    if (activeTab === "peptides" && peptideGroupFilter !== "all") {
      result = result.filter((a) => {
        const group = getPeptideGroup(a.slug || "");
        // Check primary group or any additional categories from multi-category mapping
        const additionalGroups = multiCategoryArticles[a.slug || ""] || [];
        return group === peptideGroupFilter || additionalGroups.includes(peptideGroupFilter);
      });
    }
    
    // Apply general education category filter if in general tab
    if (activeTab === "general" && generalEdCategoryFilter !== "all") {
      result = result.filter((a) => {
        // Check primary category or any additional categories from multi-category mapping
        const additionalCategories = multiCategoryArticles[a.slug || ""] || [];
        return a.category === generalEdCategoryFilter || additionalCategories.includes(generalEdCategoryFilter);
      });
    }
    
    // Apply sorting for peptides tab (alphabetical by default)
    if (activeTab === "peptides") {
      result = [...result].sort((a, b) => {
        const nameA = a.title.toLowerCase();
        const nameB = b.title.toLowerCase();
        if (peptideSort === "a-z") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    } else {
      // Sort alphabetically for other tabs too
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
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
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 mb-4">
            <BookOpen className="h-4 w-4 text-[#ec4899]" />
            <span className="text-sm font-medium text-[#ec4899]">Reference Library</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Education Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our open reference library for quick lookups on peptide research topics, compounds, and best practices.
          </p>
          <div 
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border mt-4"
            style={{
              background: "rgba(33, 216, 255, 0.05)",
              borderColor: "#21d8ff",
            }}
          >
            <Compass className="w-4 h-4 text-[#21d8ff] flex-shrink-0" />
            <span className="text-sm text-[#21d8ff]">Looking for structure?</span>
            <Link href="/academy" className="text-sm font-semibold px-3 py-1 rounded-full bg-[#21d8ff] text-black hover:bg-[#E7FB10] hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer">
              Research Academy
            </Link>
          </div>

        </motion.div>

        <div className="mt-6">
          <ResearchOrientationMap />
        </div>

        {/* Main Tabbed Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setExpandedArticle(null); setPeptideGroupFilter("all"); }} className="w-full">
            <TabsList className="w-full justify-start bg-card/50 border border-border p-1 rounded-lg mb-6 flex-wrap h-auto gap-1">
              {EDUCATION_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                    style={{
                      color: activeTab === tab.id ? tab.color : undefined,
                      borderColor: activeTab === tab.id ? `${tab.color}40` : undefined,
                    }}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" style={{ color: tab.color }} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-1 text-xs px-1.5 py-0"
                      style={{
                        backgroundColor: activeTab === tab.id ? `${tab.color}20` : undefined,
                        color: activeTab === tab.id ? tab.color : undefined
                      }}
                    >
                      {tabCounts[tab.id] || 0}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Main Content Area */}
            <div className="mt-2">
            {expandedArticle ? (
              <div className="relative">
                {/* Floating Back Button - visible while scrolling */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  onClick={() => setExpandedArticle(null)}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-[#1a1a1f]/95 border border-[#21d8ff]/40 shadow-lg shadow-black/30 backdrop-blur-sm hover:border-[#21d8ff] hover:shadow-[#21d8ff]/20 transition-all cursor-pointer lg:left-auto lg:right-8 lg:translate-x-0"
                  data-testid="button-floating-back"
                >
                  <ArrowLeft className="h-4 w-4 text-[#21d8ff]" />
                  <span className="text-sm font-medium text-foreground">Back to Articles</span>
                </motion.button>

                {(() => {
                  const article = articles.find(a => a.id === expandedArticle);
                  if (!article) return null;
                  const catColor = getCategoryColor(article.category);
                  const CategoryIcon = getCategoryIcon(article.category);

                  return (
                    <Card id="expanded-article" className="overflow-hidden" style={{ borderColor: `${catColor}30` }}>
                      <div className="p-6 border-b" style={{ borderColor: `${catColor}20` }}>
                        <button
                          onClick={() => setExpandedArticle(null)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 cursor-pointer"
                          data-testid="button-back-to-articles"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to {getCategoryLabel(activeCategory)}
                        </button>

                        <div className="flex items-center gap-2 mb-3 flex-wrap">
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
                          {isAcademyArticle(article.slug) && (
                            <Link href="/academy">
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-[#21d8ff]/10 transition-colors"
                                style={{ borderColor: "#21d8ff50", color: "#21d8ff" }}
                                data-testid="badge-academy-link"
                              >
                                <Compass className="h-3 w-3 mr-1" />
                                Part of Academy Orientation
                              </Badge>
                            </Link>
                          )}
                        </div>

                        <h1 className="font-display text-2xl md:text-3xl font-bold mb-3" style={{ color: catColor }}>
                          {article.title}
                        </h1>
                        <p className="text-muted-foreground mb-4">
                          {article.summary}
                        </p>
                        
                        {hasQuickBreakdown(article.slug) && (
                          <div className="flex flex-wrap items-center gap-3">
                            <ArticleModeToggle 
                              mode={articleMode} 
                              onModeChange={setArticleMode} 
                            />
                            {articleMode === "quick-breakdown" && <BeginnerBadge />}
                            {article.category === "peptides" && article.slug?.endsWith('-research-guide') && !article.slug?.includes('complex') && (
                              <a 
                                href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(
                                  (article.slug?.replace('-research-guide', '') || article.title)
                                    .split('-')
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join('-')
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto"
                                data-testid={`link-pubmed-research`}
                              >
                                <Button 
                                  size="sm"
                                  className="bg-[#21d8ff] hover:bg-black text-black hover:text-[#21d8ff] font-medium gap-2"
                                >
                                  View on PubMed
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 md:p-6">
                        <AnimatePresence mode="wait">
                          {hasQuickBreakdown(article.slug) && articleMode === "quick-breakdown" ? (
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
                                <div className="mb-6 max-w-2xl lg:max-w-3xl mx-auto">
                                  {articleVisuals[article.slug]()}
                                </div>
                              )}

                              {article.content && (
                                <div 
                                  className="prose prose-invert prose-sm max-w-none text-muted-foreground"
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
                          const matchingProducts = getMatchingProducts(article.slug || "");
                          if (matchingProducts.length === 0) return null;
                          return (
                            <div className="mt-6 pt-6 border-t border-border/50">
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Interested in this compound for your research?
                                  </span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {matchingProducts.map(product => (
                                    <Link key={product.id} href={`/peptides/${product.id}`}>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-xs border-[#21d8ff]/30 text-[#21d8ff] hover:bg-[#21d8ff]/10 hover:border-[#21d8ff]"
                                        data-testid={`button-view-product-${product.id}`}
                                      >
                                        View {product.name}
                                        <ChevronRight className="h-3 w-3 ml-1" />
                                      </Button>
                                    </Link>
                                  ))}
                                </div>
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
                {/* Peptide Research Guides Tab - Two Panel Layout */}
                {activeTab === "peptides" ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel - Category Navigation */}
                    <div className="lg:w-64 flex-shrink-0">
                      <div className="lg:sticky lg:top-28 space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                          Research Categories
                        </h3>
                        {peptideGroups.map((group) => {
                          const isActive = peptideGroupFilter === group.id;
                          const count = peptideGroupCounts[group.id] || 0;
                          return (
                            <button
                              key={group.id}
                              onClick={() => setPeptideGroupFilter(group.id)}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                                isActive 
                                  ? 'bg-card border shadow-sm' 
                                  : 'hover:bg-muted/50'
                              }`}
                              style={{
                                borderColor: isActive ? `${group.color}40` : 'transparent',
                                backgroundColor: isActive ? `${group.color}10` : undefined
                              }}
                              data-testid={`button-category-${group.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: group.color }}
                                />
                                <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {group.label}
                                </span>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{
                                  backgroundColor: isActive ? `${group.color}20` : undefined,
                                  color: isActive ? group.color : undefined
                                }}
                              >
                                {count}
                              </Badge>
                            </button>
                          );
                        })}

                        {/* Academy CTA */}
                        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-[#21d8ff]/20 via-[#9d4edd]/10 to-[#E7FB10]/10 border border-[#21d8ff]/50 relative overflow-hidden group hover-elevate transition-all"
                          style={{
                            boxShadow: '0 0 20px rgba(33, 216, 255, 0.4), 0 0 40px rgba(157, 78, 221, 0.2), inset 0 0 20px rgba(33, 216, 255, 0.1)'
                          }}>
                          {/* Holographic shimmer background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#21d8ff]/0 via-[#E7FB10]/20 to-[#21d8ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                              <Compass className="h-4 w-4 text-[#21d8ff]" />
                              <span className="text-xs font-bold bg-gradient-to-r from-[#21d8ff] to-[#E7FB10] bg-clip-text text-transparent">New to Peptides?</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              Start with our guided curriculum
                            </p>
                            <Link href="/academy">
                              <Button 
                                size="sm"
                                className="w-full bg-gradient-to-r from-[#21d8ff] to-[#E7FB10] text-black font-semibold text-xs transition-all duration-300 hover:bg-black hover:shadow-lg"
                                style={{
                                  backgroundImage: 'linear-gradient(to right, #21d8ff, #E7FB10)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #1a1a1f, #1a1a1f)';
                                  e.currentTarget.style.color = '#21d8ff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundImage = 'linear-gradient(to right, #21d8ff, #E7FB10)';
                                  e.currentTarget.style.color = '#000000';
                                }}
                                data-testid="button-go-to-academy"
                              >
                                Research Academy
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Article Grid */}
                    <div className="flex-1 min-w-0">
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search peptide guides..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-testid="input-search-articles"
                            className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899]/30 transition-all text-sm"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-clear-search"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div>
                          <h2 className="text-xl font-bold" style={{ color: peptideGroups.find(g => g.id === peptideGroupFilter)?.color || "#ec4899" }}>
                            {peptideGroupFilter === "all" ? "All Peptide Guides" : peptideGroups.find(g => g.id === peptideGroupFilter)?.label}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {filteredArticles.length} research guide{filteredArticles.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={peptideSort} onValueChange={(v) => setPeptideSort(v as SortOption)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs" data-testid="select-peptide-sort">
                              <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a-z"><SortAsc className="h-3 w-3 inline mr-1" /> A-Z</SelectItem>
                              <SelectItem value="z-a"><SortDesc className="h-3 w-3 inline mr-1" /> Z-A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredArticles.length > 0 ? (
                          filteredArticles.map((article) => {
                            const groupColor = peptideGroups.find(g => g.id === getPeptideGroup(article.slug || ""))?.color || "#ec4899";
                            return (
                              <Card
                                key={article.id}
                                className="p-4 cursor-pointer hover:bg-muted/30 transition-all group"
                                style={{ borderColor: `${groupColor}20` }}
                                onClick={() => handleOpenArticle(article.id)}
                                data-testid={`card-article-${article.slug || article.id}`}
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm group-hover:text-foreground transition-colors line-clamp-2">
                                      {article.title}
                                    </h4>
                                    <ChevronRight 
                                      className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" 
                                      style={{ color: groupColor }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {article.summary}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ borderColor: `${groupColor}50`, color: groupColor }}
                                    >
                                      {peptideGroups.find(g => g.id === getPeptideGroup(article.slug || ""))?.label || "Other"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {article.readTimeMinutes} min
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        ) : (
                          <Card className="p-8 text-center border-dashed border-2 col-span-2">
                            <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <h3 className="font-display text-lg font-bold mb-1">No Guides Yet</h3>
                            <p className="text-sm text-muted-foreground">
                              Research guides for this category are coming soon.
                            </p>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeTab === "general" ? (
                  /* General Education Tab - Two Panel Layout */
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel - Category Navigation */}
                    <div className="lg:w-64 flex-shrink-0">
                      <div className="lg:sticky lg:top-28 space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                          Topics
                        </h3>
                        {generalEdCategories.map((cat) => {
                          const isActive = generalEdCategoryFilter === cat.id;
                          const count = generalEdCategoryCounts[cat.id] || 0;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setGeneralEdCategoryFilter(cat.id)}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                                isActive 
                                  ? 'bg-card border shadow-sm' 
                                  : 'hover:bg-muted/50'
                              }`}
                              style={{
                                borderColor: isActive ? `${cat.color}40` : 'transparent',
                                backgroundColor: isActive ? `${cat.color}10` : undefined
                              }}
                              data-testid={`button-category-${cat.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {cat.label}
                                </span>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{
                                  backgroundColor: isActive ? `${cat.color}20` : undefined,
                                  color: isActive ? cat.color : undefined
                                }}
                              >
                                {count}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Panel - Article Grid */}
                    <div className="flex-1 min-w-0">
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search education articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-testid="input-search-articles"
                            className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#21d8ff] focus:ring-1 focus:ring-[#21d8ff]/30 transition-all text-sm"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-clear-search"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div>
                          <h2 className="text-xl font-bold" style={{ color: generalEdCategories.find(c => c.id === generalEdCategoryFilter)?.color || "#21d8ff" }}>
                            {generalEdCategoryFilter === "all" ? "All Education Articles" : generalEdCategories.find(c => c.id === generalEdCategoryFilter)?.label}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {filteredArticles.length > 0 ? (
                          filteredArticles.map((article) => {
                            const catColor = getCategoryColor(article.category);
                            return (
                              <Card
                                key={article.id}
                                className="p-4 cursor-pointer hover:bg-muted/30 transition-all group"
                                style={{ borderColor: `${catColor}20` }}
                                onClick={() => handleOpenArticle(article.id)}
                                data-testid={`card-article-${article.slug || article.id}`}
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm group-hover:text-foreground transition-colors line-clamp-2">
                                      {article.title}
                                    </h4>
                                    <ChevronRight 
                                      className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" 
                                      style={{ color: catColor }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {article.summary}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ borderColor: `${catColor}50`, color: catColor }}
                                    >
                                      {getCategoryLabel(article.category)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {article.readTimeMinutes} min
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        ) : (
                          <Card className="p-8 text-center border-dashed border-2 col-span-2">
                            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <h3 className="font-display text-lg font-bold mb-1">No Articles Yet</h3>
                            <p className="text-sm text-muted-foreground">
                              Articles for this category are coming soon.
                            </p>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Lab Guides Tab - Simple List */
                  <div>
                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search lab guides..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          data-testid="input-search-articles"
                          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-[#22c55e]">Lab Guides</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {filteredArticles.length} guide{filteredArticles.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => {
                          const catColor = getCategoryColor(article.category);
                          return (
                            <Card
                              key={article.id}
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
                          <h3 className="font-display text-xl font-bold mb-2">No Guides Yet</h3>
                          <p className="text-muted-foreground">
                            Lab guides are coming soon.
                          </p>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
