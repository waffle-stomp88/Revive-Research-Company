import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { FlaskConical, BookOpen, Telescope, ShoppingBag, Activity, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EntryArticleLayout,
  ArticleSection,
  BulletList,
} from "@/components/entry-article-layout";
import { getStacksByPeptideNames } from "@/data/research-stacks";

const HEALING_COLOR = "#22c55e";

/* ─── Tissue Repair Pathway Diagram ─────────────────────────────────────── */

function TissueRepairDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const phases = [
    {
      label: "Injury Signal",
      sublabel: "Cellular damage → cytokine release → immune activation",
      color: "#f43f5e",
      peptides: ["KPV", "LL-37"],
      arrow: true,
      note: "NF-κB activation, ROS burst, mast cell degranulation",
    },
    {
      label: "Proliferative Phase",
      sublabel: "Angiogenesis · fibroblast recruitment · matrix deposition",
      color: "#f97316",
      peptides: ["BPC-157", "TB-500"],
      arrow: true,
      note: "VEGF upregulation, thymosin beta-4 actin regulation, GH receptor activation",
    },
    {
      label: "Remodelling Phase",
      sublabel: "Collagen cross-linking · ECM maturation · scar resolution",
      color: HEALING_COLOR,
      peptides: ["GHK-Cu", "KLOW Complex"],
      arrow: false,
      note: "TGF-β modulation, MMP regulation, elastin synthesis",
    },
  ];

  const sidePaths = [
    {
      label: "Nitric Oxide / VEGF Axis",
      color: "#22c55e",
      peptides: ["BPC-157"],
      note: "eNOS upregulation → vasodilation → localised blood flow → nutrient delivery to healing tissue",
    },
    {
      label: "Actin Cytoskeleton Remodelling",
      color: "#21d8ff",
      peptides: ["TB-500"],
      note: "Thymosin beta-4 sequesters G-actin, modulating cell motility, angiogenesis and systemic tissue repair",
    },
    {
      label: "Copper–Collagen Signalling",
      color: "#a855f7",
      peptides: ["GHK-Cu"],
      note: "Copper delivery activates TGF-β, collagen prolyl hydroxylase and elastin synthesis in the extracellular matrix",
    },
    {
      label: "Mucosal / Anti-Inflammatory",
      color: "#eab308",
      peptides: ["KPV", "KLOW Complex"],
      note: "α-MSH fragment KPV blocks NF-κB to resolve gut and skin inflammation without immunosuppression",
    },
    {
      label: "Innate Antimicrobial Defense",
      color: "#f43f5e",
      peptides: ["LL-37"],
      note: "Human cathelicidin disrupts pathogen membranes, modulates TLR-4 and drives secondary wound healing signalling",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-tissue-repair">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Tissue Repair Cascade — Where Each Healing Peptide Acts
      </h3>

      {/* Main 3-phase cascade */}
      <div className="flex flex-col items-center gap-0 mb-8">
        {phases.map((phase, i) => (
          <motion.div
            key={phase.label}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15 }}
            className="w-full max-w-lg"
          >
            <Card
              className="p-4 border"
              style={{
                borderColor: `${phase.color}50`,
                background: `${phase.color}0d`,
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: phase.color }}>
                    {phase.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{phase.sublabel}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{phase.note}</p>
                </div>
                <div className="flex flex-wrap gap-1 flex-shrink-0">
                  {phase.peptides.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2 py-0.5 rounded-full border font-mono"
                      style={{
                        borderColor: `${phase.color}50`,
                        color: phase.color,
                        background: `${phase.color}18`,
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
            {phase.arrow && (
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
        Parallel Healing Pathways
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
        Healing cascade overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

/* ─── Healing Peptide Reference Table ───────────────────────────────────── */

function HealingPeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "BPC-157",
      type: "Pentadecapeptide",
      primary: "VEGF upregulation · angiogenesis · cytoprotection",
      note: "Gastric juice-derived stable 15 AA peptide; activates GH receptor independently of GH secretion; extensive gut/tendon repair research",
    },
    {
      name: "TB-500",
      type: "Thymosin Beta-4 fragment",
      primary: "Systemic actin regulation · cell migration · vessel formation",
      note: "4–14 fragment of thymosin beta-4; promotes endothelial and keratinocyte migration for whole-body repair vs BPC-157's local focus",
    },
    {
      name: "GHK-Cu",
      type: "Copper-binding tripeptide",
      primary: "Collagen & elastin synthesis · TGF-β modulation",
      note: "Gly-His-Lys; endogenous plasma copper carrier; activates over 4,000 genes including collagen prolyl hydroxylase and MMP-2/-9",
    },
    {
      name: "KPV",
      type: "α-MSH C-terminal tripeptide",
      primary: "NF-κB inhibition · mucosal barrier repair",
      note: "Lys-Pro-Val; retains α-MSH anti-inflammatory activity without melanocortin receptor dependence; gut and dermal inflammation research",
    },
    {
      name: "KLOW Peptide Complex",
      type: "Multi-peptide blend",
      primary: "Gut-skin axis · anti-inflammatory · collagen support",
      note: "Combines NF-κB inhibitory and collagen synthesis peptides; targets the gut-skin crosstalk via mucosal healing and matrix remodelling",
    },
    {
      name: "LL-37",
      type: "Human cathelicidin peptide",
      primary: "Antimicrobial defense · innate immunity · wound healing",
      note: "C-terminal 37 AA cleavage product of hCAP18; disrupts bacterial membranes, modulates TLR-4, and stimulates keratinocyte migration",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-healing-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Healing Cluster — Peptide Reference
      </h3>
      <table className="w-full text-sm border-collapse min-w-[620px]">
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
              transition={{ delay: i * 0.06 }}
              className="border-b border-border/40 hover-elevate"
            >
              <td className="py-2.5 pr-4 font-medium font-mono text-xs whitespace-nowrap" style={{ color: HEALING_COLOR }}>
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

const HEALING_PEPTIDE_NAMES = ["BPC-157", "TB-500", "GHK-Cu", "KPV", "LL-37", "KLOW Complex"];

function RelatedStacks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const stacks = getStacksByPeptideNames(HEALING_PEPTIDE_NAMES);

  if (stacks.length === 0) return null;

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

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function HealingPeptidesGuide() {
  const faqs = [
    {
      question: "What are the three phases of tissue repair that healing peptides target?",
      answer:
        "Tissue repair proceeds through three overlapping phases: (1) Inflammation — the immediate immune response involving cytokine release, immune cell recruitment, and pathogen clearance; (2) Proliferation — fibroblast and endothelial cell migration, angiogenesis, and new extracellular matrix deposition; and (3) Remodelling — collagen cross-linking, matrix maturation, and scar resolution. Different healing peptides act at distinct phases: BPC-157 and TB-500 are most studied in the proliferative phase, while GHK-Cu targets matrix remodelling and KPV modulates the inflammatory phase.",
    },
    {
      question: "What makes BPC-157 and TB-500 synergistic?",
      answer:
        "BPC-157 drives localised repair: it upregulates VEGF and nitric oxide synthase (eNOS), activates GH receptors in peripheral tissue, and exerts direct cytoprotective effects on gut and musculoskeletal cells. TB-500 (the 4–14 fragment of thymosin beta-4) works systemically by sequestering G-actin, which modulates cell motility and angiogenesis throughout the body. Together they cover both local and systemic repair axes — BPC-157 targeting the injury site, TB-500 coordinating a whole-body regenerative response.",
    },
    {
      question: "How does GHK-Cu promote collagen synthesis?",
      answer:
        "GHK-Cu (Gly-His-Lys copper complex) is an endogenous plasma copper carrier that declines sharply with age. Copper delivered via GHK activates collagen prolyl hydroxylase, the enzyme responsible for hydroxylating proline residues in collagen chains — a prerequisite for triple-helix formation and cross-linking. GHK also upregulates TGF-β1, elastin, and decorin, and modulates matrix metalloproteinases (MMP-2 and MMP-9) to balance degradation of old matrix with deposition of new. Genome-wide studies suggest GHK-Cu modulates expression of over 4,000 human genes.",
    },
    {
      question: "What is KPV and how does it differ from α-MSH?",
      answer:
        "KPV (Lys-Pro-Val) is the C-terminal tripeptide of α-MSH (α-melanocyte-stimulating hormone). Full-length α-MSH exerts anti-inflammatory effects partly through MC1R and MC3R melanocortin receptors, but KPV retains significant NF-κB inhibitory activity through a receptor-independent mechanism. This means KPV can reduce inflammation in tissues that lack high melanocortin receptor expression — including gut epithelium — making it a distinct research tool for mucosal barrier repair, colitis models, and dermal inflammation.",
    },
    {
      question: "What is the role of angiogenesis in tissue repair?",
      answer:
        "Angiogenesis — the growth of new blood vessels from existing ones — is rate-limiting in tissue repair. Healing tissues require a vastly increased supply of oxygen, glucose, and growth factors, none of which can be delivered without new capillary networks. VEGF (vascular endothelial growth factor) is the primary angiogenic driver. BPC-157 upregulates VEGF and eNOS to trigger angiogenesis, while TB-500 promotes endothelial cell migration to form new vessel walls. Without adequate angiogenesis, the proliferative phase stalls and chronic non-healing wounds can result.",
    },
    {
      question: "How does LL-37 contribute to wound healing?",
      answer:
        "LL-37 is a 37-residue C-terminal cleavage product of the human cationic antimicrobial protein hCAP18 — the only human cathelicidin. Beyond direct antimicrobial activity (membrane disruption, biofilm breakdown), LL-37 signals through FPR2 and P2X7 receptors on keratinocytes and fibroblasts to stimulate migration, proliferation, and collagen synthesis. It also modulates TLR-4 signalling to fine-tune the innate immune response at wound sites. This dual role — pathogen clearance plus cell recruitment — positions LL-37 at the intersection of immune defense and tissue repair.",
    },
    {
      question: "Does BPC-157 require a growth hormone axis to work?",
      answer:
        "No. One of BPC-157's most studied properties is its ability to activate peripheral GH receptors independently of the pituitary GH secretory axis. This distinguishes it from GHRH analogs (CJC-1295, sermorelin) and GH secretagogues (ipamorelin, hexarelin), which all ultimately rely on pituitary GH release. BPC-157 appears to act directly on tissue-level GH receptors — particularly in the gut, tendons, and bone — meaning its proliferative effects are not blunted by somatostatin suppression or pituitary insufficiency.",
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
      description: "Visualise the Healing cluster and its synergy connections",
    },
    {
      label: "Browse Healing Compounds",
      href: "/shop?system=healing",
      icon: ShoppingBag,
      description: "View research-grade healing peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated compound combinations built around healing peptides",
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
      title="Healing Peptides: Tissue Repair Pathways, Angiogenesis Signaling, and Growth Factor Cascades"
      metaTitle="Healing Peptides Guide: BPC-157, TB-500, GHK-Cu & Tissue Repair Pathways | Revive Research"
      metaDescription="An in-depth research guide covering the three-phase tissue repair cascade and how healing peptides — BPC-157, TB-500, GHK-Cu, KPV, LL-37, and KLOW Complex — interact with angiogenesis signaling, growth factor activation, and extracellular matrix remodelling."
      canonicalPath="/guides/healing-peptides"
      badgeText="Healing System"
      badgeColor={HEALING_COLOR}
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      introText={
        <>
          <p className="mb-4">
            The Healing cluster is the most widely researched group of peptides in the field —
            anchored by the legendary pairing of{" "}
            <strong>BPC-157 and TB-500</strong> and extended by copper-peptide remodellers,
            anti-inflammatory tripeptides, and innate-immunity activators. Unlike single-pathway
            compounds, healing peptides operate across all three phases of tissue repair:{" "}
            <strong>inflammation resolution</strong>,{" "}
            <strong>proliferative angiogenesis</strong>, and{" "}
            <strong>extracellular matrix remodelling</strong>.
          </p>
          <p>
            This guide maps the tissue repair cascade, explains why BPC-157 and TB-500 are synergistic
            rather than redundant, and clarifies how GHK-Cu, KPV, and LL-37 each occupy a distinct
            position in the repair biology — making them complements, not substitutes.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <TissueRepairDiagram />

      <ArticleSection title="The Three-Phase Repair Cascade">
        <p>
          All tissue injury — whether mechanical, chemical, or ischaemic — triggers a conserved
          three-phase response:
        </p>
        <BulletList
          items={[
            "Inflammation (0–4 days): Haemostasis, immune cell infiltration, cytokine release (IL-1β, TNF-α, IL-6), and ROS burst to clear pathogens and debris. Necessary but damaging if prolonged.",
            "Proliferation (2–21 days): Fibroblasts migrate in, deposit new collagen and glycosaminoglycans, and angiogenesis provides the vascular supply to sustain the growing tissue mass.",
            "Remodelling (3 weeks–2 years): Type III collagen is progressively replaced by cross-linked Type I collagen, matrix metalloproteinases (MMPs) sculpt the ECM, and tensile strength gradually approaches pre-injury levels.",
          ]}
        />
        <p>
          Healing peptides accelerate or modulate specific steps within this cascade.
          Understanding <em>which</em> phase a compound targets — and at which molecular node —
          is the key to interpreting synergy data and designing research protocols.
        </p>
      </ArticleSection>

      <ArticleSection title="BPC-157 — Local Repair via VEGF and Nitric Oxide" variant="proof">
        <p>
          BPC-157 (Body Protection Compound-157) is a stable 15 amino acid pentadecapeptide
          originally derived from a portion of the human gastric juice protein BPC. It is
          arguably the most extensively published healing peptide in animal models, with
          research spanning tendon, bone, gut, muscle, and neural tissue.
        </p>
        <p>
          Its primary repair mechanism runs through two interconnected axes:
        </p>
        <BulletList
          color={HEALING_COLOR}
          items={[
            "VEGF upregulation → angiogenesis → capillary ingrowth to injury site → oxygen and nutrient delivery",
            "eNOS / nitric oxide pathway → vasodilation → localised blood flow amplification",
            "GH receptor activation in peripheral tissue (independent of pituitary GH secretion)",
            "Cytoprotective effects on gut epithelium via modulation of prostaglandins and the GABAergic system",
          ]}
        />
        <p>
          A key feature of BPC-157 in research models is its{" "}
          <strong>site-specificity</strong>: effects are most pronounced at or near the injury
          location, making it complementary to TB-500's more systemic action.
        </p>
      </ArticleSection>

      <ArticleSection title="TB-500 — Systemic Repair via Thymosin Beta-4">
        <p>
          TB-500 is the 4–14 fragment of thymosin beta-4 (Tβ4), a 43-amino-acid actin-binding
          protein ubiquitously expressed in nucleated cells. While full-length Tβ4 sequesters
          G-actin (monomeric actin) to regulate cytoskeletal dynamics, the 4–14 fragment
          retains the core activity relevant to tissue repair.
        </p>
        <p>
          The mechanism is distinct from BPC-157 in three important ways:
        </p>
        <BulletList
          items={[
            "Systemic distribution: TB-500 acts throughout the body, not just at the injection or injury site",
            "Actin-mediated cell motility: by modulating the G-actin pool, it promotes endothelial and keratinocyte migration — essential for vessel formation and wound closure",
            "Upregulation of metalloproteinase MMP-2 for basement membrane remodelling during angiogenesis",
          ]}
        />
        <p>
          In the context of the Wolverine Stack (BPC-157 + TB-500), the compounds cover
          complementary geography: BPC-157 drives intense local repair while TB-500
          coordinates the systemic regenerative response — a division of labour that is
          mechanistically grounded rather than speculative.
        </p>
      </ArticleSection>

      <ArticleSection title="GHK-Cu — Copper-Mediated Matrix Remodelling">
        <p>
          GHK-Cu (glycyl-L-histidyl-L-lysine copper complex) is an endogenous tripeptide that
          circulates in blood plasma as the body's primary copper carrier. Plasma GHK-Cu
          concentrations fall from approximately 200 ng/mL at age 20 to under 80 ng/mL by age 60,
          paralleling the age-related decline in tissue repair capacity.
        </p>
        <BulletList
          color="#a855f7"
          items={[
            "Activates collagen prolyl hydroxylase — the enzyme that hydroxylates proline in nascent collagen chains, enabling triple-helix formation",
            "Upregulates TGF-β1, the master growth factor for fibroblast activation and collagen production",
            "Modulates MMP-2 and MMP-9 — metalloproteinases that clear damaged matrix while preserving healthy ECM",
            "Stimulates elastin synthesis alongside collagen for compliant, functional repair rather than rigid scar",
            "Modulates expression of over 4,000 human genes per genome-wide studies — including antioxidant, anti-inflammatory, and neural regeneration pathways",
          ]}
        />
        <p>
          GHK-Cu is principally studied in the remodelling phase of repair, where its gene
          regulatory properties produce more anatomically correct tissue architecture than
          simpler collagen-deposition pathways alone.
        </p>
      </ArticleSection>

      <ArticleSection title="KPV — Mucosal and Dermal Anti-Inflammatory" variant="revive">
        <p>
          KPV (Lys-Pro-Val) is the three amino acid C-terminal fragment of alpha-melanocyte-stimulating
          hormone (α-MSH). Full-length α-MSH is a 13 AA peptide produced by the pituitary and
          peripheral melanocytes; KPV retains the anti-inflammatory pharmacology of the parent
          molecule but through a primarily receptor-independent mechanism.
        </p>
        <p>
          Its primary research utility lies in the gut and skin:
        </p>
        <BulletList
          color="#eab308"
          items={[
            "Inhibits NF-κB nuclear translocation — reducing transcription of pro-inflammatory cytokines IL-1β, IL-6, and TNF-α",
            "Stabilises gut epithelial barrier function in colitis and inflammatory bowel disease models",
            "Reduces neutrophil infiltration and mast cell degranulation without broad immunosuppression",
            "Oral bioavailability studied in encapsulated form — unusual for peptides — due to its small size and stability",
          ]}
        />
        <p>
          By targeting the inflammatory phase from a different angle than BPC-157's
          cytoprotective mechanisms, KPV serves as a research complement for gut and dermal
          inflammation where NF-κB overactivation is the primary driver of tissue damage.
        </p>
      </ArticleSection>

      <ArticleSection title="LL-37 — Innate Defense Meets Wound Healing">
        <p>
          LL-37 is the sole human cathelicidin peptide — a 37-residue amphipathic helical peptide
          generated by proteolytic cleavage of the precursor protein hCAP18 (human cationic antimicrobial
          protein 18). It is produced by neutrophils, macrophages, mast cells, and epithelial cells
          at wound sites.
        </p>
        <p>
          LL-37 occupies the intersection of the immune and healing clusters:
        </p>
        <BulletList
          items={[
            "Direct antimicrobial: membrane disruption of gram-positive and gram-negative bacteria, fungi, and biofilms",
            "TLR-4 modulation: fine-tunes innate immune signalling to prevent excessive inflammation at wound sites",
            "FPR2 (formyl peptide receptor 2) activation on keratinocytes → cell migration and re-epithelialisation",
            "Stimulates fibroblast proliferation and VEGF production independently of its antimicrobial activity",
          ]}
        />
        <p>
          Research interest in LL-37 extends to chronic wound models where bacterial biofilm
          combined with impaired re-epithelialisation creates a self-sustaining non-healing cycle.
          LL-37's ability to simultaneously clear pathogens and recruit repair cells addresses
          both arms of this problem.
        </p>
      </ArticleSection>

      <HealingPeptideTable />

      <ArticleSection title="Growth Factor Cascades: VEGF, TGF-β, and EGF">
        <p>
          Three growth factor families dominate the molecular biology of tissue repair and
          are the primary targets of healing peptides:
        </p>
        <BulletList
          color={HEALING_COLOR}
          items={[
            "VEGF (Vascular Endothelial Growth Factor): The master angiogenic signal. Binds VEGFR-1 and VEGFR-2 on endothelial cells, driving tip-cell sprouting, lumen formation, and new capillary network assembly. BPC-157 upregulates VEGF expression through the NO/eNOS pathway.",
            "TGF-β (Transforming Growth Factor-beta): The central fibrogenic and immunomodulatory growth factor. TGF-β1 activates fibroblasts, drives collagen synthesis, and modulates immune cell phenotype. GHK-Cu upregulates TGF-β1; excessive TGF-β activity is associated with fibrosis — GHK-Cu's simultaneous MMP modulation helps balance synthesis vs degradation.",
            "EGF (Epidermal Growth Factor): Drives keratinocyte proliferation and migration across wound surfaces. KPV modulates the inflammatory environment that would otherwise impair EGF receptor (EGFR) signalling in chronic wounds.",
          ]}
        />
        <p>
          The interplay between these three cascades is why multi-peptide healing stacks
          are studied rather than single compounds. Each growth factor acts in a different
          cellular compartment — vasculature (VEGF), connective tissue (TGF-β), and
          epithelium (EGF) — and healing peptides that hit different nodes can produce
          additive rather than redundant effects.
        </p>
      </ArticleSection>

      <ArticleSection title="Synergy: Why BPC-157 + TB-500 Is the Most-Studied Healing Stack" variant="proof">
        <p>
          The BPC-157 / TB-500 combination — often called the Wolverine Stack — is the most
          cited healing peptide pairing in research literature. The mechanistic basis for
          synergy rests on three non-overlapping actions:
        </p>
        <BulletList
          items={[
            "Geography: BPC-157 acts at the injury site; TB-500 acts systemically — they don't compete for the same cellular territory",
            "Angiogenesis angle: BPC-157 drives VEGF expression (transcriptional); TB-500 drives endothelial cell migration (cytoskeletal) — two different rate-limiting steps in vessel formation",
            "Temporal coverage: BPC-157's proliferative effects are rapid and local; TB-500's systemic cell mobilisation provides a sustained regenerative reservoir",
          ]}
        />
        <p>
          Adding a GH secretagogue (ipamorelin, CJC-1295) to this base creates the
          Total Regen Stack — amplifying the IGF-1 component of the repair response to drive
          satellite cell activation and protein synthesis alongside the vascular and matrix
          repair pathways.
        </p>
      </ArticleSection>

      <RelatedStacks />
    </EntryArticleLayout>
  );
}
