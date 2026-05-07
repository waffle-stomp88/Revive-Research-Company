import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Zap, Activity } from "lucide-react";

const IPAMORELIN_COLOR = "#E7FB10";
const CJC_COLOR = "#21d8ff";
const SOMATOTROPH_COLOR = "#9d4edd";
const GH_COLOR = "#22c55e";

// Quadratic bezier interpolation helper
function qBez(t: number, p0: [number, number], p1: [number, number], p2: [number, number]): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ];
}

// Pre-compute 5 keyframe points along each path
function bezierKeyframes(p0: [number, number], p1: [number, number], p2: [number, number]) {
  return [0, 0.25, 0.5, 0.75, 1].map(t => qBez(t, p0, p1, p2));
}

const ipamorelinKF = bezierKeyframes([130, 78], [130, 140], [180, 175]);
const cjcKF = bezierKeyframes([310, 78], [310, 140], [260, 175]);

interface ParticleProps {
  keyframes: [number, number][];
  color: string;
  delay: number;
  duration?: number;
}

function BezierParticle({ keyframes, color, delay, duration = 1.8 }: ParticleProps) {
  const cxValues = keyframes.map(k => k[0]);
  const cyValues = keyframes.map(k => k[1]);
  return (
    <motion.circle
      r={4}
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
        repeatDelay: 1.0,
        ease: "easeInOut",
      }}
    />
  );
}

function DualReceptorAnimation({ isInView }: { isInView: boolean }) {
  const [ghPulse, setGhPulse] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      interval = setInterval(() => setGhPulse(p => !p), 1500);
    }, 2200);
    return () => {
      clearTimeout(timeout);
      if (interval !== null) clearInterval(interval);
    };
  }, [isInView]);

  return (
    <svg viewBox="0 0 440 340" className="w-full h-auto" style={{ maxHeight: 360 }}>
      <defs>
        <radialGradient id="somatoGradDR" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SOMATOTROPH_COLOR} stopOpacity="0.25" />
          <stop offset="100%" stopColor={SOMATOTROPH_COLOR} stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="ghGradDR" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GH_COLOR} stopOpacity="0.4" />
          <stop offset="100%" stopColor={GH_COLOR} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Ipamorelin compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <circle
          cx={130}
          cy={48}
          r={30}
          fill={`${IPAMORELIN_COLOR}18`}
          stroke={IPAMORELIN_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${IPAMORELIN_COLOR}60)` }}
        />
        <text x={130} y={44} textAnchor="middle" fill={IPAMORELIN_COLOR} fontSize={8} fontWeight="700">
          Ipamorelin
        </text>
        <text x={130} y={57} textAnchor="middle" fill={`${IPAMORELIN_COLOR}bb`} fontSize={7}>
          GHSR agonist
        </text>
      </motion.g>

      {/* ── CJC-1295 compound node ── */}
      <motion.g
        initial={{ opacity: 0, y: -16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <circle
          cx={310}
          cy={48}
          r={30}
          fill={`${CJC_COLOR}18`}
          stroke={CJC_COLOR}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${CJC_COLOR}60)` }}
        />
        <text x={310} y={44} textAnchor="middle" fill={CJC_COLOR} fontSize={8} fontWeight="700">
          CJC-1295
        </text>
        <text x={310} y={57} textAnchor="middle" fill={`${CJC_COLOR}bb`} fontSize={7}>
          GHRHR agonist
        </text>
      </motion.g>

      {/* ── Signal arrows from compounds to somatotroph ── */}
      <motion.path
        d="M 130 78 Q 130 140 180 175"
        stroke={IPAMORELIN_COLOR}
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.65 } : {}}
        transition={{ duration: 0.9, delay: 0.4 }}
      />
      <motion.path
        d="M 310 78 Q 310 140 260 175"
        stroke={CJC_COLOR}
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.65 } : {}}
        transition={{ duration: 0.9, delay: 0.55 }}
      />

      {/* Animated signal particles along the bezier paths */}
      {isInView && (
        <>
          <BezierParticle keyframes={ipamorelinKF} color={IPAMORELIN_COLOR} delay={1.0} />
          <BezierParticle keyframes={ipamorelinKF} color={IPAMORELIN_COLOR} delay={2.6} />
          <BezierParticle keyframes={cjcKF} color={CJC_COLOR} delay={1.5} />
          <BezierParticle keyframes={cjcKF} color={CJC_COLOR} delay={3.1} />
        </>
      )}

      {/* ── Receptor labels on cell membrane ── */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9 }}
      >
        <rect x={148} y={168} width={44} height={16} rx={3}
          fill={`${IPAMORELIN_COLOR}22`} stroke={IPAMORELIN_COLOR} strokeWidth={1} />
        <text x={170} y={180} textAnchor="middle" fill={IPAMORELIN_COLOR} fontSize={7} fontWeight="700">
          GHSR
        </text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        <rect x={248} y={168} width={44} height={16} rx={3}
          fill={`${CJC_COLOR}22`} stroke={CJC_COLOR} strokeWidth={1} />
        <text x={270} y={180} textAnchor="middle" fill={CJC_COLOR} fontSize={7} fontWeight="700">
          GHRHR
        </text>
      </motion.g>

      {/* ── Somatotroph cell body ── */}
      <motion.ellipse
        cx={220}
        cy={215}
        rx={110}
        ry={65}
        fill="url(#somatoGradDR)"
        stroke={SOMATOTROPH_COLOR}
        strokeWidth={2}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
        style={{ filter: `drop-shadow(0 0 16px ${SOMATOTROPH_COLOR}40)` }}
      />
      <motion.text
        x={220}
        y={200}
        textAnchor="middle"
        fill={`${SOMATOTROPH_COLOR}cc`}
        fontSize={8}
        fontWeight="700"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
      >
        Somatotroph Cell
      </motion.text>

      {/* ── Intracellular cascade labels ── */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.2 }}
      >
        <rect x={140} y={208} width={56} height={28} rx={4}
          fill={`${IPAMORELIN_COLOR}15`} stroke={`${IPAMORELIN_COLOR}55`} strokeWidth={1} />
        <text x={168} y={220} textAnchor="middle" fill={IPAMORELIN_COLOR} fontSize={7} fontWeight="700">Gq / PKC</text>
        <text x={168} y={231} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={6.5}>cascade</text>
      </motion.g>
      <motion.g
        initial={{ opacity: 0, x: 10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.3 }}
      >
        <rect x={244} y={208} width={56} height={28} rx={4}
          fill={`${CJC_COLOR}15`} stroke={`${CJC_COLOR}55`} strokeWidth={1} />
        <text x={272} y={220} textAnchor="middle" fill={CJC_COLOR} fontSize={7} fontWeight="700">Gs / cAMP</text>
        <text x={272} y={231} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={6.5}>cascade</text>
      </motion.g>

      {/* Convergence arrows inside cell toward GH output */}
      <motion.path
        d="M 168 236 Q 194 256 220 270"
        stroke={IPAMORELIN_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.6 }}
      />
      <motion.path
        d="M 272 236 Q 246 256 220 270"
        stroke={CJC_COLOR}
        strokeWidth={1.5}
        fill="none"
        opacity={0.45}
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ delay: 1.6, duration: 0.6 }}
      />

      {/* ── GH Output node ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.8, duration: 0.5 }}
      >
        <motion.circle
          cx={220}
          cy={308}
          r={ghPulse ? 30 : 28}
          fill="url(#ghGradDR)"
          stroke={GH_COLOR}
          strokeWidth={ghPulse ? 3 : 2}
          transition={{ duration: 0.8 }}
          style={{ filter: `drop-shadow(0 0 14px ${GH_COLOR}80)` }}
        />
        <text x={220} y={304} textAnchor="middle" fill={GH_COLOR} fontSize={8} fontWeight="700">
          GH
        </text>
        <text x={220} y={316} textAnchor="middle" fill={GH_COLOR} fontSize={7}>
          Release
        </text>
      </motion.g>

      {/* Multiplicative label */}
      <motion.text
        x={220}
        y={337}
        textAnchor="middle"
        fill={`${GH_COLOR}bb`}
        fontSize={7.5}
        fontWeight="600"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2.1 }}
      >
        Multiplicative output — not merely additive
      </motion.text>

      {/* GH output particle */}
      {isInView && (
        <motion.circle
          r={4}
          cx={220}
          fill={GH_COLOR}
          style={{ filter: `drop-shadow(0 0 5px ${GH_COLOR})` }}
          initial={{ cy: 270, opacity: 0 }}
          animate={{ cy: [270, 295], opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, delay: 2.2, repeat: Infinity, repeatDelay: 1.2 }}
        />
      )}
    </svg>
  );
}

const cascadeCards = [
  {
    compound: "Ipamorelin",
    receptor: "GHSR",
    cascade: "Gq / PKC pathway",
    description:
      "Ipamorelin binds the growth hormone secretagogue receptor (GHSR), activating Gq proteins and protein kinase C to mobilize intracellular calcium and trigger discrete GH pulses — with minimal co-secretion of cortisol or prolactin.",
    effects: ["Discrete GH pulses", "Selective GHSR binding", "Low off-target hormones"],
    color: IPAMORELIN_COLOR,
  },
  {
    compound: "CJC-1295",
    receptor: "GHRHR",
    cascade: "Gs / cAMP / PKA pathway",
    description:
      "CJC-1295 is a stabilized GHRH(1-29) analog that activates the GHRH receptor (GHRHR) on somatotrophs, stimulating adenylyl cyclase, elevating cAMP, and activating PKA — increasing both GH pulse frequency and amplitude.",
    effects: ["GH pulse amplification", "Extended half-life via DAC", "Pituitary GHRHR activation"],
    color: CJC_COLOR,
  },
];

export function GHAmplifierDualReceptorVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  return (
    <div ref={containerRef} className="relative" data-testid="gh-amplifier-dual-receptor-visual">
      <div
        className="absolute inset-0 rounded-2xl blur-3xl -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 40% 30%, rgba(231,251,16,0.07) 0%, rgba(33,216,255,0.05) 60%, transparent 100%)",
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
            borderColor: IPAMORELIN_COLOR,
            boxShadow: `0 0 18px ${IPAMORELIN_COLOR}30`,
          }}
        >
          <Zap
            className="h-5 w-5"
            style={{ color: IPAMORELIN_COLOR, filter: `drop-shadow(0 0 4px ${IPAMORELIN_COLOR}80)` }}
          />
          <span className="text-sm font-bold" style={{ color: IPAMORELIN_COLOR }}>
            Dual-Receptor Convergence
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Ipamorelin and CJC-1295 activate complementary receptors on the same somatotroph cell,
          converging through distinct intracellular cascades to produce multiplicative GH output.
        </p>
      </motion.div>

      {/* Animated SVG diagram */}
      <div
        className="rounded-xl border p-4 mb-6"
        style={{
          borderColor: `${SOMATOTROPH_COLOR}30`,
          background: "linear-gradient(135deg, rgba(157,78,221,0.04) 0%, transparent 60%)",
        }}
      >
        <DualReceptorAnimation isInView={isInView} />
      </div>

      {/* Cascade detail cards */}
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
              {card.effects.map(e => (
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
          backgroundColor: `${GH_COLOR}0d`,
          borderColor: `${GH_COLOR}35`,
        }}
      >
        <div className="flex items-start gap-2">
          <Activity className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: GH_COLOR }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: GH_COLOR }}>
              Why dual-receptor activation matters
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              GHSR agonists (Ipamorelin) and GHRH analogs (CJC-1295) engage distinct intracellular
              cascades — Gq/PKC and Gs/cAMP respectively — within the same somatotroph. This
              convergence produces a{" "}
              <strong className="text-foreground">multiplicative</strong>, not merely additive,
              increase in GH secretion. Neither compound alone achieves the same amplitude of GH
              pulse that the combination produces.
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
          GH Amplifier dual-receptor model · For research education only
        </span>
      </motion.div>
    </div>
  );
}
