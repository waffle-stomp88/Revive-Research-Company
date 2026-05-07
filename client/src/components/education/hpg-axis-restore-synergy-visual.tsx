import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FlaskConical, Activity } from "lucide-react";

const KISSPEPTIN_COLOR = "#E7FB10";
const MELANOTAN_COLOR = "#f472b6";
const GnRH_CELL_COLOR = "#9d4edd";
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

const kisspeptinKF = bezierKeyframes([120, 78], [120, 145], [178, 178]);
const melanotanKF = bezierKeyframes([320, 78], [320, 145], [262, 178]);
const kisspeptinOutKF = bezierKeyframes([178, 215], [198, 260], [220, 278]);
const melanotanOutKF = bezierKeyframes([262, 215], [242, 260], [220, 278]);

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

function HPGAxisAnimation({ isInView }: { isInView: boolean }) {
  const [outputPulse, setOutputPulse] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      interval = setInterval(() => setOutputPulse((p) => !p), 1700);
    }, 2500);
    return () => {
      clearTimeout(timeout);
      if (interval !== null) clearInterval(interval);
    };
  }, [isInView]);

  return (
    <svg viewBox="0 0 440 355" className="w-full h-auto" style={{ maxHeight: 375 }}>
      <defs>
        <radialGradient id="gnrhGradHPG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GnRH_CELL_COLOR} stopOpacity="0.22" />
          <stop offset="100%" stopColor={GnRH_CELL_COLOR} stopOpacity="0.04" />
        </radialGradient>
        <radialGradient id="outputGradHPG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={OUTPUT_COLOR} stopOpacity="0.4" />
          <stop offset="100%" stopColor={OUTPUT_COLOR} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Kisspeptin compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <circle
          cx={120}
          cy={48}
          r={34}
          fill={`${KISSPEPTIN_COLOR}18`}
          stroke={KISSPEPTIN_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${KISSPEPTIN_COLOR}60)` }}
        />
        <text x={120} y={42} textAnchor="middle" fill={KISSPEPTIN_COLOR} fontSize={8} fontWeight="700">
          Kisspeptin-10
        </text>
        <text x={120} y={54} textAnchor="middle" fill={`${KISSPEPTIN_COLOR}bb`} fontSize={6.5}>
          KISS1R agonist
        </text>
        <text x={120} y={65} textAnchor="middle" fill={`${KISSPEPTIN_COLOR}88`} fontSize={6}>
          GPR54
        </text>
      </motion.g>

      {/* ── Melanotan II compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <circle
          cx={320}
          cy={48}
          r={34}
          fill={`${MELANOTAN_COLOR}18`}
          stroke={MELANOTAN_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${MELANOTAN_COLOR}60)` }}
        />
        <text x={320} y={42} textAnchor="middle" fill={MELANOTAN_COLOR} fontSize={8} fontWeight="700">
          Melanotan II
        </text>
        <text x={320} y={54} textAnchor="middle" fill={`${MELANOTAN_COLOR}bb`} fontSize={6.5}>
          MC3R / MC4R agonist
        </text>
        <text x={320} y={65} textAnchor="middle" fill={`${MELANOTAN_COLOR}88`} fontSize={6}>
          Melanocortin
        </text>
      </motion.g>

      {/* ── Pathway arrows down to GnRH neuron ── */}
      <motion.path
        d="M 120 82 Q 120 145 178 178"
        stroke={KISSPEPTIN_COLOR}
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.65 } : {}}
        transition={{ duration: 0.9, delay: 0.4 }}
      />
      <motion.path
        d="M 320 82 Q 320 145 262 178"
        stroke={MELANOTAN_COLOR}
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
          <BezierParticle keyframes={kisspeptinKF} color={KISSPEPTIN_COLOR} delay={1.1} />
          <BezierParticle keyframes={kisspeptinKF} color={KISSPEPTIN_COLOR} delay={2.8} />
          <BezierParticle keyframes={melanotanKF} color={MELANOTAN_COLOR} delay={1.6} />
          <BezierParticle keyframes={melanotanKF} color={MELANOTAN_COLOR} delay={3.3} />
          <BezierParticle keyframes={kisspeptinOutKF} color={KISSPEPTIN_COLOR} delay={2.4} duration={1.2} />
          <BezierParticle keyframes={melanotanOutKF} color={MELANOTAN_COLOR} delay={2.9} duration={1.2} />
        </>
      )}

      {/* ── Receptor labels on GnRH neuron membrane ── */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9 }}
      >
        <rect x={142} y={171} width={54} height={18} rx={3}
          fill={`${KISSPEPTIN_COLOR}22`} stroke={KISSPEPTIN_COLOR} strokeWidth={1} />
        <text x={169} y={184} textAnchor="middle" fill={KISSPEPTIN_COLOR} fontSize={7} fontWeight="700">
          KISS1R / GPR54
        </text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        <rect x={244} y={171} width={54} height={18} rx={3}
          fill={`${MELANOTAN_COLOR}22`} stroke={MELANOTAN_COLOR} strokeWidth={1} />
        <text x={271} y={184} textAnchor="middle" fill={MELANOTAN_COLOR} fontSize={7} fontWeight="700">
          MC3R / MC4R
        </text>
      </motion.g>

      {/* ── GnRH Neuron cell body ── */}
      <motion.ellipse
        cx={220}
        cy={225}
        rx={115}
        ry={60}
        fill="url(#gnrhGradHPG)"
        stroke={GnRH_CELL_COLOR}
        strokeWidth={2}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.75 }}
        style={{ filter: `drop-shadow(0 0 14px ${GnRH_CELL_COLOR}40)` }}
      />
      <motion.text
        x={220}
        y={210}
        textAnchor="middle"
        fill={`${GnRH_CELL_COLOR}cc`}
        fontSize={8}
        fontWeight="700"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        GnRH Neuron
      </motion.text>

      {/* ── Intracellular pathway labels ── */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.2 }}
      >
        <rect x={130} y={218} width={66} height={30} rx={4}
          fill={`${KISSPEPTIN_COLOR}15`} stroke={`${KISSPEPTIN_COLOR}55`} strokeWidth={1} />
        <text x={163} y={230} textAnchor="middle" fill={KISSPEPTIN_COLOR} fontSize={7} fontWeight="700">
          Gq / IP3 / PKC
        </text>
        <text x={163} y={241} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize={6.5}>
          GnRH pulse trigger
        </text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.3 }}
      >
        <rect x={244} y={218} width={66} height={30} rx={4}
          fill={`${MELANOTAN_COLOR}15`} stroke={`${MELANOTAN_COLOR}55`} strokeWidth={1} />
        <text x={277} y={230} textAnchor="middle" fill={MELANOTAN_COLOR} fontSize={7} fontWeight="700">
          Gs / cAMP
        </text>
        <text x={277} y={241} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize={6.5}>
          HPG sensitization
        </text>
      </motion.g>

      {/* ── Convergence arrows toward GnRH / HPG output ── */}
      <motion.path
        d="M 163 248 Q 191 265 220 280"
        stroke={KISSPEPTIN_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.6 }}
      />
      <motion.path
        d="M 277 248 Q 249 265 220 280"
        stroke={MELANOTAN_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.6, duration: 0.6 }}
      />

      {/* ── HPG Axis output node ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        <motion.circle
          cx={220}
          cy={322}
          r={outputPulse ? 30 : 27}
          fill="url(#outputGradHPG)"
          stroke={OUTPUT_COLOR}
          strokeWidth={outputPulse ? 3 : 2}
          transition={{ duration: 0.9 }}
          style={{ filter: `drop-shadow(0 0 14px ${OUTPUT_COLOR}80)` }}
        />
        <text x={220} y={316} textAnchor="middle" fill={OUTPUT_COLOR} fontSize={7.5} fontWeight="700">
          GnRH / LH
        </text>
        <text x={220} y={328} textAnchor="middle" fill={OUTPUT_COLOR} fontSize={7.5} fontWeight="700">
          Pulse Restore
        </text>
      </motion.g>

      {/* ── Synergy label ── */}
      <motion.text
        x={220}
        y={352}
        textAnchor="middle"
        fill={`${OUTPUT_COLOR}bb`}
        fontSize={7.5}
        fontWeight="600"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2.2 }}
      >
        Dual-input HPG restoration — additive signaling on GnRH neurons
      </motion.text>
    </svg>
  );
}

const cascadeCards = [
  {
    compound: "Kisspeptin-10",
    receptor: "KISS1R (GPR54)",
    cascade: "Gq / IP3 / PKC pathway",
    description:
      "Kisspeptin-10 is the most potent endogenous activator of GnRH neurons. Binding KISS1R/GPR54 triggers a Gq-mediated cascade that releases intracellular calcium via IP3, driving pulsatile GnRH release from the hypothalamus — the master signal upstream of LH, FSH, and gonadal hormone synthesis.",
    effects: ["Pulsatile GnRH release", "LH / FSH stimulation", "HPG axis reactivation"],
    color: KISSPEPTIN_COLOR,
  },
  {
    compound: "Melanotan II",
    receptor: "MC3R / MC4R",
    cascade: "Gs / cAMP / PKA pathway",
    description:
      "Melanotan II activates central melanocortin receptors (MC3R and MC4R) in the hypothalamus, elevating cAMP via Gs proteins. This sensitizes hypothalamic neurons to upstream gonadotropin signals and amplifies HPG axis responsiveness, complementing the direct GnRH trigger of Kisspeptin.",
    effects: ["MC3R / MC4R activation", "Hypothalamic cAMP elevation", "HPG axis sensitization"],
    color: MELANOTAN_COLOR,
  },
];

export function HPGAxisRestoreSynergyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <div ref={containerRef} className="relative" data-testid="hpg-axis-restore-synergy-visual">
      <div
        className="absolute inset-0 rounded-2xl blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 40% 30%, rgba(231,251,16,0.06) 0%, rgba(244,114,182,0.05) 60%, transparent 100%)",
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
              "linear-gradient(135deg, rgba(231,251,16,0.12) 0%, rgba(244,114,182,0.08) 100%)",
            borderColor: KISSPEPTIN_COLOR,
            boxShadow: `0 0 18px ${KISSPEPTIN_COLOR}30`,
          }}
        >
          <FlaskConical
            className="h-5 w-5"
            style={{ color: KISSPEPTIN_COLOR, filter: `drop-shadow(0 0 4px ${KISSPEPTIN_COLOR}80)` }}
          />
          <span className="text-sm font-bold" style={{ color: KISSPEPTIN_COLOR }}>
            Dual-Input HPG Axis Convergence
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Kisspeptin-10 directly triggers pulsatile GnRH release via KISS1R while Melanotan II
          sensitizes hypothalamic melanocortin receptors — two complementary inputs that converge on
          the same GnRH neurons to restore HPG axis signaling.
        </p>
      </motion.div>

      {/* Animated SVG diagram */}
      <div
        className="rounded-xl border p-4 mb-6"
        style={{
          borderColor: `${GnRH_CELL_COLOR}30`,
          background: "linear-gradient(135deg, rgba(157,78,221,0.04) 0%, transparent 60%)",
        }}
      >
        <HPGAxisAnimation isInView={isInView} />
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
              Why this combination targets the HPG axis from two angles
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kisspeptin-10 is the endogenous "on-switch" for GnRH neurons — it provides the direct
              pulse trigger that drives LH and FSH release. Melanotan II acts through a parallel
              melanocortin pathway to sensitize the same hypothalamic neurons, increasing their
              responsiveness to upstream signals. The two mechanisms are{" "}
              <strong className="text-foreground">non-competing</strong> and converge on the GnRH
              neuron from distinct receptor families, providing{" "}
              <strong className="text-foreground">additive HPG axis restoration</strong> without
              pathway interference.
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
          HPG Axis Restore dual-input model · For research education only
        </span>
      </motion.div>
    </div>
  );
}
