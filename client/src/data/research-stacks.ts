export interface SynergyCopy {
  beginner: string;
  expert: string;
}

export interface EducationLink {
  peptideName: string;
  articleUrl: string;
  articleTitle: string;
}

export interface StackPeptide {
  name: string;
  description: string;
}

export type StackIconName = "Heart" | "Zap" | "Sparkles" | "Brain" | "Leaf" | "Crown" | "FlaskConical" | "Dumbbell";

export interface ResearchStackData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  longDescription: string;
  peptides: StackPeptide[];
  keyBenefits: string[];
  researchApplications: string[];
  storageGuide: string;
  educationLinks: EducationLink[];
  iconName: StackIconName;
  color: string;
  badge?: string;
  badgeColor?: string;
  synergy: SynergyCopy;
  intentionalOverlap?: boolean;
}

export const RESEARCH_STACKS_DATA: ResearchStackData[] = [
  {
    id: "recovery-tissue-stack",
    name: "Recovery + Tissue Mechanisms Stack",
    subtitle: "Dual Pathway Tissue Stack",
    description: "This stack combines two of the most extensively researched compounds for tissue mechanism pathways. Ideal for researchers studying synergistic repair signaling and cellular regeneration models.",
    longDescription: "The most well-known peptide pairing in research. BPC-157 drives local tissue repair via VEGF upregulation, growth hormone receptor activation, and cytoprotective mechanisms, while TB-500 provides systemic healing through thymosin beta-4 actin regulation and blood vessel formation. Together they cover both localized and whole-body regeneration pathways \u2014 which is why researchers call this the Wolverine Stack.",
    peptides: [
      { name: "BPC-157", description: "Extensively studied for tissue mechanism pathways and cellular signaling research" },
      { name: "TB-500", description: "Research focus on thymosin beta-4 derived sequences and tissue modeling" },
    ],
    keyBenefits: [
      "Dual pathway tissue regeneration support",
      "Synergistic peptide interaction research",
      "Comprehensive cellular repair mechanisms",
      "Blood vessel growth and tissue perfusion support",
    ],
    researchApplications: [
      "Tissue mechanism pathway studies",
      "Synergistic peptide interaction research",
      "Cellular signaling model development",
      "Regenerative mechanism investigations",
    ],
    storageGuide: "Store between 2-8°C (36-46°F) in original packaging. Protect from light and excessive heat.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
      { peptideName: "TB-500", articleUrl: "/guides/what-is-tb-500-peptide", articleTitle: "TB-500: Mechanism of Action Overview" },
    ],
    iconName: "Heart",
    color: "#22c55e",
    badge: "Most Popular",
    badgeColor: "#E7FB10",
    synergy: {
      beginner: "BPC-157 helps cells repair faster while TB-500 helps the body build new blood vessels to deliver nutrients. Together, they create a 'repair + rebuild' combination that researchers find works better than either compound alone.",
      expert: "BPC-157 upregulates growth hormone receptors and VEGF expression while TB-500 (Thymosin Beta-4) promotes actin polymerization and angiogenesis. The dual-pathway activation creates synergistic tissue regeneration signaling through complementary GH/IGF-1 axis and cytoskeletal remodeling mechanisms.",
    },
  },
  {
    id: "metabolic-pathway-stack",
    name: "Metabolic Pathway Research Stack",
    subtitle: "Triple-Pathway Research Bundle",
    description: "Explore incretin signaling and mitochondrial function pathways with this comprehensive metabolic research combination. Features compounds targeting multiple energy regulation mechanisms.",
    longDescription: "This stack hits metabolism from two independent angles. MOTS-C enhances cellular energy production by activating AMPK and driving mitochondrial biogenesis \u2014 essentially making each cell more efficient at producing energy. RR-A3 activates incretin, GIP, and glucagon receptors simultaneously as a triple agonist, managing appetite signaling, insulin sensitivity, and fat oxidation at the hormonal level. One works at the cellular powerhouse, the other at the hormonal control center.",
    peptides: [
      { name: "MOTS-C", description: "Mitochondrial-derived peptide studied for cellular energy metabolism pathways" },
      { name: "RR-A3", description: "Triple-agonist compound for incretin and glucagon receptor pathway research" },
    ],
    keyBenefits: [
      "Multi-target metabolic pathway investigation",
      "Mitochondrial energy optimization research",
      "Triple-agonist receptor signaling",
      "Comprehensive metabolic model development",
    ],
    researchApplications: [
      "Incretin signaling pathway investigations",
      "Mitochondrial function studies",
      "Metabolic regulation mechanism research",
      "Multi-receptor interaction models",
    ],
    storageGuide: "Maintain 2-8°C (36-46°F) for optimal stability. Store away from direct sunlight.",
    educationLinks: [
      { peptideName: "MOTS-C", articleUrl: "/guides/what-is-mots-c-peptide", articleTitle: "MOTS-C: Mitochondrial Pathway Research" },
      { peptideName: "RR-A3", articleUrl: "/guides/what-is-rr-a3-peptide", articleTitle: "RR-A3: Triple Agonist Overview" },
    ],
    iconName: "Zap",
    color: "#E7FB10",
    badge: "Hot Research",
    badgeColor: "#ef4444",
    synergy: {
      beginner: "MOTS-C helps cells produce energy more efficiently at the mitochondrial level, while RR-A3 signals the body to use stored fat for fuel. Together, they target metabolism from two different angles—one at the cellular power plant, one at the hormonal control center.",
      expert: "MOTS-C activates AMPK pathways and enhances mitochondrial biogenesis, while RR-A3 acts as a triple agonist (Incretin/GIP/Glucagon receptors) modulating metabolic signaling. This creates multi-target metabolic pathway activation: mitochondrial efficiency + peripheral insulin sensitivity + hepatic gluconeogenesis modulation.",
    },
  },
  {
    id: "longevity-protocol-stack",
    name: "Longevity Protocol Stack",
    subtitle: "Anti-Aging Research Bundle",
    description: "Explore two of the most compelling anti-aging research compounds together. This stack pairs telomerase-activating mechanisms with copper peptide tissue renewal for comprehensive cellular longevity research.",
    longDescription: "Epithalon activates telomerase reverse transcriptase, the enzyme responsible for extending telomeres — the protective caps on chromosomes that shorten with each cell division. As telomeres erode, cells enter senescence and stop dividing. By maintaining telomere length, Epithalon delays this cellular aging clock. GHK-Cu modulates over 4,000 human genes involved in tissue remodeling, collagen synthesis, and DNA repair. Together: telomere protection (Epithalon) + extracellular matrix restoration and gene expression reset (GHK-Cu) — targeting aging at both the DNA and tissue level.",
    peptides: [
      { name: "Epithalon", description: "Telomerase-activating tetrapeptide for cellular aging and telomere research" },
      { name: "GHK-Cu", description: "Copper tripeptide for tissue renewal, gene expression modulation, and anti-aging studies" },
    ],
    keyBenefits: [
      "Telomere maintenance research",
      "Gene expression modulation for tissue renewal",
      "Dual-pathway anti-aging investigation",
      "Cellular senescence delay mechanisms",
    ],
    researchApplications: [
      "Telomerase activation studies",
      "Anti-aging mechanism research",
      "Cellular longevity model development",
      "Copper peptide gene expression profiling",
    ],
    storageGuide: "Keep refrigerated at 2-8°C (36-46°F). Copper peptides are sensitive to temperature fluctuations. Epithalon should be stored protected from light.",
    educationLinks: [
      { peptideName: "Epithalon", articleUrl: "/guides/what-is-epithalon-peptide", articleTitle: "Epithalon: Telomerase & Longevity Research" },
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Research Guide" },
    ],
    iconName: "Sparkles",
    color: "#a855f7",
    synergy: {
      beginner: "Epithalon works on the 'aging clock' inside your cells by supporting telomere maintenance—the protective caps on your DNA. GHK-Cu is a copper peptide that helps cells rebuild and renew tissue. Together, they target aging from two angles: protecting your DNA's integrity and keeping tissue renewal active.",
      expert: "Epithalon activates telomerase reverse transcriptase, extending telomere length and delaying replicative senescence. GHK-Cu modulates 4,000+ genes involved in tissue remodeling, upregulating collagen synthesis, decorin, and metalloproteinases while suppressing inflammatory cytokines. The combination creates synergistic anti-aging signaling: telomere protection (Epithalon) + extracellular matrix restoration and gene expression reset (GHK-Cu).",
    },
  },
  {
    id: "cognitive-edge-stack",
    name: "Cognitive Edge Stack",
    subtitle: "Nootropic Research Duo",
    description: "The gold-standard nootropic research pairing. Semax and Selank target complementary cognitive pathways—one enhancing focus and BDNF expression, the other promoting calm clarity through anxiolytic mechanisms. Widely studied for neuroprotective synergy.",
    longDescription: "Semax is an ACTH(4-10) analog that upregulates Brain-Derived Neurotrophic Factor (BDNF) and Nerve Growth Factor (NGF), enhancing neuroplasticity and cognitive processing. Selank is a tuftsin analog that modulates GABAergic neurotransmission and reduces inflammatory cytokines like IL-6, providing anxiolytic neuroprotection through immune-neuroendocrine cross-talk. The dual-pathway activation — neurotrophic enhancement (Semax) + anxiolytic neuroprotection (Selank) — creates complementary cognitive optimization without receptor competition. This is one of the most widely studied nootropic combinations in peptide research.",
    peptides: [
      { name: "Semax", description: "ACTH fragment analog for BDNF upregulation, neuroplasticity, and cognitive enhancement research" },
      { name: "Selank", description: "Tuftsin analog for anxiolytic mechanisms, GABAergic modulation, and neuroprotection studies" },
    ],
    keyBenefits: [
      "BDNF and NGF expression research",
      "Anxiolytic neuroprotection investigation",
      "Complementary nootropic pathway activation",
      "Neuroplasticity and cognitive processing studies",
    ],
    researchApplications: [
      "Neurotrophic factor expression studies",
      "Cognitive enhancement mechanism research",
      "Anxiety and stress-response pathway investigation",
      "Immune-neuroendocrine cross-talk models",
    ],
    storageGuide: "Refrigerate at 2-8°C (36-46°F). Both peptides should be reconstituted with bacteriostatic water and used within recommended timeframes.",
    educationLinks: [
      { peptideName: "Semax", articleUrl: "/guides/what-is-semax-peptide", articleTitle: "Semax: Cognitive Enhancement Research" },
      { peptideName: "Selank", articleUrl: "/guides/what-is-selank-peptide", articleTitle: "Selank: Anxiolytic Neuroprotection Research" },
    ],
    iconName: "Brain",
    color: "#21d8ff",
    badge: "Top Nootropic",
    badgeColor: "#21d8ff",
    synergy: {
      beginner: "Semax is a brain-boosting peptide that helps sharpen focus and supports the growth of new neural connections. Selank promotes a calm, clear-headed state by reducing stress signals without causing drowsiness. Together, they create a 'focused calm'—enhanced mental clarity without the jitters or anxiety.",
      expert: "Semax (ACTH 4-10 analog) upregulates BDNF and NGF expression, enhancing neuroplasticity and cognitive processing speed. Selank (tuftsin analog) modulates GABAergic neurotransmission and reduces IL-6 levels, providing anxiolytic effects through immune-neuroendocrine cross-talk. The dual-pathway activation—neurotrophic enhancement (Semax) + anxiolytic neuroprotection (Selank)—creates complementary cognitive optimization without receptor competition.",
    },
  },
  {
    id: "collagen-skin-stack",
    name: "Collagen & Skin Pathway Stack",
    subtitle: "Dermal Research Bundle",
    description: "Study collagen synthesis pathways and dermal tissue mechanisms. This combination targets complementary wound healing and structural protein research applications.",
    longDescription: "GHK-Cu drives collagen synthesis through TGF-\u03B2 modulation, upregulating collagen I, III, and elastin production while activating copper-dependent matrix remodeling enzymes. BPC-157 provides the vascular infrastructure through VEGF-driven angiogenesis, ensuring nutrient delivery to remodeling tissue. One rebuilds the structural proteins, the other builds the blood supply to support it \u2014 architecture + supply chain.",
    peptides: [
      { name: "GHK-Cu", description: "Copper peptide for collagen pathway and matrix protein research" },
      { name: "BPC-157", description: "Tissue mechanism peptide complementing dermal pathway studies" },
    ],
    keyBenefits: [
      "Collagen synthesis pathway support",
      "Dermal tissue mechanism research",
      "Extracellular matrix optimization",
      "Comprehensive dermal health modeling",
    ],
    researchApplications: [
      "Collagen synthesis pathway studies",
      "Dermal tissue mechanism research",
      "Extracellular matrix protein interactions",
      "Wound healing model development",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). Keep both compounds protected from light and temperature variation.",
    educationLinks: [
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Collagen and Matrix Research" },
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Tissue Mechanisms in Skin Research" },
    ],
    iconName: "Leaf",
    color: "#ec4899",
    synergy: {
      beginner: "GHK-Cu directly stimulates collagen production and skin cell turnover, while BPC-157 supports the blood vessel growth needed to deliver nutrients to healing tissue. Together, they work on both the 'building blocks' and the 'supply chain' for skin and tissue research.",
      expert: "GHK-Cu upregulates collagen I, III, and elastin synthesis while modulating TGF-β signaling for controlled tissue remodeling. BPC-157 enhances angiogenesis via VEGF upregulation and provides cytoprotection. The combination creates synergistic dermal pathway activation: structural protein synthesis (GHK-Cu) + vascularization and tissue protection (BPC-157).",
    },
  },
  {
    id: "elite-triple-stack",
    name: "Elite Pathway Triple Stack",
    subtitle: "Advanced Multi-Mechanism Bundle",
    description: "Our most comprehensive research stack covering three major mechanism categories: incretin signaling, mitochondrial pathways, and tissue repair models. For advanced research programs requiring multi-target investigation.",
    longDescription: "Three compounds targeting three independent signaling cascades. RR-A3 activates incretin, GIP, and glucagon receptors simultaneously for hormonal metabolic control. MOTS-C activates AMPK for mitochondrial biogenesis and cellular energy production. BPC-157 provides tissue-level cytoprotection via VEGF upregulation and NO modulation \u2014 including gut lining support during metabolic compound research. The combination enables cross-talk investigation between metabolic, energetic, and regenerative signaling.",
    peptides: [
      { name: "RR-A3", description: "Triple-agonist for GIP, incretin, and glucagon receptor pathway research" },
      { name: "MOTS-C", description: "Mitochondrial peptide for cellular energy and metabolism studies" },
      { name: "BPC-157", description: "Extensively documented peptide for tissue mechanism research" },
    ],
    keyBenefits: [
      "Triple-pathway multi-target research",
      "Metabolic and mitochondrial optimization",
      "Comprehensive tissue regeneration support",
      "Advanced peptide interaction modeling",
    ],
    researchApplications: [
      "Multi-pathway synergy investigations",
      "Advanced metabolic mechanism studies",
      "Comprehensive tissue pathway research",
      "Complex peptide interaction modeling",
    ],
    storageGuide: "Maintain 2-8°C (36-46°F) storage conditions for all three compounds. Handle with appropriate research protocols.",
    educationLinks: [
      { peptideName: "RR-A3", articleUrl: "/guides/what-is-rr-a3-peptide", articleTitle: "RR-A3: Advanced Multi-Target Research" },
      { peptideName: "MOTS-C", articleUrl: "/guides/what-is-mots-c-peptide", articleTitle: "MOTS-C: Advanced Metabolic Pathways" },
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Advanced Tissue Mechanisms" },
    ],
    iconName: "Crown",
    color: "#f59e0b",
    badge: "Premium",
    badgeColor: "#f59e0b",
    synergy: {
      beginner: "This triple stack covers three major research areas: RR-A3 for metabolic hormone signaling, MOTS-C for cellular energy production, and BPC-157 for tissue repair. It's designed for advanced researchers who want to study how these different systems interact and influence each other.",
      expert: "This triple-compound stack enables multi-pathway investigation: RR-A3 (Incretin/GIP/GCGR triple agonist) for metabolic and hepatic signaling, MOTS-C for mitochondrial biogenesis and AMPK activation, and BPC-157 for tissue regeneration via NO/GH pathways. The combination allows researchers to study cross-talk between metabolic, energetic, and regenerative signaling cascades in a single protocol.",
    },
  },
  {
    id: "ghrh-analog-stack",
    name: "GHRH Analog Receptor Stack",
    subtitle: "Dual GHRHR Agonist Research Bundle",
    description: "Study receptor saturation and competitive occupancy dynamics by pairing two structurally distinct GHRH analogs that engage the same pituitary GHRH receptor (GHRHR).",
    longDescription: "CJC-1295 (No DAC) and Sermorelin are both growth-hormone-releasing-hormone analogs that engage the same pituitary GHRH receptor (GHRHR) to drive endogenous GH release. Sermorelin is the shortest active fragment of native GHRH (1-29) with a rapid half-life, while CJC-1295 No DAC is a modified 30-amino-acid analog with enhanced plasma stability. Stacking both in the same protocol creates redundant occupancy on the same receptor pathway — making this an ideal model for studying receptor saturation kinetics, competitive binding dynamics, and occupancy-response relationships on a single well-characterized GPCR.",
    peptides: [
      { name: "CJC-1295 (No DAC)", description: "Modified GHRH(1-30) analog with enhanced stability; engages pituitary GHRH receptor to drive GH release" },
      { name: "Sermorelin", description: "GHRH(1-29) native-sequence fragment; shortest active GHRHR agonist for pulsatile GH release research" },
    ],
    keyBenefits: [
      "Same-receptor occupancy dynamics research",
      "Comparative GHRHR binding kinetics study",
      "Receptor saturation and desensitization modeling",
      "Endogenous GH pulse architecture investigation",
    ],
    researchApplications: [
      "GHRHR competitive occupancy studies",
      "Receptor saturation kinetics modeling",
      "GH pulse architecture research",
      "GHRH analog half-life comparison investigations",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). Both peptides are sensitive to temperature variation; keep protected from light.",
    educationLinks: [
      { peptideName: "CJC-1295 (No DAC)", articleUrl: "/guides/what-is-cjc-1295-peptide", articleTitle: "CJC-1295: GHRH Analog Research Guide" },
      { peptideName: "Sermorelin", articleUrl: "/guides/what-is-sermorelin-peptide", articleTitle: "Sermorelin: GHRH Receptor Pharmacology" },
    ],
    iconName: "FlaskConical",
    color: "#6366f1",
    badge: "Receptor Study",
    badgeColor: "#6366f1",
    intentionalOverlap: true,
    synergy: {
      beginner: "Both CJC-1295 (No DAC) and Sermorelin work by activating the same receptor in the pituitary gland to trigger GH release. One acts quickly and clears fast; the other lasts longer. Pairing them lets researchers study what happens when two compounds compete for the same docking site — a classic receptor occupancy experiment.",
      expert: "CJC-1295 (No DAC) and Sermorelin are both GHRHR agonists targeting the same Gs-coupled GPCR in the pituitary somatotrophs. Their differing receptor kinetics — rapid clearance (Sermorelin, t½ ~10–20 min) versus extended plasma stability (CJC-1295, t½ ~30 min) — create a tractable model for studying competitive receptor occupancy, desensitization dynamics, and the relationship between pulsatile vs. sustained GHRHR activation on GH secretion amplitude.",
    },
  },
  {
    id: "ghsr-secretagogue-stack",
    name: "GHSR1a Secretagogue Stack",
    subtitle: "Dual Ghrelin Receptor Research Bundle",
    description: "Investigate receptor selectivity differences by combining two structurally distinct GHSR1a agonists — Ipamorelin and GHRP-2 — on the same ghrelin receptor pathway.",
    longDescription: "Ipamorelin and GHRP-2 are both growth hormone secretagogues that activate the ghrelin receptor (GHSR1a) on pituitary somatotrophs, but with distinct selectivity profiles. Ipamorelin is noted for high GHSR1a selectivity with minimal off-target cortisol or prolactin stimulation. GHRP-2 is a more potent GHSR1a agonist with broader endocrine activity including documented cortisol and prolactin responses. Pairing them creates a controlled same-receptor model that isolates how selectivity differences at the same GPCR translate to divergent downstream endocrine profiles — a question directly relevant to receptor subtype pharmacology research.",
    peptides: [
      { name: "Ipamorelin", description: "Selective GHSR1a full agonist; widely studied for GH secretagogue activity with minimal off-target endocrine stimulation" },
      { name: "GHRP-2", description: "Potent GHSR1a full agonist with broader endocrine activity; used in comparative GH secretagogue research" },
    ],
    keyBenefits: [
      "Comparative GHSR1a selectivity research",
      "GH secretagogue receptor binding kinetics",
      "Endocrine off-target profiling studies",
      "Same-receptor selectivity differentiation modeling",
    ],
    researchApplications: [
      "GHSR1a occupancy and selectivity investigations",
      "GH secretagogue receptor pharmacology studies",
      "Endocrine downstream profiling research",
      "Receptor subtype selectivity modeling",
    ],
    storageGuide: "Maintain 2-8°C (36-46°F) storage for both compounds. Reconstitute with bacteriostatic water and store protected from light.",
    educationLinks: [
      { peptideName: "Ipamorelin", articleUrl: "/guides/what-is-ipamorelin-peptide", articleTitle: "Ipamorelin: Selective GHSR1a Agonist Research" },
      { peptideName: "GHRP-2", articleUrl: "/guides/what-is-ghrp-2-peptide", articleTitle: "GHRP-2: Ghrelin Receptor Pharmacology" },
    ],
    iconName: "FlaskConical",
    color: "#0ea5e9",
    badge: "Selectivity Study",
    badgeColor: "#0ea5e9",
    intentionalOverlap: true,
    synergy: {
      beginner: "Ipamorelin and GHRP-2 both trigger GH release by activating the same ghrelin receptor. The key difference researchers study is selectivity — Ipamorelin is considered 'cleaner' with fewer side signals, while GHRP-2 is more potent but activates more hormonal pathways. Pairing them reveals how two compounds on the same receptor can still produce meaningfully different research outcomes.",
      expert: "Ipamorelin and GHRP-2 are both full agonists at GHSR1a (Gs-coupled), yet demonstrate divergent downstream endocrine profiles: Ipamorelin shows high receptor selectivity with minimal cortisol/prolactin co-stimulation, while GHRP-2 produces dose-dependent cortisol and prolactin responses alongside GH release. This same-receptor but different-selectivity model enables investigation of biased agonism concepts and off-target endocrine signaling without confounders from a second receptor pathway.",
    },
  },
  {
    id: "igf1r-anabolic-stack",
    name: "IGF-1R Anabolic Pathway Stack",
    subtitle: "Dual IGF-1R Agonist Research Bundle",
    description: "Study anabolic signaling and IGF-1R occupancy dynamics by pairing two structurally distinct IGF-1 receptor analogs with complementary pharmacokinetic profiles.",
    longDescription: "IGF-1 LR3 and IGF-DES are both analogs of insulin-like growth factor 1 (IGF-1) that engage the IGF-1 receptor (IGF-1R), but with distinct structural and pharmacokinetic profiles. IGF-1 LR3 is a long-arginine-3 extended variant with reduced insulin-like binding protein (IGFBP) affinity, resulting in prolonged circulating bioavailability. IGF-DES is a truncated des(1-3) variant with enhanced IGF-1R binding affinity relative to native IGF-1, attributed to its reduced IGFBP interaction and altered N-terminal structure. Pairing them creates a controlled same-receptor model for studying IGF-1R occupancy dynamics, differential IGFBP interaction, and how distinct structural modifications on the same native growth factor translate to divergent receptor binding kinetics and downstream anabolic signaling.",
    peptides: [
      { name: "IGF-1 LR3", description: "Long-arginine-3 IGF-1 analog with reduced IGFBP affinity; studied for extended IGF-1R engagement and anabolic pathway research" },
      { name: "IGF-DES", description: "Des(1-3) IGF-1 truncation variant with enhanced IGF-1R binding affinity; used in comparative anabolic signaling and receptor occupancy research" },
    ],
    keyBenefits: [
      "IGF-1R occupancy dynamics research",
      "Comparative IGFBP interaction profiling",
      "Anabolic pathway activation studies",
      "Receptor binding kinetics modeling across IGF-1 variants",
    ],
    researchApplications: [
      "IGF-1R competitive binding and occupancy studies",
      "Anabolic signaling cascade investigation",
      "IGFBP interaction and bioavailability research",
      "IGF-1 analog receptor kinetics comparison",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). Both peptides are sensitive to temperature variation and should be protected from light. Reconstitute with bacteriostatic water and use within recommended timeframes.",
    educationLinks: [
      { peptideName: "IGF-1 LR3", articleUrl: "/guides/what-is-igf-1-lr3-peptide", articleTitle: "IGF-1 LR3: Extended-Half-Life IGF-1R Analog Research" },
      { peptideName: "IGF-DES", articleUrl: "/guides/what-is-igf-des-peptide", articleTitle: "IGF-DES: Truncated IGF-1 Analog and Receptor Binding Research" },
    ],
    iconName: "Dumbbell",
    color: "#f97316",
    badge: "Receptor Study",
    badgeColor: "#f97316",
    intentionalOverlap: true,
    synergy: {
      beginner: "IGF-1 LR3 and IGF-DES both activate the same IGF-1 receptor — the key growth factor receptor driving anabolic and muscle-repair signaling. LR3 stays active longer in the body because it avoids the proteins that normally mop up IGF-1 quickly. DES binds the receptor more tightly but clears faster. Together they let researchers study what happens when two variants of the same hormone engage the same receptor with different binding strength and duration.",
      expert: "IGF-1 LR3 (Long-Arg3) and IGF-DES (Des(1-3)-IGF-1) are both IGF-1R full agonists that circumvent insulin-like growth factor binding protein (IGFBP) sequestration by distinct structural mechanisms — LR3 via an arginine substitution at position 3 that reduces IGFBP-3 affinity ~500-fold, and DES via N-terminal truncation that sterically disrupts IGFBP interaction. Pairing them creates a tractable IGF-1R occupancy model: the prolonged plasma bioavailability of LR3 (reduced IGFBP clearance) against the enhanced receptor-binding affinity of DES, enabling study of occupancy kinetics, receptor internalization dynamics, and downstream PI3K/Akt/mTOR pathway activation across structurally differentiated IGF-1R agonists.",
    },
  },
];

export const RESEARCH_STACKS_BY_ID: Record<string, ResearchStackData> = Object.fromEntries(
  RESEARCH_STACKS_DATA.map((s) => [s.id, s])
);
