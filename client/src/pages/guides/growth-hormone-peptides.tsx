import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FlaskConical, BookOpen, Telescope, ShoppingBag, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  EntryArticleLayout,
  ArticleSection,
  BulletList,
} from "@/components/entry-article-layout";
import { GHStructuralComparison } from "@/components/infographics/gh-structural-comparison";

const GH_COLOR = "#f59e0b";

/* ─── GH Secretagogue Axis Diagram ─────────────────────────────────────── */

function GHSecretagogueDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const cascade = [
    {
      label: "Hypothalamic GHRH Signal",
      sublabel: "GHRH receptor activation → somatotroph stimulation",
      color: GH_COLOR,
      peptides: ["CJC-1295", "Tesamorelin", "Mod GRF 1-29"],
      arrow: true,
      note: "GHRHR (class B GPCR) · cAMP/PKA pathway · GH gene transcription",
    },
    {
      label: "Ghrelin Receptor Amplification",
      sublabel: "GHS-R1a activation → synergistic GH pulse",
      color: "#d97706",
      peptides: ["Ipamorelin", "GHRP-2", "GHRP-6"],
      arrow: true,
      note: "GHS-R1a (class A GPCR) · PLC/IP3/DAG · intracellular Ca²⁺ surge · amplifies GHRH signal",
    },
    {
      label: "Anterior Pituitary GH Release",
      sublabel: "Somatotroph secretion of GH into portal circulation",
      color: "#b45309",
      peptides: ["GHRH + GHRP combos"],
      arrow: true,
      note: "Pulsatile GH secretion · somatostatin braking · GHRH:GHRP synergy multiplies pulse amplitude",
    },
    {
      label: "Hepatic IGF-1 Synthesis",
      sublabel: "GH → liver → IGF-1 → peripheral tissues",
      color: "#92400e",
      peptides: ["IGF-1 LR3", "IGF-DES"],
      arrow: false,
      note: "GH receptor (GHR) · JAK2/STAT5b → IGF-1 mRNA · IGFBP regulation · systemic & local delivery",
    },
  ];

  const pathways = [
    {
      label: "GHRH / CJC-1295 Route",
      color: GH_COLOR,
      peptides: ["CJC-1295", "Tesamorelin"],
      note: "GHRH analogs activate GHRHR on somatotrophs via cAMP/PKA, increasing GH gene expression and stimulating pulsatile secretion. CJC-1295 (DAC) extends this with albumin binding for a multi-day half-life.",
    },
    {
      label: "Ghrelin / Ipamorelin Route",
      color: "#d97706",
      peptides: ["Ipamorelin", "GHRP-2"],
      note: "GHS-R1a agonism raises intracellular Ca²⁺ and inhibits somatostatin release simultaneously. Ipamorelin achieves this with exceptional selectivity — no cortisol or prolactin elevation at research doses.",
    },
    {
      label: "GH → IGF-1 Cascade",
      color: "#b45309",
      peptides: ["All secretagogues"],
      note: "GH binds GHR dimers on hepatocytes, activating JAK2/STAT5b to drive IGF-1 transcription. Circulating IGF-1 then activates IGF-1R on target tissues for anabolic, metabolic, and proliferative effects.",
    },
    {
      label: "Direct IGF-1R Engagement",
      color: "#a16207",
      peptides: ["IGF-1 LR3", "IGF-DES"],
      note: "IGF-1 variants bypass the GH axis entirely, directly activating IGF-1R to trigger mTOR, PI3K/Akt, and MAPK cascades. LR3 provides systemic coverage; IGF-DES offers concentrated local activity.",
    },
    {
      label: "Tesamorelin Metabolic Axis",
      color: "#ca8a04",
      peptides: ["Tesamorelin"],
      note: "Tesamorelin has the only FDA-approved GHRH analog indication: HIV-associated lipodystrophy. It raises IGF-1 and reduces visceral adipose tissue through sustained GH axis stimulation with a preserved pulsatile pattern.",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-gh-secretagogue-cascade">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        GH Secretagogue Axis — Where Each Compound Intervenes
      </h3>

      <div className="flex flex-col items-center gap-0 mb-8">
        {cascade.map((step, i) => (
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
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: step.color }}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.sublabel}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{step.note}</p>
                </div>
                <div className="flex flex-wrap gap-1 flex-shrink-0">
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

      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-mono">
        Parallel Signaling Pathways
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pathways.map((path, i) => (
          <motion.div
            key={path.label}
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 + i * 0.1 }}
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
        GH secretagogue axis overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

/* ─── Core GH Cluster Peptide Table ─────────────────────────────────────── */

function GHPeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "CJC-1295",
      type: "Modified GHRH analog (DAC)",
      primary: "Prolonged pituitary GH stimulation via GHRHR",
      note: "Drug Affinity Complex binds plasma albumin (Cys30–maleimide bond), extending t½ to ~7 days. Non-DAC variant (Mod GRF 1-29) acts acutely for pulsatile protocols.",
    },
    {
      name: "Ipamorelin",
      type: "Selective pentapeptide GHRP",
      primary: "GHS-R1a agonism · GH pulse without cortisol/prolactin spike",
      note: "Most receptor-selective GHRP studied. Achieves GH release equivalent to GHRP-2 with no elevation of cortisol, prolactin, or ACTH at research concentrations — ideal for isolated GH axis studies.",
    },
    {
      name: "Tesamorelin",
      type: "GHRH(1-40) stabilized analog",
      primary: "Visceral fat reduction · sustained IGF-1 elevation",
      note: "Full-length GHRH (40 AA) with trans-3-hexenoic acid N-terminal modification. Only FDA-approved GHRH analog (Egrifta, HIV lipodystrophy). Preserves physiologic GH pulsatility while elevating IGF-1.",
    },
    {
      name: "IGF-1 LR3",
      type: "Long R3 IGF-1 recombinant analog",
      primary: "Systemic IGF-1R activation · mTOR/PI3K/Akt signaling",
      note: "13 AA N-terminal extension + Arg(3) substitution reduces IGFBP affinity ~1000-fold, extending t½ to 20–30 hours vs ~15 min for native IGF-1. Provides durable systemic IGF-1 receptor engagement.",
    },
    {
      name: "IGF-DES",
      type: "Des(1-3) IGF-1 truncated analog",
      primary: "Enhanced local IGF-1R potency · reduced IGFBP binding at site",
      note: "Removal of the first three N-terminal amino acids (Gly-Pro-Glu) eliminates the principal IGFBP binding domain. Free fraction at injection site is markedly higher than native IGF-1 or LR3.",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-gh-peptide-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Growth Hormone Cluster — Core Peptide Reference
      </h3>
      <table className="w-full text-sm border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold w-36">
              Peptide
            </th>
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold w-52">
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
              transition={{ delay: i * 0.07 }}
              className="border-b border-border/40 hover-elevate"
            >
              <td className="py-2.5 pr-4 font-medium font-mono text-xs whitespace-nowrap" style={{ color: GH_COLOR }}>
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

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function GrowthHormonePeptidesGuide() {
  const faqs = [
    {
      question: "What is the GHRH/GHRP axis and why do researchers combine compounds from both classes?",
      answer:
        "The GH secretagogue system has two independent inputs. GHRH (growth hormone-releasing hormone) acts through the GHRH receptor (GHRHR) on anterior pituitary somatotrophs, raising cAMP and driving GH gene expression. GHRPs (growth hormone-releasing peptides) act through a completely separate receptor — GHS-R1a (the ghrelin receptor) — which raises intracellular calcium and simultaneously suppresses somatostatin, the hormone that brakes GH release. When a GHRH analog and a GHRP are present at the same time, both inputs converge on the somatotroph simultaneously. The resulting GH pulse is synergistically larger than either stimulus alone — this is one of the most reproducible synergies in GH secretagogue research.",
    },
    {
      question: "What makes CJC-1295 (with DAC) different from Mod GRF 1-29?",
      answer:
        "Both are modifications of the first 29 amino acids of native GHRH, but they differ radically in duration of action. Mod GRF 1-29 (CJC-1295 without DAC) has four amino acid substitutions that confer protease resistance, but still acts acutely — the GH pulse occurs within 15–30 minutes and is over within 3 hours, closely mimicking physiologic pulsatile GH release. CJC-1295 with DAC adds a maleimide-modified lysine at position 30 (the Drug Affinity Complex) that forms a stable covalent bond with plasma albumin after injection. This dramatically extends the half-life to approximately 7–10 days, providing sustained GHRH receptor activation and a blunted but prolonged GH/IGF-1 elevation.",
    },
    {
      question: "Why is Ipamorelin considered the most selective GHRP?",
      answer:
        "Most GHRPs cross-activate receptors beyond GHS-R1a. GHRP-2 and GHRP-6 both elevate cortisol and prolactin alongside GH, complicating research interpretation. Hexarelin activates CD36 and produces cardiac effects independent of GH. Ipamorelin is a pentapeptide specifically optimized to agonize GHS-R1a with high selectivity — at doses that produce robust GH release in research models, cortisol and prolactin remain essentially unchanged. This makes ipamorelin the preferred GHRP when researchers want to isolate the GH-specific arm of ghrelin receptor pharmacology.",
    },
    {
      question: "What is Tesamorelin's clinical relevance and what distinguishes it from other GHRH analogs?",
      answer:
        "Tesamorelin is the GHRH analog with the most clinical validation. It is a synthetic analog of full-length GHRH(1-40) — longer than sermorelin (1-29) — with a trans-3-hexenoic acid modification at the N-terminus that protects it from DPP-IV enzymatic cleavage. It received FDA approval (as Egrifta) for the treatment of HIV-associated lipodystrophy, where excess visceral adipose tissue accumulates as a side effect of antiretroviral therapy. Tesamorelin's ability to preferentially mobilize visceral fat while elevating IGF-1 and preserving physiologic GH pulsatility distinguishes it from sustained-release analogs like CJC-1295-DAC.",
    },
    {
      question: "What is the difference between IGF-1 LR3 and IGF-DES?",
      answer:
        "Both are engineered to overcome native IGF-1's short plasma half-life (approximately 10–15 minutes), caused by rapid binding to IGF-binding proteins (IGFBPs). IGF-1 LR3 ('Long R3') adds a 13 amino acid N-terminal extension and substitutes arginine at position 3, reducing IGFBP affinity by approximately 1000-fold. This extends its half-life to 20–30 hours and produces systemic IGF-1 receptor (IGF-1R) activation throughout the body. IGF-DES (des 1-3 IGF-1) takes a different approach: removing the first three N-terminal amino acids eliminates the primary IGFBP binding domain, dramatically reducing binding at the injection site specifically. IGF-DES has a shorter systemic half-life than LR3 but achieves a higher local free fraction — more of it is available to engage IGF-1R at the injection site rather than being sequestered by circulating IGFBPs.",
    },
    {
      question: "How does the GH → IGF-1 cascade produce anabolic effects?",
      answer:
        "GH secreted from the pituitary enters the circulation and binds GH receptors (GHR) on hepatocytes. The GHR dimer activates JAK2, which phosphorylates STAT5b. Phosphorylated STAT5b translocates to the nucleus and drives transcription of the IGF-1 gene. The resulting IGF-1 is secreted into the portal circulation, reaches systemic levels, and binds IGF-1 receptors (IGF-1R) on muscle, bone, and other peripheral tissues. IGF-1R activation initiates three main intracellular cascades: mTOR (protein synthesis and cell growth), PI3K/Akt (cell survival, glucose uptake, glycogen synthesis), and MAPK (cell proliferation and differentiation). This is why GH secretagogues and direct IGF-1 analogs share many downstream research outcomes despite acting at different points in the same cascade.",
    },
    {
      question: "What is the role of IGF-binding proteins (IGFBPs) and why do they matter for IGF-1 analog design?",
      answer:
        "IGFBPs are a family of six proteins (IGFBP-1 through IGFBP-6) that bind native IGF-1 in circulation. Approximately 99% of circulating IGF-1 is IGFBP-bound at any given time, acting as a reservoir that controls bioavailability. This sequestration is why native IGF-1 has a short 'free fraction' half-life. IGFBP binding is also responsible for directing IGF-1 to specific tissue compartments — IGFBP-3 is the dominant carrier in plasma, while IGFBP-4 and IGFBP-5 direct IGF-1 to bone and muscle. IGF-1 analogs like LR3 and IGF-DES reduce IGFBP affinity through structural modifications, increasing the fraction that is freely available to bind IGF-1R rather than being held in reserve. This is the primary pharmacokinetic engineering target in long-acting IGF-1 research.",
    },
    {
      question: "Why is the CJC-1295 + Ipamorelin combination studied so frequently?",
      answer:
        "The CJC-1295 + Ipamorelin combination exploits the two-input architecture of GH secretagogue pharmacology. CJC-1295 activates the GHRH receptor pathway (cAMP/PKA), while ipamorelin activates the ghrelin receptor pathway (PLC/Ca²⁺) and simultaneously suppresses somatostatin tone. When both receptors are engaged simultaneously, GH pulse amplitude is synergistically amplified — greater than the sum of either compound's individual effect. Ipamorelin's selectivity profile (no cortisol or prolactin elevation) makes it the preferred GHRP partner because the combination produces a cleaner GH signal without the confounding hormonal co-stimulation seen with GHRP-2 or GHRP-6.",
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
      description: "Visualise the Growth cluster and its synergy connections",
    },
    {
      label: "Browse Growth Compounds",
      href: "/shop?system=growth-hormone",
      icon: ShoppingBag,
      description: "View research-grade GH axis peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated compound combinations featuring GH secretagogues",
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
      title="Growth Hormone Peptides: GHRH/GHRP Axis, GH Secretagogue Mechanisms, and the GH → IGF-1 Cascade"
      metaTitle="Growth Hormone Peptides Guide: CJC-1295, Ipamorelin, Tesamorelin, IGF-1 LR3 & IGF-DES | Revive Research"
      metaDescription="An in-depth research guide to the growth hormone peptide cluster — covering the GHRH/GHRP axis, GH secretagogue receptor pharmacology, the GH → IGF-1 cascade, and the structural differences between CJC-1295, Ipamorelin, Tesamorelin, IGF-1 LR3, and IGF-DES."
      canonicalPath="/systems/growth"
      badgeText="Growth Hormone System"
      badgeColor={GH_COLOR}
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      introText={
        <>
          <p className="mb-4">
            The Growth Hormone cluster sits at one of the most studied intersections in
            peptide research: the <strong>hypothalamic-pituitary-GH-IGF-1 axis</strong>. The
            five core compounds — <strong>CJC-1295</strong>, <strong>Ipamorelin</strong>,{" "}
            <strong>Tesamorelin</strong>, <strong>IGF-1 LR3</strong>, and{" "}
            <strong>IGF-DES</strong> — represent two mechanistically distinct entry points
            into this cascade. GHRH analogs and GHRPs drive GH secretion from the pituitary
            through separate receptor systems, while IGF-1 variants engage the pathway
            downstream, bypassing the GH axis entirely to activate peripheral IGF-1 receptors
            directly.
          </p>
          <p>
            This guide maps the full GHRH/GHRP signaling axis from hypothalamic input to
            IGF-1 receptor output, clarifies the critical pharmacokinetic and receptor-level
            differences within each compound class, and explains why the two-receptor
            architecture of GH secretagogue research produces some of the most reproducible
            synergy observations in the peptide field.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <GHSecretagogueDiagram />

      <ArticleSection title="The Two-Receptor Architecture of GH Secretagogue Research">
        <p>
          Growth hormone release from the anterior pituitary is governed by two independent
          stimulatory inputs from the hypothalamus, each acting through a distinct receptor
          family on pituitary somatotroph cells:
        </p>
        <BulletList
          color={GH_COLOR}
          items={[
            "GHRH receptor (GHRHR) — a class B GPCR that couples to Gs/cAMP/PKA signaling when activated by GHRH or its analogs, increasing GH gene transcription and driving GH synthesis and secretion.",
            "Ghrelin receptor (GHS-R1a) — a class A GPCR that couples to Gq/PLC/IP3, raising intracellular calcium to trigger exocytosis of stored GH. GHS-R1a agonism also suppresses somatostatin tone, removing the primary brake on GH release.",
          ]}
        />
        <p>
          When both receptors are activated simultaneously — for example by a GHRH analog
          plus ipamorelin — the resulting GH pulse is synergistically amplified beyond what
          either stimulus produces alone. The cAMP and calcium pathways converge at the level
          of somatotroph secretory machinery, producing additive and sometimes supraadditive
          GH secretion. This two-receptor synergy is the mechanistic foundation of the most
          widely studied GHRH + GHRP research protocols.
        </p>
      </ArticleSection>

      <ArticleSection title="CJC-1295 — Engineering Duration into GHRH Pharmacology" variant="proof">
        <p>
          CJC-1295 is a modified version of GHRH(1-29) — the shortest GHRH fragment that
          retains full GHRHR activation. Native GHRH(1-29) is rapidly cleaved by dipeptidyl
          peptidase IV (DPP-IV) and other plasma proteases, giving it a half-life of
          approximately 7 minutes. CJC-1295 addresses this through two engineering strategies:
        </p>
        <BulletList
          color={GH_COLOR}
          items={[
            "Four amino acid substitutions at positions 2, 8, 15, and 27 confer resistance to DPP-IV and other plasma proteases — the 'Mod GRF 1-29' or non-DAC variant that still acts acutely (~3-hour effect window).",
            "The DAC variant adds a maleimide-modified lysine at position 30 that reacts with plasma albumin (Cys34) via a Michael addition reaction, forming a covalent albumin complex. Albumin's long half-life (~21 days) extends the peptide's functional lifespan to approximately 7–10 days.",
          ]}
        />
        <p>
          The choice between DAC and non-DAC variants defines the research protocol design:
          Mod GRF 1-29 preserves physiologic GH pulsatility (one pulse per injection), while
          CJC-1295 with DAC provides a prolonged GHRH receptor stimulus that produces
          sustained IGF-1 elevation with a more continuous rather than pulsatile GH profile.
        </p>
      </ArticleSection>

      <GHStructuralComparison />

      <ArticleSection title="Ipamorelin — Selective Ghrelin Receptor Agonism">
        <p>
          Ipamorelin is a synthetic pentapeptide (Aib-His-D-2-Nal-D-Phe-Lys-NH₂) developed
          as a highly selective GHS-R1a agonist. The key distinction from other GHRPs is
          receptor selectivity: while GHRP-2, GHRP-6, and hexarelin all produce meaningful
          cortisol and prolactin co-stimulation as a side effect of GHS-R1a activation and
          adjacent receptor cross-talk, ipamorelin's structure achieves GH release at doses
          that leave cortisol and prolactin essentially unchanged.
        </p>
        <BulletList
          color="#d97706"
          items={[
            "GHS-R1a activation → Gq/PLCβ → IP3/DAG → intracellular Ca²⁺ surge → GH granule exocytosis",
            "Simultaneous somatostatin suppression — removes the hypothalamic brake on GH secretion",
            "No significant ACTH/cortisol or prolactin elevation at research doses (distinguishing it from GHRP-2, GHRP-6, hexarelin)",
            "GH pulse onset within 15–30 minutes, peak at ~45 minutes, duration approximately 3 hours — clean pulsatile pharmacokinetics",
          ]}
        />
        <p>
          This combination of robust GH secretion and receptor selectivity makes ipamorelin
          the default GHRP partner in two-compound GH axis protocols and the preferred tool
          when researchers want to attribute effects specifically to GH rather than to
          cortisol co-stimulation.
        </p>
      </ArticleSection>

      <ArticleSection title="Tesamorelin — Clinical Validation of the GHRH Axis" variant="revive">
        <p>
          Tesamorelin is an analog of full-length GHRH(1-40) — the complete native sequence —
          rather than the truncated GHRH(1-29) used in sermorelin and CJC-1295. An N-terminal
          trans-3-hexenoic acid modification protects it from DPP-IV cleavage. It is the only
          GHRH analog to have received FDA approval: as Egrifta for HIV-associated lipodystrophy,
          a metabolic syndrome in which antiretroviral therapy causes visceral adipose accumulation.
        </p>
        <BulletList
          color="#ca8a04"
          items={[
            "Full GHRH(1-40) sequence — maintains all natural GHRH receptor contacts for maximal GHRHR activation",
            "Raises IGF-1 while preserving physiologic GH pulsatility (unlike DAC variants that produce continuous GH elevation)",
            "Selectively reduces visceral adipose tissue in clinical research — distinct from subcutaneous fat compartments",
            "Studied for cognitive benefits in aging populations through the GH/IGF-1 axis's role in hippocampal neurogenesis",
            "DPP-IV-resistant N-terminal modification extends half-life to approximately 26 minutes versus ~7 minutes for native GHRH",
          ]}
        />
        <p>
          Tesamorelin's clinical validation makes it the reference standard for translational
          GH axis research: its mechanism is thoroughly characterized, its safety profile is
          well-documented, and its visceral fat selectivity suggests GHRH analog activity is
          not metabolically equivalent across receptor subtypes or tissue compartments.
        </p>
      </ArticleSection>

      <GHPeptideTable />

      <ArticleSection title="IGF-1 LR3 — Systemic IGF-1 Receptor Engagement">
        <p>
          IGF-1 LR3 (Long R3 IGF-1) is a recombinant analog engineered to overcome the two
          primary pharmacokinetic limitations of native IGF-1: its extremely short plasma
          half-life (~10–15 minutes) and its near-complete sequestration by IGF-binding proteins
          (IGFBPs). Two structural changes accomplish this:
        </p>
        <BulletList
          color={GH_COLOR}
          items={[
            "A 13 amino acid N-terminal extension (MFPAMPLLSLFVNGSR-) positions the peptide away from the IGFBP binding surface",
            "Substitution of glutamate with arginine at position 3 (Arg³) directly disrupts the primary IGFBP-3 binding interface",
            "Combined, these modifications reduce IGFBP affinity by approximately 1,000-fold, extending the plasma half-life to 20–30 hours",
            "Systemic IGF-1R activation throughout the body: muscle, bone, adipose, and neural tissues all respond to circulating LR3",
          ]}
        />
        <p>
          Because IGF-1 LR3 bypasses pituitary regulation and IGFBP control simultaneously,
          it represents the most direct way to study the downstream effector arm of the GH
          axis in isolation — without pituitary GH secretion, somatostatin, or IGFBP
          dynamics confounding the experimental signal.
        </p>
      </ArticleSection>

      <ArticleSection title="IGF-DES — Local IGF-1R Potency Through Truncation">
        <p>
          IGF-DES (des 1-3 IGF-1) takes a structurally minimal approach to IGFBP escape:
          removing only the first three N-terminal amino acids (Gly-Pro-Glu). This deletion
          appears small but eliminates the primary IGFBP binding epitope at the N-terminus,
          substantially reducing affinity for IGFBP-3 and other binding proteins at the
          injection site.
        </p>
        <BulletList
          color="#a16207"
          items={[
            "N-terminal Gly-Pro-Glu deletion removes the primary IGFBP-3 contact residues",
            "Higher free fraction at the injection site compared to native IGF-1 and IGF-1 LR3",
            "Shorter systemic half-life than LR3 — activity is more concentrated locally rather than distributed systemically",
            "IGF-1R binding affinity is preserved or slightly increased relative to native IGF-1 — the truncation does not impair receptor engagement",
            "Studied for localized tissue effects where high receptor occupancy at a specific site is the research objective",
          ]}
        />
        <p>
          The distinction between LR3 and IGF-DES is therefore primarily one of distribution:
          LR3 for systemic IGF-1R activation research, IGF-DES for investigating concentrated
          local receptor engagement at a defined anatomical site.
        </p>
      </ArticleSection>

      <ArticleSection title="The GH → IGF-1 Cascade: Molecular Mechanism">
        <p>
          Understanding how GH drives IGF-1 production clarifies why researchers combine
          secretagogues with direct IGF-1 analogs and what each approach measures:
        </p>
        <BulletList
          color={GH_COLOR}
          items={[
            "GH enters portal circulation and binds GH receptor (GHR) on hepatocyte surface — GHR dimerizes upon binding",
            "GHR dimerization activates JAK2 kinase, which trans-phosphorylates STAT5b transcription factor",
            "Phosphorylated STAT5b dimers translocate to the nucleus and bind GAS (gamma-activated sequence) elements in the IGF-1 gene promoter",
            "IGF-1 mRNA is transcribed → translated → secreted into portal and then systemic circulation",
            "Circulating IGF-1 binds IGF-1R (a receptor tyrosine kinase) on peripheral tissues → IRS-1 phosphorylation → PI3K/Akt, mTOR, and MAPK pathway activation",
            "End effects: protein synthesis (mTOR), cell survival (Akt), glucose uptake (GLUT4 translocation), and cell proliferation (MAPK)",
          ]}
        />
        <p>
          GH secretagogues (CJC-1295, ipamorelin, tesamorelin) stimulate the top of this
          cascade and depend on intact pituitary function for their downstream effects. IGF-1
          variants (LR3, IGF-DES) bypass the cascade entirely and directly activate IGF-1R —
          making them useful research tools when pituitary function or hepatic IGF-1
          production is not the variable of interest.
        </p>
      </ArticleSection>

      <ArticleSection title="Somatostatin: The GH Braking System" variant="proof">
        <p>
          No guide to GH secretagogue research is complete without addressing somatostatin
          (SRIF — somatotropin release-inhibiting factor), the primary physiologic brake on
          GH secretion. Understanding its role explains several important observations:
        </p>
        <BulletList
          items={[
            "Somatostatin is released from hypothalamic neurons in a pulsatile fashion that is reciprocal to GHRH pulses — GH is highest when somatostatin is lowest",
            "GHS-R1a agonists (GHRPs) suppress somatostatin release from hypothalamic neurons, which is one reason GHRH + GHRP combinations exceed what GHRH alone can produce",
            "Somatostatin receptor analogs (octreotide, lanreotide) are pharmacologic tools used in research to suppress GH when excess secretion is the pathology under study — opposite use case from secretagogues",
            "Feedback regulation: rising IGF-1 stimulates hypothalamic somatostatin release, creating a negative feedback loop that limits GH pulse duration and prevents runaway secretion",
          ]}
        />
        <p>
          The somatostatin gate explains why GHRH analogs alone produce submaximal GH pulses:
          ambient somatostatin tone remains and limits somatotroph response. GHRPs remove this
          restriction by suppressing somatostatin simultaneously with stimulating GHS-R1a,
          which is why ipamorelin synergizes so effectively with CJC-1295.
        </p>
      </ArticleSection>
    </EntryArticleLayout>
  );
}
