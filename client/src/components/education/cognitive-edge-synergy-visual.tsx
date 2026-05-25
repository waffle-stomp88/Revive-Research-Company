import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, Activity } from "lucide-react";

const SEMAX_COLOR = "#D4FF1F";
const SELANK_COLOR = "#21d8ff";
const NEURON_COLOR = "#9d4edd";
const OUTPUT_COLOR = "#22c55e";

function qBez(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number]
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ];
}

function bezierKeyframes(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number]
) {
  return [0, 0.25, 0.5, 0.75, 1].map((t) => qBez(t, p0, p1, p2));
}

const semaxKF = bezierKeyframes([120, 78], [120, 145], [175, 178]);
const selankKF = bezierKeyframes([320, 78], [320, 145], [265, 178]);
const semaxOutKF = bezierKeyframes([175, 215], [195, 262], [220, 278]);
const selankOutKF = bezierKeyframes([265, 215], [245, 262], [220, 278]);

interface ParticleProps {
  keyframes: [number, number][];
  color: string;
  delay: number;
  duration?: number;
}

function BezierParticle({ keyframes, color, delay, duration = 1.8 }: ParticleProps) {
  const cxValues = keyframes.map((k) => k[0]);
  const cyValues = keyframes.map((k) => k[1]);
  return (
    <motion.circle
      r={3.5}
      fill={color}
      style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      initial={{ cx: cxValues[0], cy: cyValues[0], opacity: 0 }}
      animate={{
        cx: cxValues,
        cy: cyValues,
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 1.2,
        ease: "easeInOut",
      }}
    />
  );
}

function CognitiveEdgeAnimation({ isInView }: { isInView: boolean }) {
  const [outputPulse, setOutputPulse] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      interval = setInterval(() => setOutputPulse((p) => !p), 1600);
    }, 2400);
    return () => {
      clearTimeout(timeout);
      if (interval !== null) clearInterval(interval);
    };
  }, [isInView]);

  return (
    <svg viewBox="0 0 440 350" className="w-full h-auto" style={{ maxHeight: 370 }}>
      <defs>
        <radialGradient id="neuronGradCE" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={NEURON_COLOR} stopOpacity="0.22" />
          <stop offset="100%" stopColor={NEURON_COLOR} stopOpacity="0.04" />
        </radialGradient>
        <radialGradient id="outputGradCE" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={OUTPUT_COLOR} stopOpacity="0.4" />
          <stop offset="100%" stopColor={OUTPUT_COLOR} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Semax compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <circle
          cx={120}
          cy={48}
          r={32}
          fill={`${SEMAX_COLOR}18`}
          stroke={SEMAX_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${SEMAX_COLOR}60)` }}
        />
        <text x={120} y={43} textAnchor="middle" fill={SEMAX_COLOR} fontSize={8} fontWeight="700">
          Semax
        </text>
        <text x={120} y={54} textAnchor="middle" fill={`${SEMAX_COLOR}bb`} fontSize={6.5}>
          ACTH(4-10) analog
        </text>
        <text x={120} y={64} textAnchor="middle" fill={`${SEMAX_COLOR}88`} fontSize={6}>
          BDNF / NGF
        </text>
      </motion.g>

      {/* ── Selank compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <circle
          cx={320}
          cy={48}
          r={32}
          fill={`${SELANK_COLOR}18`}
          stroke={SELANK_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${SELANK_COLOR}60)` }}
        />
        <text x={320} y={43} textAnchor="middle" fill={SELANK_COLOR} fontSize={8} fontWeight="700">
          Selank
        </text>
        <text x={320} y={54} textAnchor="middle" fill={`${SELANK_COLOR}bb`} fontSize={6.5}>
          Tuftsin analog
        </text>
        <text x={320} y={64} textAnchor="middle" fill={`${SELANK_COLOR}88`} fontSize={6}>
          GABA-A / IL-6
        </text>
      </motion.g>

      {/* ── Pathway arrows down to receptors/neuron ── */}
      <motion.path
        d="M 120 80 Q 120 145 175 178"
        stroke={SEMAX_COLOR}
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.65 } : {}}
        transition={{ duration: 0.9, delay: 0.4 }}
      />
      <motion.path
        d="M 320 80 Q 320 145 265 178"
        stroke={SELANK_COLOR}
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.65 } : {}}
        transition={{ duration: 0.9, delay: 0.55 }}
      />

      {/* ── Particles ── */}
      {isInView && (
        <>
          <BezierParticle keyframes={semaxKF} color={SEMAX_COLOR} delay={1.1} />
          <BezierParticle keyframes={semaxKF} color={SEMAX_COLOR} delay={2.7} />
          <BezierParticle keyframes={selankKF} color={SELANK_COLOR} delay={1.6} />
          <BezierParticle keyframes={selankKF} color={SELANK_COLOR} delay={3.2} />
          <BezierParticle keyframes={semaxOutKF} color={SEMAX_COLOR} delay={2.3} duration={1.2} />
          <BezierParticle keyframes={selankOutKF} color={SELANK_COLOR} delay={2.8} duration={1.2} />
        </>
      )}

      {/* ── Receptor labels on the cell membrane ── */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9 }}
      >
        <rect x={138} y={170} width={52} height={18} rx={3}
          fill={`${SEMAX_COLOR}22`} stroke={SEMAX_COLOR} strokeWidth={1} />
        <text x={164} y={183} textAnchor="middle" fill={SEMAX_COLOR} fontSize={7} fontWeight="700">
          TrkB / p75
        </text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        <rect x={252} y={170} width={52} height={18} rx={3}
          fill={`${SELANK_COLOR}22`} stroke={SELANK_COLOR} strokeWidth={1} />
        <text x={278} y={183} textAnchor="middle" fill={SELANK_COLOR} fontSize={7} fontWeight="700">
          GABA-A / IL-6
        </text>
      </motion.g>

      {/* ── Neuron cell body ── */}
      <motion.ellipse
        cx={220}
        cy={222}
        rx={112}
        ry={58}
        fill="url(#neuronGradCE)"
        stroke={NEURON_COLOR}
        strokeWidth={2}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.75 }}
        style={{ filter: `drop-shadow(0 0 14px ${NEURON_COLOR}40)` }}
      />
      <motion.text
        x={220}
        y={207}
        textAnchor="middle"
        fill={`${NEURON_COLOR}cc`}
        fontSize={8}
        fontWeight="700"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        Cortical Neuron
      </motion.text>

      {/* ── Intracellular pathway labels ── */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.2 }}
      >
        <rect x={133} y={215} width={60} height={30} rx={4}
          fill={`${SEMAX_COLOR}15`} stroke={`${SEMAX_COLOR}55`} strokeWidth={1} />
        <text x={163} y={227} textAnchor="middle" fill={SEMAX_COLOR} fontSize={7} fontWeight="700">
          MAPK / CREB
        </text>
        <text x={163} y={238} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize={6.5}>
          neuroplasticity
        </text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.3 }}
      >
        <rect x={248} y={215} width={60} height={30} rx={4}
          fill={`${SELANK_COLOR}15`} stroke={`${SELANK_COLOR}55`} strokeWidth={1} />
        <text x={278} y={227} textAnchor="middle" fill={SELANK_COLOR} fontSize={7} fontWeight="700">
          GABAergic calm
        </text>
        <text x={278} y={238} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize={6.5}>
          stress gating
        </text>
      </motion.g>

      {/* ── Convergence arrows toward cognitive output ── */}
      <motion.path
        d="M 163 245 Q 191 265 220 278"
        stroke={SEMAX_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.6 }}
      />
      <motion.path
        d="M 278 245 Q 249 265 220 278"
        stroke={SELANK_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.6, duration: 0.6 }}
      />

      {/* ── Cognitive output node ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        <motion.circle
          cx={220}
          cy={318}
          r={outputPulse ? 30 : 27}
          fill="url(#outputGradCE)"
          stroke={OUTPUT_COLOR}
          strokeWidth={outputPulse ? 3 : 2}
          transition={{ duration: 0.9 }}
          style={{ filter: `drop-shadow(0 0 14px ${OUTPUT_COLOR}80)` }}
        />
        <text x={220} y={313} textAnchor="middle" fill={OUTPUT_COLOR} fontSize={7.5} fontWeight="700">
          Focused
        </text>
        <text x={220} y={325} textAnchor="middle" fill={OUTPUT_COLOR} fontSize={7.5} fontWeight="700">
          Clarity
        </text>
      </motion.g>

      {/* ── Synergy label ── */}
      <motion.text
        x={220}
        y={348}
        textAnchor="middle"
        fill={`${OUTPUT_COLOR}bb`}
        fontSize={7.5}
        fontWeight="600"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2.2 }}
      >
        Enhancement + calm — without receptor competition
      </motion.text>
    </svg>
  );
}

const cascadeCards = [
  {
    compound: "Semax",
    receptor: "TrkB / p75NTR",
    cascade: "MAPK / ERK / CREB pathway",
    description:
      "Semax is an ACTH(4-10) analog that elevates Brain-Derived Neurotrophic Factor (BDNF) and Nerve Growth Factor (NGF), activating TrkB and p75NTR receptors. Downstream MAPK/ERK/CREB signaling enhances synaptic plasticity, long-term potentiation, and cognitive processing speed.",
    effects: ["BDNF / NGF upregulation", "Synaptic LTP enhancement", "Cognitive processing speed"],
    color: SEMAX_COLOR,
  },
  {
    compound: "Selank",
    receptor: "GABA-A / Cytokine axis",
    cascade: "GABAergic modulation + IL-6 suppression",
    description:
      "Selank is a tuftsin-derived heptapeptide that positively modulates GABA-A receptors and suppresses pro-inflammatory cytokines, particularly IL-6, through immune-neuroendocrine cross-talk. This creates anxiolytic neuroprotection without sedation, enabling calm focused states.",
    effects: ["GABA-A positive modulation", "IL-6 / cytokine reduction", "Anxiolytic neuroprotection"],
    color: SELANK_COLOR,
  },
];

export function CognitiveEdgeSynergyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <div ref={containerRef} className="relative" data-testid="cognitive-edge-synergy-visual">
      <div
        className="absolute inset-0 rounded-2xl blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 40% 30%, rgba(231,251,16,0.06) 0%, rgba(33,216,255,0.05) 60%, transparent 100%)",
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
              "linear-gradient(135deg, rgba(231,251,16,0.12) 0%, rgba(33,216,255,0.08) 100%)",
            borderColor: SEMAX_COLOR,
            boxShadow: `0 0 18px ${SEMAX_COLOR}30`,
          }}
        >
          <Brain
            className="h-5 w-5"
            style={{ color: SEMAX_COLOR, filter: `drop-shadow(0 0 4px ${SEMAX_COLOR}80)` }}
          />
          <span className="text-sm font-bold" style={{ color: SEMAX_COLOR }}>
            Dual-Pathway Cognitive Convergence
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Semax drives neurotrophic enhancement via BDNF/NGF while Selank delivers GABAergic calm
          and neuroprotection — two non-competing pathways that converge on focused, stress-free
          cognitive performance.
        </p>
      </motion.div>

      {/* Animated SVG diagram */}
      <div
        className="rounded-xl border p-4 mb-6"
        style={{
          borderColor: `${NEURON_COLOR}30`,
          background: "linear-gradient(135deg, rgba(157,78,221,0.04) 0%, transparent 60%)",
        }}
      >
        <CognitiveEdgeAnimation isInView={isInView} />
      </div>

      {/* Compound cascade cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {cascadeCards.map((card, idx) => (
          <motion.div
            key={card.compound}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 + idx * 0.15 }}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: `${card.color}0d`,
              borderColor: `${card.color}35`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: card.color, boxShadow: `0 0 6px ${card.color}` }}
              />
              <span className="text-xs font-bold" style={{ color: card.color }}>
                {card.compound}
              </span>
              <span className="text-xs text-muted-foreground">→ {card.receptor}</span>
            </div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: `${card.color}bb` }}>
              {card.cascade}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {card.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {card.effects.map((e) => (
                <span
                  key={e}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: `${card.color}18`,
                    color: card.color,
                    border: `1px solid ${card.color}40`,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Synergy result */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8 }}
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: `${OUTPUT_COLOR}0d`,
          borderColor: `${OUTPUT_COLOR}35`,
        }}
      >
        <div className="flex items-start gap-2">
          <Activity className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: OUTPUT_COLOR }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: OUTPUT_COLOR }}>
              Why this combination avoids receptor competition
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlike many peptide pairings, Semax and Selank act on entirely distinct molecular
              targets — neurotrophic receptors (TrkB/p75) vs. GABAergic and cytokine systems.
              There is no receptor-level competition or cross-inhibition. Semax delivers
              cognitive{" "}
              <strong className="text-foreground">drive</strong> while Selank provides{" "}
              <strong className="text-foreground">neuroprotective calm</strong>, collectively
              producing focused clarity that neither peptide achieves alone.
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
          Cognitive Edge dual-pathway model · For research education only
        </span>
      </motion.div>
    </div>
  );
}
