export interface PairingReason {
  partner: string;
  why: string;
  mechanism: string;
  sequential?: boolean;
  sequentialNote?: string;
}

export interface CompoundPairings {
  name: string;
  slug: string;
  topPairings: PairingReason[];
}

export const PAIRING_INTELLIGENCE: Record<string, CompoundPairings> = {
  "bpc-157": {
    name: "BPC-157",
    slug: "bpc-157",
    topPairings: [
      {
        partner: "TB-500",
        why: "BPC-157 drives local tissue repair via VEGF upregulation while TB-500 provides systemic healing through thymosin beta-4 actin regulation. Together they cover both localized and whole-body regeneration pathways.",
        mechanism: "Local VEGF-driven angiogenesis + systemic actin-based cell migration",
      },
      {
        partner: "GHK-Cu",
        why: "BPC-157 activates growth hormone receptors and promotes angiogenesis, while GHK-Cu stimulates collagen synthesis through TGF-\u03B2 modulation. The combination addresses both vascular repair and extracellular matrix remodeling.",
        mechanism: "Angiogenic repair + copper-peptide collagen remodeling",
      },
      {
        partner: "KPV",
        why: "BPC-157 repairs gut mucosal lining through cytoprotective mechanisms while KPV inhibits NF-\u03BAB inflammatory signaling. This pairing tackles gut repair from two angles: structural healing and inflammation suppression.",
        mechanism: "Gut lining repair + NF-\u03BAB inflammatory pathway inhibition",
      },
      {
        partner: "Ipamorelin",
        why: "BPC-157's tissue repair pathways are amplified by Ipamorelin's selective growth hormone release, which stimulates IGF-1 production to accelerate cellular regeneration without cortisol spikes.",
        mechanism: "Tissue repair + selective GH/IGF-1 amplification",
      },
      {
        partner: "Retatrutide",
        why: "BPC-157 protects the GI tract lining while Retatrutide's GLP-1/GIP/glucagon triple agonism drives metabolic changes. The gut-protective effect of BPC-157 can support GI comfort during metabolic compound research.",
        mechanism: "Gut cytoprotection + triple metabolic receptor agonism",
      },
    ],
  },
  "tb-500": {
    name: "TB-500",
    slug: "tb-500",
    topPairings: [
      {
        partner: "BPC-157",
        why: "TB-500 provides systemic tissue repair through thymosin beta-4 while BPC-157 targets local healing via nitric oxide and VEGF pathways. The Wolverine Stack is the most well-known peptide pairing in research.",
        mechanism: "Systemic thymosin-mediated repair + local VEGF angiogenesis",
      },
      {
        partner: "GHK-Cu",
        why: "TB-500 accelerates wound healing through cell migration and blood vessel formation, while GHK-Cu remodels the extracellular matrix with copper-dependent collagen and elastin synthesis.",
        mechanism: "Vascular repair + matrix remodeling",
      },
      {
        partner: "Ipamorelin",
        why: "TB-500's healing capacity is enhanced by the growth hormone release from Ipamorelin, which drives IGF-1 for tissue regeneration. This forms the basis of the Total Regen stack.",
        mechanism: "Thymosin healing + GH-mediated growth factor support",
      },
    ],
  },
  "ghk-cu": {
    name: "GHK-Cu",
    slug: "ghk-cu",
    topPairings: [
      {
        partner: "BPC-157",
        why: "GHK-Cu drives collagen synthesis and elastin production through copper signaling, while BPC-157 provides the vascular infrastructure for nutrient delivery to remodeling tissue.",
        mechanism: "Copper-peptide collagen synthesis + vascular support",
      },
      {
        partner: "TB-500",
        why: "GHK-Cu focuses on matrix-level remodeling while TB-500 handles systemic cell migration and angiogenesis. Together they address tissue architecture from the structural protein level up.",
        mechanism: "Extracellular matrix repair + systemic cell migration",
      },
      {
        partner: "Epithalon",
        why: "GHK-Cu activates DNA repair genes and stimulates collagen turnover, while Epithalon supports telomerase activation for cellular longevity. Both address aging at the cellular level through complementary mechanisms.",
        mechanism: "DNA repair gene activation + telomerase stimulation",
      },
      {
        partner: "Snap-8",
        why: "GHK-Cu rebuilds collagen from within while Snap-8 reduces the neuromuscular signaling that causes expression lines. This combination addresses skin aging from both the structural and muscular sides.",
        mechanism: "Collagen remodeling + SNARE complex neuromuscular relaxation",
      },
    ],
  },
  "mots-c": {
    name: "MOTS-C",
    slug: "mots-c",
    topPairings: [
      {
        partner: "SS-31",
        why: "SS-31 stabilizes cardiolipin in the mitochondrial inner membrane, optimizing electron transport chain efficiency. MOTS-C then activates AMPK to drive mitochondrial biogenesis. SS-31 primes the existing mitochondria before MOTS-C builds new ones.",
        mechanism: "Cardiolipin stabilization \u2192 AMPK-driven mitochondrial biogenesis",
        sequential: true,
        sequentialNote: "SS-31 first to prime mitochondria, then MOTS-C to expand mitochondrial population",
      },
      {
        partner: "Retatrutide",
        why: "MOTS-C enhances cellular energy production through AMPK activation while Retatrutide targets metabolic receptors (GLP-1/GIP/glucagon). The combination addresses metabolism at both the cellular energy and hormonal signaling levels.",
        mechanism: "AMPK cellular energy + triple metabolic receptor agonism",
      },
      {
        partner: "CJC-1295",
        why: "MOTS-C drives metabolic efficiency while CJC-1295 sustains growth hormone release for body composition optimization. Part of the Lean Mass Protocol for comprehensive metabolic research.",
        mechanism: "Mitochondrial metabolism + sustained GH elevation",
      },
      {
        partner: "BPC-157",
        why: "MOTS-C supports cellular energy production while BPC-157 provides tissue-level protection. Together they cover the energy-repair axis for comprehensive regenerative research.",
        mechanism: "Metabolic regulation + cytoprotective tissue repair",
      },
    ],
  },
  "retatrutide": {
    name: "Retatrutide",
    slug: "retatrutide",
    topPairings: [
      {
        partner: "BPC-157",
        why: "Retatrutide's triple agonism (GLP-1/GIP/glucagon) creates significant metabolic shifts. BPC-157 protects the gut lining during this process, supporting GI comfort and nutrient absorption.",
        mechanism: "Triple receptor metabolic signaling + gut cytoprotection",
      },
      {
        partner: "MOTS-C",
        why: "Retatrutide drives metabolic signaling through hormone receptors while MOTS-C enhances mitochondrial energy production via AMPK. This hits metabolism from both the receptor and cellular energy levels.",
        mechanism: "Hormonal metabolic control + mitochondrial energy",
      },
      {
        partner: "AOD-9604",
        why: "Retatrutide provides hormonal appetite and metabolic regulation while AOD-9604 directly stimulates lipolysis through GH fragment mechanisms without IGF-1 increase. Dual approach to body composition research.",
        mechanism: "Triple receptor agonism + HGH fragment-driven lipolysis",
      },
      {
        partner: "Tesamorelin",
        why: "Retatrutide handles broad metabolic receptor activation while Tesamorelin specifically targets visceral fat through GHRH-mediated growth hormone release.",
        mechanism: "Multi-receptor metabolic control + visceral fat-targeting GHRH",
      },
    ],
  },
  "ipamorelin": {
    name: "Ipamorelin",
    slug: "ipamorelin",
    topPairings: [
      {
        partner: "CJC-1295",
        why: "Ipamorelin (GHRP) stimulates growth hormone release at the pituitary while CJC-1295 (GHRH) amplifies the signal from the hypothalamus. Combining GHRP + GHRH produces synergistic GH output far greater than either alone.",
        mechanism: "Pituitary GHRP + hypothalamic GHRH dual-axis amplification",
      },
      {
        partner: "BPC-157",
        why: "Ipamorelin's growth hormone release elevates IGF-1 for tissue growth, while BPC-157 directs healing activity to specific tissues. The Performance Stack combination.",
        mechanism: "GH/IGF-1 elevation + targeted tissue repair",
      },
      {
        partner: "Sermorelin",
        why: "Both stimulate growth hormone through different receptor pathways. Sermorelin as a natural GHRH analog provides the baseline signal while Ipamorelin adds selective GHRP stimulation without cortisol or prolactin elevation.",
        mechanism: "Natural GHRH signaling + selective GHRP amplification",
      },
      {
        partner: "Epithalon",
        why: "Ipamorelin's GH release supports recovery and sleep architecture while Epithalon's telomerase activation promotes cellular longevity. The Deep Sleep Formula addresses nighttime regeneration.",
        mechanism: "GH pulse optimization + telomerase circadian support",
      },
    ],
  },
  "cjc-1295": {
    name: "CJC-1295",
    slug: "cjc-1295",
    topPairings: [
      {
        partner: "Ipamorelin",
        why: "CJC-1295 provides sustained GHRH signaling while Ipamorelin adds pulsatile GHRP release. This GHRH + GHRP combination is the gold standard for growth hormone research, producing amplified GH output.",
        mechanism: "Sustained GHRH + pulsatile GHRP dual-axis GH amplification",
      },
      {
        partner: "MOTS-C",
        why: "CJC-1295 elevates GH for body composition benefits while MOTS-C drives mitochondrial energy production. The Lean Mass Protocol targets both hormonal growth and metabolic efficiency.",
        mechanism: "GH axis stimulation + AMPK metabolic enhancement",
      },
      {
        partner: "Tesamorelin",
        why: "Both are GHRH pathway compounds but target different outcomes. CJC-1295 provides broad GH elevation while Tesamorelin specifically targets visceral fat reduction.",
        mechanism: "Broad GH elevation + targeted visceral fat GHRH",
      },
      {
        partner: "Sermorelin",
        why: "CJC-1295 with DAC offers extended half-life GHRH while Sermorelin provides more natural pulsatile GHRH release. Combined they create sustained yet physiologically appropriate GH patterns.",
        mechanism: "Extended GHRH + natural pulsatile GHRH signaling",
      },
    ],
  },
  "epithalon": {
    name: "Epithalon",
    slug: "epithalon",
    topPairings: [
      {
        partner: "GHK-Cu",
        why: "Epithalon activates telomerase to extend telomere length while GHK-Cu activates DNA repair genes and drives collagen regeneration. Both address aging but through different cellular mechanisms.",
        mechanism: "Telomerase activation + DNA repair gene expression",
      },
      {
        partner: "Thymalin",
        why: "Epithalon supports cellular longevity via telomerase while Thymalin restores thymic function for immune rejuvenation. Both are Khavinson peptides originally studied for their anti-aging properties in clinical settings.",
        mechanism: "Telomere extension + thymic immune reconstitution",
      },
      {
        partner: "Ipamorelin",
        why: "Epithalon regulates pineal melatonin production for circadian rhythm optimization while Ipamorelin releases growth hormone during sleep. Together they optimize the nighttime regeneration window.",
        mechanism: "Pineal circadian regulation + sleep-phase GH release",
      },
      {
        partner: "FOXO4-DRI",
        why: "Epithalon preserves healthy cells through telomere maintenance while FOXO4-DRI selectively clears senescent cells. One protects, the other removes damage \u2014 complementary longevity mechanisms.",
        mechanism: "Telomere protection + senescent cell clearance",
      },
    ],
  },
  "semax": {
    name: "Semax",
    slug: "semax",
    topPairings: [
      {
        partner: "Selank",
        why: "Semax and Selank are the gold-standard nootropic pairing. Semax upregulates BDNF and NGF for cognitive enhancement and neuroprotection, while Selank modulates GABA for anxiolytic calm without sedation. They address performance and mood simultaneously.",
        mechanism: "BDNF/NGF cognitive enhancement + GABAergic anxiolytic modulation",
      },
      {
        partner: "Cerebrolysin",
        why: "Semax stimulates single neurotrophic factors (BDNF, NGF) while Cerebrolysin provides a complex mix of neurotrophic peptides. Together they create multi-layered neuroprotective and neuroplasticity support.",
        mechanism: "Targeted neurotrophins + broad-spectrum neurotrophic factors",
      },
      {
        partner: "Pinealon",
        why: "Semax drives cognitive performance through ACTH-derived BDNF stimulation while Pinealon supports pineal gland function and circadian neuroprotection.",
        mechanism: "BDNF cognitive enhancement + pineal neuroprotection",
      },
    ],
  },
  "selank": {
    name: "Selank",
    slug: "selank",
    topPairings: [
      {
        partner: "Semax",
        why: "The gold-standard nootropic duo. Selank provides anxiolytic mood stabilization through tuftsin-derived GABA modulation while Semax drives cognitive performance via BDNF upregulation. Together: calm focus.",
        mechanism: "GABAergic anxiolysis + BDNF cognitive amplification",
      },
      {
        partner: "Thymalin",
        why: "Selank modulates immune function through its tuftsin analog structure while Thymalin regenerates thymic tissue for T-cell production. Both support immune function through different mechanisms.",
        mechanism: "Tuftsin immune modulation + thymic T-cell regeneration",
      },
      {
        partner: "DSIP",
        why: "Selank reduces anxiety and stress response while DSIP promotes delta-wave sleep architecture. Evening research combining mood regulation with sleep optimization.",
        mechanism: "Anxiolytic mood regulation + delta sleep induction",
      },
    ],
  },
  "kpv": {
    name: "KPV",
    slug: "kpv",
    topPairings: [
      {
        partner: "BPC-157",
        why: "KPV inhibits NF-\u03BAB inflammatory cascades while BPC-157 repairs the gut mucosal lining. The Gut Restore pairing addresses both the inflammation driving damage and the structural repair needed.",
        mechanism: "NF-\u03BAB inhibition + mucosal lining cytoprotection",
      },
      {
        partner: "LL-37",
        why: "KPV provides anti-inflammatory action while LL-37 offers antimicrobial defense through cathelicidin membrane disruption. Together they address gut immune defense from both inflammatory and microbial angles.",
        mechanism: "Anti-inflammatory + antimicrobial cathelicidin defense",
      },
      {
        partner: "Thymalin",
        why: "KPV modulates inflammation through alpha-MSH fragment action while Thymalin supports broader immune system function through thymic regeneration.",
        mechanism: "Alpha-MSH anti-inflammatory + thymic immune restoration",
      },
    ],
  },
  "ss-31": {
    name: "SS-31",
    slug: "ss-31",
    topPairings: [
      {
        partner: "MOTS-C",
        why: "SS-31 stabilizes cardiolipin in the mitochondrial inner membrane, protecting the electron transport chain and reducing ROS. MOTS-C then activates AMPK to drive new mitochondrial biogenesis. Use SS-31 first to optimize existing mitochondria before MOTS-C expands the population.",
        mechanism: "Cardiolipin stabilization \u2192 AMPK mitochondrial biogenesis",
        sequential: true,
        sequentialNote: "SS-31 first to stabilize existing mitochondria, then MOTS-C to build new ones",
      },
      {
        partner: "Glutathione",
        why: "SS-31 reduces mitochondrial ROS at the source by stabilizing the electron transport chain, while Glutathione neutralizes free radicals that escape. Double-layered antioxidant protection.",
        mechanism: "Mitochondrial ROS reduction + master antioxidant neutralization",
      },
      {
        partner: "Epithalon",
        why: "SS-31 protects cellular energy production at the mitochondrial level while Epithalon supports telomere maintenance. Together they address two core aging mechanisms: energy decline and telomere shortening.",
        mechanism: "Mitochondrial protection + telomerase activation",
      },
    ],
  },
  "aod-9604": {
    name: "AOD-9604",
    slug: "aod-9604",
    topPairings: [
      {
        partner: "5-Amino-1MQ",
        why: "AOD-9604 stimulates lipolysis through GH fragment beta-3 adrenergic action while 5-Amino-1MQ inhibits NNMT enzyme to shift fat cell metabolism. Two independent fat-targeting mechanisms.",
        mechanism: "GH fragment lipolysis + NNMT enzyme inhibition",
      },
      {
        partner: "Retatrutide",
        why: "AOD-9604 directly drives fat breakdown while Retatrutide manages appetite and metabolic hormones through triple receptor agonism. Direct lipolysis + systemic metabolic control.",
        mechanism: "Direct lipolysis + GLP-1/GIP/glucagon receptor control",
      },
      {
        partner: "MOTS-C",
        why: "AOD-9604 targets fat cell breakdown while MOTS-C enhances mitochondrial fat oxidation through AMPK. One breaks down fat, the other burns it for energy.",
        mechanism: "Fat cell lipolysis + mitochondrial fat oxidation",
      },
      {
        partner: "Tesamorelin",
        why: "AOD-9604 provides broad lipolytic action while Tesamorelin specifically targets visceral fat through GHRH-mediated mechanisms. General + targeted fat reduction.",
        mechanism: "Broad lipolysis + visceral fat-targeting GHRH",
      },
    ],
  },
  "5-amino-1mq": {
    name: "5-Amino-1MQ",
    slug: "5-amino-1mq",
    topPairings: [
      {
        partner: "AOD-9604",
        why: "5-Amino-1MQ inhibits NNMT enzyme to prevent NAD+ depletion in fat cells while AOD-9604 stimulates lipolysis through GH fragment action. NNMT inhibition + direct fat breakdown.",
        mechanism: "NNMT enzyme blockade + GH fragment lipolysis",
      },
      {
        partner: "Retatrutide",
        why: "5-Amino-1MQ shifts fat cell metabolism at the enzymatic level while Retatrutide manages systemic metabolic hormones. Cellular-level + hormonal-level metabolic control.",
        mechanism: "NNMT metabolic shift + triple receptor metabolic signaling",
      },
      {
        partner: "MOTS-C",
        why: "5-Amino-1MQ conserves NAD+ and SAM through NNMT inhibition while MOTS-C activates AMPK for mitochondrial energy production. Both enhance cellular energy but through different mechanisms.",
        mechanism: "NAD+ conservation + AMPK energy activation",
      },
    ],
  },
  "tesamorelin": {
    name: "Tesamorelin",
    slug: "tesamorelin",
    topPairings: [
      {
        partner: "CJC-1295",
        why: "Both are GHRH pathway compounds. Tesamorelin specifically targets visceral fat through GH release, while CJC-1295 provides broader sustained GH elevation for overall body composition.",
        mechanism: "Visceral fat GHRH + broad-spectrum sustained GHRH",
      },
      {
        partner: "Ipamorelin",
        why: "Tesamorelin as GHRH provides the baseline signal while Ipamorelin as GHRP amplifies it at the pituitary. Classic GHRH + GHRP synergy focused on visceral fat reduction.",
        mechanism: "GHRH visceral fat targeting + GHRP amplification",
      },
      {
        partner: "AOD-9604",
        why: "Tesamorelin releases GH for visceral fat reduction while AOD-9604 provides direct lipolysis as a GH fragment. GH-mediated + direct fat breakdown.",
        mechanism: "GH-dependent visceral targeting + GH-independent lipolysis",
      },
    ],
  },
  "sermorelin": {
    name: "Sermorelin",
    slug: "sermorelin",
    topPairings: [
      {
        partner: "Ipamorelin",
        why: "Sermorelin as a natural GHRH analog provides physiological GH release patterns while Ipamorelin adds selective GHRP stimulation. Clean GH elevation without cortisol or prolactin side effects.",
        mechanism: "Natural GHRH pulsatile release + selective GHRP amplification",
      },
      {
        partner: "CJC-1295",
        why: "Sermorelin offers natural pulsatile GHRH while CJC-1295 provides sustained release through DAC stabilization. Physiological pulses + extended duration for research flexibility.",
        mechanism: "Pulsatile natural GHRH + DAC-stabilized sustained GHRH",
      },
      {
        partner: "GHRP-2",
        why: "Sermorelin provides the GHRH signal while GHRP-2 offers potent pituitary GH release. Strong synergy between the hypothalamic and pituitary axes of growth hormone regulation.",
        mechanism: "GHRH hypothalamic signal + GHRP pituitary release",
      },
    ],
  },
  "cerebrolysin": {
    name: "Cerebrolysin",
    slug: "cerebrolysin",
    topPairings: [
      {
        partner: "Semax",
        why: "Cerebrolysin provides a complex mix of neurotrophic factors while Semax specifically upregulates BDNF and NGF. Broad neuroplasticity support combined with targeted neurotrophic stimulation.",
        mechanism: "Multi-peptide neurotrophic mix + targeted BDNF/NGF upregulation",
      },
      {
        partner: "Selank",
        why: "Cerebrolysin supports neuronal survival and synaptic plasticity while Selank provides GABAergic mood stabilization. Neuroprotection + emotional regulation for comprehensive brain support.",
        mechanism: "Neurotrophic neuroprotection + GABAergic mood regulation",
      },
      {
        partner: "Pinealon",
        why: "Cerebrolysin provides broad neurotrophic factor support while Pinealon offers pineal-derived neuroprotection. Multiple pathways of neuronal support and protection.",
        mechanism: "Broad neurotrophic factors + pineal neuropeptide protection",
      },
    ],
  },
  "dsip": {
    name: "DSIP",
    slug: "dsip",
    topPairings: [
      {
        partner: "Ipamorelin",
        why: "DSIP promotes delta-wave deep sleep while Ipamorelin releases growth hormone during sleep phases. Growth hormone is naturally pulsed during deep sleep, making this a synergistic timing match.",
        mechanism: "Delta sleep induction + sleep-phase GH release",
      },
      {
        partner: "Epithalon",
        why: "DSIP directly induces delta sleep while Epithalon regulates melatonin through pineal gland stimulation. Both target sleep but through different mechanisms: direct sleep induction vs. circadian regulation.",
        mechanism: "Direct sleep induction + pineal melatonin regulation",
      },
      {
        partner: "Melatonin",
        why: "DSIP provides peptide-based sleep induction while Melatonin supports circadian rhythm signaling. Complementary sleep support through different receptor systems.",
        mechanism: "Delta sleep peptide + MT1/MT2 circadian signaling",
      },
    ],
  },
  "thymalin": {
    name: "Thymalin",
    slug: "thymalin",
    topPairings: [
      {
        partner: "Epithalon",
        why: "Both are Khavinson peptides studied together in clinical settings. Thymalin restores thymic function for immune rejuvenation while Epithalon activates telomerase for cellular longevity. Immune + cellular anti-aging.",
        mechanism: "Thymic immune restoration + telomerase activation",
      },
      {
        partner: "Thymosin Alpha-1",
        why: "Thymalin regenerates thymic tissue structure while Thymosin Alpha-1 activates specific immune cells (dendritic cells, NK cells). Structural thymic repair + functional immune activation.",
        mechanism: "Thymic regeneration + immune cell activation",
      },
      {
        partner: "KPV",
        why: "Thymalin supports broad immune system restoration while KPV provides targeted anti-inflammatory action through NF-\u03BAB inhibition. Immune rebuilding + inflammation control.",
        mechanism: "Thymic immune reconstitution + NF-\u03BAB inhibition",
      },
    ],
  },
  "ll-37": {
    name: "LL-37",
    slug: "ll-37",
    topPairings: [
      {
        partner: "Thymosin Alpha-1",
        why: "LL-37 provides direct antimicrobial action through cathelicidin membrane disruption while Thymosin Alpha-1 activates the adaptive immune system. Innate + adaptive immune defense pairing.",
        mechanism: "Cathelicidin antimicrobial + adaptive immune cell activation",
      },
      {
        partner: "KPV",
        why: "LL-37 offers antimicrobial defense and biofilm disruption while KPV suppresses the inflammatory response. Killing pathogens while controlling the collateral inflammatory damage.",
        mechanism: "Antimicrobial pathogen defense + anti-inflammatory control",
      },
      {
        partner: "BPC-157",
        why: "LL-37 handles immune defense in the gut while BPC-157 repairs the gut mucosal lining. Defense + repair for the Gut Immune Shield protocol.",
        mechanism: "Gut antimicrobial defense + mucosal lining repair",
      },
    ],
  },
  "thymosin-alpha-1": {
    name: "Thymosin Alpha-1",
    slug: "thymosin-alpha-1",
    topPairings: [
      {
        partner: "LL-37",
        why: "Thymosin Alpha-1 activates dendritic cells and NK cells for adaptive immune surveillance while LL-37 provides immediate antimicrobial defense. Adaptive + innate immunity for comprehensive defense.",
        mechanism: "Adaptive immune activation + innate antimicrobial defense",
      },
      {
        partner: "Thymalin",
        why: "Thymosin Alpha-1 activates specific immune cells while Thymalin regenerates the thymus gland itself. Functional immune boost + structural immune organ restoration.",
        mechanism: "Immune cell activation + thymic tissue regeneration",
      },
      {
        partner: "KPV",
        why: "Thymosin Alpha-1 enhances immune surveillance while KPV modulates excessive inflammation. Immune activation with inflammatory safeguard.",
        mechanism: "Immune cell activation + alpha-MSH anti-inflammatory",
      },
    ],
  },
  "foxo4-dri": {
    name: "FOXO4-DRI",
    slug: "foxo4-dri",
    topPairings: [
      {
        partner: "Epithalon",
        why: "FOXO4-DRI clears senescent cells by disrupting FOXO4/p53 interaction while Epithalon protects healthy cells through telomerase activation. Remove damage + preserve healthy cells.",
        mechanism: "Senescent cell apoptosis + telomere preservation",
      },
      {
        partner: "GHK-Cu",
        why: "FOXO4-DRI clears damaged cells while GHK-Cu activates over 4000 genes involved in tissue remodeling. Clearing + rebuilding for cellular renewal.",
        mechanism: "Senolytic clearance + gene-level tissue remodeling",
      },
    ],
  },
  "igf-1-lr3": {
    name: "IGF-1 LR3",
    slug: "igf-1-lr3",
    topPairings: [
      {
        partner: "MGF",
        why: "IGF-1 LR3 provides sustained systemic IGF-1 signaling for protein synthesis while MGF activates satellite cells locally at the muscle. Systemic growth + localized muscle repair.",
        mechanism: "Systemic IGF-1 signaling + local satellite cell activation",
      },
      {
        partner: "BPC-157",
        why: "IGF-1 LR3 drives anabolic growth signaling while BPC-157 provides tissue protection and repair. Growth factor + tissue integrity maintenance.",
        mechanism: "IGF-1 anabolic signaling + cytoprotective tissue repair",
      },
      {
        partner: "CJC-1295",
        why: "IGF-1 LR3 provides direct IGF-1 signaling while CJC-1295 stimulates upstream GH release for endogenous IGF-1 production. Direct + upstream growth factor support.",
        mechanism: "Direct IGF-1 + upstream GH/IGF-1 axis stimulation",
      },
    ],
  },
  "mgf": {
    name: "MGF",
    slug: "mgf",
    topPairings: [
      {
        partner: "IGF-1 LR3",
        why: "MGF activates muscle satellite cells locally while IGF-1 LR3 provides systemic IGF-1 for overall protein synthesis. Local repair + systemic growth signaling.",
        mechanism: "Local satellite cell activation + systemic IGF-1 signaling",
      },
      {
        partner: "PEG-MGF",
        why: "MGF provides immediate local mechano growth signaling while PEG-MGF offers extended systemic delivery through PEGylation. Immediate + sustained mechano growth factor action.",
        mechanism: "Immediate local MGF + PEGylated sustained MGF",
      },
      {
        partner: "BPC-157",
        why: "MGF drives muscle satellite cell proliferation while BPC-157 supports the surrounding tissue with vascular and healing support.",
        mechanism: "Muscle satellite proliferation + tissue vascular support",
      },
    ],
  },
  "snap-8": {
    name: "Snap-8",
    slug: "snap-8",
    topPairings: [
      {
        partner: "GHK-Cu",
        why: "Snap-8 reduces expression lines through SNARE complex inhibition while GHK-Cu rebuilds collagen and elastin from within. Surface wrinkle relaxation + deep structural remodeling.",
        mechanism: "SNARE neuromuscular relaxation + copper collagen synthesis",
      },
      {
        partner: "GLOW Peptide Complex",
        why: "Snap-8 addresses dynamic wrinkles while GLOW provides overall skin radiance and antioxidant protection. Expression line reduction + skin luminosity.",
        mechanism: "Expression line relaxation + radiance enhancement",
      },
    ],
  },
  "pt-141": {
    name: "PT-141",
    slug: "pt-141",
    topPairings: [
      {
        partner: "Melanotan II",
        why: "PT-141 activates MC4R for central nervous system arousal while Melanotan II activates both MC1R and MC4R for broader melanocortin effects including tanning and libido enhancement.",
        mechanism: "Selective MC4R arousal + broad melanocortin activation",
      },
      {
        partner: "Alprostadil",
        why: "PT-141 works through central melanocortin arousal pathways while Alprostadil provides peripheral PGE1 vasodilation. Central + peripheral mechanisms for comprehensive research.",
        mechanism: "Central melanocortin arousal + peripheral PGE1 vasodilation",
      },
    ],
  },
  "melanotan-ii": {
    name: "Melanotan II",
    slug: "melanotan-ii",
    topPairings: [
      {
        partner: "PT-141",
        why: "Melanotan II provides broad melanocortin stimulation (MC1R/MC4R) including tanning and libido effects, while PT-141 offers more targeted MC4R arousal. The Desire Protocol combination.",
        mechanism: "Broad melanocortin agonism + selective MC4R activation",
      },
      {
        partner: "Melanotan I",
        why: "Melanotan II is non-selective across melanocortin receptors while Melanotan I selectively targets MC1R for more focused melanogenesis research.",
        mechanism: "Non-selective melanocortin + selective MC1R melanogenesis",
      },
    ],
  },
  "glutathione": {
    name: "Glutathione",
    slug: "glutathione",
    topPairings: [
      {
        partner: "SS-31",
        why: "Glutathione neutralizes free radicals throughout the body while SS-31 reduces ROS production at the mitochondrial source. Master antioxidant defense + mitochondrial source protection.",
        mechanism: "Systemic free radical neutralization + mitochondrial ROS reduction",
      },
      {
        partner: "Epithalon",
        why: "Glutathione provides cellular detoxification and antioxidant protection while Epithalon supports telomere maintenance. Cellular protection + longevity support.",
        mechanism: "GSH cellular protection + telomerase activation",
      },
      {
        partner: "GHK-Cu",
        why: "Glutathione handles Phase II detoxification while GHK-Cu activates tissue remodeling genes. Detoxification + regeneration for cellular renewal.",
        mechanism: "Phase II detoxification + gene-level tissue remodeling",
      },
    ],
  },
  "gonadorelin": {
    name: "Gonadorelin",
    slug: "gonadorelin",
    topPairings: [
      {
        partner: "HCG",
        why: "Gonadorelin provides pulsatile GnRH stimulation to maintain natural LH/FSH production while HCG acts as an LH mimetic for direct testicular stimulation.",
        mechanism: "Pulsatile GnRH stimulation + direct LH mimetic action",
      },
      {
        partner: "Kisspeptin-10",
        why: "Kisspeptin-10 triggers GnRH neurons upstream while Gonadorelin acts as GnRH itself. Upstream trigger + direct GnRH for comprehensive HPG axis research.",
        mechanism: "Upstream kisspeptin GnRH trigger + direct GnRH action",
      },
    ],
  },
  "hcg": {
    name: "HCG",
    slug: "hcg",
    topPairings: [
      {
        partner: "Gonadorelin",
        why: "HCG mimics LH for direct Leydig cell stimulation while Gonadorelin provides GnRH pulses to maintain natural pituitary function. Direct stimulation + natural axis maintenance.",
        mechanism: "LH mimetic + pulsatile GnRH maintenance",
      },
      {
        partner: "Kisspeptin-10",
        why: "HCG provides direct gonadal stimulation while Kisspeptin-10 activates the hypothalamic GnRH neurons upstream. Direct + upstream hormonal axis support.",
        mechanism: "Direct gonadal LH + upstream GnRH neuron activation",
      },
    ],
  },
  "ghrp-2": {
    name: "GHRP-2",
    slug: "ghrp-2",
    topPairings: [
      {
        partner: "CJC-1295",
        why: "GHRP-2 provides potent pituitary GH release while CJC-1295 sustains the GHRH signal. Classic GHRP + GHRH combination for maximum growth hormone output.",
        mechanism: "Potent GHRP pituitary release + sustained GHRH signaling",
      },
      {
        partner: "Sermorelin",
        why: "GHRP-2 amplifies GH release at the pituitary while Sermorelin provides natural GHRH signaling. The GH Pulse Stack pairing.",
        mechanism: "GHRP pituitary amplification + natural GHRH signaling",
      },
      {
        partner: "Ipamorelin",
        why: "Both are GHRP compounds but GHRP-2 is more potent with broader effects while Ipamorelin is more selective without cortisol elevation. Can be combined for layered GH release.",
        mechanism: "Potent broad GHRP + selective clean GHRP",
      },
    ],
  },
  "ghrp-6": {
    name: "GHRP-6",
    slug: "ghrp-6",
    topPairings: [
      {
        partner: "Sermorelin",
        why: "GHRP-6 provides strong GH release with appetite stimulation (useful for appetite research) while Sermorelin adds natural GHRH signaling for sustained output.",
        mechanism: "Hunger-stimulating GHRP + natural GHRH signaling",
      },
      {
        partner: "CJC-1295",
        why: "GHRP-6 offers potent pituitary GH release while CJC-1295 sustains the signal. The GHRP + GHRH synergy amplifies total GH output significantly.",
        mechanism: "Potent GHRP release + sustained GHRH amplification",
      },
    ],
  },
  "hexarelin": {
    name: "Hexarelin",
    slug: "hexarelin",
    topPairings: [
      {
        partner: "CJC-1295",
        why: "Hexarelin is one of the most potent GHRPs with added cardioprotective benefits. Paired with CJC-1295's sustained GHRH, it creates powerful GH output plus heart protection.",
        mechanism: "Cardioprotective potent GHRP + sustained GHRH",
      },
      {
        partner: "BPC-157",
        why: "Hexarelin's cardioprotective GH release complements BPC-157's tissue healing. Recovery-focused pairing with heart and tissue protection.",
        mechanism: "Cardioprotective GH + cytoprotective tissue repair",
      },
    ],
  },
  "ace-031": {
    name: "ACE-031",
    slug: "ace-031",
    topPairings: [
      {
        partner: "IGF-1 LR3",
        why: "ACE-031 removes the brake on muscle growth by trapping myostatin/activin as a decoy receptor while IGF-1 LR3 drives anabolic growth signaling. Remove inhibition + add stimulation.",
        mechanism: "Myostatin trapping + IGF-1 anabolic signaling",
      },
      {
        partner: "MGF",
        why: "ACE-031 blocks myostatin systemically while MGF activates satellite cells locally. Systemic growth inhibition removal + local muscle repair activation.",
        mechanism: "Systemic myostatin block + local satellite cell activation",
      },
    ],
  },
  "aicar": {
    name: "AICAR",
    slug: "aicar",
    topPairings: [
      {
        partner: "MOTS-C",
        why: "AICAR directly phosphorylates AMPK while MOTS-C activates it through mitochondrial signaling. Two independent AMPK activation pathways for enhanced metabolic research.",
        mechanism: "Direct AMPK phosphorylation + mitochondrial AMPK signaling",
      },
      {
        partner: "SLU-PP-332",
        why: "AICAR activates AMPK for exercise-mimicking metabolic effects while SLU-PP-332 agonizes REV-ERB nuclear receptors for exercise gene expression. The Exercise Mimetic combination.",
        mechanism: "AMPK exercise mimicry + REV-ERB exercise gene expression",
      },
      {
        partner: "SS-31",
        why: "AICAR drives metabolic reprogramming through AMPK while SS-31 optimizes the mitochondrial electron transport chain. Metabolic drive + mitochondrial efficiency.",
        mechanism: "AMPK metabolic activation + cardiolipin ETC optimization",
      },
    ],
  },
  "vip": {
    name: "VIP",
    slug: "vip",
    topPairings: [
      {
        partner: "BPC-157",
        why: "VIP is a vasoactive intestinal peptide that supports gut-brain axis signaling while BPC-157 heals gut mucosal tissue. VIP Gut-Brain axis research combination.",
        mechanism: "Gut-brain neuropeptide signaling + gut mucosal repair",
      },
      {
        partner: "Thymosin Alpha-1",
        why: "VIP provides anti-inflammatory neuropeptide action while Thymosin Alpha-1 activates adaptive immune cells. Anti-inflammatory + immune activation for balanced immune research.",
        mechanism: "Anti-inflammatory neuropeptide + immune cell activation",
      },
    ],
  },
  "oxytocin": {
    name: "Oxytocin",
    slug: "oxytocin",
    topPairings: [
      {
        partner: "Selank",
        why: "Oxytocin promotes social bonding and trust through hypothalamic pathways while Selank provides anxiolytic mood stabilization. Together they support social and emotional wellness research.",
        mechanism: "Social bonding hormone + GABAergic anxiolysis",
      },
      {
        partner: "BPC-157",
        why: "Oxytocin modulates gut-brain axis signaling while BPC-157 heals gut mucosal tissue. Stress-related gut-brain research combination.",
        mechanism: "Hypothalamic gut-brain modulation + gut tissue repair",
      },
    ],
  },
  "pinealon": {
    name: "Pinealon",
    slug: "pinealon",
    topPairings: [
      {
        partner: "DSIP",
        why: "Pinealon supports pineal gland function and gene regulation while DSIP induces delta-wave sleep. Pineal optimization + direct sleep induction for circadian research.",
        mechanism: "Pinealocyte gene regulation + delta sleep induction",
      },
      {
        partner: "Semax",
        why: "Pinealon provides pineal-derived neuroprotection while Semax upregulates BDNF for cognitive performance. Neuroprotection + cognitive enhancement.",
        mechanism: "Pineal neuroprotection + BDNF cognitive amplification",
      },
      {
        partner: "Melatonin",
        why: "Pinealon regulates pineal gland function at the gene level while Melatonin acts directly on MT1/MT2 receptors. Upstream gene regulation + direct receptor activation.",
        mechanism: "Pineal gene regulation + direct melatonin receptor binding",
      },
    ],
  },
  "melatonin": {
    name: "Melatonin",
    slug: "melatonin",
    topPairings: [
      {
        partner: "DSIP",
        why: "Melatonin signals the circadian system through MT1/MT2 receptors while DSIP directly induces delta-wave deep sleep. Circadian timing + sleep depth optimization.",
        mechanism: "MT1/MT2 circadian signaling + delta sleep induction",
      },
      {
        partner: "Pinealon",
        why: "Melatonin provides direct receptor activation while Pinealon supports the pineal gland at the gene level. Direct action + upstream support for comprehensive circadian research.",
        mechanism: "Direct melatonin receptor action + pineal gene regulation",
      },
    ],
  },
  "slu-pp-332": {
    name: "SLU-PP-332",
    slug: "slu-pp-332",
    topPairings: [
      {
        partner: "AICAR",
        why: "SLU-PP-332 activates REV-ERB nuclear receptors for exercise gene expression while AICAR directly activates AMPK for metabolic exercise mimicry. Two pathways of exercise-mimicking research.",
        mechanism: "REV-ERB exercise gene expression + AMPK exercise pathway",
      },
      {
        partner: "MOTS-C",
        why: "SLU-PP-332 drives exercise gene expression through nuclear receptors while MOTS-C enhances mitochondrial biogenesis. Gene expression + organelle biogenesis for endurance research.",
        mechanism: "REV-ERB gene expression + mitochondrial biogenesis",
      },
    ],
  },
  "kisspeptin-10": {
    name: "Kisspeptin-10",
    slug: "kisspeptin-10",
    topPairings: [
      {
        partner: "Gonadorelin",
        why: "Kisspeptin-10 activates GnRH neurons upstream while Gonadorelin acts as GnRH directly. Sequential HPG axis stimulation from trigger to signal.",
        mechanism: "GnRH neuron trigger + direct GnRH action",
      },
      {
        partner: "HCG",
        why: "Kisspeptin-10 stimulates the top of the HPG axis while HCG directly mimics LH at the gonadal level. Full axis coverage from brain to gonad.",
        mechanism: "Upstream kisspeptin trigger + downstream LH mimetic",
      },
    ],
  },
  "melanotan-i": {
    name: "Melanotan I",
    slug: "melanotan-i",
    topPairings: [
      {
        partner: "GHK-Cu",
        why: "Melanotan I selectively stimulates melanogenesis through MC1R while GHK-Cu remodels the skin at the collagen and elastin level. Skin pigmentation + structural skin renewal.",
        mechanism: "Selective MC1R melanogenesis + copper collagen remodeling",
      },
      {
        partner: "Melanotan II",
        why: "Melanotan I provides selective MC1R activation for focused melanogenesis while Melanotan II is non-selective across melanocortin receptors for broader effects.",
        mechanism: "Selective MC1R + non-selective melanocortin activation",
      },
    ],
  },
  "cagrilintide": {
    name: "Cagrilintide",
    slug: "cagrilintide",
    topPairings: [
      {
        partner: "Retatrutide",
        why: "Cagrilintide provides long-acting amylin receptor agonism for appetite control while Retatrutide adds GLP-1/GIP/glucagon triple agonism. Dual-mechanism metabolic control.",
        mechanism: "Amylin appetite suppression + triple metabolic receptor agonism",
      },
      {
        partner: "Tesamorelin",
        why: "Cagrilintide manages appetite through amylin pathways while Tesamorelin targets visceral fat through GHRH. Appetite control + targeted fat reduction.",
        mechanism: "Amylin appetite control + GHRH visceral fat targeting",
      },
    ],
  },
  "mazdutide": {
    name: "Mazdutide",
    slug: "mazdutide",
    topPairings: [
      {
        partner: "BPC-157",
        why: "Mazdutide activates GLP-1 and glucagon receptors for metabolic effects while BPC-157 protects the gut lining. Metabolic signaling + GI protection.",
        mechanism: "Dual GLP-1/glucagon agonism + gut cytoprotection",
      },
      {
        partner: "Tesamorelin",
        why: "Mazdutide provides dual incretin agonism while Tesamorelin targets visceral fat through GHRH release. Incretin + GHRH for body composition research.",
        mechanism: "GLP-1/glucagon agonism + GHRH visceral fat targeting",
      },
    ],
  },
  "survodutide": {
    name: "Survodutide",
    slug: "survodutide",
    topPairings: [
      {
        partner: "AOD-9604",
        why: "Survodutide activates GLP-1 and glucagon receptors for energy expenditure increase while AOD-9604 provides direct lipolysis. Hormonal + direct fat breakdown.",
        mechanism: "Dual GLP-1/glucagon agonism + GH fragment lipolysis",
      },
      {
        partner: "5-Amino-1MQ",
        why: "Survodutide manages metabolic hormones while 5-Amino-1MQ inhibits NNMT at the cellular level. Hormonal + enzymatic metabolic control.",
        mechanism: "Incretin metabolic signaling + NNMT enzyme inhibition",
      },
    ],
  },
  "ara-290": {
    name: "Ara-290",
    slug: "ara-290",
    topPairings: [
      {
        partner: "BPC-157",
        why: "Ara-290 activates the innate repair receptor for EPO-derived tissue protection and nerve regeneration while BPC-157 provides systemic tissue healing. Neuroprotection + tissue repair.",
        mechanism: "Innate repair receptor activation + cytoprotective healing",
      },
      {
        partner: "Cerebrolysin",
        why: "Ara-290 provides EPO-derived neuroprotection through innate repair receptors while Cerebrolysin offers multi-peptide neurotrophic support. Dual neuroprotective pathways.",
        mechanism: "Innate repair receptor + broad neurotrophic factor support",
      },
    ],
  },
  "adipotide": {
    name: "Adipotide",
    slug: "adipotide",
    topPairings: [
      {
        partner: "AOD-9604",
        why: "Adipotide targets fat tissue vasculature through prohibitin-binding disruption while AOD-9604 provides direct lipolytic action. Vascular disruption + lipolytic fat breakdown.",
        mechanism: "Fat vasculature targeting + GH fragment lipolysis",
      },
      {
        partner: "5-Amino-1MQ",
        why: "Adipotide disrupts fat tissue blood supply while 5-Amino-1MQ inhibits NNMT enzyme in fat cells. Vascular + enzymatic approaches to fat cell targeting.",
        mechanism: "Prohibitin vascular disruption + NNMT enzyme inhibition",
      },
    ],
  },
  "alprostadil": {
    name: "Alprostadil",
    slug: "alprostadil",
    topPairings: [
      {
        partner: "BPC-157",
        why: "Alprostadil provides PGE1-mediated vasodilation while BPC-157 promotes angiogenesis and tissue repair. Vasodilation + vascular repair for circulation research.",
        mechanism: "PGE1 vasodilation + angiogenic tissue repair",
      },
      {
        partner: "PT-141",
        why: "Alprostadil provides peripheral PGE1 vasodilation while PT-141 activates central melanocortin arousal pathways. Peripheral + central mechanisms.",
        mechanism: "Peripheral PGE1 vasodilation + central MC4R activation",
      },
    ],
  },
  "pnc-27": {
    name: "PNC-27",
    slug: "pnc-27",
    topPairings: [
      {
        partner: "FOXO4-DRI",
        why: "PNC-27 targets cancer cells through HDM-2 binding for membrane disruption while FOXO4-DRI clears senescent cells through p53 pathway disruption. Targeted cell destruction + senescent cell clearance.",
        mechanism: "HDM-2 tumor disruption + FOXO4/p53 senolytic action",
      },
      {
        partner: "Thymosin Alpha-1",
        why: "PNC-27 provides targeted cellular disruption while Thymosin Alpha-1 activates the immune system for surveillance. Direct targeting + immune surveillance support.",
        mechanism: "HDM-2 targeted peptide + immune cell activation",
      },
    ],
  },
  "triptorelin": {
    name: "Triptorelin",
    slug: "triptorelin",
    topPairings: [
      {
        partner: "Gonadorelin",
        why: "Triptorelin provides a GnRH agonist reset (initial surge then desensitization) while Gonadorelin maintains pulsatile GnRH for ongoing HPG axis support.",
        mechanism: "GnRH agonist hormonal reset + pulsatile GnRH maintenance",
      },
      {
        partner: "HCG",
        why: "Triptorelin resets the HPG axis through GnRH receptor desensitization while HCG maintains testicular stimulation through LH mimetic action. Reset + maintenance protocol.",
        mechanism: "GnRH axis reset + LH mimetic testicular support",
      },
    ],
  },
  "hmg": {
    name: "HMG",
    slug: "hmg",
    topPairings: [
      {
        partner: "HCG",
        why: "HMG provides combined FSH + LH gonadotropin stimulation while HCG adds LH mimetic support. Comprehensive gonadotropin coverage for fertility research.",
        mechanism: "Combined FSH/LH stimulation + LH mimetic support",
      },
      {
        partner: "Gonadorelin",
        why: "HMG provides direct gonadotropin stimulation while Gonadorelin maintains natural GnRH pulsatile signaling upstream.",
        mechanism: "Direct gonadotropin + upstream GnRH signaling",
      },
    ],
  },
  "peg-mgf": {
    name: "PEG-MGF",
    slug: "peg-mgf",
    topPairings: [
      {
        partner: "MGF",
        why: "PEG-MGF provides extended systemic mechano growth signaling through PEGylation while MGF offers immediate local satellite cell activation. Sustained + immediate growth factor action.",
        mechanism: "PEGylated sustained MGF + immediate local MGF",
      },
      {
        partner: "IGF-1 LR3",
        why: "PEG-MGF provides mechano-specific growth signaling while IGF-1 LR3 drives broader IGF-1 mediated protein synthesis. Mechano-specific + systemic growth signaling.",
        mechanism: "Mechano growth factor + systemic IGF-1 signaling",
      },
    ],
  },
  "igf-des": {
    name: "IGF-DES",
    slug: "igf-des",
    topPairings: [
      {
        partner: "MGF",
        why: "IGF-DES provides rapid-acting truncated IGF-1 signaling while MGF activates satellite cells. Both target localized muscle signaling for precision research.",
        mechanism: "Rapid truncated IGF-1 + local satellite cell activation",
      },
      {
        partner: "IGF-1 LR3",
        why: "IGF-DES acts rapidly due to truncation while IGF-1 LR3 provides sustained signaling. Rapid + sustained IGF-1 pathway coverage.",
        mechanism: "Rapid IGF-1 action + extended IGF-1 signaling",
      },
    ],
  },
};

export function getPairingReasons(compoundSlug: string): PairingReason[] {
  const normalized = compoundSlug.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const knownAliases: Record<string, string> = {
    "cjc-1295-no-dac": "cjc-1295",
    "cjc-1295-w-dac": "cjc-1295",
    "cjc-1295-with-dac": "cjc-1295",
  };

  const resolved = knownAliases[normalized] || normalized;
  return PAIRING_INTELLIGENCE[resolved]?.topPairings || [];
}

function resolveSlug(name: string): string {
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const knownAliases: Record<string, string> = {
    "cjc-1295-no-dac": "cjc-1295",
    "cjc-1295-w-dac": "cjc-1295",
    "cjc-1295-with-dac": "cjc-1295",
  };

  return knownAliases[slug] || slug;
}

export function getTopPairingForProduct(productName: string, partnerName: string): PairingReason | null {
  const productSlug = resolveSlug(productName);
  const partnerSlug = resolveSlug(partnerName);

  const forwardPairings = PAIRING_INTELLIGENCE[productSlug]?.topPairings || [];
  const forwardMatch = forwardPairings.find(p => resolveSlug(p.partner) === partnerSlug);
  if (forwardMatch) return forwardMatch;

  const reversePairings = PAIRING_INTELLIGENCE[partnerSlug]?.topPairings || [];
  const reverseMatch = reversePairings.find(p => resolveSlug(p.partner) === productSlug);
  return reverseMatch || null;
}

export function getCrossSellSuggestions(cartProductNames: string[]): { product: string; reason: string; forProduct: string }[] {
  const suggestions: { product: string; reason: string; forProduct: string; score: number }[] = [];
  const cartNorms = new Set(cartProductNames.map(n => n.toLowerCase()));

  for (const productName of cartProductNames) {
    const pairings = getPairingReasons(productName);
    for (const pairing of pairings) {
      if (!cartNorms.has(pairing.partner.toLowerCase())) {
        const existing = suggestions.find(s => s.product.toLowerCase() === pairing.partner.toLowerCase());
        if (!existing) {
          suggestions.push({
            product: pairing.partner,
            reason: pairing.mechanism,
            forProduct: productName,
            score: pairings.indexOf(pairing),
          });
        }
      }
    }
  }

  suggestions.sort((a, b) => a.score - b.score);
  return suggestions.slice(0, 3).map(({ product, reason, forProduct }) => ({ product, reason, forProduct }));
}
