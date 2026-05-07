import { useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/seo-head";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Beaker,
  FlaskConical,
  Microscope,
  Thermometer,
  Shield,
  Droplets,
  Sparkles,
  Clock,
  Search,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { renderMarkdown } from "@/lib/render-markdown";
import type { LabNote } from "@shared/schema";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Beaker,
  FlaskConical,
  Microscope,
  Thermometer,
  Shield,
  Droplets,
  Sparkles,
  Clock,
};

const CATEGORIES = ["Testing", "Process", "Quality", "Storage"] as const;
type Category = (typeof CATEGORIES)[number];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Testing": return "#ef4444";
    case "Process": return "#21d8ff";
    case "Quality": return "#E7FB10";
    case "Storage": return "#ec4899";
    default: return "#9d4edd";
  }
};

function LabNoteCard({ note, index }: { note: LabNote; index: number }) {
  const Icon = ICON_MAP[note.iconName] ?? Beaker;
  const renderedContent = renderMarkdown(note.content);
  const publishedDate = note.publishedAt ? new Date(note.publishedAt) : null;

  return (
    <motion.div
      key={note.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: 0.05 + index * 0.04 }}
    >
      <Card
        className="p-6"
        style={{ borderColor: `${note.accentColor}30` }}
        data-testid={`card-note-${note.id}`}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${note.accentColor}20` }}
          >
            <Icon className="h-6 w-6" style={{ color: note.accentColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs"
                style={{ borderColor: getCategoryColor(note.category), color: getCategoryColor(note.category) }}
              >
                {note.category}
              </Badge>
              {publishedDate && (
                <span className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {publishedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-bold mb-2" style={{ color: note.accentColor }}>
              {note.title}
            </h3>
            <div
              className="text-muted-foreground leading-relaxed prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function LabNotesSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function LabNotes() {
  const { data: notes, isLoading, isError } = useQuery<LabNote[]>({
    queryKey: ["/api/lab-notes"],
  });

  const rawSearch = useSearch();
  const [location, setLocation] = useLocation();

  const params = useMemo(() => new URLSearchParams(rawSearch), [rawSearch]);

  const activeCategories = useMemo<Set<Category>>(() => {
    const raw = params.get("category") ?? "";
    const cats = raw.split(",").filter((c): c is Category => (CATEGORIES as readonly string[]).includes(c));
    return new Set(cats);
  }, [params]);

  const searchQuery = params.get("q") ?? "";

  const updateParams = (next: URLSearchParams) => {
    const qs = next.toString();
    setLocation(qs ? `${location.split("?")[0]}?${qs}` : location.split("?")[0], { replace: true });
  };

  const toggleCategory = (cat: Category) => {
    const next = new URLSearchParams(params);
    const current = new Set(activeCategories);
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    if (current.size > 0) {
      next.set("category", Array.from(current).join(","));
    } else {
      next.delete("category");
    }
    updateParams(next);
  };

  const setSearchQuery = (q: string) => {
    const next = new URLSearchParams(params);
    if (q.trim()) {
      next.set("q", q);
    } else {
      next.delete("q");
    }
    updateParams(next);
  };

  const clearAll = () => {
    updateParams(new URLSearchParams());
  };

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    let result = notes;

    if (activeCategories.size > 0) {
      result = result.filter((n) => activeCategories.has(n.category as Category));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q),
      );
    }

    return result;
  }, [notes, activeCategories, searchQuery]);

  const categoryCounts = useMemo(() => {
    if (!notes) return {} as Record<string, number>;
    const q = searchQuery.trim().toLowerCase();
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat] = notes.filter((n) => {
        if (n.category !== cat) return false;
        if (!q) return true;
        return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      }).length;
    }
    return counts;
  }, [notes, searchQuery]);

  const hasActiveFilters = activeCategories.size > 0 || searchQuery.trim().length > 0;

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24">
      <SEOHead title="Lab Notes" description="Technical research updates and compound insights. Stay informed with our scientific archive." canonicalPath="/guides/peptide-lab-research-archive" />
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
            Technical Insights
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-lab-notes-title">
            Research Archive
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Technical insights regarding peptide synthesis standards, third-party verification, and research protocols.
            Understanding the specifications of your research compounds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 border-[#9d4edd]/20 bg-gradient-to-br from-[#9d4edd]/5 to-transparent">
            <div className="flex items-start gap-4">
              <Beaker className="h-8 w-8 text-[#9d4edd] flex-shrink-0" />
              <div>
                <h2 className="font-display text-xl font-bold mb-2">What Is The Research Archive?</h2>
                <p className="text-muted-foreground">
                  This archive provides technical explanations regarding the industry-standard synthesis protocols,
                  third-party verification methods, and storage science for research peptides. Revive Research is a
                  specialized distributor of premium compounds; we do not manufacture these products in-house.
                  All production is handled by world-class synthesis facilities and verified by independent,
                  third-party laboratories.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
              data-testid="input-lab-notes-search"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSearchQuery("")}
                data-testid="button-clear-search"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filter:</span>
            {CATEGORIES.map((cat) => {
              const color = getCategoryColor(cat);
              const isActive = activeCategories.has(cat);
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  data-testid={`button-category-${cat.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-all duration-150"
                  style={{
                    borderColor: isActive ? color : `${color}40`,
                    color: isActive ? color : `${color}80`,
                    backgroundColor: isActive ? `${color}15` : "transparent",
                  }}
                >
                  {cat}
                  <span
                    className="inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[1.25rem] h-5 px-1"
                    style={{
                      backgroundColor: isActive ? `${color}25` : `${color}18`,
                      color: isActive ? color : `${color}99`,
                    }}
                    data-testid={`badge-count-${cat.toLowerCase()}`}
                  >
                    {count}
                  </span>
                  {isActive && <X className="h-3 w-3 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {searchQuery.trim() && (
                <Badge
                  variant="outline"
                  className="text-xs gap-1 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                  data-testid="chip-filter-search"
                >
                  &ldquo;{searchQuery.trim()}&rdquo;
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {Array.from(activeCategories).map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="text-xs gap-1 cursor-pointer"
                  style={{ borderColor: getCategoryColor(cat), color: getCategoryColor(cat) }}
                  onClick={() => toggleCategory(cat)}
                  data-testid={`chip-filter-${cat.toLowerCase()}`}
                >
                  {cat}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs h-7"
                data-testid="button-clear-all-filters"
              >
                Clear all
              </Button>
            </div>
          )}
        </motion.div>

        {isLoading && <LabNotesSkeleton />}

        {isError && (
          <div className="text-center py-12 text-muted-foreground">
            Unable to load research archive entries. Please try again later.
          </div>
        )}

        {notes && (
          <>
            {filteredNotes.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <div className="space-y-6">
                  {filteredNotes.map((note, index) => (
                    <LabNoteCard key={note.id} note={note} index={index} />
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-muted-foreground"
                data-testid="text-no-results"
              >
                {hasActiveFilters
                  ? "No notes match your current filters. Try adjusting or clearing them."
                  : "No research archive entries available yet."}
              </motion.div>
            )}
          </>
        )}

        <Separator className="my-12" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-muted-foreground">
            Have a technical question we should cover? <a href="/contact" className="text-[#21d8ff] hover:underline" data-testid="link-contact-us">Let us know</a>.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
