import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { GitMerge, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Citation, TriggeredOverlap } from "@/lib/pathway-overlaps";

interface PathwayOverlapCardProps {
  overlaps: TriggeredOverlap[];
}

const STATIC_SHADOW =
  "0 0 24px rgba(245,158,11,0.18), inset 0 0 12px rgba(245,158,11,0.06)";
const FLARE_SHADOW =
  "0 0 40px rgba(245,158,11,0.45), inset 0 0 14px rgba(245,158,11,0.10)";
const PULSE_SHADOW =
  "0 0 36px rgba(245,158,11,0.55), inset 0 0 14px rgba(245,158,11,0.10)";

function citationSourceLabel(c: Citation): string {
  return c.type === "PMID" ? "PubMed" : "IUPHAR";
}

function citationDomId(c: Citation): string {
  return `${c.type.toLowerCase()}-${c.id}`;
}

export function PathwayOverlapCard({ overlaps }: PathwayOverlapCardProps) {
  const controls = useAnimationControls();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await controls.start({
        opacity: 1,
        y: 0,
        boxShadow: [
          "0 0 0px rgba(245,158,11,0)",
          FLARE_SHADOW,
          STATIC_SHADOW,
        ],
        transition: {
          opacity: { duration: 0.4, ease: "easeOut" },
          y: { duration: 0.4, ease: "easeOut" },
          boxShadow: { duration: 1.5, times: [0, 0.4, 1], ease: "easeOut" },
        },
      });
      if (!cancelled) {
        hasMountedRef.current = true;
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [controls]);

  useEffect(() => {
    const handler = () => {
      if (!hasMountedRef.current) return;
      controls.start({
        boxShadow: [STATIC_SHADOW, PULSE_SHADOW, STATIC_SHADOW],
        transition: { duration: 0.6, ease: "easeOut" },
      });
    };
    window.addEventListener("pathway-overlap-highlight", handler);
    return () =>
      window.removeEventListener("pathway-overlap-highlight", handler);
  }, [controls]);

  if (overlaps.length === 0) return null;

  return (
    <motion.div
      id="pathway-overlap-card"
      initial={{
        opacity: 0,
        y: 12,
        boxShadow: "0 0 0px rgba(245,158,11,0)",
      }}
      animate={controls}
      data-testid="card-pathway-overlap"
      className="rounded-xl border-[2.5px] border-amber-500/55 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12]"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <GitMerge
            className="h-[18px] w-[18px] text-amber-400"
            style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.55))" }}
          />
          <span
            className="text-sm font-bold tracking-wide text-amber-200"
            style={{ textShadow: "0 0 16px rgba(245,158,11,0.35)" }}
            data-testid="text-pathway-overlap-title"
          >
            PATHWAY OVERLAP
          </span>
          <span className="text-[11px] text-amber-300/80 ml-auto font-medium">
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
    </motion.div>
  );
}
