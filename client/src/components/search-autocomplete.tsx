import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Search, X, FlaskConical, Package, ArrowRight, Loader2, BookOpen, FileCheck, Calculator, Scale, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

interface SearchResult {
  id: string;
  type: "product" | "page";
  title: string;
  href: string;
  icon: typeof FlaskConical;
  category?: string;
  price?: string;
}

interface SearchAutocompleteProps {
  onProductSelect?: (product: Product) => void;
  className?: string;
}

// Site-wide resources for search
const siteResources: Omit<SearchResult, "id">[] = [
  { type: "page", title: "Education Center", href: "/education", icon: BookOpen, category: "Learning" },
  { type: "page", title: "Dosage Calculator", href: "/dosage-calculator", icon: Calculator, category: "Tools" },
  { type: "page", title: "COA Verification", href: "/coa", icon: FileCheck, category: "Verification" },
  { type: "page", title: "Legal & Compliance", href: "/legal", icon: Scale, category: "Info" },
  { type: "page", title: "FAQ", href: "/faq", icon: BookOpen, category: "Help" },
];

export function SearchAutocomplete({ onProductSelect, className = "" }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<any[]>({
    queryKey: ["/api/education"],
  });

  const isLoading = productsLoading || articlesLoading;

  // Filter products - only match on name and short description (not category)
  const filteredProducts = products?.filter(product => {
    const searchStr = query.toLowerCase();
    return product.name.toLowerCase().includes(searchStr) ||
           product.shortDescription?.toLowerCase().includes(searchStr);
  }).map(p => ({ ...p, id: p.id, type: "product" as const })).slice(0, 4) || [];

  // Filter articles - only match title or summary (not full content to avoid false matches)
  const filteredArticles = articles?.filter(article => {
    const searchStr = query.toLowerCase();
    const titleMatch = article.title?.toLowerCase().includes(searchStr);
    const summaryMatch = article.summary?.toLowerCase().includes(searchStr);
    return titleMatch || summaryMatch;
  }).map(a => ({ 
    id: a.slug, 
    type: "article" as const,
    title: a.title,
    href: `/education/${a.slug}`,
    icon: BookOpen,
    category: a.category || "Article"
  })).slice(0, 4) || [];

  const filteredPages = siteResources
    .filter(page =>
      page.title.toLowerCase().includes(query.toLowerCase()) ||
      page.category?.toLowerCase().includes(query.toLowerCase())
    )
    .map((p, idx) => ({ ...p, id: `page-${idx}` }))
    .slice(0, 2);

  const allResults = [...filteredProducts, ...filteredArticles, ...filteredPages];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allResults[selectedIndex]) {
          if (allResults[selectedIndex].type === "product") {
            handleSelectProduct(allResults[selectedIndex] as any);
          } else {
            setQuery("");
            setIsOpen(false);
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, selectedIndex, allResults]);

  const handleSelectProduct = (product: Product) => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    onProductSelect?.(product);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-8 bg-[#1a1a1f] border-[#2a2a32] focus:border-[#E7FB10] transition-colors text-sm"
          data-testid="input-search-autocomplete"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            data-testid="button-clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-[#1a1a1f] border border-[#2a2a32] rounded-lg shadow-xl overflow-hidden z-50 min-w-[320px]"
            data-testid="dropdown-search-results"
          >
            {isLoading ? (
              <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : allResults.length > 0 ? (
              <div className="py-2 max-h-96 overflow-y-auto">
                {allResults.map((result, index) => {
                  const isProduct = result.type === "product";
                  const isArticle = result.type === "article";
                  const Icon = (result as any).icon;
                  const title = isProduct ? (result as any).name : (result as any).title;
                  
                  return (
                    <Link
                      key={result.id}
                      href={isProduct ? `/peptides/${result.id}` : (result as any).href}
                      onClick={() => {
                        if (result.type === "product") {
                          handleSelectProduct(result as any);
                        } else {
                          setQuery("");
                          setIsOpen(false);
                        }
                      }}
                    >
                      <div
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                          index === selectedIndex 
                            ? "bg-[#E7FB10]/10" 
                            : "hover:bg-[#2a2a32]"
                        }`}
                        data-testid={`search-result-${result.id}`}
                      >
                        {isProduct ? (
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-muted to-muted/50 overflow-hidden flex-shrink-0">
                            <img 
                              src={(result as any).imageUrl || productImage} 
                              alt={title}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-white">
                            {title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {isArticle ? `Article - ${(result as any).category}` : (result as any).category}
                            </Badge>
                            {isProduct && (
                              <span className="text-xs text-[#E7FB10] font-semibold">
                                ${Number((result as any).price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center">
                <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No results for "{query}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
