import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Telescope, ShoppingBag, Activity, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EntryArticleLayout,
  ArticleSection,
  BulletList,
} from "@/components/entry-article-layout";
import { RelatedStacks } from "@/components/research-stacks/RelatedStacks";
import { BODY_SYSTEM_HUBS_BY_SLUG } from "@/data/body-system-hubs";

const METABOLIC_COLOR = "#D4FF1F";
const METABOLIC_COLOR_DIM = "#b8c80d";

function MetabolicPathwayDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const nodes = [
    {
      label: "Incretin / GLP-1 Axis",
      sublabel: "Insulin secretion, gastric emptying, satiety",
      color: "#D4FF1F",
      peptides: ["Semaglutide", "Tirzepatide", "Retatrutide", "RR-A3", "Mazdutide"],
    },
    {
      label: "AMPK / Mitochondrial Biogenesis",
      sublabel: "Energy sensing, fat oxidation, endurance",
      color: "#a3e635",
      peptides: ["MOTS-C", "AICAR", "SLU-PP-332"],
    },
    {
      label: "Lipolysis & Adipose Targeting",
      sublabel: "Direct fat cell metabolism and destruction",
      color: "#65a30d",
      peptides: ["AOD-9604", "5-Amino-1MQ", "Adipotide"],
    },
    {
      label: "Amylin / Satiety Signaling",
      sublabel: "Appetite regulation, gastric motility",
      color: "#4d7c0f",
      peptides: ["Cagrilintide", "Survodutide", "Somatostatin"],
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-metabolic-pathways">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Metabolic Cluster — Key Pathway Families
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {nodes.map((node, i) => (
          <motion.div
            key={node.label}
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12 }}
          >
            <Card
              className="p-4 border h-full"
              style={{
                borderColor: `${node.color}40`,
                background: `${node.color}0a`,
              }}
            >
              <p className="font-semibold text-sm mb-0.5" style={{ color: node.color }}>
                {node.label}
              </p>
              <p className="text-xs text-muted-foreground mb-3">{node.sublabel}</p>
              <div className="flex flex-wrap gap-1">
                {node.peptides.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] px-1.5 py-0.5 rounded-full border font-mono"
                    style={{
                      borderColor: `${node.color}40`,
                      color: node.color,
                      background: `${node.color}15`,
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
        Metabolic cluster overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

function MetabolicPeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "MOTS-C",
      type: "Mitochondrial-derived peptide",
      primary: "AMPK activation, metabolic regulation",
      note: "Encoded in mitochondrial 12S rRNA; regulates nuclear gene expression via AMPK and PGC-1α",
    },
    {
      name: "AICAR",
      type: "AMP-kinase activator",
      primary: "Fat oxidation, endurance enhancement",
      note: "AMPK agonist; mimics exercise-like metabolic switching; studied as 'exercise mimetic'",
    },
    {
      name: "SLU-PP-332",
      type: "ERRα agonist",
      primary: "Mitochondrial biogenesis, exercise pathway",
      note: "Activates estrogen-related receptor alpha; studied for endurance and metabolic efficiency gains",
    },
    {
      name: "AOD-9604",
      type: "GH fragment (176-191)",
      primary: "Lipolysis, adipocyte metabolism",
      note: "C-terminal fragment of GH; retains fat-burning properties without IGF-1 stimulation",
    },
    {
      name: "5-Amino-1MQ",
      type: "NNMT inhibitor",
      primary: "NAD+ salvage, fat cell differentiation block",
      note: "Inhibits nicotinamide N-methyltransferase; elevates SAM and NAD+; prevents fat cell maturation",
    },
    {
      name: "Retatrutide",
      type: "Triple GLP-1/GIP/Glucagon agonist",
      primary: "Appetite suppression, enhanced lipolysis",
      note: "First-in-class triple agonist; adds glucagon activity to incretin signaling for greater energy expenditure",
    },
    {
      name: "Cagrilintide",
      type: "Long-acting amylin analog",
      primary: "Satiety signaling, gastric emptying delay",
      note: "Amylin analog combining with GLP-1 agonists for synergistic satiety; glucagon suppression",
    },
    {
      name: "Pancragen",
      type: "Pancreatic bioregulator peptide",
      primary: "Beta-cell protection, glucose homeostasis",
      note: "Khavinson-class peptide; studied for pancreatic tissue renewal and insulin regulation support",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-metabolic-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Metabolic Cluster — Peptide Reference
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
              <td className="py-2.5 pr-4 font-medium font-mono text-xs whitespace-nowrap" style={{ color: METABOLIC_COLOR_DIM }}>
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

/* ─── Related Stacks Section ────────────────────────────────────────────── */

const METABOLIC_PEPTIDE_NAMES = ["AOD-9604", "5-Amino-1MQ", "Semaglutide", "Tirzepatide", "MOTS-C"];

export default function MetabolicPeptidesGuide() {
  const faqs = [
    {
      question: "What is AMPK and why does it matter in metabolic research?",
      answer:
        "AMPK (AMP-activated protein kinase) is the cell's master energy sensor. When cellular energy (ATP) is low, AMP levels rise, activating AMPK. This triggers a cascade that increases fat oxidation, glucose uptake, and mitochondrial biogenesis while suppressing energy-consuming processes like fat and protein synthesis. Compounds like AICAR and MOTS-C that activate AMPK effectively 'signal' the cell to behave as if in an energy-deficit state, even without exercise.",
    },
    {
      question: "How do GLP-1 agonists work?",
      answer:
        "GLP-1 (glucagon-like peptide-1) is an incretin hormone released from intestinal L-cells after eating. GLP-1 receptor agonists mimic this signal to stimulate glucose-dependent insulin secretion, suppress glucagon, slow gastric emptying, and activate hypothalamic satiety neurons. The net result is reduced appetite and improved glycemic control. Newer compounds like tirzepatide (dual GLP-1/GIP) and retatrutide (triple agonist) add additional receptor targets for greater metabolic effect.",
    },
    {
      question: "What distinguishes AOD-9604 from growth hormone?",
      answer:
        "AOD-9604 is the C-terminal fragment (residues 176-191) of human growth hormone. It retains GH's lipolytic (fat-burning) properties — activating beta-3 adrenergic receptors on adipocytes and promoting fat oxidation — without stimulating IGF-1 production or promoting cell growth. This makes it a selective metabolic research tool compared to full-length GH.",
    },
    {
      question: "How does 5-Amino-1MQ affect fat metabolism?",
      answer:
        "5-Amino-1MQ inhibits nicotinamide N-methyltransferase (NNMT), an enzyme highly expressed in adipose tissue that consumes methyl groups (from SAM) and converts them to methylnicotinamide. By inhibiting NNMT, 5-Amino-1MQ raises SAM and NAD+ levels in fat cells, blocking preadipocyte differentiation into mature fat cells and reducing overall adiposity in animal models.",
    },
    {
      question: "What is the mitochondrial connection in metabolic peptide research?",
      answer:
        "Many metabolic peptides converge on mitochondrial function. MOTS-C is literally encoded in mitochondrial DNA. AICAR and SLU-PP-332 activate pathways (AMPK, ERRα) that stimulate mitochondrial biogenesis. SS-31 (from the longevity cluster) stabilizes the inner mitochondrial membrane. The thesis is that metabolic dysfunction often begins at the mitochondrion, and peptides that support mitochondrial efficiency can have broad downstream effects on energy, fat metabolism, and longevity.",
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
      description: "Visualise the Metabolic cluster and its synergy connections",
    },
    {
      label: "Browse Metabolic Compounds",
      href: "/shop?system=metabolic",
      icon: ShoppingBag,
      description: "View research-grade metabolic peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated combinations involving metabolic peptides",
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
      title="Metabolic Peptides: AMPK, Incretin Signaling, and Energy Research"
      metaTitle="Metabolic Peptides: AMPK, GLP-1 Signaling & Energy Research Guide | Revive Research"
      metaDescription="An in-depth research guide covering metabolic-cluster peptides — MOTS-C, AICAR, AOD-9604, GLP-1 agonists, 5-Amino-1MQ, SLU-PP-332, and more — and how they interact with AMPK activation, fat oxidation, incretin signaling, and mitochondrial biogenesis."
      canonicalPath="/systems/metabolic"
      badgeText="Metabolic System"
      badgeColor={METABOLIC_COLOR}
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      systemHub={BODY_SYSTEM_HUBS_BY_SLUG["metabolic"]}
      introText={
        <>
          <p className="mb-4">
            The metabolic cluster is one of the most diverse in peptide research, spanning
            mitochondrial-derived peptides, synthetic incretin analogs, direct lipolytic
            agents, and AMPK-activating compounds. What unifies them is their shared focus
            on <strong>energy homeostasis</strong> — how cells sense, generate, store, and
            mobilize energy.
          </p>
          <p>
            This guide explains the major pathway families, distinguishes compound classes
            that operate through entirely different mechanisms, and maps the connections
            between metabolic peptides and adjacent clusters like longevity and growth.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <MetabolicPathwayDiagram />

      <ArticleSection title="The AMPK Pathway — Cellular Energy Sensing">
        <p>
          AMPK (AMP-activated protein kinase) is activated when the AMP:ATP ratio rises —
          signaling energy deficit. Once active, AMPK coordinates a metabolic shift toward
          energy production and away from storage:
        </p>
        <BulletList
          color={METABOLIC_COLOR_DIM}
          items={[
            "Fatty acid oxidation ↑ — fat is mobilized from adipose tissue and oxidized in mitochondria",
            "Glucose uptake ↑ — GLUT4 translocation in muscle without insulin",
            "Mitochondrial biogenesis ↑ — via PGC-1α, increasing the number of energy-producing organelles",
            "mTOR inhibition — suppresses energy-expensive processes like protein synthesis during energy deficit",
          ]}
        />
        <p>
          AICAR (AICA ribonucleoside) is the most direct AMPK-activating compound in the
          metabolic cluster — it is phosphorylated intracellularly to ZMP, which mimics AMP
          and directly binds the AMPK γ-subunit regulatory site.
        </p>
      </ArticleSection>

      <ArticleSection title="MOTS-C: Mitochondrial Peptide with Nuclear Effects" variant="proof">
        <p>
          MOTS-C is unusual among metabolic peptides because it is encoded within
          mitochondrial DNA itself — specifically in the 12S rRNA gene. It is a
          16 amino acid peptide that translocates to the nucleus under metabolic stress:
        </p>
        <BulletList
          color={METABOLIC_COLOR_DIM}
          items={[
            "Activates AMPK and downstream PGC-1α without a traditional receptor binding mechanism",
            "Enhances insulin sensitivity in skeletal muscle and adipose tissue",
            "Regulates the one-carbon metabolic pathway (folate cycle), linking mitochondria to nuclear gene expression",
            "Plasma MOTS-C levels decline with age, positioning it in both metabolic and longevity research",
          ]}
        />
        <p>
          Its mitochondrial origin makes MOTS-C part of a growing field called
          'mitochondrial-derived peptides (MDPs)' — short bioactive sequences encoded in
          mitochondrial DNA that serve as retrograde signals from the organelle to
          the rest of the cell.
        </p>
      </ArticleSection>

      <ArticleSection title="GLP-1 and the Incretin Revolution">
        <p>
          Incretin hormones — GLP-1 and GIP — are released from intestinal cells after
          meals and potentiate insulin secretion in a glucose-dependent manner. This
          glucose-dependency is a key safety feature: incretin-based drugs and peptides
          do not cause insulin release (and therefore hypoglycemia) when blood glucose is
          already low.
        </p>
        <p>
          The incretin cluster has expanded dramatically through compound engineering:
        </p>
        <BulletList
          color={METABOLIC_COLOR_DIM}
          items={[
            "GLP-1 mono-agonists (semaglutide) — insulin secretion, gastric emptying delay, hypothalamic satiety",
            "Dual GLP-1/GIP agonists (tirzepatide) — adds GIP receptor action for greater glucose-lowering and body weight reduction",
            "Triple GLP-1/GIP/Glucagon agonists (retatrutide, RR-A3) — adds glucagon receptor activity to increase energy expenditure via thermogenesis",
            "Amylin/GLP-1 combinations (cagrilintide + semaglutide) — complementary satiety mechanisms via distinct receptors",
          ]}
        />
      </ArticleSection>

      <MetabolicPeptideTable />

      <ArticleSection title="Lipolysis Agents: AOD-9604 and Adipotide" variant="revive">
        <p>
          While incretin peptides reduce fat accumulation partly through appetite suppression,
          a separate group of metabolic peptides act directly on adipose tissue:
        </p>
        <BulletList
          color={METABOLIC_COLOR_DIM}
          items={[
            "AOD-9604 — GH fragment 176-191; activates β3-adrenergic receptors on fat cells; promotes lipolysis without IGF-1 stimulation",
            "Adipotide — CKGGRAKDC peptide; targets prohibitin on white fat blood vessels; induces apoptosis of adipose vasculature; studied in primate models",
            "5-Amino-1MQ — NNMT inhibitor; prevents preadipocyte differentiation and raises intracellular NAD+ in fat tissue",
          ]}
        />
        <p>
          These direct lipolytic agents represent a mechanistically distinct category from
          appetite-based metabolic peptides and are often studied in combination to target
          multiple nodes of fat accumulation simultaneously.
        </p>
      </ArticleSection>

      <RelatedStacks peptideNames={METABOLIC_PEPTIDE_NAMES} />
    </EntryArticleLayout>
  );
}
