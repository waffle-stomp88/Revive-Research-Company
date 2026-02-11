import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { CategoryTabs } from "@/components/category-tabs";
import { Layers, FlaskConical, ArrowRight, Sparkles, Zap, Heart, Leaf, Star, Crown, Shield, X, Check, ShoppingCart, Beaker, Brain, Target, Rocket, Activity, Moon, Dumbbell, Timer, Save, Share2, Trash2, Copy, Users, LucideIcon, Search, AlertCircle, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EarlyAccessModal } from "@/components/early-access-modal";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { Product, SavedStack } from "@shared/schema";
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
  peptides: string[];
  icon: typeof FlaskConical;
  color: string;
  badge?: string;
  badgeColor?: string;
  retailValue: number;
  stackPrice: number;
  synergy: SynergyCopy;
}

const researchStacks: ResearchStack[] = [
  {
    id: "recovery-tissue-stack",
    name: "Recovery + Tissue Mechanisms Stack",
    subtitle: "Dual Pathway Tissue Stack",
    description: "This stack combines two of the most extensively researched compounds for tissue mechanism pathways. Ideal for researchers studying synergistic repair signaling and cellular regeneration models.",
    peptides: ["BPC-157", "TB-500"],
    icon: Heart,
    color: "#22c55e",
    badge: "Most Popular",
    badgeColor: "#E7FB10",
    retailValue: 129,
    stackPrice: 109,
    synergy: {
      beginner: "BPC-157 helps cells repair faster while TB-500 helps the body build new blood vessels to deliver nutrients. Together, they create a 'repair + rebuild' combination that researchers find works better than either compound alone.",
      expert: "BPC-157 upregulates growth hormone receptors and VEGF expression while TB-500 (Thymosin Beta-4) promotes actin polymerization and angiogenesis. The dual-pathway activation creates synergistic tissue regeneration signaling through complementary GH/IGF-1 axis and cytoskeletal remodeling mechanisms."
    }
  },
  {
    id: "metabolic-pathway-stack",
    name: "Metabolic Pathway Research Stack",
    subtitle: "Triple-Pathway Research Bundle",
    description: "Explore incretin signaling and mitochondrial function pathways with this comprehensive metabolic research combination. Features compounds targeting multiple energy regulation mechanisms.",
    peptides: ["MOTS-C", "RR-A3"],
    icon: Zap,
    color: "#E7FB10",
    badge: "Hot Research",
    badgeColor: "#ef4444",
    retailValue: 135,
    stackPrice: 115,
    synergy: {
      beginner: "MOTS-C helps cells produce energy more efficiently at the mitochondrial level, while RR-A3 signals the body to use stored fat for fuel. Together, they target metabolism from two different angles—one at the cellular power plant, one at the hormonal control center.",
      expert: "MOTS-C activates AMPK pathways and enhances mitochondrial biogenesis, while RR-A3 acts as a triple agonist (Incretin/GIP/Glucagon receptors) modulating metabolic signaling. This creates multi-target metabolic pathway activation: mitochondrial efficiency + peripheral insulin sensitivity + hepatic gluconeogenesis modulation."
    }
  },
  {
    id: "longevity-protocol-stack",
    name: "Longevity Protocol Stack",
    subtitle: "Anti-Aging Research Bundle",
    description: "Explore two of the most compelling anti-aging research compounds together. This stack pairs telomerase-activating mechanisms with copper peptide tissue renewal for comprehensive cellular longevity research.",
    peptides: ["Epithalon", "GHK-Cu"],
    icon: Sparkles,
    color: "#a855f7",
    retailValue: 105,
    stackPrice: 89,
    synergy: {
      beginner: "Epithalon works on the 'aging clock' inside your cells by supporting telomere maintenance—the protective caps on your DNA. GHK-Cu is a copper peptide that helps cells rebuild and renew tissue. Together, they target aging from two angles: protecting your DNA's integrity and keeping tissue renewal active.",
      expert: "Epithalon activates telomerase reverse transcriptase, extending telomere length and delaying replicative senescence. GHK-Cu modulates 4,000+ genes involved in tissue remodeling, upregulating collagen synthesis, decorin, and metalloproteinases while suppressing inflammatory cytokines. The combination creates synergistic anti-aging signaling: telomere protection (Epithalon) + extracellular matrix restoration and gene expression reset (GHK-Cu)."
    }
  },
  {
    id: "cognitive-edge-stack",
    name: "Cognitive Edge Stack",
    subtitle: "Nootropic Research Duo",
    description: "The gold-standard nootropic research pairing. Semax and Selank target complementary cognitive pathways—one enhancing focus and BDNF expression, the other promoting calm clarity through anxiolytic mechanisms. Widely studied for neuroprotective synergy.",
    peptides: ["Semax", "Selank"],
    icon: Brain,
    color: "#21d8ff",
    badge: "Top Nootropic",
    badgeColor: "#21d8ff",
    retailValue: 120,
    stackPrice: 99,
    synergy: {
      beginner: "Semax is a brain-boosting peptide that helps sharpen focus and supports the growth of new neural connections. Selank promotes a calm, clear-headed state by reducing stress signals without causing drowsiness. Together, they create a 'focused calm'—enhanced mental clarity without the jitters or anxiety.",
      expert: "Semax (ACTH 4-10 analog) upregulates BDNF and NGF expression, enhancing neuroplasticity and cognitive processing speed. Selank (tuftsin analog) modulates GABAergic neurotransmission and reduces IL-6 levels, providing anxiolytic effects through immune-neuroendocrine cross-talk. The dual-pathway activation—neurotrophic enhancement (Semax) + anxiolytic neuroprotection (Selank)—creates complementary cognitive optimization without receptor competition."
    }
  },
  {
    id: "collagen-skin-stack",
    name: "Collagen & Skin Pathway Stack",
    subtitle: "Dermal Research Bundle",
    description: "Study collagen synthesis pathways and dermal tissue mechanisms. This combination targets complementary wound healing and structural protein research applications.",
    peptides: ["GHK-Cu", "BPC-157"],
    icon: Leaf,
    color: "#ec4899",
    retailValue: 115,
    stackPrice: 98,
    synergy: {
      beginner: "GHK-Cu directly stimulates collagen production and skin cell turnover, while BPC-157 supports the blood vessel growth needed to deliver nutrients to healing tissue. Together, they work on both the 'building blocks' and the 'supply chain' for skin and tissue research.",
      expert: "GHK-Cu upregulates collagen I, III, and elastin synthesis while modulating TGF-β signaling for controlled tissue remodeling. BPC-157 enhances angiogenesis via VEGF upregulation and provides cytoprotection. The combination creates synergistic dermal pathway activation: structural protein synthesis (GHK-Cu) + vascularization and tissue protection (BPC-157)."
    }
  },
  {
    id: "elite-triple-stack",
    name: "Elite Pathway Triple Stack",
    subtitle: "Advanced Multi-Mechanism Bundle",
    description: "Our most comprehensive research stack covering three major mechanism categories: incretin signaling, mitochondrial pathways, and tissue repair models. For advanced research programs requiring multi-target investigation.",
    peptides: ["RR-A3", "MOTS-C", "BPC-157"],
    icon: Crown,
    color: "#f59e0b",
    badge: "Premium",
    badgeColor: "#f59e0b",
    retailValue: 200,
    stackPrice: 169,
    synergy: {
      beginner: "This triple stack covers three major research areas: RR-A3 for metabolic hormone signaling, MOTS-C for cellular energy production, and BPC-157 for tissue repair. It's designed for advanced researchers who want to study how these different systems interact and influence each other.",
      expert: "This triple-compound stack enables multi-pathway investigation: RR-A3 (Incretin/GIP/GCGR triple agonist) for metabolic and hepatic signaling, MOTS-C for mitochondrial biogenesis and AMPK activation, and BPC-157 for tissue regeneration via NO/GH pathways. The combination allows researchers to study cross-talk between metabolic, energetic, and regenerative signaling cascades in a single protocol."
    }
  },
];

type StackTab = "pre-built" | "custom";

// ============================================
// SYNERGY SYSTEM - Known Combos & Pathways
// ============================================

interface KnownStack {
  name: string;
  peptides: string[];
  icon: LucideIcon;
  color: string;
  description: string;
  synergyBonus: number;
}

interface PeptidePathway {
  name: string;
  pathways: string[];
  mechanisms: string[];
  systems: string[];
}

// Famous known stacks from research (Peptibase data)
const KNOWN_STACKS: KnownStack[] = [
  {
    name: "Wolverine Stack",
    peptides: ["bpc-157", "tb-500"],
    icon: Zap,
    color: "#22c55e",
    description: "Legendary healing combo - BPC-157's local repair + TB-500's systemic regeneration",
    synergyBonus: 95,
  },
  {
    name: "Glow Protocol",
    peptides: ["bpc-157", "tb-500", "ghk-cu"],
    icon: Sparkles,
    color: "#ec4899",
    description: "Ultimate skin rejuvenation - collagen + blood vessels + tissue repair",
    synergyBonus: 90,
  },
  {
    name: "GH Amplifier",
    peptides: ["ipamorelin", "cjc-1295"],
    icon: Rocket,
    color: "#f59e0b",
    description: "Growth hormone synergy - GHRP + GHRH work better together",
    synergyBonus: 88,
  },
  {
    name: "Recovery+",
    peptides: ["bpc-157", "ghk-cu"],
    icon: Heart,
    color: "#22c55e",
    description: "Collagen synthesis meets tissue protection",
    synergyBonus: 82,
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
    name: "Cognitive Edge",
    peptides: ["semax", "selank"],
    icon: Brain,
    color: "#21d8ff",
    description: "Nootropic synergy - focus enhancement + anxiety reduction",
    synergyBonus: 86,
  },
  {
    name: "Longevity Protocol",
    peptides: ["epithalon", "ghk-cu"],
    icon: Crown,
    color: "#a855f7",
    description: "Telomere extension meets collagen regeneration",
    synergyBonus: 84,
  },
  {
    name: "Deep Sleep",
    peptides: ["epithalon", "ipamorelin"],
    icon: Moon,
    color: "#6366f1",
    description: "Circadian rhythm + natural GH pulse optimization",
    synergyBonus: 83,
  },
  {
    name: "Total Regen",
    peptides: ["bpc-157", "tb-500", "ipamorelin"],
    icon: Shield,
    color: "#10b981",
    description: "Complete recovery - local healing + systemic repair + growth support",
    synergyBonus: 92,
  },
  {
    name: "Lean Mass",
    peptides: ["cjc-1295", "ipamorelin", "mots-c"],
    icon: Dumbbell,
    color: "#f97316",
    description: "GH amplification + metabolic enhancement for body composition",
    synergyBonus: 87,
  },
  {
    name: "KLOW Stack",
    peptides: ["bpc-157", "tb-500", "ghk-cu", "kpv"],
    icon: Leaf,
    color: "#00e5a0",
    description: "3-phase regeneration: KPV clears inflammation, BPC-157 + TB-500 repair tissue, GHK-Cu remodels collagen",
    synergyBonus: 94,
  },
  {
    name: "Immune Shield",
    peptides: ["thymosin alpha", "ll-37"],
    icon: Shield,
    color: "#34d399",
    description: "Adaptive immunity + antimicrobial defense — dual-layer immune system protection",
    synergyBonus: 85,
  },
  {
    name: "Gut Restore",
    peptides: ["bpc-157", "kpv"],
    icon: Heart,
    color: "#60a5fa",
    description: "Gut lining repair + NF-κB inhibition — comprehensive gut barrier restoration",
    synergyBonus: 88,
  },
  {
    name: "Neuro Stack",
    peptides: ["semax", "cerebrolysin"],
    icon: Brain,
    color: "#38bdf8",
    description: "BDNF upregulation + neurotrophic factors — dual neuroprotection for cognitive research",
    synergyBonus: 86,
  },
  {
    name: "Fat Burner",
    peptides: ["aod-9604", "5-amino-1mq"],
    icon: Zap,
    color: "#fb923c",
    description: "GH fragment fat breakdown + NNMT enzyme inhibitor — complementary fat metabolism pathways",
    synergyBonus: 84,
  },
  {
    name: "GH Max",
    peptides: ["cjc-1295", "ipamorelin", "sermorelin"],
    icon: Rocket,
    color: "#fbbf24",
    description: "Triple GHRH/GHRP stimulation — maximum growth hormone output through complementary pathways",
    synergyBonus: 91,
  },
  {
    name: "Skin Renewal",
    peptides: ["ghk-cu", "snap-8"],
    icon: Sparkles,
    color: "#f472b6",
    description: "Collagen matrix remodeling + expression line reduction — advanced skin rejuvenation research",
    synergyBonus: 83,
  },
  {
    name: "Longevity+",
    peptides: ["epithalon", "thymalin"],
    icon: Crown,
    color: "#c084fc",
    description: "Telomerase activation + thymic immune restoration — the Russian longevity protocol",
    synergyBonus: 87,
  },
  {
    name: "Performance",
    peptides: ["igf-1 lr3", "bpc-157"],
    icon: Dumbbell,
    color: "#ef4444",
    description: "Direct muscle growth factor + tissue repair accelerator — athletic recovery research",
    synergyBonus: 86,
  },
];

// Peptide pathway data for connections
const PEPTIDE_PATHWAYS: Record<string, PeptidePathway> = {
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
};

// Body systems with icons and descriptions
const BODY_SYSTEMS = [
  { id: "healing", name: "Healing", icon: Heart, color: "#22c55e", description: "Tissue repair, wound healing, and injury recovery through growth factor activation" },
  { id: "metabolic", name: "Metabolic", icon: Zap, color: "#E7FB10", description: "Energy production, fat metabolism, and mitochondrial function optimization" },
  { id: "growth", name: "Growth", icon: Target, color: "#f59e0b", description: "Growth hormone pathways supporting muscle, bone, and cellular development" },
  { id: "cognitive", name: "Cognitive", icon: Brain, color: "#21d8ff", description: "Neuroprotection, focus enhancement, and brain-derived growth factors" },
  { id: "skin", name: "Skin", icon: Sparkles, color: "#ec4899", description: "Collagen synthesis, elastin production, and dermal regeneration" },
  { id: "longevity", name: "Longevity", icon: Crown, color: "#a855f7", description: "Anti-aging mechanisms including telomere support and cellular renewal" },
];

// Pathway descriptions for tooltips
const PATHWAY_DESCRIPTIONS: Record<string, string> = {
  "Nitric Oxide": "Vasodilation and blood flow enhancement for tissue delivery",
  "Angiogenesis": "New blood vessel formation to supply healing tissues",
  "Collagen Synthesis": "Structural protein production for skin, tendons, and connective tissue",
  "Actin Regulation": "Cytoskeletal protein control for cell migration and repair",
  "Cell Migration": "Enables cells to move to injury sites for repair",
  "Copper Signaling": "Essential cofactor for enzyme activation and tissue remodeling",
  "Matrix Remodeling": "Restructuring of extracellular matrix for tissue regeneration",
  "AMPK Activation": "Master metabolic switch for energy production and fat burning",
  "Mitochondrial Biogenesis": "Creation of new mitochondria for cellular energy",
  "Incretin Receptor": "Incretin hormone pathway for appetite and glucose control",
  "GIP": "Gastric inhibitory peptide for enhanced insulin sensitivity",
  "Glucagon": "Counter-regulatory hormone for fat mobilization",
  "Ghrelin Receptor": "Growth hormone secretagogue receptor activation",
  "GH Secretion": "Natural growth hormone release from the pituitary",
  "GHRH Signaling": "Growth hormone-releasing hormone pathway",
  "Telomerase Activation": "Enzyme activation for chromosome end protection",
  "Pineal Function": "Regulation of melatonin and circadian rhythms",
  "BDNF": "Brain-derived neurotrophic factor for neuroplasticity",
  "NGF": "Nerve growth factor for neuron survival and growth",
  "Dopamine": "Neurotransmitter pathway for motivation and reward",
  "GABA": "Inhibitory neurotransmitter for calm and anxiety reduction",
  "Serotonin": "Mood-regulating neurotransmitter pathway",
  "NF-κB Inhibition": "Blocks the master inflammatory switch to create a healing-ready environment",
  "Anti-Inflammatory": "Reduces systemic inflammation to allow repair peptides to function optimally",
  "Mucosal Healing": "Restores gut barrier integrity and mucosal lining for gut-immune axis health",
  "T-Cell Activation": "Stimulates T-lymphocyte maturation for adaptive immune response",
  "Immune Modulation": "Fine-tunes immune system balance between activation and tolerance",
  "Dendritic Cell Maturation": "Enhances antigen-presenting cells for improved immune surveillance",
  "Antimicrobial Defense": "Direct pathogen killing through membrane disruption",
  "Innate Immunity": "First-line immune defense through pattern recognition receptors",
  "Wound Healing": "Coordinated tissue repair through cell migration and matrix deposition",
  "Neurotrophic Signaling": "Growth factor support for neuronal survival and function",
  "Synaptic Plasticity": "Strengthening neural connections for learning and memory",
  "Lipolysis": "Enzymatic breakdown of stored fat for energy utilization",
  "Fat Oxidation": "Mitochondrial burning of fatty acids for ATP production",
  "NNMT Inhibition": "Blocks nicotinamide N-methyltransferase to boost cellular NAD+ and metabolism",
  "NAD+ Salvage": "Recycling pathway for maintaining cellular energy currency levels",
  "SNARE Complex": "Protein complex controlling neurotransmitter release at neuromuscular junctions",
  "Neuromuscular Modulation": "Fine-tuning of muscle contraction signaling at the nerve-muscle interface",
  "Thymic Restoration": "Reversal of age-related thymus decline for immune cell production",
  "IGF-1 Signaling": "Insulin-like growth factor pathway for cellular growth and repair",
  "mTOR Pathway": "Master growth regulator controlling protein synthesis and cell proliferation",
  "Cell Proliferation": "Controlled cell division for tissue growth and regeneration",
};

// Helper to normalize peptide names for matching
const normalizePeptideName = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')  // Remove parentheses content
    .replace(/[^a-z0-9]/g, '')      // Remove everything except letters and numbers (including hyphens)
    .trim();
};

// Get peptide pathway data
const getPeptidePathway = (productName: string): PeptidePathway | null => {
  const normalized = normalizePeptideName(productName);
  for (const [key, data] of Object.entries(PEPTIDE_PATHWAYS)) {
    if (normalized.includes(key.replace(/-/g, ''))) {
      return data;
    }
  }
  return null;
};

// Check if selected peptides form an EXACT known stack (same peptides, same count)
const checkKnownStack = (selectedNames: string[]): KnownStack | null => {
  const normalizedSelected = selectedNames.map(normalizePeptideName);
  
  for (const stack of KNOWN_STACKS) {
    const stackPeptides = stack.peptides;
    const hasAll = stackPeptides.every(p => 
      normalizedSelected.some(s => s.includes(p.replace(/-/g, '')))
    );
    const isExactMatch = stackPeptides.length === normalizedSelected.length;
    
    if (hasAll && isExactMatch) {
      return stack;
    }
  }
  return null;
};

// Check for known stacks that are CONTAINED within current selection (with extra peptides)
const checkContainedStacks = (selectedNames: string[]): KnownStack[] => {
  const normalizedSelected = selectedNames.map(normalizePeptideName);
  const containedStacks: KnownStack[] = [];
  
  for (const stack of KNOWN_STACKS) {
    const hasAll = stack.peptides.every(p => 
      normalizedSelected.some(s => s.includes(p.replace(/-/g, '')))
    );
    // Only count as "contained" if we have MORE peptides than the stack (not exact match)
    const hasExtra = normalizedSelected.length > stack.peptides.length;
    
    if (hasAll && hasExtra) {
      containedStacks.push(stack);
    }
  }
  
  // Sort by synergy bonus (highest first)
  return containedStacks.sort((a, b) => b.synergyBonus - a.synergyBonus);
};

// Get recommendation to complete a known stack (only if achievable)
const getStackRecommendation = (selectedNames: string[]): { stack: KnownStack; missing: string[] } | null => {
  const normalizedSelected = selectedNames.map(normalizePeptideName);
  const maxPeptides = 4;
  
  // Sort stacks by synergy bonus (recommend best stacks first)
  const sortedStacks = [...KNOWN_STACKS].sort((a, b) => b.synergyBonus - a.synergyBonus);
  
  for (const stack of sortedStacks) {
    const matchCount = stack.peptides.filter(p => 
      normalizedSelected.some(s => s.includes(p.replace(/-/g, '')))
    ).length;
    
    const missing = stack.peptides.filter(p => 
      !normalizedSelected.some(s => s.includes(p.replace(/-/g, '')))
    );
    
    // Only recommend if:
    // 1. They have at least 1 peptide from this stack
    // 2. They don't have all peptides yet
    // 3. Adding the missing peptides would result in an EXACT match (achievable)
    const wouldBeExactMatch = (normalizedSelected.length + missing.length) === stack.peptides.length;
    const wouldFitLimit = (normalizedSelected.length + missing.length) <= maxPeptides;
    
    if (matchCount >= 1 && matchCount < stack.peptides.length && wouldBeExactMatch && wouldFitLimit) {
      return { stack, missing };
    }
  }
  return null;
};

// Find shared pathways between peptides
const findSharedPathways = (peptideNames: string[]): string[] => {
  const allPathways: string[][] = [];
  
  for (const name of peptideNames) {
    const pathway = getPeptidePathway(name);
    if (pathway) {
      allPathways.push(pathway.pathways);
    }
  }
  
  if (allPathways.length < 2) return [];
  
  // Find pathways that appear in multiple peptides
  const pathwayCounts = new Map<string, number>();
  for (const paths of allPathways) {
    for (const p of paths) {
      pathwayCounts.set(p, (pathwayCounts.get(p) || 0) + 1);
    }
  }
  
  return Array.from(pathwayCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([pathway]) => pathway);
};

// Calculate synergy score
const calculateSynergyScore = (peptideNames: string[]): number => {
  if (peptideNames.length < 2) return 0;
  
  // Check for exact known stacks first (highest priority)
  const knownStack = checkKnownStack(peptideNames);
  if (knownStack) return knownStack.synergyBonus;
  
  // Check for contained stacks (give partial credit)
  const containedStacks = checkContainedStacks(peptideNames);
  if (containedStacks.length > 0) {
    // Give credit based on the best contained stack, but reduce slightly since it's not pure
    const bestContained = containedStacks[0];
    const containedBonus = Math.round(bestContained.synergyBonus * 0.75); // 75% of contained stack's value
    
    // Add small bonus for shared pathways with extra peptides
    const sharedPathways = findSharedPathways(peptideNames);
    const pathwayBonus = Math.min(sharedPathways.length * 3, 10);
    
    return Math.min(containedBonus + pathwayBonus, 90);
  }
  
  // Calculate based on shared pathways and systems (no known stacks)
  const sharedPathways = findSharedPathways(peptideNames);
  const baseScore = 50;
  const pathwayBonus = sharedPathways.length * 10;
  
  return Math.min(baseScore + pathwayBonus, 85);
};

// Get active body systems based on selection
const getActiveSystems = (peptideNames: string[]): string[] => {
  const systems = new Set<string>();
  
  for (const name of peptideNames) {
    const pathway = getPeptidePathway(name);
    if (pathway) {
      pathway.systems.forEach(s => systems.add(s.toLowerCase()));
    }
  }
  
  return Array.from(systems);
};

// General pairing recommendations for ANY peptide (not just known stacks)
const PEPTIDE_PAIRINGS: Record<string, { partner: string; reason: string; boost: string }[]> = {
  "bpc-157": [
    { partner: "tb-500", reason: "Local + systemic healing for full-body repair", boost: "Healing" },
    { partner: "ghk-cu", reason: "Tissue repair meets collagen regeneration", boost: "Skin" },
    { partner: "ll-37", reason: "Healing + antimicrobial defense", boost: "Immune" },
    { partner: "kpv", reason: "Gut repair + anti-inflammatory support", boost: "Healing" },
  ],
  "tb-500": [
    { partner: "bpc-157", reason: "The classic Wolverine combo — systemic + targeted repair", boost: "Healing" },
    { partner: "ipamorelin", reason: "Recovery + growth hormone for faster tissue rebuilding", boost: "Growth" },
    { partner: "ghk-cu", reason: "Tissue mobility + skin matrix renewal", boost: "Skin" },
    { partner: "kpv", reason: "Anti-inflammatory clearance lets TB-500 repair faster", boost: "Healing" },
  ],
  "ghk-cu": [
    { partner: "epithalon", reason: "Collagen renewal + telomere protection for longevity", boost: "Longevity" },
    { partner: "bpc-157", reason: "Skin repair + internal healing synergy", boost: "Healing" },
    { partner: "snap-8", reason: "Matrix remodeling + expression line reduction", boost: "Skin" },
    { partner: "kpv", reason: "Inflammation control enhances collagen remodeling", boost: "Skin" },
  ],
  "mots-c": [
    { partner: "rr-a3", reason: "Mitochondrial energy + metabolic signaling", boost: "Metabolic" },
    { partner: "aicar", reason: "Dual AMPK activation for enhanced fat oxidation", boost: "Metabolic" },
    { partner: "ss-31", reason: "Mitochondrial peptide synergy for cellular energy", boost: "Longevity" },
  ],
  "rr-a3": [
    { partner: "mots-c", reason: "Triple agonist + mitochondrial activator", boost: "Metabolic" },
    { partner: "5-amino-1mq", reason: "Fat metabolism through complementary pathways", boost: "Metabolic" },
    { partner: "aod-9604", reason: "Incretin signaling + targeted fat reduction", boost: "Metabolic" },
  ],
  "ipamorelin": [
    { partner: "cjc-1295", reason: "GH pulse + sustained release — the gold standard GH stack", boost: "Growth" },
    { partner: "tb-500", reason: "Growth hormone + tissue repair acceleration", boost: "Healing" },
    { partner: "sermorelin", reason: "Complementary GH secretagogue pathways", boost: "Growth" },
  ],
  "cjc-1295": [
    { partner: "ipamorelin", reason: "GHRH + ghrelin receptor for amplified GH release", boost: "Growth" },
    { partner: "tesamorelin", reason: "Dual GHRH analogs for sustained growth support", boost: "Growth" },
    { partner: "mots-c", reason: "Growth + metabolic optimization", boost: "Metabolic" },
  ],
  "epithalon": [
    { partner: "ghk-cu", reason: "Telomere protection + tissue renewal", boost: "Longevity" },
    { partner: "ipamorelin", reason: "Circadian rhythm + deep sleep GH pulse", boost: "Sleep" },
    { partner: "foxo4", reason: "Telomerase + senolytic for comprehensive anti-aging", boost: "Longevity" },
  ],
  "semax": [
    { partner: "selank", reason: "Focus + calm — nootropic synergy without jitters", boost: "Cognitive" },
    { partner: "cerebrolysin", reason: "Neuroprotection through complementary mechanisms", boost: "Cognitive" },
    { partner: "pinealon", reason: "BDNF enhancement + pineal gland support", boost: "Cognitive" },
  ],
  "selank": [
    { partner: "semax", reason: "Anxiolytic + cognitive enhancer — balanced clarity", boost: "Cognitive" },
    { partner: "dsip", reason: "Mood regulation + deep sleep restoration", boost: "Sleep" },
    { partner: "thymosin alpha", reason: "Immune modulation + anxiety relief", boost: "Immune" },
  ],
  "dsip": [
    { partner: "melatonin", reason: "Deep sleep peptide + circadian hormone", boost: "Sleep" },
    { partner: "epithalon", reason: "Sleep architecture + pineal function", boost: "Longevity" },
    { partner: "selank", reason: "Calm mind + restorative sleep", boost: "Cognitive" },
  ],
  "foxo4": [
    { partner: "epithalon", reason: "Senolytic + telomerase — advanced longevity protocol", boost: "Longevity" },
    { partner: "ss-31", reason: "Cellular cleanup + mitochondrial protection", boost: "Longevity" },
  ],
  "ss-31": [
    { partner: "mots-c", reason: "Dual mitochondrial support peptides", boost: "Longevity" },
    { partner: "foxo4", reason: "Mitochondrial health + senescent cell clearance", boost: "Longevity" },
  ],
  "pt-141": [
    { partner: "kisspeptin", reason: "MC receptor + GnRH pathway for hormonal balance", boost: "Hormonal" },
    { partner: "oxytocin", reason: "Complementary hormonal and wellbeing support", boost: "Hormonal" },
  ],
  "kpv": [
    { partner: "bpc-157", reason: "Clear inflammation first, then repair — the KLOW principle", boost: "Healing" },
    { partner: "tb-500", reason: "Anti-inflammatory prep + systemic tissue regeneration", boost: "Healing" },
    { partner: "ghk-cu", reason: "NF-κB inhibition + collagen remodeling for skin renewal", boost: "Skin" },
  ],
  "thymosin alpha": [
    { partner: "ll-37", reason: "Adaptive immunity + antimicrobial peptide — complete immune defense", boost: "Immune" },
    { partner: "thymalin", reason: "Dual thymic peptides for comprehensive immune restoration", boost: "Immune" },
    { partner: "bpc-157", reason: "Immune modulation + gut barrier support", boost: "Healing" },
  ],
  "ll-37": [
    { partner: "thymosin alpha", reason: "Antimicrobial + immune activation synergy", boost: "Immune" },
    { partner: "bpc-157", reason: "Immune defense + tissue healing", boost: "Healing" },
    { partner: "thymalin", reason: "Dual immune system support peptides", boost: "Immune" },
  ],
  "cerebrolysin": [
    { partner: "semax", reason: "Neurotrophic factors + BDNF — dual neuroprotection", boost: "Cognitive" },
    { partner: "selank", reason: "Brain repair + anxiolytic calm for cognitive balance", boost: "Cognitive" },
    { partner: "pinealon", reason: "Neuroprotection + pineal gland support", boost: "Cognitive" },
  ],
  "aod-9604": [
    { partner: "5-amino-1mq", reason: "Fat fragment + metabolic enzyme targeting", boost: "Metabolic" },
    { partner: "mots-c", reason: "Targeted fat loss + mitochondrial energy", boost: "Metabolic" },
    { partner: "cagrilintide", reason: "Complementary metabolic signaling", boost: "Metabolic" },
  ],
  "5-amino-1mq": [
    { partner: "aod-9604", reason: "NNMT inhibition + GH fragment for fat metabolism", boost: "Metabolic" },
    { partner: "mots-c", reason: "Enzyme targeting + mitochondrial activation", boost: "Metabolic" },
  ],
  "sermorelin": [
    { partner: "ipamorelin", reason: "GHRH analog + ghrelin mimetic for synergistic GH release", boost: "Growth" },
    { partner: "cjc-1295", reason: "Complementary GHRH signaling pathways", boost: "Growth" },
  ],
  "snap-8": [
    { partner: "ghk-cu", reason: "Expression line reduction + collagen matrix renewal", boost: "Skin" },
    { partner: "bpc-157", reason: "Neuromuscular modulation + tissue healing", boost: "Skin" },
  ],
  "thymalin": [
    { partner: "epithalon", reason: "Thymic restoration + telomerase — the Russian longevity protocol", boost: "Longevity" },
    { partner: "thymosin alpha", reason: "Comprehensive thymic peptide therapy for immune rejuvenation", boost: "Immune" },
  ],
  "igf-1 lr3": [
    { partner: "bpc-157", reason: "Muscle growth factor + tissue repair acceleration", boost: "Growth" },
    { partner: "ipamorelin", reason: "Direct IGF-1 + endogenous GH for maximum anabolic research", boost: "Growth" },
    { partner: "tb-500", reason: "Growth signaling + systemic recovery support", boost: "Healing" },
  ],
};

// Get general pairing recommendations for selected peptides
const getGeneralPairings = (
  selectedNames: string[],
  allProducts: { name: string; id: string; inStock: boolean | null }[],
  recommendation?: { stack: KnownStack; missing: string[] } | null
): { partner: string; reason: string; boost: string; productName: string; inStock: boolean; stackHint?: string }[] => {
  const normalizedSelected = selectedNames.map(normalizePeptideName);
  const pairings: { partner: string; reason: string; boost: string; productName: string; inStock: boolean; stackHint?: string }[] = [];
  const seenPartners = new Set<string>();

  if (recommendation && recommendation.missing.length <= 2) {
    for (const missingPeptide of recommendation.missing) {
      const missingNorm = missingPeptide.replace(/-/g, '');
      if (seenPartners.has(missingNorm)) continue;

      const matchingProduct = allProducts.find(p =>
        normalizePeptideName(p.name).includes(missingNorm)
      );
      if (matchingProduct) {
        seenPartners.add(missingNorm);

        let reason = "";
        for (const name of selectedNames) {
          const normalized = normalizePeptideName(name);
          for (const [key, pairs] of Object.entries(PEPTIDE_PAIRINGS)) {
            if (normalized.includes(key.replace(/-/g, ''))) {
              const match = pairs.find(p => p.partner.replace(/-/g, '') === missingNorm);
              if (match) {
                reason = match.reason;
                break;
              }
            }
          }
          if (reason) break;
        }

        const stackCategories = peptideCategories[missingPeptide];
        const boost = stackCategories?.[0]?.label || "Growth";

        pairings.push({
          partner: missingPeptide,
          reason: reason || `Completes the ${recommendation.stack.name}`,
          boost,
          productName: matchingProduct.name.replace(/\s*\([^)]*\)/g, ''),
          inStock: matchingProduct.inStock ?? false,
          stackHint: recommendation.stack.name,
        });
      }
    }
  }

  for (const name of selectedNames) {
    const normalized = normalizePeptideName(name);
    for (const [key, pairs] of Object.entries(PEPTIDE_PAIRINGS)) {
      if (normalized.includes(key.replace(/-/g, ''))) {
        for (const pair of pairs) {
          const partnerNorm = pair.partner.replace(/-/g, '');
          if (normalizedSelected.some(s => s.includes(partnerNorm))) continue;
          if (seenPartners.has(partnerNorm)) continue;
          
          const matchingProduct = allProducts.find(p => 
            normalizePeptideName(p.name).includes(partnerNorm)
          );
          if (matchingProduct) {
            seenPartners.add(partnerNorm);
            pairings.push({
              ...pair,
              productName: matchingProduct.name.replace(/\s*\([^)]*\)/g, ''),
              inStock: matchingProduct.inStock ?? false,
            });
          }
        }
      }
    }
  }

  return pairings.slice(0, 3);
};

// Goal-based starter peptides (best first pick per goal)
const GOAL_STARTERS: { goal: string; icon: typeof Heart; color: string; starterKey: string; description: string }[] = [
  { goal: "Healing", icon: Heart, color: "#22c55e", starterKey: "bpc-157", description: "Start with BPC-157 — the gold standard for tissue repair" },
  { goal: "Growth", icon: Target, color: "#f59e0b", starterKey: "ipamorelin", description: "Start with Ipamorelin — clean GH release without side effects" },
  { goal: "Metabolic", icon: Zap, color: "#E7FB10", starterKey: "mots-c", description: "Start with MOTS-C — mitochondrial energy activator" },
  { goal: "Cognitive", icon: Brain, color: "#21d8ff", starterKey: "semax", description: "Start with Semax — BDNF-boosting focus enhancer" },
  { goal: "Skin", icon: Sparkles, color: "#ec4899", starterKey: "ghk-cu", description: "Start with GHK-Cu — collagen and matrix remodeling" },
  { goal: "Longevity", icon: Crown, color: "#a855f7", starterKey: "epithalon", description: "Start with Epithalon — telomerase activation" },
];

// Structured synergy analysis interface (for AI response)
interface SynergyAnalysis {
  peptidePathways: Array<{
    name: string;
    pathway: string;
    mechanism: string;
  }>;
  synergyBenefits: string[];
  bestFor: string[];
  simpleExplanation: string;
  expertExplanation: string;
  synergyScore: number;
}

// Goal-based category mapping for peptides
const peptideCategories: Record<string, { label: string; color: string; icon: typeof Heart }[]> = {
  "bpc-157": [{ label: "Healing", color: "#22c55e", icon: Heart }, { label: "Gut", color: "#3b82f6", icon: Shield }],
  "tb-500": [{ label: "Healing", color: "#22c55e", icon: Heart }, { label: "Mobility", color: "#f59e0b", icon: Zap }],
  "ghk-cu": [{ label: "Skin", color: "#ec4899", icon: Sparkles }, { label: "Longevity", color: "#a855f7", icon: Crown }],
  "mots-c": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }, { label: "Energy", color: "#f59e0b", icon: Zap }],
  "rr-a3": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "rr-a1": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "rr-a2": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "epithalon": [{ label: "Longevity", color: "#a855f7", icon: Crown }],
  "semax": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }],
  "selank": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }, { label: "Mood", color: "#3b82f6", icon: Heart }],
  "ipamorelin": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "cjc-1295": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "5-amino-1mq": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "ace-031": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "aicar": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }, { label: "Energy", color: "#f59e0b", icon: Activity }],
  "aod-9604": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "adipotide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "alprostadil": [{ label: "Vascular", color: "#ef4444", icon: Heart }],
  "ara-290": [{ label: "Healing", color: "#22c55e", icon: Heart }],
  "botulinum": [{ label: "Cosmetic", color: "#ec4899", icon: Sparkles }],
  "cagrilintide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "cerebrolysin": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }],
  "dsip": [{ label: "Sleep", color: "#8b5cf6", icon: Moon }],
  "foxo4": [{ label: "Longevity", color: "#a855f7", icon: Crown }],
  "ghrp-2": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "ghrp-6": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "glow": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "glutathione": [{ label: "Longevity", color: "#a855f7", icon: Shield }],
  "gonadorelin": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "hcg": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "hmg": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "hexarelin": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "hyaluronic": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "igf-1": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "igf-des": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "klow": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "kpv": [{ label: "Healing", color: "#22c55e", icon: Shield }, { label: "Skin", color: "#ec4899", icon: Sparkles }, { label: "Longevity", color: "#a855f7", icon: Crown }],
  "kisspeptin": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "ll-37": [{ label: "Immune", color: "#22c55e", icon: Shield }],
  "mgf": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "peg-mgf": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "mazdutide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "melanotan": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "melatonin": [{ label: "Sleep", color: "#8b5cf6", icon: Moon }],
  "oxytocin": [{ label: "Hormonal", color: "#f59e0b", icon: Heart }],
  "pnc-27": [{ label: "Immune", color: "#22c55e", icon: Shield }],
  "pt-141": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "pinealon": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }],
  "slu-pp-332": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }, { label: "Energy", color: "#f59e0b", icon: Activity }],
  "ss-31": [{ label: "Longevity", color: "#a855f7", icon: Shield }],
  "sermorelin": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "snap-8": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "survodutide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "tesamorelin": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "thymalin": [{ label: "Immune", color: "#22c55e", icon: Shield }],
  "thymosin alpha": [{ label: "Immune", color: "#22c55e", icon: Shield }],
  "triptorelin": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "vip": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }, { label: "Immune", color: "#22c55e", icon: Shield }],
  "default": [{ label: "Research", color: "#6b7280", icon: Beaker }],
};

const getPeptideCategories = (productName: string) => {
  const normalizedName = productName.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
  for (const key of Object.keys(peptideCategories)) {
    if (key !== 'default' && normalizedName.includes(key)) {
      return peptideCategories[key];
    }
  }
  return peptideCategories.default;
};

// Custom Stack Builder Component
interface CustomStackBuilderProps {
  onSwitchToPreBuilt: () => void;
  templatePeptideNames?: string[];
  onTemplateApplied?: () => void;
}

function GuidanceAccordion({ autoOpen, selectedCount, children }: { autoOpen: string[]; selectedCount: number; children: React.ReactNode }) {
  const [openItems, setOpenItems] = useState<string[]>(autoOpen);
  const prevCountRef = useRef(selectedCount);

  useEffect(() => {
    if (prevCountRef.current !== selectedCount) {
      setOpenItems(prev => {
        const newSet = new Set(prev);
        autoOpen.forEach(item => newSet.add(item));
        return Array.from(newSet);
      });
      prevCountRef.current = selectedCount;
    }
  }, [selectedCount, autoOpen]);

  return (
    <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="px-4">
      {children}
    </Accordion>
  );
}

function CustomStackBuilder({ onSwitchToPreBuilt, templatePeptideNames, onTemplateApplied }: CustomStackBuilderProps) {
  const [selectedPeptides, setSelectedPeptides] = useState<Product[]>([]);
  const [stackName, setStackName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [showSavedStacks, setShowSavedStacks] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { isAuthenticated, login } = useAuth();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch user's saved stacks
  const { data: savedStacks } = useQuery<SavedStack[]>({
    queryKey: ["/api/saved-stacks"],
    enabled: isAuthenticated,
  });

  // Fetch popular stacks
  const { data: popularStacks } = useQuery<{ peptideNames: string[], count: number }[]>({
    queryKey: ["/api/popular-stacks"],
  });

  // Save stack mutation
  const saveStackMutation = useMutation({
    mutationFn: async (data: { name: string; peptideIds: string[]; peptideNames: string[]; isPublic: boolean }): Promise<SavedStack> => {
      const res = await fetch("/api/saved-stacks", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (saved: SavedStack) => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-stacks"] });
      setShowSaveDialog(false);
      setStackName("");
      const shareUrl = `${window.location.origin}/research-stacks?share=${saved.shareCode}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Stack Saved!",
        description: "Share link copied to clipboard!",
      });
    },
    onError: () => {
      toast({ title: "Failed to save stack", variant: "destructive" });
    }
  });

  // Delete stack mutation
  const deleteStackMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saved-stacks/${id}`, { 
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-stacks"] });
      toast({ title: "Stack deleted" });
    }
  });

  const allPeptides = products?.filter(p => p.category?.toLowerCase() === "peptides") || [];
  const [peptideSearch, setPeptideSearch] = useState("");

  // Check URL for shared stack code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareCode = params.get('share');
    
    if (shareCode && products && products.length > 0) {
      fetch(`/api/saved-stacks/share/${shareCode}`)
        .then(res => res.ok ? res.json() : null)
        .then((sharedStack: { name: string; peptideIds: string[]; peptideNames: string[] } | null) => {
          if (sharedStack && sharedStack.peptideIds) {
            const matchedPeptides = sharedStack.peptideIds
              .map(id => products.find(p => p.id === id))
              .filter((p): p is Product => p !== undefined);
            
            if (matchedPeptides.length > 0) {
              setSelectedPeptides(matchedPeptides);
              toast({
                title: `Loaded "${sharedStack.name}"`,
                description: `Shared stack with ${matchedPeptides.length} peptides has been loaded.`,
              });
              // Clear the URL parameter
              window.history.replaceState({}, '', window.location.pathname);
            }
          }
        })
        .catch(() => {
          // Silently fail if share code is invalid
        });
    }
  }, [products, toast]);

  // Apply template peptides when provided
  useEffect(() => {
    if (templatePeptideNames && templatePeptideNames.length > 0 && products) {
      const matchedPeptides = templatePeptideNames
        .map(name => products.find(p => 
          p.name.toLowerCase().includes(name.toLowerCase().replace(/\s*\([^)]*\)/g, '')) ||
          name.toLowerCase().includes(p.name.toLowerCase())
        ))
        .filter((p): p is Product => p !== undefined)
        .slice(0, 4);
      
      if (matchedPeptides.length > 0) {
        setSelectedPeptides(matchedPeptides);
        onTemplateApplied?.();
        toast({
          title: "Template Applied",
          description: `${matchedPeptides.length} peptide${matchedPeptides.length > 1 ? 's' : ''} from the template have been pre-selected. Customize as needed!`,
        });
      }
    }
  }, [templatePeptideNames, products, onTemplateApplied, toast]);

  const togglePeptide = (product: Product) => {
    if (selectedPeptides.find(p => p.id === product.id)) {
      setSelectedPeptides(prev => prev.filter(p => p.id !== product.id));
    } else if (selectedPeptides.length < 4) {
      setSelectedPeptides(prev => [...prev, product]);
    }
  };

  const getRetailTotal = () => {
    return selectedPeptides.reduce((sum, p) => sum + parseFloat(String(p.price)), 0);
  };

  const handleAddToCart = async () => {
    if (selectedPeptides.length < 2) return;

    const customStackName = selectedPeptides.map(p => p.name).join(" + ");
    const bundleId = `custom-${Date.now()}`;
    const totalPrice = getRetailTotal();
    
    await addToCart({
      productId: bundleId,
      bundleId: bundleId,
      name: customStackName,
      price: totalPrice,
      originalPrice: totalPrice,
      quantity: 1,
      dosage: "Custom Bundle",
      image: selectedPeptides[0]?.imageUrl || productImage,
      isBundle: true,
    });

    toast({
      title: "Added to Cart",
      description: `${customStackName} added to your cart`,
      duration: 2500,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/cart")}
          className="border-[#E7FB10] text-[#E7FB10] hover:bg-[#E7FB10]/10"
          data-testid="button-toast-view-cart"
        >
          View Cart
        </Button>
      ),
    });

    // Reset
    setSelectedPeptides([]);
  };

  return (
    <div className="space-y-6">
      {/* Two Column Layout: Peptides Left, Build Panel Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_1fr] gap-6">
        {/* Left Column: Peptide Selection */}
        <div className="flex flex-col pb-4 lg:pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl font-bold">Select Your Peptides</h3>
              <p className="text-sm text-muted-foreground">
                Click to select • {allPeptides.length} peptides
              </p>
            </div>
            {selectedPeptides.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-[#21d8ff]/20 text-[#21d8ff] border-[#21d8ff]/30">
                  {selectedPeptides.length}/4 Selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPeptides([])}
                  className="text-xs text-muted-foreground"
                  data-testid="button-clear-selection"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="p-2">
                  <Skeleton className="aspect-[4/3] rounded-md mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
              ))}
            </div>
          ) : allPeptides.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-[#2a2a32]">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No Peptides Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No peptides found.
              </p>
              <Button variant="outline" className="mt-4" onClick={onSwitchToPreBuilt}>
                View Pre-Built Stacks
              </Button>
            </Card>
          ) : (() => {
            const filteredPeptides = allPeptides
              .filter(p => {
                if (!peptideSearch.trim()) return true;
                const q = peptideSearch.toLowerCase();
                const name = p.name.toLowerCase().replace(/\s*\([^)]*\)/g, '');
                const cats = getPeptideCategories(p.name);
                return name.includes(q) || cats.some(c => c.label.toLowerCase().includes(q));
              })
              .sort((a, b) => {
                if (a.inStock && !b.inStock) return -1;
                if (!a.inStock && b.inStock) return 1;
                return a.name.localeCompare(b.name);
              });

            return (
              <div className="flex flex-col gap-3 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search peptides..."
                    value={peptideSearch}
                    onChange={(e) => setPeptideSearch(e.target.value)}
                    className="pl-9 bg-[#1a1a1f] border-[#2a2a32] focus:border-[#21d8ff]/50"
                    data-testid="input-peptide-search"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto pr-1 scrollbar-thin max-h-[400px] sm:max-h-[600px]">
                  {filteredPeptides.map(product => {
                    const isSelected = selectedPeptides.find(p => p.id === product.id);
                    const isDisabled = !isSelected && selectedPeptides.length >= 4;
                    const isOutOfStock = !product.inStock;
                    const categories = getPeptideCategories(product.name);
                    const primaryCategory = categories[0];

                    return (
                      <motion.button
                        key={product.id}
                        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                        whileTap={{ scale: isDisabled ? 1 : 0.99 }}
                        onClick={() => !isDisabled && togglePeptide(product)}
                        disabled={isDisabled}
                        className={`text-left p-3 rounded-lg border transition-all duration-200 relative ${
                          isSelected
                            ? isOutOfStock
                              ? "border-2 border-[#21d8ff] bg-[#21d8ff]/10"
                              : "border-2 border-[#21d8ff] bg-[#21d8ff]/10"
                            : isDisabled
                            ? "opacity-40 cursor-not-allowed border-[#2a2a32] bg-[#1a1a1f]"
                            : isOutOfStock
                            ? "border-[#2a2a32] bg-[#1a1a1f]/60 hover:border-[#21d8ff]/30 hover:bg-[#21d8ff]/5"
                            : "border-[#2a2a32] bg-[#1a1a1f] hover:border-[#21d8ff]/50 hover:bg-[#21d8ff]/5"
                        }`}
                        data-testid={`card-select-peptide-${product.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`font-display font-bold text-base truncate ${
                              isSelected ? "text-[#21d8ff]" : isOutOfStock ? "text-white/50" : "text-white"
                            }`}>
                              {product.name.replace(/\s*\([^)]*\)/g, '')}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs" style={{ color: isOutOfStock ? `${primaryCategory.color}80` : primaryCategory.color }}>
                                {primaryCategory.label}
                              </p>
                              {isOutOfStock && (
                                <span className="text-[10px] text-white/30 uppercase tracking-wider">Out of stock</span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-[#21d8ff] flex items-center justify-center shrink-0"
                            >
                              <Check className="h-3 w-3 text-black" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                  {filteredPeptides.length === 0 && (
                    <p className="col-span-full text-center text-sm text-muted-foreground py-6">
                      No peptides match "{peptideSearch}"
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Synergy Visualization Panel - inline on mobile, sticky sidebar on desktop */}
        <div>
          <div className="lg:sticky lg:top-28 space-y-4">
            
            {/* ====== SYNERGY RING & SCORE ====== */}
            {(() => {
              const peptideNames = selectedPeptides.map(p => p.name);
              const synergyScore = calculateSynergyScore(peptideNames);
              const knownStack = checkKnownStack(peptideNames);
              const recommendation = getStackRecommendation(peptideNames);
              const sharedPathways = findSharedPathways(peptideNames);
              const activeSystems = getActiveSystems(peptideNames);
              
              return (
                <>
                  {/* Synergy Ring Visualization */}
                  <Card className="border-2 border-[#9d4edd]/40 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12] overflow-hidden" data-testid="card-synergy-ring">
                    <div className="p-3 sm:p-5">
                      <div className="flex items-center gap-3 sm:gap-5">
                        {/* Animated Synergy Ring */}
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background ring */}
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke="#2a2a32"
                              strokeWidth="7"
                            />
                            {/* Progress ring */}
                            <motion.circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="none"
                              stroke={knownStack ? knownStack.color : synergyScore > 70 ? "#22c55e" : synergyScore > 50 ? "#E7FB10" : "#21d8ff"}
                              strokeWidth="7"
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0 264" }}
                              animate={{ 
                                strokeDasharray: `${(synergyScore / 100) * 264} 264`,
                              }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{
                                filter: knownStack ? `drop-shadow(0 0 8px ${knownStack.color})` : undefined
                              }}
                            />
                          </svg>
                          {/* Center content */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span 
                              key={synergyScore}
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="font-display text-3xl sm:text-4xl font-bold"
                              style={{ color: knownStack ? knownStack.color : "#fff" }}
                            >
                              {synergyScore}%
                            </motion.span>
                            <span className="text-xs text-muted-foreground font-semibold tracking-wider">SYNERGY</span>
                          </div>
                        </div>
                        
                        {/* Stack Status */}
                        <div className="flex-1 min-w-0">
                          {selectedPeptides.length === 0 ? (
                            <div className="text-center">
                              <p className="font-display font-bold text-base">Pick a Goal to Start</p>
                              <p className="text-sm text-muted-foreground mt-1">or select any peptide below</p>
                            </div>
                          ) : knownStack ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-center"
                            >
                              {(() => {
                                const IconComponent = knownStack.icon;
                                return (
                                  <div className="mb-1 flex justify-center">
                                    <IconComponent className="w-6 h-6" style={{ color: knownStack.color }} />
                                  </div>
                                );
                              })()}
                              <p className="font-display font-bold text-xl" style={{ color: knownStack.color }}>
                                {knownStack.name}
                              </p>
                              <Badge className="mt-1.5 text-xs" style={{ backgroundColor: `${knownStack.color}20`, color: knownStack.color, border: `1px solid ${knownStack.color}40` }}>
                                Legendary Combo
                              </Badge>
                            </motion.div>
                          ) : selectedPeptides.length >= 2 ? (
                            (() => {
                              const containedStacks = checkContainedStacks(selectedPeptides.map(p => p.name));
                              if (containedStacks.length > 0) {
                                const bestContained = containedStacks[0];
                                const ContainedIcon = bestContained.icon;
                                return (
                                  <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center"
                                  >
                                    <div className="mb-1 flex justify-center">
                                      <ContainedIcon className="w-5 h-5" style={{ color: bestContained.color }} />
                                    </div>
                                    <p className="font-display font-bold text-base" style={{ color: bestContained.color }}>
                                      Contains {bestContained.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      + {selectedPeptides.length - bestContained.peptides.length} extra peptide{selectedPeptides.length - bestContained.peptides.length > 1 ? 's' : ''}
                                    </p>
                                  </motion.div>
                                );
                              }
                              return (
                                <div>
                                  <p className="font-display font-bold text-base">Custom Stack</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {sharedPathways.length > 0 
                                      ? `${sharedPathways.length} shared pathway${sharedPathways.length > 1 ? 's' : ''} detected`
                                      : "Building synergy..."}
                                  </p>
                                </div>
                              );
                            })()
                          ) : (
                            <div>
                              <p className="font-display font-bold text-base">Great Pick!</p>
                              <p className="text-sm text-muted-foreground mt-1">Add 1 more to see synergy</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Known Stack Description */}
                      {knownStack && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="mt-4 pt-3 border-t border-[#2a2a32]"
                        >
                          <p className="text-sm text-gray-300">{knownStack.description}</p>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                  {/* ====== GOAL-BASED STARTERS (empty state) ====== */}
                  {selectedPeptides.length === 0 && products && (
                    <Card className="border-[#2a2a32] bg-[#1a1a1f]/50" data-testid="card-goal-starters">
                      <div className="p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">NOT SURE WHERE TO START?</p>
                        <p className="text-xs text-muted-foreground mb-3">Pick a research goal and we'll suggest the best starting peptide.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {GOAL_STARTERS.map(starter => {
                            const StarterIcon = starter.icon;
                            const matchingProduct = products.find(p => 
                              normalizePeptideName(p.name).includes(starter.starterKey.replace(/-/g, ''))
                            );
                            return (
                              <motion.button
                                key={starter.goal}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (matchingProduct) {
                                    setSelectedPeptides([matchingProduct]);
                                  }
                                }}
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-[#2a2a32] bg-[#1a1a1f] transition-all text-left hover-elevate active-elevate-2"
                                style={{ borderColor: `${starter.color}30` }}
                                data-testid={`button-goal-${starter.goal.toLowerCase()}`}
                              >
                                <StarterIcon className="h-4 w-4 shrink-0" style={{ color: starter.color }} />
                                <span className="text-xs font-medium" style={{ color: starter.color }}>
                                  {starter.goal}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  )}
                  {/* ====== GUIDANCE ACCORDION ====== */}
                  {selectedPeptides.length > 0 && (() => {
                    const generalPairings = selectedPeptides.length >= 1 && selectedPeptides.length < 4 && products
                      ? getGeneralPairings(selectedPeptides.map(p => p.name), products, recommendation)
                      : [];
                    const showPairings = generalPairings.length > 0;
                    const stackPeptidesSurfacedInPairings = recommendation
                      ? recommendation.missing.every(m => {
                          const missingNorm = m.replace(/-/g, '');
                          return generalPairings.some(p => p.stackHint && p.partner.replace(/-/g, '') === missingNorm);
                        })
                      : false;
                    const hasRecommendation = recommendation && selectedPeptides.length < 4 && (
                      recommendation.missing.length === 1 || !stackPeptidesSurfacedInPairings
                    );
                    const hasPathways = sharedPathways.length > 0;

                    const autoOpen: string[] = [];
                    if (showPairings) autoOpen.push("pairings");
                    if (hasRecommendation) autoOpen.push("recommendation");
                    autoOpen.push("systems");
                    if (hasPathways) autoOpen.push("pathways");

                    return (
                      <Card className="border-[#2a2a32] bg-[#1a1a1f]/50" data-testid="section-guidance-accordion">
                        <GuidanceAccordion autoOpen={autoOpen} selectedCount={selectedPeptides.length}>
                          {showPairings && (
                            <AccordionItem value="pairings" className="border-[#2a2a32]" data-testid="accordion-pairings">
                              <AccordionTrigger className="text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-3.5 w-3.5 text-[#21d8ff]" />
                                  <span className="font-semibold text-[13px]">PAIRS WELL WITH</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {generalPairings.map((pairing, i) => {
                                    const matchingProduct = products?.find(p =>
                                      normalizePeptideName(p.name).includes(pairing.partner.replace(/-/g, ''))
                                    );
                                    return (
                                      <motion.button
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => {
                                          if (matchingProduct && selectedPeptides.length < 4) {
                                            togglePeptide(matchingProduct);
                                          }
                                        }}
                                        className="w-full text-left p-2.5 rounded-lg border border-[#2a2a32] transition-all hover-elevate active-elevate-2"
                                        data-testid={`button-pair-${pairing.partner}`}
                                      >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                          <span className="font-display text-white text-[16px] font-normal">
                                            {pairing.productName}
                                          </span>
                                          <Badge className="text-[9px] shrink-0" style={{ 
                                            backgroundColor: `${({
                                              Healing: "#22c55e", Metabolic: "#E7FB10", Growth: "#f59e0b", Cognitive: "#21d8ff",
                                              Skin: "#ec4899", Longevity: "#a855f7", Immune: "#22c55e", Sleep: "#8b5cf6",
                                              Hormonal: "#f59e0b", Vascular: "#ef4444", Weight: "#E7FB10",
                                            } as Record<string, string>)[pairing.boost] || '#21d8ff'}20`,
                                            color: ({
                                              Healing: "#22c55e", Metabolic: "#E7FB10", Growth: "#f59e0b", Cognitive: "#21d8ff",
                                              Skin: "#ec4899", Longevity: "#a855f7", Immune: "#22c55e", Sleep: "#8b5cf6",
                                              Hormonal: "#f59e0b", Vascular: "#ef4444", Weight: "#E7FB10",
                                            } as Record<string, string>)[pairing.boost] || '#21d8ff'
                                          }}>
                                            {pairing.boost}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{pairing.reason}</p>
                                        {pairing.stackHint && (
                                          <span className="text-[10px] mt-1 block" style={{ color: recommendation?.stack.color || '#21d8ff' }}>
                                            Unlocks {pairing.stackHint}
                                          </span>
                                        )}
                                        {!pairing.inStock && (
                                          <span className="mt-1 block text-[12px] text-[#fc00004d]">Out of stock</span>
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {hasRecommendation && recommendation && (
                            <AccordionItem value="recommendation" className="border-[#2a2a32]" data-testid="accordion-recommendation">
                              <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-3.5 w-3.5" style={{ color: recommendation.stack.color }} />
                                  <span className="text-xs font-semibold" style={{ color: recommendation.stack.color }}>
                                    COMPLETE {recommendation.stack.name.toUpperCase()}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="p-3 rounded-lg border-2 border-dashed" style={{ borderColor: `${recommendation.stack.color}40`, backgroundColor: `${recommendation.stack.color}08` }}>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Add {recommendation.missing.map(m => m.toUpperCase()).join(" + ")} to unlock this legendary combo
                                  </p>
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      {(() => {
                                        const RecommendIcon = recommendation.stack.icon;
                                        return <RecommendIcon className="w-5 h-5" style={{ color: recommendation.stack.color }} />;
                                      })()}
                                      <span className="font-display font-bold" style={{ color: recommendation.stack.color }}>
                                        {recommendation.stack.synergyBonus}% synergy
                                      </span>
                                    </div>
                                    <Badge className="text-[10px]" style={{ backgroundColor: `${recommendation.stack.color}20`, color: recommendation.stack.color }}>
                                      +{recommendation.stack.synergyBonus - synergyScore}% boost
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          <AccordionItem value="systems" className="border-[#2a2a32]" data-testid="accordion-systems">
                            <AccordionTrigger className="text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Target className="h-3.5 w-3.5 text-[#21d8ff]" />
                                <span className="text-xs font-semibold">BODY SYSTEMS</span>
                                <Badge variant="outline" className="text-[9px] ml-1">{activeSystems.length}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="flex flex-wrap gap-2">
                                {BODY_SYSTEMS.map(system => {
                                  const isActive = activeSystems.includes(system.id);
                                  const SystemIcon = system.icon;
                                  return (
                                    <Tooltip key={system.id}>
                                      <TooltipTrigger asChild>
                                        <motion.div
                                          initial={{ scale: 0.8 }}
                                          animate={{ 
                                            scale: isActive ? 1 : 0.9,
                                            opacity: isActive ? 1 : 0.3
                                          }}
                                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-help ${
                                            isActive 
                                              ? "border-opacity-50" 
                                              : "border-[#2a2a32] bg-[#1a1a1f]"
                                          }`}
                                          style={isActive ? { 
                                            borderColor: system.color,
                                            backgroundColor: `${system.color}15`,
                                            boxShadow: `0 0 12px ${system.color}30`
                                          } : undefined}
                                          data-testid={`system-${system.id}`}
                                        >
                                          <SystemIcon 
                                            className="h-3.5 w-3.5" 
                                            style={{ color: isActive ? system.color : "#6b7280" }} 
                                          />
                                          <span 
                                            className="text-xs font-medium"
                                            style={{ color: isActive ? system.color : "#6b7280" }}
                                          >
                                            {system.name}
                                          </span>
                                        </motion.div>
                                      </TooltipTrigger>
                                      <TooltipContent 
                                        side="top" 
                                        className="max-w-[200px] text-center bg-[#1a1a1f] border-[#2a2a32]"
                                      >
                                        <p className="text-xs">{system.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {hasPathways && (
                            <AccordionItem value="pathways" className="border-[#2a2a32] border-b-0" data-testid="accordion-pathways">
                              <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                  <Zap className="h-3.5 w-3.5 text-[#22c55e]" />
                                  <span className="text-xs font-semibold text-[#22c55e]">SYNERGY DETECTED</span>
                                  <Badge className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30">{sharedPathways.length}</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <p className="text-xs text-gray-400 mb-2">These peptides share pathways:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {sharedPathways.map((pathway, i) => (
                                    <Tooltip key={i}>
                                      <TooltipTrigger asChild>
                                        <Badge 
                                          className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30 cursor-help"
                                        >
                                          {pathway}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent 
                                        side="top"
                                        className="max-w-[200px] text-center bg-[#1a1a1f] border-[#2a2a32]"
                                      >
                                        <p className="text-xs">{PATHWAY_DESCRIPTIONS[pathway] || "Shared biological pathway"}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Saved Stacks inside accordion */}
                          {isAuthenticated && savedStacks && savedStacks.length > 0 && (
                            <AccordionItem value="saved" className="border-[#2a2a32] border-b-0" data-testid="accordion-saved-stacks">
                              <AccordionTrigger className="text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Save className="h-3.5 w-3.5 text-[#21d8ff]" />
                                  <span className="text-xs font-semibold">YOUR SAVED STACKS</span>
                                  <Badge variant="outline" className="text-[9px] ml-1">{savedStacks.length}</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                  {savedStacks.slice(0, 5).map((stack) => (
                                    <div 
                                      key={stack.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-[#0f0f12] border border-[#2a2a32] hover:border-[#21d8ff]/40 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{stack.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {stack.peptideNames?.join(' + ')}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1 ml-2">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => {
                                            if (products) {
                                              const matchedPeptides = (stack.peptideIds || [])
                                                .map(id => products.find(p => p.id === id))
                                                .filter((p): p is Product => p !== undefined);
                                              setSelectedPeptides(matchedPeptides);
                                              toast({ title: `Loaded "${stack.name}"` });
                                            }
                                          }}
                                          data-testid={`button-load-stack-${stack.id}`}
                                        >
                                          <FlaskConical className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => {
                                            const url = `${window.location.origin}/research-stacks?share=${stack.shareCode}`;
                                            navigator.clipboard.writeText(url);
                                            toast({ title: "Share link copied!" });
                                          }}
                                          data-testid={`button-share-stack-${stack.id}`}
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="text-red-400 hover:text-red-300"
                                          onClick={() => deleteStackMutation.mutate(stack.id)}
                                          data-testid={`button-delete-stack-${stack.id}`}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}

                          {/* Popular Combos inside accordion */}
                          {popularStacks && popularStacks.length > 0 && (
                            <AccordionItem value="popular" className="border-b-0" data-testid="accordion-popular-stacks">
                              <AccordionTrigger className="text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3.5 w-3.5 text-[#E7FB10]" />
                                  <span className="text-xs font-semibold">POPULAR COMBOS</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2">
                                  {popularStacks.slice(0, 3).map((combo, i) => (
                                    <div 
                                      key={i}
                                      className="flex items-center justify-between p-2 rounded-lg bg-[#0f0f12] border border-[#2a2a32] cursor-pointer hover:border-[#E7FB10]/40 transition-colors"
                                      onClick={() => {
                                        if (products) {
                                          const matchedPeptides = combo.peptideNames
                                            .map(name => products.find(p => p.name === name))
                                            .filter((p): p is Product => p !== undefined && p.inStock === true);
                                          if (matchedPeptides.length > 0) {
                                            setSelectedPeptides(matchedPeptides);
                                            toast({ title: "Stack loaded!" });
                                          }
                                        }
                                      }}
                                    >
                                      <p className="text-xs text-muted-foreground truncate flex-1">
                                        {combo.peptideNames.join(' + ')}
                                      </p>
                                      <Badge variant="outline" className="text-[10px] ml-2">
                                        {combo.count}x built
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </GuidanceAccordion>
                      </Card>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        </div>
      </div>
      {/* Research Disclaimer */}
      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-400">Research Use Only</p>
            <p className="text-xs text-gray-400">
              Custom stacks are intended for laboratory research purposes only. 
              Pathway analysis is based on published literature and does not constitute guidance for any application.
            </p>
          </div>
        </div>
      </div>
      {/* Spacer for sticky bottom bar + mobile nav */}
      <div className="h-36 md:h-20" />
      {/* ====== STICKY BOTTOM CART BAR ====== */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[51] border-t border-[#21d8ff]/30 bg-[#0f0f12]/95 backdrop-blur-xl shadow-[0_-4px_30px_rgba(33,216,255,0.1)]"
          data-testid="sticky-cart-bar"
        >
          {/* Collapsed bar */}
          <div 
            className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 cursor-pointer"
            onClick={() => setCartExpanded(!cartExpanded)}
            data-testid="button-toggle-cart"
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FlaskConical className="h-4 w-4 text-[#21d8ff]" />
                <span className="font-display font-bold text-base sm:text-[20px]">Your Stack</span>
                <Badge variant="outline" className="text-xs sm:text-[15px]">{selectedPeptides.length}/4</Badge>
              </div>
              {selectedPeptides.length >= 2 && (() => {
                const peptideNames = selectedPeptides.map(p => p.name);
                const synergyScore = calculateSynergyScore(peptideNames);
                const knownStack = checkKnownStack(peptideNames);
                return (
                  <Badge 
                    className="lg:hidden text-[10px] shrink-0"
                    style={{ 
                      backgroundColor: `${knownStack ? knownStack.color : synergyScore > 70 ? "#22c55e" : synergyScore > 50 ? "#E7FB10" : "#21d8ff"}20`,
                      color: knownStack ? knownStack.color : synergyScore > 70 ? "#22c55e" : synergyScore > 50 ? "#E7FB10" : "#21d8ff",
                      border: `1px solid ${knownStack ? knownStack.color : synergyScore > 70 ? "#22c55e" : synergyScore > 50 ? "#E7FB10" : "#21d8ff"}40`
                    }}
                    data-testid="badge-mobile-synergy"
                  >
                    {synergyScore}% {knownStack ? knownStack.name : "Synergy"}
                  </Badge>
                );
              })()}
              {selectedPeptides.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 flex-1 min-w-0">
                  {selectedPeptides.map((p, i) => (
                    <span key={p.id} className="text-muted-foreground truncate text-[14px]">
                      {i > 0 && <span className="mx-1 text-[#2a2a32]">+</span>}
                      {p.name.replace(/\s*\([^)]*\)/g, '')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {selectedPeptides.length >= 2 && (
                <span className="hidden sm:inline font-display text-lg font-bold text-[#E7FB10]">${getRetailTotal().toFixed(2)}</span>
              )}
              {(() => {
                const hasOutOfStock = selectedPeptides.some(p => !p.inStock);
                const notEnough = selectedPeptides.length < 2;
                return (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                    disabled={notEnough || hasOutOfStock}
                    className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90 font-bold shadow-[0_0_20px_rgba(231,251,16,0.3)] text-xs sm:text-sm"
                    data-testid="button-add-custom-stack"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{notEnough ? `${selectedPeptides.length}/2` : hasOutOfStock ? "Item Out of Stock" : "Add to Cart"}</span>
                    <span className="sm:hidden">{notEnough ? `${selectedPeptides.length}/2` : hasOutOfStock ? "OOS" : "Add"}</span>
                  </Button>
                );
              })()}
              <motion.div
                animate={{ rotate: cartExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {cartExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4 border-t border-[#2a2a32]">
                  <div className="pt-3 space-y-3 max-h-[50vh] overflow-y-auto">
                    {selectedPeptides.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">Select peptides from the grid above</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedPeptides.map(peptide => {
                            const isOOS = !peptide.inStock;
                            return (
                            <div 
                              key={peptide.id}
                              className={`flex items-center justify-between p-2 rounded-lg ${isOOS ? 'bg-red-500/10 border border-red-500/30' : 'bg-[#21d8ff]/5 border border-[#21d8ff]/20'}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm ${isOOS ? 'text-red-300/80' : ''}`}>
                                  {peptide.name.replace(/\s*\([^)]*\)/g, '')}
                                </span>
                                {isOOS && (
                                  <Badge variant="outline" className="text-xs border-red-500/40 text-red-400 no-default-hover-elevate no-default-active-elevate" data-testid={`badge-oos-${peptide.id}`}>
                                    OOS
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${isOOS ? 'line-through text-red-400/50' : 'text-muted-foreground'}`}>${peptide.price}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => togglePeptide(peptide)}
                                  data-testid={`button-remove-peptide-${peptide.id}`}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            );
                          })}
                        </div>

                        {/* Mobile-only synergy & systems summary */}
                        {selectedPeptides.length >= 2 && (() => {
                          const peptideNames = selectedPeptides.map(p => p.name);
                          const synergyScore = calculateSynergyScore(peptideNames);
                          const knownStack = checkKnownStack(peptideNames);
                          const sharedPathways = findSharedPathways(peptideNames);
                          const activeSystems = getActiveSystems(peptideNames);
                          const synergyColor = knownStack ? knownStack.color : synergyScore > 70 ? "#22c55e" : synergyScore > 50 ? "#E7FB10" : "#21d8ff";
                          return (
                            <div className="lg:hidden space-y-2 pt-2 border-t border-[#2a2a32]" data-testid="mobile-synergy-summary">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="relative w-10 h-10 shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                      <circle cx="18" cy="18" r="14" fill="none" stroke="#2a2a32" strokeWidth="3" />
                                      <circle cx="18" cy="18" r="14" fill="none" stroke={synergyColor} strokeWidth="3" strokeLinecap="round"
                                        strokeDasharray={`${(synergyScore / 100) * 88} 88`}
                                        style={{ filter: knownStack ? `drop-shadow(0 0 4px ${knownStack.color})` : undefined }}
                                      />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: synergyColor }}>
                                      {synergyScore}%
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold" style={{ color: synergyColor }}>
                                      {knownStack ? knownStack.name : "Custom Stack"}
                                    </p>
                                    {knownStack && (
                                      <Badge className="text-[8px] mt-0.5" style={{ backgroundColor: `${knownStack.color}20`, color: knownStack.color }}>
                                        Legendary Combo
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="font-display text-lg font-bold text-[#E7FB10]">${getRetailTotal().toFixed(2)}</span>
                              </div>
                              {activeSystems.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {BODY_SYSTEMS.filter(s => activeSystems.includes(s.id)).map(system => {
                                    const SystemIcon = system.icon;
                                    return (
                                      <div key={system.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
                                        style={{ backgroundColor: `${system.color}15`, color: system.color }}>
                                        <SystemIcon className="h-2.5 w-2.5" />
                                        {system.name}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {sharedPathways.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {sharedPathways.map((pathway, i) => (
                                    <Badge key={i} className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30">
                                      {pathway}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {selectedPeptides.length >= 2 && (
                          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#2a2a32]">
                            <div className="flex gap-2">
                              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="border-[#21d8ff]/40 text-[#21d8ff] hover:bg-[#21d8ff]/10"
                                    onClick={() => {
                                      if (!isAuthenticated) {
                                        login();
                                        return;
                                      }
                                      setShowSaveDialog(true);
                                    }}
                                    data-testid="button-save-stack"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Stack
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#1a1a1f] border-[#2a2a32]">
                                  <DialogHeader>
                                    <DialogTitle>Save Your Stack</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm text-muted-foreground">Stack Name</label>
                                      <Input 
                                        value={stackName}
                                        onChange={(e) => setStackName(e.target.value)}
                                        placeholder="My Custom Stack"
                                        className="mt-1 bg-[#0f0f12] border-[#2a2a32]"
                                        maxLength={50}
                                        data-testid="input-stack-name"
                                      />
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      <p className="font-medium mb-2">Peptides in this stack:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {selectedPeptides.map(p => (
                                          <Badge key={p.id} variant="outline" className="text-xs">
                                            {p.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => {
                                        if (!stackName.trim()) {
                                          toast({ title: "Please enter a name", variant: "destructive" });
                                          return;
                                        }
                                        saveStackMutation.mutate({
                                          name: stackName,
                                          peptideIds: selectedPeptides.map(p => p.id),
                                          peptideNames: selectedPeptides.map(p => p.name),
                                          isPublic: true
                                        });
                                      }}
                                      disabled={saveStackMutation.isPending}
                                      className="w-full bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
                                      data-testid="button-confirm-save"
                                    >
                                      {saveStackMutation.isPending ? "Saving..." : "Save & Get Share Link"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-[#2a2a32]"
                                onClick={() => {
                                  const names = selectedPeptides.map(p => p.name).join(', ');
                                  const shareText = `Check out my peptide research stack: ${names}`;
                                  if (navigator.share) {
                                    navigator.share({ title: 'My Research Stack', text: shareText });
                                  } else {
                                    navigator.clipboard.writeText(shareText);
                                    toast({ title: "Stack copied to clipboard!" });
                                  }
                                }}
                                data-testid="button-quick-share"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {selectedPeptides.some(p => !p.inStock) && (
                              <p className="text-xs text-white/40 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Remove out-of-stock items to add to cart
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ResearchStacks() {
  const [activeTab, setActiveTab] = useState<StackTab>("pre-built");
  const [templatePeptideNames, setTemplatePeptideNames] = useState<string[]>([]);

  // Handle URL tab parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'custom') {
      setActiveTab('custom');
    }
  }, []);

  const handleUseAsTemplate = (peptideNames: string[]) => {
    setTemplatePeptideNames([...peptideNames]); // Create new array to trigger useEffect
    setActiveTab("custom");
  };

  return (
    <main className="min-h-screen pt-32 md:pt-40 pb-24 md:pb-12">
      <SEOHead title="Research Stacks" description="Curated peptide combinations for specific research goals. Save with bundle pricing." canonicalPath="/research-stacks" />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Category Navigation Tabs */}
          <div className="mb-6">
            <CategoryTabs />
          </div>

          {/* Animated Title Switch */}
          <AnimatePresence mode="wait">
            {activeTab === "pre-built" ? (
              <motion.div
                key="prebuilt-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 mb-4">
                  <Layers className="h-4 w-4 text-[#a855f7]" />
                  <span className="text-sm font-medium text-[#a855f7]">Multi-Compound Research</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="heading-research-stacks">
                  Research Stacks
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Curated multi-compound combinations designed for synergistic pathway research.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="custom-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9d4edd]/20 border border-[#9d4edd]/40 mb-4">
                  <Sparkles className="h-4 w-4 text-[#9d4edd]" />
                  <span className="text-sm font-medium text-[#9d4edd]">Custom Stack Builder</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="heading-research-stacks">
                  Create Your <span className="text-[#E7FB10]">Perfect</span> Stack
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Select 2-4 peptides and discover synergies with our AI-powered analysis.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Toggle Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex p-1 rounded-xl bg-[#1a1a1f] border border-[#2a2a32]">
            <button
              onClick={() => setActiveTab("pre-built")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "pre-built"
                  ? "bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="tab-pre-built"
            >
              <Layers className="h-4 w-4 inline mr-2" />
              Pre-Built Stacks
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === "custom"
                  ? "bg-[#21d8ff] text-black shadow-[0_0_20px_rgba(33,216,255,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
              data-testid="tab-build-custom"
            >
              <Beaker className="h-4 w-4 inline mr-2" />
              Build Custom
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "custom" ? (
            <motion.div
              key="custom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CustomStackBuilder 
                onSwitchToPreBuilt={() => setActiveTab("pre-built")}
                templatePeptideNames={templatePeptideNames}
                onTemplateApplied={() => setTemplatePeptideNames([])}
              />
            </motion.div>
          ) : (
            <motion.div
              key="pre-built"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchStacks.map((stack, index) => {
            const Icon = stack.icon;

            return (
              <motion.div
                key={stack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link href={`/research-stacks/${stack.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "tween", duration: 0.15 }}
                    className="group"
                  >
                  <motion.div
                    initial={{ borderColor: "#2a2a32", boxShadow: "none" }}
                    whileHover={{ 
                      borderColor: stack.color,
                      boxShadow: `0 0 40px ${stack.color}60, 0 0 20px ${stack.color}40`
                    }}
                    transition={{ duration: 0.2, type: "tween" }}
                    className="border-2 rounded-lg"
                    data-testid={`card-stack-${stack.id}`}
                  >
                    <Card className="relative overflow-hidden h-full cursor-pointer">
                    {stack.badge && (
                      <Badge
                        className="absolute top-3 right-3 z-10"
                        style={{
                          backgroundColor: stack.badgeColor,
                          color: stack.badgeColor === "#E7FB10" || stack.badgeColor === "#f59e0b" ? "black" : "white",
                        }}
                      >
                        {stack.badge}
                      </Badge>
                    )}

                    <div className="relative h-40 bg-gradient-to-br from-[#1a1a1f] to-[#0d0d10] overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0.2 }}
                        whileHover={{ opacity: 0.4 }}
                        transition={{ duration: 0.2, type: "tween" }}
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(circle at 50% 100%, ${stack.color}40, transparent 70%)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          whileHover={{
                            scale: 1.1,
                            rotate: 5,
                          }}
                          transition={{ duration: 0.15, type: "tween" }}
                          className="relative pointer-events-auto"
                        >
                          <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${stack.color}20` }}
                          >
                            <Icon
                              className="h-10 w-10"
                              style={{ color: stack.color }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                            {stack.peptides.map((_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full border-2 border-[#1a1a1f]"
                                style={{ backgroundColor: stack.color }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                    <div>
                      <p
                        className="text-xs font-medium mb-1"
                        style={{ color: stack.color }}
                      >
                        {stack.subtitle}
                      </p>
                      <h3 className="font-display text-lg font-bold text-white leading-tight">
                        {stack.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {stack.peptides.map((peptide) => (
                        <Badge
                          key={peptide}
                          variant="outline"
                          className="text-xs border-[#3a3a42] text-gray-300"
                        >
                          <FlaskConical className="h-3 w-3 mr-1" style={{ color: stack.color }} />
                          {peptide}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {stack.description}
                    </p>

                    <div className="flex items-end justify-between pt-2 border-t border-[#2a2a32]">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          If bought separately: <span className="line-through">${stack.retailValue}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold" style={{ color: stack.color }}>
                            ${stack.stackPrice}
                          </span>
                          <span className="text-xs text-green-500 font-medium">
                            Save ${stack.retailValue - stack.stackPrice}
                          </span>
                        </div>
                        <Badge variant="outline" className="border-[#21d8ff]/50 text-[#21d8ff] text-xs">
                          Curated Stack
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        className="group"
                        style={{
                          backgroundColor: stack.color,
                          color: stack.color === "#E7FB10" || stack.color === "#f59e0b" || stack.color === "#22c55e" ? "black" : "white",
                        }}
                        data-testid={`button-view-stack-${stack.id}`}
                      >
                        View Stack
                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                    </div>
                    </Card>
                  </motion.div>
                  </motion.div>
                </Link>
                <div className="mt-2 flex justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#a855f7]/50 text-[#a855f7] w-full"
                    onClick={() => handleUseAsTemplate(stack.peptides)}
                    data-testid={`button-use-template-${stack.id}`}
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    Use as Template
                  </Button>
                </div>
              </motion.div>
            );
          })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
              >
                <Card className="p-8 bg-gradient-to-r from-[#a855f7]/10 via-[#21d8ff]/10 to-[#E7FB10]/10 border-[#2a2a32]">
                  <h3 className="font-display text-2xl font-bold mb-3">
                    Looking for Individual Peptides?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    All peptides in our research stacks are also available individually. 
                    Browse our full catalog for single-compound options.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/peptides">
                      <Button variant="outline" className="border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7]/10">
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Browse Peptides
                      </Button>
                    </Link>
                    <Link href="/shop">
                      <Button className="bg-[#E7FB10] text-black hover:bg-[#E7FB10]/90">
                        Shop All Products
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
              >
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-400">Research Use Only</p>
                    <p className="text-xs text-gray-400">
                      These products are sold for laboratory and scientific research purposes only. 
                      They are not intended for human consumption, therapeutic use, or any application 
                      in humans or animals. By purchasing, you confirm you are a qualified researcher 
                      and will use these compounds solely for legitimate research purposes.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function ResearchStacksWrapper() {
  return (
    <>
      <EarlyAccessModal showOnProductPages={true} />
      <ResearchStacks />
    </>
  );
}

