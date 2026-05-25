import { Heart, Zap, Target, Brain, Sparkles, Crown, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BodySystemHub {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: string;
  quickBreakdown: string;
  deepDive: string;
  recommendedStackIds: string[];
  relatedLabGuideSlugs: Array<{ slug: string; label: string }>;
}

export const BODY_SYSTEM_HUBS: BodySystemHub[] = [
  {
    slug: "healing",
    name: "Healing & Tissue Repair",
    tagline: "Regeneration and recovery at the cellular level",
    description:
      "The Healing system encompasses peptides that accelerate tissue repair, wound healing, and injury recovery. These compounds act through growth factor activation, angiogenesis, and cytoprotective mechanisms to restore damaged tissue faster than the body can achieve on its own.",
    icon: Heart,
    color: "#22c55e",
    quickBreakdown:
      "Healing peptides drive tissue repair through VEGF upregulation, nitric oxide signaling, and actin cytoskeletal remodeling. Key compounds like BPC-157 and TB-500 cover both localized repair and systemic regeneration pathways.",
    deepDive: `Tissue healing is a multi-phase biological process: initial inflammatory signaling, proliferative repair, and final remodeling. Healing peptides intervene at different points in this cascade, creating opportunities for both targeted and synergistic research models.\n\nBPC-157 is one of the most extensively researched healing peptides, acting on growth hormone receptors and the nitric oxide/VEGF axis to promote angiogenesis and cytoprotection in gastrointestinal, musculoskeletal, and connective tissue models. TB-500 complements this through Thymosin Beta-4 actin sequestration, which drives systemic cellular migration and blood vessel formation.\n\nCopper peptide GHK-Cu adds a third dimension, activating collagen and elastin synthesis during the remodeling phase. Anti-inflammatory compounds like KPV and LL-37 provide mucosal and innate immune defense, making the healing system one of the most diverse and well-researched areas in peptide science.\n\nFor researchers, the healing system offers robust study frameworks for synergistic compound interaction, tissue perfusion modeling, and extracellular matrix remodeling — areas that span sports science, wound care, and regenerative medicine applications.`,
    recommendedStackIds: ["recovery-tissue-stack", "glow-protocol"],
    relatedLabGuideSlugs: [
      { slug: "healing-peptides", label: "Healing Peptides: Comprehensive Research Guide" },
    ],
  },
  {
    slug: "metabolic",
    name: "Metabolic & Energy",
    tagline: "Fat metabolism, energy production, and mitochondrial optimization",
    description:
      "The Metabolic system covers peptides that modulate energy production, fat metabolism, and mitochondrial function. These compounds address the biochemical machinery behind adipose tissue regulation, NAD+ pathways, and insulin sensitivity — making them central to obesity, diabetes, and longevity research.",
    icon: Zap,
    color: "#D4FF1F",
    quickBreakdown:
      "Metabolic peptides act through distinct pathways including GH fragment lipolysis, NNMT enzyme inhibition, AMPK activation, and incretin receptor agonism. Each mechanism offers a unique window into metabolic disease research.",
    deepDive: `Metabolic dysfunction is one of the leading areas of biomedical research, and peptide science offers a uniquely precise toolkit for dissecting its mechanisms. Unlike broad pharmacological interventions, metabolic peptides tend to act on specific receptors or enzymes, enabling cleaner experimental models.\n\nAOD-9604 isolates the fat-metabolizing domain of growth hormone without triggering IGF-1-dependent growth, making it ideal for studying GH receptor pharmacology in adipose tissue. 5-Amino-1MQ inhibits NNMT, the enzyme responsible for consuming SAM methyl groups in fat cells, shifting metabolism toward adipose browning and reduced lipid storage.\n\nMOTS-C represents a mitochondrial-derived signaling peptide, activating AMPK and PGC-1α pathways to promote mitochondrial biogenesis and energy efficiency. RR-A3 provides a triple-receptor incretin model targeting GLP-1, GIP, and glucagon receptors simultaneously — one of the most advanced metabolic peptide research frameworks available.\n\nTaken together, the metabolic system spans fat oxidation, energy metabolism, insulin sensitivity, and mitochondrial biology — a broad and clinically relevant research landscape.`,
    recommendedStackIds: ["fat-burner"],
    relatedLabGuideSlugs: [
      { slug: "metabolic-peptides", label: "Metabolic Peptides: Fat & Energy Research Guide" },
    ],
  },
  {
    slug: "growth",
    name: "Growth & Muscle",
    tagline: "Growth hormone pathways, muscle development, and cellular growth",
    description:
      "The Growth system encompasses peptides that stimulate growth hormone secretion, activate IGF-1 signaling, and support muscle protein synthesis. These compounds are fundamental to GH axis pharmacology research and musculoskeletal development studies.",
    icon: Target,
    color: "#f59e0b",
    quickBreakdown:
      "Growth peptides span GHRH analogs, GHSR agonists, and IGF-1 receptor modulators. Dual-receptor pairing studies — like combining Ipamorelin and CJC-1295 — are among the most productive research frameworks in this system.",
    deepDive: `The growth hormone axis represents one of the most studied endocrine systems in peptide research. GH secretion is governed by two opposing forces: GHRH (stimulatory) and somatostatin (inhibitory). Growth peptides intervene at multiple points in this axis, providing researchers with finely tuned tools for GH pulse amplitude and frequency studies.\n\nGHRH analogs like CJC-1295 and Sermorelin activate the pituitary GHRH receptor (GHRHR) via Gs/cAMP signaling, increasing both GH gene transcription and somatotroph sensitivity. GHSR agonists like Ipamorelin act through Gq/PKC intracellular cascades, triggering GH vesicle exocytosis with minimal cortisol or prolactin co-secretion. The convergence of these two pathways within the same somatotroph cell creates a multiplicative — not merely additive — increase in GH output.\n\nDownstream of GH, IGF-1 LR3 provides extended-half-life IGF-1 receptor signaling for studying muscle protein synthesis, satellite cell activation, and mTOR pathway kinetics. For researchers studying musculoskeletal development, the growth system offers an unmatched range of mechanisms across both GH secretion and post-receptor signaling.`,
    recommendedStackIds: ["gh-amplifier"],
    relatedLabGuideSlugs: [
      { slug: "growth-peptides", label: "Growth Peptides Overview" },
      { slug: "growth-hormone-peptides", label: "GH Secretagogue Deep Dive" },
    ],
  },
  {
    slug: "cognitive",
    name: "Cognitive & Neuroprotection",
    tagline: "Brain-derived growth factors, neuroprotection, and cognitive enhancement",
    description:
      "The Cognitive system covers peptides that promote neuroplasticity, modulate neurotransmitter systems, and provide neuroprotective effects. These compounds are studied in the context of BDNF expression, GABAergic modulation, and cognitive function recovery.",
    icon: Brain,
    color: "#21d8ff",
    quickBreakdown:
      "Cognitive peptides act through neurotrophic factor upregulation (BDNF, NGF), anxiolytic mechanisms, dopamine/serotonin modulation, and neuroprotective anti-inflammatory pathways. The Semax + Selank pairing is the gold-standard nootropic research model.",
    deepDive: `Cognitive peptide research sits at the intersection of neuroscience, immunology, and endocrinology. Unlike traditional CNS pharmacology, which often targets a single receptor class, cognitive peptides tend to engage complex signaling networks — neurotrophic, immunomodulatory, and neuroendocrine — simultaneously.\n\nSemax (ACTH 4-10 analog) is one of the most extensively studied cognitive peptides, with research demonstrating consistent upregulation of BDNF and NGF — the two most critical growth factors for neuronal survival and synaptic plasticity. Selank (tuftsin analog) provides a complementary anxiolytic mechanism through GABAergic modulation and IL-6 reduction, creating focused calm without sedation.\n\nCerebrolysin offers a complex peptide fraction model, providing multiple neurotrophic signals simultaneously for research into cognitive restoration after injury or age-related decline. Noopept and other short-chain analogs provide cleaner, single-target models for studying specific receptor interactions.\n\nFor researchers, the cognitive system offers study frameworks spanning neuroplasticity, stress response, memory encoding, and neuroprotection — increasingly relevant in aging, traumatic brain injury, and neurodegenerative disease models.`,
    recommendedStackIds: ["cognitive-edge-stack"],
    relatedLabGuideSlugs: [
      { slug: "cognitive-peptides", label: "Cognitive Peptides: Neuroprotection Research Guide" },
    ],
  },
  {
    slug: "skin",
    name: "Skin & Regeneration",
    tagline: "Collagen synthesis, dermal repair, and tissue rejuvenation",
    description:
      "The Skin system encompasses peptides that stimulate collagen production, promote elastin synthesis, and drive dermal regeneration. These compounds are studied in the context of wound healing, age-related skin changes, and photoprotection mechanisms.",
    icon: Sparkles,
    color: "#ec4899",
    quickBreakdown:
      "Skin peptides target collagen gene promoters, matrix metalloproteinase regulation, copper signaling, and vascular remodeling in dermal tissue. GHK-Cu is the most extensively characterized, with over 4,000 activated human genes documented in studies.",
    deepDive: `Dermal biology is one of the most amenable areas for peptide research because the skin's accessibility allows for both topical and systemic compound delivery, enabling a wide range of experimental approaches. The skin system encompasses overlapping pathways from healing, longevity, and cosmetic biology.\n\nGHK-Cu (glycyl-L-histidyl-L-lysine copper tripeptide) is the foundational skin peptide, with transcriptomic studies documenting activation of over 4,000 human genes related to collagen synthesis, antioxidant defense, DNA repair, and anti-inflammatory signaling. Its mechanisms span SP1 transcription factor activation at collagen gene promoters, elastin production, and matrix metalloproteinase induction for ECM remodeling.\n\nBPC-157 extends into skin biology through VEGF-mediated angiogenesis, improving vascular supply to healing dermal tissue. TB-500 facilitates cellular migration of progenitor cells via actin cytoskeletal modulation. SNAP-8 provides a different model — inhibiting SNARE complex formation to reduce muscular micro-contractions relevant to expression line formation.\n\nSkin peptide research is particularly valuable for understanding the intersection of aging biology, wound repair, and regenerative medicine, making this system one of the most commercially and clinically active areas in the field.`,
    recommendedStackIds: ["glow-protocol", "longevity-protocol"],
    relatedLabGuideSlugs: [
      { slug: "skin-peptides", label: "Skin Peptides: Collagen & Regeneration Research Guide" },
    ],
  },
  {
    slug: "longevity",
    name: "Longevity & Anti-Aging",
    tagline: "Telomere biology, cellular renewal, and anti-aging mechanisms",
    description:
      "The Longevity system covers peptides that address fundamental hallmarks of aging: telomere attrition, mitochondrial dysfunction, oxidative stress, and cellular senescence. These compounds are studied for their potential to extend healthy cellular lifespan and reverse age-related decline.",
    icon: Crown,
    color: "#a855f7",
    quickBreakdown:
      "Longevity peptides engage telomerase activation, NAD+ salvage pathways, sirtuin modulation, antioxidant gene induction, and thymic restoration. Epithalon is the most studied telomere-targeting peptide; GHK-Cu leads in antioxidant gene activation.",
    deepDive: `Longevity research represents one of the most rapidly expanding frontiers in biomedical science, and peptides offer some of the most mechanistically specific tools for studying the hallmarks of aging. Unlike broad antioxidant or caloric restriction models, longevity peptides typically target discrete molecular pathways.\n\nEpithalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide derived from pineal gland extract that has been studied extensively for its ability to activate hTERT (telomerase reverse transcriptase), extending telomere length in human somatic cells. It also modulates melatonin and cortisol rhythms, connecting telomere biology with circadian stress response systems.\n\nGHK-Cu contributes to longevity research through its transcriptomic reach — activating antioxidant enzymes (SOD, catalase), upregulating DNA repair genes (ERCC1, XPA), and reducing oxidative damage markers. Thymalin and Thymosin Alpha-1 address immunosenescence by restoring thymic peptide signaling and T-cell maturation, reversing age-related immune decline.\n\nNAD+ precursors and MOTS-C extend the longevity toolkit into mitochondrial biology, addressing the bioenergetic decline that underlies much of age-related cellular dysfunction. Together, these compounds allow researchers to study the hallmarks of aging as an integrated, interconnected system rather than isolated phenomena.`,
    recommendedStackIds: ["longevity-protocol"],
    relatedLabGuideSlugs: [
      { slug: "longevity-peptides", label: "Longevity Peptides: Anti-Aging Research Guide" },
    ],
  },
  {
    slug: "hormonal",
    name: "Hormonal & Endocrine",
    tagline: "Reproductive axis, endocrine signaling, and sexual health peptides",
    description:
      "The Hormonal system encompasses peptides that modulate the reproductive axis, endocrine signaling networks, and sexual health pathways. These compounds are studied in the context of testosterone production, libido regulation, female fertility biology, and hormone axis restoration.",
    icon: Flame,
    color: "#f43f5e",
    quickBreakdown:
      "Hormonal peptides engage LH/FSH signaling, melanocortin receptor activation, hypothalamic-pituitary-gonadal axis modulation, and direct androgenic support pathways. PT-141 and Kisspeptin are among the most characterized compounds in this system.",
    deepDive: `The hormonal system encompasses some of the most regulated and sensitive signaling networks in human biology. Peptide research in this domain focuses on the hypothalamic-pituitary-gonadal (HPG) axis, which governs reproductive hormone production and sexual function from gonadotropin-releasing hormone (GnRH) at the hypothalamus through to LH/FSH at the pituitary and ultimately sex steroid production in the gonads.\n\nPT-141 (Bremelanotide) is one of the most studied hormonal peptides, acting on melanocortin receptors (MC3R and MC4R) in the hypothalamus to drive central sexual arousal through dopaminergic and oxytocinergic pathways — uniquely, it does not act on vascular smooth muscle, distinguishing its mechanism from PDE5 inhibitors.\n\nKisspeptin and GnRH analogs allow researchers to study upstream HPG axis signaling, while compounds like Gonadorelin provide direct LH/FSH secretagogue models. These approaches are particularly relevant in hypogonadism research, fertility investigation, and the study of hypothalamic peptide signaling.\n\nFor researchers, the hormonal system spans reproductive endocrinology, neuroendocrinology, and sexual health pharmacology — a multidisciplinary field where peptide specificity offers significant advantages over traditional hormone replacement or receptor-targeting approaches.`,
    recommendedStackIds: [],
    relatedLabGuideSlugs: [
      { slug: "hormonal-peptides", label: "Hormonal Peptides: Endocrine Research Guide" },
    ],
  },
];

export const BODY_SYSTEM_HUBS_BY_SLUG: Record<string, BodySystemHub> = Object.fromEntries(
  BODY_SYSTEM_HUBS.map((h) => [h.slug, h])
);
