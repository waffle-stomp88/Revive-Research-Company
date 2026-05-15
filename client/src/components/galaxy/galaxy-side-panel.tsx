import { Link } from "wouter";
import { X, ExternalLink, ArrowRight, Activity, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type GalaxyNode,
  getStacksForPeptide,
} from "@/lib/galaxy-layout";
import { type KnownStack } from "@/lib/synergy-data";

const SYSTEM_GUIDE_LINKS: Record<string, { href: string; label: string }> = {
  healing: {
    href: "/guides/healing-peptides",
    label: "Tissue Repair & Healing Peptide Guide",
  },
  metabolic: {
    href: "/guides/metabolic-peptides",
    label: "AMPK, GLP-1 & Metabolic Peptide Guide",
  },
  growth: {
    href: "/guides/growth-hormone-peptides",
    label: "GH Secretagogue & Growth Hormone Peptide Guide",
  },
  cognitive: {
    href: "/guides/cognitive-peptides",
    label: "Neurotrophic & Cognitive Peptide Guide",
  },
  skin: {
    href: "/guides/skin-peptides",
    label: "Collagen & Skin Peptide Guide",
  },
  longevity: {
    href: "/guides/longevity-peptides",
    label: "Telomere & Longevity Peptide Guide",
  },
  hormonal: {
    href: "/guides/hormonal-peptides",
    label: "HPG Axis & Hormonal Peptide Guide",
  },
};

interface GalaxySidePanelProps {
  node: GalaxyNode | null;
  onClose: () => void;
  knownStacks?: KnownStack[];
}

export function GalaxySidePanel({ node, onClose, knownStacks }: GalaxySidePanelProps) {
  if (!node) return null;

  const stacks = getStacksForPeptide(node.id, knownStacks);
  const accentColor = node.color;
  const borderColor = `${accentColor}60`;
  const cornerColor = `${accentColor}b3`;

  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 26, stiffness: 220 }}
      className="absolute top-24 md:top-28 bottom-0 right-0 w-full max-w-md backdrop-blur-sm z-30 overflow-y-auto"
      style={{
        background: "rgba(0,0,0,0.95)",
        borderLeft: `2px solid ${borderColor}`,
        borderTop: `1px solid ${borderColor}`,
      }}
      data-testid="galaxy-side-panel"
    >
      {/* Scan-line overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.018) 2px, rgba(255,255,255,0.018) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Corner decorations */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          width: 10,
          height: 10,
          borderTop: `2px solid ${cornerColor}`,
          borderLeft: `2px solid ${cornerColor}`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 10,
          height: 10,
          borderTop: `2px solid ${cornerColor}`,
          borderRight: `2px solid ${cornerColor}`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          width: 10,
          height: 10,
          borderBottom: `2px solid ${cornerColor}`,
          borderLeft: `2px solid ${cornerColor}`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          width: 10,
          height: 10,
          borderBottom: `2px solid ${cornerColor}`,
          borderRight: `2px solid ${cornerColor}`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Content — keyed to node.id for glitch-reveal on each new selection */}
      <motion.div
        key={node.id}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative p-5 md:p-6"
        style={{ zIndex: 2 }}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 6px ${accentColor}`,
                }}
              />
              <span
                className="text-[9px] uppercase tracking-wider font-mono font-semibold"
                style={{ color: accentColor }}
              >
                &gt; {node.systemName}
              </span>
            </div>
            <h2
              className="text-2xl font-bold leading-tight text-white"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              data-testid="galaxy-panel-title"
            >
              {node.name}
            </h2>
            <p className="text-[11px] font-mono mt-1" style={{ color: `${accentColor}99` }}>
              {node.synergyCount} researched synergy link
              {node.synergyCount === 1 ? "" : "s"}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="galaxy-panel-close"
            aria-label="Close peptide details"
            className="text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body systems */}
        {node.systems.length > 0 && (
          <div className="mb-5">
            <p
              className="text-[9px] uppercase tracking-wider font-mono mb-2 flex items-center gap-1"
              style={{ color: accentColor }}
            >
              &gt; BODY SYSTEMS
            </p>
            <div className="flex flex-wrap gap-1.5">
              {node.systems.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs font-mono"
                  style={{
                    borderColor: `${accentColor}40`,
                    color: "rgba(255,255,255,0.75)",
                  }}
                  data-testid={`galaxy-panel-system-${s.toLowerCase()}`}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pathways */}
        {node.pathways.length > 0 && (
          <div className="mb-5">
            <p
              className="text-[9px] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              &gt; PATHWAYS
              <Activity className="h-3 w-3" />
            </p>
            <ul className="space-y-1">
              {node.pathways.map((p) => (
                <li
                  key={p}
                  className="text-sm flex items-center gap-2 text-white/70"
                >
                  <span
                    className="inline-block w-1 h-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mechanisms */}
        {node.mechanisms.length > 0 && (
          <div className="mb-5">
            <p
              className="text-[9px] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              &gt; MECHANISMS
              <Sparkles className="h-3 w-3" />
            </p>
            <ul className="space-y-1">
              {node.mechanisms.map((m) => (
                <li key={m} className="text-sm text-white/50">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Synergies */}
        {stacks.length > 0 && (
          <div className="mb-5">
            <p
              className="text-[9px] uppercase tracking-wider font-mono mb-2"
              style={{ color: accentColor }}
            >
              &gt; SYNERGIES
            </p>
            <div className="space-y-2">
              {stacks.map((s) => {
                const detailId = (s as typeof s & { detailPageId?: string }).detailPageId;
                const partners = s.peptides
                  .filter(
                    (p) =>
                      p.toLowerCase().replace(/[^a-z0-9]/g, "") !==
                      node.id.toLowerCase().replace(/[^a-z0-9]/g, "")
                  )
                  .join(" + ");
                const inner = (
                  <div
                    className="flex items-center justify-between gap-3 rounded-md p-3 hover-elevate cursor-pointer"
                    style={{
                      background: `${accentColor}0d`,
                      border: `1px solid ${accentColor}30`,
                    }}
                    data-testid={`galaxy-panel-synergy-${detailId ?? s.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-white/90">{s.name}</p>
                      <p className="text-xs truncate font-mono" style={{ color: `${accentColor}80` }}>
                        with {partners}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs font-mono"
                        style={{ color: s.color }}
                      >
                        {s.synergyBonus}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                    </div>
                  </div>
                );
                return detailId ? (
                  <Link
                    key={s.name}
                    href={`/research-stacks/${detailId}`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={s.name}>{inner}</div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          className="space-y-2 pt-2"
          style={{ borderTop: `1px solid ${accentColor}30` }}
        >
          <Link href={`/peptides/${node.slug}`}>
            <Button
              size="default"
              className="w-full bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90"
              data-testid="galaxy-panel-view-product"
            >
              View {node.name} product
              <ExternalLink className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>

          {/* System-specific guide link — check all systems, not just the primary */}
          {(() => {
            const matchedKey = node.systems
              .map((s) => s.toLowerCase())
              .find((s) => SYSTEM_GUIDE_LINKS[s]);
            const guide = matchedKey ? SYSTEM_GUIDE_LINKS[matchedKey] : undefined;
            if (!guide) return null;
            return (
              <Link href={guide.href}>
                <Button
                  size="default"
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: `${accentColor}50`,
                    color: accentColor,
                  }}
                  data-testid="galaxy-panel-guide-link"
                >
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  {guide.label}
                </Button>
              </Link>
            );
          })()}
        </div>
      </motion.div>
    </motion.aside>
  );
}
