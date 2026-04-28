import { forwardRef } from "react";
import { GitMerge } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TriggeredOverlap } from "@/lib/pathway-overlaps";
import { getSystemIcon, getSystemColor, getSystemName } from "@/data/body-systems";

function synergyRingColor(score: number): string {
  if (score >= 88) return "#E7FB10";
  if (score >= 75) return "#21d8ff";
  if (score >= 60) return "#a855f7";
  return "#6b7280";
}

function synergyLabel(score: number): string {
  if (score >= 88) return "Elite";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  return "Basic";
}

export interface StackCardPeptide {
  id: string;
  name: string;
  dosage?: string;
}

export interface StackCardProps {
  name: string;
  shareCode: string;
  peptides: StackCardPeptide[];
  synergyScore: number;
  activeSystems: string[];
  pathwayOverlaps: TriggeredOverlap[];
}

export const StackCard = forwardRef<HTMLDivElement, StackCardProps>(
  function StackCard({ name, shareCode, peptides, synergyScore, activeSystems, pathwayOverlaps }, ref) {
    const ringColor = synergyRingColor(synergyScore);
    const label = synergyLabel(synergyScore);
    const circumference = 2 * Math.PI * 36;
    const filled = circumference * (synergyScore / 100);
    const gap = circumference - filled;

    const matchedSystems = activeSystems
      .map(sys => {
        const key = sys.toLowerCase();
        const icon = getSystemIcon(key);
        const color = getSystemColor(key);
        const resolvedName = getSystemName(key);
        if (!icon || !color || !resolvedName) return null;
        return { id: key, name: resolvedName, icon: icon as LucideIcon, color };
      })
      .filter((sys, idx, arr) => sys !== null && arr.findIndex(s => s?.id === sys.id) === idx)
      .filter((s): s is { id: string; name: string; icon: LucideIcon; color: string } => s !== null);

    return (
      <div
        ref={ref}
        data-testid="card-stack"
        style={{ aspectRatio: "1200 / 630", maxWidth: "100%", width: "100%", background: "#0f0f12", fontFamily: "'Inter', system-ui, sans-serif" }}
        className="relative overflow-hidden rounded-xl border border-[#2a2a32] select-none"
      >
        {/* Background glow */}
        <div
          style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: `${ringColor}18`, filter: "blur(60px)", pointerEvents: "none" }}
        />
        <div
          style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "#21d8ff0e", filter: "blur(50px)", pointerEvents: "none" }}
        />

        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

        {/* Content */}
        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "4.2% 5%" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: ringColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#0f0f12", fontWeight: 800, fontSize: 14, lineHeight: 1 }}>R</span>
              </div>
              <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "clamp(11px,1.6cqw,15px)", letterSpacing: 1.5, textTransform: "uppercase" }}>REVIVE RESEARCH</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#6b7280", fontSize: "clamp(9px,1.1cqw,11px)", fontFamily: "monospace", letterSpacing: 1 }}>reviveresearch.co/stacks/</span>
              <span style={{ color: "#9ca3af", fontSize: "clamp(9px,1.1cqw,11px)", fontFamily: "monospace", fontWeight: 600 }}>{shareCode}</span>
            </div>
          </div>

          {/* Hero row */}
          <div style={{ display: "flex", alignItems: "center", gap: "4%", marginBottom: "3%", flex: "0 0 auto" }}>
            {/* Synergy ring */}
            <div style={{ flexShrink: 0, position: "relative", width: "clamp(72px,13cqw,96px)", height: "clamp(72px,13cqw,96px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 80 80" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="#1e1e24" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="36" fill="none"
                  stroke={ringColor} strokeWidth="6"
                  strokeDasharray={`${filled} ${gap}`}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${ringColor}aa)` }}
                />
              </svg>
              <div style={{ textAlign: "center", zIndex: 1 }}>
                <div style={{ color: ringColor, fontWeight: 800, fontSize: "clamp(16px,3cqw,22px)", lineHeight: 1 }}>{synergyScore}%</div>
                <div style={{ color: "#9ca3af", fontSize: "clamp(7px,0.9cqw,9px)", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
              </div>
            </div>

            {/* Stack name + description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#6b7280", fontSize: "clamp(8px,1cqw,10px)", letterSpacing: 2, textTransform: "uppercase", marginBottom: "2%" }}>CUSTOM RESEARCH STACK</div>
              <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "clamp(14px,2.8cqw,26px)", lineHeight: 1.15, letterSpacing: -0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
              <div style={{ color: "#6b7280", fontSize: "clamp(8px,1.1cqw,11px)", marginTop: "2%" }}>{peptides.length} research compound{peptides.length !== 1 ? "s" : ""} · Synergy score {synergyScore}%</div>
            </div>
          </div>

          {/* Body: peptides + systems side by side */}
          <div style={{ display: "flex", gap: "4%", flex: 1, minHeight: 0 }}>
            {/* Peptide list */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#6b7280", fontSize: "clamp(7px,0.9cqw,9px)", letterSpacing: 2, textTransform: "uppercase", marginBottom: "4%", fontWeight: 600 }}>COMPOUNDS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3%" }}>
                {peptides.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#161619", borderRadius: 6, padding: "3% 4%", border: "1px solid #2a2a32" }}>
                    <div style={{ width: "clamp(16px,2.5cqw,20px)", height: "clamp(16px,2.5cqw,20px)", borderRadius: "50%", background: `${ringColor}22`, border: `1px solid ${ringColor}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: ringColor, fontWeight: 700, fontSize: "clamp(7px,0.9cqw,9px)" }}>{i + 1}</span>
                    </div>
                    <span style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "clamp(9px,1.3cqw,13px)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                    {p.dosage && (
                      <span style={{ marginLeft: "auto", flexShrink: 0, background: "#1e1e24", border: "1px solid #2a2a32", borderRadius: 4, padding: "1% 3%", color: "#9ca3af", fontSize: "clamp(7px,0.8cqw,9px)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{p.dosage}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Systems */}
            {matchedSystems.length > 0 && (
              <div style={{ width: "30%", flexShrink: 0 }}>
                <div style={{ color: "#6b7280", fontSize: "clamp(7px,0.9cqw,9px)", letterSpacing: 2, textTransform: "uppercase", marginBottom: "4%", fontWeight: 600 }}>BODY SYSTEMS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3%", flexWrap: "wrap" }}>
                  {matchedSystems.map(sys => {
                    const Icon = sys.icon;
                    return (
                      <div key={sys.id} style={{ display: "flex", alignItems: "center", gap: 6, background: `${sys.color}10`, border: `1px solid ${sys.color}30`, borderRadius: 6, padding: "3% 4%" }}>
                        <Icon style={{ width: "clamp(10px,1.5cqw,14px)", height: "clamp(10px,1.5cqw,14px)", color: sys.color, flexShrink: 0 }} />
                        <span style={{ color: sys.color, fontWeight: 600, fontSize: "clamp(8px,1.1cqw,11px)", whiteSpace: "nowrap" }}>{sys.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pathway overlaps with citation chips */}
          {pathwayOverlaps.length > 0 && (
            <div style={{ marginTop: "3%", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 6, padding: "2.5% 3%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "1.5%" }}>
                <GitMerge style={{ width: "clamp(10px,1.3cqw,12px)", height: "clamp(10px,1.3cqw,12px)", color: "#f59e0b" }} />
                <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "clamp(7px,0.9cqw,9px)", letterSpacing: 1.5, textTransform: "uppercase" }}>PATHWAY OVERLAP · {pathwayOverlaps.length} receptor system{pathwayOverlaps.length !== 1 ? "s" : ""}</span>
              </div>
              {pathwayOverlaps.slice(0, 2).map((overlap) => {
                const { cluster, matchedPeptides } = overlap;
                return (
                  <div key={cluster.receptorKey} style={{ marginBottom: "2%", paddingBottom: "2%", borderBottom: "1px solid rgba(245,158,11,0.12)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: "1%" }}>
                      <span style={{ color: "#fde68a", fontWeight: 600, fontSize: "clamp(7px,0.9cqw,9px)" }}>{cluster.receptor}</span>
                      {matchedPeptides.slice(0, 3).map(p => (
                        <span key={p.slug} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 3, padding: "1px 4px", color: "#fde68a", fontSize: "clamp(6px,0.75cqw,8px)", fontWeight: 500 }}>{p.name}</span>
                      ))}
                      {cluster.citations.slice(0, 2).map(c => (
                        <span key={`${c.type}-${c.id}`} style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 3, padding: "1px 4px", color: "#92400e", fontSize: "clamp(5px,0.65cqw,7px)", fontFamily: "monospace", letterSpacing: 0.5 }}>{c.type === "PMID" ? "PubMed" : "IUPHAR"}</span>
                      ))}
                    </div>
                    {cluster.mechanismSummary && (
                      <p style={{ color: "#9ca3af", fontSize: "clamp(6px,0.8cqw,8px)", margin: 0, lineHeight: 1.4 }}>
                        {cluster.mechanismSummary.slice(0, 120)}{cluster.mechanismSummary.length > 120 ? "…" : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "2%", borderTop: "1px solid #1e1e24" }}>
            <span style={{ color: "#4b5563", fontSize: "clamp(7px,0.9cqw,9px)", fontFamily: "monospace" }}>reviveresearch.co</span>
            <span style={{ color: "#374151", fontSize: "clamp(6px,0.8cqw,8px)", letterSpacing: 1, textTransform: "uppercase" }}>For research use only · Not for human consumption</span>
          </div>
        </div>
      </div>
    );
  }
);
