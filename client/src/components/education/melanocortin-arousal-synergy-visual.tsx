import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Heart, Activity } from "lucide-react";

const PT141_COLOR = "#D4FF1F";
const OXYTOCIN_COLOR = "#21d8ff";
const HYPOTHALAMUS_COLOR = "#f472b6";
const OUTPUT_COLOR = "#fb923c";

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

const pt141KF = bezierKeyframes([120, 78], [120, 145], [178, 178]);
const oxytocinKF = bezierKeyframes([320, 78], [320, 145], [262, 178]);
const pt141OutKF = bezierKeyframes([178, 215], [198, 260], [220, 278]);
const oxytocinOutKF = bezierKeyframes([262, 215], [242, 260], [220, 278]);

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

function MelanocortinArousalAnimation({ isInView }: { isInView: boolean }) {
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
    <svg viewBox="0 0 440 355" className="w-full h-auto" style={{ maxHeight: 375 }}>
      <defs>
        <radialGradient id="hypothGradMA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={HYPOTHALAMUS_COLOR} stopOpacity="0.22" />
          <stop offset="100%" stopColor={HYPOTHALAMUS_COLOR} stopOpacity="0.04" />
        </radialGradient>
        <radialGradient id="outputGradMA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={OUTPUT_COLOR} stopOpacity="0.4" />
          <stop offset="100%" stopColor={OUTPUT_COLOR} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── PT-141 compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <circle
          cx={120}
          cy={48}
          r={33}
          fill={`${PT141_COLOR}18`}
          stroke={PT141_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${PT141_COLOR}60)` }}
        />
        <text x={120} y={42} textAnchor="middle" fill={PT141_COLOR} fontSize={8} fontWeight="700">
          PT-141
        </text>
        <text x={120} y={54} textAnchor="middle" fill={`${PT141_COLOR}bb`} fontSize={6.5}>
          Bremelanotide
        </text>
        <text x={120} y={65} textAnchor="middle" fill={`${PT141_COLOR}88`} fontSize={6}>
          MC4R agonist
        </text>
      </motion.g>

      {/* ── Oxytocin compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <circle
          cx={320}
          cy={48}
          r={33}
          fill={`${OXYTOCIN_COLOR}18`}
          stroke={OXYTOCIN_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${OXYTOCIN_COLOR}60)` }}
        />
        <text x={320} y={42} textAnchor="middle" fill={OXYTOCIN_COLOR} fontSize={8} fontWeight="700">
          Oxytocin
        </text>
        <text x={320} y={54} textAnchor="middle" fill={`${OXYTOCIN_COLOR}bb`} fontSize={6.5}>
          Neuropeptide
        </text>
        <text x={320} y={65} textAnchor="middle" fill={`${OXYTOCIN_COLOR}88`} fontSize={6}>
          OXTR agonist
        </text>
      </motion.g>

      {/* ── Pathway arrows down to hypothalamic circuit ── */}
      <motion.path
        d="M 120 81 Q 120 145 178 178"
        stroke={PT141_COLOR}
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.65 } : {}}
        transition={{ duration: 0.9, delay: 0.4 }}
      />
      <motion.path
        d="M 320 81 Q 320 145 262 178"
        stroke={OXYTOCIN_COLOR}
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
          <BezierParticle keyframes={pt141KF} color={PT141_COLOR} delay={1.1} />
          <BezierParticle keyframes={pt141KF} color={PT141_COLOR} delay={2.7} />
          <BezierParticle keyframes={oxytocinKF} color={OXYTOCIN_COLOR} delay={1.6} />
          <BezierParticle keyframes={oxytocinKF} color={OXYTOCIN_COLOR} delay={3.2} />
          <BezierParticle keyframes={pt141OutKF} color={PT141_COLOR} delay={2.3} duration={1.2} />
          <BezierParticle keyframes={oxytocinOutKF} color={OXYTOCIN_COLOR} delay={2.8} duration={1.2} />
        </>
      )}

      {/* ── Receptor labels on hypothalamic neurons ── */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9 }}
      >
        <rect x={142} y={171} width={50} height={18} rx={3}
          fill={`${PT141_COLOR}22`} stroke={PT141_COLOR} strokeWidth={1} />
        <text x={167} y={184} textAnchor="middle" fill={PT141_COLOR} fontSize={7} fontWeight="700">
          MC4R
        </text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        <rect x={248} y={171} width={50} height={18} rx={3}
          fill={`${OXYTOCIN_COLOR}22`} stroke={OXYTOCIN_COLOR} strokeWidth={1} />
        <text x={273} y={184} textAnchor="middle" fill={OXYTOCIN_COLOR} fontSize={7} fontWeight="700">
          OXTR
        </text>
      </motion.g>

      {/* ── Hypothalamic circuit (shared convergence region) ── */}
      <motion.ellipse
        cx={220}
        cy={225}
        rx={115}
        ry={60}
        fill="url(#hypothGradMA)"
        stroke={HYPOTHALAMUS_COLOR}
        strokeWidth={2}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.75 }}
        style={{ filter: `drop-shadow(0 0 14px ${HYPOTHALAMUS_COLOR}40)` }}
      />
      <motion.text
        x={220}
        y={210}
        textAnchor="middle"
        fill={`${HYPOTHALAMUS_COLOR}cc`}
        fontSize={8}
        fontWeight="700"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        Hypothalamic Arousal Circuit
      </motion.text>

      {/* ── Intracellular pathway labels ── */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.2 }}
      >
        <rect x={128} y={218} width={70} height={30} rx={4}
          fill={`${PT141_COLOR}15`} stroke={`${PT141_COLOR}55`} strokeWidth={1} />
        <text x={163} y={230} textAnchor="middle" fill={PT141_COLOR} fontSize={7} fontWeight="700">
          Gs / cAMP / PKA
        </text>
        <text x={163} y={241} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize={6.5}>
          central arousal drive
        </text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.3 }}
      >
        <rect x={242} y={218} width={70} height={30} rx={4}
          fill={`${OXYTOCIN_COLOR}15`} stroke={`${OXYTOCIN_COLOR}55`} strokeWidth={1} />
        <text x={277} y={230} textAnchor="middle" fill={OXYTOCIN_COLOR} fontSize={7} fontWeight="700">
          Gq / Ca²⁺ / PKC
        </text>
        <text x={277} y={241} textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontSize={6.5}>
          bonding / reward
        </text>
      </motion.g>

      {/* ── Convergence arrows toward arousal/bonding output ── */}
      <motion.path
        d="M 163 248 Q 191 265 220 280"
        stroke={PT141_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.6 }}
      />
      <motion.path
        d="M 277 248 Q 249 265 220 280"
        stroke={OXYTOCIN_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.6, duration: 0.6 }}
      />

      {/* ── Arousal + Bonding output node ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        <motion.circle
          cx={220}
          cy={322}
          r={outputPulse ? 30 : 27}
          fill="url(#outputGradMA)"
          stroke={OUTPUT_COLOR}
          strokeWidth={outputPulse ? 3 : 2}
          transition={{ duration: 0.9 }}
          style={{ filter: `drop-shadow(0 0 14px ${OUTPUT_COLOR}80)` }}
        />
        <text x={220} y={316} textAnchor="middle" fill={OUTPUT_COLOR} fontSize={7.5} fontWeight="700">
          Arousal +
        </text>
        <text x={220} y={328} textAnchor="middle" fill={OUTPUT_COLOR} fontSize={7.5} fontWeight="700">
          Bonding
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
        Melanocortin drive + oxytocinergic bonding — distinct receptor cross-talk
      </motion.text>
    </svg>
  );
}

const cascadeCards = [
  {
    compound: "PT-141 (Bremelanotide)",
    receptor: "MC4R (melanocortin-4)",
    cascade: "Gs / cAMP / PKA pathway",
    description:
      "PT-141 is a cyclic melanocortin analog that selectively activates MC4R in the hypothalamus. Unlike peripheral vasodilators, it works centrally via the Gs/cAMP cascade to elevate dopamine in mesolimbic circuits, generating a direct neurogenic arousal signal independent of vascular mechanisms.",
    effects: ["Central MC4R activation", "Mesolimbic dopamine elevation", "Neurogenic arousal signal"],
    color: PT141_COLOR,
  },
  {
    compound: "Oxytocin",
    receptor: "OXTR (oxytocin receptor)",
    cascade: "Gq / IP3 / Ca²⁺ pathway",
    description:
      "Oxytocin activates its Gq-coupled receptor (OXTR) to mobilize intracellular calcium via IP3, driving neuropeptide release across social, bonding, and reward circuits. In the context of arousal, oxytocinergic signaling enhances emotional attunement, trust, and the subjective depth of bonding experiences.",
    effects: ["OXTR Gq activation", "Social reward signaling", "Bonding / trust enhancement"],
    color: OXYTOCIN_COLOR,
  },
];

export function MelanocortinArousalSynergyVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <div ref={containerRef} className="relative" data-testid="melanocortin-arousal-synergy-visual">
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
            borderColor: PT141_COLOR,
            boxShadow: `0 0 18px ${PT141_COLOR}30`,
          }}
        >
          <Heart
            className="h-5 w-5"
            style={{ color: PT141_COLOR, filter: `drop-shadow(0 0 4px ${PT141_COLOR}80)` }}
          />
          <span className="text-sm font-bold" style={{ color: PT141_COLOR }}>
            Melanocortin + Oxytocinergic Receptor Cross-Talk
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          PT-141 drives central arousal through MC4R-mediated dopamine release while Oxytocin
          activates OXTR-mediated bonding and reward circuits — two non-competing receptor systems
          that converge on the hypothalamic arousal circuit.
        </p>
      </motion.div>

      {/* Animated SVG diagram */}
      <div
        className="rounded-xl border p-4 mb-6"
        style={{
          borderColor: `${HYPOTHALAMUS_COLOR}30`,
          background: "linear-gradient(135deg, rgba(244,114,182,0.04) 0%, transparent 60%)",
        }}
      >
        <MelanocortinArousalAnimation isInView={isInView} />
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
              Why MC4R and OXTR activation complement each other
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PT-141 acts through the melanocortin system to generate a{" "}
              <strong className="text-foreground">centrally driven arousal signal</strong> via
              dopaminergic pathways, while Oxytocin engages entirely separate OXTR-mediated circuits
              responsible for{" "}
              <strong className="text-foreground">bonding, trust, and social reward</strong>. The two
              receptor families do not compete — MC4R couples to Gs while OXTR couples to Gq —
              meaning their intracellular cascades run in parallel and reinforce each other at the
              level of the hypothalamic arousal circuit without cross-inhibition.
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
          Melanocortin Arousal receptor cross-talk model · For research education only
        </span>
      </motion.div>
    </div>
  );
}
