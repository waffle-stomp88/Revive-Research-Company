import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { FlaskConical, BookOpen, Telescope, ShoppingBag, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EntryArticleLayout,
  ArticleSection,
  BulletList,
} from "@/components/entry-article-layout";
import { RelatedStacks } from "@/components/research-stacks/RelatedStacks";
import { BODY_SYSTEM_HUBS_BY_SLUG } from "@/data/body-system-hubs";

const COGNITIVE_COLOR = "#f97316";

const COGNITIVE_PEPTIDE_NAMES = ["Semax", "Selank", "Dihexa", "DSIP", "PT-141", "Noopept", "NSI-189"];

/* ─── Neuropeptide Signaling Cascade Diagram ─────────────────────────────── */

function NeuropeptideCascadeDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      label: "Receptor / Transporter Binding",
      sublabel: "ACTH analogs, AMPA potentiation, GABAergic modulation",
      color: "#f97316",
      peptides: ["Semax", "Selank", "Dihexa"],
      arrow: true,
      note: "MC4R, BDNF TrkB, EphB2/HGFr, GABA-A, serotonin 5-HT1A",
    },
    {
      label: "Neurotrophic Factor Cascade",
      sublabel: "BDNF · NGF synthesis → synaptic plasticity → LTP",
      color: "#fb923c",
      peptides: ["Semax", "Dihexa"],
      arrow: true,
      note: "TrkB autophosphorylation, CREB activation, dendritic spine density",
    },
    {
      label: "Downstream Cognitive Output",
      sublabel: "Memory consolidation · anxiety regulation · sleep architecture",
      color: "#fdba74",
      peptides: ["DSIP", "Selank"],
      arrow: false,
      note: "Delta sleep induction, cortisol normalisation, anxiolytic IL-6 modulation",
    },
  ];

  const sidePaths = [
    {
      label: "BDNF / TrkB Axis",
      color: COGNITIVE_COLOR,
      peptides: ["Semax", "Dihexa"],
      note: "Semax upregulates BDNF and NGF mRNA; Dihexa directly potentiates HGF→MET→EphB2→BDNF/TrkB signaling for synaptogenesis",
    },
    {
      label: "GABAergic Modulation",
      color: "#a3e635",
      peptides: ["Selank", "DSIP"],
      note: "Selank modulates GABA-A receptor subunit expression; DSIP prolongs non-REM slow-wave sleep via GABAergic inhibitory circuits",
    },
    {
      label: "Melanocortin Cognitive Pathway",
      color: "#e879f9",
      peptides: ["Semax"],
      note: "Semax is an ACTH4-7 analog that activates MC4R; melanocortin signaling enhances attentional arousal and memory retrieval",
    },
    {
      label: "Serotonin / HPA Regulation",
      color: "#38bdf8",
      peptides: ["Selank"],
      note: "Selank modulates 5-HT1A receptor activity and blunts corticosterone responses, reducing anxiety without sedation",
    },
    {
      label: "Delta Sleep Induction",
      color: "#818cf8",
      peptides: ["DSIP"],
      note: "Delta Sleep-Inducing Peptide crosses the BBB and promotes slow-wave sleep stages via opioid receptor and hypothalamic circuits",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-neuropeptide-cascade">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Neuropeptide Signaling Cascade — Where Each Cognitive Peptide Acts
      </h3>

      {/* Main cascade */}
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

      {/* Side pathway cards */}
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-mono">
        Parallel Cognitive Pathways
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sidePaths.map((path, i) => (
          <motion.div
            key={path.label}
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 + i * 0.1 }}
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
        Neuropeptide cascade overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

/* ─── Cognitive Peptide Reference Table ──────────────────────────────────── */

function CognitivePeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "Semax",
      type: "ACTH4-7 Pro-Gly-Pro analog",
      primary: "BDNF/NGF upregulation · MC4R activation · neuroprotection",
      note: "Heptapeptide developed in Russia; resists enzymatic degradation via Pro-Gly-Pro extension; crosses BBB via nasal route; extensive memory and stroke research",
    },
    {
      name: "Selank",
      type: "Tuftsin analog (TKPRP + Gly-Pro)",
      primary: "Anxiolytic · GABA-A modulation · 5-HT1A partial agonism",
      note: "Synthetic hexapeptide based on tuftsin (TKPR); modulates serotonin, dopamine, and enkephalin systems; reduces IL-6 without sedation or dependence",
    },
    {
      name: "Dihexa",
      type: "Angiotensin IV analog",
      primary: "HGF/MET receptor potentiation · synaptogenesis · LTP",
      note: "N-hexanoic acid modified Ang IV; activates HGF→MET→EphB2 pathway; 10 million-fold more potent than BDNF in cognitive improvement models; crosses BBB orally",
    },
    {
      name: "DSIP",
      type: "Delta Sleep-Inducing Peptide",
      primary: "Slow-wave sleep induction · HPA axis normalisation",
      note: "Nonapeptide originally isolated from rabbit cerebral venous blood; modulates opioid, serotonin, and GABA pathways; studied in stress adaptation and cortisol regulation",
    },
    {
      name: "PT-141",
      type: "Melanocortin receptor agonist",
      primary: "MC4R activation · dopaminergic arousal signaling",
      note: "Cyclic heptapeptide bremelanotide precursor; activates CNS MC4R independent of gonadal hormone levels; studied in motivation and arousal circuitry overlapping with cognitive attention",
    },
    {
      name: "Noopept",
      type: "Cycloprolylglycine prodrug",
      primary: "NGF/BDNF upregulation · AMPA potentiation · memory consolidation",
      note: "Orally active dipeptide; hydrolyzed to cycloprolylglycine in vivo; glutamate receptor modulation; enhances existing synaptic function rather than driving de novo synaptogenesis",
    },
    {
      name: "NSI-189",
      type: "Benzylpiperazine aminopyridine",
      primary: "Hippocampal neurogenesis · BDNF elevation",
      note: "Increases hippocampal volume in animal studies; stimulates neural stem cell proliferation in dentate gyrus; studied for major depressive disorder and cognitive decline",
    },
    {
      name: "Cerebrolysin",
      type: "Porcine brain-derived peptide mix",
      primary: "Neurotrophic signaling · synaptic plasticity · neuroprotection",
      note: "Multi-component; contains BDNF, NGF, and CNTF fragments; studied extensively in post-stroke cognitive recovery; parenteral administration required",
    },
    {
      name: "Pinealon",
      type: "Tripeptide brain bioregulator (Glu-Asp-Arg)",
      primary: "Pineal support · cognitive decline prevention · circadian regulation",
      note: "Khavinson-class bioregulator; penetrates blood-brain barrier; studied for circadian and cognitive aging; modulates melatonin pathway gene expression",
    },
    {
      name: "Cortagen",
      type: "Tetrapeptide brain bioregulator",
      primary: "Cortex neuronal differentiation · BDNF upregulation",
      note: "Cortex-specific Khavinson bioregulator; studied for age-related neurodegeneration prevention; promotes cortical progenitor differentiation in aged tissue models",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-cognitive-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Cognitive Cluster — Peptide Reference
      </h3>
      <table className="w-full text-sm border-collapse min-w-[620px]">
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
              transition={{ delay: i * 0.06 }}
              className="border-b border-border/40 hover-elevate"
            >
              <td className="py-2.5 pr-4 font-medium font-mono text-xs whitespace-nowrap" style={{ color: COGNITIVE_COLOR }}>
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

export default function CognitivePeptidesGuide() {
  const faqs = [
    {
      question: "What distinguishes cognitive neuropeptides from nootropic small molecules?",
      answer:
        "Neuropeptides like Semax, Selank, and Dihexa are endogenous signaling molecules or analogs thereof, acting through specific receptor systems (MC4R, TrkB, GABA-A, HGF/MET) that are native to neural tissue. Unlike racetams or amphetamine-class stimulants, which broadly modulate monoamine or glutamate tone, these peptides interact with upstream regulatory cascades — particularly neurotrophic factor pathways — that govern synaptic architecture and plasticity rather than just neurotransmitter availability. This makes their research profile mechanistically distinct: effects tend to be more durable and tied to structural synaptic changes rather than acute receptor saturation.",
    },
    {
      question: "What is BDNF and why does the Semax/Dihexa research focus on it?",
      answer:
        "Brain-Derived Neurotrophic Factor (BDNF) is the most abundant neurotrophin in the mammalian brain and the primary mediator of long-term potentiation (LTP), synaptic plasticity, and neuronal survival. It acts through TrkB (tropomyosin receptor kinase B) receptors, triggering cascades that strengthen synaptic connections and promote dendritic spine growth. Semax upregulates BDNF and NGF gene expression in hippocampal and prefrontal tissues. Dihexa works one step differently — it potentiates HGF (hepatocyte growth factor) receptor (MET) signaling, which in turn activates EphB2 receptors and increases BDNF-TrkB coupling efficiency. Research models show Dihexa may be orders of magnitude more potent than BDNF itself in inducing synaptogenesis when delivered systemically.",
    },
    {
      question: "How does Selank differ from conventional anxiolytics like benzodiazepines?",
      answer:
        "Benzodiazepines bind to the benzodiazepine allosteric site on GABA-A receptors, producing broad potentiation of inhibitory tone — which causes anxiolysis but also sedation, tolerance, and dependence. Selank modulates GABA-A receptor subunit expression more selectively, without direct allosteric binding at the benzodiazepine site. Additionally, Selank engages 5-HT1A serotonin receptors and reduces pro-inflammatory cytokine IL-6 without cortisol suppression. The compound shows anxiolytic effects in research models without the motor impairment or amnesia associated with benzodiazepine receptor agonists, and no withdrawal syndromes have been observed in animal models.",
    },
    {
      question: "What is Dihexa's mechanism and why is it studied for cognitive repair?",
      answer:
        "Dihexa (N-hexanoic-Tyr-Ile-(6)-aminohexanoic amide) is a synthetic modification of angiotensin IV that activates the hepatocyte growth factor (HGF) signaling pathway. HGF binds to MET receptor tyrosine kinase, which in turn transactivates EphB2 ephrin receptors — a system directly involved in synaptogenesis, axonal guidance, and dendritic spine formation. Because synapse loss is central to cognitive decline in neurodegeneration models, potentiating synaptogenesis pathways is a primary research target. Dihexa's oral bioavailability and blood-brain barrier penetration make it unusual among synaptogenic compounds, which typically require central administration.",
    },
    {
      question: "What is DSIP and how does it relate to cognition?",
      answer:
        "Delta Sleep-Inducing Peptide is a nonapeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) originally isolated from cerebral venous blood of rabbits in a sleep-induced state. It promotes slow-wave (delta) sleep stages through interactions with opioid receptors, serotonergic pathways, and hypothalamic GABAergic circuits. The cognitive relevance of DSIP research stems from the critical role of slow-wave sleep in memory consolidation — particularly hippocampal-to-cortical memory transfer that occurs during non-REM sleep. DSIP also normalises HPA axis dysregulation and cortisol patterns, which when chronically elevated suppress hippocampal neurogenesis and impair declarative memory.",
    },
    {
      question: "Is there a synergy between Semax and Selank?",
      answer:
        "Research interest in Semax + Selank combinations stems from their complementary receptor coverage: Semax primarily targets neurotrophic upregulation (BDNF, NGF) and melanocortin cognitive arousal, while Selank modulates the anxiolytic/serotonergic axis and reduces neuroinflammatory cytokine expression. In theory, Selank's anxiolytic GABAergic and serotonin modulation could provide a stabilising counterbalance to the arousal-enhancing profile of Semax, reducing any stimulatory side effects while the shared neuroprotective effects of both compounds may be additive. However, formal combination studies are limited and this remains an active area of preclinical interest.",
    },
    {
      question: "How does PT-141 relate to cognitive research?",
      answer:
        "PT-141 (bremelanotide) is categorised here as part of the cognitive cluster due to its central MC4R mechanism, which overlaps with attentional arousal and motivation circuits rather than purely reproductive function. Melanocortin 4 receptors are highly expressed in the prefrontal cortex, hippocampus, and amygdala — areas governing executive function, learning, and emotional processing. Semax is also an ACTH/melanocortin analog, meaning these two compounds share upstream receptor architecture. PT-141's cognitive pathway is secondary to its primary studied indication but represents a legitimate area of receptor-level overlap within the neuropeptide cluster.",
    },
    {
      question: "What are Khavinson bioregulator peptides?",
      answer:
        "Khavinson bioregulators (named after Prof. Vladimir Khavinson) are short di-, tri-, and tetrapeptides originally extracted from glandular tissue and then synthesized. They are designed to enter cell nuclei and modulate gene expression in a tissue-specific way, promoting cell renewal and reversing age-related functional decline. In the cognitive cluster: Pinealon (Glu-Asp-Arg) targets pineal and brain tissue for circadian and cognitive aging research; Cortagen targets cortical neurons for neurodegeneration prevention models.",
    },
    {
      question: "How does NSI-189 promote neurogenesis?",
      answer:
        "NSI-189 (a benzylpiperazine-aminopyridine compound) was originally identified in a screen for hippocampal neurogenesis stimulators. In animal models it increases hippocampal volume and BDNF levels, and stimulates the proliferation of neural stem cells in the dentate gyrus — a key region for new memory formation. It has also been studied in clinical trials for major depressive disorder, where hippocampal atrophy is a documented feature.",
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
      description: "Visualise the Cognitive cluster and its synergy connections",
    },
    {
      label: "Browse Cognitive Compounds",
      href: "/shop?system=cognitive",
      icon: ShoppingBag,
      description: "View research-grade cognitive peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated compound combinations built around cognitive peptides",
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
      title="Cognitive Peptides: Neuropeptide Signaling, BDNF Pathways, and Neuro Cluster Research"
      metaTitle="Cognitive Peptides Guide: Semax, Selank, Dihexa, DSIP & Neuropeptide Research | Revive Research"
      metaDescription="An in-depth research guide covering the cognitive/neuro neuropeptide cluster — Semax, Selank, Dihexa, DSIP, PT-141, Noopept, NSI-189, and Khavinson bioregulators — their BDNF, GABA, melanocortin, and HGF receptor mechanisms."
      canonicalPath="/systems/cognitive"
      badgeText="Cognitive System"
      badgeColor={COGNITIVE_COLOR}
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      systemHub={BODY_SYSTEM_HUBS_BY_SLUG["cognitive"]}
      introText={
        <>
          <p className="mb-4">
            The Cognitive/Neuro cluster brings together some of the most mechanistically
            sophisticated peptides in the research field — compounds that modulate synaptic
            plasticity, neurotrophic factor expression, anxiety circuitry, and sleep architecture
            through distinct but complementary receptor systems. The cluster is anchored by{" "}
            <strong>Semax</strong> and <strong>Selank</strong> — two peptides developed through
            decades of Soviet and Russian neuropharmacology research — and extended by the
            synaptogenesis-focused <strong>Dihexa</strong>, the sleep-regulating <strong>DSIP</strong>,
            the melanocortin arousal compound <strong>PT-141</strong>, and the broader family of
            neurotrophic amplifiers including Noopept, NSI-189, Cerebrolysin, and Khavinson
            bioregulators such as Pinealon and Cortagen.
          </p>
          <p>
            Unlike stimulant-class cognitive enhancers that modulate monoamine tone, these
            neuropeptides act at <strong>upstream regulatory nodes</strong> — BDNF/TrkB cascades,
            HGF/MET synaptogenesis pathways, GABAergic subunit expression, and melanocortin
            receptor circuits — that govern the structural and biochemical architecture of
            neural networks rather than their moment-to-moment neurotransmitter availability.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <NeuropeptideCascadeDiagram />

      <ArticleSection title="The Neurotrophic Core: BDNF, NGF, and TrkB">
        <p>
          Two neurotrophins dominate the cognitive neuropeptide research landscape:{" "}
          <strong>Brain-Derived Neurotrophic Factor (BDNF)</strong> and{" "}
          <strong>Nerve Growth Factor (NGF)</strong>. Both signal through tropomyosin
          receptor kinase (Trk) receptors — TrkB for BDNF, TrkA for NGF — to activate
          cascades that:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "Promote dendritic spine formation and density — the anatomical substrate of long-term memory",
            "Activate CREB (cAMP response element-binding protein) transcription, driving gene expression changes that consolidate synaptic potentiation",
            "Support neuronal survival through PI3K/Akt and MAPK/ERK pathways",
            "Regulate synaptogenesis — the formation of new synapses during learning and recovery",
          ]}
        />
        <p>
          BDNF expression is directly upregulated by Semax (via ACTH/melanocortin receptor
          activation in hippocampal and prefrontal tissues) and indirectly potentiated by
          Dihexa (via the HGF→MET→EphB2 cascade that increases BDNF-TrkB coupling efficiency).
          This makes BDNF/TrkB the shared downstream convergence point for two otherwise
          mechanistically distinct peptides. Noopept and NSI-189 also converge here through
          distinct upstream routes, making neurotrophic upregulation the unifying theme across
          the entire cognitive cluster.
        </p>
      </ArticleSection>

      <ArticleSection title="Semax — ACTH Analog with Neurotrophic Amplification" variant="proof">
        <p>
          Semax (Met-Glu-His-Phe-Pro-Gly-Pro) is a heptapeptide analog of the ACTH4-7
          fragment — the portion of adrenocorticotropic hormone responsible for behavioural
          and cognitive rather than adrenal effects. The Pro-Gly-Pro C-terminal extension
          protects the active core from enzymatic degradation, dramatically extending its
          useful research half-life.
        </p>
        <p>
          Its primary receptor targets in cognitive research:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "MC4R (melanocortin 4 receptor) — attentional arousal, executive function pathways in prefrontal cortex",
            "BDNF and NGF mRNA upregulation in hippocampal and cortical tissue — structural basis for memory enhancement",
            "Dopaminergic and serotonergic modulation in basal forebrain and striatum",
            "Neuroprotective activity in ischaemia models via anti-apoptotic and antioxidant cascades",
          ]}
        />
        <p>
          A key feature of Semax is its intranasal bioavailability — it crosses the blood-brain
          barrier efficiently via the olfactory epithelium route, making it one of the few
          neuropeptides with direct CNS access without injection.
        </p>
      </ArticleSection>

      <ArticleSection title="Selank — Tuftsin Analog with Anxiolytic and Anti-Inflammatory Activity">
        <p>
          Selank (Thr-Lys-Pro-Arg-Pro-Gly-Pro) is a synthetic hexapeptide modeled on tuftsin
          (TKPR), a natural tetrapeptide fragment of IgG with immunomodulatory activity. The
          Pro-Gly-Pro C-terminal extension mirrors Semax's enzymatic protection strategy.
        </p>
        <p>
          Selank's cognitive research profile runs through three interconnected systems:
        </p>
        <BulletList
          items={[
            "GABAergic modulation — selectively alters GABA-A receptor subunit expression without direct benzodiazepine site binding, producing anxiolysis without sedation or tolerance",
            "Serotonergic regulation — partial 5-HT1A agonism stabilises stress-induced mood dysregulation and normalises HPA axis cortisol output",
            "Cytokine downregulation — reduces IL-6 expression, attenuating neuroinflammatory tone that impairs hippocampal plasticity",
          ]}
        />
        <p>
          The practical distinction between Selank and conventional anxiolytics is the
          absence of cognitive impairment — benzodiazepines at anxiolytic doses measurably
          impair declarative memory and psychomotor function, while Selank research models
          show cognitive preservation or mild enhancement alongside anxiety reduction.
        </p>
      </ArticleSection>

      <ArticleSection title="Dihexa — Synaptogenesis via HGF/MET/EphB2" variant="proof">
        <p>
          Dihexa represents one of the most mechanistically novel compounds in the cognitive
          peptide space. As a modified angiotensin IV analog (N-hexanoic-Tyr-Ile-6-aminohexanoic
          amide), it bypasses classical neuropeptide receptor systems entirely and instead
          potentiates the <strong>hepatocyte growth factor (HGF) / MET receptor</strong> axis.
        </p>
        <p>
          The synaptogenic cascade Dihexa engages:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "Dihexa binds HGF and potentiates its affinity for the MET receptor tyrosine kinase",
            "MET activation transactivates EphB2 (ephrin B2 receptor) — a key regulator of synapse formation and dendritic spine morphogenesis",
            "EphB2 signaling downstream increases BDNF-TrkB coupling efficiency — explaining the BDNF-like outcomes despite a completely different upstream mechanism",
            "Net effect: formation of new functional synapses, not merely modulation of existing ones",
          ]}
        />
        <p>
          Research models report Dihexa may be <strong>10 million-fold more potent than BDNF</strong>{" "}
          in synaptogenesis assays when delivered systemically — a finding that positions it as
          a uniquely powerful tool in neurodegeneration and cognitive repair research. Compare
          this to Noopept, which works primarily by improving the function of{" "}
          <em>existing</em> synapses through AMPA/NMDA modulation and neurotrophic support
          rather than driving de novo synapse formation.
        </p>
      </ArticleSection>

      <ArticleSection title="DSIP — Sleep Architecture and Cognitive Consolidation">
        <p>
          Delta Sleep-Inducing Peptide is a nonapeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu)
          originally isolated in 1974 from cerebral venous blood of rabbits in whom delta-wave
          sleep was artificially induced. Its cognitive relevance stems from the critical role
          of slow-wave sleep in memory consolidation.
        </p>
        <BulletList
          items={[
            "During non-REM slow-wave sleep, the hippocampus replays recent experiences and transfers them to neocortical long-term storage — a process called systems consolidation",
            "DSIP promotes delta-wave sleep stages via opioid receptor modulation and hypothalamic GABAergic circuits",
            "DSIP normalises HPA axis dysregulation: chronically elevated cortisol is one of the most reliable suppressors of hippocampal neurogenesis and declarative memory",
            "DSIP crosses the blood-brain barrier despite its peptide nature — facilitating central action after peripheral administration in research models",
          ]}
        />
        <p>
          This makes DSIP an unusual cognitive compound: it does not acutely enhance cognition
          but instead targets the <em>restorative substrate</em> through which cognitive performance
          is maintained — sleep-dependent memory consolidation and stress hormone normalisation.
        </p>
      </ArticleSection>

      <ArticleSection title="Shared Melanocortin Architecture: Semax and PT-141" variant="revive">
        <p>
          A thread connecting Semax and PT-141 is their shared melanocortin receptor pharmacology.
          Both are classified as melanocortin receptor agonists — Semax as an ACTH analog
          (MC4R preference) and PT-141 (bremelanotide) as a non-selective melanocortin agonist
          with strong MC4R activity.
        </p>
        <BulletList
          color="#e879f9"
          items={[
            "MC4R is expressed densely in the prefrontal cortex, hippocampus, amygdala, and hypothalamus — all regions central to cognition, mood, and arousal",
            "Semax's cognitive enhancement profile runs primarily through MC4R-mediated attentional arousal and downstream neurotrophic upregulation",
            "PT-141's primary studied indication is separate (sexual arousal via spinal MC4R), but its CNS receptor overlap with cognitive circuits is a recognised research intersection",
            "The melanocortin system regulates energy balance, attentional focus, stress response, and feeding — making it a broad-acting neuromodulatory hub",
          ]}
        />
        <p>
          This shared receptor architecture means researchers studying the cognitive/neuro cluster
          have a mechanistic basis for understanding why compounds with ostensibly different
          primary indications converge on overlapping neural substrates.
        </p>
      </ArticleSection>

      <ArticleSection title="Khavinson Bioregulators: Pinealon and Cortagen">
        <p>
          Khavinson bioregulators are short peptides (di-, tri-, tetrapeptide) developed by
          Prof. Vladimir Khavinson at the St. Petersburg Institute of Bioregulation and Gerontology.
          The underlying premise is tissue-specific gene regulation — each peptide is
          designed to penetrate cell nuclei and modulate epigenetic expression in a
          targeted organ, reversing age-related gene silencing.
        </p>
        <BulletList
          items={[
            "Pinealon (Glu-Asp-Arg) — targets pineal gland and cortical tissue; modulates melatonin pathway gene expression; studied for cognitive aging and circadian rhythm disruption in aged research models",
            "Cortagen (Ala-Glu-Asp-Gly) — cortex-specific bioregulator; promotes cortical neuron differentiation and BDNF expression; studied in neurodegeneration prevention and age-related cognitive decline models",
            "Both penetrate the blood-brain barrier more efficiently than larger neuropeptides due to their minimal size",
          ]}
        />
        <p>
          The Khavinson category represents a distinct research paradigm from the receptor-targeted
          compounds above — instead of acutely modulating a signaling cascade, they are studied
          for epigenetic restoration of gene expression patterns that decline with biological age.
        </p>
      </ArticleSection>

      <CognitivePeptideTable />

      <ArticleSection title="Key Research Combinations in the Cognitive Cluster">
        <p>
          Within the cognitive cluster, three research combination themes are most
          frequently studied:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "Semax + Selank — complementary coverage: Semax for neurotrophic upregulation and arousal, Selank for anxiolytic stabilisation and neuroinflammation reduction. Together they address both the stimulatory and inhibitory arms of cognitive regulation.",
            "Semax + Dihexa — synaptogenic amplification: both converge on BDNF/TrkB downstream, but via independent upstream pathways (ACTH/MC4R vs HGF/MET). Combining them may provide additive synaptogenic signaling without pathway redundancy.",
            "DSIP + any daytime cognitive peptide — temporal complementarity: DSIP supports nocturnal memory consolidation while daytime compounds address acute cognitive performance. This chronobiological approach treats cognition as a full 24-hour process rather than an acute intervention.",
          ]}
        />
      </ArticleSection>

      <RelatedStacks peptideNames={COGNITIVE_PEPTIDE_NAMES} />
    </EntryArticleLayout>
  );
}
