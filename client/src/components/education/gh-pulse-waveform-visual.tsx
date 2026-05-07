import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { TrendingUp, Zap, Info, SlidersHorizontal } from "lucide-react";

const IPAMORELIN_COLOR = "#E7FB10";
const CJC_COLOR = "#21d8ff";
const COMBINED_COLOR = "#22c55e";

// Chart coordinate constants
const CL = 52;   // left edge (x)
const CR = 418;  // right edge (x)
const CT = 26;   // top edge (y)
const CB = 204;  // bottom edge / baseline (y)

// ─── Path builders ──────────────────────────────────────────────────────────

function buildIpamoPath(centers: number[]): string {
  const PEAK_Y = 146;
  let path = `M ${CL} ${CB}`;
  let prev = CL;
  for (const cx of centers) {
    const left = cx - 45;
    const right = cx + 45;
    if (left > prev + 1) path += ` L ${left} ${CB}`;
    path += ` C ${left + 14} ${CB} ${left + 28} ${PEAK_Y + 2} ${cx} ${PEAK_Y}`;
    path += ` C ${cx + 16} ${PEAK_Y + 2} ${right - 14} ${CB} ${right} ${CB}`;
    prev = right;
  }
  path += ` L ${CR} ${CB}`;
  return path;
}

function buildCombinedPath(centers: number[], peakY: number = 38): string {
  let path = `M ${CL} ${CB}`;
  let prev = CL;
  for (const cx of centers) {
    const left = cx - 45;
    const right = cx + 45;
    if (left > prev + 1) path += ` L ${left} ${CB}`;
    path += ` C ${left + 14} ${CB} ${left + 26} ${peakY + 4} ${cx} ${peakY}`;
    path += ` C ${cx + 16} ${peakY + 4} ${right - 14} ${CB} ${right} ${CB}`;
    prev = right;
  }
  path += ` L ${CR} ${CB}`;
  return path;
}

function buildCjcPath(centers: number[]): string {
  const n = centers.length;
  if (n === 1) {
    const cx = centers[0];
    return (
      `M ${CL} ${CB} ` +
      `C ${CL + 30} ${CB} ${cx - 80} 162 ${cx} 158 ` +
      `C ${cx + 80} 156 ${CR - 30} 164 ${CR} 168`
    );
  }
  if (n === 2) {
    const [cx1, cx2] = centers;
    return (
      `M ${CL} ${CB} ` +
      `C ${CL + 30} ${CB} ${cx1 - 60} 162 ${cx1} 158 ` +
      `C ${cx1 + 60} 154 ${cx2 - 60} 155 ${cx2} 157 ` +
      `C ${cx2 + 60} 159 ${CR - 30} 162 ${CR} 166`
    );
  }
  // 3 pulses — existing broad sustained path
  return (
    `M ${CL} ${CB} ` +
    `C ${CL + 30} ${CB} ${CL + 64} 162 ${CL + 96} 158 ` +
    `C ${CL + 130} 154 ${CL + 155} 153 ${CL + 188} 155 ` +
    `C ${CL + 228} 157 ${CL + 268} 155 ${CL + 300} 157 ` +
    `C ${CL + 336} 159 ${CL + 352} 166 ${CR} 170`
  );
}

/** Dynamic CJC sustained-elevation path for arbitrary pulse counts (4+) */
function buildDynamicCjcPath(centers: number[]): string {
  const n = centers.length;
  if (n <= 3) return buildCjcPath(centers);
  const sustY = 157;
  const first = centers[0];
  const last = centers[n - 1];
  let path = `M ${CL} ${CB} C ${CL + 30} ${CB} ${first - 50} ${sustY + 8} ${first} ${sustY}`;
  for (let i = 1; i < n; i++) {
    const prev = centers[i - 1];
    const curr = centers[i];
    const span = curr - prev;
    path += ` C ${prev + span * 0.35} ${sustY - 2} ${curr - span * 0.35} ${sustY - 2} ${curr} ${sustY}`;
  }
  path += ` C ${last + 50} ${sustY + 4} ${CR - 30} ${sustY + 8} ${CR} ${sustY + 12}`;
  return path;
}

// ─── Custom scenario computation ─────────────────────────────────────────────

function buildCustomScenario(intervalH: number): Scenario {
  const chartWidth = CR - CL;
  // Number of visible pulses: show enough to fill ~12h equivalent display
  const numPulses = Math.max(1, Math.min(6, Math.round(12 / intervalH)));
  const displayHours = numPulses * intervalH;
  const unitsPerHour = chartWidth / displayHours;

  // Lag from dose to peak: 40% of the interval, capped at 1h
  const lagUnits = Math.min(unitsPerHour * Math.min(intervalH * 0.4, 1.0), 70);
  const spacing = intervalH * unitsPerHour;

  const pulseCenters: number[] = [];
  const doseTriggers: number[] = [];

  for (let i = 0; i < numPulses; i++) {
    const doseX = CL + i * spacing + 10;
    doseTriggers.push(Math.min(doseX, CR - 30));
    pulseCenters.push(Math.min(doseX + lagUnits, CR - 20));
  }

  // X labels: 5 evenly spaced ticks
  const xLabels = Array.from({ length: 5 }, (_, i) => {
    const h = (displayHours / 4) * i;
    if (h === 0) return "0";
    return Number.isInteger(h) ? `${h} h` : `${h.toFixed(1)} h`;
  });

  // Peak multipliers: highest on first pulse, slight attenuation on subsequent
  const baseMultiplier = 4.5 - (numPulses - 1) * 0.25;
  const peakMultipliers = Array.from({ length: numPulses }, (_, i) =>
    `~${Math.max(3.0, baseMultiplier - i * 0.1).toFixed(1)}×`
  );

  const intervalLabel = Number.isInteger(intervalH) ? `${intervalH}` : intervalH.toFixed(1);
  const pulseWord = numPulses === 1 ? "pulse" : "pulses";

  return {
    id: "custom",
    label: `Every ${intervalLabel} h`,
    xLabels,
    pulseCenters,
    doseTriggers,
    peakMultipliers,
    combinedPeakY: numPulses >= 4 ? 44 : 38,
    note: `Custom ${intervalLabel}-hour interval — ${numPulses} ${pulseWord} shown over a ${displayHours % 1 === 0 ? displayHours : displayHours.toFixed(1)}-hour window.`,
  };
}

// ─── Timing scenarios ────────────────────────────────────────────────────────

type Scenario = {
  id: string;
  label: string;
  xLabels: string[];
  pulseCenters: number[];
  doseTriggers: number[];
  peakMultipliers: string[];
  combinedPeakY: number;
  note: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "single",
    label: "Single dose",
    xLabels: ["0", "1 h", "2 h", "3 h", "4 h"],
    pulseCenters: [CL + 183],
    doseTriggers: [CL + 10],
    peakMultipliers: ["~4.5×"],
    combinedPeakY: 32,
    note: "One injection window — highest single-pulse amplitude, lowest total daily output.",
  },
  {
    id: "twice",
    label: "2× daily (AM/PM)",
    xLabels: ["0", "2 h", "4 h", "6 h", "8 h"],
    pulseCenters: [CL + 80, CL + 264],
    doseTriggers: [CL + 10, CL + 184],
    peakMultipliers: ["~3.8×", "~3.5×"],
    combinedPeakY: 38,
    note: "Morning and evening injection — slight second-pulse attenuation from residual CJC-1295 activity.",
  },
  {
    id: "every8h",
    label: "Every 8 h",
    xLabels: ["0", "3 h", "6 h", "9 h", "12 h"],
    pulseCenters: [CL + 44, CL + 158, CL + 278],
    doseTriggers: [CL + 10, CL + 124, CL + 244],
    peakMultipliers: ["~3.5×", "~3.3×", "~3.4×"],
    combinedPeakY: 38,
    note: "Three equal intervals — most consistent GH baseline across the full day.",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

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
      transition={{ duration: 1.4, delay, ease: "easeInOut" }}
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
  const closed = `${d} L ${CR} ${CB} L ${CL} ${CB} Z`;
  return (
    <motion.path
      d={closed}
      fill={color}
      fillOpacity={0}
      animate={{ fillOpacity: 0.07 }}
      transition={{ duration: 0.8, delay: delay + 1.2 }}
    />
  );
}

function PeakMarker({
  x,
  y,
  color,
  label,
  delay,
}: {
  x: number;
  y: number;
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
      <circle cx={x} cy={y} r={3.5} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <rect
        x={x - 16} y={y - 24} width={32} height={14} rx={3}
        style={{ fill: "hsl(var(--background) / 0.85)" }}
        stroke={color} strokeWidth={0.8} strokeOpacity={0.6}
      />
      <text x={x} y={y - 13} textAnchor="middle" fill={color} fontSize={7.5} fontWeight="700">
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
        stroke="currentColor"
        strokeOpacity={0.18}
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <text x={x} y={CB + 16} textAnchor="middle" fill="currentColor" fillOpacity={0.35} fontSize={6.5}>
        Dose
      </text>
    </motion.g>
  );
}

// Y axis ticks
const Y_TICKS = [
  { y: CB, label: "0" },
  { y: CB - (CB - CT) * 0.25, label: "25" },
  { y: CB - (CB - CT) * 0.5, label: "50" },
  { y: CB - (CB - CT) * 0.75, label: "75" },
  { y: CT, label: "100" },
];

function WaveformChart({
  isInView,
  scenario,
  animKey,
}: {
  isInView: boolean;
  scenario: Scenario;
  animKey: string;
}) {
  const ipamoPath = buildIpamoPath(scenario.pulseCenters);
  const cjcPath = scenario.id === "custom"
    ? buildDynamicCjcPath(scenario.pulseCenters)
    : buildCjcPath(scenario.pulseCenters);
  const combinedPath = buildCombinedPath(scenario.pulseCenters, scenario.combinedPeakY);

  const xTicks = scenario.xLabels.map((label, i) => ({
    x: CL + (CR - CL) * (i / (scenario.xLabels.length - 1)),
    label,
  }));

  return (
    <svg
      key={animKey}
      viewBox="0 0 470 240"
      className="w-full h-auto text-foreground"
      style={{ maxHeight: 280 }}
    >
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
          stroke="currentColor"
          strokeOpacity={0.06}
          strokeWidth={1}
        />
      ))}

      {/* Y axis label */}
      <text
        transform={`rotate(-90, 14, ${(CT + CB) / 2})`}
        x={14}
        y={(CT + CB) / 2 + 4}
        textAnchor="middle"
        fill="currentColor"
        fillOpacity={0.35}
        fontSize={7.5}
      >
        GH (% relative output)
      </text>

      {/* Y axis ticks & labels */}
      {Y_TICKS.map(({ y, label }) => (
        <g key={label}>
          <line x1={CL - 4} y1={y} x2={CL} y2={y} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1} />
          <text x={CL - 7} y={y + 3} textAnchor="end" fill="currentColor" fillOpacity={0.35} fontSize={7}>
            {label}
          </text>
        </g>
      ))}

      {/* X axis */}
      <line x1={CL} y1={CB} x2={CR} y2={CB} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />

      {/* X axis ticks & labels */}
      {xTicks.map(({ x, label }) => (
        <g key={label}>
          <line x1={x} y1={CB} x2={x} y2={CB + 4} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1} />
          <text x={x} y={CB + 14} textAnchor="middle" fill="currentColor" fillOpacity={0.35} fontSize={7}>
            {label}
          </text>
        </g>
      ))}

      {/* X axis label */}
      <text
        x={(CL + CR) / 2}
        y={CB + 26}
        textAnchor="middle"
        fill="currentColor"
        fillOpacity={0.35}
        fontSize={7.5}
      >
        Time post-administration
      </text>

      {/* Dose trigger markers */}
      {isInView &&
        scenario.doseTriggers.map((x, i) => (
          <DoseMarker key={i} x={x} delay={0.2 + i * 0.1} />
        ))}

      {/* Area fills (draw under lines) */}
      <g clipPath="url(#chartClip)">
        {isInView && (
          <>
            <AreaFill d={cjcPath} color={CJC_COLOR} delay={0.4} />
            <AreaFill d={ipamoPath} color={IPAMORELIN_COLOR} delay={0.3} />
            <AreaFill d={combinedPath} color={COMBINED_COLOR} delay={0.7} />
          </>
        )}
      </g>

      {/* Waveform lines */}
      <g clipPath="url(#chartClip)">
        {isInView && (
          <>
            <WaveformPath d={cjcPath} color={CJC_COLOR} delay={0.4} opacity={0.75} />
            <WaveformPath d={ipamoPath} color={IPAMORELIN_COLOR} delay={0.3} opacity={0.75} />
            <WaveformPath d={combinedPath} color={COMBINED_COLOR} delay={0.7} strokeWidth={2.5} />
          </>
        )}
      </g>

      {/* Peak markers for combined output */}
      {isInView &&
        scenario.pulseCenters.map((x, i) => (
          <PeakMarker
            key={i}
            x={x}
            y={scenario.combinedPeakY}
            color={COMBINED_COLOR}
            label={scenario.peakMultipliers[i] ?? scenario.peakMultipliers[0]}
            delay={1.8 + i * 0.15}
          />
        ))}

      {/* Legend */}
      <g transform={`translate(${CL + 4}, ${CT + 6})`}>
        <rect
          x={0} y={0} width={250} height={50} rx={5}
          style={{ fill: "hsl(var(--background) / 0.6)" }}
          stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.8}
        />
        {[
          { color: COMBINED_COLOR, label: "Ipamorelin + CJC-1295 (combined)", sw: 2.5 },
          { color: IPAMORELIN_COLOR, label: "Ipamorelin alone", sw: 2 },
          { color: CJC_COLOR, label: "CJC-1295 alone", sw: 2 },
        ].map(({ color, label, sw }, i) => (
          <g key={i} transform={`translate(8, ${10 + i * 14})`}>
            <line x1={0} y1={4} x2={18} y2={4} stroke={color} strokeWidth={sw}
              style={{ filter: `drop-shadow(0 0 3px ${color}80)` }} />
            <text x={24} y={8} fill="currentColor" fillOpacity={0.7} fontSize={7.5}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─── Timing toggle ───────────────────────────────────────────────────────────

const CUSTOM_ID = "custom";

function TimingToggle({
  selected,
  onChange,
  customIntervalH,
  onCustomIntervalChange,
}: {
  selected: string;
  onChange: (id: string) => void;
  customIntervalH: number;
  onCustomIntervalChange: (h: number) => void;
}) {
  const isCustom = selected === CUSTOM_ID;

  return (
    <div className="flex flex-col items-center gap-3" data-testid="timing-toggle">
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {SCENARIOS.map((s) => {
          const active = s.id === selected;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              data-testid={`timing-option-${s.id}`}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
              style={{
                background: active
                  ? `${COMBINED_COLOR}22`
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${active ? COMBINED_COLOR + "70" : "rgba(255,255,255,0.12)"}`,
                color: active ? COMBINED_COLOR : "rgba(255,255,255,0.55)",
                boxShadow: active ? `0 0 10px ${COMBINED_COLOR}28` : "none",
              }}
            >
              {s.label}
            </button>
          );
        })}

        {/* Custom option */}
        <button
          onClick={() => onChange(CUSTOM_ID)}
          data-testid="timing-option-custom"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
          style={{
            background: isCustom
              ? `${COMBINED_COLOR}22`
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${isCustom ? COMBINED_COLOR + "70" : "rgba(255,255,255,0.12)"}`,
            color: isCustom ? COMBINED_COLOR : "rgba(255,255,255,0.55)",
            boxShadow: isCustom ? `0 0 10px ${COMBINED_COLOR}28` : "none",
          }}
        >
          <SlidersHorizontal className="h-3 w-3" />
          Custom…
        </button>
      </div>

      {/* Custom interval input — visible only when "Custom…" is selected */}
      <AnimatePresence>
        {isCustom && (
          <motion.div
            key="custom-input"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg border"
              style={{
                borderColor: `${COMBINED_COLOR}40`,
                background: `${COMBINED_COLOR}08`,
              }}
            >
              <label
                htmlFor="custom-interval-input"
                className="text-xs font-semibold whitespace-nowrap"
                style={{ color: COMBINED_COLOR }}
              >
                Injection interval
              </label>
              <input
                id="custom-interval-input"
                data-testid="custom-interval-input"
                type="number"
                min={1}
                max={24}
                step={0.5}
                value={customIntervalH}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  if (!isNaN(raw)) {
                    onCustomIntervalChange(Math.min(24, Math.max(1, raw)));
                  }
                }}
                className="w-20 px-2 py-1 rounded-md text-xs font-mono text-center focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${COMBINED_COLOR}50`,
                  color: COMBINED_COLOR,
                }}
              />
              <span className="text-xs text-muted-foreground">hours &nbsp;(1 – 24)</span>
              <input
                data-testid="custom-interval-slider"
                type="range"
                min={1}
                max={24}
                step={0.5}
                value={customIntervalH}
                onChange={(e) => onCustomIntervalChange(parseFloat(e.target.value))}
                className="flex-1 min-w-0 accent-[#22c55e]"
                style={{ minWidth: 80 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/25 border border-white/8">
        <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground">
          For illustration only — not a dosing recommendation
        </span>
      </div>
    </div>
  );
}

// ─── Insight cards ───────────────────────────────────────────────────────────

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

// ─── Main export ─────────────────────────────────────────────────────────────

export function GHPulseWaveformVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });
  const [scenarioId, setScenarioId] = useState("every8h");
  const [customIntervalH, setCustomIntervalH] = useState(6);

  const isCustom = scenarioId === CUSTOM_ID;
  const scenario = isCustom
    ? buildCustomScenario(customIntervalH)
    : (SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[2]);

  // For custom mode, re-animate on every interval change
  const animKey = isCustom ? `custom-${customIntervalH}` : scenarioId;

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

      {/* Timing toggle */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.15 }}
      >
        <TimingToggle
          selected={scenarioId}
          onChange={setScenarioId}
          customIntervalH={customIntervalH}
          onCustomIntervalChange={setCustomIntervalH}
        />
      </motion.div>

      {/* Chart */}
      <motion.div
        className="rounded-xl border p-4 mb-4"
        style={{
          borderColor: `${COMBINED_COLOR}28`,
          background: "linear-gradient(135deg, rgba(34,197,94,0.03) 0%, transparent 60%)",
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.1 }}
      >
        <WaveformChart isInView={isInView} scenario={scenario} animKey={animKey} />
      </motion.div>

      {/* Scenario note */}
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="flex items-start gap-2 px-4 py-2.5 rounded-lg border mb-6"
          style={{
            borderColor: `${COMBINED_COLOR}25`,
            background: `${COMBINED_COLOR}08`,
          }}
          data-testid="scenario-note"
        >
          <Zap className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: COMBINED_COLOR }} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="font-semibold" style={{ color: COMBINED_COLOR }}>
              {scenario.label}:{" "}
            </strong>
            {scenario.note}
          </p>
        </motion.div>
      </AnimatePresence>

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
