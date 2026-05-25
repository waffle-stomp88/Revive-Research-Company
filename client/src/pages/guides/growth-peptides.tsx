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
import { BODY_SYSTEM_HUBS_BY_SLUG } from "@/data/body-system-hubs";
import { RelatedStacks } from "@/components/research-stacks/RelatedStacks";

const GROWTH_COLOR = "#f59e0b";

const GROWTH_PEPTIDE_NAMES = ["Ipamorelin", "CJC-1295", "Sermorelin", "MK-677", "IGF-1 LR3", "IGF-DES", "MGF", "Follistatin-344", "Hexarelin", "GHRP-2", "GHRP-6"];

function GHAxisDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const cascade = [
    {
      label: "Hypothalamus",
      sublabel: "GHRH release / Somatostatin braking",
      color: "#f59e0b",
      peptides: ["Sermorelin", "CJC-1295", "Mod GRF 1-29", "Tesamorelin"],
      arrow: true,
    },
    {
      label: "Pituitary Ghrelin Receptor (GHS-R1a)",
      sublabel: "Direct GH pulse amplification",
      color: "#d97706",
      peptides: ["Ipamorelin", "GHRP-2", "GHRP-6", "Hexarelin", "MK-677"],
      arrow: true,
    },
    {
      label: "Anterior Pituitary → GH Release",
      sublabel: "Somatotroph activation and GH secretion",
      color: "#b45309",
      peptides: ["All GHRH + GHRP combos"],
      arrow: true,
    },
    {
      label: "Liver → IGF-1 Production",
      sublabel: "GH-stimulated hepatic IGF-1 synthesis",
      color: "#92400e",
      peptides: ["IGF-1 LR3", "IGF-DES", "MGF", "PEG-MGF"],
      arrow: false,
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose" data-testid="graphic-growth-axis">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
        GH/IGF-1 Axis — Where Each Compound Acts
      </h3>
      <div className="flex flex-col items-center gap-0">
        {cascade.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.14 }}
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
                  <p className="font-semibold text-sm" style={{ color: step.color }}>{step.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.sublabel}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {step.peptides.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] px-1.5 py-0.5 rounded-full border font-mono"
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
                transition={{ delay: i * 0.14 + 0.1, duration: 0.22 }}
                className="flex justify-center my-1"
                style={{ transformOrigin: "top" }}
              >
                <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                  <line x1="12" y1="0" x2="12" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polyline points="5,17 12,26 19,17" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-4 text-center font-mono">
        GH/IGF-1 axis overview · For research education only · Not medical advice
      </p>
    </div>
  );
}

function GrowthPeptideTable() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    {
      name: "Sermorelin",
      type: "GHRH analog (1-29 fragment)",
      primary: "Pituitary GH stimulation",
      note: "Shortest GHRH fragment retaining full pituitary activity; physiologic GH pulse pattern",
    },
    {
      name: "CJC-1295",
      type: "Modified GHRH analog",
      primary: "Extended GH release",
      note: "DAC variant binds albumin for multi-day half-life; non-DAC (Mod GRF 1-29) acts acutely",
    },
    {
      name: "Ipamorelin",
      type: "Selective GHRP pentapeptide",
      primary: "Pituitary GH release without cortisol spike",
      note: "Most selective GHRP; no cortisol or prolactin elevation at research doses; clean GH pulse",
    },
    {
      name: "MK-677",
      type: "Oral ghrelin receptor agonist",
      primary: "Sustained GH/IGF-1 elevation",
      note: "Non-peptide secretagogue; only orally active GH secretagogue; 24h IGF-1 elevation",
    },
    {
      name: "IGF-1 LR3",
      type: "Long-acting IGF-1 analog",
      primary: "mTOR activation, muscle protein synthesis",
      note: "Extended half-life (20-30h) vs native IGF-1 (minutes); systemic IGF-1 receptor activation",
    },
    {
      name: "IGF-DES",
      type: "Truncated IGF-1 (des 1-3)",
      primary: "Enhanced local receptor binding",
      note: "Does not bind IGFBPs — higher free fraction at injection site; studied for localized hypertrophy",
    },
    {
      name: "MGF",
      type: "IGF-1 splice variant (Mechano Growth Factor)",
      primary: "Satellite cell activation after exercise",
      note: "Exercise-induced splice variant; activates muscle stem cells independently of systemic IGF-1",
    },
    {
      name: "Follistatin-344",
      type: "Activin-binding glycoprotein",
      primary: "Myostatin inhibition",
      note: "Sequesters myostatin and activin; removes the 'braking' signal on muscle growth signaling",
    },
    {
      name: "Hexarelin",
      type: "Hexapeptide GHRP",
      primary: "Strongest GH release in GHRP class",
      note: "Also studied for direct cardioprotective effects independent of GH axis; CD36 ligand",
    },
  ];

  return (
    <div ref={ref} className="my-8 not-prose overflow-x-auto" data-testid="graphic-growth-table">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Growth Cluster — Peptide Reference
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
              <td className="py-2.5 pr-4 font-medium font-mono text-xs whitespace-nowrap" style={{ color: GROWTH_COLOR }}>
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

export default function GrowthPeptidesGuide() {
  const faqs = [
    {
      question: "What is the difference between GHRH analogs and GHRPs?",
      answer:
        "GHRH analogs (sermorelin, CJC-1295, tesamorelin) act on the GHRH receptor on pituitary somatotrophs, mimicking the hypothalamic signal that triggers GH synthesis and release. GHRPs (ipamorelin, GHRP-2, GHRP-6, hexarelin, MK-677) act on the ghrelin receptor (GHS-R1a), which provides a separate, amplifying signal for GH release. When both are active simultaneously, GH output is synergistically greater than either alone — a well-documented phenomenon in GH secretagogue research.",
    },
    {
      question: "Why is ipamorelin considered the most selective GHRP?",
      answer:
        "Most GHRPs trigger some elevation of cortisol and prolactin alongside GH, which can complicate research findings and has physiologic trade-offs in animal models. Ipamorelin is unique in stimulating GH release with minimal or no effect on cortisol or prolactin at typical research concentrations. This selectivity makes it the preferred GHRP when researchers want to isolate GH-specific effects.",
    },
    {
      question: "How does IGF-1 LR3 differ from IGF-DES?",
      answer:
        "Both are IGF-1 variants designed to improve on native IGF-1's short half-life (minutes in plasma). IGF-1 LR3 has an amino acid substitution at the N-terminus and an arginine-rich extension that dramatically reduces binding to IGF-binding proteins (IGFBPs), extending its half-life to approximately 20-30 hours while providing systemic IGF-1 receptor activation. IGF-DES (des 1-3 IGF-1) removes only the first three N-terminal amino acids, which critically reduces IGFBP affinity at the injection site — making it behave more locally. Researchers choose between them based on whether they want systemic vs. localized IGF-1 receptor engagement.",
    },
    {
      question: "What is MGF and how does it differ from regular IGF-1?",
      answer:
        "MGF (Mechano Growth Factor) is a splice variant of the IGF-1 gene produced in skeletal muscle in response to mechanical strain (exercise). Its unique C-terminal peptide sequence allows it to activate muscle satellite (stem) cells — a function largely independent of circulating IGF-1. MGF is typically present only transiently after exercise, which is why researchers study it as an amplifier of the acute exercise-induced muscle repair response.",
    },
    {
      question: "What is myostatin and how does follistatin inhibit it?",
      answer:
        "Myostatin (GDF-8) is a TGF-β superfamily protein secreted by muscle fibers that acts as a potent brake on muscle growth. Animals with myostatin knockouts or loss-of-function mutations develop dramatically increased muscle mass. Follistatin-344 is an extracellular glycoprotein that binds myostatin (and the related activin) with high affinity, sequestering it and preventing receptor binding. This effectively removes the growth-limiting signal, allowing satellite cell proliferation and muscle hypertrophy to proceed unchecked.",
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
      href: "/shop?system=growth",
      icon: ShoppingBag,
      description: "View research-grade growth peptides in our catalogue",
    },
    {
      label: "Research Stacks",
      href: "/research-stacks",
      icon: Activity,
      description: "Explore curated combinations involving growth peptides",
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
      title="Growth Peptides: GH Secretagogues, IGF-1 Variants, and Muscle Research"
      metaTitle="Growth Peptides: GH Secretagogues, IGF-1 & Muscle Growth Research Guide | Revive Research"
      metaDescription="An in-depth research guide covering growth-cluster peptides — GHRH analogs, GHRPs, IGF-1 LR3, IGF-DES, MGF, follistatin, myostatin inhibitors, and more — explaining the GH/IGF-1 axis and how each compound fits into growth factor signaling research."
      canonicalPath="/systems/growth"
      badgeText="Growth System"
      badgeColor={GROWTH_COLOR}
      publishDate="2025-11-03"
      modifiedDate="2025-11-03"
      systemHub={BODY_SYSTEM_HUBS_BY_SLUG["growth"]}
      introText={
        <>
          <p className="mb-4">
            The growth cluster is organized around one of the most studied axes in endocrinology:
            the <strong>GH/IGF-1 axis</strong>. Peptides in this cluster either stimulate growth
            hormone secretion from the pituitary (GHRH analogs, GHRPs), act downstream as IGF-1
            variants (IGF-1 LR3, IGF-DES, MGF), or remove growth inhibitors from the pathway
            (myostatin inhibitors like follistatin).
          </p>
          <p>
            This guide maps where each compound class intervenes in the GH/IGF-1 signaling
            cascade, explains the critical mechanistic differences within each class, and
            clarifies the synergy between GHRH and GHRP compounds.
          </p>
        </>
      }
      faqs={faqs}
      ctaLinks={ctaLinks}
    >
      <GHAxisDiagram />

      <ArticleSection title="GHRH Analogs: Pituitary Stimulation via the Hypothalamic Signal">
        <p>
          Growth hormone-releasing hormone (GHRH) is produced in the hypothalamus and acts
          on somatotroph cells in the anterior pituitary to stimulate GH synthesis and
          pulsatile release. The GHRH analogs in this cluster all target this receptor,
          but differ in potency and half-life:
        </p>
        <BulletList
          color={GROWTH_COLOR}
          items={[
            "Sermorelin — identical to first 29 amino acids of native GHRH; short half-life (~10 min); closely mimics physiologic pulsatile GH release",
            "Mod GRF 1-29 (CJC-1295 without DAC) — modified sermorelin with 4 amino acid substitutions for protease resistance; still short-acting",
            "CJC-1295 with DAC — Drug Affinity Complex version binds albumin; half-life extends to ~7 days; sustained GH/IGF-1 elevation",
            "Tesamorelin — GHRH(1-40) analog approved for HIV-associated lipodystrophy; strong visceral fat reduction with IGF-1 elevation",
          ]}
        />
      </ArticleSection>

      <ArticleSection title="GHRPs: Amplifying GH Release via the Ghrelin Receptor" variant="proof">
        <p>
          Growth hormone-releasing peptides (GHRPs) work through a completely different
          receptor — the ghrelin receptor (GHS-R1a) — providing a second, independent
          stimulatory signal to pituitary somatotrophs. When a GHRH analog and a GHRP are
          combined, GH output is synergistically amplified because both pathways converge
          simultaneously on the same somatotroph.
        </p>
        <BulletList
          color={GROWTH_COLOR}
          items={[
            "GHRP-2 — strong GH releaser; some cortisol and prolactin elevation; short half-life",
            "GHRP-6 — potent GH release; strongest appetite stimulation in class (hunger side-pathway via ghrelin)",
            "Ipamorelin — most selective GHRP; GH release without cortisol/prolactin elevation; preferred for isolated GH research",
            "Hexarelin — strongest GH release in the GHRP class; also binds CD36 for direct cardiac effects independent of GH",
            "MK-677 (Ibutamoren) — non-peptide oral GHS-R1a agonist; only orally bioavailable GH secretagogue; 24h elevated IGF-1",
          ]}
        />
      </ArticleSection>

      <ArticleSection title="IGF-1 Variants: Downstream of the GH Pulse">
        <p>
          GH acts on the liver to produce IGF-1, the primary downstream mediator of GH's
          anabolic effects. Rather than stimulating the GH axis, IGF-1 variants directly
          activate the IGF-1 receptor (IGF-1R), bypassing pituitary regulation entirely:
        </p>
        <BulletList
          color={GROWTH_COLOR}
          items={[
            "mTOR pathway activation → protein synthesis, satellite cell proliferation, cell growth",
            "PI3K/Akt signaling → cell survival, glucose uptake, glycogen synthesis",
            "MAP kinase pathway → cell proliferation and differentiation",
          ]}
        />
        <p>
          Each IGF-1 variant is engineered to address native IGF-1's primary limitation:
          its extremely short plasma half-life (minutes) due to rapid sequestration by
          IGF-binding proteins (IGFBPs).
        </p>
      </ArticleSection>

      <GrowthPeptideTable />

      <ArticleSection title="Myostatin Inhibition: Removing the Growth Brake" variant="revive">
        <p>
          Myostatin is a naturally secreted protein that limits muscle growth — a biological
          brake evolved to prevent excessive energy expenditure. Two compounds in the growth
          cluster target this pathway:
        </p>
        <BulletList
          color={GROWTH_COLOR}
          items={[
            "Follistatin-344 — extracellular binding protein that sequesters myostatin and activin A/B; prevents them reaching receptors",
            "ACE-031 — fusion protein (ActRIIB-Fc) acting as a decoy receptor for the entire TGF-β superfamily including myostatin",
          ]}
        />
        <p>
          Unlike direct GH/IGF-1 axis stimulation, myostatin inhibitors work by derepression —
          removing an inhibitory signal rather than adding a stimulatory one. Research interest
          is high in muscle-wasting disease models (sarcopenia, cachexia, muscular dystrophy)
          where excessive myostatin activity is part of the pathology.
        </p>
      </ArticleSection>

      <RelatedStacks peptideNames={GROWTH_PEPTIDE_NAMES} />
    </EntryArticleLayout>
  );
}
