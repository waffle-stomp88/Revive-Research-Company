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
import { RESEARCH_STACKS_BY_ID } from "@/data/research-stacks";

const SKIN_COLOR = "#ec4899";

const RELATED_STACK_IDS = ["glow-protocol"];

function RelatedStacks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const stacks = RELATED_STACK_IDS.map((id) => RESEARCH_STACKS_BY_ID[id]).filter(Boolean);

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
    </div>
  );
}

function SkinPathwayDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const categories = [
    {
      label: "Collagen & Matrix Restoration",
      sublabel: "TGF-β signaling, matrikine pathways, fibronectin",
      color: "#ec4899",
      peptides: ["Matrixyl", "Palmitoyl Tripeptide-1", "GHK-Cu"],
    },
    {
      label: "Neuromuscular Modulation",
      sublabel: "SNARE complex inhibition, expression line reduction",
      color: "#db2777",
      peptides: ["Argireline", "Snap-8", "Leuphasyl"],
    },
    {
      label: "Pigmentation & UV Protection",
      sublabel: "MC1R activation, melanogenesis modulation",
      color: "#be185d",
      peptides: ["Melanotan", "GHK-Cu"],
    },
    {
      label: "Multi-Peptide Complexes",
      sublabel: "Synergistic formulations for broad-spectrum skin renewal",
      color: "#9d174d",
      peptides: ["GLOW Peptide Complex", "KLOW Peptide Complex"],
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-skin-pathways">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        Skin Cluster — Mechanism Categories
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12 }}
          >
            <Card
              className="p-4 border h-full"
              style={{
                borderColor: `${cat.color}40`,
                background: `${cat.color}0a`,
              }}
            >
              <p className="font-semibold text-sm mb-0.5" style={{ color: cat.color }}>{cat.label}</p>
              <p className="text-xs text-muted-foreground mb-3">{cat.sublabel}</p>
              <div className="flex flex-wrap gap-1">
                {cat.peptides.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] px-1.5 py-0.5 rounded-full border font-mono"
                    style={{
                      borderColor: `${cat.color}40`,
                      color: cat.color,
                      background: `${cat.color}15`,
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
        Skin cluster overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

function SkinPeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "Matrixyl",
      type: "Palmitoyl pentapeptide-4",
      primary: "Collagen and elastin synthesis, ECM restoration",
      note: "Matrikine signaling — signals breakdown of collagen to trigger synthesis; most-studied cosmetic peptide",
    },
    {
      name: "GHK-Cu",
      type: "Copper tripeptide",
      primary: "Wound healing, collagen synthesis, anti-inflammatory",
      note: "Naturally occurring human plasma peptide; declines sharply with age; TGF-β modulation and elastin production",
    },
    {
      name: "Argireline",
      type: "Acetyl hexapeptide-3",
      primary: "SNARE complex inhibition, neuromuscular relaxation",
      note: "Competes with SNAP-25 at SNARE complex to reduce acetylcholine release at neuromuscular junction; wrinkle reduction research",
    },
    {
      name: "Snap-8",
      type: "Acetyl octapeptide-3",
      primary: "Muscle contraction reduction, expression lines",
      note: "Extended version of Argireline sequence; proposed greater potency per unit at neuromuscular junction modulation",
    },
    {
      name: "Leuphasyl",
      type: "Enkephalin receptor modulator pentapeptide",
      primary: "Synergistic neuromuscular modulation",
      note: "Acts via enkephalin opioid receptors to complement SNARE-targeting peptides; often combined with Argireline",
    },
    {
      name: "Palmitoyl Tripeptide-1",
      type: "Lipopeptide (Pal-GHK)",
      primary: "Fibronectin and collagen stimulation",
      note: "Palmitic acid lipidation improves skin penetration; signals TGF-β pathway for collagen I and III synthesis",
    },
    {
      name: "Melanotan",
      type: "α-MSH analog",
      primary: "MC1R activation, melanin synthesis",
      note: "Superpotent α-MSH analog; stimulates melanocytes for UV-protective melanin production; also studied for body composition",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-skin-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Skin Cluster — Peptide Reference
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
              <td className="py-2.5 pr-4 font-medium font-mono text-xs whitespace-nowrap" style={{ color: SKIN_COLOR }}>
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

export default function SkinPeptidesGuide() {
  const faqs = [
    {
      question: "What is matrikine signaling?",
      answer:
        "Matrikines are peptide fragments released when extracellular matrix (ECM) proteins are degraded by enzymes like matrix metalloproteinases (MMPs). These fragments act as signals to surrounding fibroblasts, triggering synthesis of new collagen and other matrix components. Matrixyl (palmitoyl pentapeptide-4) mimics the sequence of a collagen I degradation fragment, effectively tricking fibroblasts into 'thinking' collagen is being broken down faster than it is, thereby driving new collagen synthesis.",
    },
    {
      question: "How do SNARE-targeting peptides reduce wrinkles?",
      answer:
        "Muscle contractions that create expression lines (forehead, periocular, glabellar) require the SNARE protein complex to fuse acetylcholine vesicles with the presynaptic membrane at neuromuscular junctions. Argireline and Snap-8 are peptides that compete with the endogenous SNARE component SNAP-25 for binding within this complex, partially reducing acetylcholine release. The result is a localized, dose-dependent reduction in muscle contraction amplitude. Unlike botulinum toxin, this mechanism is reversible and competitive rather than covalent.",
    },
    {
      question: "What makes GHK-Cu relevant to skin aging research?",
      answer:
        "GHK-Cu (Glycyl-L-histidyl-L-lysine copper complex) is a naturally occurring human plasma peptide with circulating levels that peak in youth and decline sharply with age (from ~200 ng/mL at 20 to ~80 ng/mL at 60). Its effects in research include: stimulation of collagen and elastin synthesis via TGF-β pathway activation, promotion of angiogenesis via VEGF, anti-inflammatory action via NF-κB inhibition, and direct wound healing effects through fibroblast and keratinocyte activation. Its broad activity profile makes it unusual among single-compound skin peptides.",
    },
    {
      question: "How does Melanotan relate to skin research?",
      answer:
        "Melanotan is a synthetic analog of α-MSH (alpha-melanocyte stimulating hormone) that activates MC1R (melanocortin 1 receptor) on melanocytes. MC1R activation triggers melanogenesis — the production of eumelanin, the dark, UV-protective form of melanin. In skin research contexts, the interest lies in its ability to stimulate photoprotective pigmentation. Melanotan also acts at other melanocortin receptors (MC3R, MC4R) with broader systemic effects that place it in the metabolic and hormonal clusters as well.",
    },
    {
      question: "What is the difference between Argireline and Snap-8?",
      answer:
        "Argireline (Acetyl hexapeptide-3) is a 6 amino acid peptide that mimics the N-terminal sequence of SNAP-25, one of the key SNARE proteins. Snap-8 (Acetyl octapeptide-3) is an 8 amino acid extension of the same sequence, providing a longer SNARE-binding domain that is proposed to have greater affinity for the complex. Both work through the same mechanism but Snap-8 is theorized to produce a more potent neuromuscular modulation effect. They are frequently combined in research formulations.",
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
      description: "Visualise the Skin cluster and its synergy connections",
    },
    {
      label: "Browse Skin Compounds",
      href: "/shop?system=skin",
      icon: ShoppingBag,
      description: "View research-grade skin peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated combinations involving skin peptides",
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
      title="Skin Peptides: Collagen Synthesis, SNARE Modulation, and Dermal Research"
      metaTitle="Skin Peptides: Collagen, SNARE Modulation & Skin Aging Research Guide | Revive Research"
      metaDescription="An in-depth research guide covering skin-cluster peptides — Matrixyl, GHK-Cu, Argireline, Snap-8, Leuphasyl, Melanotan, Palmitoyl Tripeptide-1, and more — explaining collagen synthesis, matrikine signaling, neuromuscular modulation, and dermal aging mechanisms."
      canonicalPath="/guides/skin-peptides"
      badgeText="Skin System"
      badgeColor={SKIN_COLOR}
      publishDate="2026-05-06"
      modifiedDate="2026-05-06"
      introText={
        <>
          <p className="mb-4">
            The skin cluster is one of the most mechanistically focused in peptide research.
            Compounds here fall into four clear categories: those that{" "}
            <strong>stimulate collagen and matrix synthesis</strong>, those that{" "}
            <strong>reduce muscle-driven expression lines</strong> via neuromuscular
            junction modulation, those that affect{" "}
            <strong>melanin production</strong>, and complex{" "}
            <strong>multi-peptide formulations</strong> combining multiple mechanisms.
          </p>
          <p>
            This guide explains the key signaling pathways, distinguishes the SNARE-targeting
            peptide class from collagen-stimulating matrikines, and clarifies GHK-Cu's
            unusual position bridging skin, healing, and longevity research.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <SkinPathwayDiagram />

      <ArticleSection title="Collagen Synthesis Pathways — Building the Dermal Scaffold">
        <p>
          Skin aging is primarily a story of collagen loss. Type I and Type III collagen
          provide the structural scaffold of the dermis. Peak synthesis occurs in early
          adulthood and declines approximately 1% per year thereafter. The key peptide
          targets in this pathway:
        </p>
        <BulletList
          color={SKIN_COLOR}
          items={[
            "TGF-β signaling — fibroblasts are activated by TGF-β to synthesize collagen; multiple skin peptides converge on this receptor",
            "Matrikine feedback loop — collagen fragment peptides signal apparent ECM degradation, triggering compensatory synthesis",
            "Fibronectin production — structural glycoprotein that organizes collagen fibers in the extracellular matrix",
            "Elastin synthesis — co-regulated with collagen by many ECM peptides; responsible for skin elasticity and recoil",
          ]}
        />
        <p>
          Matrixyl (palmitoyl pentapeptide-4) is the most widely studied cosmetic peptide
          globally and works exclusively through the matrikine mechanism — signaling that
          collagen degradation has occurred to drive new synthesis.
        </p>
      </ArticleSection>

      <ArticleSection title="Neuromuscular Modulation: The SNARE Mechanism" variant="proof">
        <p>
          Facial expression lines form where repetitive muscle contractions crease the
          overlying skin. The SNARE protein complex (Soluble NSF Attachment Protein REceptor)
          is the molecular machinery that fuses neurotransmitter vesicles with the
          presynaptic membrane to release acetylcholine at the neuromuscular junction:
        </p>
        <BulletList
          color={SKIN_COLOR}
          items={[
            "VAMP (vesicle-associated membrane protein) — anchored in the vesicle membrane",
            "Syntaxin — anchored in the presynaptic membrane",
            "SNAP-25 — bridges VAMP and syntaxin to 'zip' the complex and trigger vesicle fusion",
          ]}
        />
        <p>
          Argireline and Snap-8 both contain sequences that mimic SNAP-25's binding domain,
          competing for the complex and partially preventing its formation. This reduces —
          but does not eliminate — acetylcholine release, producing a dose-dependent muscle
          relaxation effect significantly milder and fully reversible compared to botulinum
          toxin. Leuphasyl complements this via enkephalin receptor modulation at the same
          junction.
        </p>
      </ArticleSection>

      <ArticleSection title="GHK-Cu: The Wound Healing Overlap">
        <p>
          GHK-Cu (Glycyl-L-histidyl-L-lysine copper complex) occupies an unusual position
          in the skin cluster because its research profile spans skin aging, wound healing,
          and longevity — reflecting its origin as a natural human plasma peptide:
        </p>
        <BulletList
          color={SKIN_COLOR}
          items={[
            "Stimulates collagen and elastin synthesis via TGF-β pathway activation in dermal fibroblasts",
            "Promotes angiogenesis via VEGF upregulation — improving dermal perfusion and wound healing",
            "Anti-inflammatory: inhibits NF-κB and oxidative stress at injury sites",
            "Copper delivery: the copper ion in GHK-Cu activates copper-dependent enzymes (lysyl oxidase) essential for collagen crosslinking and elastin maturation",
          ]}
        />
        <p>
          Notably, GHK-Cu plasma levels are highest in youth (~200 ng/mL at age 20) and
          fall ~60% by age 60 — making GHK-Cu one of the clearest candidates for
          age-associated skin function decline studied at the molecular level.
        </p>
      </ArticleSection>

      <SkinPeptideTable />

      <ArticleSection title="Melanogenesis Research: Melanotan and MC1R" variant="revive">
        <p>
          Melanin is the photoprotective pigment produced by melanocytes in the basal layer
          of the epidermis. Its synthesis is regulated by the melanocortin system:
        </p>
        <BulletList
          color={SKIN_COLOR}
          items={[
            "UV exposure → keratinocyte α-MSH secretion → MC1R activation on melanocytes → melanin synthesis",
            "Eumelanin (brown/black) — photoprotective; produced when MC1R is strongly activated",
            "Pheomelanin (red/yellow) — less photoprotective; produced when MC1R is weakly activated or blocked",
            "Melanotan activates MC1R with ~1000× greater potency than natural α-MSH, shifting melanogenesis strongly toward eumelanin",
          ]}
        />
        <p>
          Research interest in MC1R-targeted compounds also extends beyond pigmentation.
          The melanocortin receptor family (MC1R–MC5R) has broad systemic roles:
          MC3R in energy homeostasis, MC4R in sexual arousal and appetite regulation,
          making Melanotan a compound with effects spanning multiple body system clusters.
        </p>
      </ArticleSection>

      <RelatedStacks />
    </EntryArticleLayout>
  );
}
