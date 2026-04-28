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
    badge: "Advanced",
    badgeColor: "#a855f7",
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
