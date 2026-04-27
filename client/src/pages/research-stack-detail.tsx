import { useState, useMemo, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { STACK_COMPONENTS, buildPriceLookup, calculateStackPricing } from "@/lib/stack-pricing";
import { SEOHead } from "@/components/seo-head";
import {
  ArrowLeft, FlaskConical, ShoppingCart, Sparkles, AlertTriangle, Package, GraduationCap, Shield, FileCheck, Truck, RefreshCw, ShoppingBag, Repeat, CheckCircle, Minus, Plus, BookOpen, ChevronRight, ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ImageLoader } from "@/components/image-loader";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getSynergyPartners, normalizePeptideName } from "@/lib/synergy-data";
import { getTopPairingForProduct } from "@/lib/pairing-intelligence";
import { detectPathwayOverlaps, resolveDatasetSlug } from "@/lib/pathway-overlaps";
import { PathwayOverlapCard } from "@/components/pathway-overlap-card";
import { Layers, Zap } from "lucide-react";
import type { Product } from "@shared/schema";
import productImage from "@assets/reta bottle_1764310671562.jpg";

interface SynergyCopy {
  beginner: string;
  expert: string;
}

interface ResearchStack {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  longDescription: string;
  peptides: { name: string; description: string }[];
  keyBenefits: string[];
  researchApplications: string[];
  storageGuide: string;
  educationLinks: { peptideName: string; articleUrl: string; articleTitle: string }[];
  icon: string;
  color: string;
  badge?: string;
  badgeColor?: string;
  synergy: SynergyCopy;
}

type PurchaseType = "one-time" | "subscription";
type SubscriptionInterval = "weekly" | "biweekly" | "monthly";

const subscriptionOptions: { value: SubscriptionInterval; label: string; discount: number }[] = [
  { value: "weekly", label: "Weekly", discount: 15 },
  { value: "biweekly", label: "Every 2 Weeks", discount: 12 },
  { value: "monthly", label: "Monthly", discount: 10 },
];

const researchStacksData: Record<string, ResearchStack> = {
  "recovery-tissue-stack": {
    id: "recovery-tissue-stack",
    name: "Recovery + Tissue Mechanisms Stack",
    subtitle: "Dual Pathway Tissue Stack",
    description: "This stack combines two of the most extensively researched compounds for tissue mechanism pathways.",
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
    icon: "Heart",
    color: "#22c55e",
    badge: "Most Popular",
    badgeColor: "#E7FB10",
    synergy: {
      beginner: "BPC-157 helps cells repair faster while TB-500 helps the body build new blood vessels to deliver nutrients. Together, they create a 'repair + rebuild' combination that researchers find works better than either compound alone.",
      expert: "BPC-157 upregulates growth hormone receptors and VEGF expression while TB-500 (Thymosin Beta-4) promotes actin polymerization and angiogenesis. The dual-pathway activation creates synergistic tissue regeneration signaling through complementary GH/IGF-1 axis and cytoskeletal remodeling mechanisms."
    }
  },
  "metabolic-pathway-stack": {
    id: "metabolic-pathway-stack",
    name: "Metabolic Pathway Research Stack",
    subtitle: "Triple-Pathway Research Bundle",
    description: "Explore incretin signaling and mitochondrial function pathways with this comprehensive metabolic research combination.",
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
    icon: "Zap",
    color: "#E7FB10",
    badge: "Hot Research",
    badgeColor: "#ef4444",
    synergy: {
      beginner: "MOTS-C helps cells produce energy more efficiently at the mitochondrial level, while RR-A3 signals the body to use stored fat for fuel. Together, they target metabolism from two different angles—one at the cellular power plant, one at the hormonal control center.",
      expert: "MOTS-C activates AMPK pathways and enhances mitochondrial biogenesis, while RR-A3 acts as a triple agonist (Incretin/GIP/Glucagon receptors) modulating metabolic signaling. This creates multi-target metabolic pathway activation: mitochondrial efficiency + peripheral insulin sensitivity + hepatic gluconeogenesis modulation."
    }
  },
  "longevity-protocol-stack": {
    id: "longevity-protocol-stack",
    name: "Longevity Protocol Stack",
    subtitle: "Anti-Aging Research Bundle",
    description: "Comprehensive cellular longevity research.",
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
    icon: "Sparkles",
    color: "#a855f7",
    synergy: {
      beginner: "Epithalon works on the 'aging clock' inside your cells by supporting telomere maintenance—the protective caps on your DNA. GHK-Cu is a copper peptide that helps cells rebuild and renew tissue. Together, they target aging from two angles: protecting your DNA's integrity and keeping tissue renewal active.",
      expert: "Epithalon activates telomerase reverse transcriptase, extending telomere length and delaying replicative senescence. GHK-Cu modulates 4,000+ genes involved in tissue remodeling, upregulating collagen synthesis, decorin, and metalloproteinases while suppressing inflammatory cytokines. The combination creates synergistic anti-aging signaling: telomere protection (Epithalon) + extracellular matrix restoration and gene expression reset (GHK-Cu)."
    }
  },
  "cognitive-edge-stack": {
    id: "cognitive-edge-stack",
    name: "Cognitive Edge Stack",
    subtitle: "Nootropic Research Duo",
    description: "Gold-standard nootropic research pairing.",
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
    icon: "Brain",
    color: "#21d8ff",
    badge: "Top Nootropic",
    badgeColor: "#21d8ff",
    synergy: {
      beginner: "Semax is a brain-boosting peptide that helps sharpen focus and supports the growth of new neural connections. Selank promotes a calm, clear-headed state by reducing stress signals without causing drowsiness. Together, they create a 'focused calm'—enhanced mental clarity without the jitters or anxiety.",
      expert: "Semax (ACTH 4-10 analog) upregulates BDNF and NGF expression, enhancing neuroplasticity and cognitive processing speed. Selank (tuftsin analog) modulates GABAergic neurotransmission and reduces IL-6 levels, providing anxiolytic effects through immune-neuroendocrine cross-talk. The dual-pathway activation—neurotrophic enhancement (Semax) + anxiolytic neuroprotection (Selank)—creates complementary cognitive optimization without receptor competition."
    }
  },
  "collagen-skin-stack": {
    id: "collagen-skin-stack",
    name: "Collagen & Skin Pathway Stack",
    subtitle: "Dermal Research Bundle",
    description: "Study collagen synthesis pathways and dermal tissue mechanisms.",
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
    icon: "Leaf",
    color: "#ec4899",
    synergy: {
      beginner: "GHK-Cu directly stimulates collagen production and skin cell turnover, while BPC-157 supports the blood vessel growth needed to deliver nutrients to healing tissue. Together, they work on both the 'building blocks' and the 'supply chain' for skin and tissue research.",
      expert: "GHK-Cu upregulates collagen I, III, and elastin synthesis while modulating TGF-β signaling for controlled tissue remodeling. BPC-157 enhances angiogenesis via VEGF upregulation and provides cytoprotection. The combination creates synergistic dermal pathway activation: structural protein synthesis (GHK-Cu) + vascularization and tissue protection (BPC-157)."
    }
  },
  "ghrh-analog-stack": {
    id: "ghrh-analog-stack",
    name: "GHRH Analog Receptor Stack",
    subtitle: "Dual GHRHR Agonist Research Bundle",
    description: "Study receptor saturation and competitive occupancy dynamics by pairing two structurally distinct GHRH analogs at the same pituitary receptor.",
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
    icon: "FlaskConical",
    color: "#6366f1",
    badge: "Receptor Study",
    badgeColor: "#6366f1",
    synergy: {
      beginner: "Both CJC-1295 (No DAC) and Sermorelin work by activating the same receptor in the pituitary gland to trigger GH release. One acts quickly and clears fast; the other lasts longer. Pairing them lets researchers study what happens when two compounds compete for the same docking site — a classic receptor occupancy experiment.",
      expert: "CJC-1295 (No DAC) and Sermorelin are both GHRHR agonists targeting the same Gs-coupled GPCR in the pituitary somatotrophs. Their differing receptor kinetics — rapid clearance (Sermorelin, t½ ~10–20 min) versus extended plasma stability (CJC-1295, t½ ~30 min) — create a tractable model for studying competitive receptor occupancy, desensitization dynamics, and the relationship between pulsatile vs. sustained GHRHR activation on GH secretion amplitude."
    }
  },
  "igf1r-anabolic-stack": {
    id: "igf1r-anabolic-stack",
    name: "IGF-1R Anabolic Pathway Stack",
    subtitle: "Dual IGF-1R Agonist Research Bundle",
    description: "Study anabolic signaling and receptor occupancy dynamics by pairing two structurally distinct IGF-1 receptor analogs.",
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
    icon: "FlaskConical",
    color: "#f97316",
    badge: "Receptor Study",
    badgeColor: "#f97316",
    synergy: {
      beginner: "IGF-1 LR3 and IGF-DES both activate the same IGF-1 receptor — the key growth factor receptor driving anabolic and muscle-repair signaling. LR3 stays active longer in the body because it avoids the proteins that normally mop up IGF-1 quickly. DES binds the receptor more tightly but clears faster. Together they let researchers study what happens when two variants of the same hormone engage the same receptor with different binding strength and duration.",
      expert: "IGF-1 LR3 (Long-Arg3) and IGF-DES (Des(1-3)-IGF-1) are both IGF-1R full agonists that circumvent insulin-like growth factor binding protein (IGFBP) sequestration by distinct structural mechanisms — LR3 via an arginine substitution at position 3 that reduces IGFBP-3 affinity ~500-fold, and DES via N-terminal truncation that sterically disrupts IGFBP interaction. Pairing them creates a tractable IGF-1R occupancy model: the prolonged plasma bioavailability of LR3 (reduced IGFBP clearance) against the enhanced receptor-binding affinity of DES, enabling study of occupancy kinetics, receptor internalization dynamics, and downstream PI3K/Akt/mTOR pathway activation across structurally differentiated IGF-1R agonists."
    }
  },
  "ghsr-secretagogue-stack": {
    id: "ghsr-secretagogue-stack",
    name: "GHSR1a Secretagogue Stack",
    subtitle: "Dual Ghrelin Receptor Research Bundle",
    description: "Investigate receptor occupancy and selectivity differences by combining two structurally distinct GHSR1a agonists on the same ghrelin receptor pathway.",
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
    icon: "FlaskConical",
    color: "#0ea5e9",
    badge: "Selectivity Study",
    badgeColor: "#0ea5e9",
    synergy: {
      beginner: "Ipamorelin and GHRP-2 both trigger GH release by activating the same ghrelin receptor. The key difference researchers study is selectivity — Ipamorelin is considered 'cleaner' with fewer side signals, while GHRP-2 is more potent but activates more hormonal pathways. Pairing them reveals how two compounds on the same receptor can still produce meaningfully different research outcomes.",
      expert: "Ipamorelin and GHRP-2 are both full agonists at GHSR1a (Gs-coupled), yet demonstrate divergent downstream endocrine profiles: Ipamorelin shows high receptor selectivity with minimal cortisol/prolactin co-stimulation, while GHRP-2 produces dose-dependent cortisol and prolactin responses alongside GH release. This same-receptor but different-selectivity model enables investigation of biased agonism concepts and off-target endocrine signaling without confounders from a second receptor pathway."
    }
  },
  "elite-triple-stack": {
    id: "elite-triple-stack",
    name: "Elite Pathway Triple Stack",
    subtitle: "Advanced Multi-Mechanism Bundle",
    description: "Our most comprehensive research stack covering three major mechanism categories.",
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
    icon: "Crown",
    color: "#f59e0b",
    badge: "Premium",
    badgeColor: "#f59e0b",
    synergy: {
      beginner: "This triple stack covers three major research areas: RR-A3 for metabolic hormone signaling, MOTS-C for cellular energy production, and BPC-157 for tissue repair. It's designed for advanced researchers who want to study how these different systems interact and influence each other.",
      expert: "This triple-compound stack enables multi-pathway investigation: RR-A3 (Incretin/GIP/GCGR triple agonist) for metabolic and hepatic signaling, MOTS-C for mitochondrial biogenesis and AMPK activation, and BPC-157 for tissue regeneration via NO/GH pathways. The combination allows researchers to study cross-talk between metabolic, energetic, and regenerative signaling cascades in a single protocol."
    }
  },
};

export default function ResearchStackDetail() {
  const [match, params] = useRoute("/research-stacks/:id");
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionInterval, setSubscriptionInterval] = useState<SubscriptionInterval>("monthly");
  const [synergyLevel, setSynergyLevel] = useState<"beginner" | "expert">("beginner");

  useEffect(() => {
    setSynergyLevel("beginner");
  }, [params?.id]);

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: productsWithStock } = useQuery<any[]>({
    queryKey: ["/api/products-with-stock"],
  });

  const priceLookup = useMemo(() => {
    if (!productsWithStock) return new Map<string, number>();
    return buildPriceLookup(productsWithStock);
  }, [productsWithStock]);

  if (!match || !params?.id) {
    return null;
  }

  const stack = researchStacksData[params.id];

  if (!stack) {
    return (
      <main className="min-h-screen pt-32 md:pt-40 pb-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Stack Not Found</h1>
          <p className="text-muted-foreground mb-6">The research stack you're looking for doesn't exist.</p>
          <Link href="/research-stacks">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research Stacks
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const pricing = calculateStackPricing(params.id, priceLookup);
  const pricingReady = pricing !== null;

  const pathwayOverlaps = detectPathwayOverlaps(
    stack.peptides
      .map(p => resolveDatasetSlug(p.name))
      .filter((s): s is string => Boolean(s))
  );
  const getBasePrice = () => pricing?.stackPrice ?? 0;

  const getSelectedDiscount = () => {
    if (purchaseType === "one-time") return 0;
    const option = subscriptionOptions.find(o => o.value === subscriptionInterval);
    return option?.discount || 0;
  };

  const getDiscountedPrice = () => {
    const basePrice = getBasePrice();
    const discount = getSelectedDiscount();
    return basePrice * (1 - discount / 100);
  };

  const getTotalPrice = () => {
    return getDiscountedPrice() * quantity;
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = async () => {
    await addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: getBasePrice(),
      quantity,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    toast({
      title: "Added to Cart",
      description: `${stack.name} has been added to your cart.`,
      action: (
        <ToastAction altText="View Cart" onClick={() => setLocation('/cart')} className="bg-[#E7FB10] text-black border-[#E7FB10] hover:bg-[#E7FB10]/90 font-semibold">
          View Cart
        </ToastAction>
      ),
    });
  };

  const handleBuyNow = async () => {
    await addToCart({
      productId: stack.id,
      bundleId: stack.id,
      name: stack.name,
      price: getBasePrice(),
      quantity,
      dosage: "Research Stack",
      image: productImage,
      isBundle: true,
    });
    window.location.href = '/checkout?fromCart=true';
  };

  return (
    <main className="min-h-screen pt-24 md:pt-40 pb-12 overflow-x-hidden">
      <SEOHead 
        title={`${stack.name} | Research Stack`}
        description={stack.description}
        canonicalPath={`/research-stacks/${stack.id}`}
      />
      <div className="max-w-7xl mx-auto px-4 pr-6 md:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-2 md:mb-4">
          <Link href="/research-stacks">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 md:-ml-4 md:gap-2" data-testid="button-back-stacks">
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden md:inline">Back to Research Stacks</span>
              <span className="md:hidden">Back</span>
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col">
            <Card className="overflow-hidden border-[#2a2a32] sticky top-24">
              <div
                className="relative aspect-square bg-gradient-to-br from-[#1a1a1f] to-[#0d0d10] flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${stack.color}15, transparent 70%), linear-gradient(135deg, #1a1a1f, #0d0d10)`,
                }}
              >
                {stack.badge && (
                  <Badge
                    className="absolute top-4 right-4"
                    style={{
                      backgroundColor: stack.badgeColor,
                      color: stack.badgeColor === "#E7FB10" || stack.badgeColor === "#f59e0b" ? "black" : "white",
                    }}
                    data-testid="badge-stack-type"
                  >
                    {stack.badge}
                  </Badge>
                )}
                <div className="text-center">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: `${stack.color}20` }}>
                    <Package className="h-20 w-20 md:h-24 md:w-24" style={{ color: stack.color }} />
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {stack.peptides.map((peptide, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border-2 border-[#1a1a1f]" style={{ backgroundColor: stack.color }} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stack.peptides.length} peptide{stack.peptides.length > 1 ? "s" : ""} included
                  </p>
                </div>
              </div>
            </Card>


            {stack.educationLinks.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="mt-16 hidden md:block relative z-10 bg-background"
                data-testid="section-education-desktop"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#ec4899]" />
                    <h3 className="font-display text-lg font-bold">Learn About These Peptides</h3>
                  </div>
                  <Link href="/guides/peptide-education-center">
                    <Button variant="outline" size="sm" className="border-[#ec4899]/30 hover:border-[#ec4899]" data-testid="link-view-all-education">
                      All Articles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  {stack.educationLinks.map((link) => (
                    <Link key={link.peptideName} href={link.articleUrl}>
                      <Card
                        className="p-4 border-[#ec4899]/20 md:hover:border-[#ec4899]/40 transition-all duration-300 cursor-pointer group md:hover:scale-[1.02] md:active:scale-[1.02] md:hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                        data-testid={`card-article-${link.peptideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#ec4899]/10 flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-[#ec4899]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-[#ec4899]/50 text-[#ec4899] text-xs">
                                Research Guide
                              </Badge>
                            </div>
                            <h4 className="font-display text-base md:text-lg font-bold group-hover:text-[#ec4899] transition-colors uppercase tracking-tight leading-tight">{link.articleTitle}</h4>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Storage Information - DESKTOP ONLY */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="mt-8 hidden md:block"
              data-testid="section-storage-desktop"
            >
              <h3 className="font-display font-semibold text-lg mb-4">Storage Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {stack.storageGuide}
              </p>
              <div className="py-2">
                <Link href="/guides/storage-101">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    <Button 
                      className="gap-2 bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] text-black font-semibold md:hover:shadow-[0_0_20px_rgba(33,216,255,0.6)] transition-shadow" 
                      data-testid="link-learn-storage-desktop"
                    >
                      <BookOpen className="h-4 w-4" />
                      Learn More: Storage Best Practices
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.section>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                Research Stack
              </Badge>
              {stack.peptides.map((peptide) => (
                <Badge
                  key={peptide.name}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: stack.color, color: stack.color }}
                  data-testid={`badge-peptide-${peptide.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {peptide.name}
                </Badge>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-6xl font-bold mb-1 md:mb-2 uppercase tracking-tighter leading-none" data-testid="text-stack-name">
              {stack.name}
            </h1>

            <div className="mb-2 md:mb-3">
              <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                <span className="font-display text-2xl md:text-3xl font-bold text-[#E7FB10]" data-testid="text-stack-price">
                  ${getBasePrice().toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground line-through" data-testid="text-stack-retail-value">
                  ${pricing?.retailValue.toFixed(2) ?? "—"}
                </span>
              </div>
            </div>

            <p className="hidden md:block text-sm text-muted-foreground leading-relaxed mb-4" data-testid="text-stack-description">
              {stack.longDescription}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3 md:mb-4">
              <div>
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Quantity</Label>
                <div className="flex items-center border rounded-md h-9 border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    data-testid="button-quantity-minus"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="flex-1 text-center font-medium text-sm" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    data-testid="button-quantity-plus"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-3 md:mb-4">
              <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Purchase Option</Label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "one-time" ? "border-[#E7FB10] bg-[#E7FB10]/5" : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("one-time")}
                  data-testid="option-one-time"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">One-time</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">${getBasePrice().toFixed(2)}</p>
                  </div>
                </div>

                <div
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    purchaseType === "subscription" ? "border-[#21d8ff] bg-[#21d8ff]/5" : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setPurchaseType("subscription")}
                  data-testid="option-subscription"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5" />
                      <span className="font-medium text-sm">Subscribe</span>
                      <Badge className="bg-[#21d8ff] text-[10px] px-1 py-0">15% off</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Auto-delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {purchaseType === "subscription" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 md:mb-4"
              >
                <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Delivery Frequency</Label>
                <div className="grid grid-cols-3 gap-2">
                  {subscriptionOptions.map((option) => {
                    const discountedPrice = getBasePrice() * (1 - option.discount / 100);
                    return (
                      <div
                        key={option.value}
                        className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          subscriptionInterval === option.value ? "border-[#21d8ff] bg-[#21d8ff]/5" : "border-border hover:border-border/80"
                        }`}
                        onClick={() => setSubscriptionInterval(option.value)}
                        data-testid={`option-interval-${option.value}`}
                      >
                        <span className="font-medium text-xs">{option.label}</span>
                        <span className="text-[10px] text-[#21d8ff]">{option.discount}% off</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 md:mb-3">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                In Stock
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Lab Tested
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Fast Ship
                </span>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2 p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 mb-3" data-testid="card-ruo-mobile">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400 font-medium">Research Use Only - Not for human consumption</span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 font-display gap-2 border-2 md:hover:border-[#21d8ff] md:hover:text-[#21d8ff] md:hover:shadow-[0_0_15px_rgba(33,216,255,0.3)] transition-all duration-300"
                onClick={handleAddToCart}
                disabled={!pricingReady}
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className={`flex-1 font-display gap-2 transition-shadow duration-300 text-black ${
                  purchaseType === "subscription"
                    ? "bg-[#21d8ff] border-[#21d8ff] md:hover:bg-[#21d8ff]/90 shadow-[0_0_20px_rgba(33,216,255,0.4)] md:hover:shadow-[0_0_40px_rgba(33,216,255,0.6)]"
                    : "bg-[#E7FB10] border-[#E7FB10] md:hover:bg-[#E7FB10]/90 shadow-[0_0_20px_rgba(231,251,16,0.4)] md:hover:shadow-[0_0_40px_rgba(231,251,16,0.6)]"
                }`}
                onClick={handleBuyNow}
                disabled={!pricingReady}
                data-testid="button-buy-now"
              >
                {purchaseType === "subscription" ? (
                  <>
                    <Repeat className="h-5 w-5" />
                    Subscribe
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            {purchaseType === "subscription" && (
              <p className="text-[10px] text-center text-muted-foreground mt-1">
                Save ${((getBasePrice() - getDiscountedPrice()) * quantity).toFixed(2)} per order • Cancel anytime
              </p>
            )}

            <Collapsible className="md:hidden mt-4">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-between text-sm"
                  data-testid="button-toggle-description-mobile"
                >
                  <span className="text-muted-foreground">About this stack</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-stack-description-mobile">
                  {stack.longDescription}
                </p>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="my-4 md:my-6" />

            <div className="grid grid-cols-4 gap-2 text-center mb-4 md:mb-6">
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">3rd Party Tested</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FileCheck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">COA Included</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="h-4 w-4 text-[#21d8ff]" />
                <span className="text-[10px] text-muted-foreground">Guaranteed</span>
              </div>
            </div>

            {stack.educationLinks.length > 0 && (
              <Collapsible className="md:hidden mb-6">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between border-[#ec4899]/30 hover:border-[#ec4899] text-sm"
                    data-testid="button-toggle-education-mobile"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#ec4899]" />
                      <span>Learn About These Peptides</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-2">
                  {stack.educationLinks.map((link) => (
                    <Link key={link.peptideName} href={link.articleUrl}>
                      <Card 
                        className="p-3 border-[#ec4899]/20 hover:border-[#ec4899]/40 transition-all cursor-pointer"
                        data-testid={`card-article-mobile-${link.peptideName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-[#ec4899] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{link.articleTitle}</h4>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {stack.keyBenefits.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display font-semibold text-lg mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {stack.keyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[#E7FB10] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-8" data-testid="section-synergy-explanation">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" style={{ color: stack.color }} />
                  <h3 className="font-display font-semibold text-lg">Why These Peptides Work Together</h3>
                </div>
                <div role="group" aria-label="Synergy explanation level" className="flex items-center gap-1 p-0.5 rounded-md border border-border bg-muted/30">
                  <Button
                    aria-pressed={synergyLevel === "beginner"}
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-3 text-xs rounded-sm transition-colors ${synergyLevel === "beginner" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    onClick={() => setSynergyLevel("beginner")}
                    data-testid="button-synergy-beginner"
                  >
                    Overview
                  </Button>
                  <Button
                    aria-pressed={synergyLevel === "expert"}
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-3 text-xs rounded-sm transition-colors ${synergyLevel === "expert" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    onClick={() => setSynergyLevel("expert")}
                    data-testid="button-synergy-expert"
                  >
                    Mechanistic
                  </Button>
                </div>
              </div>
              <Card className="p-4 border-border/60" data-testid="card-synergy-content">
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-synergy-copy">
                  {synergyLevel === "beginner" ? stack.synergy.beginner : stack.synergy.expert}
                </p>
              </Card>
            </div>

            {pathwayOverlaps.length > 0 && (
              <div className="mb-6" data-testid="section-pathway-overlap-detail">
                <PathwayOverlapCard overlaps={pathwayOverlaps} />
              </div>
            )}

            <div className="mb-8 overflow-visible md:hidden">
              <h3 className="font-display font-semibold text-lg mb-4">Storage Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {stack.storageGuide}
              </p>
              <Link href="/guides/storage-101">
                <Button 
                  className="gap-2 bg-gradient-to-r from-[#21d8ff] to-[#9d4edd] text-black font-semibold transition-shadow" 
                  data-testid="link-learn-storage-mobile"
                >
                  <BookOpen className="h-4 w-4" />
                  Learn More: Storage Best Practices
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

          </motion.div>
        </div>

        {/* RUO Disclaimer - DESKTOP ONLY - Full width below both columns */}
        <Card className="p-6 bg-red-950/30 border-2 border-red-500/50 animate-pulse-subtle mt-8 hidden md:block" data-testid="card-ruo-disclaimer-desktop">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wider text-lg mb-2">
                Research Use Only
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This product is sold for research purposes only and is not intended 
                for human consumption. By purchasing, you confirm you are a qualified 
                researcher and will use this product in accordance with all applicable 
                federal and state laws and regulations.
              </p>
            </div>
          </div>
        </Card>

        {/* Works Well With - Synergy Recommendations */}
        {(() => {
          const stackPeptideNames = stack.peptides.map(p => p.name);
          const stackNorms = new Set(stackPeptideNames.map(n => normalizePeptideName(n)));

          const partnerMap = new Map<string, { partner: string; stack: { name: string }; synergyBonus: number }>();
          for (const peptideName of stackPeptideNames) {
            const partners = getSynergyPartners(peptideName);
            for (const p of partners) {
              const norm = normalizePeptideName(p.partner);
              if (stackNorms.has(norm)) continue;
              const existing = partnerMap.get(norm);
              if (!existing || p.synergyBonus > existing.synergyBonus) {
                partnerMap.set(norm, p);
              }
            }
          }

          const sortedPartners = Array.from(partnerMap.values()).sort((a, b) => b.synergyBonus - a.synergyBonus);

          const matchingProducts = sortedPartners
            .map(sp => {
              const product = allProducts?.find(p => {
                if (p.category === "Research Stacks" || p.category === "Supplies" || p.category === "Research Compounds") return false;
                const normalizedProductName = normalizePeptideName(p.name);
                return normalizePeptideName(sp.partner) === normalizedProductName ||
                  normalizedProductName.includes(normalizePeptideName(sp.partner)) ||
                  normalizePeptideName(sp.partner).includes(normalizedProductName);
              });
              return product ? { product, synergy: sp } : null;
            })
            .filter(Boolean) as { product: Product; synergy: { partner: string; stack: { name: string }; synergyBonus: number } }[];

          if (matchingProducts.length === 0) return null;

          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-12"
              data-testid="section-synergy-recommendations"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Layers className="h-6 w-6 text-[#22c55e]" />
                <h2 className="font-display text-2xl font-bold">Works Well With</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                Research-backed pairings based on complementary mechanisms of action.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {matchingProducts.slice(0, 3).map(({ product: partnerProduct, synergy }) => {
                  const pairingReason = (() => {
                    for (const peptideName of stackPeptideNames) {
                      const reason = getTopPairingForProduct(peptideName, partnerProduct.name);
                      if (reason) return reason;
                    }
                    return null;
                  })();

                  return (
                    <Link key={partnerProduct.id} href={`/peptides/${partnerProduct.slug || partnerProduct.id}`} className="h-full" data-testid={`link-synergy-${partnerProduct.id}`}>
                      <Card
                        className="p-4 border-[#22c55e]/20 cursor-pointer hover-elevate h-full"
                        data-testid={`card-synergy-${partnerProduct.slug}`}
                      >
                        <div className="flex flex-wrap items-start gap-4 h-full">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-card flex-shrink-0">
                            <img
                              src={partnerProduct.imageUrl || productImage}
                              alt={partnerProduct.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col h-full">
                            <p className="font-medium text-sm truncate">
                              {partnerProduct.name}
                            </p>
                            <Badge
                              className="mt-2 text-xs bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {synergy.stack.name} • {synergy.synergyBonus}%
                            </Badge>
                            {pairingReason && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                                {pairingReason.mechanism}
                              </p>
                            )}
                            {!pairingReason && <div className="flex-1" />}
                            <p className="text-sm font-bold text-[#E7FB10] mt-2 mt-auto">
                              ${Number(partnerProduct.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <Link href="/research-stacks?tab=custom" data-testid="link-build-custom-stack">
                  <Button className="bg-gradient-to-r from-[#22c55e] to-[#21d8ff] text-black font-bold">
                    <Layers className="h-4 w-4 mr-2" />
                    Build a Custom Stack
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.section>
          );
        })()}

      </div>
    </main>
  );
}
