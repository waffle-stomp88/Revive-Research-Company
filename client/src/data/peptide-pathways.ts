export interface PeptidePathway {
  name: string;
  pathways: string[];
  mechanisms: string[];
  systems: string[];
}

export const PEPTIDE_PATHWAYS: Record<string, PeptidePathway> = {
  // ── Existing entries ───────────────────────────────────────────────────────
  "bpc-157": {
    name: "BPC-157",
    pathways: ["Nitric Oxide", "Angiogenesis", "Collagen Synthesis"],
    mechanisms: ["VEGF upregulation", "GH receptor activation", "Cytoprotection"],
    systems: ["Healing", "Gut", "Joints"],
  },
  "tb-500": {
    name: "TB-500",
    pathways: ["Actin Regulation", "Angiogenesis", "Cell Migration"],
    mechanisms: ["Thymosin Beta-4 fragment", "Blood vessel formation", "Tissue repair"],
    systems: ["Healing", "Muscle", "Heart"],
  },
  "ghk-cu": {
    name: "GHK-Cu",
    pathways: ["Collagen Synthesis", "Copper Signaling", "Matrix Remodeling"],
    mechanisms: ["TGF-β modulation", "Elastin production", "Wound healing"],
    systems: ["Skin", "Hair", "Longevity"],
  },
  "mots-c": {
    name: "MOTS-C",
    pathways: ["AMPK Activation", "Mitochondrial Biogenesis"],
    mechanisms: ["PGC-1α pathway", "Metabolic regulation", "Energy production"],
    systems: ["Metabolic", "Energy", "Longevity"],
  },
  "rr-a3": {
    name: "RR-A3",
    pathways: ["Incretin Receptor", "GIP", "Glucagon"],
    mechanisms: ["Triple receptor agonist", "Insulin sensitivity", "Fat oxidation"],
    systems: ["Metabolic", "Weight"],
  },
  "ipamorelin": {
    name: "Ipamorelin",
    pathways: ["Ghrelin Receptor", "GH Secretion"],
    mechanisms: ["Pituitary activation", "Selective GH release", "No cortisol spike"],
    systems: ["Growth", "Recovery", "Sleep"],
  },
  "cjc-1295": {
    name: "CJC-1295",
    pathways: ["GHRH Signaling", "GH Secretion"],
    mechanisms: ["Extended GH release", "Pituitary stimulation", "DAC variant for sustained"],
    systems: ["Growth", "Recovery", "Muscle"],
  },
  "epithalon": {
    name: "Epithalon",
    pathways: ["Telomerase Activation", "Pineal Function"],
    mechanisms: ["Telomere extension", "Melatonin regulation", "Circadian rhythm"],
    systems: ["Longevity", "Sleep"],
  },
  "semax": {
    name: "Semax",
    pathways: ["BDNF", "NGF", "Dopamine"],
    mechanisms: ["Neuroprotection", "Cognitive enhancement", "ACTH fragment"],
    systems: ["Cognitive", "Focus"],
  },
  "selank": {
    name: "Selank",
    pathways: ["GABA", "Serotonin", "Dopamine"],
    mechanisms: ["Anxiolytic", "Immunomodulation", "Tuftsin analog"],
    systems: ["Cognitive", "Mood", "Immune"],
  },
  "kpv": {
    name: "KPV",
    pathways: ["NF-κB Inhibition", "Anti-Inflammatory", "Mucosal Healing"],
    mechanisms: ["α-MSH fragment", "Immune modulation", "Gut barrier repair"],
    systems: ["Healing", "Gut", "Immune"],
  },
  "thymosin alpha": {
    name: "Thymosin Alpha-1",
    pathways: ["T-Cell Activation", "Immune Modulation", "Dendritic Cell Maturation"],
    mechanisms: ["Thymic peptide", "NK cell enhancement", "Toll-like receptor signaling"],
    systems: ["Immune", "Longevity"],
  },
  "ll-37": {
    name: "LL-37",
    pathways: ["Antimicrobial Defense", "Innate Immunity", "Wound Healing"],
    mechanisms: ["Cathelicidin peptide", "Membrane disruption", "Biofilm breakdown"],
    systems: ["Immune", "Healing"],
  },
  "cerebrolysin": {
    name: "Cerebrolysin",
    pathways: ["Neurotrophic Signaling", "BDNF", "Synaptic Plasticity"],
    mechanisms: ["Porcine brain-derived peptides", "Neuronal survival", "Cognitive restoration"],
    systems: ["Cognitive", "Neuroprotection"],
  },
  "aod-9604": {
    name: "AOD-9604",
    pathways: ["Lipolysis", "Fat Oxidation"],
    mechanisms: ["GH fragment (176-191)", "Adipocyte metabolism", "No IGF-1 effect"],
    systems: ["Metabolic", "Weight"],
  },
  "5-amino-1mq": {
    name: "5-Amino-1MQ",
    pathways: ["NNMT Inhibition", "NAD+ Salvage"],
    mechanisms: ["Metabolic enzyme targeting", "Fat cell differentiation block", "Energy metabolism"],
    systems: ["Metabolic", "Energy"],
  },
  "sermorelin": {
    name: "Sermorelin",
    pathways: ["GHRH Signaling", "GH Secretion"],
    mechanisms: ["GHRH analog (1-29)", "Pituitary stimulation", "Physiologic GH release"],
    systems: ["Growth", "Recovery"],
  },
  "snap-8": {
    name: "Snap-8",
    pathways: ["SNARE Complex", "Neuromuscular Modulation"],
    mechanisms: ["Acetyl octapeptide-3", "Muscle contraction reduction", "Expression line softening"],
    systems: ["Skin", "Cosmetic"],
  },
  "thymalin": {
    name: "Thymalin",
    pathways: ["Thymic Restoration", "Immune Modulation", "T-Cell Activation"],
    mechanisms: ["Thymus extract peptide", "Immunosenescence reversal", "Immune cell maturation"],
    systems: ["Immune", "Longevity"],
  },
  "igf-1 lr3": {
    name: "IGF-1 LR3",
    pathways: ["IGF-1 Signaling", "mTOR Pathway", "Cell Proliferation"],
    mechanisms: ["Extended half-life IGF-1", "Muscle protein synthesis", "Satellite cell activation"],
    systems: ["Growth", "Muscle", "Recovery"],
  },
  "ss-31": {
    name: "SS-31",
    pathways: ["Cardiolipin Binding", "Mitochondrial Electron Transport", "ROS Scavenging"],
    mechanisms: ["Inner membrane stabilization", "Electron transport chain optimization", "Mitochondrial antioxidant"],
    systems: ["Longevity", "Energy", "Recovery"],
  },
  "glutathione": {
    name: "Glutathione",
    pathways: ["Glutathione Peroxidase", "Phase II Detoxification", "Redox Homeostasis"],
    mechanisms: ["Master antioxidant", "Toxin conjugation", "Immune cell support"],
    systems: ["Longevity", "Immune", "Recovery"],
  },
  "glow-peptide-complex": {
    name: "GLOW Peptide Complex",
    pathways: ["Collagen Synthesis", "Matrix Remodeling", "Melanogenesis Modulation"],
    mechanisms: ["Multi-peptide skin rejuvenation", "Elastin production support", "Pigmentation balance"],
    systems: ["Skin", "Longevity"],
  },
  "klow-peptide-complex": {
    name: "KLOW Peptide Complex",
    pathways: ["NF-κB Inhibition", "Collagen Synthesis", "Mucosal Healing"],
    mechanisms: ["Anti-inflammatory blend", "Tissue regeneration support", "Gut-skin axis modulation"],
    systems: ["Healing", "Skin", "Gut"],
  },
  "nad-precursor": {
    name: "NAD+ Precursor",
    pathways: ["NAD+ Salvage", "Sirtuin Activation", "PARP DNA Repair"],
    mechanisms: ["NAD+ level restoration", "Sirtuin-dependent DNA repair", "Mitochondrial enzyme support"],
    systems: ["Longevity", "Metabolic", "Recovery"],
  },
  "dsip": {
    name: "DSIP",
    pathways: ["GABA", "Serotonin", "Sleep Architecture"],
    mechanisms: ["Delta wave enhancement", "Circadian rhythm modulation", "Stress hormone reduction"],
    systems: ["Sleep", "Cognitive", "Recovery"],
  },
  "ace-031": {
    name: "ACE-031",
    pathways: ["Myostatin Inhibition", "Activin Signaling", "Muscle Hypertrophy"],
    mechanisms: ["ActRIIB-Fc fusion", "TGF-β superfamily blocking", "Muscle mass increase"],
    systems: ["Growth", "Muscle"],
  },
  "aicar": {
    name: "AICAR",
    pathways: ["AMPK Activation", "Fat Oxidation", "Mitochondrial Biogenesis"],
    mechanisms: ["AMP-kinase activation", "Endurance enhancement", "Metabolic switching"],
    systems: ["Metabolic", "Energy", "Recovery"],
  },
  "adipotide": {
    name: "Adipotide",
    pathways: ["Prohibitin Targeting", "Vascular Disruption", "Apoptosis"],
    mechanisms: ["White fat vessel targeting", "Adipose tissue reduction", "CKGGRAKDC peptide"],
    systems: ["Weight", "Metabolic"],
  },
  "cagrilintide": {
    name: "Cagrilintide",
    pathways: ["Amylin Receptor", "Appetite Regulation", "Gastric Emptying"],
    mechanisms: ["Long-acting amylin analog", "Satiety signaling", "Glucagon suppression"],
    systems: ["Metabolic", "Weight"],
  },
  "foxo4-dri": {
    name: "FOXO4-DRI",
    pathways: ["FOXO4-p53 Disruption", "Senescence Clearance", "Apoptosis"],
    mechanisms: ["D-retro-inverso peptide", "Senescent cell targeting", "p53 nuclear exclusion"],
    systems: ["Longevity", "Recovery"],
  },
  "ghrp-2": {
    name: "GHRP-2",
    pathways: ["Ghrelin Receptor", "GH Secretion", "Appetite Stimulation"],
    mechanisms: ["Hexapeptide GHRP", "Pituitary GH release", "Hunger hormone activation"],
    systems: ["Growth", "Muscle", "Recovery"],
  },
  "ghrp-6": {
    name: "GHRP-6",
    pathways: ["Ghrelin Receptor", "GH Secretion", "IGF-1 Signaling"],
    mechanisms: ["Strong GH release", "Appetite stimulation", "Cortisol and prolactin effects"],
    systems: ["Growth", "Muscle", "Recovery"],
  },
  "gonadorelin": {
    name: "Gonadorelin",
    pathways: ["GnRH Receptor", "LH Release", "FSH Release"],
    mechanisms: ["Gonadotropin-releasing hormone", "Pituitary gonadotropin stimulation", "Reproductive axis activation"],
    systems: ["Hormonal", "Recovery"],
  },
  "hexarelin": {
    name: "Hexarelin",
    pathways: ["Ghrelin Receptor", "GH Secretion", "Cardioprotection"],
    mechanisms: ["Strongest GHRP", "Cardiac cell protection", "GH/IGF-1 axis activation"],
    systems: ["Growth", "Heart", "Recovery"],
  },
  "igf-des": {
    name: "IGF-DES",
    pathways: ["IGF-1 Signaling", "mTOR Pathway", "Cell Proliferation"],
    mechanisms: ["Truncated IGF-1 variant", "Enhanced receptor binding", "Localized muscle growth"],
    systems: ["Growth", "Muscle"],
  },
  "kisspeptin-10": {
    name: "Kisspeptin-10",
    pathways: ["GnRH Receptor", "LH Release", "Reproductive Axis"],
    mechanisms: ["Kisspeptin receptor activation", "GnRH neuron stimulation", "Puberty and fertility regulation"],
    systems: ["Hormonal"],
  },
  "mazdutide": {
    name: "Mazdutide",
    pathways: ["Incretin Receptor", "Glucagon", "Appetite Regulation"],
    mechanisms: ["Dual receptor agonist", "Enhanced energy expenditure", "Appetite suppression"],
    systems: ["Metabolic", "Weight"],
  },
  "melanotan": {
    name: "Melanotan",
    pathways: ["MC1R Activation", "Melanogenesis Modulation", "cAMP Signaling"],
    mechanisms: ["Alpha-MSH analog", "Melanin production stimulation", "UV protection enhancement"],
    systems: ["Skin", "Cosmetic"],
  },
  "mgf": {
    name: "MGF",
    pathways: ["IGF-1 Signaling", "Satellite Cell Activation", "Muscle Repair"],
    mechanisms: ["IGF-1 splice variant", "Muscle stem cell proliferation", "Exercise-induced growth factor"],
    systems: ["Growth", "Muscle", "Recovery"],
  },
  "oxytocin": {
    name: "Oxytocin",
    pathways: ["Oxytocin Receptor", "Social Bonding", "Anti-Inflammatory"],
    mechanisms: ["Hypothalamic neuropeptide", "Stress reduction", "Uterine contraction regulation"],
    systems: ["Hormonal", "Mood", "Healing"],
  },
  "pt-141": {
    name: "PT-141",
    pathways: ["MC4R Activation", "Melanocortin Signaling", "Dopamine"],
    mechanisms: ["Melanocortin receptor agonist", "Central nervous system arousal", "Sexual function enhancement"],
    systems: ["Hormonal", "Mood"],
  },
  "pinealon": {
    name: "Pinealon",
    pathways: ["Pineal Function", "BDNF", "Neuroprotection"],
    mechanisms: ["Tripeptide brain bioregulator", "Pineal gland support", "Cognitive decline prevention"],
    systems: ["Cognitive", "Sleep", "Longevity"],
  },
  "slu-pp-332": {
    name: "SLU-PP-332",
    pathways: ["ERRα Activation", "Mitochondrial Biogenesis", "Fat Oxidation"],
    mechanisms: ["Estrogen-related receptor alpha agonist", "Exercise pathway mimicry", "Endurance enhancement"],
    systems: ["Metabolic", "Energy", "Muscle"],
  },
  "survodutide": {
    name: "Survodutide",
    pathways: ["Incretin Receptor", "Glucagon", "Appetite Regulation"],
    mechanisms: ["Dual agonist", "Hepatic fat reduction", "Weight management"],
    systems: ["Metabolic", "Weight"],
  },
  "tesamorelin": {
    name: "Tesamorelin",
    pathways: ["GHRH Signaling", "GH Secretion", "Lipolysis"],
    mechanisms: ["Synthetic GHRH", "Visceral fat reduction", "IGF-1 elevation"],
    systems: ["Growth", "Metabolic", "Recovery"],
  },
  "triptorelin": {
    name: "Triptorelin",
    pathways: ["GnRH Receptor", "LH Release", "FSH Release"],
    mechanisms: ["Decapeptide GnRH analog", "Initial gonadotropin surge then suppression", "HPG axis modulation"],
    systems: ["Hormonal"],
  },
  "vip": {
    name: "VIP",
    pathways: ["VPAC Receptor", "Vasodilation", "Anti-Inflammatory"],
    mechanisms: ["Neuropeptide vasodilator", "Smooth muscle relaxation", "Immune tolerance"],
    systems: ["Gut", "Immune", "Vascular"],
  },

  // ── New: Thymic Bioregulators ──────────────────────────────────────────────
  "cortagen": {
    name: "Cortagen",
    pathways: ["Neuronal Differentiation", "BDNF", "Brain Bioregulation"],
    mechanisms: ["Cortex-derived tetrapeptide", "Neuroprotective signaling", "Brain cell renewal"],
    systems: ["Cognitive", "Longevity"],
  },
  "vilon": {
    name: "Vilon",
    pathways: ["T-Cell Regulation", "Immune Modulation", "Neuroendocrine Axis"],
    mechanisms: ["Dipeptide bioregulator", "Immunosenescence reversal", "Hypothalamic peptide signaling"],
    systems: ["Immune", "Longevity"],
  },
  "cardiogen": {
    name: "Cardiogen",
    pathways: ["Myocardial Protection", "Cardiac Gene Expression", "Anti-Fibrotic"],
    mechanisms: ["Heart tissue bioregulator", "Cardiomyocyte differentiation", "Oxidative stress reduction"],
    systems: ["Heart", "Longevity"],
  },
  "pancragen": {
    name: "Pancragen",
    pathways: ["Pancreatic Function", "Insulin Regulation", "Glucagon Signaling"],
    mechanisms: ["Pancreatic bioregulator", "Beta-cell protection", "Glucose homeostasis support"],
    systems: ["Metabolic", "Longevity"],
  },
  "chonluten": {
    name: "Chonluten",
    pathways: ["Bronchial Epithelial Repair", "Mucus Regulation", "Inflammatory Modulation"],
    mechanisms: ["Lung bioregulator tripeptide", "Epithelial cell renewal", "Respiratory tract protection"],
    systems: ["Immune", "Healing"],
  },
  "crystagen": {
    name: "Crystagen",
    pathways: ["Thyroid Function", "T3/T4 Regulation", "Metabolic Rate"],
    mechanisms: ["Thyroid bioregulator", "Thyroid cell differentiation", "Iodine uptake modulation"],
    systems: ["Metabolic", "Longevity"],
  },
  "vesugen": {
    name: "Vesugen",
    pathways: ["Vascular Endothelium", "Nitric Oxide", "Angiogenesis"],
    mechanisms: ["Blood vessel bioregulator", "Endothelial cell renewal", "Vascular tone regulation"],
    systems: ["Healing", "Vascular"],
  },
  "ventfort": {
    name: "Ventfort",
    pathways: ["Vascular Smooth Muscle", "Collagen Synthesis", "Elastin Production"],
    mechanisms: ["Vessel wall bioregulator", "Smooth muscle cell renewal", "Arterial flexibility support"],
    systems: ["Healing", "Vascular"],
  },

  // ── New: GH Secretagogues ──────────────────────────────────────────────────
  "mk-677": {
    name: "MK-677",
    pathways: ["Ghrelin Receptor", "GH Secretion", "IGF-1 Signaling"],
    mechanisms: ["Oral GH secretagogue", "Pituitary GH pulse amplification", "Sustained IGF-1 elevation"],
    systems: ["Growth", "Muscle", "Recovery"],
  },
  "peg-mgf": {
    name: "PEG-MGF",
    pathways: ["IGF-1 Signaling", "Satellite Cell Activation", "Muscle Repair"],
    mechanisms: ["PEGylated MGF for extended half-life", "Delayed muscle stem cell activation", "Local hypertrophy induction"],
    systems: ["Growth", "Muscle", "Recovery"],
  },
  "mod-grf-1-29": {
    name: "Mod GRF 1-29",
    pathways: ["GHRH Signaling", "GH Secretion", "Pituitary Activation"],
    mechanisms: ["CJC-1295 without DAC", "Short-acting GHRH analog", "Pulsatile GH release"],
    systems: ["Growth", "Recovery"],
  },

  // ── New: Nootropics ────────────────────────────────────────────────────────
  "dihexa": {
    name: "Dihexa",
    pathways: ["HGF/MET Signaling", "Synaptogenesis", "Neuroplasticity"],
    mechanisms: ["Hepatocyte growth factor potentiator", "Synapse formation enhancement", "Cognitive restoration"],
    systems: ["Cognitive", "Neuroprotection"],
  },
  "nsi-189": {
    name: "NSI-189",
    pathways: ["Hippocampal Neurogenesis", "BDNF", "Serotonin"],
    mechanisms: ["Hippocampal volume increase", "Neurogenesis stimulation", "Mood and memory enhancement"],
    systems: ["Cognitive", "Mood"],
  },
  "p21-peptide": {
    name: "P21 Peptide",
    pathways: ["CNTF Receptor", "Neurotrophin Signaling", "Neural Differentiation"],
    mechanisms: ["Ciliary neurotrophic factor mimic", "Neural stem cell activation", "Cognitive protection"],
    systems: ["Cognitive", "Longevity"],
  },
  "cortexin": {
    name: "Cortexin",
    pathways: ["Neurotrophic Signaling", "GABA", "Neuroprotection"],
    mechanisms: ["Polypeptide brain bioregulator", "GABAergic modulation", "Cerebral metabolism enhancement"],
    systems: ["Cognitive", "Neuroprotection"],
  },
  "noopept": {
    name: "Noopept",
    pathways: ["NGF", "BDNF", "Glutamate Receptor"],
    mechanisms: ["Cycloprolylglycine prodrug", "Neuropeptide signaling", "Memory consolidation enhancement"],
    systems: ["Cognitive", "Focus"],
  },

  // ── New: Metabolic / GLP-class ─────────────────────────────────────────────
  "retatrutide": {
    name: "Retatrutide",
    pathways: ["Incretin Receptor", "GIP", "Glucagon"],
    mechanisms: ["Triple GLP-1/GIP/Glucagon agonist", "Appetite suppression", "Enhanced lipolysis"],
    systems: ["Metabolic", "Weight"],
  },
  "semaglutide": {
    name: "Semaglutide",
    pathways: ["GLP-1 Receptor", "Insulin Secretion", "Appetite Regulation"],
    mechanisms: ["Long-acting GLP-1 analog", "Gastric emptying delay", "Central satiety signaling"],
    systems: ["Metabolic", "Weight"],
  },
  "tirzepatide": {
    name: "Tirzepatide",
    pathways: ["GLP-1 Receptor", "GIP Receptor", "Insulin Secretion"],
    mechanisms: ["Dual GLP-1/GIP agonist", "Glucose-dependent insulin release", "Adipose tissue reduction"],
    systems: ["Metabolic", "Weight"],
  },
  "glp-2": {
    name: "GLP-2",
    pathways: ["GLP-2 Receptor", "Intestinal Growth", "Mucosal Healing"],
    mechanisms: ["Glucagon-like peptide-2", "Intestinal villus height increase", "Gut barrier fortification"],
    systems: ["Gut", "Healing"],
  },

  // ── New: Skin / Cosmetic ───────────────────────────────────────────────────
  "palmitoyl-tripeptide-1": {
    name: "Palmitoyl Tripeptide-1",
    pathways: ["Collagen Synthesis", "TGF-β Signaling", "Matrix Remodeling"],
    mechanisms: ["Lipopeptide collagen stimulator", "Fibronectin production", "Skin firmness enhancement"],
    systems: ["Skin", "Longevity"],
  },
  "leuphasyl": {
    name: "Leuphasyl",
    pathways: ["Enkephalin Receptor", "Neuromuscular Junction", "SNARE Modulation"],
    mechanisms: ["Opioid receptor modulation", "Synergistic Botox-like effect", "Facial muscle relaxation"],
    systems: ["Skin", "Cosmetic"],
  },
  "argireline": {
    name: "Argireline",
    pathways: ["SNARE Complex", "Acetylcholine Release", "Neuromuscular Modulation"],
    mechanisms: ["Acetyl hexapeptide-3", "Neurotransmitter inhibition at NMJ", "Wrinkle depth reduction"],
    systems: ["Skin", "Cosmetic"],
  },
  "matrixyl": {
    name: "Matrixyl",
    pathways: ["Collagen Synthesis", "Elastin Production", "Fibronectin Signaling"],
    mechanisms: ["Palmitoyl pentapeptide-4", "Matrikine signaling", "Extracellular matrix restoration"],
    systems: ["Skin", "Longevity"],
  },

  // ── New: Longevity ─────────────────────────────────────────────────────────
  "humanin": {
    name: "Humanin",
    pathways: ["STAT3 Signaling", "Mitochondrial Protection", "Anti-Apoptotic"],
    mechanisms: ["Mitochondrial-derived peptide", "Cell death inhibition", "Insulin sensitivity improvement"],
    systems: ["Longevity", "Metabolic", "Cognitive"],
  },
  "ara-290": {
    name: "ARA-290",
    pathways: ["EPO Receptor", "Tissue Protection", "Anti-Inflammatory"],
    mechanisms: ["Erythropoietin peptide fragment", "Innate repair receptor activation", "Neuropathic pain reduction"],
    systems: ["Healing", "Longevity"],
  },
  "cortistatin": {
    name: "Cortistatin",
    pathways: ["Somatostatin Receptor", "GH Regulation", "Neuroprotection"],
    mechanisms: ["Neuropeptide somatostatin analog", "Anti-inflammatory signaling", "Sleep architecture modulation"],
    systems: ["Cognitive", "Longevity", "Sleep"],
  },
  "thymulin": {
    name: "Thymulin",
    pathways: ["T-Cell Maturation", "Zinc-Dependent Signaling", "Immune Restoration"],
    mechanisms: ["Thymic factor peptide", "T-lymphocyte differentiation", "Immunosenescence reversal"],
    systems: ["Immune", "Longevity"],
  },
  "angiotensin-1-7": {
    name: "Angiotensin 1-7",
    pathways: ["Mas Receptor", "ACE2 Axis", "Vasodilation"],
    mechanisms: ["Renin-angiotensin counter-regulatory peptide", "Anti-fibrotic signaling", "Cardioprotection"],
    systems: ["Vascular", "Heart", "Longevity"],
  },

  // ── New: Healing ──────────────────────────────────────────────────────────
  "thymosin-alpha-4": {
    name: "Thymosin Alpha-4",
    pathways: ["Actin Sequestration", "Cell Migration", "Angiogenesis"],
    mechanisms: ["TB-500 active domain peptide", "Wound closure acceleration", "Anti-inflammatory action"],
    systems: ["Healing", "Immune"],
  },
  "larazotide": {
    name: "Larazotide",
    pathways: ["Tight Junction Regulation", "Gut Permeability", "Mucosal Barrier"],
    mechanisms: ["Zonulin antagonist", "Intestinal barrier fortification", "Celiac and leaky gut management"],
    systems: ["Gut", "Healing", "Immune"],
  },
  "ghrelin": {
    name: "Ghrelin",
    pathways: ["Ghrelin Receptor", "Appetite Stimulation", "GH Secretion"],
    mechanisms: ["Hunger hormone", "Gastric motility activation", "Energy balance regulation"],
    systems: ["Gut", "Growth", "Metabolic"],
  },
  "follistatin-344": {
    name: "Follistatin-344",
    pathways: ["Myostatin Inhibition", "Activin Signaling", "Muscle Hypertrophy"],
    mechanisms: ["Activin binding protein", "TGF-β ligand sequestration", "Satellite cell proliferation"],
    systems: ["Growth", "Muscle"],
  },

  // ── New: Hormonal / Reproductive ───────────────────────────────────────────
  "bremelanotide": {
    name: "Bremelanotide",
    pathways: ["MC4R Activation", "Dopamine", "Melanocortin Signaling"],
    mechanisms: ["Central arousal pathway activation", "Sexual dysfunction treatment", "Dopaminergic modulation"],
    systems: ["Hormonal", "Mood"],
  },
  "enclomiphene": {
    name: "Enclomiphene",
    pathways: ["Estrogen Receptor Antagonism", "LH Release", "FSH Release"],
    mechanisms: ["Selective estrogen receptor modulator", "HPG axis stimulation", "Endogenous testosterone restoration"],
    systems: ["Hormonal"],
  },
  "kisspeptin-54": {
    name: "Kisspeptin-54",
    pathways: ["GnRH Receptor", "LH Surge", "Reproductive Axis"],
    mechanisms: ["Full-length kisspeptin isoform", "Pulsatile GnRH modulation", "Ovulation and fertility regulation"],
    systems: ["Hormonal"],
  },
  "leuprolide": {
    name: "Leuprolide",
    pathways: ["GnRH Receptor", "LH Release", "FSH Release"],
    mechanisms: ["Synthetic GnRH agonist", "Pituitary desensitization at high dose", "Sex hormone modulation"],
    systems: ["Hormonal"],
  },

  // ── New: Gut / Vascular / Other ───────────────────────────────────────────
  "motilin": {
    name: "Motilin",
    pathways: ["Motilin Receptor", "Gastric Motility", "Migrating Motor Complex"],
    mechanisms: ["Gut hormone peptide", "Small intestine peristalsis initiation", "Interdigestive motility"],
    systems: ["Gut", "Healing"],
  },
  "apelin-13": {
    name: "Apelin-13",
    pathways: ["APJ Receptor", "Vasodilation", "Cardiac Output"],
    mechanisms: ["Adipokine peptide", "Positive inotropic effect", "Blood pressure regulation"],
    systems: ["Vascular", "Heart"],
  },
  "neuropeptide-y": {
    name: "Neuropeptide Y",
    pathways: ["NPY Receptor", "Appetite Regulation", "Stress Response"],
    mechanisms: ["Most abundant brain peptide", "Anxiolytic-like signaling", "Orexigenic hypothalamic action"],
    systems: ["Cognitive", "Metabolic", "Mood"],
  },
  "substance-p": {
    name: "Substance P",
    pathways: ["NK1 Receptor", "Pain Transmission", "Neurogenic Inflammation"],
    mechanisms: ["Tachykinin neuropeptide", "Mast cell activation", "Wound healing modulation"],
    systems: ["Healing", "Cognitive"],
  },
  "thymopentin": {
    name: "Thymopentin",
    pathways: ["T-Cell Activation", "IL-2 Signaling", "Immune Restoration"],
    mechanisms: ["Thymopoietin fragment", "T-helper cell proliferation", "Lymphocyte differentiation"],
    systems: ["Immune", "Longevity"],
  },
  "c-peptide": {
    name: "C-Peptide",
    pathways: ["Insulin Signaling", "Renal Protection", "Microvascular Function"],
    mechanisms: ["Proinsulin cleavage product", "Na+/K+-ATPase activation", "Diabetic complication protection"],
    systems: ["Metabolic", "Healing"],
  },
  "neurotensin": {
    name: "Neurotensin",
    pathways: ["NTS Receptor", "Dopamine Modulation", "Gut Motility"],
    mechanisms: ["Neuropeptide paracrine signaling", "Antinociception", "Hypothermic effect"],
    systems: ["Cognitive", "Gut"],
  },
  "somatostatin": {
    name: "Somatostatin",
    pathways: ["SSTR Signaling", "GH Inhibition", "Insulin Suppression"],
    mechanisms: ["Hypothalamic inhibitory peptide", "Broad neuroendocrine brake", "Gastric acid reduction"],
    systems: ["Metabolic", "Cognitive", "Gut"],
  },
  "relaxin-2": {
    name: "Relaxin-2",
    pathways: ["RXFP1 Receptor", "Anti-Fibrotic", "Vasodilation"],
    mechanisms: ["Matrix metalloproteinase induction", "Collagen degradation", "Tissue remodeling"],
    systems: ["Healing", "Vascular", "Hormonal"],
  },
  "adrenomedullin": {
    name: "Adrenomedullin",
    pathways: ["CGRP Receptor", "Vasodilation", "Anti-Inflammatory"],
    mechanisms: ["Cardiovascular peptide hormone", "cAMP-mediated smooth muscle relaxation", "Endothelial protection"],
    systems: ["Vascular", "Heart"],
  },
  "cholecystokinin": {
    name: "Cholecystokinin",
    pathways: ["CCK Receptor", "Satiety Signaling", "Digestive Enzyme Release"],
    mechanisms: ["GI hormone peptide", "Gallbladder contraction", "Pancreatic enzyme secretion"],
    systems: ["Gut", "Metabolic"],
  },
  "enkephalin": {
    name: "Enkephalin",
    pathways: ["Opioid Receptor", "Pain Modulation", "Mood Regulation"],
    mechanisms: ["Endogenous opioid pentapeptide", "Mu and delta receptor agonism", "Analgesic and anxiolytic action"],
    systems: ["Mood", "Cognitive"],
  },
  "thyroid-releasing-hormone": {
    name: "TRH",
    pathways: ["TRH Receptor", "TSH Release", "Thyroid Axis"],
    mechanisms: ["Thyrotropin-releasing hormone tripeptide", "Pituitary TSH stimulation", "CNS neuroprotective effects"],
    systems: ["Hormonal", "Cognitive"],
  },
  "galanin": {
    name: "Galanin",
    pathways: ["Galanin Receptor", "Norepinephrine", "Serotonin"],
    mechanisms: ["Neuropeptide neuromodulator", "Memory-related hippocampal signaling", "Feeding behavior modulation"],
    systems: ["Cognitive", "Mood"],
  },
  "klotho-peptide": {
    name: "Klotho Peptide",
    pathways: ["Klotho Signaling", "FGF23 Modulation", "Anti-Aging Transcription"],
    mechanisms: ["Anti-aging hormone peptide fragment", "Neuroprotection via PI3K inhibition", "Cognitive and renal longevity"],
    systems: ["Longevity", "Cognitive"],
  },
  "collagen-tripeptide": {
    name: "Collagen Tripeptide",
    pathways: ["Collagen Synthesis", "Fibroblast Activation", "ECM Remodeling"],
    mechanisms: ["Gly-Pro-Hyp bioactive tripeptide", "Procollagen gene expression boost", "Skin and joint repair"],
    systems: ["Skin", "Healing"],
  },
};
