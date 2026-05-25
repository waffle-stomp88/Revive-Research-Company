import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FlaskConical, Target, Clock, TrendingUp } from "lucide-react";

const COLORS = {
  native: "#21d8ff",
  lr3: "#D4FF1F",
  receptor: "#9d4edd",
  igfbp: "#ef4444",
  extension: "#f97316",
  free: "#22c55e",
};

interface Segment {
  label: string;
  width: number;
  highlight: boolean;
  desc: string;
  isExtension?: boolean;
  isArg?: boolean;
}

function StructureComparisonSVG({ isInView }: { isInView: boolean }) {
  const variants: {
    id: string;
    label: string;
    color: string;
    segments: Segment[];
    halfLife: string;
    igfbpBar: number;
    igfbpLabel: string;
  }[] = [
    {
      id: "native",
      label: "Native IGF-1",
      color: COLORS.native,
      segments: [
        { label: "Gly¹-Pro²-Glu³", width: 52, highlight: false, desc: "N-terminus" },
        { label: "Core (4–70)", width: 100, highlight: false, desc: "Binding domain" },
      ],
      halfLife: "~12 min",
      igfbpBar: 100,
      igfbpLabel: "High IGFBP binding",
    },
    {
      id: "lr3",
      label: "IGF-1 LR3",
      color: COLORS.lr3,
      segments: [
        { label: "+13 AA extension", width: 52, highlight: true, desc: "N-ext", isExtension: true },
        { label: "Arg³ → Glu", width: 30, highlight: true, desc: "Substitution", isArg: true },
        { label: "Core (4–70)", width: 70, highlight: false, desc: "Binding domain" },
      ],
      halfLife: "20-30 h",
      igfbpBar: 10,
      igfbpLabel: "~90% ↓ IGFBP binding",
    },
  ];

  return (
    <svg viewBox="0 0 380 175" className="w-full max-w-[560px] h-auto mx-auto">
      <defs>
        <filter id="lr3Glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="lr3Arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="currentColor" fillOpacity="0.35" />
        </marker>
      </defs>

      {variants.map((v, vi) => {
        const y = 28 + vi * 68;
        let xCursor = 10;

        return (
          <motion.g
            key={v.id}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 + vi * 0.3, duration: 0.55 }}
          >
            <text
              x="8"
              y={y - 9}
              fill={v.color}
              fontSize="8"
              fontWeight="bold"
              style={{ filter: `drop-shadow(0 0 3px ${v.color}80)` }}
            >
              {v.label}
            </text>

            {v.segments.map((seg, si) => {
              const rx = xCursor;
              xCursor += seg.width + 4;
              const isExt = seg.isExtension ?? false;
              const isArg = seg.isArg ?? false;
              const segColor = isExt ? COLORS.extension : isArg ? COLORS.free : v.color;

              return (
                <g key={si}>
                  <rect
                    x={rx}
                    y={y}
                    width={seg.width}
                    height={18}
                    rx="3"
                    fill={
                      seg.highlight
                        ? `${segColor}25`
                        : "hsl(var(--foreground) / 0.05)"
                    }
                    stroke={
                      seg.highlight
                        ? segColor
                        : "hsl(var(--foreground) / 0.12)"
                    }
                    strokeWidth={seg.highlight ? 1.8 : 1}
                    strokeDasharray={isExt ? "4,2" : undefined}
                  />
                  <text
                    x={rx + seg.width / 2}
                    y={y + 12}
                    textAnchor="middle"
                    fill={seg.highlight ? segColor : "hsl(var(--foreground) / 0.55)"}
                    fontSize="5.2"
                    fontWeight="bold"
                  >
                    {seg.label}
                  </text>
                  {seg.desc ? (
                    <text
                      x={rx + seg.width / 2}
                      y={y + 28}
                      textAnchor="middle"
                      fill="currentColor" fillOpacity="0.3"
                      fontSize="4.8"
                    >
                      {seg.desc}
                    </text>
                  ) : null}
                </g>
              );
            })}

            <rect
              x={258}
              y={y - 1}
              width={58}
              height={20}
              rx="4"
              fill={`${v.color}12`}
              stroke={`${v.color}35`}
              strokeWidth="1"
            />
            <text
              x={287}
              y={y + 11}
              textAnchor="middle"
              fill={v.color}
              fontSize="6"
              fontWeight="bold"
            >
              t½ {v.halfLife}
            </text>

            <text
              x={326}
              y={y - 3}
              fill="currentColor" fillOpacity="0.25"
              fontSize="5"
            >
              IGFBP
            </text>
            <rect
              x={326}
              y={y + 2}
              width={46}
              height={9}
              rx="2"
              fill="currentColor" fillOpacity="0.04"
              stroke="currentColor" strokeOpacity="0.1"
              strokeWidth="0.8"
            />
            <motion.rect
              x={326}
              y={y + 2}
              width={Math.round(v.igfbpBar * 46 / 100)}
              height={9}
              rx="2"
              fill={v.igfbpBar > 50 ? `${COLORS.igfbp}60` : `${COLORS.free}60`}
              stroke={v.igfbpBar > 50 ? COLORS.igfbp : COLORS.free}
              strokeWidth="0.8"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.7 + vi * 0.25, duration: 0.7 }}
              style={{ transformOrigin: "326px center" }}
            />
            <text
              x={326}
              y={y + 22}
              fill={v.igfbpBar > 50 ? `${COLORS.igfbp}80` : `${COLORS.free}80`}
              fontSize="4.8"
            >
              {v.igfbpLabel}
            </text>
          </motion.g>
        );
      })}

      <text x="258" y="158" textAnchor="middle" fill="currentColor" fillOpacity="0.25" fontSize="5.5">
        Half-life
      </text>
      <text x="349" y="158" textAnchor="middle" fill="currentColor" fillOpacity="0.25" fontSize="5.5">
        IGFBP affinity
      </text>

      <line x1="6" y1="153" x2="376" y2="153" stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
    </svg>
  );
}

function ExtensionMechanismAnimation({ isInView }: { isInView: boolean }) {
  const [phase, setPhase] = useState<"native" | "lr3">("native");

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setPhase((p) => (p === "native" ? "lr3" : "native"));
    }, 3800);
    return () => clearInterval(timer);
  }, [isInView]);

  const isLR3 = phase === "lr3";

  return (
    <div className="relative">
      <div className="text-center mb-2">
        <span className="text-xs font-bold" style={{ color: isLR3 ? COLORS.lr3 : COLORS.native }}>
          {isLR3 ? "IGF-1 LR3 bypasses IGFBP sequestration" : "Native IGF-1 captured by IGFBP"}
        </span>
      </div>

      <svg viewBox="0 0 310 135" className="w-full max-w-[440px] h-auto mx-auto">
        <defs>
          <filter id="extGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="extArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={COLORS.lr3} />
          </marker>
        </defs>

        <rect x="8" y="48" width="54" height="36" rx="6"
          fill="rgba(239,68,68,0.1)" stroke={COLORS.igfbp} strokeWidth="1.5" />
        <text x="35" y="62" textAnchor="middle" fill={COLORS.igfbp} fontSize="6.5" fontWeight="bold">IGFBP</text>
        <text x="35" y="74" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="5.5">(binding</text>
        <text x="35" y="83" textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize="5.5">protein)</text>

        <rect x="234" y="45" width="62" height="40" rx="6"
          fill={`${COLORS.receptor}12`} stroke={COLORS.receptor} strokeWidth="1.5" />
        <text x="265" y="61" textAnchor="middle" fill={COLORS.receptor} fontSize="6.5" fontWeight="bold">IGF-1R</text>
        <text x="265" y="73" textAnchor="middle" fill={`${COLORS.receptor}80`} fontSize="5.5">Receptor</text>
        <text x="265" y="82" textAnchor="middle" fill={`${COLORS.receptor}80`} fontSize="5.5">(active)</text>

        <motion.circle
          cy="65"
          r="10"
          animate={{
            cx: isLR3 ? 242 : 55,
            fill: isLR3 ? `${COLORS.lr3}35` : `${COLORS.native}35`,
            stroke: isLR3 ? COLORS.lr3 : COLORS.native,
          }}
          transition={{ duration: 1.3, ease: "easeInOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${isLR3 ? COLORS.lr3 : COLORS.native})`,
          }}
        />
        <motion.text
          textAnchor="middle"
          fontSize="5"
          fontWeight="bold"
          y="62"
          animate={{ x: isLR3 ? 242 : 55, fill: isLR3 ? COLORS.lr3 : COLORS.native }}
          transition={{ duration: 1.3 }}
        >
          IGF
        </motion.text>
        <motion.text
          textAnchor="middle"
          fontSize="4.5"
          fontWeight="bold"
          y="70"
          animate={{ x: isLR3 ? 242 : 55, fill: isLR3 ? COLORS.lr3 : COLORS.native }}
          transition={{ duration: 1.3 }}
        >
          {isLR3 ? "LR3" : "IGF-1"}
        </motion.text>

        {!isLR3 && (
          <motion.path
            d="M 63 63 Q 92 44 103 60 Q 112 73 104 73 Q 97 73 95 66"
            fill="none"
            stroke={COLORS.igfbp}
            strokeWidth="1.5"
            strokeDasharray="3,2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        )}

        {!isLR3 && (
          <motion.text
            x="115"
            y="55"
            fill={COLORS.igfbp}
            fontSize="6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Trapped
          </motion.text>
        )}

        {isLR3 && (
          <motion.path
            d="M 155 65 L 232 65"
            fill="none"
            stroke={COLORS.lr3}
            strokeWidth="2"
            markerEnd="url(#extArrow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        )}

        {isLR3 && (
          <motion.text
            x="182"
            y="58"
            textAnchor="middle"
            fill={COLORS.lr3}
            fontSize="6"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Bypasses →
          </motion.text>
        )}

        <text x="155" y="122" textAnchor="middle" fill="currentColor" fillOpacity="0.22" fontSize="5.5">
          {isLR3
            ? "N-terminal extension + Arg³→Glu reduces IGFBP affinity ~90%"
            : "Native IGF-1 largely sequestered by circulating IGFBPs"}
        </text>
      </svg>
    </div>
  );
}

export function IGF1LR3StructureVisual() {
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
            "radial-gradient(ellipse at center, rgba(231, 251, 16, 0.08) 0%, transparent 70%)",
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
              "linear-gradient(135deg, rgba(231,251,16,0.15) 0%, rgba(249,115,22,0.06) 100%)",
            borderColor: COLORS.lr3,
            boxShadow: "0 0 20px rgba(231,251,16,0.25)",
          }}
        >
          <FlaskConical
            className="h-5 w-5"
            style={{
              color: COLORS.lr3,
              filter: "drop-shadow(0 0 4px rgba(231,251,16,0.6))",
            }}
          />
          <span
            className="text-sm font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${COLORS.lr3}, ${COLORS.extension})`,
            }}
          >
            IGF-1 LR3: Long R3 Extension Mechanism
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How the Arg³→Glu substitution and 13-residue N-terminal extension reduce IGFBP affinity
          and dramatically extend circulating half-life
        </p>
      </motion.div>

      <div
        className="rounded-xl border p-5 mb-5"
        style={{
          borderColor: "rgba(231,251,16,0.28)",
          background: "linear-gradient(135deg, rgba(231,251,16,0.04) 0%, transparent 60%)",
        }}
      >
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Structural Comparison — Native IGF-1 vs. IGF-1 LR3
          </span>
        </div>
        <StructureComparisonSVG isInView={isInView} />

        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            {
              color: COLORS.native,
              label: "Native IGF-1",
              note: "Full 70-AA sequence; tightly sequestered by IGFBPs",
            },
            {
              color: COLORS.lr3,
              label: "IGF-1 LR3",
              note: "Arg³→Glu + 13-AA N-ext; ~90% ↓ IGFBP binding",
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              className="p-2 rounded-lg text-center"
              style={{
                background: `${item.color}10`,
                border: `1px solid ${item.color}28`,
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

        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {[
            { color: COLORS.extension, label: "13-AA N-terminal extension (dashed border)" },
            { color: COLORS.free, label: "Arg³→Glu substitution" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: `${item.color}30`, border: `1.5px solid ${item.color}` }}
              />
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border p-5 mb-5"
        ref={bypassRef}
        style={{
          borderColor: "rgba(239,68,68,0.22)",
          background: "linear-gradient(135deg, rgba(239,68,68,0.04) 0%, transparent 60%)",
        }}
      >
        <div className="mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            IGFBP Bypass Mechanism
          </span>
        </div>
        <ExtensionMechanismAnimation isInView={bypassInView} />
      </div>

      <div
        className="rounded-xl border p-5 mb-5"
        style={{
          borderColor: "rgba(157,78,221,0.22)",
          background: "linear-gradient(135deg, rgba(157,78,221,0.04) 0%, transparent 60%)",
        }}
      >
        <div className="mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Pharmacological Profile — IGF-1 LR3
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: FlaskConical,
              color: COLORS.extension,
              title: "13-AA N-terminal Extension",
              desc: "Extra 13 residues added to the N-terminus sterically hinder IGFBP-3 and IGFBP-5 binding without disrupting IGF-1R engagement",
            },
            {
              icon: Target,
              color: COLORS.free,
              title: "Arg³ → Glu Substitution",
              desc: "Replacing the positively-charged Arg at position 3 with glutamic acid disrupts a key electrostatic contact with IGFBPs, further reducing sequestration",
            },
            {
              icon: Clock,
              color: COLORS.lr3,
              title: "20–30 h Half-life",
              desc: "Reduced IGFBP binding slows renal clearance, extending half-life from ~12 min (native) to 20–30 hours and sustaining IGF-1R stimulation",
            },
            {
              icon: TrendingUp,
              color: COLORS.receptor,
              title: "Maintained IGF-1R Affinity",
              desc: "Despite structural modifications at the N-terminus, IGF-1 LR3 retains near-native IGF-1R binding affinity (~1.1×), preserving downstream PI3K/Akt/mTOR signaling",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className="p-3 rounded-lg"
                style={{
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}28`,
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
          IGF-1 LR3 structural extension mechanism • For research education only
        </span>
      </motion.div>
    </div>
  );
}
