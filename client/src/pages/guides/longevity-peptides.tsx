import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Telescope, ShoppingBag, Activity, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EntryArticleLayout,
  ArticleSection,
  BulletList,
} from "@/components/entry-article-layout";
import { getStacksByPeptideNames } from "@/data/research-stacks";

const LONGEVITY_COLOR = "#a855f7";

const LONGEVITY_PEPTIDE_NAMES = ["Epithalon", "GHK-Cu", "FOXO4-DRI", "SS-31", "MOTS-C", "Humanin", "ARA-290", "Pinealon", "Cortagen", "Cardiogen"];

function RelatedStacks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const stacks = getStacksByPeptideNames(LONGEVITY_PEPTIDE_NAMES);

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="section-related-stacks">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Research Stacks Featuring These Compounds
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {stacks.map((stack, i) => (
          <motion.div
            key={stack.id}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12 }}
          >
            <Card
              className="p-5 h-full border flex flex-col gap-3"
              style={{
                borderColor: `${stack.color}40`,
                background: `${stack.color}0a`,
              }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: stack.color }}
                >
                  {stack.subtitle}
                </p>
                <p className="font-semibold text-base leading-snug">{stack.name}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {stack.peptides.map((peptide) => (
                  <span
                    key={peptide.name}
                    className="text-xs px-2 py-0.5 rounded-full border font-mono"
                    style={{
                      borderColor: `${stack.color}50`,
                      color: stack.color,
                      background: `${stack.color}18`,
                    }}
                  >
                    {peptide.name}
                  </span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {stack.description}
              </p>

              <Link href={`/research-stacks/${stack.id}`} data-testid={`link-related-stack-${stack.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  style={{ borderColor: `${stack.color}50`, color: stack.color }}
                >
                  View Stack Details
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 font-mono">
        Research compound stacks · For research use only · Not medical advice
      </p>
      <div className="mt-4 text-center">
        <Link
          href="/research-stacks"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="link-view-all-stacks"
        >
          Browse all research stacks →
        </Link>
      </div>
    </div>
  );
}

function LongevityHallmarksDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const hallmarks = [
    {
      label: "Genomic Instability & Telomere Attrition",
      sublabel: "Telomerase activation, DNA repair support",
      color: "#a855f7",
      peptides: ["Epithalon", "NAD+ Precursor"],
    },
    {
      label: "Senescent Cell Clearance",
      sublabel: "Removing cells that drive chronic inflammation",
      color: "#9333ea",
      peptides: ["FOXO4-DRI", "GHK-Cu"],
    },
    {
      label: "Mitochondrial Dysfunction",
      sublabel: "Membrane stabilization, ETC optimization, ROS control",
      color: "#7c3aed",
      peptides: ["SS-31", "MOTS-C", "Humanin", "Glutathione"],
    },
    {
      label: "Thymic & Immune Senescence",
      sublabel: "Reversing age-related immune decline",
      color: "#6d28d9",
      peptides: ["Thymalin", "Thymulin", "Vilon", "Thymopentin"],
    },
    {
      label: "Epigenetic & Bioregulator Reprogramming",
      sublabel: "Tissue-specific gene expression restoration",
      color: "#5b21b6",
      peptides: ["Epithalon", "Pinealon", "Cortagen", "Cardiogen"],
    },
    {
      label: "Intercellular Signaling",
      sublabel: "NAD+ salvage, sirtuin activation, tissue crosstalk",
      color: "#4c1d95",
      peptides: ["NAD+ Precursor", "5-Amino-1MQ", "ARA-290"],
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-longevity-hallmarks">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Longevity Cluster — Hallmarks of Aging Targeted
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {hallmarks.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className="p-3 border h-full"
              style={{
                borderColor: `${h.color}40`,
                background: `${h.color}0a`,
              }}
            >
              <p className="font-semibold text-xs mb-0.5" style={{ color: h.color }}>{h.label}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{h.sublabel}</p>
              <div className="flex flex-wrap gap-1">
                {h.peptides.map((p) => (
                  <span
                    key={p}
                    className="text-[9px] px-1.5 py-0.5 rounded-full border font-mono"
                    style={{
                      borderColor: `${h.color}40`,
                      color: h.color,
                      background: `${h.color}18`,
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
        Longevity cluster overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

function LongevityPeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "Epithalon",
      type: "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
      primary: "Telomerase activation, pineal function",
      note: "Derived from epithalamin; studied for telomere extension, melatonin regulation, and lifespan extension in animal models",
    },
    {
      name: "FOXO4-DRI",
      type: "D-retro-inverso FOXO4 peptide",
      primary: "Senescent cell apoptosis induction",
      note: "Disrupts FOXO4-p53 interaction in senescent cells, triggering their selective apoptosis while sparing healthy cells",
    },
    {
      name: "SS-31",
      type: "Szeto-Schiller tetrapeptide",
      primary: "Inner mitochondrial membrane stabilization",
      note: "Binds cardiolipin on inner mitochondrial membrane; protects electron transport chain; reduces mitochondrial ROS",
    },
    {
      name: "Humanin",
      type: "Mitochondrial-derived peptide (21 AA)",
      primary: "Cell death inhibition, insulin sensitivity",
      note: "Encoded in mitochondrial 16S rRNA; circulating levels decline with age; STAT3 and anti-apoptotic signaling",
    },
    {
      name: "Glutathione",
      type: "Endogenous tripeptide (Glu-Cys-Gly)",
      primary: "Master antioxidant, phase II detoxification",
      note: "Most abundant intracellular antioxidant; GSH/GSSG ratio is a cellular redox sensor; declines with age and chronic disease",
    },
    {
      name: "NAD+ Precursor",
      type: "NAD+ pathway precursor",
      primary: "Sirtuin activation, PARP DNA repair",
      note: "NAD+ is consumed by sirtuins, PARPs, and CD38; supplementation studied to restore youthful NAD+ levels in aging tissue",
    },
    {
      name: "Thymalin",
      type: "Thymic extract polypeptide",
      primary: "Immunosenescence reversal, T-cell maturation",
      note: "Natural thymic extract; studied by Khavinson for reversal of thymic involution and restoration of immune competence",
    },
    {
      name: "Angiotensin 1-7",
      type: "Renin-angiotensin counter-regulatory peptide",
      primary: "Anti-fibrotic, vasodilation, cardioprotection",
      note: "Counter-regulates the classic angiotensin II/AT1R axis; anti-fibrotic in heart, kidney, and liver aging models",
    },
    {
      name: "ARA-290",
      type: "EPO-derived innate repair receptor agonist",
      primary: "Tissue protection, innate repair activation",
      note: "Non-erythropoietic EPO fragment; activates IRR (innate repair receptor) for cytoprotective signaling across tissues",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-longevity-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Longevity Cluster — Peptide Reference
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
              <td className="py-2.5 pr-4 font-medium font-mono text-xs whitespace-nowrap" style={{ color: LONGEVITY_COLOR }}>
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

export default function LongevityPeptidesGuide() {
  const faqs = [
    {
      question: "What are the hallmarks of aging and how do peptides target them?",
      answer:
        "The 'Hallmarks of Aging' framework (Lopez-Otin et al.) identifies nine primary mechanisms of aging: genomic instability, telomere attrition, epigenetic alterations, loss of proteostasis, deregulated nutrient sensing, mitochondrial dysfunction, cellular senescence, stem cell exhaustion, and altered intercellular communication. Longevity-cluster peptides target at least six of these: Epithalon (telomere/epigenetic), FOXO4-DRI (senescence), SS-31 and Humanin (mitochondrial), NAD+ precursors (nutrient sensing/sirtuins), thymic peptides (stem cell support), and Khavinson bioregulators (intercellular signaling/epigenetics).",
    },
    {
      question: "How does Epithalon extend telomeres?",
      answer:
        "Epithalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide based on epithalamin, extracted from the pineal gland. In cell culture and animal studies, it upregulates the expression of human telomerase reverse transcriptase (hTERT) — the catalytic subunit of telomerase — in somatic cells that normally have telomerase silenced. This allows telomere elongation and extension of cellular replicative lifespan. Epithalon has shown lifespan-extending effects in multiple animal models. Its pineal effects also regulate melatonin synthesis, connecting it to circadian rhythm research.",
    },
    {
      question: "What is FOXO4-DRI and how does it clear senescent cells?",
      answer:
        "Senescent cells accumulate with age and secrete pro-inflammatory molecules (SASP — senescence-associated secretory phenotype) that damage surrounding tissue. They evade apoptosis partly because FOXO4 (a forkhead transcription factor) interacts with p53 to suppress the death signal. FOXO4-DRI is a D-retro-inverso (protease-resistant) peptide that disrupts the FOXO4-p53 interaction specifically in senescent cells, restoring p53's ability to trigger apoptosis and clearing senescent cells selectively. Normal, healthy cells are largely spared because FOXO4-p53 interaction is less critical for their survival.",
    },
    {
      question: "How does SS-31 protect mitochondria?",
      answer:
        "SS-31 (Szeto-Schiller peptide 31) is a cell-permeable tetrapeptide with alternating aromatic and basic residues that selectively concentrates in the inner mitochondrial membrane. There it binds cardiolipin — a phospholipid critical for the organization and function of electron transport chain (ETC) complexes. As mitochondria age, cardiolipin oxidizes and ETC complexes become disorganized, increasing electron leakage and reactive oxygen species (ROS) production. SS-31 stabilizes cardiolipin, restoring ETC efficiency and reducing mitochondrial ROS — the core source of oxidative aging.",
    },
    {
      question: "What is the NAD+ connection in longevity research?",
      answer:
        "NAD+ (nicotinamide adenine dinucleotide) is a coenzyme required by sirtuins (NAD+-dependent deacetylases that regulate gene expression and DNA repair), PARPs (DNA damage repair enzymes), and CD38 (a signaling enzyme that becomes overactive with age). NAD+ levels fall 40-60% between youth and middle age, impairing all three pathways. NAD+ precursors (NMN, NR) restore cellular NAD+ pools. 5-Amino-1MQ prevents NAD+ destruction by inhibiting NNMT, effectively raising NAD+ through a different mechanism. Both approaches are intensely studied in aging models.",
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
      description: "Visualise the Longevity cluster and its synergy connections",
    },
    {
      label: "Browse Longevity Compounds",
      href: "/shop?system=longevity",
      icon: ShoppingBag,
      description: "View research-grade longevity peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated combinations involving longevity peptides",
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
      title="Longevity Peptides: Telomeres, Senescence, Mitochondria, and Anti-Aging Research"
      metaTitle="Longevity Peptides: Telomeres, Senescent Cells & Mitochondrial Research Guide | Revive Research"
      metaDescription="An in-depth research guide covering longevity-cluster peptides — Epithalon, FOXO4-DRI, SS-31, Humanin, Glutathione, NAD+ precursors, thymic peptides, and more — mapped to the hallmarks of aging framework and key longevity signaling pathways."
      canonicalPath="/guides/longevity-peptides"
      badgeText="Longevity System"
      badgeColor={LONGEVITY_COLOR}
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      introText={
        <>
          <p className="mb-4">
            The longevity cluster is perhaps the most scientifically ambitious in peptide
            research, targeting the fundamental <strong>hallmarks of aging</strong> themselves
            rather than symptoms or downstream effects. Compounds in this cluster act on
            telomere dynamics, senescent cell accumulation, mitochondrial dysfunction,
            thymic immune decline, NAD+ metabolism, and epigenetic reprogramming.
          </p>
          <p>
            This guide maps longevity-cluster peptides to the hallmarks of aging framework,
            explains the distinct mechanisms within the thymic bioregulator and
            mitochondrial-derived peptide subclasses, and clarifies the connections to
            adjacent metabolic and cognitive clusters.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <LongevityHallmarksDiagram />

      <ArticleSection title="Telomere Biology: Epithalon and the Clock of Cellular Aging">
        <p>
          Telomeres are repetitive DNA sequences (TTAGGG) that cap chromosome ends and
          shorten with each cell division. When telomeres become critically short, cells
          either enter senescence or apoptosis — halting tissue renewal. Telomerase, the
          enzyme that can extend telomeres, is silenced in most adult somatic cells but
          remains active in stem cells and cancer cells:
        </p>
        <BulletList
          color={LONGEVITY_COLOR}
          items={[
            "Telomere length correlates with biological age and is a predictor of age-related disease onset",
            "Epithalon is the only well-studied peptide shown to upregulate hTERT expression in somatic cells",
            "Epithalon studies show telomere elongation in human cell culture and lifespan extension in multiple animal models",
            "Epithalon's pineal origin also connects it to melatonin regulation and circadian control of aging",
          ]}
        />
      </ArticleSection>

      <ArticleSection title="Senolysis: FOXO4-DRI and Clearing Zombie Cells" variant="proof">
        <p>
          Senescent cells — sometimes called 'zombie cells' — accumulate in tissues
          with age. They have stopped dividing but resist death, continuing to secrete
          a toxic cocktail of inflammatory cytokines, proteases, and growth factors
          (the SASP) that degrades surrounding tissue:
        </p>
        <BulletList
          color={LONGEVITY_COLOR}
          items={[
            "SASP components include IL-6, IL-8, MMP-3, and PAI-1 — all drivers of chronic inflammation",
            "Senescent cells accumulate in fat, muscle, joints, liver, and brain with age",
            "FOXO4-DRI specifically targets the FOXO4-p53 survival interaction unique to senescent cells",
            "Studies in aged mice show restoration of exercise tolerance, fur density, and kidney function after FOXO4-DRI treatment",
          ]}
        />
        <p>
          This 'senolytic' approach — clearing existing senescent cells — is distinct from
          'senostatic' approaches that suppress SASP without killing senescent cells.
          FOXO4-DRI is the only peptide-based senolytic in current research.
        </p>
      </ArticleSection>

      <ArticleSection title="Mitochondrial Peptides: SS-31, Humanin, and MOTS-C">
        <p>
          A growing class of longevity peptides is derived from or targeted at mitochondria —
          reflecting the central role of mitochondrial dysfunction in biological aging:
        </p>
        <BulletList
          color={LONGEVITY_COLOR}
          items={[
            "SS-31 (Szeto-Schiller 31) — inner membrane cardiolipin stabilizer; restores electron transport chain efficiency; reduces mitochondrial ROS",
            "Humanin — 21 AA mitochondria-encoded peptide; plasma levels decline with age; STAT3-mediated anti-apoptotic signaling across multiple tissues",
            "MOTS-C — 16 AA mitochondria-encoded peptide; AMPK activator; insulin sensitizer; plasma levels track metabolic age; also in metabolic cluster",
          ]}
        />
        <p>
          What makes mitochondrial-derived peptides (MDPs) conceptually unique is that
          they appear to be part of an ancient inter-organelle communication system —
          signals sent from mitochondria to the nucleus and to other organs in response
          to metabolic stress — that declines with age.
        </p>
      </ArticleSection>

      <LongevityPeptideTable />

      <ArticleSection title="Thymic Bioregulators: Reversing Immune Senescence" variant="revive">
        <p>
          The thymus — where T-cells mature — begins involuting at puberty and is largely
          replaced by fat by age 45. This thymic atrophy is a primary driver of the
          age-related decline in adaptive immune function (immunosenescence). The
          thymic bioregulator peptides address this:
        </p>
        <BulletList
          color={LONGEVITY_COLOR}
          items={[
            "Thymalin — polypeptide extract from thymic tissue; studied by Khavinson for restoration of thymic architecture and T-cell competence",
            "Thymulin — zinc-dependent nonapeptide produced exclusively by thymic epithelial cells; levels fall sharply with age; required for T-cell differentiation",
            "Vilon — dipeptide thymic bioregulator; modulates hypothalamic-pituitary-immune axis; studied for neuroendocrine-immune integration",
            "Thymopentin — synthetic thymopoietin fragment (TP-5); stimulates T-helper cell proliferation and IL-2 production",
          ]}
        />
        <p>
          Research in this area connects immunological aging to overall longevity — restored
          immune surveillance allows better clearance of senescent cells, pre-cancerous
          changes, and pathogen threats that accumulate in the aging organism.
        </p>
      </ArticleSection>

      <RelatedStacks />
    </EntryArticleLayout>
  );
}
