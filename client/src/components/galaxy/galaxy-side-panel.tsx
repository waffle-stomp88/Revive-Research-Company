import { Link } from "wouter";
import { X, ExternalLink, ArrowRight, Activity, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type GalaxyNode,
  getStacksForPeptide,
} from "@/lib/galaxy-layout";

interface GalaxySidePanelProps {
  node: GalaxyNode | null;
  onClose: () => void;
}

export function GalaxySidePanel({ node, onClose }: GalaxySidePanelProps) {
  if (!node) return null;

  const stacks = getStacksForPeptide(node.id);

  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 26, stiffness: 220 }}
      className="absolute top-24 md:top-28 bottom-0 right-0 w-full max-w-md bg-background/92 backdrop-blur-xl border-l border-t border-border z-30 overflow-y-auto"
      data-testid="galaxy-side-panel"
    >
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: node.color }}
              />
              <span
                className="text-xs uppercase tracking-wider font-semibold"
                style={{ color: node.color }}
              >
                {node.systemName}
              </span>
            </div>
            <h2
              className="font-display text-2xl font-bold leading-tight"
              data-testid="galaxy-panel-title"
            >
              {node.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
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
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body systems */}
        {node.systems.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Body systems
            </p>
            <div className="flex flex-wrap gap-1.5">
              {node.systems.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs"
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
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> Pathways
            </p>
            <ul className="space-y-1">
              {node.pathways.map((p) => (
                <li
                  key={p}
                  className="text-sm flex items-center gap-2"
                >
                  <span
                    className="inline-block w-1 h-1 rounded-full"
                    style={{ backgroundColor: node.color }}
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
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Mechanisms
            </p>
            <ul className="space-y-1">
              {node.mechanisms.map((m) => (
                <li key={m} className="text-sm text-muted-foreground">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Synergies */}
        {stacks.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Synergies
            </p>
            <div className="space-y-2">
              {stacks.map((s) => {
                // detailPageId is optional — only set on the six curated research stacks
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
                    className="flex items-center justify-between gap-3 rounded-md border border-border p-3 hover-elevate cursor-pointer"
                    data-testid={`galaxy-panel-synergy-${detailId ?? s.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
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
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
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
        <div className="space-y-2 pt-2 border-t border-border">
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
        </div>
      </div>
    </motion.aside>
  );
}
