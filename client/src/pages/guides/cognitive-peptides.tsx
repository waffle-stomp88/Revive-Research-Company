import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Telescope, ShoppingBag, Activity, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  EntryArticleLayout,
  ArticleSection,
  BulletList,
} from "@/components/entry-article-layout";

const COGNITIVE_COLOR = "#21d8ff";

function CognitiveMechanismDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const clusters = [
    {
      label: "Neurotrophic Factor Upregulation",
      sublabel: "BDNF, NGF, CNTF — neuronal growth and survival",
      color: "#21d8ff",
      peptides: ["Semax", "Noopept", "NSI-189", "P21 Peptide", "Dihexa"],
    },
    {
      label: "Neuroprotection & Bioregulation",
      sublabel: "Cellular defense against oxidative and excitotoxic damage",
      color: "#0ea5e9",
      peptides: ["Cerebrolysin", "Cortagen", "Pinealon", "Cortexin", "Cortistatin"],
    },
    {
      label: "Anxiolytic / GABAergic Modulation",
      sublabel: "Anxiety reduction, mood stabilization, stress resilience",
      color: "#0284c7",
      peptides: ["Selank", "DSIP", "Cortexin"],
    },
    {
      label: "Synaptic Plasticity Enhancement",
      sublabel: "LTP, synaptogenesis, memory consolidation",
      color: "#0369a1",
      peptides: ["Dihexa", "Noopept", "Cerebrolysin", "NSI-189"],
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-cognitive-mechanisms">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Cognitive Cluster — Mechanism Families
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {clusters.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12 }}
          >
            <Card
              className="p-4 border h-full"
              style={{
                borderColor: `${c.color}40`,
                background: `${c.color}0a`,
              }}
            >
              <p className="font-semibold text-sm mb-0.5" style={{ color: c.color }}>{c.label}</p>
              <p className="text-xs text-muted-foreground mb-3">{c.sublabel}</p>
              <div className="flex flex-wrap gap-1">
                {c.peptides.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] px-1.5 py-0.5 rounded-full border font-mono"
                    style={{
                      borderColor: `${c.color}40`,
                      color: c.color,
                      background: `${c.color}15`,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 text-center font-mono">
        Cognitive cluster overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

function CognitivePeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "Semax",
      type: "ACTH(4-7) heptapeptide analog",
      primary: "BDNF/NGF upregulation, dopamine modulation",
      note: "Russian nootropic peptide; intranasal delivery; studied for stroke recovery and cognitive enhancement",
    },
    {
      name: "Selank",
      type: "Tuftsin analog heptapeptide",
      primary: "GABAergic anxiolytic, immunomodulation",
      note: "Stable tuftsin analog; anxiolytic without sedation; serotonin and BDNF effects in rodent models",
    },
    {
      name: "Noopept",
      type: "Cycloprolylglycine prodrug",
      primary: "NGF/BDNF upregulation, memory consolidation",
      note: "Orally active dipeptide; hydrolyzed to cycloprolylglycine in vivo; glutamate receptor modulation",
    },
    {
      name: "Dihexa",
      type: "HGF/MET signaling potentiator",
      primary: "Synaptogenesis, cognitive restoration",
      note: "Angiotensin IV analog; potentiates hepatocyte growth factor to drive new synapse formation; studied in Alzheimer models",
    },
    {
      name: "NSI-189",
      type: "Benzylpiperazine aminopyridine",
      primary: "Hippocampal neurogenesis, BDNF elevation",
      note: "Increases hippocampal volume in animal studies; studied for major depressive disorder and cognitive decline",
    },
    {
      name: "Cerebrolysin",
      type: "Porcine brain-derived peptide mix",
      primary: "Neurotrophic signaling, synaptic plasticity",
      note: "Multi-component; contains BDNF, NGF, and CNTF fragments; studied extensively in post-stroke cognitive recovery",
    },
    {
      name: "Pinealon",
      type: "Tripeptide brain bioregulator (Glu-Asp-Arg)",
      primary: "Pineal support, cognitive decline prevention",
      note: "Khavinson-class bioregulator; penetrates blood-brain barrier; studied for circadian and cognitive aging",
    },
    {
      name: "Cortagen",
      type: "Tetrapeptide brain bioregulator",
      primary: "Cortex neuronal differentiation, BDNF",
      note: "Cortex-specific Khavinson bioregulator; studied for age-related neurodegeneration prevention",
    },
    {
      name: "P21 Peptide",
      type: "CNTF receptor agonist",
      primary: "Neural stem cell activation",
      note: "Ciliary neurotrophic factor analog; activates neural progenitor cells; studied for neuroregeneration",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-cognitive-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Cognitive Cluster — Peptide Reference
      </h3>
      <table className="w-full text-sm border-collapse min-w-[580px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold w-36">Peptide</th>
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold w-44">Class</th>
            <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Primary Action</th>
            <th className="text-left py-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Research Note</th>
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

export default function CognitivePeptidesGuide() {
  const faqs = [
    {
      question: "What is BDNF and why do so many cognitive peptides target it?",
      answer:
        "BDNF (Brain-Derived Neurotrophic Factor) is the most abundant neurotrophic factor in the adult brain. It supports the survival of existing neurons, promotes the growth of new neurons and synapses (neuroplasticity), and is critical for long-term potentiation (LTP) — the cellular basis of memory formation. Low BDNF is strongly associated with depression, cognitive decline, and neurodegenerative conditions. Many cognitive peptides (Semax, Selank, Noopept, NSI-189) converge on BDNF upregulation as a common mechanism.",
    },
    {
      question: "How does Dihexa enhance synaptogenesis?",
      answer:
        "Dihexa is an angiotensin IV analog that potentiates the interaction between hepatocyte growth factor (HGF) and its receptor MET. The HGF/MET pathway is a powerful driver of synaptogenesis — the formation of new synaptic connections. In animal studies, Dihexa has shown cognitive enhancement orders of magnitude more potent than BDNF itself when injected directly. Researchers are particularly interested in its potential in Alzheimer's disease models where synaptic density loss is a primary pathological feature.",
    },
    {
      question: "What makes Selank different from conventional anxiolytics?",
      answer:
        "Conventional anxiolytics like benzodiazepines act directly as GABA-A receptor positive allosteric modulators, producing sedation, muscle relaxation, and tolerance with repeated use. Selank, as a tuftsin analog, modulates the GABAergic system more indirectly, producing anxiolytic effects without sedation or reported tolerance in animal models. It also has immunomodulatory properties through its structural similarity to tuftsin (an immune-activating tetrapeptide), and elevates serotonin and BDNF — giving it a broader neurochemical profile.",
    },
    {
      question: "What are Khavinson bioregulator peptides?",
      answer:
        "Khavinson bioregulators (named after Prof. Vladimir Khavinson) are short di-, tri-, and tetrapeptides originally extracted from glandular tissue and then synthesized. They are designed to enter cell nuclei and modulate gene expression in a tissue-specific way, promoting cell renewal and reversing age-related functional decline. In the cognitive cluster: Pinealon (Glu-Asp-Arg) targets pineal and brain tissue; Cortagen targets cortical neurons; Cortexin is a polypeptide complex derived from calf brain cortex.",
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
      description: "Explore curated combinations involving cognitive peptides",
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
      title="Cognitive Peptides: Neurotrophic Factors, Neuroprotection, and Brain Research"
      metaTitle="Cognitive Peptides: BDNF, Neuroprotection & Neuroplasticity Research Guide | Revive Research"
      metaDescription="An in-depth research guide covering cognitive-cluster peptides — Semax, Selank, Noopept, Dihexa, NSI-189, Cerebrolysin, Pinealon, and more — explaining BDNF upregulation, synaptogenesis, GABAergic modulation, and Khavinson bioregulator mechanisms."
      canonicalPath="/guides/cognitive-peptides"
      badgeText="Cognitive System"
      badgeColor={COGNITIVE_COLOR}
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      introText={
        <>
          <p className="mb-4">
            The cognitive cluster brings together some of the most mechanistically diverse
            compounds in peptide research. What unifies them is a focus on the brain's
            capacity for <strong>neuroplasticity</strong> — the ability to form new
            connections, protect existing neurons, and recover from injury or age-related
            decline.
          </p>
          <p>
            This guide maps the four key mechanism families in this cluster, explains what
            distinguishes Russian nootropic peptides from Western research compounds, and
            clarifies the Khavinson bioregulator category that is increasingly prominent
            in longevity-adjacent cognitive research.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <CognitiveMechanismDiagram />

      <ArticleSection title="Neurotrophic Factors: BDNF, NGF, and the Growth of the Brain">
        <p>
          Neurotrophic factors are proteins that support the survival, growth, and
          differentiation of neurons. The two most studied in peptide research are:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "BDNF (Brain-Derived Neurotrophic Factor) — master regulator of synaptic plasticity; required for LTP and memory consolidation; declines with age, stress, and neurodegeneration",
            "NGF (Nerve Growth Factor) — critical for cholinergic neuron survival; first neurotrophic factor discovered; key in Alzheimer's research",
            "CNTF (Ciliary Neurotrophic Factor) — promotes neural stem cell survival and differentiation; P21 Peptide acts as a CNTF receptor agonist",
            "GDNF (Glial cell-derived neurotrophic factor) — protects dopaminergic neurons; relevant to Parkinson's disease models",
          ]}
        />
        <p>
          The challenge with direct neurotrophic factor administration is blood-brain barrier
          penetration. This is why peptide analogs and mimetics that upregulate endogenous
          neurotrophic factor production — or smaller peptides that cross the BBB — are the
          predominant research focus.
        </p>
      </ArticleSection>

      <ArticleSection title="Semax and Selank: Russian Nootropic Peptides" variant="proof">
        <p>
          Semax and Selank were both developed by the Institute of Molecular Genetics of
          the Russian Academy of Sciences and have a long research history in the former
          Soviet Union that is distinct from Western peptide development:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "Semax — ACTH(4-7)PGP heptapeptide; stabilized fragment of adrenocorticotropic hormone; intranasal administration reaches CNS rapidly; upregulates BDNF, NGF, and dopamine in the prefrontal cortex",
            "Selank — Thr-Lys-Pro-Arg-Pro-Gly-Pro heptapeptide; derived from tuftsin; anxiolytic through GABAergic modulation; immunomodulatory; no reported tolerance",
            "Both are approved in Russia for clinical use in conditions including cognitive decline and generalized anxiety disorder",
          ]}
        />
        <p>
          Their mechanism is distinguished from simple receptor agonism — they act as
          modulators that shift the brain's own production of neurotrophic factors
          rather than substituting for them directly.
        </p>
      </ArticleSection>

      <ArticleSection title="Noopept and Dihexa: Synaptogenesis Amplifiers">
        <p>
          Noopept and Dihexa represent a class of cognitive peptides focused specifically
          on enhancing the density and efficiency of synaptic connections:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "Noopept — orally bioavailable dipeptide prodrug of cycloprolylglycine; enters the brain and modulates AMPA/NMDA receptors while upregulating NGF and BDNF; memory consolidation enhancement",
            "Dihexa — angiotensin IV analog; potentiates HGF/MET signaling to drive new synapse formation; one of the most potent known synaptogenic compounds in animal models; studied in Alzheimer's disease contexts",
          ]}
        />
        <p>
          The distinction between these compounds is worth noting: Noopept works primarily
          by improving the function of existing synapses through receptor modulation and
          neurotrophic support. Dihexa drives the physical formation of new synaptic
          contacts — a more fundamental structural change.
        </p>
      </ArticleSection>

      <CognitivePeptideTable />

      <ArticleSection title="Khavinson Bioregulators in Cognitive Research" variant="revive">
        <p>
          Pinealon, Cortagen, and Cortexin belong to the Khavinson class of short
          tissue-specific bioregulator peptides. Their proposed mechanism differs from
          receptor-based drugs:
        </p>
        <BulletList
          color={COGNITIVE_COLOR}
          items={[
            "These peptides are proposed to penetrate cell nuclei and interact directly with DNA regulatory sequences",
            "They are tissue-specific — Pinealon targets pineal and neural tissue, Cortagen targets cortical neurons",
            "Research focus: reversing age-related transcription silencing of genes involved in cell renewal and function",
            "Studies suggest they can restore youthful gene expression patterns in senescent neural cells",
          ]}
        />
        <p>
          The Khavinson bioregulator class sits at the intersection of cognitive and
          longevity research — many of these compounds have shown both cognitive-protective
          and lifespan-extending effects in animal models, reflecting their proposed
          epigenetic mechanism.
        </p>
      </ArticleSection>
    </EntryArticleLayout>
  );
}
