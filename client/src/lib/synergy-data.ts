import { Zap, Sparkles, Rocket, Heart, Activity, Brain, Crown, Moon, Shield, Dumbbell, Flame, Target, RefreshCw, Leaf, Pill, Eye, Syringe, Droplets, Sun, Wind, CircleDot, Crosshair, Scan, LucideIcon } from "lucide-react";

export interface KnownStack {
  name: string;
  peptides: string[];
  icon: LucideIcon;
  color: string;
  description: string;
  synergyBonus: number;
}

export interface PeptidePathway {
  name: string;
  pathways: string[];
  mechanisms: string[];
  systems: string[];
}

export const KNOWN_STACKS: KnownStack[] = [
  {
    name: "Wolverine Stack",
    peptides: ["bpc-157", "tb-500"],
    icon: Zap,
    color: "#22c55e",
    description: "BPC-157 drives local repair via VEGF upregulation while TB-500 provides systemic healing through thymosin beta-4 actin regulation \u2014 covering both localized and whole-body regeneration",
    synergyBonus: 95,
  },
  {
    name: "Total Regen",
    peptides: ["bpc-157", "tb-500", "ipamorelin"],
    icon: Shield,
    color: "#10b981",
    description: "Local VEGF-driven healing + systemic thymosin repair + selective GH/IGF-1 amplification for comprehensive tissue regeneration",
    synergyBonus: 92,
  },
  {
    name: "Gut Restore",
    peptides: ["bpc-157", "kpv"],
    icon: Pill,
    color: "#14b8a6",
    description: "BPC-157 repairs gut mucosal lining through cytoprotection while KPV inhibits NF-\u03BAB inflammatory cascades \u2014 structural repair + inflammation suppression",
    synergyBonus: 91,
  },
  {
    name: "Glow Protocol",
    peptides: ["bpc-157", "tb-500", "ghk-cu"],
    icon: Sparkles,
    color: "#ec4899",
    description: "Copper-peptide collagen synthesis + thymosin vascular repair + VEGF-driven angiogenesis for multi-layer skin regeneration",
    synergyBonus: 90,
  },
  {
    name: "GH Amplifier",
    peptides: ["ipamorelin", "cjc-1295"],
    icon: Rocket,
    color: "#f59e0b",
    description: "Pituitary GHRP + hypothalamic GHRH dual-axis stimulation \u2014 the gold-standard GH amplification protocol producing synergistic output far greater than either alone",
    synergyBonus: 88,
  },
  {
    name: "Lean Mass",
    peptides: ["cjc-1295", "ipamorelin", "mots-c"],
    icon: Dumbbell,
    color: "#f97316",
    description: "Dual-axis GH amplification + AMPK-driven mitochondrial energy production for body composition optimization",
    synergyBonus: 87,
  },
  {
    name: "Cognitive Edge",
    peptides: ["semax", "selank"],
    icon: Brain,
    color: "#21d8ff",
    description: "Gold-standard nootropic pairing \u2014 BDNF/NGF cognitive enhancement + GABAergic anxiolytic modulation for calm, focused performance",
    synergyBonus: 86,
  },
  {
    name: "Anti-Aging Protocol",
    peptides: ["epithalon", "ghk-cu", "ipamorelin"],
    icon: Leaf,
    color: "#84cc16",
    description: "Telomerase activation + DNA repair gene expression + GH-driven tissue renewal \u2014 three complementary anti-aging mechanisms",
    synergyBonus: 85,
  },
  {
    name: "Longevity Protocol",
    peptides: ["epithalon", "ghk-cu"],
    icon: Crown,
    color: "#a855f7",
    description: "Epithalon activates telomerase for cellular longevity while GHK-Cu activates DNA repair genes and collagen turnover \u2014 both address aging at the cellular level",
    synergyBonus: 84,
  },
  {
    name: "Deep Sleep Formula",
    peptides: ["dsip", "ipamorelin", "epithalon"],
    icon: Moon,
    color: "#6366f1",
    description: "Delta sleep induction + sleep-phase GH release + pineal melatonin regulation \u2014 optimizing the nighttime regeneration window",
    synergyBonus: 84,
  },
  {
    name: "Fat Burner Stack",
    peptides: ["tesamorelin", "cjc-1295", "mots-c"],
    icon: Flame,
    color: "#ef4444",
    description: "Targeted fat reduction + GH elevation + metabolic acceleration",
    synergyBonus: 83,
  },
  {
    name: "Recovery+",
    peptides: ["bpc-157", "ghk-cu"],
    icon: Heart,
    color: "#22c55e",
    description: "GHK-Cu drives copper-dependent collagen and elastin synthesis while BPC-157 provides the vascular infrastructure for nutrient delivery to remodeling tissue",
    synergyBonus: 82,
  },
  {
    name: "Performance Stack",
    peptides: ["cjc-1295", "ipamorelin", "bpc-157"],
    icon: Target,
    color: "#8b5cf6",
    description: "GH optimization + tissue protection for athletic performance",
    synergyBonus: 81,
  },
  {
    name: "Energy Stack",
    peptides: ["mots-c", "rr-a3"],
    icon: Activity,
    color: "#E7FB10",
    description: "Mitochondrial power + metabolic signaling",
    synergyBonus: 80,
  },
  {
    name: "Immune Boost",
    peptides: ["thymalin", "selank", "kpv"],
    icon: RefreshCw,
    color: "#06b6d4",
    description: "Thymus support + immune modulation + anti-inflammatory",
    synergyBonus: 79,
  },
  {
    name: "Metabolic Reset",
    peptides: ["rr-a3", "bpc-157"],
    icon: RefreshCw,
    color: "#10b981",
    description: "GLP-1/GIP/glucagon triple receptor agonism + gut cytoprotection \u2014 BPC-157 supports GI comfort during metabolic compound research",
    synergyBonus: 88,
  },
  {
    name: "Dual Metabolic",
    peptides: ["rr-a3", "aod-9604"],
    icon: Flame,
    color: "#f97316",
    description: "GLP-1/GIP/glucagon triple agonist + targeted lipolysis fragment",
    synergyBonus: 85,
  },
  {
    name: "Metabolic Optimizer",
    peptides: ["rr-a3", "tesamorelin"],
    icon: Target,
    color: "#eab308",
    description: "Triple receptor metabolic control + visceral fat-targeting GHRH analog",
    synergyBonus: 84,
  },
  {
    name: "Fat Metabolism Pro",
    peptides: ["aod-9604", "mots-c"],
    icon: Flame,
    color: "#dc2626",
    description: "HGH fragment lipolysis + AMPK-driven mitochondrial fat oxidation",
    synergyBonus: 83,
  },
  {
    name: "Cognitive Powerhouse",
    peptides: ["cerebrolysin", "semax", "selank"],
    icon: Brain,
    color: "#7c3aed",
    description: "Multi-peptide neurotrophic mix + targeted BDNF/NGF stimulation + GABAergic mood stabilization \u2014 triple-layered brain support",
    synergyBonus: 90,
  },
  {
    name: "Muscle Growth Stack",
    peptides: ["igf-1-lr3", "mgf"],
    icon: Dumbbell,
    color: "#dc2626",
    description: "Systemic IGF-1 signaling + localized mechano growth factor for hypertrophy",
    synergyBonus: 87,
  },
  {
    name: "Immune Defense",
    peptides: ["ll-37", "thymalin"],
    icon: Shield,
    color: "#0891b2",
    description: "LL-37 cathelicidin provides innate antimicrobial defense while Thymalin restores adaptive immunity through thymic T-cell regeneration",
    synergyBonus: 85,
  },
  {
    name: "Desire Protocol",
    peptides: ["melanotan-ii", "pt-141"],
    icon: Heart,
    color: "#e11d48",
    description: "Melanocortin receptor activation for libido + arousal enhancement",
    synergyBonus: 86,
  },
  {
    name: "Mitochondrial Stack",
    peptides: ["ss-31", "mots-c"],
    icon: Zap,
    color: "#059669",
    description: "SS-31 stabilizes cardiolipin in mitochondrial membranes, then MOTS-C activates AMPK for new mitochondrial biogenesis \u2014 sequential: prime existing, then build new",
    synergyBonus: 88,
  },
  {
    name: "Hormonal Balance",
    peptides: ["hcg", "gonadorelin"],
    icon: Activity,
    color: "#7c3aed",
    description: "LH mimetic + GnRH pulsatile stimulation for endogenous testosterone",
    synergyBonus: 84,
  },
  {
    name: "Anti-Wrinkle Complex",
    peptides: ["snap-8", "ghk-cu"],
    icon: Sparkles,
    color: "#f472b6",
    description: "Neuromuscular relaxation + copper-peptide collagen remodeling",
    synergyBonus: 83,
  },
  {
    name: "Sleep Optimization",
    peptides: ["pinealon", "dsip", "melatonin"],
    icon: Moon,
    color: "#4f46e5",
    description: "Pineal gland peptide + delta sleep inducer + circadian hormone",
    synergyBonus: 86,
  },
  {
    name: "GH Secretagogue Duo",
    peptides: ["ghrp-2", "cjc-1295"],
    icon: Rocket,
    color: "#ea580c",
    description: "Potent GH release peptide + sustained GHRH for amplified growth hormone",
    synergyBonus: 87,
  },
  {
    name: "GH Pulse Stack",
    peptides: ["ghrp-6", "sermorelin"],
    icon: Rocket,
    color: "#d97706",
    description: "Hunger-stimulating GH release + natural GHRH analog for deep GH pulses",
    synergyBonus: 85,
  },
  {
    name: "Sermorelin Amplifier",
    peptides: ["sermorelin", "ipamorelin"],
    icon: Zap,
    color: "#f59e0b",
    description: "GHRH analog + selective GHRP for clean growth hormone elevation",
    synergyBonus: 86,
  },
  {
    name: "Triple GH Protocol",
    peptides: ["sermorelin", "ghrp-2", "ipamorelin"],
    icon: Crown,
    color: "#b45309",
    description: "GHRH base + dual GHRP synergy for maximum natural GH output",
    synergyBonus: 89,
  },
  {
    name: "Joint Repair",
    peptides: ["bpc-157", "hyaluronic-acid"],
    icon: RefreshCw,
    color: "#0d9488",
    description: "Connective tissue healing + synovial fluid restoration for joint health",
    synergyBonus: 82,
  },
  {
    name: "Neuroprotective Stack",
    peptides: ["cerebrolysin", "pinealon"],
    icon: Brain,
    color: "#6d28d9",
    description: "Neurotrophic peptide mix + pineal-derived neuroprotection",
    synergyBonus: 84,
  },
  {
    name: "Advanced Nootropic",
    peptides: ["semax", "cerebrolysin"],
    icon: Eye,
    color: "#4f46e5",
    description: "BDNF/NGF stimulation + multi-peptide neurotrophic support",
    synergyBonus: 85,
  },
  {
    name: "Skin Renewal",
    peptides: ["ghk-cu", "hyaluronic-acid", "glow-peptide-complex"],
    icon: Sparkles,
    color: "#ec4899",
    description: "Copper collagen synthesis + hydration matrix + glow enhancement",
    synergyBonus: 84,
  },
  {
    name: "Fertility Support",
    peptides: ["kisspeptin-10", "gonadorelin"],
    icon: Heart,
    color: "#db2777",
    description: "Kisspeptin GnRH triggering + direct GnRH pulsatile stimulation",
    synergyBonus: 85,
  },
  {
    name: "Fertility Combo",
    peptides: ["hcg", "hmg", "gonadorelin"],
    icon: CircleDot,
    color: "#a855f7",
    description: "LH + FSH stimulation + GnRH support for complete fertility optimization",
    synergyBonus: 87,
  },
  {
    name: "Weight Management Pro",
    peptides: ["cagrilintide", "rr-a3"],
    icon: Target,
    color: "#16a34a",
    description: "Amylin analog appetite control + triple metabolic receptor agonist",
    synergyBonus: 88,
  },
  {
    name: "GLP-1 Duo",
    peptides: ["mazdutide", "bpc-157"],
    icon: Pill,
    color: "#0d9488",
    description: "Dual GLP-1/glucagon agonist + gut protective healing peptide",
    synergyBonus: 83,
  },
  {
    name: "Survodutide Stack",
    peptides: ["survodutide", "aod-9604"],
    icon: Flame,
    color: "#e11d48",
    description: "GLP-1/glucagon dual agonist + HGH fragment for body composition",
    synergyBonus: 82,
  },
  {
    name: "Weight Loss Trio",
    peptides: ["survodutide", "5-amino-1mq", "mots-c"],
    icon: Activity,
    color: "#f97316",
    description: "Incretin signaling + NNMT inhibition + mitochondrial metabolism",
    synergyBonus: 85,
  },
  {
    name: "NNMT Metabolic",
    peptides: ["5-amino-1mq", "aod-9604"],
    icon: Crosshair,
    color: "#dc2626",
    description: "NNMT enzyme inhibition + GH fragment lipolysis for fat cell targeting",
    synergyBonus: 81,
  },
  {
    name: "Myostatin Block",
    peptides: ["ace-031", "igf-1-lr3"],
    icon: Dumbbell,
    color: "#b91c1c",
    description: "ActRIIB decoy receptor + IGF-1 for muscle growth beyond natural limits",
    synergyBonus: 86,
  },
  {
    name: "Muscle Builder Pro",
    peptides: ["ace-031", "mgf", "peg-mgf"],
    icon: Dumbbell,
    color: "#991b1b",
    description: "Myostatin inhibition + local + extended mechano growth factors",
    synergyBonus: 85,
  },
  {
    name: "Exercise Mimetic",
    peptides: ["aicar", "slu-pp-332"],
    icon: Activity,
    color: "#65a30d",
    description: "AMPK activation + REV-ERB agonism for exercise-pathway mimicry",
    synergyBonus: 84,
  },
  {
    name: "Endurance Stack",
    peptides: ["aicar", "mots-c", "ss-31"],
    icon: Wind,
    color: "#0891b2",
    description: "Triple metabolic boost - AMPK + mitochondrial biogenesis + cardiolipin",
    synergyBonus: 87,
  },
  {
    name: "Vascular Fat Loss",
    peptides: ["adipotide", "aod-9604"],
    icon: Crosshair,
    color: "#be123c",
    description: "Fat vasculature targeting + HGH fragment lipolysis",
    synergyBonus: 80,
  },
  {
    name: "Vascular Health",
    peptides: ["alprostadil", "bpc-157"],
    icon: Heart,
    color: "#e11d48",
    description: "PGE1 vasodilation + angiogenic tissue repair for circulation",
    synergyBonus: 81,
  },
  {
    name: "Nerve Repair",
    peptides: ["ara-290", "bpc-157"],
    icon: Zap,
    color: "#059669",
    description: "EPO-derived neuroprotection + systemic tissue healing",
    synergyBonus: 83,
  },
  {
    name: "Neuropathy Relief",
    peptides: ["ara-290", "cerebrolysin"],
    icon: Brain,
    color: "#7c3aed",
    description: "Innate repair receptor activation + neurotrophic factor support",
    synergyBonus: 82,
  },
  {
    name: "Immune Sentinel",
    peptides: ["ll-37", "thymosin-alpha-1"],
    icon: Shield,
    color: "#0e7490",
    description: "Cathelicidin antimicrobial + thymic immune cell activation",
    synergyBonus: 87,
  },
  {
    name: "Full Immune Protocol",
    peptides: ["thymosin-alpha-1", "thymalin", "kpv"],
    icon: Shield,
    color: "#155e75",
    description: "Thymosin immune activation + thymic regeneration + anti-inflammatory",
    synergyBonus: 86,
  },
  {
    name: "Gut Immune Shield",
    peptides: ["ll-37", "kpv", "bpc-157"],
    icon: Pill,
    color: "#0d9488",
    description: "Antimicrobial defense + gut anti-inflammatory + mucosal healing",
    synergyBonus: 88,
  },
  {
    name: "Anti-Cancer Research",
    peptides: ["pnc-27", "foxo4-dri"],
    icon: Crosshair,
    color: "#7f1d1d",
    description: "HDM-2 binding tumor disruption + senescent cell apoptosis induction",
    synergyBonus: 82,
  },
  {
    name: "Senolytic Protocol",
    peptides: ["foxo4-dri", "epithalon"],
    icon: Leaf,
    color: "#4d7c0f",
    description: "Senescent cell clearance + telomerase activation for cellular renewal",
    synergyBonus: 84,
  },
  {
    name: "Antioxidant Defense",
    peptides: ["glutathione", "ss-31"],
    icon: Shield,
    color: "#16a34a",
    description: "Master antioxidant + mitochondrial membrane protection",
    synergyBonus: 83,
  },
  {
    name: "Detox & Longevity",
    peptides: ["glutathione", "epithalon", "ghk-cu"],
    icon: Leaf,
    color: "#65a30d",
    description: "Cellular detoxification + telomere support + tissue remodeling",
    synergyBonus: 82,
  },
  {
    name: "Tanning & Libido",
    peptides: ["melanotan-ii", "melanotan-i"],
    icon: Sun,
    color: "#ca8a04",
    description: "MC1R activation duo - broad + selective melanocortin stimulation",
    synergyBonus: 80,
  },
  {
    name: "Skin Pigmentation",
    peptides: ["melanotan-i", "ghk-cu"],
    icon: Sun,
    color: "#d97706",
    description: "Selective melanogenesis + copper-peptide skin remodeling",
    synergyBonus: 78,
  },
  {
    name: "Oxytocin Mood",
    peptides: ["oxytocin", "selank"],
    icon: Heart,
    color: "#db2777",
    description: "Social bonding hormone + anxiolytic mood stabilization",
    synergyBonus: 79,
  },
  {
    name: "Hexarelin Power",
    peptides: ["hexarelin", "cjc-1295"],
    icon: Rocket,
    color: "#ea580c",
    description: "Potent ghrelin-mimetic GH release + sustained GHRH signaling",
    synergyBonus: 85,
  },
  {
    name: "Hexarelin Recovery",
    peptides: ["hexarelin", "bpc-157"],
    icon: Zap,
    color: "#059669",
    description: "Cardioprotective GH release + tissue healing for athletic recovery",
    synergyBonus: 82,
  },
  {
    name: "IGF Growth Protocol",
    peptides: ["igf-1-lr3", "igf-des", "cjc-1295"],
    icon: Dumbbell,
    color: "#b91c1c",
    description: "Long-acting IGF-1 + rapid-acting IGF + upstream GH stimulation",
    synergyBonus: 86,
  },
  {
    name: "MGF Extended",
    peptides: ["mgf", "peg-mgf"],
    icon: Dumbbell,
    color: "#7f1d1d",
    description: "Immediate mechano growth factor + PEGylated extended-release MGF",
    synergyBonus: 82,
  },
  {
    name: "Hormonal Restart",
    peptides: ["triptorelin", "gonadorelin"],
    icon: RefreshCw,
    color: "#6d28d9",
    description: "GnRH agonist hormonal reset + pulsatile GnRH maintenance",
    synergyBonus: 83,
  },
  {
    name: "Male Fertility",
    peptides: ["hcg", "kisspeptin-10", "hmg"],
    icon: CircleDot,
    color: "#9333ea",
    description: "LH support + kisspeptin GnRH trigger + FSH/LH gonadotropin combo",
    synergyBonus: 86,
  },
  {
    name: "PCT Support",
    peptides: ["hcg", "triptorelin"],
    icon: RefreshCw,
    color: "#7c3aed",
    description: "LH mimetic maintenance + GnRH reset for post-cycle recovery",
    synergyBonus: 81,
  },
  {
    name: "VIP Gut-Brain",
    peptides: ["vip", "bpc-157"],
    icon: Pill,
    color: "#0d9488",
    description: "Vasoactive intestinal peptide + gut healing for GI-neurological axis",
    synergyBonus: 82,
  },
  {
    name: "VIP Immune",
    peptides: ["vip", "thymosin-alpha-1"],
    icon: Shield,
    color: "#0891b2",
    description: "Anti-inflammatory neuropeptide + immune system modulator",
    synergyBonus: 80,
  },
  {
    name: "Botox Alternative",
    peptides: ["botulinum-toxin-type-a", "snap-8"],
    icon: Sparkles,
    color: "#ec4899",
    description: "Neuromuscular junction blockade + SNARE complex inhibition",
    synergyBonus: 81,
  },
  {
    name: "Ultimate Anti-Aging Skin",
    peptides: ["snap-8", "ghk-cu", "glow-peptide-complex"],
    icon: Sparkles,
    color: "#f472b6",
    description: "Wrinkle relaxation + collagen remodeling + radiance complex",
    synergyBonus: 85,
  },
  {
    name: "KLOW Skin Combo",
    peptides: ["klow-peptide-complex", "ghk-cu", "hyaluronic-acid"],
    icon: Droplets,
    color: "#ec4899",
    description: "Targeted skin complex + copper peptide renewal + deep hydration",
    synergyBonus: 83,
  },
  {
    name: "Melatonin Sleep Plus",
    peptides: ["melatonin", "dsip"],
    icon: Moon,
    color: "#4338ca",
    description: "Circadian hormone + delta sleep inducing peptide for deep rest",
    synergyBonus: 84,
  },
  {
    name: "Cagrilintide Metabolic",
    peptides: ["cagrilintide", "tesamorelin"],
    icon: Target,
    color: "#15803d",
    description: "Long-acting amylin analog + visceral fat-targeting GH release",
    synergyBonus: 83,
  },
  {
    name: "REV-ERB Endurance",
    peptides: ["slu-pp-332", "mots-c"],
    icon: Wind,
    color: "#0d9488",
    description: "REV-ERB nuclear receptor agonist + mitochondrial-derived metabolic peptide",
    synergyBonus: 83,
  },
  {
    name: "Mazdutide Duo",
    peptides: ["mazdutide", "tesamorelin"],
    icon: Flame,
    color: "#ea580c",
    description: "GLP-1/glucagon dual agonist + GHRH visceral fat reduction",
    synergyBonus: 82,
  },
  {
    name: "Adipotide Research",
    peptides: ["adipotide", "5-amino-1mq"],
    icon: Crosshair,
    color: "#9f1239",
    description: "Fat vasculature disruption + NNMT enzyme inhibition",
    synergyBonus: 79,
  },
  {
    name: "Alprostadil Circulation",
    peptides: ["alprostadil", "tb-500"],
    icon: Heart,
    color: "#dc2626",
    description: "PGE1 vasodilation + thymosin-derived vascular repair",
    synergyBonus: 80,
  },
  {
    name: "Sexual Wellness",
    peptides: ["pt-141", "alprostadil"],
    icon: Heart,
    color: "#e11d48",
    description: "Central melanocortin arousal + peripheral vasodilation",
    synergyBonus: 83,
  },
  {
    name: "PNC-27 Research",
    peptides: ["pnc-27", "thymosin-alpha-1"],
    icon: Scan,
    color: "#7f1d1d",
    description: "HDM-2 targeted peptide + immune activation for research",
    synergyBonus: 78,
  },
  {
    name: "Pinealon Focus",
    peptides: ["pinealon", "semax"],
    icon: Eye,
    color: "#6d28d9",
    description: "Pineal neuropeptide + BDNF-enhancing nootropic",
    synergyBonus: 81,
  },
  {
    name: "AOD Fat Stack",
    peptides: ["aod-9604", "tesamorelin", "5-amino-1mq"],
    icon: Flame,
    color: "#dc2626",
    description: "HGH fragment + visceral fat GHRH + NNMT inhibition triple approach",
    synergyBonus: 85,
  },
  {
    name: "AICAR Metabolic",
    peptides: ["aicar", "5-amino-1mq"],
    icon: Activity,
    color: "#65a30d",
    description: "AMPK direct activator + NNMT enzyme inhibitor for metabolic reprogramming",
    synergyBonus: 82,
  },
  {
    name: "Cosmetic Neuromodulator",
    peptides: ["botulinum-toxin-type-a", "hyaluronic-acid"],
    icon: Sparkles,
    color: "#f472b6",
    description: "Neuromuscular relaxation + tissue hydration for aesthetic research",
    synergyBonus: 80,
  },
  {
    name: "GHRP-6 Amplifier",
    peptides: ["ghrp-6", "cjc-1295"],
    icon: Rocket,
    color: "#ea580c",
    description: "Hunger-driven GH release + sustained GHRH for powerful growth hormone output",
    synergyBonus: 86,
  },
  {
    name: "IGF Precision",
    peptides: ["igf-des", "mgf"],
    icon: Crosshair,
    color: "#b91c1c",
    description: "Rapid-acting truncated IGF-1 + mechano growth factor for localized muscle signaling",
    synergyBonus: 83,
  },
  {
    name: "KLOW Hair Restore",
    peptides: ["klow-peptide-complex", "glow-peptide-complex"],
    icon: Sun,
    color: "#d97706",
    description: "Keratin-targeted hair peptide + skin radiance complex for integumentary renewal",
    synergyBonus: 79,
  },
  {
    name: "Oxytocin Wellness",
    peptides: ["oxytocin", "bpc-157"],
    icon: Heart,
    color: "#ec4899",
    description: "Social bonding neuropeptide + tissue healing for stress-related gut-brain support",
    synergyBonus: 78,
  },
];

export const PEPTIDE_PATHWAYS: Record<string, PeptidePathway> = {
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
    pathways: ["GLP-1", "GIP", "Glucagon"],
    mechanisms: ["Triple receptor agonist", "Insulin sensitivity", "Fat oxidation"],
    systems: ["Metabolic", "Weight", "Fat Loss"],
  },
  "ipamorelin": {
    name: "Ipamorelin",
    pathways: ["GHRP", "Ghrelin Receptor"],
    mechanisms: ["Selective GH release", "No cortisol spike", "Appetite neutral"],
    systems: ["Growth", "Recovery", "Sleep"],
  },
  "cjc-1295": {
    name: "CJC-1295",
    pathways: ["GHRH", "GH Axis"],
    mechanisms: ["Extended GH pulses", "IGF-1 elevation", "DAC stabilization"],
    systems: ["Growth", "Recovery", "Metabolic"],
  },
  "epithalon": {
    name: "Epithalon",
    pathways: ["Telomerase", "Pineal Gland"],
    mechanisms: ["Telomere elongation", "Melatonin regulation", "Anti-aging"],
    systems: ["Longevity", "Sleep", "Immunity"],
  },
  "semax": {
    name: "Semax",
    pathways: ["BDNF", "NGF", "ACTH Fragment"],
    mechanisms: ["Neuroprotection", "Cognitive enhancement", "Memory formation"],
    systems: ["Cognitive", "Neuroprotection", "Focus"],
  },
  "selank": {
    name: "Selank",
    pathways: ["GABA", "Tuftsin Analog"],
    mechanisms: ["Anxiolytic", "Immune modulation", "Mood regulation"],
    systems: ["Cognitive", "Mood", "Immunity"],
  },
  "kpv": {
    name: "KPV",
    pathways: ["Alpha-MSH Fragment", "NF-κB Inhibition"],
    mechanisms: ["Potent anti-inflammatory", "Gut barrier repair", "Immune modulation"],
    systems: ["Gut", "Immunity", "Healing"],
  },
  "dsip": {
    name: "DSIP",
    pathways: ["Delta Sleep", "Hypothalamus"],
    mechanisms: ["Sleep induction", "Stress modulation", "Circadian regulation"],
    systems: ["Sleep", "Recovery", "Mood"],
  },
  "tesamorelin": {
    name: "Tesamorelin",
    pathways: ["GHRH Analog", "GH Axis"],
    mechanisms: ["Targeted visceral fat reduction", "GH release", "Lipodystrophy treatment"],
    systems: ["Metabolic", "Fat Loss", "Growth"],
  },
  "thymalin": {
    name: "Thymalin",
    pathways: ["Thymus", "Immune Restoration"],
    mechanisms: ["T-cell maturation", "Immune reconstitution", "Thymic regeneration"],
    systems: ["Immunity", "Longevity", "Recovery"],
  },
  "5-amino-1mq": {
    name: "5-Amino-1MQ",
    pathways: ["NNMT Inhibition", "NAD+ Metabolism"],
    mechanisms: ["NNMT enzyme blockade", "SAM conservation", "Fat cell energy shift"],
    systems: ["Metabolic", "Fat Loss", "Energy"],
  },
  "ace-031": {
    name: "ACE-031",
    pathways: ["ActRIIB Decoy", "Myostatin Inhibition"],
    mechanisms: ["Activin/myostatin trapping", "Follistatin-like action", "Muscle anabolism"],
    systems: ["Muscle", "Growth", "Recovery"],
  },
  "aicar": {
    name: "AICAR",
    pathways: ["AMPK Activation", "Metabolic Signaling"],
    mechanisms: ["Direct AMPK phosphorylation", "Exercise mimicry", "Glucose uptake"],
    systems: ["Metabolic", "Energy", "Fat Loss"],
  },
  "aod-9604": {
    name: "AOD-9604",
    pathways: ["GH Fragment", "Lipolysis"],
    mechanisms: ["Beta-3 adrenergic stimulation", "Fat cell apoptosis", "No IGF-1 increase"],
    systems: ["Fat Loss", "Metabolic", "Weight"],
  },
  "adipotide": {
    name: "Adipotide",
    pathways: ["PROHIBITIN Targeting", "Vascular Disruption"],
    mechanisms: ["Fat vasculature apoptosis", "White adipose targeting", "Blood vessel disruption"],
    systems: ["Fat Loss", "Weight", "Metabolic"],
  },
  "alprostadil": {
    name: "Alprostadil",
    pathways: ["PGE1", "cAMP Signaling"],
    mechanisms: ["Smooth muscle relaxation", "Vasodilation", "Platelet inhibition"],
    systems: ["Sexual Health", "Heart", "Healing"],
  },
  "ara-290": {
    name: "Ara-290",
    pathways: ["Innate Repair Receptor", "EPO-derived"],
    mechanisms: ["Tissue-protective EPO signaling", "Anti-inflammatory", "Nerve regeneration"],
    systems: ["Neuroprotection", "Healing", "Recovery"],
  },
  "botulinum-toxin-type-a": {
    name: "Botulinum Toxin Type A",
    pathways: ["SNARE Complex", "Neuromuscular Junction"],
    mechanisms: ["Acetylcholine release inhibition", "Muscle paralysis", "Wrinkle reduction"],
    systems: ["Skin", "Anti-Aging", "Muscle"],
  },
  "cagrilintide": {
    name: "Cagrilintide",
    pathways: ["Amylin Receptor", "Satiety Signaling"],
    mechanisms: ["Long-acting amylin analog", "Appetite suppression", "Gastric emptying delay"],
    systems: ["Weight", "Metabolic", "Fat Loss"],
  },
  "cerebrolysin": {
    name: "Cerebrolysin",
    pathways: ["Neurotrophic Factors", "BDNF/NGF"],
    mechanisms: ["Multi-peptide neurotrophic mix", "Synaptic plasticity", "Neuronal survival"],
    systems: ["Cognitive", "Neuroprotection", "Recovery"],
  },
  "foxo4-dri": {
    name: "FOXO4-DRI",
    pathways: ["FOXO4/p53 Disruption", "Senolysis"],
    mechanisms: ["Senescent cell apoptosis", "p53 nuclear exclusion", "Cellular clearance"],
    systems: ["Longevity", "Anti-Aging", "Recovery"],
  },
  "ghrp-2": {
    name: "GHRP-2",
    pathways: ["GHRP", "Ghrelin Receptor"],
    mechanisms: ["Potent GH release", "Appetite stimulation", "Cortisol modulation"],
    systems: ["Growth", "Recovery", "Muscle"],
  },
  "ghrp-6": {
    name: "GHRP-6",
    pathways: ["GHRP", "Ghrelin Receptor"],
    mechanisms: ["Strong GH release", "Hunger stimulation", "IGF-1 elevation"],
    systems: ["Growth", "Muscle", "Recovery"],
  },
  "glow-peptide-complex": {
    name: "GLOW Peptide Complex",
    pathways: ["Collagen Synthesis", "Melanin Regulation"],
    mechanisms: ["Skin radiance enhancement", "Antioxidant protection", "Hydration support"],
    systems: ["Skin", "Anti-Aging", "Hair"],
  },
  "glutathione": {
    name: "Glutathione",
    pathways: ["GSH Redox Cycle", "Phase II Detoxification"],
    mechanisms: ["Master antioxidant", "Free radical neutralization", "Liver detoxification"],
    systems: ["Immunity", "Skin", "Longevity"],
  },
  "gonadorelin": {
    name: "Gonadorelin",
    pathways: ["GnRH", "HPG Axis"],
    mechanisms: ["Pulsatile LH/FSH release", "Gonadotropin stimulation", "Fertility support"],
    systems: ["Hormonal", "Fertility", "Recovery"],
  },
  "hcg": {
    name: "HCG",
    pathways: ["LH Receptor", "HPG Axis"],
    mechanisms: ["LH mimetic action", "Testosterone stimulation", "Leydig cell support"],
    systems: ["Hormonal", "Fertility", "Recovery"],
  },
  "hmg": {
    name: "HMG",
    pathways: ["FSH/LH Combined", "Gonadotropin"],
    mechanisms: ["Dual FSH + LH stimulation", "Spermatogenesis support", "Ovarian stimulation"],
    systems: ["Fertility", "Hormonal", "Recovery"],
  },
  "hexarelin": {
    name: "Hexarelin",
    pathways: ["GHRP", "Ghrelin Receptor"],
    mechanisms: ["Strong GH secretagogue", "Cardioprotective effects", "IGF-1 stimulation"],
    systems: ["Growth", "Heart", "Recovery"],
  },
  "hyaluronic-acid": {
    name: "Hyaluronic Acid",
    pathways: ["Extracellular Matrix", "CD44 Receptor"],
    mechanisms: ["Water retention in tissues", "Joint lubrication", "Skin hydration"],
    systems: ["Skin", "Joints", "Anti-Aging"],
  },
  "igf-1-lr3": {
    name: "IGF-1 LR3",
    pathways: ["IGF-1 Receptor", "PI3K/Akt"],
    mechanisms: ["Extended IGF-1 signaling", "Protein synthesis", "Cell proliferation"],
    systems: ["Muscle", "Growth", "Recovery"],
  },
  "igf-des": {
    name: "IGF-DES",
    pathways: ["IGF-1 Receptor", "Truncated IGF-1"],
    mechanisms: ["Rapid IGF-1 action", "Enhanced bioavailability", "Local tissue growth"],
    systems: ["Muscle", "Growth", "Recovery"],
  },
  "klow-peptide-complex": {
    name: "KLOW Peptide Complex",
    pathways: ["Keratin Synthesis", "Growth Factor Signaling"],
    mechanisms: ["Hair follicle stimulation", "Scalp nourishment", "Keratinocyte activation"],
    systems: ["Hair", "Skin", "Anti-Aging"],
  },
  "kisspeptin-10": {
    name: "Kisspeptin-10",
    pathways: ["Kisspeptin/GPR54", "GnRH Stimulation"],
    mechanisms: ["GnRH neuron activation", "LH surge triggering", "Reproductive signaling"],
    systems: ["Fertility", "Hormonal", "Sexual Health"],
  },
  "ll-37": {
    name: "LL-37",
    pathways: ["Cathelicidin", "Innate Immunity"],
    mechanisms: ["Antimicrobial membrane disruption", "Immune cell recruitment", "Biofilm disruption"],
    systems: ["Immunity", "Healing", "Gut"],
  },
  "mgf": {
    name: "MGF",
    pathways: ["IGF-1 Splice Variant", "Mechano-Growth"],
    mechanisms: ["Satellite cell activation", "Local muscle repair", "Myoblast proliferation"],
    systems: ["Muscle", "Recovery", "Growth"],
  },
  "mazdutide": {
    name: "Mazdutide",
    pathways: ["GLP-1", "Glucagon"],
    mechanisms: ["Dual receptor agonist", "Appetite reduction", "Hepatic fat oxidation"],
    systems: ["Weight", "Metabolic", "Fat Loss"],
  },
  "melanotan-i": {
    name: "Melanotan I",
    pathways: ["MC1R", "Melanogenesis"],
    mechanisms: ["Selective melanocortin-1 agonist", "Eumelanin production", "UV protection"],
    systems: ["Skin", "Anti-Aging", "Immunity"],
  },
  "melanotan-ii": {
    name: "Melanotan II",
    pathways: ["MC1R/MC4R", "Melanogenesis"],
    mechanisms: ["Non-selective melanocortin agonist", "Tanning response", "Libido enhancement"],
    systems: ["Skin", "Sexual Health", "Fat Loss"],
  },
  "melatonin": {
    name: "Melatonin",
    pathways: ["MT1/MT2 Receptor", "Circadian Rhythm"],
    mechanisms: ["Sleep-wake cycle regulation", "Antioxidant", "Immune modulation"],
    systems: ["Sleep", "Immunity", "Anti-Aging"],
  },
  "oxytocin": {
    name: "Oxytocin",
    pathways: ["Oxytocin Receptor", "Hypothalamic"],
    mechanisms: ["Social bonding", "Uterine contraction", "Anxiolytic effects"],
    systems: ["Mood", "Hormonal", "Recovery"],
  },
  "peg-mgf": {
    name: "PEG-MGF",
    pathways: ["IGF-1 Splice Variant", "PEGylated Delivery"],
    mechanisms: ["Extended mechano growth signaling", "Systemic muscle repair", "Satellite cell recruitment"],
    systems: ["Muscle", "Recovery", "Growth"],
  },
  "pnc-27": {
    name: "PNC-27",
    pathways: ["HDM-2 Binding", "p53 Pathway"],
    mechanisms: ["Tumor cell membrane disruption", "Selective cancer cell targeting", "Necrosis induction"],
    systems: ["Immunity", "Recovery", "Longevity"],
  },
  "pt-141": {
    name: "PT-141",
    pathways: ["MC4R", "Melanocortin"],
    mechanisms: ["Central nervous system arousal", "Dopaminergic pathway", "Sexual desire activation"],
    systems: ["Sexual Health", "Mood", "Hormonal"],
  },
  "pinealon": {
    name: "Pinealon",
    pathways: ["Pineal Gland", "Neuropeptide Regulation"],
    mechanisms: ["Pinealocyte gene regulation", "Neuroprotection", "Circadian modulation"],
    systems: ["Sleep", "Cognitive", "Neuroprotection"],
  },
  "slu-pp-332": {
    name: "SLU-PP-332",
    pathways: ["REV-ERB Agonist", "Nuclear Receptor"],
    mechanisms: ["Circadian clock modulation", "Exercise gene expression", "Mitochondrial biogenesis"],
    systems: ["Energy", "Metabolic", "Muscle"],
  },
  "ss-31": {
    name: "SS-31",
    pathways: ["Cardiolipin Binding", "Mitochondrial Inner Membrane"],
    mechanisms: ["Electron transport stabilization", "ROS reduction", "ATP production enhancement"],
    systems: ["Energy", "Heart", "Longevity"],
  },
  "sermorelin": {
    name: "Sermorelin",
    pathways: ["GHRH", "GH Axis"],
    mechanisms: ["Natural GHRH analog", "Pulsatile GH release", "IGF-1 stimulation"],
    systems: ["Growth", "Recovery", "Sleep"],
  },
  "snap-8": {
    name: "Snap-8",
    pathways: ["SNARE Complex Inhibition", "Acetylcholine Modulation"],
    mechanisms: ["Neuromuscular signal reduction", "Wrinkle relaxation", "Expression line softening"],
    systems: ["Skin", "Anti-Aging", "Muscle"],
  },
  "survodutide": {
    name: "Survodutide",
    pathways: ["GLP-1", "Glucagon"],
    mechanisms: ["Dual incretin agonist", "Energy expenditure increase", "Liver fat reduction"],
    systems: ["Weight", "Metabolic", "Fat Loss"],
  },
  "thymosin-alpha-1": {
    name: "Thymosin Alpha-1",
    pathways: ["Thymus", "TLR Signaling"],
    mechanisms: ["Dendritic cell maturation", "NK cell activation", "Immune surveillance"],
    systems: ["Immunity", "Longevity", "Recovery"],
  },
  "triptorelin": {
    name: "Triptorelin",
    pathways: ["GnRH Agonist", "HPG Axis"],
    mechanisms: ["Initial LH/FSH surge", "Subsequent receptor desensitization", "Hormonal reset"],
    systems: ["Hormonal", "Fertility", "Recovery"],
  },
  "vip": {
    name: "VIP",
    pathways: ["VPAC1/VPAC2", "Neuropeptide"],
    mechanisms: ["Vasodilation", "Anti-inflammatory", "Smooth muscle relaxation"],
    systems: ["Gut", "Immunity", "Neuroprotection"],
  },
};

export function normalizePeptideName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/\s*\(.*?\)\s*/g, '');
}

export function getSynergyPartners(peptideName: string): { partner: string; stack: KnownStack; synergyBonus: number }[] {
  const normalizedName = normalizePeptideName(peptideName);

  const knownAliases: Record<string, string> = {
    "cjc-1295-no-dac": "cjc-1295",
    "cjc-1295-w-dac": "cjc-1295",
    "cjc-1295-with-dac": "cjc-1295",
  };
  const resolvedName = knownAliases[normalizedName] || normalizedName;

  const partners: { partner: string; stack: KnownStack; synergyBonus: number }[] = [];

  for (const stack of KNOWN_STACKS) {
    if (stack.peptides.includes(resolvedName)) {
      for (const p of stack.peptides) {
        if (p !== resolvedName) {
          partners.push({
            partner: PEPTIDE_PATHWAYS[p]?.name || p.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-"),
            stack,
            synergyBonus: stack.synergyBonus,
          });
        }
      }
    }
  }

  const uniquePartners = partners.reduce((acc, curr) => {
    const existing = acc.find(p => p.partner === curr.partner);
    if (!existing || existing.synergyBonus < curr.synergyBonus) {
      return [...acc.filter(p => p.partner !== curr.partner), curr];
    }
    return acc;
  }, [] as typeof partners);

  uniquePartners.sort((a, b) => b.synergyBonus - a.synergyBonus);

  if (uniquePartners.length >= 3) {
    return uniquePartners.slice(0, 3);
  }

  const currentPathway = PEPTIDE_PATHWAYS[resolvedName];
  if (!currentPathway) {
    return uniquePartners.slice(0, 3);
  }

  const existingPartnerNames = new Set(uniquePartners.map(p => p.partner));

  const candidates: { key: string; pathway: PeptidePathway; score: number }[] = [];

  for (const [key, pathway] of Object.entries(PEPTIDE_PATHWAYS)) {
    if (key === resolvedName) continue;
    if (existingPartnerNames.has(pathway.name)) continue;

    const sharedSystems = currentPathway.systems.filter(s => pathway.systems.includes(s)).length;
    const sharedPathways = currentPathway.pathways.filter(p => pathway.pathways.includes(p)).length;

    const overlap = sharedSystems + sharedPathways;
    if (overlap > 0) {
      const score = 60 + Math.min(overlap * 8, 20);
      candidates.push({ key, pathway, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const needed = 3 - uniquePartners.length;
  for (let i = 0; i < Math.min(needed, candidates.length); i++) {
    const c = candidates[i];
    const syntheticStack: KnownStack = {
      name: "Pathway Match",
      peptides: [resolvedName, c.key],
      icon: Zap,
      color: "#6366f1",
      description: `Shared biological pathways between ${currentPathway.name} and ${c.pathway.name}`,
      synergyBonus: c.score,
    };
    uniquePartners.push({
      partner: c.pathway.name,
      stack: syntheticStack,
      synergyBonus: c.score,
    });
  }

  return uniquePartners.slice(0, 3);
}
