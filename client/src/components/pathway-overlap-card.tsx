import { motion } from "framer-motion";
import { GitMerge, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Citation, TriggeredOverlap } from "@/lib/pathway-overlaps";

interface PathwayOverlapCardProps {
  overlaps: TriggeredOverlap[];
}

function citationSourceLabel(c: Citation): string {
  return c.type === "PMID" ? "PubMed" : "IUPHAR";
}

function citationDomId(c: Citation): string {
  return `${c.type.toLowerCase()}-${c.id}`;
}

export function PathwayOverlapCard({ overlaps }: PathwayOverlapCardProps) {
  if (overlaps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      data-testid="card-pathway-overlap"
    >
      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-amber-400" />
            <span
              className="text-xs font-semibold tracking-wide text-amber-300"
              data-testid="text-pathway-overlap-title"
            >
              PATHWAY OVERLAP
            </span>
            <span className="text-[10px] text-amber-300/70 ml-auto">
              {overlaps.length} receptor system{overlaps.length > 1 ? "s" : ""}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Selected compounds engage the same receptor system. Mechanistic
            actions converge rather than stack independently.
          </p>

          <div className="space-y-3">
            {overlaps.map((overlap) => {
              const { cluster, matchedPeptides } = overlap;
              const clusterId = cluster.receptorKey;
              return (
                <div
                  key={clusterId}
                  className="rounded-md border border-amber-500/20 bg-[#1a1a1f]/60 p-3 space-y-2"
                  data-testid={`overlap-cluster-${clusterId}`}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span
                      className="text-[11px] font-semibold text-amber-200 min-w-0"
                      data-testid={`text-overlap-receptor-${clusterId}`}
                    >
                      {cluster.receptor}
                    </span>
                    <div
                      className="flex flex-wrap items-center gap-1"
                      data-testid={`list-overlap-peptides-${clusterId}`}
                    >
                      {matchedPeptides.map((p) => (
                        <span
                          key={p.slug}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-200 border border-amber-500/25"
                          data-testid={`chip-overlap-peptide-${clusterId}-${p.slug}`}
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p
                    className="text-[11px] text-gray-300 leading-relaxed"
                    data-testid={`text-overlap-mechanism-${clusterId}`}
                  >
                    {cluster.mechanismSummary}
                  </p>

                  {cluster.cardCopy && cluster.cardCopy !== cluster.mechanismSummary && (
                    <p
                      className="text-[11px] text-muted-foreground leading-relaxed"
                      data-testid={`text-overlap-cardcopy-${clusterId}`}
                    >
                      {cluster.cardCopy}
                    </p>
                  )}

                  <div
                    className="flex flex-wrap items-center gap-1.5 pt-1"
                    data-testid={`list-overlap-citations-${clusterId}`}
                  >
                    {cluster.citations.slice(0, 3).map((cite) => {
                      const label = citationSourceLabel(cite);
                      const domId = citationDomId(cite);
                      return (
                        <Tooltip key={domId}>
                          <TooltipTrigger asChild>
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover-elevate active-elevate-2"
                              data-testid={`link-overlap-citation-${clusterId}-${domId}`}
                            >
                              <span>{label}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[260px] bg-[#1a1a1f] border-[#2a2a32]"
                          >
                            <p className="text-[11px]">{cite.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
