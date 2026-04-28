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

export type StackCategory = "Recovery" | "Cognitive" | "Metabolic" | "GH Axis" | "Longevity" | "Skin" | "Immune";

export const STACK_CATEGORIES: StackCategory[] = [
  "Recovery",
  "Cognitive",
  "Metabolic",
  "GH Axis",
  "Longevity",
  "Skin",
  "Immune",
];

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
  category: StackCategory;
}

export const RESEARCH_STACKS_DATA: ResearchStackData[] = [
  {
    id: "recovery-tissue-stack",
    category: "Recovery",
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
    category: "Metabolic",
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
    category: "Cognitive",
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
    category: "GH Axis",
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

  // ── Known-stack detail pages ──────────────────────────────────────────────

  {
    id: "glow-protocol",
    category: "Skin",
    name: "Glow Protocol",
    subtitle: "Triple Skin Rejuvenation Stack",
    description: "Combines collagen synthesis, angiogenesis, and tissue repair pathways in one comprehensive skin research stack. Studies three distinct mechanisms for dermal regeneration simultaneously.",
    longDescription: "The Glow Protocol targets skin biology from three complementary angles. BPC-157 drives VEGF-mediated vascular remodeling and growth hormone receptor activation, improving perfusion to dermal tissue. TB-500 (Thymosin Beta-4) promotes actin cytoskeletal organization and systemic tissue repair, accelerating cellular migration into sites of remodeling. GHK-Cu (copper tripeptide) directly stimulates collagen I, III, and elastin synthesis while activating matrix metalloproteinases for extracellular matrix remodeling. The three-compound design allows researchers to investigate how vascularization, cellular repair, and collagen matrix restructuring interact as a coordinated regenerative cascade in dermal tissue models.",
    peptides: [
      { name: "BPC-157", description: "Studied for VEGF upregulation and vascular remodeling relevant to dermal tissue perfusion research" },
      { name: "TB-500", description: "Thymosin beta-4 analog studied for actin polymerization, cellular migration, and systemic tissue repair mechanisms" },
      { name: "GHK-Cu", description: "Copper tripeptide studied for collagen and elastin synthesis stimulation and extracellular matrix remodeling" },
    ],
    keyBenefits: [
      "Tri-pathway dermal regeneration research",
      "Collagen and elastin synthesis investigation",
      "Vascular remodeling and tissue perfusion studies",
      "Extracellular matrix restructuring models",
    ],
    researchApplications: [
      "Dermal collagen synthesis pathway studies",
      "VEGF-mediated angiogenesis research in skin models",
      "Thymosin beta-4 actin dynamics investigation",
      "Multi-mechanism skin regeneration cascade research",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). GHK-Cu is particularly light-sensitive; store in amber vials or foil-wrapped containers. Reconstitute each peptide separately with bacteriostatic water.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
      { peptideName: "TB-500", articleUrl: "/guides/what-is-tb-500-peptide", articleTitle: "TB-500: Mechanism of Action Overview" },
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
    ],
    iconName: "Sparkles",
    color: "#ec4899",
    synergy: {
      beginner: "BPC-157 helps build new blood vessels to feed the skin, TB-500 speeds up the migration and repair of skin cells, and GHK-Cu directly tells skin cells to produce more collagen and elastin. Together they represent a repair-to-rebuild pipeline: improved blood supply, faster cell turnover, and stronger structural protein output — all at once.",
      expert: "BPC-157 upregulates VEGF and activates growth hormone receptors, promoting angiogenesis and improved dermal perfusion. TB-500 (Thymosin Beta-4) modulates actin dynamics and chemokine gradients (SDF-1/CXCR4), facilitating progenitor cell recruitment. GHK-Cu activates SP1 transcription factor binding sites upstream of collagen I, III, and elastin gene promoters while inducing MMP-1 and MMP-2 for ECM remodeling. The three-compound synergy creates a sequential regenerative cascade: vascularization (BPC-157) → cellular infiltration (TB-500) → structural matrix deposition (GHK-Cu).",
    },
  },

  {
    id: "gh-amplifier",
    category: "GH Axis",
    name: "GH Amplifier",
    subtitle: "GHRP + GHRH Synergy Stack",
    description: "The classic growth hormone research duo. Ipamorelin and CJC-1295 activate complementary receptors — GHSR and GHRHR — to produce synergistic GH pulse amplification that neither compound achieves alone.",
    longDescription: "Ipamorelin is a selective growth hormone secretagogue receptor (GHSR) agonist that triggers discrete GH pulses with minimal cortisol or prolactin co-secretion. CJC-1295 is a stabilized GHRH(1-29) analog that acts on the pituitary GHRH receptor (GHRHR), increasing both the frequency and amplitude of natural GH pulses. The dual-receptor model is a well-established pharmacological principle in GH research: GHRP agonists (Ipamorelin) and GHRH analogs (CJC-1295) converge on distinct intracellular cascades — Gq/PKC and Gs/cAMP respectively — within the same somatotroph cell. This convergence produces a multiplicative rather than additive increase in GH secretion, making this pairing one of the most studied in growth hormone axis research.",
    peptides: [
      { name: "Ipamorelin", description: "Selective GHSR agonist studied for discrete GH pulse induction with minimal off-target hormone co-secretion" },
      { name: "CJC-1295", description: "Stabilized GHRH(1-29) analog studied for pituitary GHRH receptor activation and GH pulse amplification" },
    ],
    keyBenefits: [
      "Dual-receptor GH axis activation research",
      "GHSR and GHRHR convergence studies",
      "GH pulse amplitude and frequency investigation",
      "Somatotroph intracellular signaling cascade models",
    ],
    researchApplications: [
      "Growth hormone secretagogue receptor pharmacology",
      "GHRH analog pituitary signaling research",
      "GH pulse kinetics and somatotroph biology studies",
      "Dual-receptor convergence and GH output modeling",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). CJC-1295 (No DAC) is stable for shorter periods than DAC-conjugated forms; use reconstituted peptide within recommended timeframes. Protect both peptides from light.",
    educationLinks: [
      { peptideName: "Ipamorelin", articleUrl: "/guides/what-is-ipamorelin-peptide", articleTitle: "Ipamorelin: GHSR Agonist Research Guide" },
      { peptideName: "CJC-1295", articleUrl: "/guides/what-is-cjc-1295-peptide", articleTitle: "CJC-1295: GHRH Analog Pharmacokinetics" },
    ],
    iconName: "Zap",
    color: "#6366f1",
    badge: "Classic Combo",
    badgeColor: "#6366f1",
    synergy: {
      beginner: "Ipamorelin and CJC-1295 work on two different receptors in the same pituitary cell — like pressing the gas pedal and releasing the brakes at the same time. Ipamorelin signals the cell to release GH, and CJC-1295 amplifies how much GH the cell is capable of releasing. Together they produce far more GH than either compound alone.",
      expert: "Ipamorelin (GHSR agonist) activates Gq/phospholipase C/PKC signaling within somatotroph cells, triggering calcium-dependent GH vesicle exocytosis. CJC-1295 (GHRH analog) activates Gs/adenylyl cyclase/cAMP/PKA signaling at the same somatotroph, increasing somatotroph sensitivity and GH gene transcription. The dual Gq+Gs convergence produces a multiplicative enhancement of GH secretion documented in combined GHRP/GHRH pharmacology studies — each pathway amplifies the other's downstream signal rather than simply adding to it.",
    },
  },

  {
    id: "recovery-plus",
    category: "Recovery",
    name: "Recovery+",
    subtitle: "Collagen Synthesis and Tissue Protection Stack",
    description: "A focused two-compound pairing that combines BPC-157's cytoprotective and vascular repair signaling with GHK-Cu's direct collagen matrix stimulation. Studied for complementary tissue regeneration mechanisms.",
    longDescription: "BPC-157 (Body Protection Compound-157) is a 15-amino acid stable gastric pentadecapeptide studied for its cytoprotective effects across multiple organ systems. It upregulates growth hormone receptors, activates VEGF signaling for angiogenesis, and modulates nitric oxide production. GHK-Cu (glycyl-L-histidyl-L-lysine copper(II)) is a naturally occurring copper-binding tripeptide studied for its ability to activate collagen I, III, and elastin gene expression via SP1 transcription factor and to stimulate MMP-mediated ECM remodeling. Together they represent complementary tissue regeneration vectors: BPC-157 improves the vascular environment and cytoprotective signaling while GHK-Cu drives structural collagen matrix deposition — making this a frequently studied pairing in tissue repair models.",
    peptides: [
      { name: "BPC-157", description: "Pentadecapeptide studied for cytoprotection, VEGF-mediated angiogenesis, and GH receptor upregulation in tissue repair models" },
      { name: "GHK-Cu", description: "Copper tripeptide studied for collagen I/III/elastin synthesis stimulation and matrix metalloproteinase-mediated ECM remodeling" },
    ],
    keyBenefits: [
      "Complementary vascular and structural repair pathways",
      "Collagen matrix synthesis and remodeling research",
      "Cytoprotective signaling mechanism studies",
      "VEGF + SP1 dual-pathway tissue regeneration models",
    ],
    researchApplications: [
      "Tissue cytoprotection mechanism studies",
      "Collagen synthesis pathway investigation",
      "VEGF-driven angiogenesis research",
      "Extracellular matrix remodeling models",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). GHK-Cu is light-sensitive — use amber vials. Reconstitute BPC-157 with bacteriostatic water. Both peptides are stable for several weeks refrigerated.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
    ],
    iconName: "Heart",
    color: "#22c55e",
    synergy: {
      beginner: "BPC-157 improves blood flow to injured tissue and protects cells from damage, while GHK-Cu tells those cells to build more collagen and repair the structural matrix. BPC-157 sets up the environment for healing, and GHK-Cu executes the structural rebuild — a sequential repair sequence.",
      expert: "BPC-157 drives VEGF upregulation and eNOS activation, improving tissue perfusion and creating a pro-anabolic vascular environment. GHK-Cu activates SP1 and AP-1 transcription factors at collagen I and III gene promoters while inducing MMP-1, MMP-2, and TIMP expression to balance matrix deposition and degradation. The functional synergy: BPC-157's vascular remodeling improves oxygen and nutrient delivery to the remodeling ECM, while GHK-Cu's collagen stimulation fills the structural scaffold — complementary rather than overlapping mechanistic pathways.",
    },
  },

  {
    id: "longevity-protocol",
    category: "Longevity",
    name: "Longevity Protocol",
    subtitle: "Telomere Extension and Collagen Regeneration Stack",
    description: "Pairs Epithalon's telomerase activation with GHK-Cu's collagen matrix regeneration for a dual-pathway cellular aging research model. Studies how telomere biology and extracellular matrix maintenance interact.",
    longDescription: "Epithalon (Epitalon) is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) derived from the pineal gland extract epithalamin. It has been studied for its ability to activate telomerase enzyme activity and to modulate expression of the catalytic subunit hTERT, promoting telomere elongation in cell culture and animal models. GHK-Cu (glycyl-L-histidyl-L-lysine copper(II)) is a naturally occurring copper peptide that activates over 4,000 human genes in studies, with particular focus on collagen synthesis, antioxidant defense, and DNA repair systems. Together they address aging biology from two angles: Epithalon targets the replicative senescence limit through telomerase activation, while GHK-Cu targets structural tissue degradation and oxidative DNA damage through matrix remodeling and antioxidant gene induction.",
    peptides: [
      { name: "Epithalon", description: "Synthetic pineal tetrapeptide studied for hTERT-mediated telomerase activation and telomere elongation in aging cell models" },
      { name: "GHK-Cu", description: "Copper tripeptide studied for collagen synthesis activation, antioxidant gene induction, and DNA repair pathway modulation" },
    ],
    keyBenefits: [
      "Telomerase activation and telomere biology research",
      "Collagen matrix regeneration alongside cellular aging studies",
      "Dual-pathway aging mechanism investigation",
      "Antioxidant gene expression and DNA repair modeling",
    ],
    researchApplications: [
      "Replicative senescence and telomere length studies",
      "hTERT expression and telomerase kinetics research",
      "Collagen synthesis and ECM maintenance in aging models",
      "Combined genomic and structural aging mechanism research",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). Epithalon is stable in lyophilized form; reconstitute with sterile or bacteriostatic water before use. GHK-Cu should be stored in amber containers away from light.",
    educationLinks: [
      { peptideName: "Epithalon", articleUrl: "/guides/what-is-epithalon-peptide", articleTitle: "Epithalon: Telomerase Research Guide" },
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
    ],
    iconName: "Crown",
    color: "#a855f7",
    synergy: {
      beginner: "Epithalon works at the cellular level, helping cells maintain and extend their telomeres — the protective caps on chromosomes that shorten as we age. GHK-Cu works at the tissue level, telling cells to produce more collagen and repair DNA damage. Together they address aging from the inside out: cellular replication capacity (Epithalon) and structural tissue quality (GHK-Cu).",
      expert: "Epithalon (Ala-Glu-Asp-Gly) activates telomerase reverse transcriptase (hTERT) expression, extends telomere length in cultured somatic cells, and modulates pineal melatonin and cortisol rhythms relevant to cellular stress responses. GHK-Cu activates SP1/AP-1 at collagen gene promoters, induces antioxidant enzymes (superoxide dismutase, catalase), and upregulates DNA repair genes (ERCC1, XPA) in transcriptomic studies. The dual-mechanism model addresses two distinct hallmarks of aging: telomere attrition (Epithalon → hTERT → telomere maintenance) and extracellular matrix degradation with oxidative stress accumulation (GHK-Cu → antioxidant/ECM gene induction).",
    },
  },

  {
    id: "deep-sleep",
    category: "Longevity",
    name: "Deep Sleep",
    subtitle: "Circadian Rhythm and GH Pulse Optimization Stack",
    description: "Combines Epithalon's pineal-axis modulation with Ipamorelin's selective GH secretagogue activity to study circadian sleep architecture and nocturnal growth hormone release in research models.",
    longDescription: "Sleep-associated GH secretion and circadian rhythm maintenance are tightly linked through the pineal-hypothalamic-pituitary axis. Epithalon (Epitalon) was originally derived from the pineal peptide epithalamin and has been studied for its ability to restore melatonin secretion rhythms, normalize circadian gene expression (BMAL1, CLOCK, PER), and modulate cortisol patterns in aging models. Ipamorelin is a selective GHSR agonist that induces clean GH pulses mimicking the physiological nocturnal GH surge without significant cortisol or prolactin co-secretion. This pairing allows researchers to study the interdependence of circadian timing signals (Epithalon) and GH pulse quality (Ipamorelin) — two systems that co-regulate each other through hypothalamic-pituitary feedback and somatostatin tone.",
    peptides: [
      { name: "Epithalon", description: "Pineal-derived tetrapeptide studied for melatonin rhythm restoration, circadian gene normalization, and telomerase activation" },
      { name: "Ipamorelin", description: "Selective GHSR agonist studied for clean nocturnal GH pulse induction without significant cortisol or prolactin co-secretion" },
    ],
    keyBenefits: [
      "Circadian rhythm and sleep architecture research",
      "Nocturnal GH pulse physiology investigation",
      "Pineal-pituitary axis interaction studies",
      "Melatonin and GHSR signaling pathway modeling",
    ],
    researchApplications: [
      "Circadian gene expression studies (BMAL1, CLOCK, PER)",
      "Melatonin secretion rhythm modulation research",
      "Nocturnal somatotroph GH pulse characterization",
      "Pineal-hypothalamic-pituitary signaling axis models",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). Both peptides are stable in lyophilized form. Reconstitute with bacteriostatic water. Ipamorelin has a ~2 hour half-life; Epithalon's effects are cumulative through circadian gene expression rather than acute plasma concentration.",
    educationLinks: [
      { peptideName: "Epithalon", articleUrl: "/guides/what-is-epithalon-peptide", articleTitle: "Epithalon: Telomerase Research Guide" },
      { peptideName: "Ipamorelin", articleUrl: "/guides/what-is-ipamorelin-peptide", articleTitle: "Ipamorelin: GHSR Agonist Research Guide" },
    ],
    iconName: "Crown",
    color: "#6366f1",
    synergy: {
      beginner: "Epithalon helps regulate the body's internal clock and melatonin signals — the hormonal system that governs sleep cycles. Ipamorelin triggers the natural GH release pulse that normally occurs during deep sleep. Together they study two systems that depend on each other: quality sleep timing (Epithalon) and quality of the GH pulse that sleep enables (Ipamorelin).",
      expert: "Epithalon modulates circadian oscillator gene expression (BMAL1, CLOCK, CRY, PER) through pineal-derived signaling and restores age-related declines in nocturnal melatonin secretion. Ipamorelin selectively activates GHSR-1a without stimulating cortisol or prolactin axes, producing discrete GH pulses that mirror physiological sleep-associated GH surges. The research model captures the bidirectional relationship between circadian timing (melatonin/Epithalon) and somatotroph activity (GHSR/Ipamorelin): somatostatin tone that suppresses GH release is highest when circadian timing is disrupted, while restored circadian rhythmicity (Epithalon) is hypothesized to reduce somatostatin tone and improve GHSR agonist response.",
    },
  },

  {
    id: "total-regen",
    category: "Recovery",
    name: "Total Regen",
    subtitle: "Complete Tissue Recovery Research Stack",
    description: "Three-compound recovery model combining local tissue repair, systemic regeneration, and GH axis support. Studies the interaction of BPC-157, TB-500, and Ipamorelin across complementary regenerative pathways.",
    longDescription: "Total Regen assembles three mechanistically distinct regenerative compounds into a unified research model. BPC-157 operates locally through VEGF upregulation, GH receptor activation, and nitric oxide-mediated cytoprotection. TB-500 (Thymosin Beta-4) provides systemic repair capacity through actin polymerization modulation, SDF-1/CXCR4 chemokine axis activation, and promotion of progenitor cell recruitment. Ipamorelin adds GH axis support through selective GHSR-1a agonism, driving GH-dependent anabolic and repair signaling downstream of the pituitary. The three-compound combination allows researchers to study local repair signals (BPC-157), systemic cellular repair mobilization (TB-500), and endocrine GH axis contribution (Ipamorelin) as an integrated regenerative cascade.",
    peptides: [
      { name: "BPC-157", description: "Pentadecapeptide studied for local VEGF signaling, GH receptor upregulation, and cytoprotective mechanisms" },
      { name: "TB-500", description: "Thymosin beta-4 analog studied for systemic actin dynamics, progenitor cell recruitment, and tissue repair mobilization" },
      { name: "Ipamorelin", description: "Selective GHSR agonist studied for GH pulse induction and downstream anabolic signaling support" },
    ],
    keyBenefits: [
      "Three-tier tissue regeneration research model",
      "Local, systemic, and endocrine repair pathway integration",
      "GH axis contribution to tissue repair investigation",
      "Comprehensive regenerative signaling cascade studies",
    ],
    researchApplications: [
      "Multi-mechanism tissue repair interaction studies",
      "BPC-157 + TB-500 local vs. systemic repair dynamics",
      "GH axis modulation in tissue repair context",
      "Integrated regenerative cascade pathway modeling",
    ],
    storageGuide: "Store all three peptides at 2-8°C (36-46°F). Reconstitute each separately with bacteriostatic water. TB-500 has particularly long systemic activity; BPC-157 and Ipamorelin have shorter plasma half-lives of approximately 4 hours and 2 hours respectively.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
      { peptideName: "TB-500", articleUrl: "/guides/what-is-tb-500-peptide", articleTitle: "TB-500: Mechanism of Action Overview" },
      { peptideName: "Ipamorelin", articleUrl: "/guides/what-is-ipamorelin-peptide", articleTitle: "Ipamorelin: GHSR Agonist Research Guide" },
    ],
    iconName: "Heart",
    color: "#22c55e",
    badge: "Triple Action",
    badgeColor: "#22c55e",
    synergy: {
      beginner: "BPC-157 targets the injury site directly, TB-500 recruits repair cells from throughout the body to that site, and Ipamorelin boosts the GH signal that drives growth and repair everywhere. It's a three-layer repair system: local repair, systemic mobilization, and hormonal support — working from three directions simultaneously.",
      expert: "BPC-157 activates local GHR and VEGF/eNOS signaling at the tissue injury site. TB-500 mobilizes progenitor cells via SDF-1/CXCR4 chemotaxis and promotes actin-driven cellular migration. Ipamorelin drives pituitary GH secretion via GHSR-1a → Gq → PKC → calcium cascade, elevating circulating GH and downstream IGF-1. The functional interaction: BPC-157's GHR upregulation sensitizes tissue to the elevated GH produced by Ipamorelin, while TB-500's progenitor cell recruitment fills the vascular and cellular scaffold that BPC-157's VEGF activation creates — creating a coordinated local-systemic-endocrine repair triad.",
    },
  },

  {
    id: "lean-mass",
    category: "GH Axis",
    name: "Lean Mass",
    subtitle: "GH Amplification and Metabolic Enhancement Stack",
    description: "Three-compound research model targeting growth hormone axis output and cellular metabolic efficiency. Studies CJC-1295, Ipamorelin, and MOTS-C as a combined anabolic and metabolic signaling system.",
    longDescription: "The Lean Mass stack combines two complementary GH secretagogues with a mitochondrial-derived metabolic peptide. CJC-1295 acts at pituitary GHRH receptors to amplify GH pulse amplitude and frequency. Ipamorelin acts at GHSR to trigger selective GH pulse induction. Their convergence on Gs/cAMP and Gq/PKC pathways respectively creates a multiplicative enhancement of somatotroph GH output. MOTS-C is a 16-amino acid mitochondrial-encoded peptide that activates AMPK and targets the folate cycle / AICAR pathway, improving mitochondrial biogenesis and cellular energy substrate utilization. This three-way combination allows researchers to study whether improving mitochondrial metabolic efficiency (MOTS-C) and maximizing GH-axis signaling output (CJC-1295 + Ipamorelin) act additively, synergistically, or independently in body composition signaling models.",
    peptides: [
      { name: "CJC-1295", description: "GHRH analog studied for pituitary GHRH receptor activation and GH pulse amplitude enhancement" },
      { name: "Ipamorelin", description: "Selective GHSR agonist studied for clean GH pulse induction with minimal off-target hormone secretion" },
      { name: "MOTS-C", description: "Mitochondrial-derived peptide studied for AMPK activation, mitochondrial biogenesis, and cellular energy metabolism enhancement" },
    ],
    keyBenefits: [
      "Dual-receptor GH axis amplification research",
      "Mitochondrial metabolic efficiency investigation",
      "AMPK pathway activation alongside GH axis studies",
      "Combined anabolic and metabolic signaling models",
    ],
    researchApplications: [
      "GH axis dual-receptor convergence pharmacology",
      "Mitochondrial biogenesis and AMPK signaling research",
      "Body composition signaling pathway investigation",
      "GH-axis and metabolic peptide interaction modeling",
    ],
    storageGuide: "Store all three peptides at 2-8°C (36-46°F). Reconstitute each separately. CJC-1295 (No DAC) has a shorter half-life than DAC-conjugated forms; Ipamorelin has a ~2 hour half-life; MOTS-C has a ~1–2 hour half-life.",
    educationLinks: [
      { peptideName: "CJC-1295", articleUrl: "/guides/what-is-cjc-1295-peptide", articleTitle: "CJC-1295: GHRH Analog Pharmacokinetics" },
      { peptideName: "Ipamorelin", articleUrl: "/guides/what-is-ipamorelin-peptide", articleTitle: "Ipamorelin: GHSR Agonist Research Guide" },
      { peptideName: "MOTS-C", articleUrl: "/guides/what-is-mots-c-peptide", articleTitle: "MOTS-C: Mitochondrial Pathway Research" },
    ],
    iconName: "Dumbbell",
    color: "#6366f1",
    synergy: {
      beginner: "CJC-1295 and Ipamorelin together maximize GH output from two different angles — one amplifies the GH release signal, the other makes the cells more sensitive to it. MOTS-C then works at the cellular powerhouse (mitochondria) to make each cell more efficient at using energy. The stack studies GH-driven anabolic signaling alongside cellular metabolic efficiency.",
      expert: "CJC-1295 (GHRH analog) and Ipamorelin (GHSR-1a agonist) converge on Gs/cAMP/PKA and Gq/PLC/PKC pathways respectively within pituitary somatotrophs, producing multiplicative GH release. MOTS-C activates AMPK via the folate-AICAR pathway and promotes PGC-1α-driven mitochondrial biogenesis, improving fatty acid oxidation and glucose uptake in skeletal muscle. The three-compound research question: does AMPK activation by MOTS-C modulate IGF-1 signaling downstream of GH (AMPK suppresses mTORC1, which partially antagonizes GH/IGF-1 anabolic signaling), and how does the timing of MOTS-C administration relative to GH pulse induction affect net anabolic vs. catabolic signaling balance?",
    },
  },

  {
    id: "klow-stack",
    category: "Recovery",
    name: "KLOW Stack",
    subtitle: "3-Phase Anti-Inflammatory Regeneration Stack",
    description: "A four-compound research model designed around a sequential inflammation-repair-remodel cascade. KPV clears inflammatory signaling, BPC-157 and TB-500 repair tissue, and GHK-Cu remodels the collagen matrix.",
    longDescription: "The KLOW Stack operationalizes a three-phase tissue repair model using four mechanistically distinct compounds. Phase 1 (Inflammation): KPV (Lys-Pro-Val), a C-terminal alpha-MSH tripeptide, inhibits NF-κB nuclear translocation and suppresses downstream pro-inflammatory cytokine production (IL-1β, TNF-α, IL-6) through melanocortin receptor engagement. Phase 2 (Repair): BPC-157 activates VEGF and GHR signaling for vascular repair and cytoprotection; TB-500 (Thymosin Beta-4) drives actin-mediated cellular migration and systemic progenitor recruitment. Phase 3 (Remodel): GHK-Cu stimulates collagen I, III, and elastin synthesis via SP1 activation and balances ECM remodeling through MMP/TIMP induction. The sequential four-compound model allows researchers to study whether pre-clearing inflammatory signaling (KPV) improves the efficacy of subsequent repair and remodeling compounds.",
    peptides: [
      { name: "BPC-157", description: "Pentadecapeptide studied for VEGF upregulation, cytoprotection, and GH receptor activation in tissue repair models" },
      { name: "TB-500", description: "Thymosin beta-4 analog studied for systemic progenitor cell recruitment and actin-driven cellular migration" },
      { name: "GHK-Cu", description: "Copper tripeptide studied for collagen and elastin synthesis activation and extracellular matrix remodeling" },
      { name: "KPV", description: "Alpha-MSH-derived tripeptide studied for NF-κB inhibition and pro-inflammatory cytokine suppression" },
    ],
    keyBenefits: [
      "Sequential inflammation-repair-remodel cascade research",
      "NF-κB pathway inhibition and anti-inflammatory mechanism studies",
      "Four-compound tissue regeneration interaction modeling",
      "Collagen matrix remodeling alongside inflammatory resolution",
    ],
    researchApplications: [
      "Multi-phase tissue repair cascade investigation",
      "NF-κB inhibition and repair pathway interaction studies",
      "Inflammatory pre-conditioning and repair efficacy research",
      "Four-compound regenerative mechanism modeling",
    ],
    storageGuide: "Store all peptides at 2-8°C (36-46°F). GHK-Cu is light-sensitive; use amber vials. KPV is a small tripeptide that may be less stable than larger peptides after reconstitution. Reconstitute each compound separately with bacteriostatic water.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
      { peptideName: "TB-500", articleUrl: "/guides/what-is-tb-500-peptide", articleTitle: "TB-500: Mechanism of Action Overview" },
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
      { peptideName: "KPV", articleUrl: "/guides/what-is-kpv-peptide", articleTitle: "KPV: Anti-Inflammatory Melanocortin Tripeptide" },
    ],
    iconName: "Leaf",
    color: "#00e5a0",
    synergy: {
      beginner: "KPV first reduces the inflammation that slows down healing. Then BPC-157 and TB-500 perform the core tissue repair work. Finally GHK-Cu rebuilds the structural collagen matrix. It's a phase-based model: clear → repair → rebuild — each compound designed to work in sequence rather than simultaneously.",
      expert: "KPV (alpha-MSH C-terminal tripeptide) engages MC1R and MC3R melanocortin receptors to inhibit IKKβ phosphorylation, blocking NF-κB nuclear translocation and suppressing IL-1β, TNF-α, and IL-6 transcription. This inflammatory clearance phase is hypothesized to reduce the inflammatory milieu that impairs growth factor receptor sensitivity. BPC-157 then activates GHR/VEGF/eNOS signaling in the cleared environment; TB-500 drives SDF-1/CXCR4-mediated progenitor recruitment. Finally GHK-Cu activates SP1-driven collagen I/III gene expression and MMP-1/TIMP balance for matrix remodeling. The research question is whether KPV's NF-κB suppression measurably improves the signal-to-noise ratio for BPC-157 and GHK-Cu's repair mechanisms.",
    },
  },

  {
    id: "immune-shield",
    category: "Immune",
    name: "Immune Shield",
    subtitle: "Adaptive Immunity and Antimicrobial Defense Stack",
    description: "A dual-layer immune research model combining Thymosin Alpha-1's adaptive immunity modulation with LL-37's innate antimicrobial and immunomodulatory activity. Studies complementary arms of the immune system.",
    longDescription: "Thymosin Alpha-1 (Tα1, thymalfasin) is a 28-amino acid thymic peptide that modulates adaptive immunity through dendritic cell maturation, T-cell differentiation (Th1 promotion over Th2), and NK cell activation. It has been studied for its ability to restore immune function in immunocompromised states and to enhance vaccine response. LL-37 is an endogenous cathelicidin host-defense peptide expressed by epithelial cells, neutrophils, and macrophages. Beyond its direct antimicrobial membrane disruption activity, LL-37 modulates innate immune signaling through TLR4 and FPRL1 receptors, promotes macrophage chemotaxis, and suppresses excessive inflammatory signaling. The pairing creates a research model for studying adaptive immune restoration (Thymosin Alpha-1) alongside innate immune modulation and antimicrobial defense (LL-37) as complementary arms of immunological competence.",
    peptides: [
      { name: "Thymosin Alpha-1", description: "Thymic peptide studied for dendritic cell maturation, Th1/Th2 T-cell balance modulation, and adaptive immune competence restoration" },
      { name: "LL-37", description: "Cathelicidin host-defense peptide studied for innate antimicrobial activity, TLR4 signaling modulation, and macrophage chemotaxis" },
    ],
    keyBenefits: [
      "Dual innate and adaptive immune pathway research",
      "T-cell differentiation and thymic signaling studies",
      "Cathelicidin antimicrobial and immunomodulatory investigation",
      "TLR4 signaling and innate immune activation modeling",
    ],
    researchApplications: [
      "Adaptive immune competence restoration research",
      "Cathelicidin host-defense peptide mechanism studies",
      "Innate-adaptive immune crosstalk investigation",
      "Immunodeficiency and immune modulation pathway modeling",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). Thymosin Alpha-1 is available as a lyophilized powder stable for extended periods under proper refrigeration. LL-37 should be reconstituted immediately before use as it may form aggregates over time. Protect both from freeze-thaw cycling.",
    educationLinks: [
      { peptideName: "Thymosin Alpha-1", articleUrl: "/guides/what-is-thymosin-alpha-1-peptide", articleTitle: "Thymosin Alpha-1: Adaptive Immunity Research" },
      { peptideName: "LL-37", articleUrl: "/guides/what-is-ll-37-peptide", articleTitle: "LL-37: Cathelicidin Host-Defense Research" },
    ],
    iconName: "FlaskConical",
    color: "#06b6d4",
    synergy: {
      beginner: "Thymosin Alpha-1 strengthens the adaptive immune system — the arm that learns to recognize and target specific threats. LL-37 bolsters the innate immune system — the rapid-response arm that attacks threats immediately without specific recognition. Together they study two different but complementary defense layers working in parallel.",
      expert: "Thymosin Alpha-1 drives dendritic cell maturation via IL-12 and IFN-α induction, promotes Th1 polarization over Th2 (reversing the Th2 skew seen in immunocompromised states), and activates NK cell cytotoxicity. LL-37 disrupts microbial membranes via amphipathic helix formation, activates TLR4 and FPRL1 on macrophages to promote chemotaxis and phagocytosis, and modulates LPS-induced TLR4 signaling (pro- or anti-inflammatory depending on context). The immunological research question: does Thymosin Alpha-1's Th1 polarization improve LL-37-mediated macrophage activation, and does LL-37's innate immune signaling provide the danger signals needed to prime Thymosin Alpha-1-driven adaptive immune responses?",
    },
  },

  {
    id: "gut-restore",
    category: "Recovery",
    name: "Gut Restore",
    subtitle: "Gut Lining Repair and NF-κB Inhibition Stack",
    description: "Targets gut barrier restoration from two mechanistic directions. BPC-157 drives mucosal repair and VEGF-mediated gut vascularization, while KPV inhibits NF-κB inflammatory signaling to resolve intestinal inflammation.",
    longDescription: "Gut barrier integrity depends on the simultaneous control of inflammation and active tissue repair — two processes that can antagonize each other when imbalanced. BPC-157 (Body Protection Compound-157) has been extensively studied in gastrointestinal models, where it upregulates growth hormone receptors on mucosal epithelial cells, promotes VEGF-driven gut vascularization, and demonstrates cytoprotective effects on gastric and intestinal epithelium. KPV (Lys-Pro-Val), the C-terminal tripeptide of alpha-MSH, has been studied for its ability to penetrate gut epithelial cells and inhibit IKKβ phosphorylation, blocking NF-κB nuclear translocation and reducing IL-1β, TNF-α, and IL-6 production in intestinal inflammation models. The pairing directly models the inflammation-repair balance: KPV controls the pro-inflammatory signal that perpetuates mucosal damage, while BPC-157 drives the repair cascade that restores barrier integrity.",
    peptides: [
      { name: "BPC-157", description: "Pentadecapeptide extensively studied in gastrointestinal models for mucosal repair, VEGF-driven gut vascularization, and cytoprotection" },
      { name: "KPV", description: "Alpha-MSH-derived tripeptide studied for NF-κB inhibition and pro-inflammatory cytokine suppression in intestinal inflammation models" },
    ],
    keyBenefits: [
      "Gut mucosal barrier repair and inflammatory resolution research",
      "NF-κB pathway inhibition in intestinal models",
      "VEGF-driven gut vascularization studies",
      "Inflammation-repair balance modeling in GI tissue",
    ],
    researchApplications: [
      "Gastrointestinal mucosal repair mechanism studies",
      "Intestinal NF-κB inflammatory signaling research",
      "Gut barrier integrity and permeability investigation",
      "Combined anti-inflammatory and repair pathway modeling",
    ],
    storageGuide: "Store at 2-8°C (36-46°F). BPC-157 is stable after reconstitution for several weeks refrigerated. KPV is a small tripeptide; reconstitute in sterile water immediately before use and store reconstituted solution for no more than a few days.",
    educationLinks: [
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
      { peptideName: "KPV", articleUrl: "/guides/what-is-kpv-peptide", articleTitle: "KPV: Anti-Inflammatory Melanocortin Tripeptide" },
    ],
    iconName: "Heart",
    color: "#f59e0b",
    synergy: {
      beginner: "BPC-157 is one of the most well-studied peptides for gut lining repair — it helps rebuild mucosal tissue and improves blood supply to the gut wall. KPV reduces the inflammatory signaling that keeps the gut in a damaged state. Together they study the two-sided repair challenge: BPC-157 rebuilds while KPV clears the inflammatory blockage to healing.",
      expert: "BPC-157 upregulates growth hormone receptors and VEGF on intestinal epithelial cells, drives eNOS-dependent nitric oxide production for mucosal protection, and activates FAK-paxillin and PI3K/Akt survival pathways. KPV penetrates intestinal epithelial cells (likely via PepT1 transporter) and inhibits IKKβ kinase, preventing NF-κB p65 translocation and reducing COX-2, IL-1β, TNF-α, and CXCL1 expression. The dual model addresses the vicious cycle of intestinal inflammation: NF-κB-driven cytokines perpetuate mucosal injury that BPC-157 is attempting to repair. KPV's NF-κB blockade is hypothesized to reduce the pro-inflammatory baseline and improve the efficacy of BPC-157's repair signaling.",
    },
  },

  {
    id: "neuro-stack",
    category: "Cognitive",
    name: "Neuro Stack",
    subtitle: "BDNF Upregulation and Neurotrophic Factor Stack",
    description: "A neuroprotective research pairing combining Semax's BDNF/NGF upregulation with Cerebrolysin's neurotrophic factor complex. Studies complementary mechanisms of neurotrophin delivery and neuroprotective signaling.",
    longDescription: "Semax is an ACTH(4-10) analog that upregulates the expression of Brain-Derived Neurotrophic Factor (BDNF) and Nerve Growth Factor (NGF) through melanocortin receptor activation and downstream cAMP/CREB signaling. It has been studied for neuroprotective effects in ischemia models and cognitive enhancement via increased neuroplasticity and synaptic density. Cerebrolysin is a standardized low-molecular-weight neuropeptide mixture derived from porcine brain protein hydrolysis. It contains a spectrum of endogenous neurotrophic factors and peptide fragments that have been studied for direct neurotrophic activity, anti-apoptotic signaling (via PI3K/Akt and MAPK/ERK pathways), and tau protein modulation. The pairing creates a research model for endogenous neurotrophin induction (Semax) versus exogenous neurotrophic factor supplementation (Cerebrolysin) — two distinct approaches to augmenting brain-derived neurotrophic support.",
    peptides: [
      { name: "Semax", description: "ACTH(4-10) analog studied for endogenous BDNF/NGF gene expression upregulation and melanocortin-mediated neuroprotection" },
      { name: "Cerebrolysin", description: "Standardized neuropeptide mixture studied for direct neurotrophic factor activity, anti-apoptotic signaling, and cognitive function in ischemia models" },
    ],
    keyBenefits: [
      "Dual endogenous and exogenous neurotrophin research",
      "BDNF and NGF expression pathway investigation",
      "Neuroprotective mechanism comparison studies",
      "Neuroplasticity and synaptic density research models",
    ],
    researchApplications: [
      "Melanocortin-mediated neurotrophin induction studies",
      "Exogenous neurotrophic factor efficacy research",
      "Neuroprotection in ischemia and neurodegeneration models",
      "BDNF pathway and cognitive function investigation",
    ],
    storageGuide: "Store Semax at 2-8°C (36-46°F) in lyophilized form; reconstitute with saline for intranasal administration. Cerebrolysin is typically supplied as a sterile injectable solution requiring intravenous administration under research conditions; refrigerate between 4-8°C.",
    educationLinks: [
      { peptideName: "Semax", articleUrl: "/guides/what-is-semax-peptide", articleTitle: "Semax: Cognitive Enhancement Research" },
      { peptideName: "Cerebrolysin", articleUrl: "/guides/what-is-cerebrolysin-peptide", articleTitle: "Cerebrolysin: Neurotrophic Factor Research" },
    ],
    iconName: "Brain",
    color: "#21d8ff",
    synergy: {
      beginner: "Semax tells the brain to produce more of its own growth factors (BDNF and NGF) — natural proteins that keep neurons alive and help them form new connections. Cerebrolysin delivers a cocktail of those same types of growth factors directly from outside the body. Together they study two routes to the same goal: inducing endogenous neurotrophin production (Semax) and supplementing with exogenous neurotrophic factors (Cerebrolysin).",
      expert: "Semax activates MC4R and MC5R melanocortin receptors, driving cAMP/CREB-dependent BDNF and NGF gene transcription while modulating serotonergic and dopaminergic tone. Cerebrolysin's active fractions include peptides homologous to BDNF, CNTF, and NGF that activate TrkB and TrkA neurotrophin receptors, engage PI3K/Akt (anti-apoptotic) and MAPK/ERK (synaptic plasticity) downstream signaling, and modulate APP processing and tau phosphorylation in neurodegenerative models. The research distinction: Semax drives de novo neurotrophin biosynthesis (gene induction); Cerebrolysin directly occupies neurotrophin receptors with preformed active peptides. The combined model studies whether receptor occupancy (Cerebrolysin) and induced endogenous synthesis (Semax) show additive or synergistic neuroprotective effects.",
    },
  },

  {
    id: "fat-burner",
    category: "Metabolic",
    name: "Fat Burner",
    subtitle: "Complementary Fat Metabolism Pathway Stack",
    description: "A two-compound metabolic research model targeting fat metabolism through distinct mechanisms. AOD-9604 activates GH fragment lipolytic signaling, while 5-Amino-1MQ inhibits NNMT enzyme activity to modulate the methionine cycle and fat metabolism.",
    longDescription: "AOD-9604 (Advanced Obesity Drug 9604) is a stabilized 16-amino acid fragment of human growth hormone (hGH 176-191) that has been studied for its ability to activate the GH receptor's fat-metabolizing domain without triggering the growth-promoting effects of full-length GH. It stimulates β-adrenergic fat cell lipolysis and inhibits lipogenesis through GH-related signaling without significant insulin-like effects. 5-Amino-1MQ is a small-molecule NNMT (nicotinamide N-methyltransferase) inhibitor that raises intracellular SAM (S-adenosylmethionine) availability by blocking 1-methylnicotinamide synthesis, creating a metabolic shift that promotes white adipose tissue browning and reduces lipid storage. The pairing creates a dual-mechanism fat metabolism research model: direct lipolytic receptor activation (AOD-9604) and enzyme inhibitor-mediated metabolic reprogramming (5-Amino-1MQ) — two non-overlapping fat metabolism pathways studied simultaneously.",
    peptides: [
      { name: "AOD-9604", description: "hGH 176-191 fragment studied for GH-related lipolytic receptor activation and lipogenesis inhibition without full-length GH effects" },
      { name: "5-Amino-1MQ", description: "NNMT enzyme inhibitor studied for SAM cycle modulation, white adipose browning, and lipid storage reduction" },
    ],
    keyBenefits: [
      "Dual-mechanism fat metabolism research model",
      "GH fragment lipolytic signaling investigation",
      "NNMT enzyme inhibition and methionine cycle modulation",
      "White adipose browning pathway studies",
    ],
    researchApplications: [
      "GH fragment receptor pharmacology studies",
      "NNMT inhibitor and adipose tissue browning research",
      "SAM cycle modulation and metabolic reprogramming investigation",
      "Non-overlapping fat oxidation pathway interaction modeling",
    ],
    storageGuide: "Store AOD-9604 at 2-8°C (36-46°F) in lyophilized form; reconstitute with bacteriostatic water. 5-Amino-1MQ is typically studied in oral formulations; store as directed by supplier at room temperature or refrigerated. Protect both from heat and light.",
    educationLinks: [
      { peptideName: "AOD-9604", articleUrl: "/guides/what-is-aod-9604-peptide", articleTitle: "AOD-9604: GH Fragment Lipolytic Research" },
      { peptideName: "5-Amino-1MQ", articleUrl: "/guides/what-is-5-amino-1mq-peptide", articleTitle: "5-Amino-1MQ: NNMT Inhibitor Research" },
    ],
    iconName: "Zap",
    color: "#f59e0b",
    synergy: {
      beginner: "AOD-9604 activates the specific part of the growth hormone receptor responsible for fat breakdown — without triggering the growth effects of full GH. 5-Amino-1MQ works completely differently: it blocks an enzyme that normally promotes fat storage and methyl group consumption, shifting cells toward fat burning. Two separate biological levers for fat metabolism, not competing with each other.",
      expert: "AOD-9604 (hGH 176-191) selectively activates GHR domains associated with adipocyte lipolysis (stimulating hormone-sensitive lipase and β-adrenergic signaling) and inhibits lipogenic enzyme activity, without engaging GHR domains responsible for IGF-1 induction or growth promotion. 5-Amino-1MQ inhibits NNMT, the enzyme that methylates nicotinamide to form 1-methylnicotinamide using SAM as methyl donor — its inhibition raises cellular SAM pools, which activates NNMT-dependent metabolic gene programs, promotes WAT browning (UCP1 expression), and reduces adipocyte lipid accumulation. The two compounds operate via entirely distinct molecular targets (GHR vs. NNMT), creating a non-competitive dual-pathway model for studying complementary mechanisms of fat oxidation and storage regulation.",
    },
  },

  {
    id: "gh-max",
    category: "GH Axis",
    name: "GH Max",
    subtitle: "Triple GHRH and GHRP Stimulation Stack",
    description: "A triple-compound GH axis research model combining two GHRH class analogs with one GHSR agonist. Studies maximum growth hormone axis stimulation through multi-receptor convergence and pharmacokinetic diversity.",
    longDescription: "GH Max assembles three compounds that act at distinct points of the growth hormone secretory axis. CJC-1295 is a long-acting GHRH analog with a modified sequence that resists DPP-IV cleavage, providing extended GHRHR occupancy. Sermorelin is the natural GHRH(1-29) sequence — the shortest biologically active GHRH fragment — providing a reference-compound GHRH signal with rapid clearance. Ipamorelin provides complementary GHSR-1a agonism, acting through a different intracellular pathway (Gq/PKC) than both GHRH analogs (Gs/cAMP). The three-compound model enables researchers to study multi-receptor GH axis activation: two pharmacokinetically distinct GHRH receptor agonists (CJC-1295 long-acting vs. Sermorelin short-acting) alongside a GHSR agonist, allowing investigation of sustained vs. pulsatile GHRH stimulation in the context of concurrent GHSR activation.",
    peptides: [
      { name: "CJC-1295", description: "DPP-IV-resistant GHRH analog studied for extended pituitary GHRH receptor occupancy and sustained GH pulse amplification" },
      { name: "Ipamorelin", description: "Selective GHSR-1a agonist studied for clean pulsatile GH induction via Gq/PKC pathway without off-target cortisol/prolactin effects" },
      { name: "Sermorelin", description: "Native GHRH(1-29) sequence studied as a reference compound for rapid-clearance GHRH receptor activation and pulsatile GH secretion" },
    ],
    keyBenefits: [
      "Triple-receptor convergence on the GH secretory axis",
      "Pharmacokinetically diverse GHRH stimulation research",
      "GHSR + GHRHR dual-pathway convergence modeling",
      "Pulsatile vs. sustained GH axis stimulation comparison",
    ],
    researchApplications: [
      "Multi-receptor GH axis pharmacology studies",
      "CJC-1295 vs. Sermorelin GHRH signal duration research",
      "GHSR-GHRHR convergence and GH output investigation",
      "Pituitary somatotroph response to combined secretagogue stimulation",
    ],
    storageGuide: "Store all three peptides at 2-8°C (36-46°F). Sermorelin has the shortest half-life (~10-20 min) and should be used promptly after reconstitution. CJC-1295 (No DAC) has a ~30 min half-life. Ipamorelin is stable for several weeks refrigerated after reconstitution.",
    educationLinks: [
      { peptideName: "CJC-1295", articleUrl: "/guides/what-is-cjc-1295-peptide", articleTitle: "CJC-1295: GHRH Analog Pharmacokinetics" },
      { peptideName: "Ipamorelin", articleUrl: "/guides/what-is-ipamorelin-peptide", articleTitle: "Ipamorelin: GHSR Agonist Research Guide" },
      { peptideName: "Sermorelin", articleUrl: "/guides/what-is-sermorelin-peptide", articleTitle: "Sermorelin: GHRH(1-29) Reference Compound Research" },
    ],
    iconName: "Zap",
    color: "#6366f1",
    badge: "Triple Action",
    badgeColor: "#6366f1",
    synergy: {
      beginner: "Sermorelin is the natural growth hormone releasing signal — short and fast. CJC-1295 is a stabilized version of the same signal that lasts longer. Ipamorelin uses a completely different receptor pathway to also trigger GH release. Together they activate the GH axis through three overlapping but distinct mechanisms, creating a research model for maximum GH output from multiple angles.",
      expert: "Sermorelin (GHRH 1-29) and CJC-1295 both act at pituitary GHRH receptors via Gs/adenylyl cyclase/cAMP/PKA, but with dramatically different half-lives (~10-20 min vs. ~30 min for No DAC form). Their pharmacokinetic contrast enables study of acute vs. sustained GHRHR occupancy in the same experiment. Ipamorelin acts at GHSR-1a via Gq/PLC/PKC/IP3/calcium cascade — a second intracellular pathway that synergizes with the GHRH Gs signal in somatotrophs. The three-compound model allows investigation of temporal GH axis dynamics: how does GHSR activation amplitude change as GHRHR is transitioning from Sermorelin's rapid peak to CJC-1295's extended plateau, and does the Gq+Gs convergence at the somatotroph level saturate beyond what two-compound GHRP/GHRH combinations achieve?",
    },
  },

  {
    id: "skin-renewal",
    category: "Skin",
    name: "Skin Renewal",
    subtitle: "Collagen Matrix Remodeling and Expression Line Reduction Stack",
    description: "An advanced dermatological research pairing combining GHK-Cu's broad collagen matrix remodeling activity with SNAP-8's SNARE complex inhibition for expression line reduction. Studies two distinct anti-aging skin mechanisms.",
    longDescription: "GHK-Cu (glycyl-L-histidyl-L-lysine copper(II)) is a naturally occurring copper tripeptide that has been studied for activating over 4,000 human genes relevant to skin biology, including upregulation of collagen I, III, and elastin, MMP-mediated ECM remodeling, and induction of antioxidant defense genes. SNAP-8 (acetyl glutamyl octapeptide-3) is a synthetic 8-amino acid peptide analog of the N-terminal domain of SNAP-25, the synaptic vesicle protein involved in neuromuscular junction signaling. By competing with endogenous SNAP-25 for SNARE complex formation, SNAP-8 modulates acetylcholine vesicle release at the dermal-muscle interface, studied as a potential mechanism for reducing repetitive muscle contraction-driven expression lines. Together they create a two-mechanism anti-aging research model: structural ECM repair and collagen regeneration (GHK-Cu) alongside neuromuscular junction signaling modulation for expression line reduction (SNAP-8).",
    peptides: [
      { name: "GHK-Cu", description: "Copper tripeptide studied for broad collagen/elastin synthesis activation, ECM remodeling, and antioxidant gene induction in skin models" },
      { name: "SNAP-8", description: "SNAP-25 analog studied for SNARE complex modulation and neuromuscular junction signaling relevant to expression line research" },
    ],
    keyBenefits: [
      "Dual-mechanism anti-aging skin research model",
      "Collagen and elastin matrix regeneration studies",
      "SNARE complex and neuromuscular junction signaling investigation",
      "ECM remodeling alongside expression line mechanism research",
    ],
    researchApplications: [
      "Topical collagen synthesis peptide pharmacology",
      "SNAP-25 competitive inhibition and neuromuscular signaling",
      "Expression line reduction mechanism investigation",
      "Combined structural and neuromuscular anti-aging pathway modeling",
    ],
    storageGuide: "Store GHK-Cu at 2-8°C (36-46°F) in amber vials away from light. SNAP-8 is a topical peptide typically supplied in cosmetic formulations; store at room temperature away from light and heat. Both are stable in formulation for extended periods under proper storage conditions.",
    educationLinks: [
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
      { peptideName: "SNAP-8", articleUrl: "/guides/what-is-snap-8-peptide", articleTitle: "SNAP-8: SNARE Complex Peptide Research" },
    ],
    iconName: "Sparkles",
    color: "#ec4899",
    synergy: {
      beginner: "GHK-Cu rebuilds the structural framework of skin — collagen, elastin, and the extracellular matrix that gives skin its firmness and elasticity. SNAP-8 works on a completely different system: it modulates the nerve-to-muscle signal that causes repetitive facial muscle contractions and expression lines. Together they target two separate causes of skin aging — structural degradation (GHK-Cu) and dynamic line formation (SNAP-8).",
      expert: "GHK-Cu activates SP1 transcription factor binding at collagen I and III gene promoters, induces MMP-1 and MMP-2 for senescent ECM removal, and upregulates antioxidant enzymes (SOD, catalase) while downregulating TGF-β1-mediated fibrotic pathways. SNAP-8 (acetyl-Glu-Glu-Met-Gln-Arg-Arg-Ala-Asp) mimics the N-terminal domain of SNAP-25 and competes for SNARE complex assembly, reducing the calcium-triggered fusion of acetylcholine vesicles at the neuromuscular junction — studied as a topical mechanism for relaxing the repetitive muscle contractions that form expression lines. The dual model addresses aging simultaneously at the ECM structural level (GHK-Cu → fibroblast collagen production) and the neuromuscular interface level (SNAP-8 → reduced muscle contraction frequency).",
    },
  },

  {
    id: "longevity-plus",
    category: "Longevity",
    name: "Longevity+",
    subtitle: "Telomerase Activation and Thymic Immune Restoration Stack",
    description: "Combines Epithalon's telomerase-based cellular rejuvenation with Thymalin's thymic peptide immune restoration. Studies two hallmarks of aging — telomere attrition and thymic involution — simultaneously.",
    longDescription: "Longevity+ is built around what researchers have described as the Russian longevity protocol, developed from decades of work on the pineal and thymic peptide systems by V.N. Khavinson and colleagues. Epithalon (Ala-Glu-Asp-Gly) was derived from the pineal gland extract epithalamin and has been studied for its ability to activate telomerase (hTERT), extend telomere length in cultured cells, normalize circadian gene expression, and modulate cortisol and melatonin rhythms in aging organisms. Thymalin is a polypeptide complex derived from thymus extract that has been studied for its ability to restore thymic hormone signaling (thymosin, thymulin) and reactivate cell-mediated immune competence in aging models where the thymus has involuted. Together they target two central hallmarks of organismal aging: replicative senescence via telomere erosion (Epithalon) and immunosenescence via thymic involution (Thymalin).",
    peptides: [
      { name: "Epithalon", description: "Synthetic pineal tetrapeptide studied for hTERT-mediated telomerase activation, telomere elongation, and circadian rhythm normalization" },
      { name: "Thymalin", description: "Thymic polypeptide complex studied for thymosin/thymulin restoration and cell-mediated immune competence in aging models" },
    ],
    keyBenefits: [
      "Dual hallmarks of aging research model",
      "Telomerase activation and telomere biology studies",
      "Thymic immune restoration mechanism investigation",
      "Replicative senescence and immunosenescence pathway research",
    ],
    researchApplications: [
      "hTERT expression and telomere length dynamics research",
      "Thymic involution and immune competence restoration studies",
      "Combined telomere and immune aging pathway investigation",
      "Pineal-thymic axis interaction research in aging models",
    ],
    storageGuide: "Store both peptides at 2-8°C (36-46°F) in lyophilized form. Epithalon is highly stable in dry form. Thymalin as a polypeptide complex should be reconstituted shortly before use. Protect from light and avoid freeze-thaw cycling after reconstitution.",
    educationLinks: [
      { peptideName: "Epithalon", articleUrl: "/guides/what-is-epithalon-peptide", articleTitle: "Epithalon: Telomerase Research Guide" },
      { peptideName: "Thymalin", articleUrl: "/guides/what-is-thymalin-peptide", articleTitle: "Thymalin: Thymic Peptide Longevity Research" },
    ],
    iconName: "Crown",
    color: "#a855f7",
    synergy: {
      beginner: "Epithalon targets the cellular clock — the telomeres that shorten each time a cell divides. By activating telomerase, it studies how to slow or reverse this countdown. Thymalin targets the immune system's headquarters — the thymus, which shrinks with age and leads to weaker immunity. Together they address two of the most studied mechanisms of biological aging at once.",
      expert: "Epithalon activates hTERT (telomerase reverse transcriptase) expression in somatic cells, studied for elongating telomere repeats (TTAGGG) to extend replicative lifespan; it also modulates BMAL1/CLOCK circadian gene expression and normalizes cortisol/melatonin rhythms relevant to cellular stress signaling. Thymalin's active fractions (including thymulin, thymosin α1, and thymopoietin-like peptides) restore thymic output of naive T-cells, improve IL-2 and IFN-γ production, and normalize NK cell cytotoxicity in immunosenescent models. The two-compound model maps to the intersection of two classic aging hallmarks: telomere attrition (Epithalon → hTERT → replicative capacity) and immunosenescence (Thymalin → thymic peptides → adaptive immune competence).",
    },
  },

  {
    id: "performance-stack",
    category: "GH Axis",
    name: "Performance",
    subtitle: "Direct IGF-1R Activation and Tissue Repair Stack",
    description: "Combines IGF-1 LR3's direct muscle-fiber IGF-1 receptor engagement with BPC-157's tissue repair and vascular signaling. Studies anabolic IGF-1R signaling alongside cytoprotective repair mechanisms in athletic tissue research models.",
    longDescription: "IGF-1 LR3 is a long-arginine-3 extended variant of insulin-like growth factor 1 with reduced affinity for insulin-like growth factor binding proteins (IGFBPs). Its reduced IGFBP binding results in prolonged free plasma bioavailability (~20-30 hours) compared to native IGF-1 (~15 minutes), allowing sustained engagement of IGF-1R on skeletal muscle, satellite cells, and connective tissue. IGF-1R activation drives PI3K/Akt/mTOR and MAPK/ERK pathways relevant to protein synthesis and myogenic differentiation. BPC-157 complements this through distinct mechanisms: VEGF-driven angiogenesis for tissue perfusion, GHR upregulation for improved GH signal sensitivity, and FAK/paxillin-mediated cytoprotection. The pairing creates a research model for studying direct anabolic receptor signaling (IGF-1 LR3 → IGF-1R) alongside the vascular and cytoprotective environment that supports tissue adaptation (BPC-157).",
    peptides: [
      { name: "IGF-1 LR3", description: "Extended-half-life IGF-1 analog studied for direct IGF-1R engagement, PI3K/Akt/mTOR activation, and satellite cell-mediated myogenic signaling" },
      { name: "BPC-157", description: "Pentadecapeptide studied for VEGF angiogenesis, GHR upregulation, and cytoprotective signaling in tissue repair and adaptation models" },
    ],
    keyBenefits: [
      "Direct IGF-1R anabolic pathway activation research",
      "VEGF-driven tissue vascularization alongside anabolic signaling",
      "GHR sensitization and IGF-1 axis interaction studies",
      "Satellite cell activation and cytoprotective mechanism investigation",
    ],
    researchApplications: [
      "IGF-1R receptor pharmacology and anabolic pathway studies",
      "PI3K/Akt/mTOR signaling in skeletal muscle research",
      "VEGF-driven angiogenesis and tissue perfusion investigation",
      "Combined anabolic and repair mechanism interaction modeling",
    ],
    storageGuide: "Store both peptides at 2-8°C (36-46°F). IGF-1 LR3 should be reconstituted with dilute acetic acid (0.1% AcOH) rather than bacteriostatic water to maintain solubility; store reconstituted solution refrigerated and use within 1-2 weeks. BPC-157 is more stable after reconstitution.",
    educationLinks: [
      { peptideName: "IGF-1 LR3", articleUrl: "/guides/what-is-igf-1-lr3-peptide", articleTitle: "IGF-1 LR3: Extended-Half-Life IGF-1R Analog Research" },
      { peptideName: "BPC-157", articleUrl: "/guides/what-is-bpc-157-peptide", articleTitle: "BPC-157: Comprehensive Research Guide" },
    ],
    iconName: "Dumbbell",
    color: "#f97316",
    synergy: {
      beginner: "IGF-1 LR3 directly activates the receptor that drives muscle growth and repair — it is essentially a more bioavailable version of the body's primary growth factor. BPC-157 improves the blood supply to muscle tissue and increases the tissue's sensitivity to growth hormone signals. Together they study the combination of a direct anabolic signal (IGF-1 LR3) with the vascular and hormonal environment that determines how well that signal is received (BPC-157).",
      expert: "IGF-1 LR3 engages IGF-1R with reduced IGFBP-3 sequestration (~500-fold lower IGFBP affinity than native IGF-1), extending free plasma half-life to ~20-30 hours. IGF-1R activation drives PI3K/Akt/mTOR for protein synthesis and muscle hypertrophy, and MAPK/ERK for satellite cell proliferation and myogenic differentiation. BPC-157 upregulates GHR (sensitizing tissue to circulating GH and IGF-1), activates VEGF/eNOS to improve oxygen and nutrient delivery to IGF-1R-expressing cells, and engages FAK/paxillin for cytoskeletal repair. The interaction of interest: does BPC-157's GHR upregulation meaningfully enhance IGF-1 LR3 activity through cross-receptor sensitization, and does the improved vascularization allow higher local concentrations of the long-acting IGF-1 analog in target tissue?",
    },
  },

  {
    id: "nad-mito-stack",
    category: "Longevity",
    name: "NAD+ Mito Stack",
    subtitle: "NAD+ Restoration and Cardiolipin Stabilization Stack",
    description: "A dual mitochondrial rescue research model combining NAD+ precursor-mediated sirtuin and PARP activation with SS-31's cardiolipin-targeted mitochondrial membrane stabilization.",
    longDescription: "Mitochondrial dysfunction is a central hallmark of cellular aging and metabolic disease, characterized by declining NAD+ pools, impaired electron transport chain efficiency, and cardiolipin peroxidation. NAD+ Precursor (nicotinamide riboside or nicotinamide mononucleotide) is studied for its ability to restore intracellular NAD+ levels through the NAD+ salvage pathway, activating SIRT1/3 deacetylases and PARP1 DNA repair enzymes that depend on NAD+ as a substrate. SS-31 (elamipretide) is a Szeto-Schiller tetrapeptide (D-Arg-Dmt-Lys-Phe-NH2) with a dimethyltyrosine residue that specifically binds cardiolipin — the signature phospholipid of the inner mitochondrial membrane. Cardiolipin binding reduces cytochrome c peroxidase activity, preventing cardiolipin peroxidation and stabilizing the electron transport chain supercomplexes. Together they address mitochondrial dysfunction from complementary angles: NAD+ restoration for energetic substrate replenishment (NAD+ Precursor) and structural membrane stabilization for electron transport chain efficiency (SS-31).",
    peptides: [
      { name: "NAD+ Precursor", description: "NAD+ salvage pathway substrate studied for intracellular NAD+ restoration, SIRT1/3 activation, and PARP1-mediated DNA repair" },
      { name: "SS-31", description: "Cardiolipin-binding mitochondrial tetrapeptide studied for inner membrane stabilization, electron transport chain efficiency, and cytochrome c peroxidase inhibition" },
    ],
    keyBenefits: [
      "Dual mitochondrial rescue mechanism research",
      "NAD+ pool restoration and sirtuin pathway studies",
      "Cardiolipin-targeted inner membrane stabilization investigation",
      "Electron transport chain efficiency modeling",
    ],
    researchApplications: [
      "Mitochondrial NAD+ metabolism and sirtuin activation research",
      "Cardiolipin biology and inner membrane integrity studies",
      "ETC supercomplex stability and bioenergetic efficiency investigation",
      "Combined NAD+ and mitochondrial membrane rescue modeling",
    ],
    storageGuide: "Store NAD+ Precursor (NR or NMN) in sealed containers at room temperature away from moisture and heat; refrigerate for longer storage. Store SS-31 at 2-8°C (36-46°F) in lyophilized form and reconstitute with saline or bacteriostatic water before use. Protect both from light.",
    educationLinks: [
      { peptideName: "NAD+ Precursor", articleUrl: "/guides/what-is-nad-precursor-peptide", articleTitle: "NAD+ Precursors: Mitochondrial Research Guide" },
      { peptideName: "SS-31", articleUrl: "/guides/what-is-ss-31-peptide", articleTitle: "SS-31: Cardiolipin-Targeted Mitochondrial Research" },
    ],
    iconName: "Zap",
    color: "#f59e0b",
    badge: "Bioenergetics",
    badgeColor: "#f59e0b",
    synergy: {
      beginner: "NAD+ Precursor refills the cellular fuel that mitochondria need to run the energy production cycle — particularly the sirtuins, which protect cells and DNA. SS-31 patches the mitochondria's inner membrane from the outside, preventing the oxidative damage that disrupts energy production. One replenishes fuel (NAD+), the other repairs the engine (cardiolipin stabilization).",
      expert: "NAD+ precursors (NR/NMN) are phosphorylated and adenylated via NMRK and NMNAT enzymes to replenish intracellular NAD+ pools, activating SIRT1/SIRT3 deacetylases (which regulate mitochondrial biogenesis via PGC-1α deacetylation), SIRT5 (succinylation/malonylation of ETC proteins), and PARP1 DNA repair. SS-31 binds cardiolipin's phosphate head groups via its basic residues (D-Arg, Lys) while dimethyltyrosine inserts into the hydrophobic cardiolipin acyl chains, preventing cytochrome c from using cardiolipin as a peroxidase substrate — preserving cardiolipin integrity and preventing ETC supercomplex (I-III-IV) dissociation. The complementary mechanism: NAD+ restoration addresses the energetic substrate deficit (NAD+/NADH ratio), while SS-31 stabilizes the physical electron transport chain architecture — two independent drivers of mitochondrial dysfunction addressed simultaneously.",
    },
  },

  {
    id: "cellular-longevity",
    category: "Longevity",
    name: "Cellular Longevity",
    subtitle: "NAD+ Sirtuin Activation and Telomerase Extension Stack",
    description: "A two-hallmark aging research model combining NAD+ precursor-driven sirtuin activation with Epithalon's telomerase-mediated telomere maintenance. Studies NAD+ metabolism and telomere biology as complementary aging pathways.",
    longDescription: "Two of the nine recognized hallmarks of aging — epigenetic alterations and telomere attrition — are directly connected through NAD+-dependent sirtuin biology. NAD+ Precursor restores cellular NAD+ pools, activating SIRT1, SIRT6, and SIRT7 — sirtuins with direct roles in histone deacetylation (epigenetic maintenance), DNA double-strand break repair, and, through SIRT1/6, indirect modulation of telomere-associated chromatin structure. Epithalon directly activates hTERT expression, the catalytic subunit of telomerase, to extend telomere repeats and delay replicative senescence. The pairing creates a research model for studying the convergence of two aging pathways: whether NAD+-dependent SIRT6 activity (which regulates telomere chromatin accessibility) acts as an upstream enabler of telomerase function, and whether Epithalon's telomere extension changes the epigenetic aging trajectory independently measurable through NAD+ metabolomics.",
    peptides: [
      { name: "NAD+ Precursor", description: "NAD+ salvage pathway substrate studied for SIRT1/SIRT6/SIRT7 sirtuin activation, epigenetic maintenance, and DNA repair pathway modulation" },
      { name: "Epithalon", description: "Synthetic pineal tetrapeptide studied for hTERT-mediated telomerase activation and telomere length maintenance in aging cell models" },
    ],
    keyBenefits: [
      "Dual aging hallmark research model (NAD+ + telomere)",
      "Sirtuin pathway and NAD+ metabolism studies",
      "Telomerase activation and replicative senescence research",
      "SIRT6 chromatin and telomere interaction investigation",
    ],
    researchApplications: [
      "NAD+-dependent sirtuin epigenetics research",
      "Telomere biology and hTERT expression studies",
      "SIRT6-telomere chromatin accessibility investigation",
      "Combined NAD+ metabolism and telomere aging pathway modeling",
    ],
    storageGuide: "Store NAD+ Precursor at room temperature in sealed containers away from moisture; refrigerate for longer-term storage. Store Epithalon at 2-8°C (36-46°F) in lyophilized form. Both are stable for extended periods under proper conditions.",
    educationLinks: [
      { peptideName: "NAD+ Precursor", articleUrl: "/guides/what-is-nad-precursor-peptide", articleTitle: "NAD+ Precursors: Mitochondrial Research Guide" },
      { peptideName: "Epithalon", articleUrl: "/guides/what-is-epithalon-peptide", articleTitle: "Epithalon: Telomerase Research Guide" },
    ],
    iconName: "Crown",
    color: "#a855f7",
    synergy: {
      beginner: "NAD+ is the fuel that powers sirtuins — the proteins that maintain epigenetic stability and DNA repair as cells age. Epithalon activates telomerase, the enzyme that rebuilds the protective caps on chromosomes that shorten with each cell division. Together they study two of the most fundamental mechanisms of cellular aging: the epigenetic maintenance system (NAD+/sirtuins) and the replicative clock (Epithalon/telomeres).",
      expert: "NAD+ precursors restore SIRT1, SIRT6, and SIRT7 activity — SIRT6 in particular deacetylates H3K9 and H3K56 at telomere-adjacent chromatin, maintaining telomere heterochromatin structure and facilitating WRN helicase activity during telomere replication. SIRT1 deacetylates and activates FOXO3a and p53 to suppress telomere-dysfunction-induced apoptosis. Epithalon induces hTERT transcription and activates the ribonucleoprotein telomerase holoenzyme to add TTAGGG repeats. The mechanistic convergence: SIRT6-mediated telomere chromatin accessibility may enable or constrain hTERT access to telomere 3'-overhangs — meaning NAD+-dependent SIRT6 activity could be an upstream determinant of how effectively Epithalon-induced hTERT can extend telomeres in a given epigenetic context.",
    },
  },

  {
    id: "nad-energy-stack",
    category: "Metabolic",
    name: "NAD+ Energy",
    subtitle: "NAD+ Salvage Pathway and AMPK Mitochondrial Biogenesis Stack",
    description: "A cellular energy amplification research model combining NAD+ precursor-driven salvage pathway activation with MOTS-C's AMPK-mediated mitochondrial biogenesis. Studies two complementary approaches to mitochondrial energy production.",
    longDescription: "Cellular energy decline — manifesting as reduced mitochondrial function, lower NAD+/NADH ratios, and impaired substrate oxidation — is a hallmark of metabolic aging. NAD+ Precursor (NR or NMN) enters the NAD+ salvage pathway to restore depleted NAD+ pools, activating sirtuins that deacetylate PGC-1α (promoting mitochondrial biogenesis) and ETC proteins (improving oxidative phosphorylation efficiency). MOTS-C is a 16-amino acid mitochondrial-encoded peptide that activates AMPK through the AICAR/folate cycle intersection, independently driving PGC-1α-mediated mitochondrial biogenesis and improving glucose uptake and fatty acid β-oxidation. Both compounds promote mitochondrial biogenesis through PGC-1α but via distinct upstream mechanisms — NAD+/SIRT1 deacetylation versus AMPK phosphorylation — creating a research model for studying whether these two PGC-1α activation pathways are additive, synergistic, or capable of saturating the same transcriptional output.",
    peptides: [
      { name: "NAD+ Precursor", description: "NAD+ salvage pathway substrate studied for SIRT1/SIRT3 activation, PGC-1α deacetylation, and mitochondrial biogenesis signaling" },
      { name: "MOTS-C", description: "Mitochondrial-derived peptide studied for AMPK activation, AICAR pathway engagement, and PGC-1α-driven mitochondrial biogenesis" },
    ],
    keyBenefits: [
      "Dual PGC-1α activation pathway research",
      "NAD+ metabolism and mitochondrial biogenesis studies",
      "AMPK pathway and cellular energy regulation investigation",
      "Complementary mitochondrial energy amplification modeling",
    ],
    researchApplications: [
      "NAD+/SIRT1/PGC-1α signaling cascade studies",
      "MOTS-C AMPK activation and biogenesis research",
      "Mitochondrial biogenesis mechanism comparison investigation",
      "Combined NAD+ and mitochondrial peptide energy pathway modeling",
    ],
    storageGuide: "Store NAD+ Precursor in a cool, dry place away from moisture. Store MOTS-C at 2-8°C (36-46°F) in lyophilized form. Reconstitute MOTS-C with bacteriostatic water immediately before use.",
    educationLinks: [
      { peptideName: "NAD+ Precursor", articleUrl: "/guides/what-is-nad-precursor-peptide", articleTitle: "NAD+ Precursors: Mitochondrial Research Guide" },
      { peptideName: "MOTS-C", articleUrl: "/guides/what-is-mots-c-peptide", articleTitle: "MOTS-C: Mitochondrial Pathway Research" },
    ],
    iconName: "Zap",
    color: "#E7FB10",
    synergy: {
      beginner: "NAD+ Precursor refills the fuel (NAD+) that powers the cellular engines that build more mitochondria. MOTS-C sends a different signal — through AMPK — that also tells cells to build more mitochondria. Both ultimately drive the same outcome (more and better mitochondria) but through separate molecular pathways, making this a classic synergy research model: two roads to the same destination.",
      expert: "NAD+ precursors elevate the NAD+/NADH ratio, activating SIRT1 which deacetylates and activates PGC-1α (the master regulator of mitochondrial biogenesis), driving TFAM, NRF1, and NRF2 transcription of mitochondrial genes. MOTS-C engages the folate-AICAR metabolic junction: it inhibits the folate cycle enzyme MTHFD2, causing AICAR (5-aminoimidazole-4-carboxamide ribonucleotide) accumulation, which in turn activates AMPK (via the same site as the AMPK activator AICAR/acadesine). AMPK phosphorylates and activates PGC-1α at Thr177/Ser538. Both compounds converge on PGC-1α through SIRT1 deacetylation (NAD+) and AMPK phosphorylation (MOTS-C) — post-translational modifications that are known to be additive in some cell models, creating a research question about whether their combined activation saturates PGC-1α activity or provides independent transcriptional amplification.",
    },
  },

  {
    id: "cellular-defense",
    category: "Longevity",
    name: "Cellular Defense",
    subtitle: "NAD+ DNA Repair and Antioxidant Defense Stack",
    description: "A dual cellular protection research model combining NAD+ precursor-driven PARP1 DNA repair with Glutathione's role as the master intracellular antioxidant. Studies two complementary cellular damage defense systems.",
    longDescription: "Cellular damage accumulates through two major mechanisms that are interconnected: DNA strand breaks and oxidative stress. NAD+ Precursor restores the NAD+ pool required by PARP1 (poly ADP-ribose polymerase 1), the primary enzyme responsible for detecting and initiating repair of single-strand DNA breaks through base excision repair. PARP1 consumes NAD+ during repair activity, and chronically elevated DNA damage can deplete NAD+ pools — creating a feedback loop that impairs both repair and mitochondrial function. Glutathione (GSH) is the most abundant intracellular antioxidant tripeptide (Glu-Cys-Gly), responsible for neutralizing reactive oxygen species, maintaining the GSH/GSSG redox ratio, and supporting glutathione peroxidase and glutathione S-transferase enzyme systems. By restoring intracellular glutathione levels, this component of the stack addresses the oxidative stress that generates the DNA strand breaks that PARP1 (NAD+ Precursor) must repair — creating a research model for studying the NAD+-DNA repair / antioxidant defense feedback cycle.",
    peptides: [
      { name: "NAD+ Precursor", description: "NAD+ salvage pathway substrate studied for PARP1 DNA repair activation, NAD+ pool restoration, and oxidative stress-induced NAD+ depletion recovery" },
      { name: "Glutathione", description: "Master intracellular antioxidant tripeptide studied for ROS neutralization, GSH/GSSG redox ratio maintenance, and oxidative DNA damage prevention" },
    ],
    keyBenefits: [
      "Dual DNA repair and antioxidant defense research",
      "NAD+/PARP1 base excision repair pathway studies",
      "GSH/GSSG redox ratio and ROS neutralization investigation",
      "DNA damage-oxidative stress feedback cycle modeling",
    ],
    researchApplications: [
      "PARP1-mediated DNA repair and NAD+ consumption studies",
      "Glutathione redox system and antioxidant enzyme research",
      "Oxidative stress-to-DNA damage cascade investigation",
      "NAD+ depletion-antioxidant interaction pathway modeling",
    ],
    storageGuide: "Store NAD+ Precursor in sealed containers away from moisture at room temperature or refrigerated. Glutathione (reduced form, GSH) is highly sensitive to oxidation; store lyophilized powder in sealed containers with desiccant, refrigerated. Reconstitute in saline immediately before use and use promptly.",
    educationLinks: [
      { peptideName: "NAD+ Precursor", articleUrl: "/guides/what-is-nad-precursor-peptide", articleTitle: "NAD+ Precursors: Mitochondrial Research Guide" },
      { peptideName: "Glutathione", articleUrl: "/guides/what-is-glutathione-peptide", articleTitle: "Glutathione: Master Antioxidant Research" },
    ],
    iconName: "FlaskConical",
    color: "#22c55e",
    synergy: {
      beginner: "DNA breaks and oxidative stress are two causes of cellular aging that feed each other: more oxidative stress causes more DNA breaks, and fixing those breaks burns through NAD+ which reduces the cell's ability to combat oxidative stress. NAD+ Precursor restores the repair fuel, and Glutathione neutralizes the oxidative stress before it creates the breaks. Together they address both sides of the oxidative-DNA damage cycle.",
      expert: "PARP1 detects DNA single-strand breaks and synthesizes poly-ADP-ribose chains using NAD+ as substrate, consuming 4 NAD+ molecules per ADP-ribose unit during repair — high DNA damage loads can deplete NAD+ 2-4 fold, impairing mitochondrial SIRT3/SIRT1 function and accelerating aging phenotypes. NAD+ Precursor (NR/NMN) replenishes NAD+ through NAMPT and NMRK salvage kinases, restoring PARP1 activity. Reduced Glutathione (GSH) neutralizes H₂O₂, lipid peroxides, and electrophilic metabolites via GPX and GST enzymes, and maintains the cellular GSH/GSSG ratio (≥10:1 in healthy cells) — reducing the oxidative DNA damage burden that drives PARP1 NAD+ consumption. The research question: does GSH supplementation measurably reduce the rate of NAD+ consumption by PARP1 by decreasing oxidative DNA damage frequency, creating a functionally cooperative cellular protection model?",
    },
  },

  {
    id: "regen-glow",
    category: "Skin",
    name: "Regen Glow",
    subtitle: "Anti-Inflammatory Healing and Collagen Remodeling Stack",
    description: "Combines the KLOW Peptide Complex's multi-constituent anti-inflammatory and repair activity with GHK-Cu's copper peptide collagen matrix remodeling. Studies a repair-to-renewal pipeline across inflammation resolution and structural remodeling.",
    longDescription: "Regen Glow pairs a multi-peptide proprietary complex with a well-characterized single copper peptide to study how a broad-spectrum inflammatory-repair blend interacts with targeted collagen matrix remodeling. The KLOW Peptide Complex is a proprietary multi-peptide formulation whose constituent peptide classes span plasma half-lives from ~30 minutes (KPV-class anti-inflammatory tripeptides) to ~4 hours (BPC-157-class cytoprotective compounds) to ~24 hours (GHK-Cu-class copper peptides). It is studied for coordinated inflammation resolution, tissue repair signaling, and early-stage collagen remodeling. GHK-Cu (glycyl-L-histidyl-L-lysine copper(II)) adds a focused, well-characterized collagen matrix remodeling signal: SP1-driven collagen I and III synthesis, MMP/TIMP balance for ECM remodeling, and antioxidant gene activation. The pairing creates a research model for studying how a composite repair blend interacts with a single well-defined remodeling agent when introduced together.",
    peptides: [
      { name: "KLOW Peptide Complex", description: "Proprietary multi-peptide blend studied for coordinated anti-inflammatory signaling, tissue repair, and early collagen remodeling across a composite pharmacokinetic window" },
      { name: "GHK-Cu", description: "Copper tripeptide studied for SP1-driven collagen I/III synthesis, MMP/TIMP ECM balance, and antioxidant gene induction" },
    ],
    keyBenefits: [
      "Composite repair-to-remodeling pipeline research",
      "Multi-constituent inflammatory resolution alongside collagen synthesis",
      "Pharmacokinetically diverse repair blend interaction studies",
      "ECM remodeling and structural matrix research",
    ],
    researchApplications: [
      "Multi-peptide complex and defined single-peptide interaction research",
      "Inflammation resolution and collagen matrix synthesis studies",
      "GHK-Cu activity in the context of a composite peptide environment",
      "Repair-to-renewal cascade mechanism investigation",
    ],
    storageGuide: "Store GHK-Cu at 2-8°C (36-46°F) in amber vials away from light. Store the KLOW Peptide Complex as directed by the supplier — typically refrigerated in original sealed packaging. Reconstitute each component separately with bacteriostatic water.",
    educationLinks: [
      { peptideName: "GHK-Cu", articleUrl: "/guides/what-is-ghk-cu-peptide", articleTitle: "GHK-Cu: Copper Peptide Skin Research" },
    ],
    iconName: "Heart",
    color: "#22c55e",
    synergy: {
      beginner: "The KLOW Peptide Complex works across multiple phases simultaneously — resolving inflammation, repairing tissue, and beginning collagen remodeling over a composite pharmacokinetic window. GHK-Cu then adds a targeted, well-characterized collagen synthesis signal on top. Together they create a research model for what happens when a broad multi-mechanism repair blend works alongside a specific collagen remodeling compound.",
      expert: "The KLOW Peptide Complex's constituent peptide classes operate across a composite PK window: KPV-class tripeptides (~30-60 min) for early NF-κB suppression, BPC-157-class compounds (~4 h) for VEGF/GHR-mediated repair, and GHK-Cu-class copper peptides (~24 h) for delayed ECM remodeling. Adding discrete GHK-Cu alongside the complex creates a research question about the dose-response relationship between copper peptide concentration and collagen synthesis output — specifically, whether additional GHK-Cu above the concentration present within the complex meaningfully increases SP1 activation at collagen gene promoters, or whether the complex's intrinsic GHK-Cu class content already saturates that pathway in the model system under study.",
    },
  },
];

export const RESEARCH_STACKS_BY_ID: Record<string, ResearchStackData> = Object.fromEntries(
  RESEARCH_STACKS_DATA.map((s) => [s.id, s])
);
