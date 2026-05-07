import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Activity, Zap, TrendingUp, ArrowRight, Brain, Shield, RefreshCw, Heart, Users, Waves } from "lucide-react";

// ─── GONADORELIN ──────────────────────────────────────────────────────────────

function GonadorelinAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(157,78,221,0.1) 0%, transparent 70%)" }}
      />
      <svg viewBox="0 0 340 230" className="w-full h-full">
        <defs>
          <filter id="gnrhGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="gnrhArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#9d4edd" />
          </marker>
          <marker id="gnrhArrowCyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#21d8ff" />
          </marker>
        </defs>

        {/* Hypothalamus */}
        <motion.ellipse cx="170" cy="30" rx="55" ry="22"
          fill="rgba(157,78,221,0.2)" stroke="#9d4edd" strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}}
          style={{ filter: "drop-shadow(0 0 10px rgba(157,78,221,0.5))" }} />
        <motion.text x="170" y="27" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>Hypothalamus</motion.text>
        <motion.text x="170" y="39" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>GnRH Neurons</motion.text>

        {/* Portal connection */}
        <motion.line x1="170" y1="52" x2="170" y2="82"
          stroke="#9d4edd" strokeWidth="2" markerEnd="url(#gnrhArrow)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.4 }} />
        <motion.text x="185" y="69" fill="#9d4edd" fontSize="6.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>
          Portal Blood
        </motion.text>

        {/* Pituitary (GnRHR) */}
        <motion.ellipse cx="170" cy="108" rx="55" ry="22"
          fill="rgba(33,216,255,0.2)" stroke="#21d8ff" strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.3 }}
          style={{ filter: "drop-shadow(0 0 10px rgba(33,216,255,0.5))" }} />
        <motion.text x="170" y="105" textAnchor="middle" fill="#21d8ff" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}>
          Pituitary Gonadotrophs
        </motion.text>
        <motion.text x="170" y="116" textAnchor="middle" fill="#21d8ff" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}>
          GnRHR (Gq-coupled)
        </motion.text>

        {/* LH/FSH arrow */}
        <motion.line x1="170" y1="130" x2="170" y2="160"
          stroke="#21d8ff" strokeWidth="2" markerEnd="url(#gnrhArrowCyan)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}}
          transition={{ delay: 0.8 }} />

        {/* LH box */}
        <motion.rect x="95" y="163" width="55" height="28" rx="6"
          fill="rgba(231,251,16,0.2)" stroke="#E7FB10" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.9 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(231,251,16,0.4))" }} />
        <motion.text x="122" y="179" textAnchor="middle" fill="#E7FB10" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.0 }}>
          LH Release
        </motion.text>

        {/* FSH box */}
        <motion.rect x="188" y="163" width="55" height="28" rx="6"
          fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 1.0 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(34,197,94,0.4))" }} />
        <motion.text x="215" y="179" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.1 }}>
          FSH Release
        </motion.text>

        {/* Gonadorelin label (left side) */}
        <motion.rect x="18" y="92" width="68" height="30" rx="6"
          fill="rgba(157,78,221,0.2)" stroke="#9d4edd" strokeWidth="2"
          initial={{ x: -30, opacity: 0 }} animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 1.2, type: "spring" }}
          style={{ filter: "drop-shadow(0 0 12px rgba(157,78,221,0.5))" }} />
        <motion.text x="52" y="108" textAnchor="middle" fill="#9d4edd" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}>
          Gonadorelin
        </motion.text>
        <motion.text x="52" y="118" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}>
          GnRH identical
        </motion.text>
        <motion.path d="M 86 107 L 115 108"
          stroke="#9d4edd" strokeWidth="2.5" markerEnd="url(#gnrhArrow)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.5 }}
          style={{ filter: "drop-shadow(0 0 5px rgba(157,78,221,0.6))" }} />

        {/* Pulsatile dots */}
        {[0, 1, 2].map((i) => (
          <motion.circle key={`gnrh-dot-${i}`} r="4" fill="#9d4edd"
            initial={{ opacity: 0, cx: 170, cy: 52 }}
            animate={isInView ? { cy: [52, 82, 130], opacity: [0, 1, 1, 0] } : {}}
            transition={{ duration: 1.4, delay: 1.6 + i * 0.45, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 6px rgba(157,78,221,0.9))" }} />
        ))}

        {/* Half-life note */}
        <motion.text x="258" y="108" textAnchor="middle" fill="#f97316" fontSize="7.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.6 }}>
          Short t½
        </motion.text>
        <motion.text x="258" y="119" textAnchor="middle" fill="#f97316" fontSize="6.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.6 }}>
          ~2–4 min
        </motion.text>
      </svg>
    </div>
  );
}

const gonadorelinFeatures = [
  { title: "GnRHR Agonism", description: "Binds Gq-coupled GnRH receptors on pituitary gonadotrophs, triggering PLC/IP3-mediated calcium mobilization and LH/FSH exocytosis", icon: Zap, color: "#9d4edd" },
  { title: "Pulse Encoding", description: "GnRH pulse frequency and amplitude determine the LH:FSH ratio — a frequency-encoding mechanism researchers can study under controlled conditions", icon: Activity, color: "#21d8ff" },
  { title: "Rapid Degradation", description: "Short half-life (~2–4 min) due to proteolytic degradation enables studies of acute GnRHR activation without the receptor desensitization caused by long-acting analogs", icon: TrendingUp, color: "#E7FB10" },
];

export function GonadorelinVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{ background: "radial-gradient(ellipse at center, rgba(157,78,221,0.08) 0%, transparent 70%)" }} />

      <motion.div className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{ background: "linear-gradient(135deg, rgba(157,78,221,0.15) 0%, rgba(33,216,255,0.05) 100%)", borderColor: "#9d4edd", boxShadow: "0 0 20px rgba(157,78,221,0.3)" }}>
          <Brain className="h-5 w-5 text-[#9d4edd]" style={{ filter: "drop-shadow(0 0 4px rgba(157,78,221,0.6))" }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#9d4edd] to-[#21d8ff] bg-clip-text text-transparent">
            Pituitary GnRHR Activation &amp; HPG Cascade
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Gonadorelin — a sequence-identical GnRH analog — directly stimulates pituitary gonadotrophs to release LH and FSH
        </p>
      </motion.div>

      <div className="rounded-xl border p-6 mb-6"
        style={{ borderColor: "rgba(157,78,221,0.3)", background: "linear-gradient(135deg, rgba(157,78,221,0.05) 0%, transparent 50%)" }}>
        <GonadorelinAnimation isInView={isInView} />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {gonadorelinFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.8 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${f.color}10`, border: `1px solid ${f.color}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${f.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: f.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: f.color }}>{f.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.4 }}
          className="mt-4 p-3 rounded-lg bg-[#9d4edd]/10 border border-[#9d4edd]/20">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-[#9d4edd] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key insight:</strong> Because Gonadorelin is sequence-identical to endogenous GnRH,
              it is rapidly cleared by proteases — making it ideal for studying short-burst GnRHR activation without the sustained
              desensitization or receptor downregulation produced by modified long-acting analogs like Triptorelin or Leuprolide.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.8 }}>
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Gonadorelin HPG axis visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}

// ─── TRIPTORELIN ─────────────────────────────────────────────────────────────

function TriptorelinAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)" }} />
      <svg viewBox="0 0 340 230" className="w-full h-full">
        <defs>
          <filter id="tripGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="tripArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
          </marker>
          <marker id="tripArrowRed" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>

        {/* Triptorelin compound */}
        <motion.rect x="20" y="88" width="80" height="40" rx="8"
          fill="rgba(249,115,22,0.2)" stroke="#f97316" strokeWidth="2"
          initial={{ x: -40, opacity: 0 }} animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ delay: 0.2, type: "spring" }}
          style={{ filter: "drop-shadow(0 0 12px rgba(249,115,22,0.5))" }} />
        <motion.text x="60" y="105" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
          Triptorelin
        </motion.text>
        <motion.text x="60" y="116" textAnchor="middle" fill="#f97316" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
          D-Trp6-GnRH
        </motion.text>
        <motion.text x="60" y="125" textAnchor="middle" fill="#f97316" fontSize="6.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>
          ~100× binding affinity
        </motion.text>

        <motion.path d="M 100 108 L 130 108"
          stroke="#f97316" strokeWidth="2.5" markerEnd="url(#tripArrow)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.7 }}
          style={{ filter: "drop-shadow(0 0 5px rgba(249,115,22,0.6))" }} />

        {/* GnRHR receptor */}
        <motion.ellipse cx="195" cy="108" rx="58" ry="28"
          fill="rgba(157,78,221,0.2)" stroke="#9d4edd" strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.4 }}
          style={{ filter: "drop-shadow(0 0 10px rgba(157,78,221,0.4))" }} />
        <motion.text x="195" y="104" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>
          GnRHR (Gq-coupled)
        </motion.text>
        <motion.text x="195" y="115" textAnchor="middle" fill="#9d4edd" fontSize="7.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>
          Pituitary Gonadotroph
        </motion.text>

        {/* Phase 1: Acute surge (left) */}
        <motion.rect x="18" y="162" width="130" height="38" rx="7"
          fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1.5"
          initial={{ opacity: 0, y: 15 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.0 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.3))" }} />
        <motion.text x="83" y="178" textAnchor="middle" fill="#22c55e" fontSize="8.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}>
          Phase 1 — Acute Surge
        </motion.text>
        <motion.text x="83" y="190" textAnchor="middle" fill="#22c55e" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}>
          ↑ LH / FSH secretion
        </motion.text>

        {/* Phase 2: Desensitization (right) */}
        <motion.rect x="192" y="162" width="132" height="38" rx="7"
          fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5"
          initial={{ opacity: 0, y: 15 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.2 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.3))" }} />
        <motion.text x="258" y="178" textAnchor="middle" fill="#ef4444" fontSize="8.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}>
          Phase 2 — Desensitization
        </motion.text>
        <motion.text x="258" y="190" textAnchor="middle" fill="#ef4444" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.4 }}>
          GnRHR internalization / ↓ LH
        </motion.text>

        {/* Arrow between phases */}
        <motion.line x1="148" y1="181" x2="190" y2="181"
          stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#tripArrowRed)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.5 }} />
        <motion.text x="169" y="175" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.7 }}>
          sustained
        </motion.text>
        <motion.text x="169" y="184" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="6"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.7 }}>
          exposure
        </motion.text>

        {/* Animated binding pulse */}
        <motion.circle r="5" fill="#f97316"
          initial={{ opacity: 0, cx: 105, cy: 108 }}
          animate={isInView ? { cx: [105, 137, 170], cy: [108, 108, 108], opacity: [0, 1, 0] } : {}}
          transition={{ duration: 1.2, delay: 1.8, repeat: Infinity, repeatDelay: 1.0, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 7px rgba(249,115,22,0.9))" }} />
      </svg>
    </div>
  );
}

const triptorelinFeatures = [
  { title: "High-Affinity Binding", description: "D-Trp6 substitution confers ~100-fold greater GnRHR binding affinity and resistance to proteolytic degradation vs. native GnRH", icon: Shield, color: "#f97316" },
  { title: "Agonist Paradox", description: "Acute doses produce a pronounced LH/FSH surge; sustained exposure causes receptor internalization and progressive HPG axis suppression", icon: RefreshCw, color: "#ef4444" },
  { title: "Receptor Research", description: "Used to study GnRHR desensitization kinetics, receptor trafficking, and pulse-frequency sensitivity in gonadotroph cells", icon: Activity, color: "#9d4edd" },
];

export function TriptorelinVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.08) 0%, transparent 70%)" }} />

      <motion.div className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(157,78,221,0.05) 100%)", borderColor: "#f97316", boxShadow: "0 0 20px rgba(249,115,22,0.3)" }}>
          <Zap className="h-5 w-5 text-[#f97316]" style={{ filter: "drop-shadow(0 0 4px rgba(249,115,22,0.6))" }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#f97316] to-[#9d4edd] bg-clip-text text-transparent">
            GnRHR Binding &amp; Agonist Paradox
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Triptorelin's D-Trp6 modification produces high-affinity GnRHR binding — and the biphasic stimulation-then-desensitization response that defines its research utility
        </p>
      </motion.div>

      <div className="rounded-xl border p-6 mb-6"
        style={{ borderColor: "rgba(249,115,22,0.3)", background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, transparent 50%)" }}>
        <TriptorelinAnimation isInView={isInView} />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {triptorelinFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.8 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${f.color}10`, border: `1px solid ${f.color}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${f.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: f.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: f.color }}>{f.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.4 }}
          className="mt-4 p-3 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-[#f97316] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key insight:</strong> The same D-Trp6 modification that makes Triptorelin highly potent
              is also what creates its biphasic paradox — sustained receptor occupancy triggers GnRHR internalization and downregulation,
              making it a uniquely powerful tool for studying both gonadotropin stimulation and HPG axis suppression in the same model.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.8 }}>
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Triptorelin GnRHR mechanism visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}

// ─── ENCLOMIPHENE ─────────────────────────────────────────────────────────────

function EnclomipheneAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />
      <svg viewBox="0 0 340 230" className="w-full h-full">
        <defs>
          <filter id="enclGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="enclArrowGreen" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
          </marker>
          <marker id="enclArrowRed" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
          <marker id="enclArrowCyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#21d8ff" />
          </marker>
        </defs>

        {/* Estradiol (E2) source - top left */}
        <motion.ellipse cx="65" cy="30" rx="45" ry="18"
          fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}}
          style={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,0.3))" }} />
        <motion.text x="65" y="26" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>Estradiol (E2)</motion.text>
        <motion.text x="65" y="37" textAnchor="middle" fill="#ef4444" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>Negative Feedback</motion.text>

        {/* E2 → Hypothalamus (suppressed) */}
        <motion.path d="M 95 40 Q 130 55 145 70"
          stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" fill="none"
          markerEnd="url(#enclArrowRed)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.3 }} />

        {/* Hypothalamus */}
        <motion.ellipse cx="170" cy="90" rx="55" ry="22"
          fill="rgba(157,78,221,0.2)" stroke="#9d4edd" strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.2 }}
          style={{ filter: "drop-shadow(0 0 10px rgba(157,78,221,0.4))" }} />
        <motion.text x="170" y="87" textAnchor="middle" fill="#9d4edd" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}>Hypothalamus</motion.text>
        <motion.text x="170" y="98" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}>ERα / GnRH Neurons</motion.text>

        {/* Block symbol on E2 path */}
        <motion.text x="125" y="60" textAnchor="middle" fill="#22c55e" fontSize="20" fontWeight="bold"
          initial={{ scale: 0, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 1.2, type: "spring" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(34,197,94,0.7))" }}>⊘</motion.text>

        {/* Enclomiphene label */}
        <motion.rect x="12" y="55" width="80" height="28" rx="7"
          fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="2"
          initial={{ x: -40, opacity: 0 }} animate={isInView ? { x: 0, opacity: 1 } : {}} transition={{ delay: 0.9, type: "spring" }}
          style={{ filter: "drop-shadow(0 0 12px rgba(34,197,94,0.5))" }} />
        <motion.text x="52" y="70" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.1 }}>Enclomiphene</motion.text>
        <motion.text x="52" y="80" textAnchor="middle" fill="#22c55e" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.1 }}>ERα Antagonist</motion.text>

        {/* Arrow: disinhibited GnRH down to pituitary */}
        <motion.line x1="170" y1="112" x2="170" y2="142"
          stroke="#9d4edd" strokeWidth="2.5" markerEnd="url(#enclArrowGreen)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.4 }} />
        <motion.text x="184" y="130" fill="#22c55e" fontSize="7" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.6 }}>
          ↑ GnRH pulse
        </motion.text>

        {/* Pituitary */}
        <motion.ellipse cx="170" cy="165" rx="50" ry="20"
          fill="rgba(33,216,255,0.2)" stroke="#21d8ff" strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.5 }}
          style={{ filter: "drop-shadow(0 0 10px rgba(33,216,255,0.4))" }} />
        <motion.text x="170" y="162" textAnchor="middle" fill="#21d8ff" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>Pituitary</motion.text>
        <motion.text x="170" y="173" textAnchor="middle" fill="#21d8ff" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>↑ LH / FSH Release</motion.text>

        {/* E2 → pituitary (also blocked) */}
        <motion.path d="M 90 40 Q 250 100 220 155"
          stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: 0.4 } : {}}
          transition={{ delay: 0.5 }} />
        <motion.text x="250" y="110" textAnchor="middle" fill="#22c55e" fontSize="16" fontWeight="bold"
          initial={{ scale: 0, opacity: 0 }} animate={isInView ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 1.3, type: "spring" }}
          style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.7))" }}>⊘</motion.text>

        {/* Pulsatile dots on disinhibited path */}
        {[0, 1].map((i) => (
          <motion.circle key={`encl-dot-${i}`} r="4" fill="#22c55e"
            initial={{ opacity: 0, cx: 170, cy: 112 }}
            animate={isInView ? { cy: [112, 142, 165], opacity: [0, 1, 1, 0] } : {}}
            transition={{ duration: 1.2, delay: 1.8 + i * 0.55, repeat: Infinity, repeatDelay: 0.7, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 5px rgba(34,197,94,0.8))" }} />
        ))}
      </svg>
    </div>
  );
}

const enclomipheneFeatures = [
  { title: "ERα Antagonism", description: "Competitively blocks estradiol binding to ERα on hypothalamic GnRH neurons and pituitary gonadotrophs, removing the estrogenic negative-feedback brake", icon: Shield, color: "#22c55e" },
  { title: "Feedback Disinhibition", description: "Without ERα-mediated suppression, hypothalamic GnRH pulse frequency and amplitude increase — directly elevating pituitary sensitivity to GnRH input", icon: TrendingUp, color: "#9d4edd" },
  { title: "Gonadotropin Elevation", description: "Disinhibited GnRH drives amplified LH and FSH secretion, making Enclomiphene a precision tool for studying feedback-removal effects on the HPG axis", icon: Activity, color: "#21d8ff" },
];

export function EnclomipheneVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{ background: "radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />

      <motion.div className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(157,78,221,0.05) 100%)", borderColor: "#22c55e", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}>
          <Shield className="h-5 w-5 text-[#22c55e]" style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.6))" }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#22c55e] to-[#9d4edd] bg-clip-text text-transparent">
            ERα Feedback Brake &amp; Gonadotropin Disinhibition
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Enclomiphene blocks estrogen negative feedback at the hypothalamus and pituitary to amplify GnRH signaling and LH/FSH output
        </p>
      </motion.div>

      <div className="rounded-xl border p-6 mb-6"
        style={{ borderColor: "rgba(34,197,94,0.3)", background: "linear-gradient(135deg, rgba(34,197,94,0.05) 0%, transparent 50%)" }}>
        <EnclomipheneAnimation isInView={isInView} />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {enclomipheneFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.8 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${f.color}10`, border: `1px solid ${f.color}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${f.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: f.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: f.color }}>{f.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.4 }}
          className="mt-4 p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key insight:</strong> As the trans-isomer (E-isomer) of clomiphene, Enclomiphene carries
              predominantly ERα antagonist activity — unlike the cis-isomer (zuclomiphene) which has partial agonist effects.
              This isomer selectivity makes it a cleaner pharmacological tool for studying pure estrogenic feedback removal on the HPG axis.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.8 }}>
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Enclomiphene ERα feedback visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}

// ─── OXYTOCIN ─────────────────────────────────────────────────────────────────

function OxytocinAnimation({ isInView }: { isInView: boolean }) {
  return (
    <div className="relative w-full h-72 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(236,72,153,0.08) 0%, transparent 70%)" }} />
      <svg viewBox="0 0 340 230" className="w-full h-full">
        <defs>
          <filter id="oxtGlow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="oxtArrowPink" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ec4899" />
          </marker>
          <marker id="oxtArrowCyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#21d8ff" />
          </marker>
          <marker id="oxtArrowYellow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#E7FB10" />
          </marker>
        </defs>

        {/* Posterior Pituitary source */}
        <motion.ellipse cx="170" cy="28" rx="65" ry="20"
          fill="rgba(236,72,153,0.2)" stroke="#ec4899" strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}}
          style={{ filter: "drop-shadow(0 0 10px rgba(236,72,153,0.5))" }} />
        <motion.text x="170" y="25" textAnchor="middle" fill="#ec4899" fontSize="8.5" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>Posterior Pituitary</motion.text>
        <motion.text x="170" y="36" textAnchor="middle" fill="#ec4899" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>Oxytocin Release (+ local PVN/SON)</motion.text>

        {/* OXT compound badge */}
        <motion.rect x="22" y="15" width="56" height="26" rx="7"
          fill="rgba(236,72,153,0.25)" stroke="#ec4899" strokeWidth="2"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.3 }}
          style={{ filter: "drop-shadow(0 0 10px rgba(236,72,153,0.5))" }} />
        <motion.text x="50" y="26" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>Oxytocin</motion.text>
        <motion.text x="50" y="36" textAnchor="middle" fill="#ec4899" fontSize="6.5"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}>Nonapeptide</motion.text>

        {/* Three target regions */}
        {/* Nucleus Accumbens */}
        <motion.ellipse cx="75" cy="130" rx="55" ry="22"
          fill="rgba(33,216,255,0.2)" stroke="#21d8ff" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.4 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(33,216,255,0.4))" }} />
        <motion.text x="75" y="127" textAnchor="middle" fill="#21d8ff" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>Nucleus Accumbens</motion.text>
        <motion.text x="75" y="138" textAnchor="middle" fill="#21d8ff" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }}>OXTR → ↑ Dopamine</motion.text>

        {/* VTA */}
        <motion.ellipse cx="170" cy="148" rx="48" ry="20"
          fill="rgba(231,251,16,0.2)" stroke="#E7FB10" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.5 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(231,251,16,0.4))" }} />
        <motion.text x="170" y="145" textAnchor="middle" fill="#E7FB10" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>VTA</motion.text>
        <motion.text x="170" y="156" textAnchor="middle" fill="#E7FB10" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>Reward Modulation</motion.text>

        {/* Amygdala */}
        <motion.ellipse cx="268" cy="130" rx="53" ry="22"
          fill="rgba(157,78,221,0.2)" stroke="#9d4edd" strokeWidth="1.5"
          initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : {}} transition={{ delay: 0.6 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(157,78,221,0.4))" }} />
        <motion.text x="268" y="127" textAnchor="middle" fill="#9d4edd" fontSize="8" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>Amygdala</motion.text>
        <motion.text x="268" y="138" textAnchor="middle" fill="#9d4edd" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}>Social Memory / Trust</motion.text>

        {/* Paths from pituitary to regions */}
        <motion.path d="M 130 48 Q 90 80 75 108"
          stroke="#ec4899" strokeWidth="2" fill="none" markerEnd="url(#oxtArrowPink)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.8 }} />
        <motion.path d="M 170 48 L 170 128"
          stroke="#ec4899" strokeWidth="2" fill="none" markerEnd="url(#oxtArrowPink)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 0.9 }} />
        <motion.path d="M 210 48 Q 250 80 268 108"
          stroke="#ec4899" strokeWidth="2" fill="none" markerEnd="url(#oxtArrowPink)"
          initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}} transition={{ delay: 1.0 }} />

        {/* Social bonding label */}
        <motion.rect x="95" y="185" width="148" height="30" rx="8"
          fill="rgba(236,72,153,0.15)" stroke="#ec4899" strokeWidth="1.5"
          initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.5 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(236,72,153,0.3))" }} />
        <motion.text x="169" y="201" textAnchor="middle" fill="#ec4899" fontSize="9" fontWeight="bold"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.7 }}>
          OXTR-Mediated Bonding &amp; Reward
        </motion.text>
        <motion.text x="169" y="211" textAnchor="middle" fill="#ec4899" fontSize="7"
          initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 1.7 }}>
          Gq-coupled GPCR → IP3/DAG → Ca²⁺ mobilization
        </motion.text>

        {/* Animated release dots */}
        {[
          { tx: 75, ty: 108, color: "#21d8ff" },
          { tx: 170, ty: 128, color: "#E7FB10" },
          { tx: 268, ty: 108, color: "#9d4edd" },
        ].map((dot, i) => (
          <motion.circle key={`oxt-dot-${i}`} r="4" fill={dot.color}
            initial={{ opacity: 0, cx: 170, cy: 48 }}
            animate={isInView ? { cx: [170, dot.tx], cy: [48, dot.ty], opacity: [0, 1, 0] } : {}}
            transition={{ duration: 1.3, delay: 1.8 + i * 0.4, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${dot.color}90)` }} />
        ))}
      </svg>
    </div>
  );
}

const oxytocinFeatures = [
  { title: "OXTR Activation", description: "Oxytocin binds OXTR (a Gq-coupled GPCR) in limbic structures, triggering PLC/IP3/DAG-mediated calcium mobilization and downstream signaling cascades", icon: Waves, color: "#ec4899" },
  { title: "Limbic Reward Circuit", description: "OXTR activation in the nucleus accumbens and VTA potentiates dopamine release, modulating the mesolimbic reward pathway and social reward valuation", icon: Heart, color: "#21d8ff" },
  { title: "Social Bonding", description: "Amygdala OXTR signaling regulates social memory formation, fear extinction, and prosocial behavior — key targets in research into pair-bonding and trust", icon: Users, color: "#9d4edd" },
];

export function OxytocinVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute inset-0 h-full w-full rounded-2xl blur-3xl -z-10"
        style={{ background: "radial-gradient(ellipse at center, rgba(236,72,153,0.08) 0%, transparent 70%)" }} />

      <motion.div className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
          style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(157,78,221,0.05) 100%)", borderColor: "#ec4899", boxShadow: "0 0 20px rgba(236,72,153,0.3)" }}>
          <Heart className="h-5 w-5 text-[#ec4899]" style={{ filter: "drop-shadow(0 0 4px rgba(236,72,153,0.6))" }} />
          <span className="text-sm font-bold bg-gradient-to-r from-[#ec4899] to-[#9d4edd] bg-clip-text text-transparent">
            OXTR Limbic Circuit &amp; Reward Modulation
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          How Oxytocin's OXTR-mediated signaling across the limbic system modulates social bonding, dopaminergic reward, and prosocial behavior
        </p>
      </motion.div>

      <div className="rounded-xl border p-6 mb-6"
        style={{ borderColor: "rgba(236,72,153,0.3)", background: "linear-gradient(135deg, rgba(236,72,153,0.05) 0%, transparent 50%)" }}>
        <OxytocinAnimation isInView={isInView} />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {oxytocinFeatures.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.8 + idx * 0.15 }}
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${f.color}10`, border: `1px solid ${f.color}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${f.color}20` }}>
                    <Icon className="h-4 w-4" style={{ color: f.color }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: f.color }}>{f.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.4 }}
          className="mt-4 p-3 rounded-lg bg-[#ec4899]/10 border border-[#ec4899]/20">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-[#ec4899] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Key insight:</strong> Oxytocin is synthesized in hypothalamic PVN and SON nuclei
              and released both from the posterior pituitary (systemic) and directly within brain circuits (paracrine).
              Its convergence with the mesolimbic dopamine system — where OXTR activation in the nucleus accumbens and VTA
              potentiates dopamine release — makes it a research model for studying social reward at the neurochemical level.
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 2.8 }}>
        <span className="px-3 py-1 rounded-full bg-muted/30">
          Oxytocin OXTR limbic circuit visualization • For research education only
        </span>
      </motion.div>
    </div>
  );
}
