import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { FlaskConical, BookOpen, Telescope, ShoppingBag, Activity, Zap, Ban, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EntryArticleLayout,
  ArticleSection,
  BulletList,
} from "@/components/entry-article-layout";
import { BODY_SYSTEM_HUBS_BY_SLUG } from "@/data/body-system-hubs";
import { RelatedStacks } from "@/components/research-stacks/RelatedStacks";

/* ─── HPG Axis Cascade Diagram ────────────────────────────────────────────── */

function HPGAxisDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      label: "Hypothalamus",
      sublabel: "GnRH pulse generator",
      color: "#f43f5e",
      peptides: ["Kisspeptin-10", "Kisspeptin-54", "Gonadorelin"],
      arrow: true,
    },
    {
      label: "Anterior Pituitary",
      sublabel: "Gonadotroph cells",
      color: "#f97316",
      peptides: ["Triptorelin", "Leuprolide"],
      arrow: true,
    },
    {
      label: "Gonads",
      sublabel: "LH → testosterone / FSH → estrogen",
      color: "#eab308",
      peptides: ["Enclomiphene (SERM block)"],
      arrow: false,
    },
  ];

  const sidePaths = [
    {
      label: "Melanocortin CNS Pathway",
      color: "#a855f7",
      peptides: ["PT-141", "Bremelanotide"],
      note: "MC4R in spinal cord — sexual arousal independent of gonadal hormones",
    },
    {
      label: "Hypothalamic Neuropeptide",
      color: "#21d8ff",
      peptides: ["Oxytocin"],
      note: "Synthesised in hypothalamus, released from posterior pituitary — social bonding, uterine contraction",
    },
    {
      label: "Thyrotropin-Releasing Hormone",
      color: "#22c55e",
      peptides: ["TRH"],
      note: "Hypothalamus → pituitary TSH → thyroid T3/T4; also a CNS neuroprotective tripeptide",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-hpg-axis">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Hormonal Axis Map — Where Each Peptide Acts
      </h3>

      {/* Main HPG cascade */}
      <div className="flex flex-col items-center gap-0 mb-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15 }}
            className="w-full max-w-lg"
          >
            <Card
              className="p-4 border"
              style={{
                borderColor: `${step.color}50`,
                background: `${step.color}0d`,
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-sm" style={{ color: step.color }}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.sublabel}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {step.peptides.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2 py-0.5 rounded-full border font-mono"
                      style={{
                        borderColor: `${step.color}50`,
                        color: step.color,
                        background: `${step.color}18`,
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
            {step.arrow && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ delay: i * 0.15 + 0.1, duration: 0.25 }}
                className="flex justify-center my-1"
                style={{ transformOrigin: "top" }}
              >
                <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                  <line x1="12" y1="0" x2="12" y2="20" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polyline points="5,17 12,26 19,17" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Side pathways */}
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-mono">
        Additional Hormonal Pathways
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        {sidePaths.map((path, i) => (
          <motion.div
            key={path.label}
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 + i * 0.12 }}
          >
            <Card
              className="p-3 h-full border"
              style={{
                borderColor: `${path.color}40`,
                background: `${path.color}0a`,
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: path.color }}>
                {path.label}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {path.peptides.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] px-1.5 py-0.5 rounded-full border font-mono"
                    style={{
                      borderColor: `${path.color}40`,
                      color: path.color,
                      background: `${path.color}15`,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{path.note}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 text-center font-mono">
        Hormonal axis overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

/* ─── Peptide Reference Table ──────────────────────────────────────────────── */

function HormonalPeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "Gonadorelin",
      type: "GnRH analog",
      primary: "Pulsatile LH/FSH release",
      note: "Short half-life mirrors endogenous pulsatile GnRH; used in fertility research",
    },
    {
      name: "Kisspeptin-10",
      type: "Kisspeptin isoform",
      primary: "Upstream GnRH neuron activation",
      note: "10 AA C-terminal fragment; acute LH surge model; high potency/short duration",
    },
    {
      name: "Kisspeptin-54",
      type: "Full-length kisspeptin",
      primary: "Pulsatile GnRH modulation",
      note: "Full 54 AA isoform; sustained ovulatory signaling research; IVF protocols studied",
    },
    {
      name: "Triptorelin",
      type: "GnRH decapeptide analog",
      primary: "Biphasic HPG axis modulation",
      note: "Initial gonadotropin surge then pituitary desensitisation at sustained exposure",
    },
    {
      name: "Leuprolide",
      type: "Synthetic GnRH agonist",
      primary: "Sex hormone suppression (chronic)",
      note: "More potent than endogenous GnRH; continuous dosing causes receptor downregulation",
    },
    {
      name: "Enclomiphene",
      type: "Selective estrogen receptor modulator",
      primary: "HPG axis de-suppression",
      note: "Blocks hypothalamic/pituitary ER to lift negative feedback and restore endogenous LH/FSH",
    },
    {
      name: "PT-141",
      type: "Melanocortin receptor agonist",
      primary: "Central sexual arousal (MC4R)",
      note: "Bremelanotide precursor; acts on CNS, not gonads — efficacious without gonadal hormones",
    },
    {
      name: "Bremelanotide",
      type: "Melanocortin receptor agonist",
      primary: "Central sexual dysfunction research",
      note: "Active metabolite of PT-141; dopaminergic modulation alongside MC4R activation",
    },
    {
      name: "Oxytocin",
      type: "Hypothalamic neuropeptide",
      primary: "Social bonding / uterine function",
      note: "Synthesised in paraventricular & supraoptic nuclei; anti-inflammatory secondary pathways",
    },
    {
      name: "TRH",
      type: "Hypothalamic tripeptide",
      primary: "TSH release / CNS neuroprotection",
      note: "Regulates thyroid axis; independently neuroprotective outside of thyroid function",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-hormonal-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Hormonal Cluster — Peptide Reference
      </h3>
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold w-36">
              Peptide
            </th>
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold w-44">
              Class
            </th>
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Primary Action
            </th>
            <th className="text-left py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Research Note
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.name}
              initial={{ opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.05 }}
              className="border-b border-border/40 hover-elevate"
            >
              <td className="py-2.5 pr-4 font-medium text-[#f43f5e] font-mono text-xs whitespace-nowrap">
                {row.name}
              </td>
              <td className="py-2.5 pr-4 text-muted-foreground text-xs">{row.type}</td>
              <td className="py-2.5 pr-4 text-xs">{row.primary}</td>
              <td className="py-2.5 text-xs text-muted-foreground">{row.note}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground mt-2 font-mono">
        For research education only · Not medical advice
      </p>
    </div>
  );
}

/* ─── Enclomiphene Compound Card ───────────────────────────────────────────── */

function EnclomipheneCompoundCard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const SERM_COLOR = "#e11d48";

  const mechanismSteps = [
    {
      icon: TrendingUp,
      label: "Estrogens circulate",
      detail: "Circulating estradiol (E2) binds ERα on hypothalamic KNDy neurons and anterior pituitary gonadotrophs, suppressing GnRH pulse amplitude and LH/FSH release.",
      phase: "Baseline negative feedback",
    },
    {
      icon: Ban,
      label: "Enclomiphene blocks ERα",
      detail: "As the trans-isomer of clomiphene, enclomiphene competitively occupies ERα at both sites. It acts as an ERα antagonist — occupying the receptor without activating it — and preventing estradiol from binding.",
      phase: "SERM antagonism",
    },
    {
      icon: Zap,
      label: "Feedback brake lifts",
      detail: "With ERα blocked, the hypothalamus interprets the signal as a low-estrogen state. GnRH pulse frequency and amplitude increase. The pituitary responds with elevated LH and FSH secretion, driving endogenous gonadal output.",
      phase: "Axis disinhibition",
    },
  ];

  const keyFacts = [
    { label: "Class", value: "Selective Estrogen Receptor Modulator (SERM)" },
    { label: "Isomer", value: "Trans-isomer of clomiphene citrate" },
    { label: "Primary target", value: "ERα (hypothalamus + anterior pituitary)" },
    { label: "Mechanism", value: "Competitive ERα antagonism → GnRH de-suppression" },
    { label: "Net effect", value: "↑ LH, ↑ FSH, ↑ endogenous gonadal output" },
    { label: "Distinguishing feature", value: "Acts on feedback loop — not on GnRH receptor directly" },
  ];

  return (
    <div ref={ref} className="my-10 not-prose" data-testid="card-enclomiphene-compound">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider"
            style={{ borderColor: `${SERM_COLOR}50`, color: SERM_COLOR, background: `${SERM_COLOR}15` }}
          >
            Compound Profile
          </span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider"
            style={{ borderColor: `${SERM_COLOR}40`, color: SERM_COLOR, background: `${SERM_COLOR}0d` }}
          >
            SERM · ERα Antagonist
          </span>
        </div>
        <h3 className="text-xl font-bold" style={{ color: SERM_COLOR }}>
          Enclomiphene
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          HPG axis de-suppression via hypothalamic &amp; pituitary ERα antagonism
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: ERα Blockade Mechanism flow */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card
            className="p-5 h-full border"
            style={{ borderColor: `${SERM_COLOR}35`, background: `${SERM_COLOR}08` }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              ERα Blockade Mechanism
            </p>
            <div className="flex flex-col gap-3">
              {mechanismSteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.12 }}
                  className="flex gap-3"
                >
                  <div
                    className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: `${SERM_COLOR}20`, border: `1px solid ${SERM_COLOR}40` }}
                  >
                    <step.icon className="w-3.5 h-3.5" style={{ color: SERM_COLOR }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold" style={{ color: SERM_COLOR }}>
                        {step.label}
                      </p>
                      <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">
                        {step.phase}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Right: Key facts + HPG positioning */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          <Card
            className="p-5 border"
            style={{ borderColor: `${SERM_COLOR}35`, background: `${SERM_COLOR}08` }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Compound Facts
            </p>
            <div className="flex flex-col gap-2">
              {keyFacts.map((fact, i) => (
                <motion.div
                  key={fact.label}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="flex gap-2 text-xs"
                >
                  <span className="text-muted-foreground shrink-0 w-36">{fact.label}</span>
                  <span className="font-medium">{fact.value}</span>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card
            className="p-5 border flex-1"
            style={{ borderColor: `${SERM_COLOR}35`, background: `${SERM_COLOR}08` }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Position in the HPG Cascade
            </p>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                Every other GnRH-class compound on this page — Gonadorelin, Kisspeptin, Triptorelin,
                Leuprolide — acts <span className="text-foreground font-medium">at or above the GnRH receptor</span>.
                Enclomiphene operates at a different control point entirely: it acts{" "}
                <span style={{ color: SERM_COLOR }} className="font-medium">at the estrogen receptor</span>{" "}
                on the hypothalamus and pituitary, lifting the endocrine feedback brake rather than
                supplying or mimicking a stimulatory signal.
              </p>
              <p>
                This positional uniqueness is why the{" "}
                <Link href="/research-stacks/triptorelin-enclomiphene-hpg-axis" style={{ color: SERM_COLOR }} className="underline underline-offset-2">
                  Triptorelin + Enclomiphene HPG Axis Stack
                </Link>{" "}
                creates a dual-entry research model: one compound stimulates via GnRHR, the other
                de-suppresses via ERα — two mechanistically independent axes acting on the same output.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 font-mono text-right">
        Research compound profile · For research education only · Not medical advice
      </p>
    </div>
  );
}

/* ─── Related Stacks Section ────────────────────────────────────────────── */

const HORMONAL_PEPTIDE_NAMES = ["PT-141", "Kisspeptin-10", "MT-2", "Gonadorelin", "Triptorelin", "Enclomiphene"];

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function HormonalPeptidesGuide() {
  const faqs = [
    {
      question: "What is the HPG axis?",
      answer:
        "The Hypothalamic-Pituitary-Gonadal (HPG) axis is the hormonal signaling cascade that regulates reproductive function. The hypothalamus releases GnRH in pulses, stimulating the pituitary to release LH and FSH, which in turn signal the gonads to produce sex hormones. Negative feedback from sex hormones regulates the entire loop.",
    },
    {
      question: "How does GnRH pulsatility matter?",
      answer:
        "The pituitary only responds to GnRH effectively when it is delivered in pulses. Continuous GnRH agonist exposure (as with triptorelin or leuprolide at sustained doses) paradoxically downregulates GnRH receptors on pituitary gonadotrophs, suppressing LH/FSH. This biphasic effect is central to much hormonal axis research.",
    },
    {
      question: "What distinguishes kisspeptin-10 from kisspeptin-54?",
      answer:
        "Both are isoforms of kisspeptin derived from the KISS1 gene product. Kisspeptin-10 is the shorter, more potent C-terminal decapeptide fragment that causes acute, high-amplitude LH surges, while kisspeptin-54 is the full-length precursor peptide associated with more sustained, pulsatile GnRH modulation. Researchers often use Kp-10 for acute pulse studies and Kp-54 for ovulatory induction models.",
    },
    {
      question: "How does enclomiphene differ from clomiphene?",
      answer:
        "Clomiphene is a mixture of two geometric isomers — enclomiphene (trans) and zuclomiphene (cis). Enclomiphene is the isomer responsible for blocking hypothalamic and pituitary estrogen receptors, lifting the negative feedback brake and stimulating endogenous LH and FSH release. Zuclomiphene is estrogenic and associated with most of the side effects. Enclomiphene as a standalone SERM provides HPG axis stimulation with a cleaner pharmacological profile.",
    },
    {
      question: "Does PT-141 act through the HPG axis?",
      answer:
        "No. PT-141 (and bremelanotide) primarily activates MC4R (melanocortin 4 receptor) in the CNS, including the spinal cord and brain regions involved in sexual arousal. This pathway is largely independent of gonadal hormone levels, which is why it has been studied in contexts where hormonal status is unchanged.",
    },
    {
      question: "What is TRH's role outside of thyroid function?",
      answer:
        "TRH (thyrotropin-releasing hormone) is a hypothalamic tripeptide whose canonical role is stimulating pituitary TSH release to activate the thyroid axis. However, TRH receptors are also found throughout the CNS, and research suggests neuroprotective, anti-depressant, and cognitive effects independent of thyroid hormone levels.",
    },
    {
      question: "Are these compounds for human use?",
      answer:
        "All compounds on this platform are sold strictly for research use only. They are not approved for human consumption in a self-administered context and are intended for qualified researchers and laboratory settings in compliance with applicable regulations.",
    },
  ];

  const ctaLinks = [
    {
      label: "Explore the Peptide Galaxy",
      href: "/galaxy",
      icon: Telescope,
      description: "Visualise the Hormonal cluster and its synergy connections",
    },
    {
      label: "Browse Hormonal Compounds",
      href: "/shop?system=hormonal",
      icon: ShoppingBag,
      description: "View research-grade hormonal peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated compound combinations involving hormonal peptides",
    },
    {
      label: "Peptide Education Center",
      href: "/guides/peptide-education-center",
      icon: BookOpen,
      description: "Full library of research guides across all peptide systems",
    },
  ];

  return (
    <EntryArticleLayout
      title="Hormonal Axis Peptides: HPG Cascade, GnRH Signaling, and Endocrine Research"
      metaTitle="Hormonal Axis Peptides: HPG Cascade & GnRH Signaling Guide | Revive Research"
      metaDescription="An in-depth research guide covering the HPG axis, GnRH cascade, and how hormonal peptides — Gonadorelin, Kisspeptin, PT-141, Triptorelin, Oxytocin, Enclomiphene, and more — interact with endocrine signaling pathways."
      canonicalPath="/systems/hormonal"
      badgeText="Hormonal System"
      badgeColor="#f43f5e"
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      systemHub={BODY_SYSTEM_HUBS_BY_SLUG["hormonal"]}
      introText={
        <>
          <p className="mb-4">
            The hormonal cluster in peptide research encompasses a diverse set of compounds
            that interact with the body's reproductive axis, central nervous system arousal
            pathways, and endocrine cascades. Unlike the growth or healing clusters — which
            tend to converge on a single receptor family — hormonal peptides span three
            distinct signaling architectures: the{" "}
            <strong>Hypothalamic-Pituitary-Gonadal (HPG) axis</strong>, the{" "}
            <strong>melanocortin system</strong>, and the{" "}
            <strong>hypothalamic-pituitary-thyroid (HPT) axis</strong>.
          </p>
          <p>
            This guide maps the pathways, explains where each compound acts, and
            clarifies why the same GnRH receptor can produce opposite effects depending
            on how a compound is administered.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <HPGAxisDiagram />

      <ArticleSection title="The HPG Axis — The Core Reproductive Cascade">
        <p>
          The HPG axis is a hierarchical feedback loop that governs sex hormone production.
          It begins in the hypothalamus, where specialised neurons release
          <strong> gonadotropin-releasing hormone (GnRH)</strong> in discrete pulses into
          the hypothalamo-pituitary portal blood.
        </p>
        <p>
          GnRH pulses arrive at the anterior pituitary, where they bind to GnRH receptors
          on gonadotroph cells, triggering the release of:
        </p>
        <BulletList
          items={[
            "Luteinising hormone (LH) — signals the gonads to produce testosterone (testes) or trigger ovulation (ovaries)",
            "Follicle-stimulating hormone (FSH) — drives spermatogenesis or ovarian follicle development",
          ]}
        />
        <p>
          Sex hormones produced by the gonads feed back to both the hypothalamus and
          pituitary via negative feedback, completing the regulatory loop. Disrupting any
          node of this cascade — whether to stimulate, suppress, or reset it — is the
          goal of most HPG-targeted peptide research.
        </p>
      </ArticleSection>

      <ArticleSection title="Pulsatility: Why Timing Is Everything" variant="proof">
        <p>
          The single most important concept in HPG axis research is <strong>pulsatility</strong>.
          The pituitary's GnRH receptors are extraordinarily sensitive to{" "}
          <em>how</em> GnRH is delivered:
        </p>
        <BulletList
          color="#22c55e"
          items={[
            "Pulsatile GnRH delivery (every 60–120 min) → receptor upregulation → LH/FSH release",
            "Continuous GnRH agonist exposure → receptor desensitisation → LH/FSH suppression",
            "This biphasic nature underlies the therapeutic duality of compounds like triptorelin and leuprolide",
          ]}
        />
        <p>
          Researchers studying axis restoration (e.g., post-suppression recovery) often
          use short-acting, pulsatile GnRH analogs like gonadorelin specifically to
          replicate this endogenous pattern.
        </p>
      </ArticleSection>

      <ArticleSection title="Upstream Regulators: Kisspeptin-10 and Kisspeptin-54">
        <p>
          Kisspeptins are neuropeptides encoded by the <em>KISS1</em> gene and are now
          recognised as the dominant upstream activators of the GnRH pulse generator.
          Kisspeptin neurons in the arcuate nucleus (KNDy neurons) coordinate the
          pulsatile GnRH release that drives the entire HPG cascade.
        </p>
        <p>
          Two isoforms are studied in peptide research:
        </p>
        <BulletList
          items={[
            "Kisspeptin-10 (Kp-10): The C-terminal 10 amino acid fragment — most potent, shortest duration, used in acute LH surge models",
            "Kisspeptin-54 (Kp-54): The full-length 54 AA precursor — lower peak potency per mole, but studied for sustained pulsatile GnRH modulation and ovulatory induction protocols",
          ]}
        />
        <p>
          Because kisspeptin acts one step above GnRH in the axis, it allows
          researchers to model cascade initiation at the hypothalamic level rather
          than directly at the pituitary.
        </p>
      </ArticleSection>

      <ArticleSection title="Direct GnRH Receptor Agonists: Gonadorelin, Triptorelin, Leuprolide">
        <p>
          These three compounds all target the same GnRH receptor on pituitary gonadotrophs
          but differ markedly in potency, half-life, and therefore net effect on the axis:
        </p>
        <BulletList
          items={[
            "Gonadorelin: Identical to endogenous GnRH (10 AA). Very short half-life (~2–4 min). Used to mimic natural pulsatile patterns in research. Stimulatory when dosed intermittently.",
            "Triptorelin: Decapeptide GnRH analog with ~100× greater GnRH receptor affinity than native GnRH. Short-term use → LH/FSH surge. Sustained use → receptor downregulation and axis suppression.",
            "Leuprolide: Synthetic GnRH agonist, 80× more potent than GnRH. Subcutaneous or depot formulations studied for sustained axis suppression via pituitary desensitisation.",
          ]}
        />
        <p>
          Understanding whether a compound is being studied for its initial stimulatory
          burst or its long-term suppressive effect requires knowing the dosing paradigm —
          not just the compound class.
        </p>
      </ArticleSection>

      <EnclomipheneCompoundCard />

      <ArticleSection title="HPG Axis De-Suppression: Enclomiphene">
        <p>
          Enclomiphene takes a fundamentally different approach to HPG axis research.
          Rather than delivering an exogenous GnRH signal, it removes the primary
          hormonal brake on endogenous GnRH pulsatility — lifting the axis from within
          rather than stimulating it from without.
        </p>
        <p>
          As the trans-isomer of clomiphene, enclomiphene is a{" "}
          <strong>selective estrogen receptor modulator (SERM)</strong> that competitively
          antagonises estrogen receptors (ERα) at both the hypothalamus and the anterior
          pituitary. Circulating estrogens normally suppress GnRH pulse generator activity
          via ERα-mediated genomic signalling — when enclomiphene blocks this receptor,
          the negative feedback brake is lifted. The hypothalamus responds by increasing
          GnRH pulse frequency and amplitude; the pituitary, no longer dampened, releases
          more LH and FSH; the gonads respond with increased sex hormone output.
        </p>
        <p>
          This makes enclomiphene mechanistically distinct from every GnRH analog on this
          page. Where Gonadorelin, Triptorelin, and Leuprolide act <em>at</em> the GnRH
          receptor, enclomiphene acts upstream — at the estrogen receptor — to disinhibit
          the cascade's own pulse generator. Research interest centres on how removing
          the endocrine feedback brake compares to, and interacts with, direct GnRHR
          agonism.
        </p>
      </ArticleSection>

      <ArticleSection title="The Melanocortin Pathway: PT-141 and Bremelanotide" variant="revive">
        <p>
          PT-141 (bremelanotide) represents a completely separate hormonal research category.
          These compounds do not act on the HPG axis at all — they activate{" "}
          <strong>melanocortin 4 receptors (MC4R)</strong> in the central nervous system,
          particularly in the spinal cord's dorsal horn and limbic structures involved in
          sexual arousal.
        </p>
        <BulletList
          color="#21d8ff"
          items={[
            "MC4R activation → dopaminergic signaling → arousal and motivation pathways",
            "Action is independent of gonadal hormone levels — studied in hypogonadal and eugonadal research models",
            "Bremelanotide is the active metabolite; PT-141 (cyclic peptide) is converted in vivo",
            "Melanocortin receptor family: MC1R (pigmentation), MC2R (adrenal), MC3R (energy), MC4R (arousal/feeding), MC5R (secretion)",
          ]}
        />
        <p>
          This CNS-centric mechanism makes the melanocortin compounds distinct from every
          other compound in the hormonal cluster and explains why they remain active
          independent of gonadal status.
        </p>
      </ArticleSection>

      <ArticleSection title="Oxytocin: The Hypothalamic Neuropeptide">
        <p>
          Oxytocin is a nine amino acid peptide synthesised in the paraventricular nucleus
          (PVN) and supraoptic nucleus (SON) of the hypothalamus and released from the
          posterior pituitary into systemic circulation.
        </p>
        <p>
          Research into oxytocin spans multiple disciplines:
        </p>
        <BulletList
          items={[
            "Social cognition and bonding — oxytocin receptor distribution across limbic structures",
            "Anti-inflammatory effects — oxytocin receptor signaling modulates inflammatory cytokine cascades",
            "Stress physiology — interaction with the HPA (hypothalamic-pituitary-adrenal) axis and cortisol response",
            "Peripheral reproductive function — uterine contraction and lactation via peripheral oxytocin receptors",
          ]}
        />
        <p>
          Its overlap between the hormonal and healing/mood systems reflects the
          pleiotropic nature of neuropeptides — a theme common across the entire
          hormonal cluster.
        </p>
      </ArticleSection>

      <ArticleSection title="TRH and the Thyroid Axis">
        <p>
          Thyrotropin-releasing hormone (TRH) is a hypothalamic tripeptide (Glu-His-Pro)
          whose canonical function is stimulating anterior pituitary thyrotrophs to release
          thyroid-stimulating hormone (TSH). TSH then drives the thyroid gland to produce
          T3 and T4, the primary thyroid hormones governing metabolic rate, thermogenesis,
          and CNS development.
        </p>
        <p>
          Beyond its thyroid axis role, TRH has attracted research attention as a CNS
          neuropeptide. TRH receptors (TRHR1, TRHR2) are distributed throughout the
          brain independently of the pituitary, and research has associated TRH with:
        </p>
        <BulletList
          items={[
            "Neuroprotective effects in models of excitotoxicity and ischemia",
            "Antidepressant-like activity in preclinical models",
            "Arousal and wakefulness promotion",
            "Potential interactions with serotonergic and dopaminergic systems",
          ]}
        />
      </ArticleSection>

      <HormonalPeptideTable />

      <ArticleSection title="Synergies and Research Combinations" variant="limitation">
        <p>
          Hormonal peptides are often studied in combination because the HPG cascade
          offers multiple intervention points. Common research questions explore:
        </p>
        <BulletList
          color="#f59e0b"
          items={[
            "Kisspeptin + Gonadorelin: upstream stimulation (Kp-10/54) combined with direct GnRH receptor agonism to amplify or study cascade sensitivity",
            "Enclomiphene + GnRH analog: SERM de-suppression alongside exogenous GnRH to compare axis restoration mechanisms",
            "PT-141 + Oxytocin: central arousal (MC4R) combined with neuropeptide bonding/stress pathways to study interaction effects",
            "Triptorelin (pulsatile dosing) + Gonadorelin: studying how receptor re-sensitisation after suppression can be modelled",
          ]}
        />
        <p>
          All combination research carries additional complexity. Interpreting compound
          interactions requires understanding each peptide's individual receptor pharmacology
          before attributing observed effects to a combination.
        </p>
      </ArticleSection>

      <ArticleSection title="Galaxy Cluster and Pathway Connections">
        <p>
          In the{" "}
          <Link href="/galaxy" className="text-[#f43f5e] hover:underline">
            Peptide Galaxy
          </Link>
          , the Hormonal cluster is rendered in rose-red (#f43f5e), positioned in its own
          region of the galactic disc. Synergy edges connect it to the Mood cluster
          (oxytocin, PT-141 dopaminergic overlap), the Cognitive cluster (TRH neuroprotection),
          and the Healing cluster (oxytocin anti-inflammatory pathways).
        </p>
        <p>
          Clicking any star in the Hormonal cluster opens a side panel with pathway data
          and links back to this guide, allowing researchers to move fluidly between
          the visual galaxy overview and detailed mechanism explanations.
        </p>
      </ArticleSection>

      <ArticleSection title="Research Considerations and Compliance">
        <p>
          All compounds described in this guide are sold strictly for{" "}
          <strong>research use only</strong>. They are not intended for human administration
          outside of properly licensed research settings. Researchers should:
        </p>
        <BulletList
          items={[
            "Verify applicable regulations in their jurisdiction before purchasing",
            "Consult relevant literature and institutional review requirements",
            "Understand the pharmacokinetic profile of each compound before designing experiments",
            "Maintain appropriate documentation for all research activities",
          ]}
        />
        <p>
          Revive Research provides Certificates of Analysis (COA) from independent
          third-party laboratories for every batch. All documentation is available
          in our{" "}
          <Link href="/coa-library" className="text-[#f43f5e] hover:underline">
            COA Library
          </Link>
          .
        </p>
      </ArticleSection>

      <RelatedStacks peptideNames={HORMONAL_PEPTIDE_NAMES} />
    </EntryArticleLayout>
  );
}
