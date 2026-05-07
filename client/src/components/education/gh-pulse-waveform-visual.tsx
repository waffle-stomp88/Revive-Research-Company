import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Activity, Zap } from "lucide-react";

const IPAMORELIN_COLOR = "#E7FB10";
const CJC_COLOR = "#21d8ff";
const COMBINED_COLOR = "#22c55e";

// Chart coordinate constants
const CL = 52;   // left edge (x)
const CR = 418;  // right edge (x)
const CT = 26;   // top edge (y)
const CB = 204;  // bottom edge / baseline (y)

// GH pulse waveform paths
// Ipamorelin alone: discrete sharp pulses, amplitude ~58px
const IPAMORELIN_PATH =
  `M ${CL} ${CB} ` +
  `C ${CL + 14} ${CB} ${CL + 28} 148 ${CL + 44} 146 ` +
  `C ${CL + 60} 144 ${CL + 74} ${CB} ${CL + 90} ${CB} ` +
  `L ${CL + 114} ${CB} ` +
  `C ${CL + 128} ${CB} ${CL + 142} 148 ${CL + 158} 146 ` +
  `C ${CL + 174} 144 ${CL + 188} ${CB} ${CL + 204} ${CB} ` +
  `L ${CL + 234} ${CB} ` +
  `C ${CL + 248} ${CB} ${CL + 262} 148 ${CL + 278} 146 ` +
  `C ${CL + 294} 144 ${CL + 308} ${CB} ${CL + 324} ${CB} ` +
  `L ${CR} ${CB}`;

// CJC-1295 alone: broad, sustained raised baseline, moderate humps
const CJC_PATH =
  `M ${CL} ${CB} ` +
  `C ${CL + 30} ${CB} ${CL + 64} 162 ${CL + 96} 158 ` +
  `C ${CL + 130} 154 ${CL + 155} 153 ${CL + 188} 155 ` +
  `C ${CL + 228} 157 ${CL + 268} 155 ${CL + 300} 157 ` +
  `C ${CL + 336} 159 ${CL + 352} 166 ${CR} 170`;

// Combined: very large amplitude pulses (multiplicative synergy)
const COMBINED_PATH =
  `M ${CL} ${CB} ` +
  `C ${CL + 14} ${CB} ${CL + 26} 42 ${CL + 44} 38 ` +
  `C ${CL + 62} 34 ${CL + 76} ${CB} ${CL + 90} ${CB} ` +
  `L ${CL + 114} ${CB} ` +
  `C ${CL + 128} ${CB} ${CL + 142} 42 ${CL + 158} 38 ` +
  `C ${CL + 174} 34 ${CL + 188} ${CB} ${CL + 204} ${CB} ` +
  `L ${CL + 234} ${CB} ` +
  `C ${CL + 248} ${CB} ${CL + 262} 42 ${CL + 278} 38 ` +
  `C ${CL + 294} 34 ${CL + 308} ${CB} ${CL + 324} ${CB} ` +
  `L ${CR} ${CB}`;

// Approximate x-centers of each pulse (for injection & peak markers)
const PULSE_CENTERS = [CL + 44, CL + 158, CL + 278];
const DOSE_TRIGGERS = [CL + 10, CL + 124, CL + 244];

// Axis ticks
const Y_TICKS = [
  { y: CB, label: "0" },
  { y: CB - (CB - CT) * 0.25, label: "25" },
  { y: CB - (CB - CT) * 0.5, label: "50" },
  { y: CB - (CB - CT) * 0.75, label: "75" },
  { y: CT, label: "100" },
];

const X_TICKS = [
  { x: CL, label: "0" },
  { x: CL + (CR - CL) * 0.25, label: "1h" },
  { x: CL + (CR - CL) * 0.5, label: "2h" },
  { x: CL + (CR - CL) * 0.75, label: "3h" },
  { x: CR, label: "4h" },
];

function WaveformPath({
  d,
  color,
  delay,
  strokeWidth = 2,
  opacity = 1,
}: {
  d: string;
  color: string;
  delay: number;
  strokeWidth?: number;
  opacity?: number;
}) {
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      opacity={opacity}
      style={{ filter: `drop-shadow(0 0 4px ${color}70)` }}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{ duration: 1.6, delay, ease: "easeInOut" }}
    />
  );
}

function AreaFill({
  d,
  color,
  delay,
}: {
  d: string;
  color: string;
  delay: number;
}) {
  // Close the path by adding a line to the bottom corners
  const closed = `${d} L ${CR} ${CB} L ${CL} ${CB} Z`;
  return (
    <motion.path
      d={closed}
      fill={color}
      fillOpacity={0}
      animate={{ fillOpacity: 0.07 }}
      transition={{ duration: 0.8, delay: delay + 1.4 }}
    />
  );
}

function PeakMarker({
  x,
  color,
  label,
  delay,
}: {
  x: number;
  color: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <circle cx={x} cy={38} r={3.5} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <rect x={x - 16} y={14} width={32} height={14} rx={3}
        fill="rgba(0,0,0,0.65)" stroke={color} strokeWidth={0.8} strokeOpacity={0.6} />
      <text x={x} y={24} textAnchor="middle" fill={color} fontSize={7.5} fontWeight="700">
        {label}
      </text>
    </motion.g>
  );
}

function DoseMarker({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <line
        x1={x} y1={CT + 4} x2={x} y2={CB}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <text x={x} y={CB + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={6.5}>
        Dose
      </text>
    </motion.g>
  );
}

function WaveformChart({ isInView }: { isInView: boolean }) {
  return (
    <svg viewBox="0 0 470 240" className="w-full h-auto" style={{ maxHeight: 280 }}>
      <defs>
        <clipPath id="chartClip">
          <rect x={CL} y={CT - 4} width={CR - CL} height={CB - CT + 8} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {Y_TICKS.map(({ y }) => (
        <line
          key={y}
          x1={CL}
          y1={y}
          x2={CR}
          y2={y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Y axis label */}
      <text
        transform={`rotate(-90, 14, ${(CT + CB) / 2})`}
        x={14}
        y={(CT + CB) / 2 + 4}
        textAnchor="middle"
        fill="rgba(255,255,255,0.35)"
        fontSize={7.5}
      >
        GH (% relative output)
      </text>

      {/* Y axis ticks & labels */}
      {Y_TICKS.map(({ y, label }) => (
        <g key={label}>
          <line x1={CL - 4} y1={y} x2={CL} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <text x={CL - 7} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize={7}>
            {label}
          </text>
        </g>
      ))}

      {/* X axis */}
      <line x1={CL} y1={CB} x2={CR} y2={CB} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

      {/* X axis ticks & labels */}
      {X_TICKS.map(({ x, label }) => (
        <g key={label}>
          <line x1={x} y1={CB} x2={x} y2={CB + 4} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
          <text x={x} y={CB + 14} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={7}>
            {label}
          </text>
        </g>
      ))}

      {/* X axis label */}
      <text
        x={(CL + CR) / 2}
        y={CB + 26}
        textAnchor="middle"
        fill="rgba(255,255,255,0.35)"
        fontSize={7.5}
      >
        Time post-administration
      </text>

      {/* Dose trigger markers */}
      {isInView &&
        DOSE_TRIGGERS.map((x, i) => (
          <DoseMarker key={i} x={x} delay={0.3 + i * 0.1} />
        ))}

      {/* Area fills (draw under lines) */}
      <g clipPath="url(#chartClip)">
        {isInView && (
          <>
            <AreaFill d={CJC_PATH} color={CJC_COLOR} delay={0.5} />
            <AreaFill d={IPAMORELIN_PATH} color={IPAMORELIN_COLOR} delay={0.4} />
            <AreaFill d={COMBINED_PATH} color={COMBINED_COLOR} delay={0.8} />
          </>
        )}
      </g>

      {/* Waveform lines */}
      <g clipPath="url(#chartClip)">
        {isInView && (
          <>
            <WaveformPath d={CJC_PATH} color={CJC_COLOR} delay={0.5} opacity={0.75} />
            <WaveformPath d={IPAMORELIN_PATH} color={IPAMORELIN_COLOR} delay={0.4} opacity={0.75} />
            <WaveformPath d={COMBINED_PATH} color={COMBINED_COLOR} delay={0.8} strokeWidth={2.5} />
          </>
        )}
      </g>

      {/* Peak markers for combined output */}
      {isInView &&
        PULSE_CENTERS.map((x, i) => (
          <PeakMarker
            key={i}
            x={x}
            color={COMBINED_COLOR}
            label={i === 0 ? "~3.5×" : i === 1 ? "~3.3×" : "~3.4×"}
            delay={2.0 + i * 0.15}
          />
        ))}

      {/* Legend */}
      <g transform={`translate(${CL + 4}, ${CT + 6})`}>
        <rect x={0} y={0} width={250} height={50} rx={5}
          fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} />
        {[
          { color: COMBINED_COLOR, label: "Ipamorelin + CJC-1295 (combined)", sw: 2.5 },
          { color: IPAMORELIN_COLOR, label: "Ipamorelin alone", sw: 2 },
          { color: CJC_COLOR, label: "CJC-1295 alone", sw: 2 },
        ].map(({ color, label, sw }, i) => (
          <g key={i} transform={`translate(8, ${10 + i * 14})`}>
            <line x1={0} y1={4} x2={18} y2={4} stroke={color} strokeWidth={sw}
              style={{ filter: `drop-shadow(0 0 3px ${color}80)` }} />
            <text x={24} y={8} fill="rgba(255,255,255,0.7)" fontSize={7.5}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

const insightCards = [
  {
    color: IPAMORELIN_COLOR,
    title: "Ipamorelin — Discrete Pulses",
    body: "GHSR activation via Gq/PKC generates sharp, short-lived GH spikes with minimal co-secretion of cortisol. Pulse amplitude is limited by the single-receptor ceiling.",
  },
  {
    color: CJC_COLOR,
    title: "CJC-1295 — Sustained Elevation",
    body: "GHRHR activation via Gs/cAMP raises the GH secretory floor and broadens the secretion window, but without a GHSR agonist the amplitude remains moderate.",
  },
  {
    color: COMBINED_COLOR,
    title: "Combined — Multiplicative Output",
    body: "Dual-receptor co-activation synchronises both intracellular cascades in the same somatotroph. Pulse amplitude is 3-4× greater than either compound alone — a pharmacodynamic synergy, not mere addition.",
  },
];

export function GHPulseWaveformVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <div ref={containerRef} className="relative" data-testid="gh-pulse-waveform-visual">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(34,197,94,0.07) 0%, rgba(33,216,255,0.04) 60%, transparent 100%)",
        }}
      />

      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(33,216,255,0.06) 100%)",
            borderColor: COMBINED_COLOR,
            boxShadow: `0 0 18px ${COMBINED_COLOR}30`,
          }}
        >
          <TrendingUp
            className="h-5 w-5"
            style={{ color: COMBINED_COLOR, filter: `drop-shadow(0 0 4px ${COMBINED_COLOR}80)` }}
          />
          <span className="text-sm font-bold" style={{ color: COMBINED_COLOR }}>
            GH Pulse Waveform — Synergy Output
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Simulated pharmacodynamic waveforms illustrating GH pulse amplitude for each compound
          individually versus the combined stack. Peak labels show the relative multiplier over
          either compound alone.
        </p>
      </motion.div>

      {/* Chart */}
      <motion.div
        className="rounded-xl border p-4 mb-6"
        style={{
          borderColor: `${COMBINED_COLOR}28`,
          background: "linear-gradient(135deg, rgba(34,197,94,0.03) 0%, transparent 60%)",
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.1 }}
      >
        <WaveformChart isInView={isInView} />
      </motion.div>

      {/* Insight cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {insightCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 + idx * 0.12 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: `${card.color}0d`,
              borderColor: `${card.color}35`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: card.color, boxShadow: `0 0 6px ${card.color}` }}
              />
              <span className="text-xs font-bold leading-snug" style={{ color: card.color }}>
                {card.title}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Key synergy callout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.9 }}
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: `${COMBINED_COLOR}0d`,
          borderColor: `${COMBINED_COLOR}35`,
        }}
      >
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: COMBINED_COLOR }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: COMBINED_COLOR }}>
              Why the output exceeds the sum of parts
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When both receptors are activated simultaneously, the Gq/PKC and Gs/cAMP cascades
              converge on shared downstream effectors inside the somatotroph. This{" "}
              <strong className="text-foreground">intracellular amplification</strong> means the
              combined GH pulse is multiplicative — research models suggest a 3–5× amplitude gain
              versus either peptide administered alone at equivalent doses.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="text-center text-xs text-muted-foreground mt-5"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2 }}
      >
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Waveforms are illustrative pharmacodynamic models · For research education only
        </span>
      </motion.div>
    </div>
  );
}
