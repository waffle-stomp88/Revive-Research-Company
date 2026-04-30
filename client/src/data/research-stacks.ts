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

export type StackCategory = "Recovery" | "Cognitive" | "Metabolic" | "GH Axis" | "Longevity" | "Skin";

export const STACK_CATEGORIES: StackCategory[] = [
  "Recovery",
  "Cognitive",
  "Metabolic",
  "GH Axis",
  "Longevity",
  "Skin",
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
];

export const RESEARCH_STACKS_BY_ID: Record<string, ResearchStackData> = Object.fromEntries(
  RESEARCH_STACKS_DATA.map((s) => [s.id, s])
);
