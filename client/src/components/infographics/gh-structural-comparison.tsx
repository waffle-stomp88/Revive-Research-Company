import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Clock, MapPin, Activity, Zap, Target, Layers } from "lucide-react";

/* ─── Color tokens ─────────────────────────────────────────────────────── */
const C = {
  dac: "#21d8ff",      // CJC-1295 with DAC (cyan)
  nonDac: "#f97316",   // Mod GRF 1-29 / non-DAC (orange)
  lr3: "#D4FF1F",      // IGF-1 LR3 (neon yellow)
  des: "#a78bfa",      // IGF-DES (violet)
  igfbp: "#ef4444",    // IGFBP binding (red)
  free: "#22c55e",     // Free fraction (green)
  receptor: "#9d4edd", // IGF-1R receptor (purple)
  gh: "#f59e0b",       // GH axis amber
};

/* ─── CJC-1295 DAC vs non-DAC section ──────────────────────────────────── */

function HalfLifeBars({ isInView }: { isInView: boolean }) {
  const compounds = [
    {
      name: "Native GHRH",
      value: 7,
      maxMin: 180,
      display: "~7 min",
      color: "#6b7280",
      desc: "Unmodified; rapidly cleaved by DPP-IV",
    },
    {
      name: "Mod GRF 1-29 (non-DAC)",
      value: 30,
      maxMin: 180,
      display: "~30 min",
      color: C.nonDac,
      desc: "Protease-resistant; acute pulsatile action",
    },
    {
      name: "CJC-1295 with DAC",
      value: 180,
      maxMin: 180,
      display: "~120–168 h",
      color: C.dac,
      desc: "Albumin-bound; sustained GHRH receptor activation",
      overflowLabel: true,
    },
  ];

  return (
    <div className="space-y-4">
      {compounds.map((c, i) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, x: -16 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.25 + i * 0.18 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold" style={{ color: c.color }}>
              {c.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
              {c.desc}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-5 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: c.color, opacity: 0.85 }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${Math.min(100, (c.value / c.maxMin) * 100)}%` } : {}}
                transition={{ duration: 1.1, delay: 0.4 + i * 0.2, ease: "easeOut" }}
              />
            </div>
            <span
              className="text-xs font-bold w-28 text-right font-mono"
              style={{ color: c.color }}
            >
              {c.display}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DACMechanismDiagram({ isInView }: { isInView: boolean }) {
  const [tab, setTab] = useState<"nonDac" | "dac">("nonDac");

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setTab((p) => (p === "nonDac" ? "dac" : "nonDac")), 4500);
    return () => clearInterval(t);
  }, [isInView]);

  const isDac = tab === "dac";

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        {(["nonDac", "dac"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            data-testid={`button-cjc-tab-${k}`}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: tab === k ? (k === "dac" ? `${C.dac}22` : `${C.nonDac}22`) : "hsl(var(--foreground) / 0.03)",
              border: `1.5px solid ${tab === k ? (k === "dac" ? C.dac : C.nonDac) : "hsl(var(--foreground) / 0.1)"}`,
              color: tab === k ? (k === "dac" ? C.dac : C.nonDac) : "hsl(var(--foreground) / 0.45)",
              boxShadow: tab === k ? `0 0 12px ${k === "dac" ? C.dac : C.nonDac}30` : "none",
            }}
          >
            {k === "dac" ? "CJC-1295 with DAC" : "Mod GRF 1-29 (non-DAC)"}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 340 150" className="w-full max-w-[480px] h-auto mx-auto">
        <defs>
          <filter id="ghGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="ghArrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0,7 2.5,0 5" fill={isDac ? C.dac : C.nonDac} />
          </marker>
          <linearGradient id="bloodStream" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(239,68,68,0.05)" />
            <stop offset="50%" stopColor="rgba(239,68,68,0.15)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0.05)" />
          </linearGradient>
        </defs>

        <rect x="0" y="52" width="340" height="46" fill="url(#bloodStream)" />
        <text x="12" y="68" fill="rgba(239,68,68,0.4)" fontSize="7">Bloodstream</text>

        {/* Peptide bubble — translate via g transform to avoid cx/cy attribute animation */}
        <motion.g
          animate={{ x: isDac ? 0 : 105 }}
          initial={{ x: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${isDac ? C.dac : C.nonDac}80)` }}
        >
          <circle
            cx="165"
            cy="75"
            r="16"
            fill={isDac ? `${C.dac}30` : `${C.nonDac}30`}
            stroke={isDac ? C.dac : C.nonDac}
            strokeWidth="1.5"
          />
          <text x="165" y="72" textAnchor="middle" fontSize="5.5" fontWeight="bold"
            fill={isDac ? C.dac : C.nonDac}>
            {isDac ? "CJC-1295" : "Mod GRF"}
          </text>
          <text x="165" y="80" textAnchor="middle" fontSize="5"
            fill={isDac ? C.dac : C.nonDac}>
            {isDac ? "+ DAC" : "1-29"}
          </text>
        </motion.g>

        {/* Albumin blob (DAC only) */}
        {isDac && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <ellipse cx="165" cy="75" rx="38" ry="26"
              fill={`${C.gh}10`} stroke={C.gh} strokeWidth="1.5" strokeDasharray="4,3" />
            <text x="165" y="44" textAnchor="middle" fill={C.gh} fontSize="6.5" fontWeight="bold">
              Albumin
            </text>
            <text x="165" y="52" textAnchor="middle" fill={`${C.gh}80`} fontSize="5.5">
              (t½ ~21 days)
            </text>
            <text x="165" y="108" textAnchor="middle" fill={C.dac} fontSize="7" fontWeight="bold"
              style={{ filter: `drop-shadow(0 0 4px ${C.dac}70)` }}>
              Protected — t½ ~120–168 h
            </text>
          </motion.g>
        )}

        {/* Enzyme scissors (non-DAC) */}
        {!isDac && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {[0, 1, 2].map((j) => (
              <motion.g key={j}>
                <motion.text
                  fontSize="11"
                  textAnchor="middle"
                  fill="#ef4444"
                  x={220 + j * 18}
                  y={70 - j * 4}
                  animate={{ opacity: [0, 0.9, 0.9, 0] }}
                  transition={{ duration: 1.8, delay: 0.3 + j * 0.25, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  ✂
                </motion.text>
              </motion.g>
            ))}
            <text x="270" y="108" textAnchor="middle" fill={C.nonDac} fontSize="7" fontWeight="bold">
              Pulsatile — t½ ~30 min
            </text>
            <text x="270" y="118" textAnchor="middle" fill="currentColor" fillOpacity="0.35" fontSize="5.5">
              DPP-IV resistant · physiologic GH pulse
            </text>
          </motion.g>
        )}

        {/* GHRH receptor */}
        <rect x="12" y="56" width="52" height="38" rx="5"
          fill={`${isDac ? C.dac : C.nonDac}10`}
          stroke={isDac ? C.dac : C.nonDac}
          strokeWidth="1.5"
        />
        <text x="38" y="71" textAnchor="middle" fill={isDac ? C.dac : C.nonDac} fontSize="6" fontWeight="bold">GHRHR</text>
        <text x="38" y="81" textAnchor="middle" fill="currentColor" fillOpacity="0.45" fontSize="5">Pituitary</text>
        <text x="38" y="90" textAnchor="middle" fill="currentColor" fillOpacity="0.45" fontSize="5">receptor</text>

        {isDac && (
          <motion.path
            d="M 64 75 L 125 75"
            stroke={C.dac}
            strokeWidth="1.8"
            markerEnd="url(#ghArrow)"
            strokeDasharray="4,3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          />
        )}
        {!isDac && (
          <motion.path
            d="M 64 75 L 250 75"
            stroke={C.nonDac}
            strokeWidth="1.8"
            markerEnd="url(#ghArrow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          />
        )}
      </svg>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 p-3 rounded-lg text-center text-xs text-muted-foreground"
        style={{
          background: isDac ? `${C.dac}0f` : `${C.nonDac}0f`,
          border: `1px solid ${isDac ? C.dac : C.nonDac}28`,
        }}
      >
        {isDac
          ? "DAC (maleimide-Cys30) forms a covalent Michael adduct with Cys34 of serum albumin, borrowing albumin's 21-day half-life to keep GHRHR continuously stimulated."
          : "Four protease-resistant substitutions (positions 2, 8, 15, 27) extend action to ~30 min. Preserves physiologic GH pulsatility — one discrete pulse per injection."}
      </motion.div>
    </div>
  );
}

/* ─── IGF-1 LR3 vs IGF-DES section ─────────────────────────────────────── */

function IGFDistributionDiagram({ isInView }: { isInView: boolean }) {
  const variants = [
    {
      id: "lr3",
      label: "IGF-1 LR3",
      color: C.lr3,
      igfbpBar: 8,
      igfbpLabel: "~90% ↓ IGFBP binding",
      halfLife: "20–30 h",
      affinity: "~1.1× IGF-1R",
      distribution: "Systemic",
      distributionNote: "Uniform body-wide",
      structureNote: "+13 AA N-ext + Arg³ → Glu",
      mechNote: "Reduces IGFBP-3/5 binding by ~1000×; distributes systemically via circulation",
    },
    {
      id: "des",
      label: "IGF-DES (des 1-3)",
      color: C.des,
      igfbpBar: 15,
      igfbpLabel: "~85% ↓ IGFBP binding",
      halfLife: "~20–25 min",
      affinity: "~10× IGF-1R",
      distribution: "Local",
      distributionNote: "Concentrated at injection site",
      structureNote: "Gly-Pro-Glu truncated at N-term",
      mechNote: "Removes primary IGFBP-3 epitope; short t½ limits systemic spread",
    },
  ];

  return (
    <div className="space-y-4">
      {variants.map((v, i) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 + i * 0.25 }}
          className="rounded-lg p-4"
          style={{
            background: `${v.color}0a`,
            border: `1px solid ${v.color}35`,
          }}
          data-testid={`panel-igf-${v.id}`}
        >
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <span className="text-sm font-bold" style={{ color: v.color }}>
              {v.label}
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
              style={{ borderColor: `${v.color}40`, color: v.color, background: `${v.color}15` }}
            >
              {v.structureNote}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: "Half-life", value: v.halfLife, icon: Clock },
              { label: "IGF-1R affinity", value: v.affinity, icon: Target },
              { label: "Distribution", value: v.distribution, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 p-2 rounded-lg text-center"
                style={{ background: `${v.color}0d`, border: `1px solid ${v.color}20` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: v.color }} />
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className="text-xs font-bold font-mono" style={{ color: v.color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* IGFBP binding bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                IGFBP binding (vs native IGF-1)
              </span>
              <span className="text-[10px] font-bold" style={{ color: C.free }}>{v.igfbpLabel}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-muted/20">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${C.igfbp}80, ${C.free}80)` }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${v.igfbpBar}%` } : {}}
                transition={{ duration: 0.9, delay: 0.5 + i * 0.3 }}
              />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">{v.mechNote}</p>
        </motion.div>
      ))}
    </div>
  );
}

function IGFDistributionSVG({ isInView }: { isInView: boolean }) {
  const [mode, setMode] = useState<"lr3" | "des">("lr3");

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setMode((p) => (p === "lr3" ? "des" : "lr3")), 4200);
    return () => clearInterval(t);
  }, [isInView]);

  const isLR3 = mode === "lr3";

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        {(["lr3", "des"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            data-testid={`button-igf-tab-${k}`}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: mode === k ? (k === "lr3" ? `${C.lr3}20` : `${C.des}20`) : "hsl(var(--foreground) / 0.03)",
              border: `1.5px solid ${mode === k ? (k === "lr3" ? C.lr3 : C.des) : "hsl(var(--foreground) / 0.1)"}`,
              color: mode === k ? (k === "lr3" ? C.lr3 : C.des) : "hsl(var(--foreground) / 0.45)",
              boxShadow: mode === k ? `0 0 12px ${(k === "lr3" ? C.lr3 : C.des)}30` : "none",
            }}
          >
            {k === "lr3" ? "IGF-1 LR3" : "IGF-DES"}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 340 160" className="w-full max-w-[480px] h-auto mx-auto">
        <defs>
          <filter id="igfGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="igfArrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0,7 2.5,0 5" fill={isLR3 ? C.lr3 : C.des} />
          </marker>
          <radialGradient id="bodyGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isLR3 ? `${C.lr3}18` : `${C.des}18`} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Injection site */}
        <circle cx="32" cy="80" r="20" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
        <text x="32" y="76" textAnchor="middle" fill="currentColor" fillOpacity="0.55" fontSize="6.5" fontWeight="bold">Injection</text>
        <text x="32" y="85" textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="5.5">site</text>

        {/* IGFBP cloud */}
        <ellipse cx="130" cy="80" rx="30" ry="22"
          fill="rgba(239,68,68,0.08)" stroke={C.igfbp} strokeWidth="1.2" strokeDasharray="3,2" />
        <text x="130" y="76" textAnchor="middle" fill={C.igfbp} fontSize="6.5" fontWeight="bold">IGFBP</text>
        <text x="130" y="86" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="5.5">Sequestration</text>

        {/* Systemic body oval (LR3) */}
        {isLR3 && (
          <motion.ellipse
            cx="248" cy="80" rx="72" ry="44"
            fill="url(#bodyGrad)"
            stroke={C.lr3}
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}
        <motion.text x="248" y="74" textAnchor="middle" fontSize="7" fontWeight="bold"
          initial={{ opacity: 1 }}
          animate={{ fill: isLR3 ? C.lr3 : C.des, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ filter: `drop-shadow(0 0 4px ${isLR3 ? C.lr3 : C.des}80)` }}
        >
          {isLR3 ? "Systemic IGF-1R" : "Local IGF-1R"}
        </motion.text>
        <motion.text x="248" y="84" textAnchor="middle" fontSize="5.5"
          initial={{ opacity: 1 }}
          animate={{ fill: isLR3 ? `${C.lr3}80` : `${C.des}80`, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isLR3 ? "Body-wide activation" : "Site-concentrated"}
        </motion.text>

        {/* Peptide dots — use g transform to avoid cx/cy attribute animation */}
        {[0, 1, 2].map((j) => {
          const startX = 54;
          const startY = 80;
          const destX = isLR3 ? 200 + j * 18 : 220;
          const destY = isLR3 ? 65 + j * 12 : 80;
          return (
            <motion.g
              key={j}
              animate={{ x: destX - startX, y: destY - startY }}
              initial={{ x: 0, y: 0 }}
              transition={{ duration: 1.0, delay: j * 0.22, ease: "easeInOut" }}
            >
              <circle
                cx={startX}
                cy={startY}
                r="5"
                fill={isLR3 ? `${C.lr3}60` : `${C.des}60`}
                stroke={isLR3 ? C.lr3 : C.des}
                strokeWidth="1"
                style={{ filter: `drop-shadow(0 0 5px ${isLR3 ? C.lr3 : C.des})` }}
              />
            </motion.g>
          );
        })}

        {/* Arrow from IGFBP region to receptor */}
        <motion.path
          d={isLR3 ? "M 162 80 L 200 80" : "M 162 80 Q 180 65 210 75"}
          stroke={isLR3 ? C.lr3 : C.des}
          strokeWidth="2"
          fill="none"
          markerEnd="url(#igfArrow)"
          strokeDasharray={isLR3 ? undefined : "3,2"}
          key={mode}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        />

        {/* DES local radius indicator */}
        {!isLR3 && (
          <motion.circle
            cx="220" cy="80" r="50"
            fill="none"
            stroke={C.des}
            strokeWidth="1.2"
            strokeDasharray="3,3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ delay: 0.5 }}
          />
        )}

        <text x="170" y="148" textAnchor="middle" fill="currentColor" fillOpacity="0.22" fontSize="5.5">
          {isLR3
            ? "LR3: ~90% ↓ IGFBP binding → systemic half-life 20–30 h"
            : "IGF-DES: ~85% ↓ IGFBP binding at site → potent local free fraction"}
        </text>
      </svg>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 p-3 rounded-lg text-xs text-muted-foreground text-center"
        style={{
          background: isLR3 ? `${C.lr3}0f` : `${C.des}0f`,
          border: `1px solid ${isLR3 ? C.lr3 : C.des}28`,
        }}
      >
        {isLR3
          ? "N-terminal 13 AA extension + Arg³ substitution reduces IGFBP-3 affinity ~1000×. Distributes systemically with a 20–30 h half-life — ideal for studying body-wide IGF-1R signaling."
          : "Removal of Gly-Pro-Glu eliminates the dominant IGFBP-3 contact residues, dramatically increasing the free fraction at the injection site. Short systemic half-life (~20 min) keeps activity localized."}
      </motion.div>
    </div>
  );
}

/* ─── Public export ─────────────────────────────────────────────────────── */

export function GHStructuralComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const igfRef = useRef<HTMLDivElement>(null);
  const igfInView = useInView(igfRef, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="my-8 not-prose space-y-8" data-testid="graphic-gh-structural-comparison">

      {/* ── Part 1: CJC-1295 DAC vs non-DAC ── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          CJC-1295 DAC vs Mod GRF 1-29 — Half-life &amp; Mechanism Comparison
        </h3>

        <div
          className="rounded-xl border p-5 mb-4"
          style={{
            borderColor: `${C.dac}30`,
            background: `linear-gradient(135deg, ${C.dac}06 0%, transparent 60%)`,
          }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Plasma half-life — logarithmic scale reference
          </p>
          <HalfLifeBars isInView={isInView} />
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: `${C.nonDac}28`,
            background: `linear-gradient(135deg, ${C.nonDac}05 0%, transparent 60%)`,
          }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Mechanism animation — albumin binding vs acute pulse
          </p>
          <DACMechanismDiagram isInView={isInView} />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {[
            {
              color: C.nonDac,
              label: "Mod GRF 1-29",
              badge: "Pulsatile Protocol",
              points: [
                "4 protease-resistant substitutions (Ala², Gln⁸, Ala¹⁵, Leu²⁷)",
                "t½ ~30 min — mirrors physiologic GH pulsatility",
                "Single discrete GH pulse per injection",
                "Preferred where pulsatile GH pattern is the research variable",
              ],
            },
            {
              color: C.dac,
              label: "CJC-1295 with DAC",
              badge: "Sustained Protocol",
              points: [
                "DAC maleimide-Cys30 binds serum albumin (Cys34) covalently",
                "t½ ~120–168 h — borrows albumin's 21-day lifespan",
                "Continuous GHRHR stimulation → sustained IGF-1 elevation",
                "Preferred for studying prolonged GH axis activation without frequent injections",
              ],
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="rounded-lg p-3"
              style={{ background: `${item.color}0a`, border: `1px solid ${item.color}30` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full border font-mono"
                  style={{ borderColor: `${item.color}40`, color: item.color, background: `${item.color}15` }}
                >
                  {item.badge}
                </span>
              </div>
              <ul className="space-y-1">
                {item.points.map((p, pi) => (
                  <li key={pi} className="flex items-start gap-1.5">
                    <span className="mt-1 flex-shrink-0 h-1 w-1 rounded-full" style={{ background: item.color }} />
                    <span className="text-[10px] text-muted-foreground leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Part 2: IGF-1 LR3 vs IGF-DES ── */}
      <div ref={igfRef}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          IGF-1 LR3 vs IGF-DES — IGFBP Binding &amp; Distribution Comparison
        </h3>

        <div
          className="rounded-xl border p-5 mb-4"
          style={{
            borderColor: `${C.lr3}28`,
            background: `linear-gradient(135deg, ${C.lr3}05 0%, transparent 60%)`,
          }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Pharmacokinetic profiles
          </p>
          <IGFDistributionDiagram isInView={igfInView} />
        </div>

        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: `${C.des}28`,
            background: `linear-gradient(135deg, ${C.des}05 0%, transparent 60%)`,
          }}
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Distribution animation — systemic vs local
          </p>
          <IGFDistributionSVG isInView={igfInView} />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {[
            {
              color: C.lr3,
              label: "IGF-1 LR3",
              badge: "Systemic",
              icon: Activity,
              points: [
                "+13 AA N-terminal extension sterically blocks IGFBP-3/5 binding",
                "Arg³ → Glu substitution disrupts electrostatic IGFBP contact",
                "IGFBP affinity reduced ~1000×; t½ extends to 20–30 h",
                "Uniform body-wide IGF-1R activation via systemic circulation",
              ],
            },
            {
              color: C.des,
              label: "IGF-DES",
              badge: "Local",
              icon: Zap,
              points: [
                "Gly-Pro-Glu N-terminal tripeptide removed (des 1-3 truncation)",
                "Eliminates primary IGFBP-3 binding epitope at the N-terminus",
                "~10× higher IGF-1R binding affinity vs native IGF-1",
                "Short t½ (~20 min) concentrates high free-fraction activity at injection site",
              ],
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={igfInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="rounded-lg p-3"
                style={{ background: `${item.color}0a`, border: `1px solid ${item.color}30` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full border font-mono"
                    style={{ borderColor: `${item.color}40`, color: item.color, background: `${item.color}15` }}
                  >
                    {item.badge}
                  </span>
                </div>
                <ul className="space-y-1">
                  {item.points.map((p, pi) => (
                    <li key={pi} className="flex items-start gap-1.5">
                      <span className="mt-1 flex-shrink-0 h-1 w-1 rounded-full" style={{ background: item.color }} />
                      <span className="text-[10px] text-muted-foreground leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center font-mono">
        Structural comparison infographic · For research education only · Not medical advice
      </p>
    </div>
  );
}
