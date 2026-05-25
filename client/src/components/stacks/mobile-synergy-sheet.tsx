import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Target, ChevronDown, Save, Copy, GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PathwayOverlapCard } from "@/components/pathway-overlap-card";
import { BODY_SYSTEMS } from "@/data/body-systems";
import type { KnownStack } from "@/lib/synergy-data";
import type { TriggeredOverlap } from "@/lib/pathway-overlaps";
import type { Product } from "@shared/schema";

interface MobileSynergySheepProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeptides: Product[];
  synergyScore: number;
  knownStack: KnownStack | null;
  containedStack: KnownStack | null;
  sharedPathways: string[];
  activeSystems: string[];
  pathwayOverlaps: TriggeredOverlap[];
  recommendation: { stack: KnownStack; missing: string[] } | null;
  generalPairings: Array<{
    partner: string;
    reason: string;
    boost: string;
    productName: string;
    inStock: boolean;
    stackHint?: string;
  }>;
  isAuthenticated: boolean;
  onSave: () => void;
  onShare: () => void;
}

const BOOST_COLORS: Record<string, string> = {
  Healing: "#22c55e",
  Metabolic: "#D4FF1F",
  Growth: "#f59e0b",
  Cognitive: "#21d8ff",
  Skin: "#ec4899",
  Longevity: "#a855f7",
  Immune: "#22c55e",
  Sleep: "#8b5cf6",
  Hormonal: "#f59e0b",
  Vascular: "#ef4444",
  Weight: "#D4FF1F",
};

export function MobileSynergySheet({
  isOpen,
  onClose,
  selectedPeptides,
  synergyScore,
  knownStack,
  containedStack,
  sharedPathways,
  activeSystems,
  pathwayOverlaps,
  recommendation,
  generalPairings,
  isAuthenticated,
  onSave,
  onShare,
}: MobileSynergySheepProps) {
  const synergyColor = knownStack
    ? knownStack.color
    : synergyScore > 70
    ? "#22c55e"
    : synergyScore > 50
    ? "#D4FF1F"
    : "#21d8ff";

  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const delta = touchCurrentY.current - touchStartY.current;
    if (delta > 80) {
      onClose();
    }
  };

  const synergyLabel =
    synergyScore >= 85
      ? "Legendary Combo"
      : synergyScore >= 70
      ? "Strong Synergy"
      : sharedPathways.length > 0
      ? "Building..."
      : "Custom Stack";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-[53] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            data-testid="mobile-synergy-sheet-backdrop"
          />

          {/* Sheet */}
          <motion.div
            key="sheet-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[54] rounded-t-2xl bg-[#0f0f12] border-t border-l border-r border-[#2a2a32] max-h-[82vh] flex flex-col"
            style={{ borderColor: `${synergyColor}30` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid="mobile-synergy-sheet"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: synergyColor }} />
                <span className="font-display font-bold text-base tracking-wide text-white">
                  SYNERGY ANALYSIS
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                data-testid="button-close-synergy-sheet"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-4">

              {/* Synergy Ring + Status */}
              <div
                className="rounded-xl border-2 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12] p-4"
                style={{ borderColor: `${synergyColor}40` }}
                data-testid="sheet-synergy-ring"
              >
                <div className="flex items-center gap-4">
                  {/* Ring */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#2a2a32" strokeWidth="7" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={synergyColor}
                        strokeWidth="7"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 264" }}
                        animate={{ strokeDasharray: `${(synergyScore / 100) * 264} 264` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ filter: knownStack ? `drop-shadow(0 0 8px ${knownStack.color})` : undefined }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        key={synergyScore}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-display text-3xl font-bold"
                        style={{ color: knownStack ? knownStack.color : "#fff" }}
                      >
                        {synergyScore}%
                      </motion.span>
                      <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">
                        SYNERGY
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-1 min-w-0">
                    {selectedPeptides.length === 0 ? (
                      <div>
                        <p className="font-display font-bold text-lg tracking-wide text-white">
                          SELECT PEPTIDES
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Choose 2 or more to see synergy
                        </p>
                      </div>
                    ) : knownStack ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        {(() => {
                          const Icon = knownStack.icon;
                          return (
                            <div className="mb-1 flex items-center gap-2">
                              <Icon className="w-5 h-5" style={{ color: knownStack.color }} />
                              <p className="font-display font-bold text-lg" style={{ color: knownStack.color }}>
                                {knownStack.name}
                              </p>
                            </div>
                          );
                        })()}
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: `${knownStack.color}20`,
                            color: knownStack.color,
                            border: `1px solid ${knownStack.color}40`,
                          }}
                        >
                          Legendary Combo
                        </Badge>
                      </motion.div>
                    ) : containedStack ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        {(() => {
                          const Icon = containedStack.icon;
                          return (
                            <div className="mb-0.5 flex items-center gap-2">
                              <Icon className="w-4 h-4" style={{ color: containedStack.color }} />
                              <p className="font-display font-bold text-base" style={{ color: containedStack.color }}>
                                Contains {containedStack.name}
                              </p>
                            </div>
                          );
                        })()}
                        <p className="text-xs text-muted-foreground">
                          + {selectedPeptides.length - containedStack.peptides.length} extra peptide
                          {selectedPeptides.length - containedStack.peptides.length > 1 ? "s" : ""}
                        </p>
                      </motion.div>
                    ) : selectedPeptides.length >= 2 ? (
                      <div>
                        <p className="font-display font-bold text-base text-white">{synergyLabel}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {sharedPathways.length > 0
                            ? `${sharedPathways.length} shared pathway${sharedPathways.length > 1 ? "s" : ""} detected`
                            : "Select more for higher synergy"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-display font-bold text-base text-white">Great Pick!</p>
                        <p className="text-sm text-muted-foreground mt-0.5">Add 1 more to see synergy</p>
                      </div>
                    )}

                    {pathwayOverlaps.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("sheet-pathway-overlap");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            window.dispatchEvent(new CustomEvent("pathway-overlap-highlight"));
                          }
                        }}
                        className="mt-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover-elevate active-elevate-2"
                        data-testid="sheet-chip-overlap-cue"
                      >
                        <GitMerge className="h-3 w-3" />
                        <span>{pathwayOverlaps.length} receptor overlap{pathwayOverlaps.length > 1 ? "s" : ""}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Known stack description */}
                {knownStack && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-3 pt-3 border-t border-[#2a2a32]"
                  >
                    <p className="text-sm text-gray-300">{knownStack.description}</p>
                  </motion.div>
                )}
              </div>

              {/* Shared Pathways */}
              {sharedPathways.length > 0 && (
                <div className="space-y-2" data-testid="sheet-shared-pathways">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#21d8ff]" />
                    <span className="text-xs font-semibold text-muted-foreground">SHARED PATHWAYS</span>
                    <Badge variant="outline" className="text-[9px] ml-1">{sharedPathways.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sharedPathways.map((pathway) => (
                      <span
                        key={pathway}
                        className="px-2 py-1 rounded-md text-[11px] font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                      >
                        {pathway}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Body Systems Heatmap */}
              <div data-testid="sheet-body-systems">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-3.5 w-3.5 text-[#21d8ff]" />
                  <span className="text-xs font-semibold text-muted-foreground">BODY SYSTEMS</span>
                  <Badge variant="outline" className="text-[9px] ml-1">{activeSystems.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BODY_SYSTEMS.map((system) => {
                    const isActive = activeSystems.includes(system.id);
                    const SystemIcon = system.icon;
                    return (
                      <Tooltip key={system.id}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.3 }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-help ${
                              isActive ? "border-opacity-50" : "border-[#2a2a32] bg-[#1a1a1f]"
                            }`}
                            style={
                              isActive
                                ? {
                                    borderColor: system.color,
                                    backgroundColor: `${system.color}15`,
                                    boxShadow: `0 0 10px ${system.color}25`,
                                  }
                                : undefined
                            }
                            data-testid={`sheet-system-${system.id}`}
                          >
                            <SystemIcon
                              className="h-3.5 w-3.5"
                              style={{ color: isActive ? system.color : "#6b7280" }}
                            />
                            <span
                              className="text-xs font-medium"
                              style={{ color: isActive ? system.color : "#6b7280" }}
                            >
                              {system.name}
                            </span>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[200px] text-center bg-[#1a1a1f] border-[#2a2a32]"
                        >
                          <p className="text-xs">{system.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

              {/* Pathway Overlap Card */}
              {pathwayOverlaps.length > 0 && (
                <div id="sheet-pathway-overlap" data-testid="sheet-pathway-overlap-card">
                  <PathwayOverlapCard overlaps={pathwayOverlaps} />
                </div>
              )}

              {/* Smart Recommendations — Complete a stack */}
              {recommendation && selectedPeptides.length < 4 && (
                <div
                  className="p-3 rounded-xl border-2 border-dashed"
                  style={{
                    borderColor: `${recommendation.stack.color}40`,
                    backgroundColor: `${recommendation.stack.color}08`,
                  }}
                  data-testid="sheet-recommendation"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const Icon = recommendation.stack.icon;
                      return <Icon className="w-4 h-4" style={{ color: recommendation.stack.color }} />;
                    })()}
                    <span className="text-xs font-semibold" style={{ color: recommendation.stack.color }}>
                      COMPLETE {recommendation.stack.name.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add{" "}
                    {recommendation.missing.map((m) => m.toUpperCase()).join(" + ")} to unlock this legendary combo
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-display font-bold text-sm" style={{ color: recommendation.stack.color }}>
                      {recommendation.stack.synergyBonus}% synergy
                    </span>
                    <Badge
                      className="text-[10px]"
                      style={{
                        backgroundColor: `${recommendation.stack.color}20`,
                        color: recommendation.stack.color,
                      }}
                    >
                      +{recommendation.stack.synergyBonus - synergyScore}% boost
                    </Badge>
                  </div>
                </div>
              )}

              {/* Pairs Well With */}
              {generalPairings.length > 0 && (
                <div data-testid="sheet-pairings">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#21d8ff]" />
                    <span className="text-xs font-semibold text-muted-foreground">PAIRS WELL WITH</span>
                  </div>
                  <div className="space-y-2">
                    {generalPairings.map((pairing, i) => {
                      const boostColor = BOOST_COLORS[pairing.boost] || "#21d8ff";
                      return (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg border border-[#2a2a32] bg-[#0f0f12]"
                          data-testid={`sheet-pair-${pairing.partner}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-display text-white text-sm font-normal">
                              {pairing.productName}
                            </span>
                            <Badge
                              className="text-[9px] shrink-0"
                              style={{
                                backgroundColor: `${boostColor}20`,
                                color: boostColor,
                              }}
                            >
                              {pairing.boost}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{pairing.reason}</p>
                          {pairing.stackHint && (
                            <span className="text-[10px] mt-1 block text-[#21d8ff]">
                              Unlocks {pairing.stackHint}
                            </span>
                          )}
                          {!pairing.inStock && (
                            <span className="mt-1 block text-[12px] text-red-400/70">Out of stock</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Save / Share row */}
              {selectedPeptides.length >= 2 && (
                <div className="flex gap-2 pt-1" data-testid="sheet-action-row">
                  <Button
                    className="flex-1 border-[#21d8ff]/40 text-[#21d8ff]"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      setTimeout(onSave, 200);
                    }}
                    data-testid="sheet-button-save"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isAuthenticated ? "Save Stack" : "Save"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onShare}
                    data-testid="sheet-button-share"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
