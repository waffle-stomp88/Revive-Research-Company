import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Scissors, Target, Zap, Activity } from "lucide-react";

const COLORS = {
  native: "#21d8ff",
  lr3: "#D4FF1F",
  des: "#f97316",
  receptor: "#9d4edd",
  igfbp: "#ef4444",
  free: "#22c55e",
};

function MolecularComparisonSVG({ isInView }: { isInView: boolean }) {
  const variants = [
    {
      id: "native",
      label: "Native IGF-1",
      color: COLORS.native,
      segments: [
        { label: "1-3", width: 28, highlight: false, desc: "Gly-Pro-Glu" },
        { label: "4-70", width: 88, highlight: false, desc: "Core" },
      ],
      igfbp: 100,
      affinity: 100,
      halfLife: "~12 min",
    },
    {
      id: "lr3",
      label: "IGF-1 LR3",
      color: COLORS.lr3,
      segments: [
        { label: "Arg substitution", width: 28, highlight: true, desc: "Arg³" },
        { label: "+13 AA extension", width: 88, highlight: true, desc: "N-ext" },
        { label: "Core", width: 44, highlight: false, desc: "" },
      ],
      igfbp: 10,
      affinity: 110,
      halfLife: "20-30 h",
    },
    {
      id: "des",
      label: "IGF-DES (des 1-3)",
      color: COLORS.des,
      segments: [
        { label: "✕", width: 28, highlight: true, desc: "Removed" },
        { label: "4-70 (intact)", width: 88, highlight: false, desc: "Core" },
      ],
      igfbp: 15,
      affinity: 1000,
      halfLife: "~20-25 min",
    },
  ];

  return (
    <svg viewBox="0 0 340 220" className="w-full max-w-[520px] h-auto mx-auto">
      <defs>
        <filter id="desGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="desArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="currentColor" fillOpacity="0.4" />
        </marker>
      </defs>

      {variants.map((v, vi) => {
        const y = 30 + vi * 58;
        let xCursor = 10;

        return (
          <motion.g
            key={v.id}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 + vi * 0.25, duration: 0.5 }}
          >
            <text x="8" y={y - 8} fill={v.color} fontSize="7.5" fontWeight="bold"
              style={{ filter: `drop-shadow(0 0 3px ${v.color}80)` }}>
              {v.label}
            </text>

            {v.segments.map((seg, si) => {
              const rx = xCursor;
              xCursor += seg.width + 4;

              if (seg.label === "✕") {
                return (
                  <g key={si}>
                    <rect
                      x={rx}
                      y={y}
                      width={seg.width}
                      height={16}
                      rx="3"
                      fill="rgba(239,68,68,0.15)"
                      stroke={COLORS.igfbp}
                      strokeWidth="1.5"
                      strokeDasharray="3,2"
                    />
                    <motion.text
                      x={rx + seg.width / 2}
                      y={y + 11}
                      textAnchor="middle"
                      fill={COLORS.igfbp}
                      fontSize="9"
                      fontWeight="bold"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.8 + vi * 0.2 }}
                    >
                      ✕
                    </motion.text>
                    <text x={rx + seg.width / 2} y={y + 26} textAnchor="middle"
                      fill="rgba(239,68,68,0.7)" fontSize="5.5">
                      {seg.desc}
                    </text>
                  </g>
                );
              }

              return (
                <g key={si}>
                  <rect
                    x={rx}
                    y={y}
                    width={seg.width}
                    height={16}
                    rx="3"
                    fill={seg.highlight ? `${v.color}30` : "hsl(var(--foreground) / 0.06)"}
                    stroke={seg.highlight ? v.color : "hsl(var(--foreground) / 0.15)"}
                    strokeWidth={seg.highlight ? 1.5 : 1}
                  />
                  <text x={rx + seg.width / 2} y={y + 11} textAnchor="middle"
                    fill={seg.highlight ? v.color : "hsl(var(--foreground) / 0.6)"} fontSize="5.5" fontWeight="bold">
                    {seg.label}
                  </text>
                  {seg.desc ? (
                    <text x={rx + seg.width / 2} y={y + 26} textAnchor="middle"
                      fill="currentColor" fillOpacity="0.35" fontSize="5">
                      {seg.desc}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <rect
              x={220}
              y={y - 2}
              width={52}
              height={20}
              rx="4"
              fill={`${v.color}15`}
              stroke={`${v.color}40`}
              strokeWidth="1"
            />
            <text x={246} y={y + 9} textAnchor="middle" fill={v.color} fontSize="6" fontWeight="bold">
              t½ {v.halfLife}
            </text>

            <motion.rect
              x={280}
              y={y + 2}
              width={Math.min(55, v.affinity > 500 ? 55 : Math.round(v.affinity * 55 / 1000))}
              height={12}
              rx="2"
              fill={`${v.color}50`}
              stroke={v.color}
              strokeWidth="1"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.6 + vi * 0.2, duration: 0.6 }}
              style={{ transformOrigin: "280px center" }}
            />
            <text x={280} y={y + 10} fill="currentColor" fillOpacity="0.3" fontSize="5.5">
              {v.affinity >= 1000 ? "~10× ↑ affinity" : v.affinity === 100 ? "baseline" : "~1.1× affinity"}
            </text>
          </motion.g>
        );
      })}

      <text x="220" y="195" textAnchor="middle" fill="currentColor" fillOpacity="0.35" fontSize="6">
        Half-life
      </text>
      <text x="307" y="195" textAnchor="middle" fill="currentColor" fillOpacity="0.35" fontSize="6">
        IGF-1R affinity
      </text>

      <line x1="8" y1="190" x2="332" y2="190" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
    </svg>
  );
}

function IGFBPBypassAnimation({ isInView }: { isInView: boolean }) {
  const [phase, setPhase] = useState<"native" | "des">("native");

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setPhase((p) => (p === "native" ? "des" : "native"));
    }, 3500);
    return () => clearInterval(timer);
  }, [isInView]);

  const isDes = phase === "des";

  return (
    <div className="relative">
      <div className="text-center mb-2">
        <span className="text-xs font-bold" style={{ color: isDes ? COLORS.des : COLORS.native }}>
          {isDes ? "IGF-DES bypasses IGFBP binding" : "Native IGF-1 captured by IGFBP"}
        </span>
      </div>

      <svg viewBox="0 0 300 130" className="w-full max-w-[420px] h-auto mx-auto">
        <defs>
          <filter id="bypassGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="bypassArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.des} />
          </marker>
        </defs>

        <motion.g
          animate={{ x: isDes ? 0 : 0, opacity: 1 }}
        >
          <rect x="8" y="48" width="52" height="34" rx="6"
            fill="rgba(239,68,68,0.12)" stroke={COLORS.igfbp} strokeWidth="1.5" />
          <text x="34" y="62" textAnchor="middle" fill={COLORS.igfbp} fontSize="6.5" fontWeight="bold">IGFBP</text>
          <text x="34" y="74" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="5.5">(binding</text>
          <text x="34" y="82" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="5.5">protein)</text>
        </motion.g>

        <rect x="230" y="45" width="60" height="40" rx="6"
          fill={`${COLORS.receptor}15`} stroke={COLORS.receptor} strokeWidth="1.5" />
        <text x="260" y="61" textAnchor="middle" fill={COLORS.receptor} fontSize="6.5" fontWeight="bold">IGF-1R</text>
        <text x="260" y="73" textAnchor="middle" fill={`${COLORS.receptor}80`} fontSize="5.5">Receptor</text>
        <text x="260" y="82" textAnchor="middle" fill={`${COLORS.receptor}80`} fontSize="5.5">(active)</text>

        <motion.circle
          cx={isDes ? 240 : 55}
          cy="65"
          r="9"
          fill={isDes ? `${COLORS.des}40` : `${COLORS.native}40`}
          stroke={isDes ? COLORS.des : COLORS.native}
          strokeWidth="1.5"
          animate={{
            cx: isDes ? 240 : 55,
            fill: isDes ? `${COLORS.des}40` : `${COLORS.native}40`,
            stroke: isDes ? COLORS.des : COLORS.native,
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${isDes ? COLORS.des : COLORS.native})` }}
        />
        <motion.text
          textAnchor="middle"
          fontSize="5"
          fontWeight="bold"
          y="62"
          animate={{ x: isDes ? 240 : 55, fill: isDes ? COLORS.des : COLORS.native }}
          transition={{ duration: 1.2 }}
        >
          IGF
        </motion.text>
        <motion.text
          textAnchor="middle"
          fontSize="5"
          fontWeight="bold"
          y="70"
          animate={{ x: isDes ? 240 : 55, fill: isDes ? COLORS.des : COLORS.native }}
          transition={{ duration: 1.2 }}
        >
          {isDes ? "DES" : "IGF-1"}
        </motion.text>

        {!isDes && (
          <motion.path
            d="M 64 65 Q 90 45 100 60 Q 110 72 102 72 Q 96 72 94 66"
            fill="none"
            stroke={COLORS.igfbp}
            strokeWidth="1.5"
            strokeDasharray="3,2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        )}

        {!isDes && (
          <motion.text
            x="108"
            y="55"
            fill={COLORS.igfbp}
            fontSize="6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Trapped
          </motion.text>
        )}

        {isDes && (
          <motion.path
            d="M 150 65 L 228 65"
            fill="none"
            stroke={COLORS.des}
            strokeWidth="2"
            markerEnd="url(#bypassArrow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        )}

        {isDes && (
          <motion.text
            x="175"
            y="58"
            textAnchor="middle"
            fill={COLORS.des}
            fontSize="6"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Bypasses →
          </motion.text>
        )}

        <text x="150" y="120" textAnchor="middle" fill="currentColor" fillOpacity="0.25" fontSize="5.5">
          {isDes
            ? "N-terminal truncation reduces IGFBP-3 affinity ~85%"
            : "Native IGF-1 largely sequestered by circulating IGFBPs"}
        </text>
      </svg>
    </div>
  );
}

export function IGFDESBindingVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const bypassRef = useRef<HTMLDivElement>(null);
  const bypassInView = useInView(bypassRef, { once: false, margin: "-20px" });

  return (
    <div ref={containerRef} className="relative">
      <div
        className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(249, 115, 22, 0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(33,216,255,0.05) 100%)",
            borderColor: COLORS.des,
            boxShadow: "0 0 20px rgba(249,115,22,0.3)",
          }}
        >
          <Scissors
            className="h-5 w-5"
            style={{
              color: COLORS.des,
              filter: "drop-shadow(0 0 4px rgba(249,115,22,0.6))",
            }}
          />
          <span
            className="text-sm font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${COLORS.des}, ${COLORS.free})`,
            }}
          >
            IGF-DES: des(1-3)IGF-1 Binding Mechanism
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How N-terminal truncation bypasses IGFBP sequestration and dramatically enhances IGF-1R
          receptor affinity
        </p>
      </motion.div>

      <div
        className="rounded-xl border p-5 mb-5"
        style={{
          borderColor: "rgba(249,115,22,0.3)",
          background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, transparent 60%)",
        }}
      >
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Structural Comparison — Native IGF-1 vs. LR3 vs. DES
          </span>
        </div>
        <MolecularComparisonSVG isInView={isInView} />

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { color: COLORS.native, label: "Native IGF-1", note: "Full sequence, IGFBP-bound" },
            { color: COLORS.lr3, label: "IGF-1 LR3", note: "Arg substitution + N-extension" },
            { color: COLORS.des, label: "IGF-DES", note: "Gly-Pro-Glu removed at N-terminus" },
          ].map((item) => (
            <motion.div
              key={item.label}
              className="p-2 rounded-lg"
              style={{
                background: `${item.color}10`,
                border: `1px solid ${item.color}30`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
            >
              <span className="text-xs font-bold block" style={{ color: item.color }}>
                {item.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{item.note}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border p-5 mb-5"
        ref={bypassRef}
        style={{
          borderColor: "rgba(239,68,68,0.25)",
          background: "linear-gradient(135deg, rgba(239,68,68,0.04) 0%, transparent 60%)",
        }}
      >
        <div className="mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            IGFBP Bypass Mechanism
          </span>
        </div>
        <IGFBPBypassAnimation isInView={bypassInView} />
      </div>

      <div
        className="rounded-xl border p-5 mb-5"
        style={{
          borderColor: "rgba(157,78,221,0.25)",
          background: "linear-gradient(135deg, rgba(157,78,221,0.04) 0%, transparent 60%)",
        }}
      >
        <div className="mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Pharmacological Profile — IGF-DES
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Scissors,
              color: COLORS.des,
              title: "N-terminal Truncation",
              desc: "First 3 residues (Gly-Pro-Glu) removed, leaving a 67-AA peptide with altered binding domain",
            },
            {
              icon: Target,
              color: COLORS.receptor,
              title: "~10× Receptor Affinity",
              desc: "DES binds IGF-1R with significantly higher potency than native IGF-1 due to altered conformation",
            },
            {
              icon: Zap,
              color: COLORS.igfbp,
              title: "~85% ↓ IGFBP Binding",
              desc: "Reduced IGFBP-3 sequestration means more free peptide reaches target tissues rapidly",
            },
            {
              icon: Activity,
              color: COLORS.free,
              title: "Localized Action",
              desc: "Short half-life (~20 min) combined with IGFBP bypass yields potent, site-specific tissue signaling",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className="p-3 rounded-lg"
                style={{
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}30`,
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.0 + idx * 0.12 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-xs font-bold" style={{ color: item.color }}>
                    {item.title}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          IGF-DES binding mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}
