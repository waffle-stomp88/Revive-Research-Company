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

export type StackCategory = "Recovery" | "Cognitive" | "Metabolic" | "GH Axis" | "Longevity" | "Skin" | "Hormonal";

export const STACK_CATEGORIES: StackCategory[] = [
  "Recovery",
  "Cognitive",
  "Metabolic",
  "GH Axis",
  "Longevity",
  "Skin",
  "Hormonal",
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
  {
    id: "melanocortin-arousal-stack",
    category: "Hormonal",
    name: "Melanocortin Arousal & Bonding Stack",
    subtitle: "MC4R + Oxytocin Pathway Research Model",
    description: "A two-compound hormonal research model targeting sexual arousal and social bonding through independent but convergent neuroendocrine pathways. PT-141 activates melanocortin receptors in the CNS, while Oxytocin modulates hypothalamic bonding and reward circuitry.",
    longDescription: "PT-141 (Bremelanotide) is a cyclic heptapeptide melanocortin receptor agonist with selectivity for MC3R and MC4R subtypes expressed in the hypothalamus and spinal cord. Unlike PDE5 inhibitors, PT-141 acts centrally on CNS arousal circuits rather than peripheral vascular tissue, making it a unique model for studying melanocortin-mediated sexual response independent of gonadal hormone levels. Oxytocin is a nonapeptide synthesized in hypothalamic paraventricular and supraoptic nuclei and released from the posterior pituitary. It acts on oxytocin receptors (OXTR) in the limbic system, nucleus accumbens, and ventral tegmental area to modulate pair-bonding, social reward, and prosocial behavior. Research models combining PT-141 and Oxytocin investigate how melanocortin-mediated arousal signaling interacts with oxytocinergic bonding and reward pathways — two neurochemically distinct but functionally complementary axes of human social and sexual behavior.",
    peptides: [
      { name: "PT-141", description: "Cyclic melanocortin receptor agonist (MC3R/MC4R) studied for CNS arousal pathway activation independent of peripheral vascular mechanisms" },
      { name: "Oxytocin", description: "Hypothalamic nonapeptide studied for OXTR-mediated social bonding, reward circuitry modulation, and prosocial behavior mechanisms" },
    ],
    keyBenefits: [
      "Dual-pathway melanocortin and oxytocinergic signaling research",
      "CNS arousal circuit activation investigation",
      "Social bonding and reward pathway interaction studies",
      "Neuroendocrine model independent of gonadal hormone status",
    ],
    researchApplications: [
      "Melanocortin receptor pharmacology and CNS arousal studies",
      "Oxytocinergic bonding and limbic reward circuit research",
      "Neuroendocrine cross-talk in social and sexual behavior models",
      "MC4R agonist interaction with hypothalamic neuropeptide systems",
    ],
    storageGuide: "Store PT-141 lyophilized powder at 2-8°C (36-46°F); reconstitute with bacteriostatic water and use within recommended timeframes. Store Oxytocin peptide refrigerated and protected from light; avoid repeated freeze-thaw cycles.",
    educationLinks: [
      { peptideName: "PT-141", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: Melanocortin & HPG Axis Research" },
      { peptideName: "Oxytocin", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: Oxytocinergic Bonding Pathways" },
    ],
    iconName: "Heart",
    color: "#f43f5e",
    badge: "Hormonal",
    badgeColor: "#f43f5e",
    synergy: {
      beginner: "PT-141 activates specific receptors in the brain that switch on arousal signals — completely separate from how blood flow medications work. Oxytocin is often called the 'bonding molecule' and works through a different set of brain receptors tied to trust, social closeness, and reward. Together they allow researchers to study how the brain's arousal system and bonding system interact and potentially reinforce each other.",
      expert: "PT-141 (Bremelanotide) agonizes hypothalamic and spinal MC3R/MC4R, activating downstream cAMP/PKA pathways that modulate dopaminergic and serotonergic arousal circuits without peripheral vascular involvement. Oxytocin binds OXTR (a Gq-coupled GPCR) in limbic structures including the nucleus accumbens and VTA, potentiating dopamine release and modulating GABAergic inhibition in reward circuitry. The convergence point is mesolimbic dopamine signaling: MC4R activation disinhibits dopaminergic neurons while OXTR activation directly potentiates VTA dopamine release — creating a synergistic amplification of central reward and arousal signaling through complementary receptor systems that share no direct ligand competition.",
    },
  },
  {
    id: "gonadorelin-kisspeptin-hpg-cascade",
    category: "Hormonal",
    name: "HPG Cascade Priming Stack",
    subtitle: "Gonadorelin + Kisspeptin-10 Upstream Relay Model",
    description: "A two-tier research model of the hypothalamic-pituitary-gonadal cascade. Kisspeptin-10 acts as the upstream trigger, stimulating GnRH neuron firing via KISS1R, while Gonadorelin directly provides the resulting GnRH signal — allowing researchers to study both the initiating relay and its direct downstream output in a single experimental model.",
    longDescription: "Kisspeptin-10 is the C-terminal decapeptide of the KISS1 gene product and the endogenous obligate activator of GnRH neurons. It binds the kisspeptin receptor (KISS1R / GPR54) on hypothalamic GnRH neurons in the arcuate and anteroventral periventricular nuclei, triggering membrane depolarization via TRPC channels and initiating pulsatile GnRH release into the hypophyseal portal circulation. Gonadorelin is a synthetic decapeptide identical in sequence to endogenous GnRH (gonadotropin-releasing hormone). It acts directly on GnRH receptors (GnRHR — a Gq-coupled GPCR) in pituitary gonadotroph cells, stimulating PLC/IP3-mediated calcium mobilization and subsequent LH and FSH secretion. This stack positions the two compounds at adjacent rungs of the same neuroendocrine ladder: Kisspeptin-10 at the hypothalamic trigger level and Gonadorelin at the pituitary receptor level. Researchers use this combination to dissect the KISS1R–GnRH neuron–GnRHR signaling relay, model pulsatile gonadotropin secretion dynamics, and investigate how upstream kisspeptin tone translates to downstream pituitary output through physiologically distinct receptor systems.",
    peptides: [
      { name: "Kisspeptin-10", description: "KISS1R agonist studied for endogenous GnRH neuron activation and pulsatile hypothalamic relay triggering" },
      { name: "Gonadorelin", description: "Synthetic GnRH decapeptide studied for direct pituitary GnRHR activation and gonadotropin (LH/FSH) secretion dynamics" },
    ],
    keyBenefits: [
      "Two-tier HPG cascade research — upstream trigger and direct pituitary output in one model",
      "KISS1R-to-GnRHR relay dissection",
      "Pulsatile LH and FSH secretion dynamics investigation",
      "Physiologically sequential neuroendocrine signaling study",
    ],
    researchApplications: [
      "Kisspeptin–GnRH neuron–pituitary axis relay mapping",
      "Gonadotropin pulse amplitude and frequency modeling",
      "HPG axis pharmacology and receptor-level interrogation",
      "Reproductive neuroendocrinology signaling cascade studies",
    ],
    storageGuide: "Store Kisspeptin-10 and Gonadorelin lyophilized at 2–8°C (36–46°F). Reconstitute with bacteriostatic water. Both peptides are sensitive to proteolytic degradation; avoid repeated freeze-thaw cycles and minimize ambient exposure after reconstitution.",
    educationLinks: [
      { peptideName: "Kisspeptin-10", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: Kisspeptin & HPG Axis Research" },
      { peptideName: "Gonadorelin", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: GnRH Signaling & the HPG Axis" },
    ],
    iconName: "FlaskConical",
    color: "#f97316",
    badge: "HPG Axis",
    badgeColor: "#f97316",
    synergy: {
      beginner: "Kisspeptin-10 is the brain's 'on switch' for the reproductive hormone system — it tells GnRH neurons to fire. Gonadorelin is a lab-made copy of the GnRH signal itself, hitting the next receptor down the chain at the pituitary gland. Together they let researchers watch and study two consecutive steps of the same hormonal relay from different vantage points in a single model.",
      expert: "Kisspeptin-10 agonizes KISS1R (Gq-coupled GPR54) on hypothalamic GnRH neurons, activating PLC/IP3/DAG cascades that open TRPC channels and depolarize GnRH neurons to release GnRH into the hypophyseal portal system. Gonadorelin, as a GnRH sequence-identical peptide, then acts directly on pituitary GnRHR (also Gq-coupled), triggering PLC-mediated IP3/DAG signaling, calcium mobilization from the ER, PKC activation, and transcriptional upregulation of LHβ and FSHβ subunits. The stack captures two consecutive and receptor-distinct nodes of the HPG cascade — KISS1R-mediated hypothalamic firing (obligate upstream trigger) and GnRHR-mediated pituitary output (direct downstream transducer) — enabling researchers to study the relay independently, in combination, or at varying pulse frequencies to model gonadotropin secretion dynamics.",
    },
  },
  {
    id: "triptorelin-enclomiphene-hpg-axis",
    category: "Hormonal",
    name: "HPG Axis Modulation Stack",
    subtitle: "Triptorelin + Enclomiphene Gonadotropin Dynamics Model",
    description: "A research model pairing a potent GnRH receptor agonist with a selective estrogen receptor modulator to study opposing regulatory inputs on gonadotropin secretion. Triptorelin stimulates GnRHR directly while Enclomiphene blocks hypothalamic estrogen feedback, creating a dual-entry framework for investigating HPG axis regulation and LH/FSH secretion dynamics.",
    longDescription: "Triptorelin is a synthetic GnRH decapeptide analog with approximately 100-fold greater GnRHR binding affinity than endogenous GnRH, owing to a D-Trp substitution at position 6 that confers resistance to enzymatic degradation. At physiological pulse frequencies, Triptorelin acts as a GnRHR agonist in pituitary gonadotroph cells, stimulating PLC/IP3-mediated calcium mobilization and robust LH and FSH secretion. Its extended half-life relative to native GnRH makes it a useful research tool for studying GnRHR occupancy, receptor desensitization kinetics, and downstream gonadotropin pulse shaping. Enclomiphene is the trans-isomer of clomiphene and a selective estrogen receptor modulator (SERM) with preferential ERα antagonist activity at the hypothalamus and anterior pituitary. By blocking ERα-mediated negative feedback from circulating estradiol, Enclomiphene disinhibits hypothalamic GnRH pulse generation and augments pituitary responsiveness to GnRH signaling, leading to increased LH and FSH secretion. This stack enables researchers to interrogate the HPG axis from two mechanistically independent regulatory angles: direct pituitary GnRHR agonism (Triptorelin) and removal of the primary endocrine brake on the axis (Enclomiphene ERα blockade). The combination models how GnRH receptor activation and estrogen negative-feedback removal interact to shape gonadotropin output — a research question central to reproductive endocrinology, hypogonadism models, and HPGA pharmacology.",
    peptides: [
      { name: "Triptorelin", description: "High-affinity D-Trp6 GnRH analog studied for potent GnRHR agonism, LH/FSH secretion dynamics, and receptor desensitization kinetics" },
      { name: "Enclomiphene", description: "Trans-isomer SERM studied for ERα-mediated hypothalamic negative-feedback blockade and gonadotropin disinhibition" },
    ],
    keyBenefits: [
      "Dual-mechanism HPG axis research — GnRHR agonism and estrogen feedback removal",
      "LH and FSH secretion dynamics under combined regulatory inputs",
      "GnRH receptor occupancy and downstream signaling investigation",
      "Estrogen negative-feedback pathway pharmacology",
    ],
    researchApplications: [
      "Gonadotropin secretion modeling under GnRHR agonist + SERM co-administration",
      "HPG axis regulatory feedback dissection",
      "GnRH receptor desensitization and pulse-frequency sensitivity studies",
      "Reproductive endocrinology and hypogonadism axis research",
    ],
    storageGuide: "Store Triptorelin lyophilized at 2–8°C (36–46°F) and protect from light; reconstitute with bacteriostatic water. Store Enclomiphene in a cool, dry location per product labeling. Avoid freeze-thaw cycling for both compounds after reconstitution.",
    educationLinks: [
      { peptideName: "Triptorelin", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: GnRH Analogs & HPG Axis Research" },
      { peptideName: "Enclomiphene", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: SERMs and Estrogen Feedback Modulation" },
    ],
    iconName: "Crown",
    color: "#e11d48",
    badge: "HPG Axis",
    badgeColor: "#e11d48",
    synergy: {
      beginner: "Triptorelin is a lab-made version of the body's GnRH signal, but stronger and longer-lasting — it directly stimulates the pituitary to release LH and FSH. Enclomiphene works differently: it blocks the 'estrogen tells the brain to slow down' signal, removing the braking system on the whole axis. Together they let researchers study what happens when you push on the accelerator (Triptorelin) while also releasing the brake (Enclomiphene) on the reproductive hormone system.",
      expert: "Triptorelin (D-Trp6-GnRH) agonizes pituitary GnRHR (Gq-coupled GPCR) with ~100× greater affinity than native GnRH, activating PLC/IP3/DAG cascades, intracellular calcium mobilization, PKC activation, and gonadotropin subunit gene transcription to drive LH and FSH secretion. Enclomiphene antagonizes ERα in hypothalamic arcuate nucleus and anterior pituitary neurons, blocking estradiol-mediated transcriptional repression of GnRH and gonadotropin gene expression and eliminating the primary negative-feedback brake on the HPG axis. The mechanistic asymmetry is the research value: Triptorelin provides direct GnRHR-level stimulus while Enclomiphene removes upstream estrogen-mediated inhibition, permitting dissection of how receptor-level agonism and feedback-pathway disinhibition interact to shape gonadotropin pulse amplitude and frequency — two independent regulatory variables that are difficult to study in isolation in intact axis models.",
    },
  },
  {
    id: "hpg-axis-restore-stack",
    category: "Hormonal",
    name: "HPG Axis Research Stack",
    subtitle: "Kisspeptin-10 + MT-2 Neuroendocrine Cross-Talk Model",
    description: "A research model examining hypothalamic reproductive axis regulation through two converging neuroendocrine pathways. Kisspeptin-10 drives GnRH neuron activation via KISS1R, while MT-2 engages melanocortin receptors in the arcuate nucleus — enabling study of how the melanocortin system modulates the upstream HPG axis trigger.",
    longDescription: "Kisspeptin-10 is the biologically active C-terminal decapeptide of the KISS1 gene product. It binds the kisspeptin receptor (KISS1R, formerly GPR54) on GnRH neurons in the hypothalamic arcuate and anteroventral periventricular nuclei, serving as the primary endogenous trigger for pulsatile GnRH secretion. The kisspeptin-GnRH connection is considered the master regulator of reproductive neuroendocrinology: KISS1R signaling is obligatory for puberty onset and sustained HPG axis function. MT-2 (Melanotan II) is a cyclic heptapeptide analog of alpha-MSH with broad melanocortin receptor agonism (MC1R, MC3R, MC4R). Hypothalamic arcuate nucleus neurons expressing MC3R and MC4R include populations that synapse on and modulate the excitability of kisspeptin neurons, forming a melanocortin-kisspeptin-GnRH relay. This stack enables researchers to investigate how melanocortin receptor activation in the arcuate nucleus influences kisspeptin circuit excitability and downstream GnRH secretion — modeling the neuroendocrine cross-talk between the melanocortin and HPG axis systems.",
    peptides: [
      { name: "Kisspeptin-10", description: "KISS1R agonist decapeptide studied for endogenous GnRH pulse triggering and hypothalamic HPG axis regulation" },
      { name: "MT-2", description: "Melanocortin analog studied for MC1R/MC3R/MC4R interactions and neuroendocrine cross-talk with reproductive axis circuits" },
    ],
    keyBenefits: [
      "Dual-entry HPG axis signaling research model",
      "Kisspeptin-GnRH axis regulation investigation",
      "Hypothalamic-to-pituitary cascade mechanism studies",
      "Neuroendocrine reproductive axis pharmacology",
    ],
    researchApplications: [
      "KISS1R agonist pharmacology and GnRH pulse dynamics",
      "Melanocortin-HPG axis cross-talk investigation",
      "Hypothalamic neuropeptide signaling cascade research",
      "Reproductive neuroendocrinology and gonadotropin secretion models",
    ],
    storageGuide: "Store both Kisspeptin-10 and MT-2 lyophilized at 2-8°C (36-46°F). Reconstitute with bacteriostatic water; avoid repeated freeze-thaw cycles after reconstitution. Both peptides are sensitive to oxidation — minimize exposure to air during preparation.",
    educationLinks: [
      { peptideName: "Kisspeptin-10", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: Kisspeptin & HPG Axis Research" },
      { peptideName: "MT-2", articleUrl: "/guides/hormonal-peptides", articleTitle: "Hormonal Peptides: Melanocortin System Overview" },
    ],
    iconName: "FlaskConical",
    color: "#a855f7",
    badge: "Hormonal",
    badgeColor: "#a855f7",
    synergy: {
      beginner: "Kisspeptin-10 is the brain's 'start signal' for the reproductive hormone system — it tells GnRH neurons to fire, which kicks off the entire hormonal cascade. MT-2 works on melanocortin receptors that overlap with reproductive circuits, providing researchers a window into how the arousal and reproductive systems interact at the neuroendocrine level. Together they allow investigation of both the upstream trigger and cross-system modulation of the HPG axis.",
      expert: "Kisspeptin-10 agonizes KISS1R (Gq-coupled GPR54) on hypothalamic GnRH neurons, activating PLC/IP3/DAG second messenger cascades that depolarize GnRH neurons via TRPC channel opening, triggering pulsatile GnRH release into the hypophyseal portal system. MT-2 (Melanotan II) agonizes MC3R and MC4R expressed in hypothalamic arcuate nucleus neurons, including populations adjacent to and synapsing onto GnRH neurons, modulating kisspeptin neuron excitability and neuroendocrine integration. The dual-compound model captures hypothalamic reproductive axis regulation from two convergent angles: KISS1R-mediated GnRH neuron activation (obligate HPG signal) and MC3R/MC4R-mediated neuroendocrine modulation of kisspeptin circuit excitability — enabling study of melanocortin-kisspeptin-GnRH pathway integration in reproductive neuroendocrinology.",
    },
  },
];

export const RESEARCH_STACKS_BY_ID: Record<string, ResearchStackData> = Object.fromEntries(
  RESEARCH_STACKS_DATA.map((s) => [s.id, s])
);

/**
 * Auto-derived map of article slug → peptide name(s) built from the educationLinks
 * in RESEARCH_STACKS_DATA. Only links whose articleUrl path ends with a "what-is-*"
 * slug are included; links pointing to generic guide pages are intentionally excluded
 * so the map stays accurate.
 *
 * This map updates automatically whenever new stacks are added to RESEARCH_STACKS_DATA,
 * eliminating the need to manually sync a separate slug map in education.tsx.
 */
export const STACKS_SLUG_TO_PEPTIDE_NAMES: Record<string, string[]> = (() => {
  const map = new Map<string, Set<string>>();
  for (const stack of RESEARCH_STACKS_DATA) {
    for (const link of stack.educationLinks) {
      const slug = link.articleUrl.split("/").pop();
      if (!slug || !slug.startsWith("what-is-")) continue;
      if (!map.has(slug)) map.set(slug, new Set());
      map.get(slug)!.add(link.peptideName);
    }
  }
  return Object.fromEntries([...map.entries()].map(([k, v]) => [k, [...v]]));
})();

/**
 * Returns all stacks that contain at least one peptide whose name matches
 * any entry in `peptideNames` (case-insensitive). Use this instead of
 * hardcoding stack IDs in guide pages so new stacks surface automatically.
 */
export function getStacksByPeptideNames(peptideNames: string[]): ResearchStackData[] {
  const normalised = peptideNames.map((n) => n.toLowerCase());
  const matchCount = (stack: ResearchStackData) =>
    stack.peptides.filter((p) => normalised.includes(p.name.toLowerCase())).length;
  return RESEARCH_STACKS_DATA
    .filter((stack) => stack.peptides.some((p) => normalised.includes(p.name.toLowerCase())))
    .sort((a, b) => matchCount(b) - matchCount(a));
}
