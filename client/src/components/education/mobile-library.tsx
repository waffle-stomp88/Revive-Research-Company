import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  BookOpen,
  FlaskConical,
  Beaker,
  Shield,
  FileCheck,
  AlertTriangle,
  Thermometer,
  Info,
  Layers,
  Clock,
  History,
} from "lucide-react";
import type { EducationArticle, Product } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { BODY_SYSTEM_HUBS } from "@/data/body-system-hubs";
import { PEPTIDE_PATHWAYS } from "@/data/peptide-pathways";
import { resolvePrimarySystem } from "@/lib/peptide-systems";
import { useHoverCapable } from "@/hooks/use-hover-capable";

// Compound counts per system (same logic as BrowseBySystem on desktop)
const SYSTEM_PEPTIDE_COUNTS: Record<string, number> = {};
for (const data of Object.values(PEPTIDE_PATHWAYS)) {
  const sys = resolvePrimarySystem(data.systems);
  SYSTEM_PEPTIDE_COUNTS[sys] = (SYSTEM_PEPTIDE_COUNTS[sys] ?? 0) + 1;
}

// ─── Article → Body System Mapping ──────────────────────────────────────────

// Slugs explicitly linked to a system hub via relatedLabGuideSlugs (any category)
const LAB_GUIDE_SLUG_TO_SYSTEM: Record<string, string> = Object.fromEntries(
  BODY_SYSTEM_HUBS.flatMap((hub) =>
    hub.relatedLabGuideSlugs.map(({ slug }) => [slug, hub.slug])
  )
);

const PEPTIDE_GROUP_SLUGS: Record<string, string[]> = {
  metabolic: ["rr-a1", "rr-a2", "rr-a3", "aod-9604", "5-amino-1mq", "slu-pp-332"],
  "growth-hormone": ["cjc-1295", "ipamorelin", "tesamorelin", "igf-1-lr3", "igf-des"],
  "tissue-repair": ["bpc-157", "tb-500"],
  "skin-regeneration": ["ghk-cu", "glow-peptide-complex", "klow-peptide-complex", "melanotan"],
  longevity: ["epithalon", "mots-c", "nad-precursor", "thymosin-alpha-1", "thymulin", "glutathione", "vitamin-b12"],
  cognitive: ["semax", "pt-141", "dsip", "selank", "dihexa"],
  hormonal: ["hcg", "kisspeptin", "kisspeptin-54", "gonadorelin", "triptorelin", "enclomiphene", "oxytocin"],
};

const PEPTIDE_GROUP_TO_SYSTEM: Record<string, string> = {
  metabolic: "metabolic",
  "growth-hormone": "growth",
  "tissue-repair": "healing",
  "skin-regeneration": "skin",
  longevity: "longevity",
  cognitive: "cognitive",
  hormonal: "hormonal",
};

function getArticleSystemSlug(article: EducationArticle): string | null {
  const slug = article.slug || "";
  // 1. Explicit hub linkage (any category) — highest priority
  if (LAB_GUIDE_SLUG_TO_SYSTEM[slug]) return LAB_GUIDE_SLUG_TO_SYSTEM[slug];
  // 2. Peptide compound articles — match by slug fragment
  if (article.category === "peptides") {
    for (const [group, slugs] of Object.entries(PEPTIDE_GROUP_SLUGS)) {
      if (slugs.some((s) => slug.includes(s))) {
        return PEPTIDE_GROUP_TO_SYSTEM[group] ?? null;
      }
    }
  }
  return null;
}

function isArticleInStock(article: EducationArticle, products: Product[]): boolean {
  if (!article.slug?.startsWith("what-is-")) return false;
  if (article.slug === "what-is-melanotan-peptide") {
    return products.some(
      (p) =>
        p.name.toLowerCase().includes("melanotan i") ||
        p.name.toLowerCase().includes("melanotan 1") ||
        p.name.toLowerCase().includes("melanotan ii") ||
        p.name.toLowerCase().includes("melanotan 2")
    );
  }
  const peptideName = article.slug
    .replace("what-is-", "")
    .replace(/-peptide$/, "")
    .replace(/-/g, " ")
    .toLowerCase();
  return products.some((p) => {
    const pName = p.name.toLowerCase();
    const pNameClean = pName.replace(/[^a-z0-9]/g, " ").trim();
    return (
      pName.includes(peptideName) ||
      peptideName.includes(pName) ||
      pNameClean.includes(peptideName) ||
      peptideName.includes(pNameClean)
    );
  });
}

// ─── Poster Name Art Splitting ───────────────────────────────────────────────

function splitPosterName(slug: string): { top: string; bottom: string } {
  const raw = slug
    .replace(/^what-is-/, "")
    .replace(/-(peptide|compound|supplement|complex|precursor|molecule)$/, "");

  // Convert slug segments to display name: "bpc-157" → "BPC-157"
  const parts = raw.split("-");
  const name = parts
    .map((p) => {
      // If the segment is numeric, keep as-is; otherwise uppercase
      return /^\d+$/.test(p) ? p : p.toUpperCase();
    })
    .join("-");

  // Split at first hyphen-number boundary: "BPC-157" → ["BPC", "-157"]
  const hyphenNumMatch = name.match(/^([A-Z]+)(-\d.*)$/);
  if (hyphenNumMatch) return { top: hyphenNumMatch[1], bottom: hyphenNumMatch[2] };

  // Split at first hyphen: "GHK-CU" → ["GHK", "-CU"]
  const firstHyphen = name.indexOf("-");
  if (firstHyphen > 0 && firstHyphen < name.length - 1) {
    return {
      top: name.substring(0, firstHyphen),
      bottom: name.substring(firstHyphen),
    };
  }

  // Single word — no split
  if (name.length > 6) {
    const mid = Math.ceil(name.length / 2);
    return { top: name.substring(0, mid), bottom: name.substring(mid) };
  }
  return { top: name, bottom: "" };
}

// ─── Trust & Verification static guides ──────────────────────────────────────

const TRUST_GUIDES = [
  { slug: "are-peptide-coas-trustworthy", title: "Are Peptide COAs Trustworthy?", description: "What COAs prove, their limitations, and how to evaluate quality claims.", href: "/guides/are-peptide-coas-trustworthy", icon: FileCheck, color: "#9d4edd", readTime: 8 },
  { slug: "how-batch-testing-works", title: "How Batch Testing Works", description: "Why no one tests every vial and what this means for quality.", href: "/guides/how-batch-testing-works", icon: Beaker, color: "#21d8ff", readTime: 7 },
  { slug: "what-research-use-only-means", title: "What 'Research Use Only' Means", description: "Clear explanation of RUO labeling and compliance.", href: "/guides/what-research-use-only-means", icon: AlertTriangle, color: "#22c55e", readTime: 6 },
  { slug: "how-to-verify-peptide-quality", title: "How to Verify Peptide Quality", description: "Independent verification without trusting the seller.", href: "/guides/how-to-verify-peptide-quality", icon: Search, color: "#ec4899", readTime: 9 },
  { slug: "peptide-purity-explained", title: "What Purity Percentages Mean", description: "Understanding HPLC results and why higher isn't always better.", href: "/guides/peptide-purity-explained", icon: FlaskConical, color: "#f97316", readTime: 7 },
  { slug: "why-cheap-peptides-are-cheap", title: "Why Cheap Peptides Are Cheap", description: "Where low-price vendors cut corners and when price matters.", href: "/guides/why-cheap-peptides-are-cheap", icon: Shield, color: "#E7FB10", readTime: 8 },
];

// ─── Section definitions ──────────────────────────────────────────────────────

const STATIC_SECTIONS = [
  { id: "general", label: "General Education", color: "#21d8ff", icon: BookOpen, categories: ["basics", "storage", "glossary"] },
  { id: "lab-guides", label: "Lab Guides", color: "#22c55e", icon: Beaker, categories: ["safety"] },
  { id: "trust", label: "Trust & Verification", color: "#9d4edd", icon: Shield, categories: [] },
];

const POPULAR_SEARCHES = ["BPC-157", "TB-500", "Ipamorelin", "Semax"];

// ─── Continue Reading — localStorage helpers ──────────────────────────────────

const CONTINUE_READING_KEY = "revive-edu-recent";
const MAX_RECENT = 5;

export function trackArticleOpen(articleId: string) {
  try {
    const raw = localStorage.getItem(CONTINUE_READING_KEY);
    const recent: string[] = raw ? JSON.parse(raw) : [];
    const updated = [articleId, ...recent.filter((id) => id !== articleId)].slice(0, MAX_RECENT);
    localStorage.setItem(CONTINUE_READING_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

function getRecentArticleIds(): string[] {
  try {
    const raw = localStorage.getItem(CONTINUE_READING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ─── ArticlePosterCard ────────────────────────────────────────────────────────

interface PosterCardProps {
  article: EducationArticle;
  systemColor: string;
  inStock: boolean;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
}

function ArticlePosterCard({ article, systemColor, inStock, onSelect, reducedMotion }: PosterCardProps) {
  const { top, bottom } = splitPosterName(article.slug || article.title);
  const isPeptide = article.category === "peptides";

  return (
    <motion.button
      className="relative flex-shrink-0 rounded-lg overflow-hidden cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-white/30"
      style={{
        width: 140,
        height: 195,
        background: `linear-gradient(135deg, ${systemColor}22 0%, ${systemColor}0a 50%, #111116 100%)`,
        border: `1px solid ${systemColor}30`,
      }}
      whileTap={reducedMotion ? {} : { scale: 0.96 }}
      onClick={() => onSelect(article.id)}
      data-testid={`poster-card-${article.slug || article.id}`}
    >
      {/* In Stock badge */}
      {inStock && (
        <div
          className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide"
          style={{ backgroundColor: "#21d8ff18", color: "#21d8ff", border: "1px solid #21d8ff40" }}
        >
          In Stock
        </div>
      )}

      {/* Typographic art */}
      <div className="absolute inset-0 flex flex-col items-start justify-center px-3 pb-12">
        <span
          className="leading-none font-display select-none block"
          style={{
            fontSize: top.length > 5 ? 32 : top.length > 3 ? 38 : 46,
            color: "#E7FB10",
            fontFamily: "'Bebas Neue', cursive",
            lineHeight: 1,
            textShadow: `0 0 20px ${systemColor}60`,
          }}
        >
          {top}
        </span>
        {bottom && (
          <span
            className="leading-none font-display select-none block mt-0.5"
            style={{
              fontSize: bottom.length > 5 ? 22 : bottom.length > 3 ? 26 : 30,
              color: "#ffffff",
              fontFamily: "'Bebas Neue', cursive",
              lineHeight: 1,
            }}
          >
            {bottom}
          </span>
        )}
      </div>

      {/* Gradient overlay at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{ background: "linear-gradient(to top, #111116 60%, transparent 100%)" }}
      />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-xs font-semibold text-white leading-tight line-clamp-2 mb-1">
          {article.title}
        </p>
        {isPeptide && (
          <span
            className="inline-block text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: `${systemColor}25`, color: systemColor }}
          >
            {article.readTimeMinutes} min
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ─── TrustPosterCard ──────────────────────────────────────────────────────────

function TrustPosterCard({ guide, reducedMotion }: { guide: (typeof TRUST_GUIDES)[0]; reducedMotion: boolean }) {
  const Icon = guide.icon;
  const [, setLocation] = useLocation();

  return (
    <motion.button
      className="relative flex-shrink-0 rounded-lg overflow-hidden cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-white/30"
      style={{
        width: 140,
        height: 195,
        background: `linear-gradient(135deg, ${guide.color}20 0%, ${guide.color}08 50%, #111116 100%)`,
        border: `1px solid ${guide.color}30`,
      }}
      whileTap={reducedMotion ? {} : { scale: 0.96 }}
      onClick={() => setLocation(guide.href)}
      data-testid={`poster-card-trust-${guide.slug}`}
    >
      {/* Icon art */}
      <div className="absolute inset-0 flex items-center justify-center pb-14">
        <Icon
          style={{ color: guide.color, width: 48, height: 48, opacity: 0.7 }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{ background: "linear-gradient(to top, #111116 60%, transparent 100%)" }}
      />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-[10px] font-semibold text-white leading-tight line-clamp-2 mb-1">
          {guide.title}
        </p>
        <span
          className="inline-block text-[9px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: `${guide.color}25`, color: guide.color }}
        >
          {guide.readTime} min
        </span>
      </div>
    </motion.button>
  );
}

// ─── NonPeptidePosterCard ─────────────────────────────────────────────────────

function NonPeptidePosterCard({ article, sectionColor, sectionIcon: SectionIcon, onSelect, reducedMotion }: {
  article: EducationArticle;
  sectionColor: string;
  sectionIcon: typeof BookOpen;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
}) {
  return (
    <motion.button
      className="relative flex-shrink-0 rounded-lg overflow-hidden cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-white/30"
      style={{
        width: 140,
        height: 195,
        background: `linear-gradient(135deg, ${sectionColor}1e 0%, ${sectionColor}08 50%, #111116 100%)`,
        border: `1px solid ${sectionColor}28`,
      }}
      whileTap={reducedMotion ? {} : { scale: 0.96 }}
      onClick={() => onSelect(article.id)}
      data-testid={`poster-card-${article.slug || article.id}`}
    >
      <div className="absolute inset-0 flex items-center justify-center pb-14">
        <SectionIcon style={{ color: sectionColor, width: 44, height: 44, opacity: 0.55 }} />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{ background: "linear-gradient(to top, #111116 60%, transparent 100%)" }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-xs font-semibold text-white leading-tight line-clamp-2 mb-1">
          {article.title}
        </p>
        <span
          className="inline-block text-[9px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: `${sectionColor}25`, color: sectionColor }}
        >
          {article.readTimeMinutes} min
        </span>
      </div>
    </motion.button>
  );
}

// ─── MobileLibraryShelf ───────────────────────────────────────────────────────

interface ShelfProps {
  label: string;
  color: string;
  articles?: EducationArticle[];
  trustGuides?: typeof TRUST_GUIDES;
  products: Product[];
  systemSlug?: string;
  sectionId?: string;
  sectionIcon?: typeof BookOpen;
  onArticleSelect: (id: string) => void;
  onSeeAll: (key: string) => void;
  animDelay: number;
  reducedMotion: boolean;
}

function MobileLibraryShelf({
  label,
  color,
  articles = [],
  trustGuides = [],
  products,
  systemSlug,
  sectionId,
  sectionIcon,
  onArticleSelect,
  onSeeAll,
  animDelay,
  reducedMotion,
}: ShelfProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const count = articles.length + trustGuides.length;
  const seeAllKey = systemSlug ?? sectionId ?? label;

  if (count === 0) return null;

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: animDelay }}
      className="mb-6"
    >
      {/* Shelf header */}
      <div
        className="flex items-center gap-3 mb-3 pl-3"
        style={{ borderLeft: `2px solid ${color}` }}
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground leading-none">{label}</span>
          <Badge
            className="ml-2 text-[9px] py-0 leading-none"
            style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
          >
            {count} article{count !== 1 ? "s" : ""}
          </Badge>
        </div>
        <button
          className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0 hover:text-foreground transition-colors"
          onClick={() => onSeeAll(seeAllKey)}
          data-testid={`shelf-see-all-${seeAllKey}`}
        >
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Scrollable row */}
      <div
        ref={rowRef}
        data-scroll-no-bar
        className="flex gap-3 overflow-x-auto pl-3 pr-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        <style>{`[data-scroll-no-bar]::-webkit-scrollbar { display: none; }`}</style>
        {articles.map((article) => {
          const systemSlugForArticle = getArticleSystemSlug(article);
          const hub = BODY_SYSTEM_HUBS.find((h) => h.slug === (systemSlug ?? systemSlugForArticle));
          const cardColor = hub?.color ?? (sectionIcon ? color : "#9d4edd");
          const inStock = isArticleInStock(article, products);

          if (article.category === "peptides") {
            return (
              <ArticlePosterCard
                key={article.id}
                article={article}
                systemColor={hub?.color ?? color}
                inStock={inStock}
                onSelect={onArticleSelect}
                reducedMotion={reducedMotion}
              />
            );
          }
          return (
            <NonPeptidePosterCard
              key={article.id}
              article={article}
              sectionColor={cardColor}
              sectionIcon={sectionIcon ?? BookOpen}
              onSelect={onArticleSelect}
              reducedMotion={reducedMotion}
            />
          );
        })}
        {trustGuides.map((guide) => (
          <TrustPosterCard key={guide.slug} guide={guide} reducedMotion={reducedMotion} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── MobileLibraryHero ────────────────────────────────────────────────────────

const HERO_ROTATE_MS = 8000;

const HERO_PRIORITY_SLUGS = [
  "what-is-bpc-157-peptide",
  "what-is-semax-peptide",
  "what-is-epithalon-peptide",
  "ipamorelin-peptide-guide",
  "what-is-ghk-cu-peptide",
  "what-is-tb-500-peptide",
];

interface HeroProps {
  articles: EducationArticle[];
  articleVisuals: Record<string, () => JSX.Element>;
  onArticleSelect: (id: string) => void;
}

function MobileLibraryHero({ articles, articleVisuals, onArticleSelect }: HeroProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featured = useMemo(() => {
    const picks: EducationArticle[] = [];
    for (const slug of HERO_PRIORITY_SLUGS) {
      if (picks.length >= 3) break;
      const found = articles.find((a) => a.slug === slug);
      if (found && !picks.find((p) => p.id === found.id)) picks.push(found);
    }
    const usedSystems = new Set(picks.map((a) => getArticleSystemSlug(a)));
    for (const a of articles) {
      if (picks.length >= 3) break;
      if (picks.find((p) => p.id === a.id)) continue;
      const sys = getArticleSystemSlug(a);
      if (!usedSystems.has(sys) && articleVisuals[a.slug ?? ""]) {
        picks.push(a);
        usedSystems.add(sys);
      }
    }
    for (const a of articles) {
      if (picks.length >= 3) break;
      if (!picks.find((p) => p.id === a.id)) picks.push(a);
    }
    return picks.slice(0, 3);
  }, [articles, articleVisuals]);

  useEffect(() => {
    if (featured.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % featured.length);
      setTimerKey((k) => k + 1);
    }, HERO_ROTATE_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [featured.length]);

  const jumpTo = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveIdx(idx);
    setTimerKey((k) => k + 1);
    if (featured.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % featured.length);
        setTimerKey((k) => k + 1);
      }, HERO_ROTATE_MS);
    }
  };

  if (featured.length === 0) return null;

  const article = featured[activeIdx];
  const Visual = article.slug ? articleVisuals[article.slug] : null;
  const systemSlug = getArticleSystemSlug(article);
  const hub = BODY_SYSTEM_HUBS.find((h) => h.slug === systemSlug);
  const accentColor = hub?.color ?? "#21d8ff";
  const systemLabel = hub ? hub.name.split(" & ")[0].toUpperCase() : "FEATURED";

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-5"
      style={{
        minHeight: 262,
        boxShadow: `0 0 0 1px ${accentColor}35, 0 12px 48px ${accentColor}20`,
        transition: "box-shadow 0.55s ease",
      }}
      data-testid="mobile-library-hero"
    >
      {/* ── Animated background layers (crossfade on slide change) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={article.id + "-bg"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {/* 1. Base dark */}
          <div className="absolute inset-0" style={{ backgroundColor: "#0b0b10" }} />

          {/* 2. Vivid radial glow in system accent color */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 80% at 75% 25%, ${accentColor}40 0%, ${accentColor}12 45%, transparent 70%)`,
            }}
          />

          {/* 3. SVG molecular art — the hero's "imagery" */}
          {Visual && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ opacity: 0.45, transform: "scale(1.08) translateX(8%)", filter: "blur(0.3px)" }}
              aria-hidden
            >
              <Visual />
            </div>
          )}

          {/* 4. Left-side readability gradient */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, #0b0b10 0%, #0b0b10aa 35%, transparent 65%)" }}
          />

          {/* 5. Bottom readability gradient */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, #0b0b10 0%, #0b0b10cc 28%, transparent 60%)" }}
          />

          {/* 6. Top-edge neon stripe */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, ${accentColor} 30%, ${accentColor} 70%, transparent 100%)`,
              opacity: 0.9,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Content layer (slides up/down on change) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={article.id + "-content"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative z-10 p-5 flex flex-col justify-between"
          style={{ minHeight: 262 }}
        >
          {/* Top: system badge */}
          <div>
            <span
              className="inline-block text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
                border: `1px solid ${accentColor}45`,
              }}
            >
              {systemLabel}
            </span>
          </div>

          {/* Bottom: title, summary, CTA + dots */}
          <div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 46,
                lineHeight: 1,
                color: "#F0F0EB",
                textShadow: `0 0 40px ${accentColor}55, 0 2px 16px rgba(0,0,0,0.9)`,
                marginBottom: 8,
                letterSpacing: "0.01em",
              }}
            >
              {article.title
                .replace(/^What is\s+/i, "")
                .replace(/\s*[:\-–]\s*Peptide\b.*$/i, "")
                .replace(/\s*Research Guide$/i, "")
                .replace(/\s*Peptide\s*Research\s*Guide$/i, "")
                .trim()}
            </h2>

            {article.summary && (
              <p
                className="text-xs line-clamp-2 mb-2"
                style={{ color: "rgba(255,255,255,0.60)", maxWidth: 255 }}
              >
                {article.summary}
              </p>
            )}

            {/* Read time */}
            {(article.readTimeMinutes ?? 0) > 0 && (
              <div className="flex items-center gap-1 mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
                <Clock className="h-3 w-3" />
                <span className="text-[10px]">{article.readTimeMinutes} min read</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold shrink-0"
                style={{ backgroundColor: accentColor, color: "#0b0b10" }}
                onClick={() => onArticleSelect(article.id)}
                data-testid="hero-read-button"
              >
                Read Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>

              {/* Animated progress dots */}
              {featured.length > 1 && (
                <div className="flex items-center gap-2" role="tablist" aria-label="Featured article slides">
                  {featured.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === activeIdx}
                      onClick={() => jumpTo(i)}
                      className="relative rounded-full overflow-hidden transition-all duration-350"
                      style={{
                        height: 3,
                        width: i === activeIdx ? 34 : 10,
                        backgroundColor: i === activeIdx ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                      }}
                      data-testid={`hero-dot-${i}`}
                    >
                      {i === activeIdx && (
                        <motion.div
                          key={timerKey}
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ backgroundColor: accentColor }}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: HERO_ROTATE_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── DrillDown (See All) view ─────────────────────────────────────────────────

interface DrillDownProps {
  label: string;
  color: string;
  articles: EducationArticle[];
  trustGuides: typeof TRUST_GUIDES;
  products: Product[];
  hubSlug?: string;
  onBack: () => void;
  onArticleSelect: (id: string) => void;
}

function DrillDownView({
  label,
  color,
  articles,
  trustGuides,
  products,
  hubSlug,
  onBack,
  onArticleSelect,
}: DrillDownProps) {
  const [, setLocation] = useLocation();
  const hub = hubSlug ? BODY_SYSTEM_HUBS.find((h) => h.slug === hubSlug) : null;

  return (
    <div>
      <button
        className="flex items-center gap-2 text-sm text-muted-foreground mb-4 mt-1"
        onClick={onBack}
        data-testid="drilldown-back"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-center gap-2 mb-3 pl-3" style={{ borderLeft: `2px solid ${color}` }}>
        <h2 className="text-base font-semibold text-foreground">{label}</h2>
        <Badge
          className="text-[9px]"
          style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
        >
          {articles.length + trustGuides.length}
        </Badge>
      </div>

      {hub && (
        <p
          className="text-[11px] italic text-muted-foreground mb-3 ml-3 leading-relaxed"
          data-testid={`drilldown-hub-teaser-${hub.slug}`}
        >
          {hub.tagline}
        </p>
      )}

      {hubSlug && (
        <button
          className="flex items-center gap-1.5 text-xs font-medium mb-5 ml-3"
          style={{ color }}
          onClick={() => setLocation(`/systems/${hubSlug}`)}
          data-testid={`drilldown-system-guide-link-${hubSlug}`}
        >
          View full system guide
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="space-y-2">
        {articles.map((article) => {
          const inStock = isArticleInStock(article, products);
          return (
            <button
              key={article.id}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border hover-elevate transition-all"
              onClick={() => onArticleSelect(article.id)}
              data-testid={`drilldown-article-${article.slug || article.id}`}
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <FlaskConical className="h-4 w-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{article.title}</p>
                <p className="text-[11px] text-muted-foreground">{article.readTimeMinutes} min read</p>
              </div>
              {inStock && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: "#21d8ff18", color: "#21d8ff", border: "1px solid #21d8ff30" }}
                >
                  In Stock
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" style={{ color }} />
            </button>
          );
        })}
        {trustGuides.map((guide) => (
          <button
            key={guide.slug}
            className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border hover-elevate transition-all"
            onClick={() => setLocation(guide.href)}
            data-testid={`drilldown-trust-${guide.slug}`}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${guide.color}18` }}
            >
              <guide.icon className="h-4 w-4" style={{ color: guide.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">{guide.title}</p>
              <p className="text-[11px] text-muted-foreground">{guide.readTime} min read</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" style={{ color: guide.color }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Search Results ───────────────────────────────────────────────────────────

/** Returns JSX with query matches wrapped in a highlighted <mark>-style span. */
function highlightText(text: string, query: string, accentColor: string): JSX.Element {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={i}
            style={{
              backgroundColor: `${accentColor}30`,
              color: accentColor,
              borderRadius: 2,
              padding: "0 1px",
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

function SearchResults({
  query,
  articles,
  products,
  onArticleSelect,
}: {
  query: string;
  articles: EducationArticle[];
  products: Product[];
  onArticleSelect: (id: string) => void;
}) {
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.summary || "").toLowerCase().includes(q)
    );
  }, [articles, query]);

  // Group by body system
  const grouped = useMemo(() => {
    const map: Record<string, { label: string; color: string; articles: EducationArticle[] }> = {};
    for (const a of results) {
      const slug = getArticleSystemSlug(a);
      const key = slug ?? "general";
      if (!map[key]) {
        const hub = BODY_SYSTEM_HUBS.find((h) => h.slug === slug);
        const section = STATIC_SECTIONS.find((s) => s.categories.includes(a.category));
        map[key] = {
          label: hub?.name ?? section?.label ?? "General",
          color: hub?.color ?? section?.color ?? "#9d4edd",
          articles: [],
        };
      }
      map[key].articles.push(a);
    }
    return Object.entries(map);
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        No articles found for &ldquo;{query}&rdquo;
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
      </p>
      {grouped.map(([key, group]) => (
        <div key={key}>
          <div className="flex items-center gap-2 mb-2 pl-3" style={{ borderLeft: `2px solid ${group.color}` }}>
            <span className="text-xs font-semibold text-foreground">{group.label}</span>
          </div>
          <div className="space-y-1.5">
            {group.articles.map((article) => (
              <button
                key={article.id}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border hover-elevate transition-all"
                onClick={() => onArticleSelect(article.id)}
                data-testid={`search-result-${article.slug || article.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {highlightText(article.title, query, group.color)}
                  </p>
                  {article.summary && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {highlightText(article.summary, query, group.color)}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" style={{ color: group.color }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ContinueReadingShelf ────────────────────────────────────────────────────

interface ContinueReadingShelfProps {
  articles: EducationArticle[];
  products: Product[];
  recentIds: string[];
  onArticleSelect: (id: string) => void;
  reducedMotion: boolean;
}

function ContinueReadingShelf({ articles, products, recentIds, onArticleSelect, reducedMotion }: ContinueReadingShelfProps) {
  const recentArticles = recentIds
    .map((id) => articles.find((a) => a.id === id))
    .filter(Boolean) as EducationArticle[];

  if (recentArticles.length === 0) return null;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-5"
      data-testid="continue-reading-shelf"
    >
      <div className="flex items-center gap-2 mb-3">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Continue Reading
        </span>
      </div>
      <div
        className="flex gap-3 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        data-scroll-no-bar
      >
        <style>{`[data-scroll-no-bar]::-webkit-scrollbar { display: none; }`}</style>
        {recentArticles.map((article) => {
          const systemSlug = getArticleSystemSlug(article);
          const hub = BODY_SYSTEM_HUBS.find((h) => h.slug === systemSlug);
          const color = hub?.color ?? "#21d8ff";
          const inStock = isArticleInStock(article, products);
          return (
            <div key={article.id} className="flex flex-col flex-shrink-0" style={{ width: 140 }}>
              <ArticlePosterCard
                article={article}
                systemColor={color}
                inStock={inStock}
                onSelect={onArticleSelect}
                reducedMotion={reducedMotion}
              />
              <div
                style={{
                  height: 2,
                  marginTop: 3,
                  borderRadius: 2,
                  background: `linear-gradient(to right, ${color}, ${color}50)`,
                  boxShadow: `0 0 6px ${color}80`,
                }}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── MobileBodySystemScroll ──────────────────────────────────────────────────

function MobileBodySystemScroll({ inStockCountPerSystem }: { inStockCountPerSystem: Record<string, number> }) {
  const reducedMotion = !useHoverCapable();

  const visibleHubs = BODY_SYSTEM_HUBS.filter(
    (h) => (SYSTEM_PEPTIDE_COUNTS[h.slug] ?? 0) > 0
  );

  if (visibleHubs.length === 0) return null;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mb-6"
      data-testid="mobile-body-system-scroll"
    >
      {/* Section header */}
      <div className="mb-4 pl-3" style={{ borderLeft: "2px solid #E7FB10" }}>
        <h2 className="text-xl font-bold mb-0.5">Browse by Body System</h2>
        <p className="text-xs text-muted-foreground">
          Explore all {Object.keys(PEPTIDE_PATHWAYS).length} compounds organized by research application
        </p>
      </div>

      {/* Horizontal side-scroll row — ~2.3 cards visible to signal more */}
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        data-testid="body-system-card-list"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {visibleHubs.map((hub, i) => {
          const Icon = hub.icon;
          const count = SYSTEM_PEPTIDE_COUNTS[hub.slug] ?? 0;
          const inStockCount = inStockCountPerSystem[hub.slug] ?? 0;

          return (
            <motion.div
              key={hub.slug}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
              className="shrink-0"
              style={{ width: "42vw", maxWidth: 170 }}
            >
              <Link href={`/systems/${hub.slug}`}>
                <div
                  className="hover-elevate rounded-lg border border-border bg-card p-3 cursor-pointer flex flex-col gap-2.5 h-full"
                  data-testid={`body-system-card-${hub.slug}`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${hub.color}18` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: hub.color }} />
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5 px-1.5">
                      {count}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-xs leading-snug">{hub.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">{hub.tagline}</span>
                  </div>
                  {inStockCount > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] text-emerald-500">{inStockCount} in stock</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── MobileLibraryHome ────────────────────────────────────────────────────────

export interface MobileLibraryHomeProps {
  articles: EducationArticle[];
  products: Product[];
  onArticleSelect: (id: string) => void;
  articleVisuals: Record<string, () => JSX.Element>;
}

export function MobileLibraryHome({ articles, products, onArticleSelect, articleVisuals }: MobileLibraryHomeProps) {
  const reducedMotion = !useHoverCapable();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [drillDownKey, setDrillDownKey] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>(() => getRecentArticleIds());
  const searchRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

  // ── Fetch server-side recent IDs on mount for authenticated users ────────
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/article-views/recent?limit=5", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { ids: string[] } | null) => {
        if (!data?.ids) return;
        // Merge server IDs with localStorage, server order takes priority
        const local = getRecentArticleIds();
        const merged = [
          ...data.ids,
          ...local.filter((id) => !data.ids.includes(id)),
        ].slice(0, MAX_RECENT);
        setRecentIds(merged);
        // Persist merged list back to localStorage
        try {
          localStorage.setItem(CONTINUE_READING_KEY, JSON.stringify(merged));
        } catch { /* ignore */ }
      })
      .catch(() => { /* ignore */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Track opens → localStorage + server ─────────────────────────────────

  const handleArticleOpen = useCallback((id: string) => {
    trackArticleOpen(id);
    setRecentIds(getRecentArticleIds());
    // Fire-and-forget server sync for authenticated users
    if (isAuthenticated) {
      fetch("/api/article-views", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id }),
      }).catch(() => { /* ignore */ });
    }
    onArticleSelect(id);
  }, [isAuthenticated, onArticleSelect]);

  // ── In-stock count per system ────────────────────────────────────────────

  const inStockCountPerSystem = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const article of articles) {
      if (isArticleInStock(article, products)) {
        const sys = getArticleSystemSlug(article);
        if (sys) counts[sys] = (counts[sys] ?? 0) + 1;
      }
    }
    return counts;
  }, [articles, products]);

  // ── Build shelves ─────────────────────────────────────────────────────────

  const systemShelves = useMemo(() => {
    return BODY_SYSTEM_HUBS.map((hub) => {
      const hubArticles = articles.filter((a) => {
        const sys = getArticleSystemSlug(a);
        return sys === hub.slug;
      });
      return { hub, articles: hubArticles };
    }).filter((s) => s.articles.length > 0);
  }, [articles]);

  const staticShelves = useMemo(() => {
    return STATIC_SECTIONS.map((section) => {
      const sectionArticles =
        section.id === "trust"
          ? []
          : articles.filter((a) => section.categories.includes(a.category));
      const trustGuides = section.id === "trust" ? TRUST_GUIDES : [];
      return { section, articles: sectionArticles, trustGuides };
    }).filter((s) => s.articles.length + s.trustGuides.length > 0);
  }, [articles]);

  // ── Drill-down data ───────────────────────────────────────────────────────

  const drillDownData = useMemo(() => {
    if (!drillDownKey) return null;
    // System drill-down
    const hub = BODY_SYSTEM_HUBS.find((h) => h.slug === drillDownKey);
    if (hub) {
      const hubArticles = articles.filter((a) => getArticleSystemSlug(a) === hub.slug);
      return { label: hub.name, color: hub.color, articles: hubArticles, trustGuides: [] as typeof TRUST_GUIDES };
    }
    // Static section drill-down
    const section = STATIC_SECTIONS.find((s) => s.id === drillDownKey);
    if (section) {
      const sectionArticles =
        section.id === "trust"
          ? []
          : articles.filter((a) => section.categories.includes(a.category));
      const trustGuides = section.id === "trust" ? TRUST_GUIDES : [];
      return { label: section.label, color: section.color, articles: sectionArticles, trustGuides };
    }
    return null;
  }, [drillDownKey, articles]);

  const isSearching = searchQuery.trim().length > 0;
  const showPopularPills = searchFocused && !isSearching;

  const handleClearSearch = () => {
    setSearchQuery("");
    searchRef.current?.blur();
    setSearchFocused(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative" data-testid="mobile-library-home">
      {/* Sticky search bar */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm pb-3 pt-1 -mx-4 px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#21d8ff]/60 focus:ring-1 focus:ring-[#21d8ff]/30 transition-all"
            data-testid="input-mobile-library-search"
          />
          {(isSearching || searchFocused) && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onMouseDown={(e) => { e.preventDefault(); handleClearSearch(); }}
              data-testid="button-mobile-library-search-clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Popular search pills */}
        <AnimatePresence>
          {showPopularPills && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 mt-2 overflow-hidden flex-wrap"
            >
              <span className="text-[10px] text-muted-foreground self-center">Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all"
                  onMouseDown={(e) => { e.preventDefault(); setSearchQuery(term); setSearchFocused(false); }}
                  data-testid={`popular-search-${term.replace(/-/g, "")}`}
                >
                  {term}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {isSearching ? (
          <motion.div
            key="search-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SearchResults
              query={searchQuery}
              articles={articles}
              products={products}
              onArticleSelect={handleArticleOpen}
            />
          </motion.div>
        ) : drillDownKey && drillDownData ? (
          <motion.div
            key={`drilldown-${drillDownKey}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <DrillDownView
              label={drillDownData.label}
              color={drillDownData.color}
              articles={drillDownData.articles}
              trustGuides={drillDownData.trustGuides}
              products={products}
              hubSlug={BODY_SYSTEM_HUBS.some((h) => h.slug === drillDownKey) ? drillDownKey : undefined}
              onBack={() => setDrillDownKey(null)}
              onArticleSelect={handleArticleOpen}
            />
          </motion.div>
        ) : (
          <motion.div
            key="shelf-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Hero banner — rotating, at the very top */}
            <MobileLibraryHero
              articles={articles}
              articleVisuals={articleVisuals}
              onArticleSelect={handleArticleOpen}
            />

            {/* Continue Reading — only shown after at least one article opened */}
            <ContinueReadingShelf
              articles={articles}
              products={products}
              recentIds={recentIds}
              onArticleSelect={handleArticleOpen}
              reducedMotion={reducedMotion}
            />

            {/* Body Systems — 2-col grid navigating to /systems/:slug */}
            <MobileBodySystemScroll inStockCountPerSystem={inStockCountPerSystem} />

            {/* System shelves */}
            {systemShelves.map(({ hub, articles: shelfArticles }, i) => (
              <MobileLibraryShelf
                key={hub.slug}
                label={hub.name}
                color={hub.color}
                articles={shelfArticles}
                products={products}
                systemSlug={hub.slug}
                onArticleSelect={handleArticleOpen}
                onSeeAll={setDrillDownKey}
                animDelay={i * 0.06}
                reducedMotion={reducedMotion}
              />
            ))}

            {/* Static section shelves */}
            {staticShelves.map(({ section, articles: sectionArticles, trustGuides }, i) => {
              const Icon = section.icon;
              return (
                <MobileLibraryShelf
                  key={section.id}
                  label={section.label}
                  color={section.color}
                  articles={sectionArticles}
                  trustGuides={trustGuides}
                  products={products}
                  sectionId={section.id}
                  sectionIcon={Icon}
                  onArticleSelect={handleArticleOpen}
                  onSeeAll={setDrillDownKey}
                  animDelay={(systemShelves.length + i) * 0.06}
                  reducedMotion={reducedMotion}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
